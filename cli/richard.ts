// cli/richard.ts
// An experimental terminal version of richardli.dev: browse the site and chat with the bot.
//
//   npm run cli               talks to the live site
//   npm run cli -- --local    talks to `npm run dev` on localhost:3000
//
// Design: the CLI holds almost no content of its own.
//   - The project list is imported from components/mainProjects.ts (same as the homepage grid).
//   - Every page's text is fetched from the site and converted from HTML to plain text,
//     so case studies can never drift out of sync with the real pages.
//   - Chat streams from the same /api/chat route the website uses.
// Only Node built-ins are used (fetch, readline, child_process), no extra packages.

import * as readline from "node:readline"
import * as readlinePromises from "node:readline/promises"
import { spawn, spawnSync } from "node:child_process"
import { mainProjects } from "../components/mainProjects"
import { setDefaultResultOrder } from "node:dns"

// On some networks Node's fetch hangs for 10s then fails with UND_ERR_CONNECT_TIMEOUT
// (while curl works fine): its DNS lookup tries an unreachable address first.
// Preferring IPv4 avoids that. The site only has an IPv4 address anyway.
// 📖 Learn: dns.setDefaultResultOrder
setDefaultResultOrder("ipv4first")

// ─────────────────────────────── Config ───────────────────────────────

const BASE_URL = process.argv.includes("--local")
  ? "http://localhost:3000"
  : process.env.RICHARD_URL ?? "https://www.richardli.dev" // www directly: the bare domain redirects there

// A custom User-Agent makes these requests easy to spot in logs. It also doesn't
// contain any of the AI fetcher tokens in lib/ai-assistants.ts, so middleware.ts
// won't send a Discord ping for every page the CLI loads.
const USER_AGENT = "richardli-cli/0.1"

// Readable line length, like max-width on a paragraph.
const MAX_WIDTH = 80

// Same regex as components/chat-box.tsx: the follow-up question Claude appends to every reply.
const Q_PATTERN = /\[Q:\s*(.+?)\][\s\n]*$/

// The header's Email / LinkedIn / GitHub icons (components/animated-header.tsx).
const CONTACT_LINKS = [
  { label: "Email", hint: "richardli0@outlook.com", url: "mailto:richardli0@outlook.com" },
  { label: "LinkedIn", hint: "in/richardli0", url: "https://www.linkedin.com/in/richardli0/" },
  { label: "GitHub", hint: "RichardLi-1", url: "https://github.com/RichardLi-1" },
]

// ─────────────────────────────── Styling ───────────────────────────────

// ANSI escape codes: writing "\x1b[1m" switches bold on, "\x1b[0m" resets.
// We only use bold / dim / cyan, so the user's terminal theme picks the actual colours
// (the terminal version of using CSS vars instead of hardcoded hex values).
// NO_COLOR is a common convention for "please don't print colour codes".
// 📖 Learn: ANSI escape codes (SGR) — https://en.wikipedia.org/wiki/ANSI_escape_code#SGR
const useColor = process.stdout.isTTY && !process.env.NO_COLOR

function style(code: string, text: string): string {
  return useColor ? `\x1b[${code}m${text}\x1b[0m` : text
}
const bold = (text: string) => style("1", text)
const dim = (text: string) => style("2", text)
const accent = (text: string) => style("36", text) // cyan

// Cursor control codes, used to redraw the menu in place.
const CLEAR_LINE = "\x1b[2K"
const HIDE_CURSOR = "\x1b[?25l"
const SHOW_CURSOR = "\x1b[?25h"
const cursorUp = (lines: number) => (lines > 0 ? `\x1b[${lines}A` : "")

// If the CLI exits while the menu has the cursor hidden, give it back.
process.on("exit", () => process.stdout.write(SHOW_CURSOR))

function print(line = "") {
  process.stdout.write(line + "\n")
}

function clearScreen() {
  console.clear()
}

// Width available for text, after a 2-space indent on each side.
function textWidth(): number {
  // `||` not `??`: some terminals report 0 columns, and ?? only catches null/undefined.
  return Math.min(process.stdout.columns || MAX_WIDTH, MAX_WIDTH) - 4
}

// Greedy word wrap: keep adding words to the current line until the next one won't fit.
function wrap(text: string, width: number): string[] {
  const lines: string[] = []
  let current = ""
  for (const word of text.split(" ")) {
    if (current && current.length + 1 + word.length > width) {
      lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines
}

// ─────────────────────────────── HTML → text ───────────────────────────────

type BlockKind = "h1" | "h2" | "h3" | "label" | "li" | "p"
type Block = { kind: BlockKind; text: string }
type PageLink = { text: string; url: string }
type Page = { blocks: Block[]; links: PageLink[] }

// Invisible control characters. We drop one in front of each heading / label / list item
// while the HTML tags still exist, so after stripping every tag we still know what kind
// of line each one was. (\s in regex doesn't match these, so whitespace cleanup keeps them.)
const MARKERS: Record<Exclude<BlockKind, "p">, string> = {
  h1: "\u0001",
  h2: "\u0002",
  h3: "\u0003",
  label: "\u0004",
  li: "\u0005",
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", middot: "·",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
}

// Turns "&amp;" → "&", "&#x27;" → "'", "&#8212;" → "—". React escapes text this way in SSR HTML.
// 📖 Learn: HTML character references — https://developer.mozilla.org/en-US/docs/Glossary/Character_reference
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) return String.fromCodePoint(parseInt(code.slice(2), 16))
    if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10))
    return NAMED_ENTITIES[code] ?? match
  })
}

function absoluteUrl(href: string): string {
  return href.startsWith("/") ? BASE_URL + href : href
}

// Every <a href> inside the page body, deduplicated, so they can be listed at the bottom.
function collectLinks(html: string): PageLink[] {
  const links: PageLink[] = []
  const seen = new Set<string>()
  // [\s\S]*? = "any characters, as few as possible", so each match stops at the first </a>.
  for (const match of html.matchAll(/<a\b[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = decodeEntities(match[1])
    if (href.startsWith("#") || href.startsWith("/_next")) continue
    const url = absoluteUrl(href)
    if (seen.has(url)) continue
    seen.add(url)
    const text = decodeEntities(match[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
    links.push({ text: text || url, url })
  }
  return links
}

// Regex-based HTML → blocks. Not a real HTML parser, but this site's server-rendered
// markup is regular enough that it reads well. If a page ever looks broken in the CLI,
// this is the function to look at (or swap in a parser like `node-html-parser`).
function htmlToPage(html: string): Page {
  // 1. Only keep <main>: skips the header, footer and Next.js boot scripts.
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/)
  let body = mainMatch ? mainMatch[0] : html

  // 2. Remove elements that never contain readable text.
  //    \1 is a backreference: "the same tag name the opening tag matched".
  body = body.replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/g, "")

  // 3. Grab links now, before step 6 strips the <a> tags.
  const links = collectLinks(body)

  // 4. Mark where headings, section labels and list items start.
  //    section-label goes first so a heading that is also a label counts as a label.
  body = body
    .replace(/<\w+\b[^>]*class="[^"]*section-label[^"]*"[^>]*>/g, "\n" + MARKERS.label)
    .replace(/<h1\b[^>]*>/g, "\n" + MARKERS.h1)
    .replace(/<h2\b[^>]*>/g, "\n" + MARKERS.h2)
    .replace(/<h[3-6]\b[^>]*>/g, "\n" + MARKERS.h3)
    .replace(/<li\b[^>]*>/g, "\n" + MARKERS.li)

  // 5. Block-level closing tags become line breaks. Spans become spaces so
  //    side-by-side bits like "Canon EOS R50" "58mm" don't glue together.
  body = body
    .replace(/<\/(p|div|h[1-6]|li|ul|ol|section|article|figure|figcaption|blockquote|tr)>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/span>/g, " ")

  // 6. Strip every remaining tag and decode entities.
  const text = decodeEntities(body.replace(/<[^>]+>/g, ""))

  // 7. Each non-empty line becomes a block. If a marker ended up on an otherwise
  //    empty line (e.g. <li><div>text</div></li>), carry its kind to the next line.
  const blocks: Block[] = []
  let pendingKind: BlockKind | null = null
  for (const rawLine of text.split("\n")) {
    let line = rawLine.replace(/\s+/g, " ").replace(/ ([.,!?;:])/g, "$1")
    let kind: BlockKind = "p"
    let hasMarker = false
    for (const [markerKind, marker] of Object.entries(MARKERS)) {
      if (line.includes(marker)) {
        kind = markerKind as BlockKind
        hasMarker = true
        line = line.replaceAll(marker, "")
      }
    }
    line = line.trim()

    if (!line) {
      if (hasMarker) pendingKind = kind
      continue
    }
    if (!hasMarker && pendingKind) kind = pendingKind
    pendingKind = null

    // Some pages type a "•" inside their <li>s; renderBlocks adds its own bullet.
    if (kind === "li") line = line.replace(/^[•·–-]\s*/, "")

    // Responsive layouts sometimes render the same text twice in a row; show it once.
    if (blocks.at(-1)?.text === line) continue
    blocks.push({ kind, text: line })
  }

  return { blocks, links }
}

// Turns blocks into indented, wrapped, styled lines ready to print.
function renderBlocks(blocks: Block[]): string[] {
  const width = textWidth()
  const lines: string[] = []
  let previousKind: BlockKind | null = null

  for (const block of blocks) {
    // A blank line between blocks, except between list items in the same list.
    if (previousKind && !(block.kind === "li" && previousKind === "li")) lines.push("")
    const wrapped = wrap(block.text, block.kind === "li" ? width - 2 : width)

    switch (block.kind) {
      case "h1": {
        lines.push(...wrapped.map(bold))
        const longest = Math.max(...wrapped.map((line) => line.length))
        lines.push(dim("─".repeat(longest)))
        break
      }
      case "h2":
        lines.push(...wrapped.map((line) => bold(accent(line))))
        break
      case "h3":
        lines.push(...wrapped.map(bold))
        break
      case "label":
        lines.push(dim(block.text.toUpperCase()))
        break
      case "li":
        // Hanging indent: the bullet on the first line, continuation lines line up with the text.
        wrapped.forEach((line, index) => lines.push((index === 0 ? "• " : "  ") + line))
        break
      default:
        lines.push(...wrapped)
    }
    previousKind = block.kind
  }

  return lines.map((line) => "  " + line)
}

// Fetched pages are kept for the session so going back and forth is instant.
const pageCache = new Map<string, Page>()

async function fetchPage(path: string): Promise<Page> {
  const cached = pageCache.get(path)
  if (cached) return cached

  const response = await fetch(BASE_URL + path, { headers: { "User-Agent": USER_AGENT } })
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`)
  const page = htmlToPage(await response.text())
  pageCache.set(path, page)
  return page
}

// ─────────────────────────────── Input helpers ───────────────────────────────

type MenuItem = { label: string; hint?: string }

// Arrow-key menu. Resolves with the chosen index, or null for q / Esc / ← (go back).
//
// "Raw mode" makes the terminal hand us every key press immediately, instead of
// waiting for Enter, and stops it from echoing the keys. readline.emitKeypressEvents
// turns raw bytes like "\x1b[A" into friendly { name: "up" } events.
// 📖 Learn: Node readline keypress events — https://nodejs.org/api/readline.html#readlineemitkeypresseventsstream-interface
function select(items: MenuItem[]): Promise<number | null> {
  return new Promise((resolve) => {
    let selected = 0
    let hasDrawn = false
    const labelWidth = Math.max(...items.map((item) => item.label.length))
    const screenWidth = process.stdout.columns || MAX_WIDTH

    function formatRow(item: MenuItem, index: number): string {
      const isSelected = index === selected
      const pointer = isSelected ? accent("›") : " "
      const label = item.label.padEnd(labelWidth)

      // Truncate the hint so a row never wraps; a wrapped row would break the
      // "move cursor up N lines" redraw below.
      let hint = item.hint ?? ""
      const room = screenWidth - 8 - labelWidth
      if (hint.length > room) hint = room > 4 ? hint.slice(0, room - 1) + "…" : ""

      return `  ${pointer} ${isSelected ? bold(accent(label)) : label}${hint ? "  " + dim(hint) : ""}`
    }

    function draw() {
      // After the first draw, jump back up over the rows (+1 help line) and redraw them.
      if (hasDrawn) process.stdout.write(cursorUp(items.length + 1))
      hasDrawn = true
      items.forEach((item, index) => process.stdout.write(`\r${CLEAR_LINE}${formatRow(item, index)}\n`))
      process.stdout.write(`\r${CLEAR_LINE}${dim("  ↑/↓ move · enter open · q back")}\n`)
    }

    function finish(result: number | null) {
      process.stdin.off("keypress", onKeypress)
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdout.write(SHOW_CURSOR)
      resolve(result)
    }

    function onKeypress(str: string | undefined, key: readline.Key) {
      // Raw mode swallows Ctrl+C, so we have to handle quitting ourselves.
      if (key.ctrl && key.name === "c") process.exit(0)

      if (key.name === "up" || key.name === "k") {
        selected = (selected - 1 + items.length) % items.length // % wraps from the top to the bottom
      } else if (key.name === "down" || key.name === "j") {
        selected = (selected + 1) % items.length
      } else if (key.name === "return") {
        return finish(selected)
      } else if (key.name === "q" || key.name === "escape" || key.name === "left") {
        return finish(null)
      } else if (str && /^[1-9]$/.test(str) && Number(str) <= items.length) {
        // Number keys jump straight to an item.
        selected = Number(str) - 1
        draw()
        return finish(selected)
      }
      draw()
    }

    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on("keypress", onKeypress)
    process.stdout.write(HIDE_CURSOR)
    draw()
  })
}

// Waits for a single key press and resolves with its name ("o", "return", "q", …).
function waitForKey(): Promise<string> {
  return new Promise((resolve) => {
    function onKeypress(str: string | undefined, key: readline.Key) {
      if (key.ctrl && key.name === "c") process.exit(0)
      process.stdin.off("keypress", onKeypress)
      process.stdin.setRawMode(false)
      process.stdin.pause()
      resolve(key.name ?? str ?? "")
    }
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on("keypress", onKeypress)
  })
}

// Opens a URL with the OS's default app (browser, or mail app for mailto:).
// Each OS names this command differently.
function openInBrowser(url: string) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open"
  // detached + unref: don't keep the CLI waiting on the browser process.
  spawn(command, [url], { stdio: "ignore", detached: true }).unref()
}

// Prints lines, using the `less` pager if they don't fit on one screen.
// less is the same pager `git log` and `man` use: arrows/space to scroll, q to close.
//   -R  passes our colour codes through instead of showing them as "ESC[1m"
//   -X  leaves the text on screen after closing, so the footer below has context
// LESSCHARSET=utf-8 stops less showing "•" as "<E2><80><A2>" when the locale isn't UTF-8.
// If less isn't installed (e.g. Windows), we just print everything.
// 📖 Learn: spawnSync with `input` — https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options
function showLong(lines: string[]) {
  const text = lines.join("\n") + "\n"
  const fitsOnScreen = lines.length < (process.stdout.rows || 24) - 2
  if (!fitsOnScreen) {
    const result = spawnSync("less", ["-R", "-X"], {
      input: text,
      stdio: ["pipe", "inherit", "inherit"],
      env: { ...process.env, LESSCHARSET: "utf-8" },
    })
    if (!result.error) return
  }
  process.stdout.write(text)
}

// "o open in browser · any other key to go back"
async function footer(url: string) {
  print()
  print(dim("  o open in browser · any other key to go back"))
  const key = await waitForKey()
  if (key === "o") openInBrowser(url)
}

// ─────────────────────────────── Screens ───────────────────────────────

function printBanner() {
  print()
  print(`  ${bold("richard li")}  ${dim("━━●━━━━●━━━━●━━  richardli.dev in your terminal")}`)
  print()
}

// Shows any page on the site as text: project case studies, transit, etc.
async function pageScreen(path: string) {
  const url = BASE_URL + path
  clearScreen()
  print(dim(`\n  loading ${url} …`))

  let page: Page
  try {
    page = await fetchPage(path)
  } catch (error) {
    print(`  couldn't load that page: ${String(error)}`)
    await footer(url)
    return
  }

  const lines = ["", ...renderBlocks(page.blocks)]
  if (page.links.length > 0) {
    lines.push("", "  " + dim("LINKS"))
    for (const link of page.links) lines.push(`  ${accent("→ " + link.text)}  ${dim(link.url)}`)
  }
  lines.push("", "  " + dim(url))

  clearScreen()
  showLong(lines)
  await footer(url)
}

// Projects with externalOnly have no case study on the site, just a link out.
async function externalProjectScreen(project: (typeof mainProjects)[number]) {
  const url = project.externalLink ?? BASE_URL
  clearScreen()
  print()
  print(`  ${bold(project.title)}  ${dim(project.year)}`)
  print()
  for (const line of wrap(project.description ?? "", textWidth())) print("  " + line)
  if (project.tags.length > 0) print("\n  " + dim(project.tags.join(" · ")))
  print(`\n  ${accent("→ " + url)}`)
  await footer(url)
}

async function workScreen() {
  const projects = mainProjects.filter((project) => !project.hidden)

  while (true) {
    clearScreen()
    print()
    print("  " + dim("WORK"))
    print()
    const choice = await select([
      ...projects.map((project) => ({
        label: project.title,
        // ↗ marks projects that only link out, same as externalOnly cards on the site.
        hint: `${project.year} · ${project.description ?? ""}${project.externalOnly ? " ↗" : ""}`,
      })),
      { label: "← Back" },
    ])

    if (choice === null || choice === projects.length) return
    const project = projects[choice]
    if (project.externalOnly) await externalProjectScreen(project)
    else await pageScreen(`/${project.id}`)
  }
}

async function contactScreen() {
  while (true) {
    clearScreen()
    print()
    print("  " + dim("CONTACT"))
    print()
    const choice = await select([
      ...CONTACT_LINKS.map((link) => ({ label: link.label, hint: link.hint })),
      { label: "← Back" },
    ])
    if (choice === null || choice === CONTACT_LINKS.length) return
    openInBrowser(CONTACT_LINKS[choice].url)
  }
}

// ─────────────────────────────── Chat ───────────────────────────────

type ChatMessage = { role: "user" | "assistant"; content: string }
type ChatReply = { content: string; followUp: string | null }

// "[AMD](/amd)" → "→ AMD  https://www.richardli.dev/amd".
// The website draws these as cards; in a terminal the full URL is the useful part,
// since most terminals let you Cmd/Ctrl+click a URL.
function formatMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
    const shown = href.startsWith("mailto:") ? href.slice("mailto:".length) : absoluteUrl(href)
    return `${accent("→ " + label)}  ${dim(shown)}`
  })
}

// Prints the bot's reply as it streams in.
//
// The tricky part: a "[" might be the start of a link card ("[AMD](/amd)") or the
// hidden follow-up ("[Q: ...]"), and we can't know until we've seen more text. So from
// any "[" we hold characters back until the end of that line, then format the whole
// held chunk at once. Everything else still appears character by character.
// Newlines are also held, so trailing blank lines (before a hidden [Q: ...]) never print.
function createStreamPrinter() {
  let held: string | null = null // text held back since the last "[", or null when not holding
  let pendingBreaks = "" // newlines waiting to see if more text follows

  function emit(text: string) {
    if (!text) return
    // Indent every new line by 2 spaces to line up with the "richard" label.
    process.stdout.write((pendingBreaks + text).replaceAll("\n", "\n  "))
    pendingBreaks = ""
  }

  function flushHeld() {
    if (held === null) return
    const withoutQuestion = held.replace(/\[Q:\s*(.+?)\]/g, "")
    held = null
    emit(formatMarkdownLinks(withoutQuestion).trimEnd())
  }

  return {
    write(chunk: string) {
      for (const char of chunk) {
        if (held !== null) {
          if (char === "\n") {
            flushHeld()
            pendingBreaks += "\n"
          } else {
            held += char
          }
        } else if (char === "\n") {
          pendingBreaks += "\n"
        } else if (char === "[") {
          held = "["
        } else {
          emit(char)
        }
      }
    },
    end() {
      flushHeld()
    },
  }
}

// Sends the conversation to /api/chat and streams the reply to the terminal.
// Returns null if anything went wrong (the error has already been printed).
async function sendChat(body: { messages: ChatMessage[]; greeting?: boolean }): Promise<ChatReply | null> {
  print()
  print("  " + bold("richard"))
  process.stdout.write(dim("  …"))
  // "\r" + CLEAR_LINE wipes the "…" placeholder once the first text arrives.
  const clearPlaceholder = () => process.stdout.write(`\r${CLEAR_LINE}  `)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify(body),
    })
  } catch (error) {
    clearPlaceholder()
    print(dim(`couldn't reach ${BASE_URL} (${String(error)})\n`))
    return null
  }

  // The route answers 429 with one of its witty rate-limit lines as plain text.
  if (response.status === 429 || !response.ok || !response.body) {
    clearPlaceholder()
    const message = response.status === 429 ? await response.text() : `something broke (HTTP ${response.status})`
    print(dim(message) + "\n")
    return null
  }

  // Same streaming pattern as components/chat-box.tsx: read Uint8Array chunks and decode them.
  // { stream: true } tells TextDecoder a multi-byte character (like an emoji) might be
  // split across two chunks, so it waits for the rest instead of printing garbage.
  // 📖 Learn: ReadableStream readers — https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const printer = createStreamPrinter()
  let fullText = ""
  let started = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      if (!started) {
        clearPlaceholder()
        started = true
      }
      fullText += chunk
      printer.write(chunk)
    }
  } catch (error) {
    printer.end()
    print(dim(`\n  (connection dropped: ${String(error)})\n`))
    return null
  }

  if (!started) clearPlaceholder()
  printer.end()
  print("\n")

  // Like the web UI: store the reply without the [Q: ...] so it isn't sent back to Claude.
  const match = fullText.match(Q_PATTERN)
  return { content: fullText.replace(Q_PATTERN, "").trimEnd(), followUp: match ? match[1] : null }
}

async function chatScreen() {
  clearScreen()
  printBanner()
  print(dim("  Same bot as the website. Enter sends the suggested question, /back or Ctrl+C leaves."))

  const messages: ChatMessage[] = []
  let followUp: string | null = null

  // Opening line, same as when the chat opens on the site.
  const opener = await sendChat({ messages, greeting: true })
  if (opener) {
    messages.push({ role: "assistant", content: opener.content })
    followUp = opener.followUp
  }

  // readline/promises gives us `await rl.question(...)` for line-by-line input.
  // An AbortController lets Ctrl+C (SIGINT) or Ctrl+D (close) cancel a pending question,
  // which makes the await throw, and we treat that as "leave the chat".
  // 📖 Learn: AbortController — https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout })
  const leave = new AbortController()
  rl.on("SIGINT", () => leave.abort())
  rl.on("close", () => leave.abort())

  try {
    while (true) {
      if (followUp) print(dim(`  ↳ ${followUp}`))

      let input: string
      try {
        input = (await rl.question(accent("  you › "), { signal: leave.signal })).trim()
      } catch {
        break // aborted by Ctrl+C / Ctrl+D
      }

      if (input === "/back" || input === "/exit" || input === "/quit") break
      if (input === "") {
        // Empty Enter = tap the follow-up chip. Rewrite the prompt line so it shows what was sent.
        if (!followUp) continue
        input = followUp
        process.stdout.write(`${cursorUp(1)}\r${CLEAR_LINE}${accent("  you › ")}${input}\n`)
      }

      messages.push({ role: "user", content: input })
      followUp = null

      rl.pause() // ignore typing while the reply streams in
      const reply = await sendChat({ messages })
      if (reply) {
        messages.push({ role: "assistant", content: reply.content })
        followUp = reply.followUp
      } else {
        // Drop the unanswered message so the history keeps alternating user/assistant.
        messages.pop()
      }
    }
  } finally {
    rl.close()
  }
}

// ─────────────────────────────── Home ───────────────────────────────

// The homepage's hero + Currently/Previously, i.e. everything above the "Work" grid
// (the grid becomes the Work menu instead).
async function loadHomeIntro(): Promise<string[]> {
  try {
    const page = await fetchPage("/")
    const workIndex = page.blocks.findIndex((block) => block.kind === "label" && block.text.toLowerCase() === "work")
    const introBlocks = workIndex === -1 ? page.blocks : page.blocks.slice(0, workIndex)
    return renderBlocks(introBlocks)
  } catch {
    return [dim(`  couldn't load ${BASE_URL} (offline?), but the menu still works.`)]
  }
}

async function homeScreen() {
  const menu = [
    { label: "Work", hint: "projects and case studies", action: workScreen },
    { label: "Transit", hint: "photos from around the network", action: () => pageScreen("/transit/fanning") },
    { label: "Chat", hint: "talk to the bot version of me", action: chatScreen },
    { label: "Contact", hint: "email, LinkedIn, GitHub", action: contactScreen },
    { label: "Quit", hint: "", action: null },
  ]

  while (true) {
    clearScreen()
    printBanner()
    print(dim("  loading…"))
    const intro = await loadHomeIntro()
    clearScreen()
    printBanner()
    for (const line of intro) print(line)
    print()

    const choice = await select(menu.map(({ label, hint }) => ({ label, hint })))
    const action = choice === null ? null : menu[choice].action
    if (!action) {
      print(dim("\n  thanks for stopping by ✌️\n"))
      process.exit(0)
    }
    await action()
  }
}

async function main() {
  // Raw-mode key handling only works in a real terminal (not when piped).
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("This CLI is interactive. Run it directly in a terminal: npm run cli")
    process.exit(1)
  }
  await homeScreen()
}

main().catch((error) => {
  process.stdout.write(SHOW_CURSOR)
  console.error(error)
  process.exit(1)
})

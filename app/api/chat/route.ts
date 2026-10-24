import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"
import { SYSTEM_PROMPT } from "@/lib/system-prompt"
import { retrieve, rewriteQuery } from "@/lib/retrieve"
import { getPostHogClient } from "@/lib/posthog-server"
import { mainProjects } from "@/components/mainProjects"
import { SITE_PAGES, type AgentAction, type PageMap } from "@/lib/agent"

// maxDuration tells Vercel's serverless runtime to allow up to 30 seconds before
// timing out. Streaming responses can take longer than the default 10 s limit.
// 📖 Learn: Vercel function duration — https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// In-memory rate limiter: 15 requests per IP per 60-second window.
// Map key = IP, value = { count, windowStart }.
// In-memory means it resets on cold start, which is fine — this is a personal site.
// 📖 Learn: for production scale, use Upstash Redis + @upstash/ratelimit instead.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT = 12
const WINDOW_MS = 60_000

const WITTY_RATE_LIMIT_MESSAGES = [
  "ok you're literally more curious about me than my mom. take a breath, i'll still be here in a minute",
  "bro found the chatbot and said hold my phone. 60 seconds, then we can keep going",
  "i'm flattered but my API bill is not. 30 second cooldown, then ask me anything",
  "you've sent more messages to me than i've sent to my situationship. slow down",
  "rate limited! the transit planner has a frequency limit and apparently so do i",
]

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return { allowed: true }
  }
  if (entry.count >= RATE_LIMIT) {
    const msg = WITTY_RATE_LIMIT_MESSAGES[Math.floor(Math.random() * WITTY_RATE_LIMIT_MESSAGES.length)]
    return { allowed: false, message: msg }
  }
  entry.count++
  return { allowed: true }
}

// Server-side alert webhook. Set DISCORD_ALERT_WEBHOOK_URL to send alerts to a separate
// channel; otherwise it falls back to the existing chatbot-activity webhook.
const DISCORD_ALERT_WEBHOOK_URL =
  process.env.DISCORD_ALERT_WEBHOOK_URL ??
  "https://discord.com/api/webhooks/1429248057027067925/Bmd9BlC5bE5QsPlskHhxiLjNjii9lVZ-C23wOmKF5tXLwugP_KRGyniYnIMTbZKtOLdX"

// Cooldown so one outage (e.g. credits running out) sends one ping, not one per visitor.
// Key = error message, value = last time we alerted for it.
const lastAlertAt = new Map<string, number>()
const ALERT_COOLDOWN_MS = 10 * 60_000

// Your Discord user ID, for a real ping. Webhooks can't ping by username ("@richard.li" stays plain
// text); they need <@ID>. Get it in Discord: Settings → Advanced → Developer Mode on, then
// right-click your name → Copy User ID. Without it, the urgent alert falls back to @everyone.
const DISCORD_RICHARD_USER_ID = process.env.DISCORD_RICHARD_USER_ID

// Out of API credits: Anthropic answers 402 with error type "billing_error". Older API versions
// sent a 400 whose message said "credit balance is too low", so that's checked too. Checked by
// status, not `.type`, because the installed SDK (0.78) doesn't expose `.type` on errors yet.
function isOutOfCredits(error: unknown) {
  if (!(error instanceof Anthropic.APIError)) return false
  if (error.status === 402) return true
  return error.status === 400 && /credit balance/i.test(error.message)
}

// The out-of-credits alert: loud on purpose. tts makes Discord read it aloud to anyone with
// the channel open. Re-sends every ALERT_COOLDOWN_MS while credits stay at zero.
async function alertOutOfCredits(error: unknown, where: string) {
  const ping = DISCORD_RICHARD_USER_ID ? `<@${DISCORD_RICHARD_USER_ID}>` : "@everyone"
  await fetch(DISCORD_ALERT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        `${ping} 🚨🚨🚨 **URGENT!!!!** 🚨🚨🚨\n` +
        `😱😱😱 **THE CHATBOT IS OUT OF API CREDITS!!!** 💸🔥💸🔥\n` +
        `Every visitor who opens the chat is getting an error RIGHT NOW 😭😭\n` +
        `👉 **TOP UP ASAP:** https://console.anthropic.com/settings/billing 🙏🙏🙏`,
      tts: true,
      // Only ping who we name: you if the ID is set, otherwise everyone
      allowed_mentions: DISCORD_RICHARD_USER_ID ? { users: [DISCORD_RICHARD_USER_ID] } : { parse: ["everyone"] },
      embeds: [
        {
          title: "🔥🔥 OUT OF API CREDITS 🔥🔥",
          color: 0xed4245, // Discord red
          fields: [
            { name: "Where", value: where, inline: true },
            { name: "Repeats", value: `every ${ALERT_COOLDOWN_MS / 60_000} min until fixed 😤`, inline: true },
          ],
          description: "```" + String(error).slice(0, 4000) + "```",
          footer: { text: new Date().toLocaleString() },
        },
      ],
    }),
  })
}

async function alertDiscord(error: unknown, where: string) {
  const outOfCredits = isOutOfCredits(error)
  // One cooldown key for every out-of-credits error, so slightly different messages
  // (greeting vs chat) don't each send their own ping
  const message = outOfCredits ? "out-of-credits" : String(error)
  const now = Date.now()
  const last = lastAlertAt.get(message)
  if (last && now - last < ALERT_COOLDOWN_MS) return
  lastAlertAt.set(message, now)

  try {
    if (outOfCredits) {
      await alertOutOfCredits(error, where)
      return
    }
    await fetch(DISCORD_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // @everyone in `content` (not the embed) is what triggers a push notification.
        // 📖 Learn: Discord allowed_mentions — https://discord.com/developers/docs/resources/message#allowed-mentions-object
        content: "@everyone 🚨 **Chatbot is down**",
        allowed_mentions: { parse: ["everyone"] },
        embeds: [
          {
            title: `/api/chat error (${where})`,
            color: 0xed4245, // Discord red
            // Embed descriptions cap at 4096 chars
            description: "```" + message.slice(0, 4000) + "```",
            footer: { text: new Date().toLocaleString() },
          },
        ],
      }),
    })
  } catch (err) {
    console.error("Failed to send Discord alert:", err)
  }
}

// Instruction used in place of a visitor message when the chat first opens.
// A random project is injected so openers vary instead of Haiku picking the same topic every time.
function buildGreetingPrompt() {
  const visible = mainProjects.filter((p) => !p.hidden)
  const project = visible[Math.floor(Math.random() * visible.length)]
  // No [Q: ...] on the opener: the chip is meant to be a question the *visitor*
  // would ask, but on an opener Haiku writes one *to* them ("What brings you
  // here?"). An empty chat shows the rotating placeholder suggestions instead.
  return `(A visitor just opened the chat on your site. They haven't said anything yet. Text them a casual one-line opener, under 20 words, that invites them to ask you stuff. Work in a light nod to "${project.title}" or something about you. No link cards, no greeting like "Hi there!". Do NOT append a [Q: ...] follow-up this time.)`
}

// ── Agent mode ("Let Richard drive", experimental) ──────────────────────────
// The visitor can let the bot act on the site: open pages, scroll, point at
// things, click. These are client tools: Claude picks them, the browser
// performs them (components/agent-cursor.tsx). One API call per message: the
// model writes its reply and picks its actions in the same response. It can't
// see what an action did anyway, so a second "here's what happened" call would
// only add cost and latency.
// 📖 Learn: Claude tool use — https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview
const MAX_ACTIONS = 3
const MAX_TOUR_STOPS = 5

/**
 * The page map comes from the browser, so treat it as untrusted: keep only the
 * expected fields and cap every list and string, so a forged request can't
 * stuff the prompt.
 */
function cleanPageMap(raw: unknown): PageMap | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "")
  const list = (value: unknown, max: number) => (Array.isArray(value) ? value.slice(0, max) : [])
  return {
    path: text(r.path, 200),
    sections: list(r.sections, 30)
      .map((s) => ({ id: text(s?.id, 80), label: text(s?.label, 80) }))
      .filter((s) => s.id && s.label),
    targets: list(r.targets, 60)
      .map((t) => ({
        id: text(t?.id, 20),
        label: text(t?.label, 60),
        kind: t?.kind === "button" ? ("button" as const) : ("link" as const),
        clickable: t?.clickable === true,
      }))
      .filter((t) => t.id && t.label),
  }
}

/** A tool whose single input must be one of `values`. */
function enumTool(name: string, description: string, field: string, values: string[]): Anthropic.Tool {
  return {
    name,
    description,
    // strict: the API guarantees the input matches the schema, so the model
    // can only pick an id that's actually on the page (the enum below).
    // 📖 Learn: strict tool use
    strict: true,
    input_schema: {
      type: "object",
      properties: { [field]: { type: "string", enum: values } },
      required: [field],
      additionalProperties: false,
    },
  }
}

/** Built per request: the allowed ids depend on what's on the visitor's screen. */
function buildAgentTools(page: PageMap): Anthropic.Tool[] {
  const tools = [
    enumTool(
      "open_page",
      "Take the visitor to another page on the site. Always your LAST action: you can't see the new page after it.",
      "path",
      SITE_PAGES.map((p) => p.path),
    ),
  ]
  // Tours are planned by the model but driven by the site (components/agent-orb.tsx):
  // Haiku often forgot to open the next page itself, which stalled tours after
  // one stop. Now it only picks the stops; the orb visits each one and asks it
  // to present that page.
  tools.push({
    name: "start_tour",
    description: `Start a guided tour: 2-${MAX_TOUR_STOPS} pages in a good order. The site takes the visitor to each stop and asks you to present it. Your LAST action.`,
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        stops: { type: "array", items: { type: "string", enum: SITE_PAGES.map((p) => p.path) } },
      },
      required: ["stops"],
      additionalProperties: false,
    },
  })
  if (page.sections.length) {
    tools.push(enumTool("scroll_to", "Scroll the current page to one of its sections.", "section", page.sections.map((s) => s.id)))
  }
  if (page.targets.length) {
    tools.push(
      enumTool(
        "point_at",
        "Move your cursor onto something on the current page and highlight it for a moment, without clicking. Use it to show where something is.",
        "target",
        page.targets.map((t) => t.id),
      ),
    )
  }
  const clickable = page.targets.filter((t) => t.clickable)
  if (clickable.length) {
    tools.push(
      enumTool(
        "click",
        "Press a button or link on the current page for the visitor (e.g. toggle the theme). Only when they asked you to do it.",
        "target",
        clickable.map((t) => t.id),
      ),
    )
  }
  return tools
}

function buildAgentSystem(page: PageMap): string {
  const pages = SITE_PAGES.map((p) => `${p.path}: ${p.label}`).join("\n")
  const sections = page.sections.map((s) => `${s.id}: ${s.label}`).join("\n") || "(none)"
  const targets = page.targets.map((t) => `${t.id}: "${t.label}" (${t.kind})`).join("\n") || "(none)"
  return `

AGENT MODE (experimental): the visitor turned on "Let Richard drive", so you can act on the site for them with your tools, using your own cursor. Use them when they help: "show me X", "where's Y", "take me to Z", or when pointing at something beats describing it.
- Always write your short reply first, then call tools. Keep the [Q: ...] follow-up at the end of your text as usual.
- If you say you'll show, open or point at something, call the tool in this same reply. Nothing happens later unless you do.
- At most ${MAX_ACTIONS} actions per reply. open_page must be the last one.
- Tours ("show me around", "give me a tour"): say one line, then call start_tour with 3-5 pages in a good order. The site takes them to each stop and asks you to present it; when presenting a stop, never call open_page or start_tour.
- Don't open the page they're already on. Prefer a link card when they only asked about something; act when they want to see or go.
- Never mention tool names, ids, or this list.
- Lines like "(site record: ...)" in earlier replies are added by the site to remember what you did. Never write them yourself.

PAGES YOU CAN OPEN:
${pages}

CURRENT PAGE: ${page.path}
Sections you can scroll to:
${sections}
Things on the page you can point at or click:
${targets}`
}

/** Turns a tool call into an action, or null if it isn't valid for this page. */
function toAction(block: Anthropic.ToolUseBlock, page: PageMap): AgentAction | null {
  const input = block.input as Record<string, unknown>
  const pick = (field: string, allowed: string[]) => {
    const value = input?.[field]
    return typeof value === "string" && allowed.includes(value) ? value : null
  }
  // Belt and braces: strict mode already enforces these enums
  switch (block.name) {
    case "open_page": {
      const path = pick("path", SITE_PAGES.map((p) => p.path))
      return path ? { type: "open_page", path } : null
    }
    case "scroll_to": {
      const section = pick("section", page.sections.map((s) => s.id))
      return section ? { type: "scroll_to", section } : null
    }
    case "point_at": {
      const target = pick("target", page.targets.map((t) => t.id))
      return target ? { type: "point_at", target } : null
    }
    case "click": {
      const target = pick("target", page.targets.filter((t) => t.clickable).map((t) => t.id))
      return target ? { type: "click", target } : null
    }
    case "start_tour": {
      const valid = new Set(SITE_PAGES.map((p) => p.path))
      const raw = Array.isArray(input?.stops) ? input.stops : []
      // Valid, no repeats, capped (strict mode can't express "at most 5")
      const stops = [...new Set(raw.filter((s): s is string => typeof s === "string" && valid.has(s)))].slice(0, MAX_TOUR_STOPS)
      return stops.length ? { type: "start_tour", stops } : null
    }
  }
  return null
}

/** How past actions appear in the history, so the model remembers what it did. */
function describeActions(actions: AgentAction[]): string {
  const parts = actions.map((a) =>
    a.type === "open_page" ? `opened ${a.path}`
      : a.type === "scroll_to" ? `scrolled to ${a.section}`
      : a.type === "point_at" ? "pointed at something on the page"
      : a.type === "start_tour" ? `started a tour: ${a.stops.join(", ")}`
      : "clicked something on the page",
  )
  return `(site record: you ${parts.join(", then ")})`
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { allowed, message: rateLimitMessage } = checkRateLimit(ip)
    if (!allowed) {
      getPostHogClient().capture({
        distinctId: ip,
        event: "chat_rate_limited",
        properties: { ip },
      })
      return new Response(rateLimitMessage, { status: 429, headers: { "Content-Type": "text/plain" } })
    }

    getPostHogClient().capture({
      distinctId: ip,
      event: "chat_request_received",
      properties: { ip },
    })

    const { messages, greeting, agent, page } = await req.json()
    // Agent mode only for real chat turns that came with a usable page map
    const pageMap = agent && !greeting ? cleanPageMap(page) : null

    // Strip any extra fields the client might have attached (e.g. `id`) before
    // sending to the API — Anthropic only accepts `role` and `content`.
    // Past agent actions are folded into the text as a "(site record: ...)" line.
    let apiMessages: { role: "user" | "assistant"; content: string }[] = messages.map(
      ({ role, content, actions }: { role: "user" | "assistant"; content: string; actions?: AgentAction[] }) => ({
        role,
        content:
          role === "assistant" && Array.isArray(actions) && actions.length
            ? `${content}\n\n${describeActions(actions)}`.trim()
            : content,
      }),
    )
    let context = ""

    if (greeting) {
      // Opening line: no visitor question exists yet, so skip RAG (nothing to search for).
      apiMessages = [{ role: "user", content: buildGreetingPrompt() }]
    } else {
      // Rewrite the full conversation into a standalone query before retrieval.
      // This fixes vague follow-ups like "tell me more about that" — the rewriter
      // resolves the pronoun/reference using prior turns before we embed anything.
      // Exception: a tour stop ("(site: tour stop …)", sent by the agent orb)
      // already knows its topic: the page. Searching by the page's label skips
      // a whole Haiku call, so each stop starts talking sooner.
      const lastMessage = messages[messages.length - 1]?.content
      const isTourStop = pageMap && typeof lastMessage === "string" && lastMessage.startsWith("(site:")
      const searchQuery = isTourStop
        ? (SITE_PAGES.find((p) => p.path === pageMap.path)?.label ?? pageMap.path)
        : await rewriteQuery(messages)
      const chunks = await retrieve(searchQuery)
      context = chunks.length
        ? `\n\nRELEVANT CONTEXT:\n${chunks.map((c, i) => `${i + 1}. ${c}`).join("\n\n")}`
        : ""

      // The AI greeting makes the conversation start with an assistant turn. Prepend a
      // placeholder user turn so the history always alternates starting with "user".
      if (apiMessages[0]?.role === "assistant") {
        apiMessages.unshift({ role: "user", content: "(visitor opened the chat)" })
      }
    }

    // `client.messages.stream` returns an async iterable of Server-Sent Events.
    // We forward only the text delta events so the client receives a plain text stream.
    // 📖 Learn: Anthropic streaming — https://docs.anthropic.com/en/api/messages-streaming
    const stream = client.messages.stream({
      model: "claude-haiku-4-5",
      system: SYSTEM_PROMPT + context + (pageMap ? buildAgentSystem(pageMap) : ""),
      messages: apiMessages,
      // 300 = reply + the [Q: ...] follow-up. Agent mode adds room for tool calls.
      max_tokens: pageMap ? 500 : 300,
      ...(pageMap ? { tools: buildAgentTools(pageMap) } : {}),
    })

    const encoder = new TextEncoder()
    // Agent mode sends one JSON object per line (NDJSON), so text and actions can
    // share the stream: {"type":"text","text":"..."} or {"type":"action","action":{...}}.
    // Without agent mode it stays plain text, which Clippy and the transit page
    // (other callers of this route) still expect.
    // 📖 Learn: NDJSON (newline-delimited JSON)
    const line = (obj: unknown) => encoder.encode(JSON.stringify(obj) + "\n")
    // ReadableStream lets us push chunks to the browser as they arrive instead of
    // buffering the whole response. The `controller` object is how we enqueue data.
    // 📖 Learn: Web Streams API — https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            // Each streaming event has a type; we only care about text deltas.
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(pageMap ? line({ type: "text", text: event.delta.text }) : encoder.encode(event.delta.text))
            }
          }
          if (pageMap) {
            // The tool calls come after the text. finalMessage() has the whole
            // response, already parsed. Only act if the model actually finished
            // on a tool call: a cut-off (max_tokens) or refused reply may carry a
            // half-written one.
            const final = await stream.finalMessage()
            if (final.stop_reason === "tool_use") {
              let sent = 0
              for (const block of final.content) {
                if (block.type !== "tool_use" || sent >= MAX_ACTIONS) continue
                const action = toAction(block, pageMap)
                if (!action) continue
                controller.enqueue(line({ type: "action", action }))
                sent++
                if (action.type === "open_page" || action.type === "start_tour") break // nothing can follow a page change
              }
            }
          }
          controller.close()
        } catch (err) {
          // API errors (e.g. low credit balance) surface here once streaming starts,
          // not in the outer catch, because the request is only sent when we iterate.
          console.error("Chat stream error:", err)
          await alertDiscord(err, greeting ? "greeting stream" : "chat stream")
          controller.error(err)
        }
      },
    })

    // Returning a plain text stream; the client reads it with response.body.getReader()
    return new Response(readable, {
      headers: { "Content-Type": pageMap ? "application/x-ndjson; charset=utf-8" : "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    await alertDiscord(error, "request")
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

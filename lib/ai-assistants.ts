// One place to edit when a new AI assistant starts sending us traffic.
// Imported by both the browser (hooks/use-page-view-tracker.ts) and the
// middleware (lib/ai-fetch-reporter.ts), so it must stay plain data + pure
// functions: no server-only or DOM imports.

// ─── Humans arriving FROM an AI assistant ─────────────────────────────────────
// Matched against the visitor's utm_source value or document.referrer hostname.
// ChatGPT appends ?utm_source=chatgpt.com to every link it shows in an answer;
// most other assistants send no UTM, only a Referer header, so we check both.
// key = hostname (lowercased, "www." stripped), value = display name.
const AI_ASSISTANT_HOSTS: Record<string, string> = {
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "perplexity.ai": "Perplexity",
  "claude.ai": "Claude",
  "gemini.google.com": "Gemini",
  "copilot.microsoft.com": "Copilot",
}

// Returns the assistant's display name, or null if `hostOrSource` isn't one.
// Accepts a bare hostname ("chatgpt.com") or a utm_source value, which for
// ChatGPT is also a hostname.
export function aiAssistantFromHost(hostOrSource: string | null | undefined): string | null {
  if (!hostOrSource) return null
  const host = hostOrSource.toLowerCase().replace(/^www\./, "")
  return AI_ASSISTANT_HOSTS[host] ?? null
}

// ─── AI assistants fetching our pages THEMSELVES ──────────────────────────────
// These are server-side fetchers that never run JavaScript, so the browser
// tracker can't see them. Only the middleware can, by User-Agent.
//
// `kind` separates three very different signals:
//   "user"     = fetched live because a person asked the assistant something
//                right now. Rare and the most interesting: it's a real question
//                about something on this page.
//   "search"   = indexing pages so the assistant can cite them in answers later.
//   "training" = collecting pages for model training. High volume, low signal.
//
// Token strings come from each vendor's published crawler docs.
// 📖 Learn: OpenAI's crawlers — https://platform.openai.com/docs/bots
export type AiFetcherKind = "user" | "search" | "training"

export interface AiFetcher {
  token: string // substring to look for in the User-Agent header
  vendor: string
  kind: AiFetcherKind
}

const AI_FETCHERS: AiFetcher[] = [
  { token: "ChatGPT-User", vendor: "OpenAI", kind: "user" },
  { token: "OAI-SearchBot", vendor: "OpenAI", kind: "search" },
  { token: "GPTBot", vendor: "OpenAI", kind: "training" },
  { token: "Claude-User", vendor: "Anthropic", kind: "user" },
  { token: "Claude-SearchBot", vendor: "Anthropic", kind: "search" },
  { token: "ClaudeBot", vendor: "Anthropic", kind: "training" },
  { token: "Perplexity-User", vendor: "Perplexity", kind: "user" },
  { token: "PerplexityBot", vendor: "Perplexity", kind: "search" },
]

// A plain loop instead of .find() + regex so the matching rule is obvious:
// first entry whose token appears in the UA wins. Order matters only if one
// token contained another, and none of the ones above do.
export function matchAiFetcher(userAgent: string | null | undefined): AiFetcher | null {
  if (!userAgent) return null
  for (const fetcher of AI_FETCHERS) {
    if (userAgent.includes(fetcher.token)) return fetcher
  }
  return null
}

// ─── Any bot at all (used to keep bots off private pages) ─────────────────────
// Broader than AI_FETCHERS: this answers "is this probably NOT a person in a
// normal browser?" It's broad on purpose. A rare false positive (say, a phone
// model with "bot" in its name) just sees a 404, which is acceptable for a
// private section. The opposite gap can't be fixed here: a bot that spoofs a
// normal browser UA gets through, and only a login could stop that.
// All entries are lowercase because we compare against the lowercased UA.
const BOT_UA_SUBSTRINGS: string[] = [
  // Generic crawler words: catches Googlebot, Bingbot, GPTBot, ClaudeBot,
  // CCBot, Applebot, YandexBot, Baiduspider, Yahoo! Slurp, and so on.
  "bot",
  "crawl",
  "spider",
  "slurp",

  // AI fetchers that don't have "bot" in their name.
  "mistralai-user",
  "meta-externalagent",
  "meta-externalfetcher",
  "anthropic-ai",
  "cohere-ai",
  "img2dataset",

  // Link-preview fetchers (the card you see when a link is pasted in a chat).
  "facebookexternalhit",

  // Headless browsers and HTTP libraries that scripts and AI agents fetch with.
  // A real person browsing never sends these.
  "headlesschrome",
  "python-requests",
  "python-httpx",
  "aiohttp",
  "curl/", // the slash avoids matching unrelated words that contain "curl"
  "wget",
  "go-http-client",
  "node-fetch",
  "axios",
  "undici", // Node's built-in fetch() sends "undici" as its UA
]

// True when the request is probably from a bot rather than a person.
// 📖 Learn: User-Agent header — https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  // Real browsers always send a User-Agent, so a missing one means a script.
  if (!userAgent) return true

  // Reuse the AI fetcher list so a new entry there is blocked here too.
  if (matchAiFetcher(userAgent)) return true

  // Lowercase once so "Googlebot" and "googlebot" both match "bot".
  const ua = userAgent.toLowerCase()
  for (const substring of BOT_UA_SUBSTRINGS) {
    if (ua.includes(substring)) return true
  }
  return false
}

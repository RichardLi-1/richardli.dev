import type { NextRequest } from "next/server"
import { matchAiFetcher } from "@/lib/ai-assistants"

// Called from middleware.ts on every page request. Spots AI assistants fetching
// our pages server-side (ChatGPT-User, GPTBot, ClaudeBot…), which the browser
// tracker can never see because these fetchers don't run JavaScript.
//
// Two outputs, on purpose:
// 1. EVERY AI fetch → one JSON line in the Vercel runtime logs. Search the logs
//    for "ai_fetch" to see which pages each assistant reads. Cheap, but Vercel
//    only keeps runtime logs for a short window.
// 2. Only "user" fetches → Discord. Each one means a real person asked an
//    assistant something and it opened this page to answer: rare, and worth
//    keeping. Training/search crawlers would flood the channel, so they're
//    logs-only.
//
// Returns the pending Discord request (for event.waitUntil) or null.
export function reportAiFetch(request: NextRequest): Promise<void> | null {
  const fetcher = matchAiFetcher(request.headers.get("user-agent"))
  if (!fetcher) return null

  const page = `${request.nextUrl.pathname}${request.nextUrl.search}`

  // One line of JSON per hit, so the logs are filterable/greppable.
  console.log(
    JSON.stringify({
      type: "ai_fetch",
      vendor: fetcher.vendor,
      bot: fetcher.token,
      kind: fetcher.kind,
      page,
    }),
  )

  if (fetcher.kind !== "user") return null
  // VERCEL_ENV (not NODE_ENV): NODE_ENV is "production" on preview deploys too,
  // while VERCEL_ENV is only "production" on the live site. Locally it's unset.
  // 📖 Learn: Vercel system env vars — https://vercel.com/docs/environment-variables/system-environment-variables
  if (process.env.VERCEL_ENV !== "production") return null

  // Same channel as every other visit (see app/api/track/route.ts).
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return null

  // Same plain-text "🔔 event\nkey: value" shape that /api/track sends.
  const message = [
    `🔔 🔎 **${fetcher.token}** read ${request.nextUrl.pathname} for someone`,
    `🤖 Assistant: ${fetcher.vendor}`,
    `📄 Page: ${page}`,
    `🕒 Time: ${new Date().toISOString()}`,
  ].join("\n")

  return fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  })
    .then(() => undefined)
    .catch((err: unknown) => {
      // Best-effort: tracking must never affect the actual response.
      console.error("[ai-fetch] Discord webhook failed:", err)
    })
}

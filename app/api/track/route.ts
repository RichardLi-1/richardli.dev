import type { NextRequest } from "next/server"

// POST /api/track
// Body: { event: string, meta?: Record<string, string> }
//
// Why a server route instead of calling Discord directly from the browser?
// The webhook URL is a secret — anyone with it can post to your Discord.
// By routing through here, the URL lives only in process.env (server memory)
// and never appears in the JavaScript bundle the browser downloads.
// 📖 Learn: Next.js Route Handlers — https://nextjs.org/docs/app/building-your-application/routing/route-handlers

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  // If the env var isn't set (e.g. in a fresh clone), silently do nothing
  // rather than crashing — tracking is non-critical.
  if (!webhookUrl) {
    return new Response(null, { status: 204 })
  }

  // Parse the event name and any extra metadata the client sent
  const { event, meta = {} } = await req.json()

  // Build a human-readable message from the event + metadata fields
  const metaLines = Object.entries(meta as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")

  const message = [`🔔 ${event}`, metaLines].filter(Boolean).join("\n")

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    })
  } catch (err) {
    // Log but don't surface the error to the client — tracking is best-effort
    console.error("Failed to forward event to Discord:", err)
  }

  // 204 No Content — the client doesn't need a response body
  return new Response(null, { status: 204 })
}

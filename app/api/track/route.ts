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

  // Enrich events with geolocation from edge/proxy headers when available.
  // Why server-side? It avoids exposing API keys and removes client latency.
  // 📖 Learn: reverse-proxy geolocation headers (x-vercel-ip-*)
  const headers = req.headers
  const forwardedFor = headers.get("x-forwarded-for")
  const edgeIp = forwardedFor?.split(",")[0]?.trim()
  const country = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry")
  const region = headers.get("x-vercel-ip-country-region") || headers.get("x-vercel-region")
  const city = headers.get("x-vercel-ip-city")
  const latitude = headers.get("x-vercel-ip-latitude")
  const longitude = headers.get("x-vercel-ip-longitude")
  const postalCode = headers.get("x-vercel-ip-postal-code")
  const timezone = headers.get("x-vercel-ip-timezone")

  const enrichedMeta: Record<string, string> = {
    ...(meta as Record<string, string>),
    ...(edgeIp ? { "🌐 Edge IP": edgeIp } : {}),
    ...(country ? { "🌍 Country": country } : {}),
    ...(region ? { "🗺️ Region": region } : {}),
    ...(city ? { "🏙️ City": city } : {}),
    ...(latitude && longitude ? { "📍 Coordinates": `${latitude}, ${longitude}` } : {}),
    ...(postalCode ? { "📮 Postal": postalCode } : {}),
    ...(timezone ? { "🕒 Timezone": timezone } : {}),
  }

  // Build a human-readable message from the event + metadata fields
  const metaLines = Object.entries(enrichedMeta)
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

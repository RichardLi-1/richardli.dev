import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"
import { SYSTEM_PROMPT } from "@/lib/system-prompt"
import { retrieve, rewriteQuery } from "@/lib/retrieve"
import { getPostHogClient } from "@/lib/posthog-server"
import { mainProjects } from "@/components/mainProjects"

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

async function alertDiscord(error: unknown, where: string) {
  const message = String(error)
  const now = Date.now()
  const last = lastAlertAt.get(message)
  if (last && now - last < ALERT_COOLDOWN_MS) return
  lastAlertAt.set(message, now)

  try {
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
  return `(A visitor just opened the chat on your site. They haven't said anything yet. Text them a casual one-line opener, under 20 words, that invites them to ask you stuff. Work in a light nod to "${project.title}" or something about you. No link cards, no greeting like "Hi there!". Then append your [Q: ...] follow-up as usual.)`
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

    const { messages, greeting } = await req.json()

    // Strip any extra fields the client might have attached (e.g. `id`) before
    // sending to the API — Anthropic only accepts `role` and `content`.
    let apiMessages: { role: "user" | "assistant"; content: string }[] = messages.map(
      ({ role, content }: { role: "user" | "assistant"; content: string }) => ({ role, content }),
    )
    let context = ""

    if (greeting) {
      // Opening line: no visitor question exists yet, so skip RAG (nothing to search for).
      apiMessages = [{ role: "user", content: buildGreetingPrompt() }]
    } else {
      // Rewrite the full conversation into a standalone query before retrieval.
      // This fixes vague follow-ups like "tell me more about that" — the rewriter
      // resolves the pronoun/reference using prior turns before we embed anything.
      const searchQuery = await rewriteQuery(messages)
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
      system: SYSTEM_PROMPT + context,
      messages: apiMessages,
      max_tokens: 300, // +50 to budget for the [Q: ...] follow-up question appended to every response
    })

    const encoder = new TextEncoder()
    // ReadableStream lets us push chunks to the browser as they arrive instead of
    // buffering the whole response. The `controller` object is how we enqueue data.
    // 📖 Learn: Web Streams API — https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            // Each streaming event has a type; we only care about text deltas.
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text))
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
      headers: { "Content-Type": "text/plain; charset=utf-8" },
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

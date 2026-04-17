import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"
import { SYSTEM_PROMPT } from "@/lib/system-prompt"
import { retrieve, rewriteQuery } from "@/lib/retrieve"

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

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const { allowed, message: rateLimitMessage } = checkRateLimit(ip)
    if (!allowed) {
      return new Response(rateLimitMessage, { status: 429, headers: { "Content-Type": "text/plain" } })
    }

    const { messages } = await req.json()

    // Rewrite the full conversation into a standalone query before retrieval.
    // This fixes vague follow-ups like "tell me more about that" — the rewriter
    // resolves the pronoun/reference using prior turns before we embed anything.
    const searchQuery = await rewriteQuery(messages)
    const chunks = await retrieve(searchQuery)
    const context = chunks.length
      ? `\n\nRELEVANT CONTEXT:\n${chunks.map((c, i) => `${i + 1}. ${c}`).join("\n\n")}`
      : ""

    // `client.messages.stream` returns an async iterable of Server-Sent Events.
    // We forward only the text delta events so the client receives a plain text stream.
    // 📖 Learn: Anthropic streaming — https://docs.anthropic.com/en/api/messages-streaming
    const stream = client.messages.stream({
      model: "claude-haiku-4-5",
      system: SYSTEM_PROMPT + context,
      // Strip any extra fields the client might have attached (e.g. `id`) before
      // sending to the API — Anthropic only accepts `role` and `content`.
      messages: messages.map(({ role, content }: { role: string; content: string }) => ({ role, content })),
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
        } finally {
          // Always close the stream, even if an error is thrown mid-stream.
          controller.close()
        }
      },
    })

    // Returning a plain text stream; the client reads it with response.body.getReader()
    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

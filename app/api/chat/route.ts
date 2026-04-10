import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"
import { SYSTEM_PROMPT } from "@/lib/system-prompt"

// maxDuration tells Vercel's serverless runtime to allow up to 30 seconds before
// timing out. Streaming responses can take longer than the default 10 s limit.
// 📖 Learn: Vercel function duration — https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 30

// Instantiate the Anthropic client once at module level (not inside the handler)
// so it's reused across requests rather than recreated on every call.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })


export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // `client.messages.stream` returns an async iterable of Server-Sent Events.
    // We forward only the text delta events so the client receives a plain text stream.
    // 📖 Learn: Anthropic streaming — https://docs.anthropic.com/en/api/messages-streaming
    const stream = client.messages.stream({
      model: "claude-haiku-4-5",
      system: SYSTEM_PROMPT,
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

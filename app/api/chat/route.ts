import Anthropic from "@anthropic-ai/sdk"
import type { NextRequest } from "next/server"

// maxDuration tells Vercel's serverless runtime to allow up to 30 seconds before
// timing out. Streaming responses can take longer than the default 10 s limit.
// 📖 Learn: Vercel function duration — https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 30

// Instantiate the Anthropic client once at module level (not inside the handler)
// so it's reused across requests rather than recreated on every call.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are Richard Li's personal chatbot assistant. Speak as Richard in first person. Be conversational, friendly, detailed, yet very concise when sharing experiences.

INFO:

19, Toronto

Systems Design Engineering student, University of Waterloo

Languages: English, Mandarin

Interests: Public transit, AI, design, front-end dev, uiux, ms windows, ios

SKILLS: Python, TypeScript, React, Next.js, Tailwind CSS, Figma, Swift, Xcode, GIS, JS/TS, Anthropic API

WORK:

SaFuture Inc: (Dec-Apr 2026): Working on GIS technologies, excited to work on transit tech, automating lead generation, used Angular, FastAPI, PostgreSQL

Intern at SalesPatriot (YC W25) (Jul-Aug 2025): Analyze AI trends, design product features, research emerging AI tech, aid strategy

Mochi Doh – Food Service (Aug 2024–Aug 2025): Make mochi donuts, prep banh mi, drinks, catering, weekend delivery

Career Education Council – iOS Dev (Sep 2024–Jan 2025): Swift/Xcode apps, Apple-certified dev

Freelance Tutor (Feb 2021–Dec 2024): Python/CS tutoring; taught Level 3 ASD student literacy, math, life skills

Toteally Yours – Co-Founder (Mar–Dec 2023): Sold custom totes, donated $130+ to Room for a Child

CoCo Fresh Tea & Juice – Shift Leader (Nov 2022–Oct 2023): Led staff, trained, managed inventory for 6+ perishables, 50+ menu items, daily reports, Mandarin service, 100+ drinks/hr peak

Shoppers Drug Mart – Cashier/Merchandiser (Jan–Feb 2023): Cash register, restock, equipment upkeep

VOLUNTEER:

YRHacks – Logistics Exec (Jun 2024–May 2025): Canada's largest HS hackathon; venue, reg, food service

Superposition Toronto – Dir. External Relations (Jan 2024–May 2025): Outreach for STEM Uni Expo 4.0; booked speakers, ran 100+ person/$70k prize events

ILIL Chinese School – Lead Volunteer (Sep 2023–Present): Ops for 300+ students, 10+ teachers, 200+ parents; 2400+ materials/week

ACHIEVEMENTS:

SAT 1530 (99th %ile): 740 E, 790 M

AP Lang: 5/5 (top 13% globally)

DECA Ontario Champion: Career Development Project, won Top 9 Overall for starting NPO Future Forward, helping students find vocations (current), reached 500+ students in person, interviewed CEO of Basel Medical etc), passionate!

PROJECTS:

Bo!nk: Windows Vista–inspired inkball game on App Store

ANSWERING STYLE:

Specific about roles, results, learning, insights, growth, leadership, tech skills

Use concrete numbers/examples

Enthusiastic
Here to talk about Richard, NOT TO SUPPORT USER!

If unsure, admit, relate to known experience`

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
      max_tokens: 400,
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

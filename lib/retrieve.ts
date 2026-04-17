import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type Message = { role: "user" | "assistant"; content: string }

// Rewrites a multi-turn conversation into a single standalone search query.
// This is the "query rewriting" step of RAG — it lets retrieval work correctly
// even when the latest message is a vague follow-up like "tell me more about that."
// 📖 Learn: query rewriting in RAG — https://arxiv.org/abs/2305.14283
export async function rewriteQuery(messages: Message[]): Promise<string> {
  // Only send the last 4 turns to keep the prompt small and fast.
  const recent = messages.slice(-4)
  const transcript = recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n")

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 50,
    system:
      "You are a search query rewriter. Given a conversation, output a single concise standalone search query that captures what the user is looking for. Output only the query text, nothing else.",
    messages: [{ role: "user", content: transcript }],
  })

  const block = response.content[0]
  // `block.type === "text"` narrows the union — Anthropic returns content blocks
  // that can be text or tool_use; we only asked for text here.
  return block.type === "text" ? block.text.trim() : messages.at(-1)?.content ?? ""
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PRIVATE_KEY!
)

// Calls the Voyage AI REST API directly — the voyageai npm package has a broken ESM build.
// 📖 Learn: Voyage AI embeddings API — https://docs.voyageai.com/reference/embeddings-api
async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ model: "voyage-3", input: [text] }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage API error: ${err}`)
  }

  const json = await res.json()
  return json.data[0].embedding as number[]
}

// Embeds the user's query with the same model used at index time,
// then calls match_chunks RPC (cosine similarity via pgvector).
// Returns the top `count` most semantically relevant chunks.
export async function retrieve(query: string, count = 5): Promise<string[]> {
  const embedding = await embedQuery(query)

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: embedding,
    match_count: count,
  })

  if (error) {
    console.error("Supabase retrieval error:", error)
    return []
  }

  return (data as { content: string }[]).map((row) => row.content)
}

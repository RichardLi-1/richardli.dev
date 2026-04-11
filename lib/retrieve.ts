import { createClient } from "@supabase/supabase-js"

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

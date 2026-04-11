// scripts/embed.ts
// Run with: npx tsx --env-file=.env.local scripts/embed.ts
//
// Reads lib/chunks.json, generates Voyage AI embeddings, and upserts to Supabase.
// Safe to re-run — upsert on `id` means existing rows are updated, not duplicated.
//
// Requires these env vars (from .env.local):
//   VOYAGE_API_KEY, SUPABASE_URL, SUPABASE_PRIVATE_KEY

import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import chunks from "../lib/chunks.json"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PRIVATE_KEY!
)

// Calls the Voyage AI REST API directly — avoids the broken ESM build in the voyageai package.
// All 15 chunks are sent in one request (well under the 3 RPM free-tier limit).
// 📖 Learn: Voyage AI embeddings API — https://docs.voyageai.com/reference/embeddings-api
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ model: "voyage-3", input: texts }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage API error: ${err}`)
  }

  const json = await res.json()
  // The API returns embeddings in the same order as the input array
  return (json.data as { embedding: number[] }[]).map((d) => d.embedding)
}

async function main() {
  console.log(`Embedding ${chunks.length} chunks in a single batch request...`)

  const embeddings = await getEmbeddings(chunks.map((c) => c.content))

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = embeddings[i]

    // Upsert: if a row with this `id` already exists, update it.
    // 📖 Learn: Supabase upsert — https://supabase.com/docs/reference/javascript/upsert
    const { error } = await supabase
      .from("chunks")
      .upsert({ id: chunk.id, topic: chunk.topic, content: chunk.content, embedding })

    if (error) {
      console.error(`Error upserting chunk "${chunk.id}":`, error.message)
    } else {
      console.log(`  ✓ ${chunk.id}`)
    }
  }

  console.log("Done.")
}

main()

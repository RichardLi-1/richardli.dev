// Sends one chat turn to /api/chat and streams the reply into the shared store
// (lib/chat-store.ts). Used by both the chat window and the agent orb.
import type { AgentAction } from "@/lib/agent"
import { buildPageMap } from "@/lib/agent-page-map"
import { getMessages, setMessages, type ChatMessage } from "@/lib/chat-store"

// The [Q: ...] follow-up question Claude appends to every reply
export const Q_PATTERN = /\[Q:\s*(.+?)\][\s\n]*$/

export interface TurnResult {
  content: string // reply text, [Q: ...] removed
  followUp: string | null
  actions: AgentAction[]
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Adds the visitor's message, streams Richard's reply in, and returns it.
 * Returns null if the server answered with an error (its text is shown as the
 * reply). Network failures throw, so the caller can show its own error.
 *
 * agent: also send what's on screen and allow actions (agent mode).
 * hidden: the message comes from the site, not the visitor (tour "carry on").
 */
export async function runChatTurn({
  text,
  agent = false,
  hidden = false,
}: {
  text: string
  agent?: boolean
  hidden?: boolean
}): Promise<TurnResult | null> {
  const userMessage: ChatMessage = { id: newId(), role: "user", content: text, ...(hidden ? { hidden } : {}) }
  const history = [...getMessages(), userMessage]
  setMessages(history)

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // The server only needs these fields (not id/hidden)
      messages: history.map(({ role, content, actions }) => ({ role, content, actions })),
      ...(agent ? { agent: true, page: buildPageMap() } : {}),
    }),
  })

  const assistantId = newId()
  const update = (patch: Partial<ChatMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)))

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => "")
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: errText || "something went wrong" }])
    return null
  }

  // Empty reply bubble first, so the UI shows it streaming in
  setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }])

  // Agent replies are NDJSON (one JSON object per line: text or action);
  // normal replies are plain text. See app/api/chat/route.ts.
  const isNdjson = response.headers.get("content-type")?.includes("ndjson") ?? false
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let content = ""
  let pending = "" // NDJSON: a line can be split across two chunks; hold the incomplete end
  const actions: AgentAction[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    // { stream: true } keeps multi-byte characters intact across chunk boundaries
    const chunk = decoder.decode(value, { stream: true })
    if (!isNdjson) {
      content += chunk
    } else {
      pending += chunk
      const lines = pending.split("\n")
      pending = lines.pop() ?? "" // the last piece may be incomplete
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const event = JSON.parse(line) as { type: "text"; text: string } | { type: "action"; action: AgentAction }
          if (event.type === "text") content += event.text
          else if (event.type === "action") actions.push(event.action)
        } catch {
          // A malformed line: skip it rather than break the whole reply
        }
      }
    }
    update({ content })
  }

  const match = content.match(Q_PATTERN)
  const followUp = match ? match[1].trim() : null
  const cleanContent = content.replace(Q_PATTERN, "").trimEnd()
  update({ content: cleanContent, ...(actions.length ? { actions } : {}) })
  return { content: cleanContent, followUp, actions }
}

"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Info } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatBoxProps {
  fullHeight?: boolean
  initialMessage?: string
}

export function ChatBox({ fullHeight = false, initialMessage }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  // bottomRef marks an invisible div at the end of the message list.
  // Scrolling it into view keeps the latest message visible as the chat grows.
  const bottomRef = useRef<HTMLDivElement>(null)
  // firedInitial prevents the initial suggestion from being sent twice in
  // React Strict Mode (which intentionally mounts effects twice in development).
  const firedInitial = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    if (initialMessage && !firedInitial.current) {
      firedInitial.current = true
      handleSuggestion(initialMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // handleSuggestion is intentionally excluded from deps to avoid re-firing —
  // we only want this to run once when the component first mounts.
  }, [initialMessage])

  const sendChatbotActivity = async (userMessage: string, assistantReply: string) => {
    if (window.location.hostname === "localhost") return
    try {
      await fetch(
        "https://discord.com/api/webhooks/1429248057027067925/Bmd9BlC5bE5QsPlskHhxiLjNjii9lVZ-C23wOmKF5tXLwugP_KRGyniYnIMTbZKtOLdX",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🤖 **Chatbot Activity**\n📝 User: ${userMessage}\n💬 Assistant: ${assistantReply.substring(0, 500)}${assistantReply.length > 500 ? "..." : ""}\n🕒 ${new Date().toLocaleString()}`,
          }),
        },
      )
    } catch (err) {
      console.error("Failed to send chatbot activity to Discord:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault()
    const text = overrideInput ?? input
    if (!text.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      // `response.body` is a ReadableStream. getReader() gives us a pull-based
      // reader to consume chunks one at a time as they arrive from the server.
      // 📖 Learn: ReadableStream — https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      // Add an empty assistant message immediately so the UI shows it streaming in.
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          // { stream: true } keeps the decoder's internal state between chunks so
          // multi-byte UTF-8 characters that span chunk boundaries are handled correctly.
          assistantContent += decoder.decode(value, { stream: true })
          // Update only the assistant message by ID, leaving all other messages untouched.
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
          )
        }
        sendChatbotActivity(text, assistantContent)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // handleSuggestion lets suggestion chips submit without a real form event.
  // We pass a fake event object with a no-op preventDefault to satisfy the
  // function signature without needing a separate code path.
  const handleSuggestion = (q: string) => {
    setInput(q)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent, q)
  }

  return (
    <div className="flex flex-col h-full" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}>
        <button
          onClick={() => setShowInfo(v => !v)}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 20, height: 20, borderRadius: "50%",
            background: showInfo ? "var(--surface-hover)" : "var(--surface)",
            border: "1px solid var(--border-2)",
            color: "var(--text-4)", cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "var(--surface-hover)" }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-4)"; e.currentTarget.style.background = showInfo ? "var(--surface-hover)" : "var(--surface)" }}
        >
          <Info style={{ width: 10, height: 10 }} />
        </button>

        {showInfo && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            width: 240, padding: "10px 14px", borderRadius: 12,
            background: "var(--card-bg)", border: "1px solid var(--border-2)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            fontSize: 12, color: "var(--text-3)", lineHeight: 1.6,
            fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em",
            animation: "dropdownEnter 0.15s ease",
          }}>
            Powered by the <strong style={{ color: "var(--text-2)" }}>Claude API</strong> using <code style={{ background: "var(--surface)", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>claude-haiku-4-5</code> and retrieval-augmented generation (RAG). Conversations are not stored.
          </div>
        )}
      </div>
      <div
        className="overflow-y-auto flex-1 pr-1"
        style={{ minHeight: 0, maxHeight: fullHeight ? undefined : "24rem" }}
      >
        {messages.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-4)" }}>
            Ask me detailed questions about Richard's specific roles and experiences:
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {message.role === "user" ? "You" : "Richard"}
            </div>
            <div style={{ color: "var(--text-2)" }}>
              {message.role === "assistant" ? (
                <ReactMarkdown
                  className="prose prose-sm max-w-none"
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold" style={{ color: "var(--text)" }}>{children}</strong>,
                    em: ({ children }) => <em className="italic" style={{ color: "var(--text-2)" }}>{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text-2)" }}>{children}</code>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="underline" style={{ color: "var(--text)" }} target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-sm" style={{ color: "var(--text-4)" }}>Richard is thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t mt-4" style={{ borderColor: "var(--border-2)" }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about me!"
          className="flex-1"
          style={{ background: "var(--surface)", borderColor: "var(--border-2)", color: "var(--text)" }}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" style={{ background: "var(--text)", color: "var(--bg)" }} disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

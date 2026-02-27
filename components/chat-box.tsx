"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatBoxProps {
  fullHeight?: boolean
}

export function ChatBox({ fullHeight = false }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendChatbotActivity = async (userMessage: string, assistantReply: string) => {
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

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          assistantContent += decoder.decode(value, { stream: true })
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

  const handleSuggestion = (q: string) => {
    setInput(q)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent, q)
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="overflow-y-auto flex-1 space-y-5 pr-1"
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

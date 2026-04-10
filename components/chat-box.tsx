"use client"
import { useState, useRef, useEffect, memo } from "react"
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Info, ArrowUpRight, Mail } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Metadata for internal pages — used to render link cards in chat responses.
// When Claude references a page with a markdown link like [text](/path), the
// `a` component below intercepts it and renders this card instead of plain text.
const PAGE_META: Record<string, { label: string; description: string; image?: string }> = {
  "/":                    { label: "Home",                description: "Hero, current roles, featured projects", image: "/images/website-thumbnail.png" },
  "/work":                { label: "Work",                description: "All projects",                          image: "/images/transitplannerbanner.png" },
  "/transit/photography": { label: "Transit Photography", description: "Photos from the TTC and beyond",        image: "/images/IMG_7099.jpeg" },
  "/transit/fanning":     { label: "Fanning Gallery",     description: "Fanning-style photo layout",            image: "/images/IMG_7099.jpeg" },
  "/transit/hypo-maps":   { label: "Hypo Maps",           description: "Hypothetical transit map designs",      image: "/images/totransitbanner.png" },
  "/chat":                { label: "Chat",                description: "This chatbot" },
  "/contact":             { label: "Contact",             description: "Get in touch" },
  "/resume":              { label: "Resume",              description: "Full résumé" },
  "/more":                { label: "More",                description: "More about Richard" },
}

function PageCard({ href, children }: { href: string; children: React.ReactNode }) {
  const meta = PAGE_META[href]
  // If we don't recognise the path, fall back to a normal external link
  if (!meta) return (
    <a href={href} className="underline" style={{ color: "var(--text)" }} target="_blank" rel="noopener noreferrer">{children}</a>
  )
  return (
    // Block-level so it breaks out of the surrounding sentence onto its own line.
    // Using a div wrapper because Next.js Link can't be a block inside a <p>.
    <div style={{ margin: "8px 0" }}>
      <Link href={href} style={{ textDecoration: "none" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 0,
          borderRadius: 12, overflow: "hidden",
          background: "var(--surface)", border: "1px solid var(--border-2)",
          transition: "background 0.15s",
          width: "100%"
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
        >
          {meta.image && (
            <img
              src={meta.image}
              alt=""
              style={{ width: 72, height: 52, objectFit: "cover", flexShrink: 0 }}
            />
          )}
          <span style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.label}</span>
            <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'Toronto Subway', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.description}</span>
          </span>
          <span style={{ paddingRight: 10, flexShrink: 0 }}>
            <ArrowUpRight style={{ width: 12, height: 12, color: "var(--text-4)" }} />
          </span>
        </span>
      </Link>
    </div>
  )
}

// Curated metadata for known external URLs Claude might reference.
// For anything not listed here, ExternalCard falls back to showing the domain + favicon.
const KNOWN_LINKS: Record<string, { label: string; description: string }> = {
  "https://github.com/evanzyang91/transit-planner": { label: "Transit Planner", description: "Open source on GitHub — give it a star!" },
  "https://github.com/richardli":                   { label: "GitHub",           description: "@richardli" },
  "https://linkedin.com/in/richardli":               { label: "LinkedIn",         description: "Richard Li" },
  "https://apps.apple.com/app/boink":                { label: "Bo!nk on App Store", description: "Download on iOS" },
}

function ExternalCard({ href, children }: { href: string; children: React.ReactNode }) {
  const known = KNOWN_LINKS[href]
  // Use Google's favicon service to get the site icon — works for any domain
  const domain = new URL(href).hostname
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  const label = known?.label ?? (children as string) ?? domain
  const description = known?.description ?? domain

  return (
    <div style={{ margin: "8px 0" }}>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 12,
          background: "var(--surface)", border: "1px solid var(--border-2)",
          transition: "background 0.15s", maxWidth: 280,
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={favicon} alt="" style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
            <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'Toronto Subway', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{description}</span>
          </span>
          <ArrowUpRight style={{ width: 12, height: 12, color: "var(--text-4)", flexShrink: 0 }} />
        </span>
      </a>
    </div>
  )
}

function MusicCard({ href }: { href: string }) {
  return (
    <div style={{ margin: "10px 0", maxWidth: 400 }}>
      <iframe
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        style={{ width: "100%", overflow: "hidden", borderRadius: 12, border: "none" }}
        height="175"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src={href}
      />
    </div>
  )
}

function EmailCard({ href }: { href: string }) {
  const email = href.replace("mailto:", "")
  return (
    <div style={{ margin: "8px 0" }}>
      <a href={href} style={{ textDecoration: "none" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 12,
          background: "var(--surface)", border: "1px solid var(--border-2)",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
        >
          <Mail style={{ width: 14, height: 14, color: "var(--text-3)", flexShrink: 0 }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em" }}>Email Richard</span>
            <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'Toronto Subway', sans-serif" }}>{email}</span>
          </span>
          <ArrowUpRight style={{ width: 12, height: 12, color: "var(--text-4)", flexShrink: 0 }} />
        </span>
      </a>
    </div>
  )
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// Regex to match the [Q: ...] follow-up question Claude appends to every response.
// We strip it from the rendered content so it doesn't show as raw text in the chat.
const Q_PATTERN = /\[Q:\s*(.+?)\][\s\n]*$/

// memo prevents re-renders when message content hasn't changed.
// This is critical for MusicCard: the Apple Music iframe reloads whenever
// its parent unmounts/remounts, which happens on every streaming chunk update
// without memoization. Completed messages freeze here and their iframes stay stable.
// 📖 Learn: React.memo — https://react.dev/reference/react/memo
const MessageItem = memo(function MessageItem({ message }: { message: Message }) {
  // Strip [Q: ...] from the display content — it will be shown as a chip instead.
  const displayContent = message.role === "assistant"
    ? message.content.replace(Q_PATTERN, "").trimEnd()
    : message.content

  return (
    <div className="space-y-0.5 mb-3">
      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        {message.role === "user" ? "You" : "Richard"}
      </div>
      <div style={{ color: "var(--text-2)" }}>
        {message.role === "assistant" ? (
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <div className="mb-1 last:mb-0">{children}</div>,
              strong: ({ children }) => <strong className="font-bold" style={{ color: "var(--text)" }}>{children}</strong>,
              em: ({ children }) => <em className="italic" style={{ color: "var(--text-2)" }}>{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              code: ({ children }) => (
                <code className="px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text-2)" }}>{children}</code>
              ),
              a: ({ children, href = "" }) => href.startsWith("/")
                ? <PageCard href={href}>{children}</PageCard>
                : href.startsWith("mailto:")
                  ? <EmailCard href={href} />
                  : href.includes("embed.music.apple.com")
                    ? <MusicCard href={href} />
                    : href.startsWith("http")
                    ? <ExternalCard href={href}>{children}</ExternalCard>
                    : <a href={href} className="underline" style={{ color: "var(--text)" }} target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {displayContent}
          </ReactMarkdown>
        ) : (
          <div className="whitespace-pre-wrap">{displayContent}</div>
        )}
      </div>
    </div>
  )
})

interface ChatBoxProps {
  fullHeight?: boolean
  initialMessage?: string
}

const placeholders = [
  "Ask me what's my favourite pangram",
  "Show me Richard's transit photos",
  "What projects has Richard built?",
  "How do I get in touch with Richard?",
  "What's Bo!nk?",
  "Show me Richard's hypothetical transit maps",
  "Where can I see all of Richard's work?",
  "Can I hire Richard?",
  "What's Richard's favourite transit line?",
  "Show me something Richard has designed",
  "What did Richard win at DECA?",
  "Ask me about Transit Planner",
]

export function ChatBox({ fullHeight = false, initialMessage }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  // Stores the [Q: ...] follow-up question Claude appends to each response.
  // Shown as a tappable chip after the last assistant message.
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)
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
    const interval = setInterval(() => setPlaceholderIndex(i => (i + 1) % placeholders.length), 3500)
    return () => clearInterval(interval)
  }, [])

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
      // Using embeds instead of plain content: embed description allows up to 4096 chars,
      // vs. the 2000-char limit on plain content that forced the old 500-char truncation.
      await fetch(
        "https://discord.com/api/webhooks/1429248057027067925/Bmd9BlC5bE5QsPlskHhxiLjNjii9lVZ-C23wOmKF5tXLwugP_KRGyniYnIMTbZKtOLdX",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: "🤖 Chatbot Activity",
                color: 0x5865f2,
                fields: [
                  { name: "📝 User", value: userMessage, inline: false },
                  { name: "💬 Assistant", value: assistantReply, inline: false },
                ],
                footer: { text: new Date().toLocaleString() },
              },
            ],
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
    setFollowUpQuestion(null) // clear the previous chip when a new message is sent

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
        // After streaming, extract the [Q: ...] follow-up question and strip it
        // from the stored message so it doesn't appear as raw text in the chat.
        const qMatch = assistantContent.match(Q_PATTERN)
        if (qMatch) {
          setFollowUpQuestion(qMatch[1].trim())
          const cleanContent = assistantContent.replace(Q_PATTERN, "").trimEnd()
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: cleanContent } : msg))
          )
          sendChatbotActivity(text, cleanContent)
        } else {
          sendChatbotActivity(text, assistantContent)
        }
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
            Powered by the <strong style={{ color: "var(--text-2)" }}>Claude API</strong> using <code style={{ background: "var(--surface)", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>claude-haiku-4-5</code> and retrieval-augmented generation (RAG).
          </div>
        )}
      </div>
      <div
        className="overflow-y-auto flex-1 pr-1"
        style={{ minHeight: 0, maxHeight: fullHeight ? undefined : "24rem" }}
      >
        {messages.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-4)", marginRight: 8 }}>
            Ask me detailed questions about Richard's specific roles and experiences:
          </p>
        )}

        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="text-sm" style={{ color: "var(--text-4)" }}>Richard is thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Follow-up suggestion chip — appears after each response, disappears when the user sends a new message */}
      {!isLoading && followUpQuestion && (
        <div style={{ paddingBottom: 8 }}>
          <button
            onClick={() => handleSuggestion(followUpQuestion)}
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: 20,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "'Toronto Subway', sans-serif",
              letterSpacing: "0.02em",
              transition: "background 0.15s, color 0.15s",
              maxWidth: "100%",
              textAlign: "left",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-hover)"; e.currentTarget.style.color = "var(--text-2)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-3)" }}
          >
            {followUpQuestion} →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-1 pt-4 border-t mt-4" style={{ borderColor: "var(--border-2)" }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab" && !input) {
              e.preventDefault()
              setInput(placeholders[placeholderIndex])
            }
          }}
          placeholder={placeholders[placeholderIndex]}
          className="flex-1"
          style={{ background: "var(--surface)", borderColor: "var(--border-2)", color: "var(--text)", cornerShape: "squircle", borderRadius: 20 }}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" style={{ background: "var(--text)", color: "var(--bg)", cornerShape: "squircle", borderRadius: 20 }} disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

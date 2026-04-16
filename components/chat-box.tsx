"use client"
import { useState, useRef, useEffect, memo } from "react"
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Info, ArrowUpRight, Mail } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { mainProjects } from "@/components/mainProjects"

// Videos can't be used as <img> thumbnails — fall back to logo, then nothing.
function projectThumbnail(p: typeof mainProjects[number]): string | undefined {
  const isVideo = (s?: string) => s?.endsWith(".mov") || s?.endsWith(".mp4")
  if (!isVideo(p.image)) return p.image || undefined
  return p.logo || undefined
}

// Metadata for internal pages — used to render link cards in chat responses.
// When Claude references a page with a markdown link like [text](/path), the
// `a` component below intercepts it and renders this card instead of plain text.
// Work project entries are generated from mainProjects so they stay in sync automatically.
const PAGE_META: Record<string, { label: string; description: string; image?: string }> = {
  "/":                    { label: "Home",             description: "Hero, current roles, featured projects", image: "/images/website-thumbnail.png" },
  "/work":                { label: "Work",             description: "All projects",                          image: "/images/transitplannerbanner.png" },
  "/transit/photography": { label: "Transit Photography", description: "Photos from the TTC and beyond",    image: "/images/IMG_7099.jpeg" },
  "/transit/fanning":     { label: "Fanning Gallery",  description: "Fanning-style photo layout",           image: "/images/IMG_7099.jpeg" },
  "/transit/hypo-maps":   { label: "Hypo Maps",        description: "Hypothetical transit map designs",     image: "/images/totransitbanner.png" },
  "/chat":                { label: "Chat",              description: "This chatbot" },
  "/contact":             { label: "Contact",           description: "Get in touch" },
  "/resume":              { label: "Resume",            description: "Full résumé" },
  "/more":                { label: "More",              description: "More about Richard" },
  // Spread project entries so adding a project to mainProjects.ts is all that's needed.
  ...Object.fromEntries(
    mainProjects.map(p => [
      `/work/${p.id}`,
      { label: p.title, description: p.description ?? "", image: projectThumbnail(p) },
    ])
  ),
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
  "https://github.com/evanzyang91/transit-planner":  { label: "Transit Planner",         description: "Open source on GitHub — give it a star!" },
  "https://github.com/richardli":                    { label: "GitHub",                  description: "@richardli" },
  "https://linkedin.com/in/richardli":               { label: "LinkedIn",                description: "Richard Li" },
  "https://apps.apple.com/app/boink":                { label: "Bo!nk",                   description: "Windows Vista-inspired inkball game on the App Store" },
  "https://www.transitplan.xyz/map":      { label: "Transit Planner App",     description: "Try the live app" },
  "https://youtu.be/Pkpd0WDR_sA":                   { label: "Father Figure Demo",      description: "Watch the Hack the North demo" },
  "https://devpost.com/software/transit-planner":    { label: "Transit Planner Devpost", description: "Hack Canada 2026 — Google AI Track winner" },
}

// Metadata for font cards rendered via the custom font: URL scheme.
// FontCard shows the typeface rendered in itself so the user immediately sees what it looks like.
const FONT_META: Record<string, { name: string; family: string; description: string }> = {
  "toronto-subway": { name: "Toronto Subway", family: "'Toronto Subway', sans-serif", description: "Body text, UI labels & nav" },
  "sfcamera":       { name: "SFCamera",       family: "'SFCamera', sans-serif",       description: "Hero headings (h1 only)" },
}

function FontCard({ href }: { href: string }) {
  const key = href.replace("font:", "")
  const meta = FONT_META[key]
  if (!meta) return null
  return (
    <div style={{ margin: "8px 0" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 12,
        background: "var(--surface)", border: "1px solid var(--border-2)",
        maxWidth: 280,
      }}>
        {/* Sample rendered in the actual font so it speaks for itself */}
        <span style={{
          fontFamily: meta.family, fontSize: 20, color: "var(--text)",
          lineHeight: 1, flexShrink: 0, letterSpacing: "0.02em",
        }}>
          Aa
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{meta.name}</span>
          <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'Toronto Subway', sans-serif", whiteSpace: "nowrap" }}>{meta.description}</span>
        </span>
      </span>
    </div>
  )
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

// tel: links open the native dialer on mobile — renders identically to EmailCard but with a phone icon.
function PhoneCard({ href }: { href: string }) {
  const number = href.replace("tel:", "")
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
          {/* Using inline SVG so we don't need to add a new lucide import */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-3)", flexShrink: 0 }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "'Toronto Subway', sans-serif", letterSpacing: "0.02em" }}>Call Richard</span>
            <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'Toronto Subway', sans-serif" }}>{number}</span>
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
              a: ({ children, href = "" }) => href.startsWith("font:")
                ? <FontCard href={href} />
                : href.startsWith("tel:")
                ? <PhoneCard href={href} />
                : href.startsWith("/")
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
  "What's your favourite pangram?",
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
  // infoRef wraps the info button + dropdown so we can detect outside clicks.
  const infoRef = useRef<HTMLDivElement>(null)
  // inputRef lets the document-level Tab handler focus the input when filling a placeholder.
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIndex(i => (i + 1) % placeholders.length), 3500)
    return () => clearInterval(interval)
  }, [])

  // Document-level Tab handler so the user doesn't need to focus the input first.
  // Only fires when there's a follow-up question and the input is empty.
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || input || isLoading) return
      e.preventDefault()
      if (followUpQuestion) {
        handleSuggestion(followUpQuestion)
      } else {
        // No follow-up chip — fill the input with the current placeholder and focus it
        setInput(placeholders[placeholderIndex])
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleTab)
    return () => document.removeEventListener("keydown", handleTab)
  }, [followUpQuestion, input, isLoading])

  useEffect(() => {
    if (initialMessage && !firedInitial.current) {
      firedInitial.current = true
      handleSuggestion(initialMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // handleSuggestion is intentionally excluded from deps to avoid re-firing —
  // we only want this to run once when the component first mounts.
  }, [initialMessage])

  // Close the info dropdown when the user clicks anywhere outside it.
  // mousedown fires before blur/focus so the dropdown closes before any other
  // click handler runs — avoids flicker from open → close → open.
  useEffect(() => {
    if (!showInfo) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [showInfo])

  const sendChatbotActivity = async (userMessage: string, assistantReply: string) => {
    if (window.location.hostname === "localhost") return
    if (localStorage.getItem("skip_tracking")) return
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

      if (!response.ok) {
        const errText = await response.text()
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: errText || "something went wrong" }])
        return
      }

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
      <div ref={infoRef} style={{ position: "absolute", top: -2, right: 10, zIndex: 10 }}>
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
            Powered by <strong style={{ color: "var(--text-2)" }}>Claude, Voyage AI, and Supabase</strong> using <code style={{ background: "var(--surface)", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>claude-haiku-4-5</code> and retrieval-augmented generation (RAG).
          </div>
        )}
      </div>
      <div
        className="overflow-y-auto flex-1 pr-1"
        style={{ minHeight: 0, maxHeight: fullHeight ? undefined : "24rem" }}
      >
        {messages.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-4)", marginRight: 8 }}>
            Ask me detailed questions about Richard's projects and experiences:
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
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {followUpQuestion}
              <span className="hidden md:inline" style={{
                fontSize: 10,
                color: "var(--text-4)",
                background: "var(--card-bg)",
                border: "1px solid var(--border-2)",
                borderRadius: 6,
                padding: "1px 6px",
                fontFamily: "'Toronto Subway', sans-serif",
                letterSpacing: "0.04em",
                lineHeight: "16px",
                flexShrink: 0,
              }}>tab</span>
            </span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-1 pt-4 border-t mt-4" style={{ borderColor: "var(--border-2)" }}>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab" && !input && !followUpQuestion) {
              e.preventDefault()
              setInput(placeholders[placeholderIndex])
            }
          }}
          placeholder={followUpQuestion ? "" : placeholders[placeholderIndex]}
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

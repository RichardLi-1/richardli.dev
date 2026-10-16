"use client"

/* ──────────────────────────────────────────────────────────────────────────
 * Chat nudge: a one-time, subtle "hey, you can talk to me" for visitors who
 * haven't opened the chat.
 *
 * After NUDGE_AFTER_MS on the site, the chat button in the header sends out a
 * small orb (the same black-and-grey glow as the agent orb), which drifts just
 * below the button (above it on the mobile pill), opens into a capsule with a
 * waving hand and a short line, holds for a moment, then folds back into the
 * button and disappears. Clicking it opens the chat.
 *
 * At most once per visit (sessionStorage), and never if the chat was already
 * opened, the conversation has started, or the agent orb is out.
 *
 * It's an overlay positioned over the real button rather than a change to the
 * header, so the header's layout never shifts.
 *
 * Testing: ⌃⌥N (Control + Option + N) plays it right away, any time.
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react"
import { getMessages } from "@/lib/chat-store"

// ── Tuning ───────────────────────────────────────────────────────────────────
const NUDGE_AFTER_MS = 30_000 // time on the site before nudging
const EMERGE_MS = 450 // orb drifts out of the button (matches .chat-nudge transition)
const OPEN_MS = 380 // capsule unfolds (matches .chat-nudge-capsule transition)
const HOLD_MS = 4000 // how long the line stays up
const OFFSET_PX = 46 // how far from the button the orb settles
const MESSAGE = "ask me anything"

const SHOWN_KEY = "chat_nudge_shown" // sessionStorage: nudged once this visit
const OPENED_KEY = "chat_opened" // sessionStorage: the visitor opened the chat
const CHAT_BUTTON = 'button[aria-label="Open chat"]'

type Stage = "hidden" | "emerging" | "open" | "closing" | "returning"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** sessionStorage can throw (private mode, blocked storage): treat that as "not set". */
function flag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1"
  } catch {
    return false
  }
}
function setFlag(key: string) {
  try {
    sessionStorage.setItem(key, "1")
  } catch {
    // fine: worst case it nudges once more
  }
}

/** The chat button that's actually on screen (desktop header or mobile pill). */
function findChatButton(): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>(CHAT_BUTTON)).find((el) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }) ?? null
  )
}

export function ChatNudge() {
  const [stage, setStage] = useState<Stage>("hidden")
  // Where the capsule's right edge sits; `home` is over the button, `away` is where it settles
  const [anchor, setAnchor] = useState({ x: 0, y: 0 })
  const homeRef = useRef({ x: 0, y: 0 })
  const cancelled = useRef(false)
  const playing = useRef(false)

  /** The whole animation: emerge → open → hold → close → return. */
  const play = async () => {
    const button = findChatButton()
    if (!button || playing.current) return
    playing.current = true
    cancelled.current = false

    const rect = button.getBoundingClientRect()
    // The orb's 36px circle, right-aligned 4px past the button, sits over its centre
    const home = { x: rect.right + 4, y: rect.top + rect.height / 2 }
    // Top header: settle below the button; mobile bottom pill: above it
    const below = rect.top < window.innerHeight / 2
    const away = { x: home.x, y: home.y + (below ? OFFSET_PX : -OFFSET_PX) }
    homeRef.current = home

    // Each step waits for its CSS transition to finish
    setAnchor(home)
    setStage("emerging")
    await sleep(30) // one paint at home first, so the move to `away` animates
    setAnchor(away)
    await sleep(EMERGE_MS)
    if (!cancelled.current) {
      setStage("open")
      await sleep(OPEN_MS + HOLD_MS)
    }
    if (!cancelled.current) {
      setStage("closing")
      await sleep(OPEN_MS)
      setStage("returning")
      setAnchor(homeRef.current)
      await sleep(EMERGE_MS)
    }
    setStage("hidden")
    playing.current = false
  }

  // ⌃⌥N (Control + Option + N; Ctrl + Alt + N on Windows) replays the nudge on
  // demand, for testing: skips the wait and the once-per-visit rule.
  // e.code is the physical key, because holding Option changes e.key on a Mac.
  // 📖 Learn: KeyboardEvent.code vs .key
  const playRef = useRef(play)
  playRef.current = play
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey && e.altKey && e.code === "KeyN")) return
      if ((e.target as Element | null)?.closest("input, textarea, [contenteditable='true']")) return // typing
      e.preventDefault()
      playRef.current()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // The real nudge: once per visit, after NUDGE_AFTER_MS
  useEffect(() => {
    if (flag(SHOWN_KEY) || flag(OPENED_KEY)) return

    // Remember if the visitor opens the chat themselves: then no nudge, ever this
    // visit. Capture phase, so we see the click before the header handles it.
    // 📖 Learn: event capturing
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest(CHAT_BUTTON)) {
        setFlag(OPENED_KEY)
        cancelled.current = true
      }
    }
    document.addEventListener("click", onClick, true)

    let timer = 0
    const run = () => {
      // Don't play it to an empty room: wait until the tab is in front
      if (document.hidden) {
        timer = window.setTimeout(run, 5000)
        return
      }
      const busy = getMessages().length > 0 || document.querySelector(".agent-orb") !== null
      if (cancelled.current || busy || flag(OPENED_KEY) || !findChatButton()) return
      setFlag(SHOWN_KEY)
      playRef.current()
    }
    timer = window.setTimeout(run, NUDGE_AFTER_MS)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("click", onClick, true)
    }
  }, [])

  if (stage === "hidden") return null

  const open = stage === "open"
  const visible = stage === "emerging" || stage === "open" || stage === "closing"

  return (
    <div
      className="chat-nudge"
      data-agent-ignore // not something for the agent to point at
      style={{
        transform: `translate3d(${anchor.x}px, ${anchor.y}px, 0)`,
        opacity: visible ? 1 : 0,
        scale: visible ? "1" : "0.5",
      }}
    >
      <button
        type="button"
        className="chat-nudge-capsule"
        data-open={open}
        aria-label="Open chat: ask Richard anything"
        onClick={() => {
          cancelled.current = true
          setStage("hidden")
          findChatButton()?.click()
        }}
      >
        <span className="agent-orb-glow" aria-hidden />
        <span className="agent-orb-core" aria-hidden />
        <span className="chat-nudge-content">
          <span className="chat-nudge-wave" aria-hidden>👋</span>
          <span className="chat-nudge-text">{MESSAGE}</span>
        </span>
      </button>
    </div>
  )
}

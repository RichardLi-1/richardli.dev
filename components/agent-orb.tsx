"use client"

/* ──────────────────────────────────────────────────────────────────────────
 * Agent orb (experimental "Let Richard drive" mode)
 *
 * When the chatbot starts acting on the site, the chat window shrinks into a
 * glowing orb. The orb is both:
 *   - the input: a softly blinking caret sits inside it; typing makes it bounce
 *     and stretch into a capsule holding your text (Enter sends)
 *   - the pointer: it flies to whatever it's showing, with Richard's reply in a
 *     speech bubble attached, and highlights it for a moment
 *
 * Tours: the bot plans the stops (start_tour), and the orb drives them: it opens
 * each page, waits for it to render, and quietly asks the bot to present it (a
 * hidden "site" message, sent with the new page's contents). Once the bot has
 * pointed things out, the orb moves on. Typing anything, or the ×, ends it.
 * (The bot used to open each next page itself, but Haiku often forgot, which
 * stalled tours after one stop.)
 *
 * Lives in the root layout (never unmounts), so it survives page changes. The
 * conversation itself is in lib/chat-store.ts, shared with the chat window.
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Maximize2, X } from "lucide-react"
import type { AgentAction } from "@/lib/agent"
import { runChatTurn } from "@/lib/chat-client"
import { getMessages, useChatMessages } from "@/lib/chat-store"

// ── Tuning ───────────────────────────────────────────────────────────────────
const ORB_SIZE = 52
const MAX_CAPSULE_WIDTH = 320
const BUBBLE_WIDTH = 300
const FLIGHT_MS = 700 // matches the transition in globals.css (.agent-orb-anchor)
const POINT_HOLD_MS = 1400 // how long it lingers on something it points at
const HIGHLIGHT_MS = 1500 // matches the agent-highlight animation in globals.css
const RETURN_HOME_MS = 1600 // idle this long after acting → fly back to the dock
const ARRIVE_DELAY_MS = 700 // let a new page render before presenting it
const BETWEEN_STOPS_MS = 1200 // pause after presenting a stop, before the next one
const GAP = 14 // px between the orb and what it points at

// ── Talking to the orb from outside React ───────────────────────────────────
// The chat window (in the header) and the orb (in the layout) are in different
// React trees, so the chat hands actions over through this module-level handle.
// The header owns the chat window's open state, so the orb asks it to close or
// open through window events.
export const COLLAPSE_CHAT_EVENT = "agent:collapse-chat"
export const EXPAND_CHAT_EVENT = "agent:expand-chat"

let orbHandle: { start: (actions: AgentAction[]) => void } | null = null

/** Called by the chat window when a reply came with actions: shrink into the orb and do them. */
export function startAgentRun(actions: AgentAction[]) {
  orbHandle?.start(actions)
}

interface Point {
  x: number
  y: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Markdown → plain text for the bubble (link cards, bold and code don't fit in it). */
function toPlain(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .trim()
}

/** Waits until `el` stops moving (a smooth scroll has finished), up to 1.2s. */
async function waitForSettle(el: HTMLElement) {
  let last = el.getBoundingClientRect().top
  let still = 0
  const until = performance.now() + 1200
  while (still < 4 && performance.now() < until) {
    await new Promise(requestAnimationFrame)
    const top = el.getBoundingClientRect().top
    still = Math.abs(top - last) < 0.5 ? still + 1 : 0
    last = top
  }
}

/** Scrolls `el` into view if it isn't already, then waits for the scroll to end. */
async function ensureVisible(el: HTMLElement, smooth: boolean) {
  const rect = el.getBoundingClientRect()
  const inView = rect.top >= 60 && rect.bottom <= window.innerHeight - 120
  if (inView) return
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" })
  await waitForSettle(el)
}

/** A ring around `el` that fades in and out (CSS animation), then removes itself. */
function highlight(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const pad = 6
  const ring = document.createElement("div")
  ring.className = "agent-highlight"
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 8
  Object.assign(ring.style, {
    left: `${rect.left - pad}px`,
    top: `${rect.top - pad}px`,
    width: `${rect.width + pad * 2}px`,
    height: `${rect.height + pad * 2}px`,
    borderRadius: `${radius + pad}px`,
  })
  document.body.appendChild(ring)
  setTimeout(() => ring.remove(), HIGHLIGHT_MS)
}

/** Where the orb should sit to point at `rect`: beside it if there's room, else below. */
function spotNextTo(rect: DOMRect): Point {
  const r = ORB_SIZE / 2
  const y = clamp(rect.top + rect.height / 2, r + 8, window.innerHeight - r - 8)
  if (rect.right + GAP + ORB_SIZE < window.innerWidth - 8) return { x: rect.right + GAP + r, y }
  if (rect.left - GAP - ORB_SIZE > 8) return { x: rect.left - GAP - r, y }
  return {
    x: clamp(rect.left + rect.width / 2, r + 8, window.innerWidth - r - 8),
    y: clamp(rect.bottom + GAP + r, r + 8, window.innerHeight - r - 8),
  }
}

export function AgentOrb() {
  const router = useRouter()
  const pathname = usePathname()
  const [messages] = useChatMessages()

  const [visible, setVisible] = useState(false)
  const [spot, setSpot] = useState<Point | null>(null) // null = resting at the dock
  const [dock, setDock] = useState<Point>({ x: 0, y: 0 })
  const [input, setInput] = useState("")
  const [inputWidth, setInputWidth] = useState(0)
  const [thinking, setThinking] = useState(false)
  // The bubble only shows replies from this point in the conversation on, so a
  // new step (next tour stop, a new question) never shows the previous step's
  // text while the next reply is on its way.
  const [bubbleFrom, setBubbleFrom] = useState(0)
  /** Clears the bubble: everything said so far is from an earlier step. */
  const newStep = () => setBubbleFrom(getMessages().length)

  const orbRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Bumped whenever the visitor takes over: anything holding an older token stops
  const runToken = useRef(0)
  // The tour in progress: its stops (page paths) and which one we're on
  const tour = useRef<{ stops: string[]; index: number } | null>(null)
  // Set while the orb is waiting for a tour stop's page to finish loading
  const awaitingArrival = useRef(false)
  const reducedMotion = useRef(false)

  // Dock: bottom centre, above the mobile nav pill
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const place = () =>
      setDock({ x: window.innerWidth / 2, y: window.innerHeight - (window.innerWidth < 768 ? 132 : 64) })
    place()
    window.addEventListener("resize", place)
    return () => window.removeEventListener("resize", place)
  }, [])

  /** Starts a new run (a visitor message or a hand-over from the chat window). */
  const begin = () => ++runToken.current
  const alive = (token: number) => token === runToken.current

  const flyTo = async (point: Point | null) => {
    setSpot(point)
    await sleep(reducedMotion.current ? 0 : FLIGHT_MS)
  }

  /** A quick squash, like a finger tapping. `scale` is separate from the flight's transform. */
  const press = async () => {
    orbRef.current?.animate([{ scale: "1" }, { scale: "0.8" }, { scale: "1" }], { duration: 240, easing: "ease-out" })
    await sleep(170)
  }

  const findTarget = (id: string) => document.querySelector<HTMLElement>(`[data-agent-id="${CSS.escape(id)}"]`)

  /** After acting, drift back to the dock (unless something else has started). */
  const restSoon = async (token: number) => {
    await sleep(RETURN_HOME_MS)
    if (alive(token)) setSpot(null)
  }

  /**
   * Goes to another page. If there's a visible link to it, fly there and press
   * it, so it opens the way a visitor's click would (e.g. the homepage cards'
   * launch animation). Otherwise just navigate.
   */
  const navigateTo = async (path: string, token: number) => {
    const link = Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[href="${path}"]`)).find((a) => {
      const rect = a.getBoundingClientRect()
      return !a.closest("[data-agent-ignore]") && rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight
    })
    if (!link) {
      router.push(path)
      return
    }
    const rect = link.getBoundingClientRect()
    await flyTo({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    if (!alive(token)) return
    await press()
    link.click()
  }

  // ── Doing things ──
  /**
   * Performs a reply's actions in order. While presenting a tour stop, page
   * changes are ignored: the orb, not the bot, decides when to move on.
   */
  const runActions = async (actions: AgentAction[], token: number, presenting = false) => {
    const smooth = !reducedMotion.current
    for (const action of actions) {
      if (!alive(token)) return
      switch (action.type) {
        case "point_at": {
          const el = findTarget(action.target)
          if (!el) break
          await ensureVisible(el, smooth)
          if (!alive(token)) return
          await flyTo(spotNextTo(el.getBoundingClientRect()))
          highlight(el)
          await sleep(POINT_HOLD_MS)
          break
        }
        case "scroll_to": {
          const el = document.getElementById(action.section)
          if (!el) break
          el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" })
          await waitForSettle(el)
          if (!alive(token)) return
          await flyTo(spotNextTo(el.getBoundingClientRect()))
          highlight(el)
          await sleep(POINT_HOLD_MS)
          break
        }
        case "click": {
          const el = findTarget(action.target)
          if (!el) break
          await ensureVisible(el, smooth)
          if (!alive(token)) return
          const rect = el.getBoundingClientRect()
          await flyTo({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
          await press()
          el.click()
          await sleep(600)
          break
        }
        case "open_page": {
          if (presenting || action.path === window.location.pathname) break
          await navigateTo(action.path, token)
          return // nothing can follow a page change
        }
        case "start_tour": {
          if (presenting) break
          tour.current = { stops: action.stops, index: 0 }
          await goToStop(token)
          return
        }
      }
    }
  }

  /** Sends a turn in agent mode and returns the reply (null on any failure). */
  const turn = async (text: string, hidden: boolean) => {
    newStep() // the bubble shows "…" until this reply starts streaming
    setThinking(true)
    try {
      return await runChatTurn({ text, agent: true, hidden })
    } catch {
      return null // network error: the bubble keeps the last reply; the visitor can retry
    } finally {
      setThinking(false)
    }
  }

  /** A visitor message or a chat hand-over: do the actions, then rest unless a tour took over. */
  const act = async (actions: AgentAction[], token: number) => {
    await runActions(actions, token)
    if (alive(token) && !tour.current && !awaitingArrival.current) restSoon(token)
  }

  // ── Tours ──
  /** Opens the current tour stop; presentStop runs once it has loaded. */
  const goToStop = async (token: number) => {
    const stop = tour.current?.stops[tour.current.index]
    if (!stop || !alive(token)) return
    if (stop === window.location.pathname) {
      presentStop(token) // already here
      return
    }
    awaitingArrival.current = true
    newStep() // no stale text from the last stop while the next page loads
    await navigateTo(stop, token)
  }

  /** Asks the bot to present this stop, lets it point things out, then moves on. */
  const presentStop = async (token: number) => {
    const current = tour.current
    if (!current || !alive(token)) return
    const isLast = current.index === current.stops.length - 1
    setSpot(null)
    const result = await turn(
      `(site: tour stop ${current.index + 1} of ${current.stops.length}; the visitor is now on ${window.location.pathname}. ` +
        `Present this page: a line or two, and point_at or scroll_to one highlight. Don't open other pages.` +
        (isLast ? " This is the last stop: wrap up the tour in the same reply.)" : ")"),
      true,
    )
    if (!alive(token) || tour.current !== current) return
    if (result?.actions.length) await runActions(result.actions, token, true)
    if (!alive(token) || tour.current !== current) return
    if (isLast) {
      tour.current = null
      restSoon(token)
      return
    }
    await sleep(BETWEEN_STOPS_MS)
    if (!alive(token) || tour.current !== current) return
    current.index++
    goToStop(token)
  }

  // A tour stop's page has loaded: give it a moment to render, then present it
  useEffect(() => {
    if (!awaitingArrival.current) return
    awaitingArrival.current = false
    const token = runToken.current
    const timer = setTimeout(() => presentStop(token), ARRIVE_DELAY_MS)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  /** The visitor takes over: stop whatever the orb is doing, and any tour. */
  const interrupt = () => {
    runToken.current++
    tour.current = null
    awaitingArrival.current = false
  }

  // Let the chat window hand over actions (see startAgentRun). The handle goes
  // through a ref so it always calls this render's functions.
  const startRef = useRef<(actions: AgentAction[]) => void>(() => {})
  startRef.current = (actions) => {
    setVisible(true)
    setSpot(null)
    window.dispatchEvent(new Event(COLLAPSE_CHAT_EVENT))
    interrupt()
    act(actions, begin())
  }
  useEffect(() => {
    orbHandle = { start: (actions) => startRef.current(actions) }
    return () => {
      orbHandle = null
    }
  }, [])

  // ── Input ──
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    interrupt()
    setInput(e.target.value)
    // Capsule width follows the text. measureText on a canvas, using the
    // input's own font, gives the width without rendering anything.
    // 📖 Learn: CanvasRenderingContext2D.measureText
    const ctx = document.createElement("canvas").getContext("2d")
    if (ctx) {
      ctx.font = getComputedStyle(e.target).font
      setInputWidth(ctx.measureText(e.target.value).width)
    }
    // A little bounce per keystroke (the `scale` property, separate from position)
    if (!reducedMotion.current) {
      orbRef.current?.animate([{ scale: "1" }, { scale: "1.06" }, { scale: "1" }], { duration: 220, easing: "ease-out" })
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || thinking) return
    interrupt()
    const token = begin()
    setInput("")
    setInputWidth(0)
    const result = await turn(text, false)
    if (result?.actions.length && alive(token)) act(result.actions, token)
  }

  const close = () => {
    interrupt()
    setVisible(false)
    setSpot(null)
  }

  const expand = () => {
    close()
    window.dispatchEvent(new Event(EXPAND_CHAT_EVENT))
  }

  if (!visible) return null

  const at = spot ?? dock
  // The orb stretches into a capsule to fit what's typed
  const width = input ? clamp(inputWidth + 44, ORB_SIZE, Math.min(MAX_CAPSULE_WIDTH, window.innerWidth - 32)) : ORB_SIZE
  // Latest visible reply, shown in the bubble
  const reply = messages.slice(bubbleFrom).reverse().find((m) => m.role === "assistant" && !m.hidden)
  const bubbleText = thinking && !reply?.content ? "…" : toPlain(reply?.content ?? "")
  // Bubble above the orb, unless the orb is near the top; nudged sideways to stay on screen
  const bubbleBelow = at.y < 200
  const bubbleShift = clamp(at.x - BUBBLE_WIDTH / 2, 16, window.innerWidth - 16 - BUBBLE_WIDTH) - (at.x - BUBBLE_WIDTH / 2)

  return (
    // data-agent-ignore: never list the orb itself as something to point at
    <div data-agent-ignore className="agent-orb-layer">
      <div
        className="agent-orb-anchor"
        style={{ transform: `translate3d(${at.x}px, ${at.y}px, 0)` }}
      >
        {bubbleText && (
          <div
            className="agent-orb-bubble"
            data-below={bubbleBelow}
            style={{ width: BUBBLE_WIDTH, marginLeft: -BUBBLE_WIDTH / 2 + bubbleShift }}
            aria-live="polite"
          >
            <div className="agent-orb-bubble-text">{bubbleText}</div>
            <div className="agent-orb-bubble-actions">
              <button type="button" onClick={expand} aria-label="Open full chat">
                <Maximize2 className="w-3 h-3" />
              </button>
              <button type="button" onClick={close} aria-label="Close Richard">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <form
          ref={orbRef}
          className="agent-orb"
          data-thinking={thinking}
          style={{ width }}
          onSubmit={onSubmit}
          onClick={() => inputRef.current?.focus()}
        >
          <span className="agent-orb-glow" aria-hidden />
          <span className="agent-orb-core" aria-hidden />
          <input
            ref={inputRef}
            className="agent-orb-input"
            value={input}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") inputRef.current?.blur()
            }}
            aria-label="Ask Richard"
            autoComplete="off"
          />
          {/* The "type here" hint: a softly blinking caret, until there's text */}
          {!input && <span className="agent-orb-caret" aria-hidden />}
        </form>
      </div>
    </div>
  )
}

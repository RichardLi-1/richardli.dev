"use client"

/* ──────────────────────────────────────────────────────────────────────────
 * iOS-style "app launch" transition for opening projects (the iOS 11–18 feel),
 * with the card's banner morphing into the project page's banner.
 *
 * When a project card is tapped:
 *   1. The card hides (iOS hides the tapped icon too) and an exact copy of it,
 *      the "icon", appears in a full-screen overlay on top.
 *   2. Behind the icon, a "window" in the page colour (the launch screen)
 *      grows from the card to fill the screen, like an app opening. The
 *      homepage zooms in slightly behind it and a dim layer covers it.
 *   3. Phase 1: the icon flies toward where the banner will *probably* be on
 *      the project page. That page doesn't exist yet, so we predict.
 *   4. Once the dim fully covers the old page, we navigate (router.push).
 *   5. Phase 2: the new page mounts. We measure its real banner
 *      ([data-launch-target]) and redirect the icon there, starting from its
 *      current position *and velocity* so the motion has no kink. Meanwhile
 *      the launch screen fades away to reveal the page.
 *   6. The icon lands on the banner and dissolves into the real one.
 *
 * Motion stretch (Apple, WWDC18 "Designing Fluid Interfaces"): vertical
 * motion runs on a slightly quicker spring than horizontal, so shapes stretch
 * a little as they grow. That stretch puts extra motion information *between*
 * frames, which the eye reads as smoother motion ("it's not just about
 * framerate, it's what's in the frames"). Redirecting mid-flight while
 * keeping velocity is the same talk's "interruptible animation" principle.
 *
 * Performance: springs are simulated in JS once per phase and "baked" into
 * keyframes for the Web Animations API (one sample per 1/120 s). Everything
 * animates only transform/opacity, which browsers run on the GPU
 * compositor. So the motion stays smooth even while the main thread is busy
 * rendering the next page. Corner radii are deliberately *not* animated
 * (border-radius can't run on the compositor; animating it made every frame
 * wait on the main thread), so the whole animation is compositor-only.
 * 📖 Learn: Web Animations API (element.animate), compositor-only properties
 *
 * Skipped (plain navigation) for Reduce Motion, Save-Data / slow connections,
 * and low-memory or low-core devices. At runtime, if the first frames show
 * the device struggling, the animation jumps to its end and navigates.
 *
 * Styles: "App launch" section in app/globals.css.
 * Destination pages mark their banner box with `data-launch-target`.
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useLayoutEffect } from "react"
import { usePathname } from "next/navigation"

// ── Tuning ───────────────────────────────────────────────────────────────────
// Apple-style springs: `response` ≈ seconds to get there, `dampingRatio` 1 =
// no overshoot (lower = bouncier). `initialVelocity` (progress per second)
// launches the spring like a flick instead of releasing it from rest, so the
// window *leaps* out of the card and spends its time decelerating into place:
// front-loaded, quick-feeling motion (~41% of the way in the first 50ms,
// vs ~13% from rest). Critical damping keeps the fast start from overshooting
// (true while initialVelocity < 2π / response).
const HORIZONTAL_SPRING = { response: 0.4, dampingRatio: 1, initialVelocity: 10 } // x + width
const VERTICAL_SPRING = { response: 0.34, dampingRatio: 1, initialVelocity: 12 } // y + height; quicker → motion stretch
// Landing on the banner is a short hop, so it uses snappier springs (same stretch idea)
const LANDING_HORIZONTAL_SPRING = { response: 0.4, dampingRatio: 0.95 }
const LANDING_VERTICAL_SPRING = { response: 0.34, dampingRatio: 0.95 }
const LANDING_SETTLE_PX = 0.5 // stop the landing springs within half a pixel (the rest is invisible)
const DISSOLVE_WITHIN_PX = 1 // start dissolving into the real banner once the icon is this close
const SAMPLE_RATE = 120 // baked keyframes per second (matches 120Hz ProMotion screens)
const BACKDROP_ZOOM = 1.12 // how far the homepage zooms in behind the opening card
const COVER_AT = 0.6 // the dim fully hides the old page at this progress → safe to navigate (≈90ms in with the flick springs)
const REVEAL_MS = 300 // launch screen fade-out once the new page is there
const DISSOLVE_MS = 140 // icon → real banner crossfade after landing
const TRACK_MS = 1200 // keep following the banner if the new page's layout shifts, up to this long
const STABLE_FRAMES = 2 // the banner must hold a new position this many frames before the icon re-aims
const PAGE_TIMEOUT_MS = 4000 // give up waiting for a slow page and get out of the way
const JANK_WATCH_MS = 200 // watch this long for a struggling device...
const JANK_FRAME_MS = 34 //   ...and bail if frames average slower than this (~30fps)

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// ── Should we animate at all? ────────────────────────────────────────────────
function shouldAnimate(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false

  // Network Information + Device Memory APIs are Chromium-only; Safari and
  // Firefox leave them undefined, so these checks simply don't apply there
  // (the runtime frame check below still does).
  // 📖 Learn: navigator.connection (saveData, effectiveType), navigator.deviceMemory
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  const slowNetworks = ["slow-2g", "2g", "3g"]
  if (nav.connection?.effectiveType && slowNetworks.includes(nav.connection.effectiveType)) return false
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false // in GB
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false

  return true
}

// ── Spring baking ────────────────────────────────────────────────────────────
type SpringConfig = { response: number; dampingRatio: number }

/**
 * Simulates a spring from `from` to `to`, starting with `velocity` (units/s),
 * and returns its value once per frame (SAMPLE_RATE per second) until it
 * settles within `epsilon`.
 * 📖 Learn: damped harmonic oscillator; SwiftUI's spring(response:dampingFraction:)
 */
function simulateSpring(
  { response, dampingRatio }: SpringConfig,
  from: number,
  to: number,
  velocity = 0,
  epsilon = 0.001,
): number[] {
  // Convert Apple's designer-friendly parameters into physics (mass = 1)
  const stiffness = Math.pow((2 * Math.PI) / response, 2)
  const damping = (4 * Math.PI * dampingRatio) / response

  const subSteps = 8 // several small physics steps per frame keep the simulation accurate
  const h = 1 / SAMPLE_RATE / subSteps
  let x = from
  let v = velocity
  const samples = [from]
  const maxFrames = SAMPLE_RATE * 2 // hard cap: 2 seconds
  for (let frame = 0; frame < maxFrames; frame++) {
    for (let i = 0; i < subSteps; i++) {
      const force = stiffness * (to - x) - damping * v
      v += force * h
      x += v * h
    }
    samples.push(x)
    if (Math.abs(to - x) < epsilon && Math.abs(v) < epsilon * 10) break
  }
  samples[samples.length - 1] = to // land exactly on the target
  return samples
}

/** Reads sample `i`, holding the last value once a shorter spring has settled. */
const sampleAt = (samples: number[], i: number) => samples[Math.min(i, samples.length - 1)]

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

/** 0 before `start`, 1 after `end`, and an S-curve in between. */
function smoothstep(start: number, end: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - start) / (end - start)))
  return x * x * (3 - 2 * x)
}

const framesToMs = (frames: number) => (frames / SAMPLE_RATE) * 1000

// ── Icon keyframes ───────────────────────────────────────────────────────────
/**
 * Turns a path of visible boxes into keyframes for the icon's three layers:
 *   box     → a card-sized element scaled to each box (transform, GPU)
 *   content → the card copy inside, counter-scaled so it stays aspect-filled
 *             and is never squashed when the box changes shape (GPU)
 */
function iconKeyframes(path: Rect[], card: { w: number; h: number }) {
  const box: Keyframe[] = []
  const content: Keyframe[] = []
  path.forEach((rect, i) => {
    const offset = path.length === 1 ? 1 : i / (path.length - 1)
    const sx = rect.w / card.w
    const sy = rect.h / card.h
    box.push({ offset, transform: `translate(${rect.x}px, ${rect.y}px) scale(${sx}, ${sy})` })
    // `fill` = the uniform scale that covers the box; dividing by the box's
    // own scale cancels it out (counter-scaling).
    const fill = Math.max(rect.w / card.w, rect.h / card.h)
    const offX = (rect.w - card.w * fill) / 2
    const offY = (rect.h - card.h * fill) / 2
    content.push({ offset, transform: `translate(${offX / sx}px, ${offY / sy}px) scale(${fill / sx}, ${fill / sy})` })
  })
  return { box, content }
}

// ── Predicting the banner ────────────────────────────────────────────────────
// The project page doesn't exist until navigation finishes (partway through
// the animation), but the icon has to start flying *now*. If it flies to a
// guess and the real banner turns out elsewhere, it visibly re-aims. So we
// predict as exactly as we can, in this order:
//   1. A real measurement from a previous launch (same page + window width),
//      remembered in localStorage across visits.
//   2. The project's `banner` hint from mainProjects.ts (aspect ratio and top
//      offset per layout); x and width come from the shared page column.
//   3. A generic guess (16:9, typical offsets).
// If the prediction is still off, phase 2 redirects smoothly (see reveal).

/** Where a project page's banner sits. Measured values; see mainProjects.ts. */
export interface BannerHint {
  aspect: number // width / height
  top: { mobile: number; desktop: number } // px from the top of the window (layout switches at 768px)
}

const STORAGE_KEY = "app-launch-targets-v1"
const MAX_REMEMBERED = 40 // window widths vary on desktop; keep the list small
const targetKey = (href: string, vw: number) => `${href}@${vw}`

/** Measured banner positions, keyed by page + window width. */
function readMeasured(): Record<string, Rect> {
  // localStorage can throw (private mode, blocked storage), so treat any
  // failure as "nothing remembered".
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, Rect>
  } catch {
    return {}
  }
}

function rememberMeasured(href: string, vw: number, rect: Rect) {
  try {
    let all = readMeasured()
    if (Object.keys(all).length >= MAX_REMEMBERED) all = {} // simplest cap: start over
    all[targetKey(href, vw)] = rect
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Not remembering is fine; the hint still gets close
  }
}

function predictTarget(href: string, vw: number, hint?: BannerHint): Rect {
  const measured = readMeasured()[targetKey(href, vw)]
  if (measured) return measured

  // Every project page centres the banner in the same column:
  // max-w-3xl (768px) with --page-gutter padding on each side
  const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--page-gutter")) || 24
  const isMobile = vw < 768
  const width = Math.min(vw, 768) - 2 * gutter
  const x = (vw - width) / 2
  if (hint) {
    return { x, y: isMobile ? hint.top.mobile : hint.top.desktop, w: width, h: width / hint.aspect }
  }
  return { x, y: isMobile ? 150 : 250, w: width, h: (width * 9) / 16 }
}

// ── Copying the card ─────────────────────────────────────────────────────────
/**
 * A static copy of the card for the overlay. cloneNode copies the DOM but not
 * what's *drawn* in canvases (the AMD WebGL banner) or videos, so those are
 * replaced by a 2D canvas holding their current frame.
 */
function cloneCard(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement

  // Hover-only controls (e.g. "Click here to use!") don't belong in the icon
  clone.querySelectorAll("button").forEach((button) => button.remove())
  // Duplicate ids would clash with the real card that's still in the page
  clone.removeAttribute("id")
  clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"))
  // The copies are already in the browser's memory cache. "eager" + "sync"
  // makes the browser draw them in the very first frame instead of showing
  // an empty box while it decodes them in the background.
  // 📖 Learn: <img loading> and <img decoding> attributes
  clone.querySelectorAll("img").forEach((img) => {
    img.loading = "eager"
    img.decoding = "sync"
  })

  // Fill the icon box exactly, and drop styles the iPad cursor / page layout
  // put on the original (lift translate/scale/shadow, flex sizing, rounding).
  Object.assign(clone.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    margin: "0",
    flex: "none",
    aspectRatio: "auto",
    translate: "none",
    scale: "none",
    boxShadow: "none",
    transition: "none",
    borderRadius: "0",
    visibility: "visible",
  })

  const originals = source.querySelectorAll<HTMLCanvasElement | HTMLVideoElement>("canvas, video")
  const copies = clone.querySelectorAll("canvas, video")
  originals.forEach((original, i) => {
    const copy = copies[i]
    if (!copy) return
    const frame = document.createElement("canvas")
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    frame.width = Math.max(1, Math.round(original.offsetWidth * dpr))
    frame.height = Math.max(1, Math.round(original.offsetHeight * dpr))
    frame.className = copy.getAttribute("class") ?? ""
    frame.style.cssText = (copy as HTMLElement).style.cssText
    try {
      // WebGL canvases clear their pixels once a frame is shown. Ask the
      // canvas to draw again right now (AmdAtmosphere listens for this),
      // then copy it within the same task, while the pixels still exist.
      if (original instanceof HTMLCanvasElement) original.dispatchEvent(new Event("app-launch:snapshot"))
      drawFrame(frame, original)
    } catch {
      // A WebGL canvas may already have cleared its buffer; the card's own
      // background shows through instead, which is fine for a moving icon.
    }
    copy.replaceWith(frame)
  })

  return clone
}

/** Draws a video/canvas into `target` the way object-fit cover/contain would. */
function drawFrame(target: HTMLCanvasElement, source: HTMLCanvasElement | HTMLVideoElement) {
  const ctx = target.getContext("2d")
  if (!ctx) return
  const srcW = source instanceof HTMLVideoElement ? source.videoWidth : source.width
  const srcH = source instanceof HTMLVideoElement ? source.videoHeight : source.height
  if (!srcW || !srcH) return
  const fit = getComputedStyle(source).objectFit
  const scale =
    fit === "contain"
      ? Math.min(target.width / srcW, target.height / srcH)
      : Math.max(target.width / srcW, target.height / srcH)
  const w = srcW * scale
  const h = srcH * scale
  ctx.drawImage(source, (target.width - w) / 2, (target.height - h) / 2, w, h)
}

// ── The running launch ───────────────────────────────────────────────────────
// Module-level, not React state: nothing here should cause a re-render.

/** The flying icon, shared by opening (card → banner) and closing (banner → card). */
interface Flight {
  iconBox: HTMLDivElement
  iconContent: HTMLDivElement
  card: { w: number; h: number } // the icon's natural (unscaled) size
  iconPath: Rect[] // the current flight's path, one box per baked frame (for reading velocity)
  iconAnimations: Animation[] // box, content
  iconGoal: Rect // where the icon is currently flying to
}

interface Launch extends Flight {
  href: string
  overlay: HTMLDivElement
  dim: HTMLDivElement
  win: HTMLDivElement
  sceneAnimations: Animation[] // window, dim, backdrop
  source: HTMLElement
  target: HTMLElement | null // the destination banner, once found
  backdrop: HTMLElement | null
  savedBackdropOrigin: string
  startPath: string
  navigate: () => void
  navigated: boolean
  degraded: boolean // jank bail-out happened: skip the fancy landing
  revealing: boolean
  timers: number[]
  stopInteraction: (() => void) | null // removes the "user took over" listeners
}
let active: Launch | null = null

/**
 * True while an open (card → page) or close (page → card) transition runs.
 * The page being arrived at checks this on mount:
 * - AnimatedPage skips its whole-page fade (the overlay's fade replaces it,
 *   and a half-transparent destination would flash when the icon dissolves).
 * - StaggeredContent skips only the block holding the destination (see
 *   instantBlockSelector); every other block still staggers in around it.
 */
export function isAppLaunching() {
  return active !== null || closing !== null
}

/** True while closing back to the homepage (AnimatedPage must not reset its scroll). */
export function isAppClosing() {
  return closing !== null
}

/**
 * Which element the icon is landing on right now, so the StaggeredContent
 * block containing it can appear instantly instead of sliding under it:
 * the banner when opening a project, the cards when closing back home.
 */
export function instantBlockSelector(): string | null {
  if (active) return "[data-launch-target]"
  if (closing) return "[data-launch-source]"
  return null
}

interface LaunchOptions {
  href: string
  /** The card's visual box (image area) that becomes the icon */
  source: HTMLElement
  /** Element that zooms in behind the opening card (e.g. the homepage <main>) */
  backdrop?: HTMLElement | null
  push: (href: string) => void
  prefetch?: (href: string) => void
  /** Where the destination page's banner sits, so the icon can fly straight there */
  bannerHint?: BannerHint
}

/**
 * Starts the launch animation and handles navigation itself.
 * Returns false when it decided not to animate: the caller should then let
 * the link navigate normally.
 */
export function launchApp({ href, source, backdrop = null, push, prefetch, bannerHint }: LaunchOptions): boolean {
  if (active) return true // a launch is already running: swallow the extra tap
  if (!shouldAnimate()) return false

  const cardRect = source.getBoundingClientRect()
  if (cardRect.width === 0 || cardRect.height === 0) return false

  // Start fetching the page now, in parallel with the animation
  prefetch?.(href)

  const vw = window.innerWidth
  const vh = window.innerHeight
  const card = { w: cardRect.width, h: cardRect.height }
  const cardRadius = parseFloat(getComputedStyle(source).borderTopLeftRadius) || 16
  const start: Rect = { x: cardRect.left, y: cardRect.top, w: cardRect.width, h: cardRect.height }
  const predicted = predictTarget(href, vw, bannerHint)

  // Remember where the card was, so closing the project can fly back into it
  const shell = document.querySelector<HTMLElement>(".app-scroll-shell")
  homeReturn = { href, scrollTop: shell?.scrollTop ?? 0, card: start, cardRadius, vw }

  // ── Build the overlay: dim → window (launch screen) → icon ──
  const overlay = document.createElement("div")
  overlay.className = "app-launch"
  const dim = document.createElement("div")
  dim.className = "app-launch-dim"
  const win = document.createElement("div")
  win.className = "app-launch-window"
  win.style.width = `${vw}px`
  win.style.height = `${vh}px`
  const iconBox = document.createElement("div")
  iconBox.className = "app-launch-icon"
  iconBox.style.width = `${card.w}px`
  iconBox.style.height = `${card.h}px`
  const iconContent = document.createElement("div")
  iconContent.className = "app-launch-icon-content"
  iconContent.style.width = `${card.w}px`
  iconContent.style.height = `${card.h}px`
  iconContent.appendChild(cloneCard(source))
  iconBox.appendChild(iconContent)
  overlay.append(dim, win, iconBox)
  document.body.appendChild(overlay)

  // ── Bake phase 1 ──
  const horizontal = simulateSpring(HORIZONTAL_SPRING, 0, 1, HORIZONTAL_SPRING.initialVelocity)
  const vertical = simulateSpring(VERTICAL_SPRING, 0, 1, VERTICAL_SPRING.initialVelocity)
  const count = Math.max(horizontal.length, vertical.length)
  const duration = framesToMs(count - 1)

  const winFrames: Keyframe[] = []
  const dimFrames: Keyframe[] = []
  const backdropFrames: Keyframe[] = []
  const iconPath: Rect[] = []
  let coverFrame = count - 1

  for (let i = 0; i < count; i++) {
    const offset = i / (count - 1)
    const px = sampleAt(horizontal, i) // 0 → 1 progress on each axis
    const py = sampleAt(vertical, i)

    // Window: from the card's box to the full screen. The element is
    // screen-sized, so it's scaled down to that box (transform-origin 0 0).
    const left = lerp(start.x, 0, px)
    const top = lerp(start.y, 0, py)
    const sx = lerp(start.w, vw, px) / vw
    const sy = lerp(start.h, vh, py) / vh
    winFrames.push({ offset, transform: `translate(${left}px, ${top}px) scale(${sx}, ${sy})` })

    // Icon: from the card toward the predicted banner, on the same springs
    iconPath.push({
      x: lerp(start.x, predicted.x, px),
      y: lerp(start.y, predicted.y, py),
      w: lerp(start.w, predicted.w, px),
      h: lerp(start.h, predicted.h, py),
    })

    dimFrames.push({ offset, opacity: smoothstep(0, COVER_AT, px) })
    backdropFrames.push({ offset, transform: `scale(${lerp(1, BACKDROP_ZOOM, px)})` })

    if (px >= COVER_AT && coverFrame === count - 1) coverFrame = i
  }
  const iconFrames = iconKeyframes(iconPath, card)

  // Corners are static (see header): set once, never animated.
  // Icon: the card's radius. It scales almost uniformly (card → banner), so
  // its corners stay round; the final dissolve hides any difference from the
  // banner's own radius.
  iconBox.style.borderRadius = `${cardRadius}px`
  // Window: a screen-sized box scaled down to the card, so give it an
  // elliptical radius in its own pixels that comes out exactly round at the
  // starting size. It stretches as the window grows, but the dim covers
  // everything around it within ~90ms.
  win.style.borderRadius = `${cardRadius / (start.w / vw)}px / ${cardRadius / (start.h / vh)}px`

  const launch: Launch = {
    href,
    overlay,
    dim,
    win,
    iconBox,
    iconContent,
    card,
    iconPath,
    iconGoal: predicted,
    iconAnimations: [],
    sceneAnimations: [],
    source,
    target: null,
    backdrop,
    savedBackdropOrigin: backdrop?.style.transformOrigin ?? "",
    startPath: window.location.pathname,
    navigated: false,
    degraded: false,
    revealing: false,
    timers: [],
    stopInteraction: null,
    navigate: () => {
      if (launch.navigated) return
      launch.navigated = true
      push(href)
      // A slow page shouldn't trap the user behind the launch screen
      launch.timers.push(window.setTimeout(() => reveal(launch), PAGE_TIMEOUT_MS))
    },
  }
  active = launch

  // ── Start right now, in the same frame as the tap ──
  // (No waiting on img.decode(): its promise always resolves a few frames
  // later, which showed up as ~45ms of dropped frames before any motion.
  // cloneCard marks the copies decoding="sync" instead; they're already in
  // memory, so the browser just draws them in the first frame.)
  {
    source.style.visibility = "hidden" // like iOS, the tapped icon leaves its spot
    overlay.style.visibility = "visible"
    if (backdrop) {
      // Zoom towards the tapped card
      const b = backdrop.getBoundingClientRect()
      backdrop.style.transformOrigin = `${start.x + start.w / 2 - b.left}px ${start.y + start.h / 2 - b.top}px`
    }

    // `linear` between baked samples: the spring shape is already in the keyframes
    const timing: KeyframeAnimationOptions = { duration, easing: "linear", fill: "forwards" }
    launch.sceneAnimations.push(
      win.animate(winFrames, timing),
      dim.animate(dimFrames, timing),
    )
    if (backdrop) launch.sceneAnimations.push(backdrop.animate(backdropFrames, timing))
    launch.iconAnimations = [
      iconBox.animate(iconFrames.box, timing),
      iconContent.animate(iconFrames.content, timing),
    ]

    // Navigate as soon as the old page is fully covered
    launch.timers.push(window.setTimeout(launch.navigate, framesToMs(coverFrame)))

    watchForJank(launch)
  }

  return true
}

/**
 * Compositor animations keep running even if JS is slow, but if the *device*
 * is struggling, requestAnimationFrame slows down too. If the first frames
 * average below ~30fps, jump to the end and navigate right away.
 * 📖 Learn: requestAnimationFrame timestamps as a frame-rate probe
 */
function watchForJank(launch: Launch) {
  let start = 0
  let frames = 0
  const tick = (now: number) => {
    if (active !== launch || launch.revealing) return
    if (start === 0) {
      start = now // skip the first frame: it includes our own setup work
    } else {
      frames++
    }
    if (start === 0 || now - start < JANK_WATCH_MS) {
      requestAnimationFrame(tick)
      return
    }
    const averageFrame = (now - start) / frames
    if (averageFrame > JANK_FRAME_MS) {
      launch.degraded = true
      ;[...launch.sceneAnimations, ...launch.iconAnimations].forEach((animation) => animation.finish()) // jump to the end state
      launch.navigate()
    }
  }
  requestAnimationFrame(tick)
}

/** Where the icon is right now, and how fast each edge is moving (px/s). */
function iconStateNow(launch: Flight): { rect: Rect; velocity: Rect } {
  const path = launch.iconPath
  const last = path.length - 1
  const elapsed = Number(launch.iconAnimations[0]?.currentTime ?? 0) // ms
  const frame = (elapsed / 1000) * SAMPLE_RATE
  if (frame >= last) return { rect: path[last], velocity: { x: 0, y: 0, w: 0, h: 0 } }
  const i = Math.floor(frame)
  const t = frame - i
  const a = path[i]
  const b = path[i + 1]
  return {
    rect: { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) },
    // change per frame × frames per second = px per second
    velocity: {
      x: (b.x - a.x) * SAMPLE_RATE,
      y: (b.y - a.y) * SAMPLE_RATE,
      w: (b.w - a.w) * SAMPLE_RATE,
      h: (b.h - a.h) * SAMPLE_RATE,
    },
  }
}

/**
 * Phase 2: redirect the icon from wherever it is now to the real banner,
 * carrying its current velocity into the new springs (no kink in the motion).
 * Also used again if the banner moves while the icon is still flying.
 */
function flyIconTo(launch: Flight, target: Rect): Animation {
  const { rect, velocity } = iconStateNow(launch)
  const settle = LANDING_SETTLE_PX
  const xs = simulateSpring(LANDING_HORIZONTAL_SPRING, rect.x, target.x, velocity.x, settle)
  const ws = simulateSpring(LANDING_HORIZONTAL_SPRING, rect.w, target.w, velocity.w, settle)
  const ys = simulateSpring(LANDING_VERTICAL_SPRING, rect.y, target.y, velocity.y, settle)
  const hs = simulateSpring(LANDING_VERTICAL_SPRING, rect.h, target.h, velocity.h, settle)
  const count = Math.max(xs.length, ws.length, ys.length, hs.length)

  const path: Rect[] = []
  for (let i = 0; i < count; i++) {
    path.push({ x: sampleAt(xs, i), y: sampleAt(ys, i), w: sampleAt(ws, i), h: sampleAt(hs, i) })
  }
  const frames = iconKeyframes(path, launch.card)
  launch.iconPath = path // so the *next* redirect can read position and velocity from this flight
  launch.iconGoal = target

  // Replace the current flight. cancel() and the new animate() happen in the
  // same task, so no frame is ever drawn in between.
  launch.iconAnimations.forEach((animation) => animation.cancel())
  const timing: KeyframeAnimationOptions = { duration: framesToMs(count - 1), easing: "linear", fill: "forwards" }
  launch.iconAnimations = [
    launch.iconBox.animate(frames.box, timing),
    launch.iconContent.animate(frames.content, timing),
  ]
  return launch.iconAnimations[0]
}

/**
 * The new page is there (or we've given up waiting): fade the launch screen
 * away and land the icon on the real banner, if there is one.
 */
function reveal(launch: Launch) {
  if (launch.revealing || active !== launch) return
  launch.revealing = true
  // One frame: let the new page lay out and paint once under the overlay.
  // Any layout shift after that is handled by tracking the banner below.
  requestAnimationFrame(() => {
    if (active !== launch) return
    // The page is being uncovered: let taps and scrolls reach it right away
    // instead of waiting for the icon to finish landing
    launch.overlay.style.pointerEvents = "none"
    // ...but if the user then scrolls/taps, the page moves under the icon, which
    // lives in a fixed overlay and would look stuck in place. They've taken
    // over, so end the landing right away (like interrupting an iOS animation).
    launch.stopInteraction = onUserInteraction(() => cleanup(launch))
    // If we're giving up on a slow page, put the homepage back to normal first
    cancelBackdrop(launch)

    const arrived = window.location.pathname !== launch.startPath
    const targetEl = arrived && !launch.degraded ? document.querySelector<HTMLElement>("[data-launch-target]") : null
    const targetRect = targetEl?.getBoundingClientRect()

    if (!targetEl || !targetRect || targetRect.width === 0) {
      // No banner to land on: fade the whole overlay away
      fadeOut(launch.overlay, REVEAL_MS).then(() => cleanup(launch))
      return
    }

    launch.target = targetEl
    // The icon stands in for the banner until it lands. Hidden with opacity,
    // not visibility: an invisible-but-transparent element is still drawn, so
    // its image gets decoded and uploaded to the GPU in the background.
    // With visibility: hidden that work happened all at once when it was
    // shown again, freezing one frame for ~230ms (seen in a trace).
    targetEl.style.opacity = "0"
    warmMedia(targetEl)
    fadeOut(launch.dim, REVEAL_MS)
    fadeOut(launch.win, REVEAL_MS)

    // Track the banner every frame until the icon lands.
    // - If the prediction was right, the icon just finishes its first flight:
    //   no redirect, so the motion is one continuous spring.
    // - If the banner is somewhere else, redirect the icon there, carrying
    //   its velocity. But only once the banner has *stayed* in its new spot
    //   for STABLE_FRAMES frames: a fresh page often flickers for a frame
    //   (e.g. it renders its desktop layout once before switching to mobile),
    //   and chasing that would make the icon swerve and come back.
    // - Stop chasing after TRACK_MS in case something never stops moving.
    let candidate: Rect | null = null
    let stableFrames = 0
    const trackUntil = performance.now() + TRACK_MS
    const track = (now: number) => {
      if (active !== launch) return
      const latest = toRect(targetEl.getBoundingClientRect())
      const goal = launch.iconGoal
      if (distance(latest, goal) <= 0.5) {
        candidate = null // the banner is where the icon is already heading
      } else if (now < trackUntil) {
        if (candidate && distance(latest, candidate) <= 0.5) {
          stableFrames++
        } else {
          candidate = latest
          stableFrames = 1
        }
        if (stableFrames >= STABLE_FRAMES) {
          flyIconTo(launch, latest)
          candidate = null
        }
      }
      // Close enough (and the banner isn't mid-move)? Show the real banner
      // underneath and dissolve the icon into it while it finishes its last
      // (invisible) fraction of a pixel.
      const landed = launch.iconAnimations[0]?.playState === "finished"
      const iconClose = distance(iconStateNow(launch).rect, launch.iconGoal) <= DISSOLVE_WITHIN_PX
      const bannerSettled = distance(latest, launch.iconGoal) <= DISSOLVE_WITHIN_PX
      // Also wait until the banner's picture can be drawn (see mediaReady)
      const ready = (landed || iconClose) && bannerSettled && mediaReady(targetEl)
      if (!ready && now < trackUntil) {
        requestAnimationFrame(track)
        return
      }
      // Remember where the banner really was, so next time the very first
      // flight goes straight there
      rememberMeasured(launch.href, window.innerWidth, latest)
      targetEl.style.opacity = ""
      fadeOut(launch.iconBox, DISSOLVE_MS).then(() => cleanup(launch))
    }
    requestAnimationFrame(track)
  })
}

const toRect = (r: DOMRect): Rect => ({ x: r.left, y: r.top, w: r.width, h: r.height })

/**
 * True once every image and video inside `el` can actually be drawn.
 * The icon only dissolves into the real banner/card once this is true:
 * otherwise it would fade over an empty or still-fading box for a frame or
 * two (the picture "darkens then lightens"). E.g. the homepage cards fade
 * their image in over 0.3s after it loads, behind a dark loading shimmer.
 */
function mediaReady(el: HTMLElement): boolean {
  for (const img of Array.from(el.querySelectorAll("img"))) {
    if (!img.complete) return false // still loading
    if (img.naturalWidth === 0) continue // broken or empty src: it will never change, so don't wait
    if (isFading(img)) return false
  }
  for (const video of Array.from(el.querySelectorAll("video"))) {
    if (video.readyState < 2) return false // HAVE_CURRENT_DATA: a frame exists to show
    if (isFading(video)) return false
  }
  return true
}

/**
 * Not shown yet (opacity 0, e.g. waiting for its onLoad) or mid fade-in.
 * Deliberately not "opacity < 1": some images are styled semi-transparent
 * on purpose (the AMD logo sits at 0.9).
 * getAnimations() includes running CSS transitions, not just Web Animations.
 * 📖 Learn: Element.getAnimations()
 */
function isFading(el: HTMLElement): boolean {
  if (parseFloat(getComputedStyle(el).opacity) === 0) return true
  return el.getAnimations().some((animation) => animation.playState === "running")
}

/**
 * Calls `onInteract` the first time the user scrolls, swipes, clicks or uses
 * the keyboard, and returns a function that removes the listeners.
 * Capture phase + passive: we only observe, never block or delay the input.
 * 📖 Learn: passive event listeners
 */
function onUserInteraction(onInteract: () => void): () => void {
  const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const
  const stop = () => events.forEach((type) => window.removeEventListener(type, handler, true))
  const handler = () => {
    stop()
    onInteract()
  }
  events.forEach((type) => window.addEventListener(type, handler, { capture: true, passive: true }))
  return stop
}

/** Starts decoding `el`'s images now, so they're ready by the time the icon lands. */
function warmMedia(el: HTMLElement) {
  el.querySelectorAll("img").forEach((img) => img.decode().catch(() => {}))
}

/** The largest difference between two boxes' edges, in px. */
const distance = (a: Rect, b: Rect) =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h))

/** Fades an element from its current opacity to 0 (GPU). Resolves when done. */
function fadeOut(el: HTMLElement, duration: number): Promise<unknown> {
  const from = getComputedStyle(el).opacity
  return el
    .animate([{ opacity: from }, { opacity: 0 }], { duration, easing: "ease-out", fill: "forwards" })
    .finished.catch(() => {})
}

function cancelBackdrop(launch: Launch) {
  if (!launch.backdrop) return
  launch.sceneAnimations.forEach((animation) => {
    const target = (animation.effect as KeyframeEffect | null)?.target
    if (target === launch.backdrop) animation.cancel()
  })
  launch.backdrop.style.transformOrigin = launch.savedBackdropOrigin
}

function cleanup(launch: Launch) {
  if (active !== launch) return
  launch.timers.forEach((timer) => clearTimeout(timer))
  launch.stopInteraction?.()
  cancelBackdrop(launch)
  launch.source.style.visibility = ""
  if (launch.target) launch.target.style.opacity = ""
  launch.overlay.remove()
  active = null
}

/** Called by AppLaunchRouteWatcher whenever the route changes. */
function notifyRouteChange(pathname: string) {
  if (closing && pathname === "/") arriveHome(closing)
  const launch = active
  if (!launch || pathname === launch.startPath) return
  // The old page is gone; its zoom animation went with it
  cancelBackdrop(launch)
  reveal(launch)
}

// ── Closing: case study → back into its homepage card ───────────────────────
// The reverse of opening, like closing an iOS app: the banner flies back and
// shrinks into the card it came from while the homepage zooms back out.

/** Recorded when a project opens, so it can close back into the same card. */
interface HomeReturn {
  href: string // the project page, e.g. "/boink"
  scrollTop: number // homepage scroll position at the moment of the tap
  card: Rect // where the card was on screen (same again once scroll is restored)
  cardRadius: number
  vw: number // window width at the time (if it changed, the layout did too)
}
let homeReturn: HomeReturn | null = null

interface Close extends Flight {
  record: HomeReturn
  overlay: HTMLDivElement
  dim: HTMLDivElement
  win: HTMLDivElement
  cardEl: HTMLElement | null // the real card on the homepage, once it exists
  backdrop: HTMLElement | null
  arrived: boolean
  timers: number[]
  stopInteraction: (() => void) | null
}
let closing: Close | null = null

/** The route React last rendered (lags behind location during a popstate). */
let renderedPath = ""

/**
 * Starts the close animation if we're leaving the project page that was
 * opened from a homepage card. Never blocks navigation: the link (or the
 * browser's Back) navigates as usual while this plays over the top.
 */
function startClose(fromPath: string) {
  const record = homeReturn
  if (active || closing || !record || fromPath !== record.href) return
  if (window.innerWidth !== record.vw || !shouldAnimate()) return
  const banner = document.querySelector<HTMLElement>("[data-launch-target]")
  const bannerRect = banner?.getBoundingClientRect()
  if (!banner || !bannerRect || bannerRect.width === 0) return

  const vw = window.innerWidth
  const vh = window.innerHeight
  const start: Rect = toRect(bannerRect)
  const card = { w: start.w, h: start.h } // the icon starts as the banner
  const goal = record.card

  // Overlay: an opaque dim hides the case study at once (the homepage isn't
  // there yet), the page-coloured window shrinks toward the card, and a copy
  // of the banner flies home on top.
  const overlay = document.createElement("div")
  overlay.className = "app-launch"
  const dim = document.createElement("div")
  dim.className = "app-launch-dim"
  dim.style.opacity = "1"
  const win = document.createElement("div")
  win.className = "app-launch-window"
  win.style.width = `${vw}px`
  win.style.height = `${vh}px`
  // Elliptical radius in the window's own pixels that comes out exactly
  // round at its *final* size (the card), where it's most visible
  win.style.borderRadius = `${record.cardRadius / (goal.w / vw)}px / ${record.cardRadius / (goal.h / vh)}px`
  const iconBox = document.createElement("div")
  iconBox.className = "app-launch-icon"
  iconBox.style.width = `${card.w}px`
  iconBox.style.height = `${card.h}px`
  iconBox.style.borderRadius = `${record.cardRadius}px`
  const iconContent = document.createElement("div")
  iconContent.className = "app-launch-icon-content"
  iconContent.style.width = `${card.w}px`
  iconContent.style.height = `${card.h}px`
  iconContent.appendChild(cloneCard(banner))
  iconBox.appendChild(iconContent)
  overlay.append(dim, win, iconBox)
  document.body.appendChild(overlay)

  // Bake: same flick springs as opening, run in reverse (screen → card)
  const horizontal = simulateSpring(HORIZONTAL_SPRING, 0, 1, HORIZONTAL_SPRING.initialVelocity)
  const vertical = simulateSpring(VERTICAL_SPRING, 0, 1, VERTICAL_SPRING.initialVelocity)
  const count = Math.max(horizontal.length, vertical.length)
  const winFrames: Keyframe[] = []
  const iconPath: Rect[] = []
  for (let i = 0; i < count; i++) {
    const offset = i / (count - 1)
    const px = sampleAt(horizontal, i)
    const py = sampleAt(vertical, i)
    const sx = lerp(vw, goal.w, px) / vw
    const sy = lerp(vh, goal.h, py) / vh
    winFrames.push({
      offset,
      transform: `translate(${lerp(0, goal.x, px)}px, ${lerp(0, goal.y, py)}px) scale(${sx}, ${sy})`,
      // Fade out over the last stretch so no page-coloured box is left over the card
      opacity: 1 - smoothstep(0.55, 1, px),
    })
    iconPath.push({
      x: lerp(start.x, goal.x, px),
      y: lerp(start.y, goal.y, py),
      w: lerp(start.w, goal.w, px),
      h: lerp(start.h, goal.h, py),
    })
  }
  const iconFrames = iconKeyframes(iconPath, card)
  const timing: KeyframeAnimationOptions = { duration: framesToMs(count - 1), easing: "linear", fill: "forwards" }
  win.animate(winFrames, timing)

  const close: Close = {
    record,
    overlay,
    dim,
    win,
    iconBox,
    iconContent,
    card,
    iconPath,
    iconGoal: goal,
    iconAnimations: [iconBox.animate(iconFrames.box, timing), iconContent.animate(iconFrames.content, timing)],
    cardEl: null,
    backdrop: null,
    arrived: false,
    timers: [],
    stopInteraction: null,
  }
  closing = close
  // If the homepage never shows up (offline, error), get out of the way
  close.timers.push(window.setTimeout(() => finishClose(close), PAGE_TIMEOUT_MS))
}

/**
 * The homepage has just been committed (this runs before it's painted):
 * restore the scroll position, hide the real card, and start revealing.
 */
function arriveHome(close: Close) {
  if (close.arrived) return
  close.arrived = true
  const { record } = close
  const shell = document.querySelector<HTMLElement>(".app-scroll-shell")
  const restoreScroll = () => shell?.scrollTo(0, record.scrollTop)
  restoreScroll()
  // The homepage switches to its mobile layout a frame after mounting, which
  // changes its height; restore again once that has happened
  requestAnimationFrame(() => requestAnimationFrame(restoreScroll))

  close.cardEl = document.querySelector<HTMLElement>(`a[href="${record.href}"] [data-launch-source]`)
  // The icon stands in for the card until it lands (opacity, not visibility,
  // so the card's image is decoded in the background; see reveal)
  if (close.cardEl) {
    close.cardEl.style.opacity = "0"
    warmMedia(close.cardEl)
  }

  // Reveal the homepage: dim fades away while the page zooms back out from
  // slightly enlarged, centred on the card (the reverse of the opening zoom)
  close.backdrop = document.querySelector<HTMLElement>(".app-scroll-shell main")
  if (close.backdrop) {
    const b = close.backdrop.getBoundingClientRect()
    const c = record.card
    close.backdrop.style.transformOrigin = `${c.x + c.w / 2 - b.left}px ${c.y + c.h / 2 - b.top}px`
    close.backdrop.animate([{ transform: `scale(${BACKDROP_ZOOM})` }, { transform: "scale(1)" }], {
      duration: 450,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", // fast start, soft landing
    })
  }
  fadeOut(close.dim, REVEAL_MS)
  close.overlay.style.pointerEvents = "none" // the homepage is usable right away
  // If the user scrolls/taps before the icon has landed, end it right away
  // (see the same rule in reveal) instead of leaving it stuck over the page
  close.stopInteraction = onUserInteraction(() => endClose(close))

  // Track the card until the icon lands, re-aiming if it isn't where we
  // remembered (same stable-frames rule as opening)
  let candidate: Rect | null = null
  let stableFrames = 0
  const trackUntil = performance.now() + TRACK_MS
  const track = (now: number) => {
    if (closing !== close) return
    const cardEl = close.cardEl
    if (!cardEl) {
      finishClose(close) // no card to land on (e.g. project now hidden): just fade away
      return
    }
    const latest = toRect(cardEl.getBoundingClientRect())
    if (distance(latest, close.iconGoal) > 0.5 && now < trackUntil) {
      if (candidate && distance(latest, candidate) <= 0.5) {
        stableFrames++
      } else {
        candidate = latest
        stableFrames = 1
      }
      if (stableFrames >= STABLE_FRAMES) {
        flyIconTo(close, latest)
        candidate = null
      }
    }
    const landed = close.iconAnimations[0]?.playState === "finished"
    const iconClose = distance(iconStateNow(close).rect, close.iconGoal) <= DISSOLVE_WITHIN_PX
    const cardSettled = distance(latest, close.iconGoal) <= DISSOLVE_WITHIN_PX
    // Also wait until the card's picture can be drawn (see mediaReady)
    const ready = (landed || iconClose) && cardSettled && mediaReady(cardEl)
    if (!ready && now < trackUntil) {
      requestAnimationFrame(track)
      return
    }
    finishClose(close)
  }
  requestAnimationFrame(track)
}

/** Show the real card again, dissolve the icon into it, and clean up. */
function finishClose(close: Close) {
  if (closing !== close) return
  close.timers.forEach((timer) => clearTimeout(timer))
  if (close.cardEl) close.cardEl.style.opacity = ""
  fadeOut(close.win, DISSOLVE_MS)
  fadeOut(close.iconBox, DISSOLVE_MS).then(() => endClose(close))
}

/** Removes the overlay immediately and restores the homepage. */
function endClose(close: Close) {
  if (closing !== close) return
  close.timers.forEach((timer) => clearTimeout(timer))
  close.stopInteraction?.()
  if (close.cardEl) close.cardEl.style.opacity = ""
  close.overlay.remove()
  if (close.backdrop) close.backdrop.style.transformOrigin = ""
  closing = null
  homeReturn = null // a fresh launch records a fresh return
}

/**
 * Mount once in the layout (outside the scroll shell).
 * - Tells a running open/close when the new page has rendered.
 *   (useLayoutEffect runs right after React commits, before paint.)
 * - Starts the close animation when leaving a project for the homepage:
 *   any plain click on a link to "/" (back arrow, wordmark, Home), and the
 *   browser's Back button on mouse/trackpad devices. On touch devices the
 *   swipe-back gesture already plays the browser's own transition, so ours
 *   would double up.
 * 📖 Learn: useEffect vs useLayoutEffect, event capturing, popstate
 */
export function AppLaunchRouteWatcher() {
  const pathname = usePathname()
  useLayoutEffect(() => {
    notifyRouteChange(pathname)
    renderedPath = pathname
  }, [pathname])

  useEffect(() => {
    // Capture phase: runs before the Link's own click handler navigates,
    // while the case study (and its banner) is still on screen
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest("a")
      if (!link || link.getAttribute("href") !== "/" || link.target === "_blank") return
      startClose(window.location.pathname)
    }
    // popstate fires after the URL has changed but before React re-renders,
    // so the banner is still there to copy. renderedPath is the page we're leaving.
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const onPopState = () => {
      if (window.location.pathname === "/" && finePointer.matches) startClose(renderedPath)
    }
    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPopState)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPopState)
    }
  }, [])
  return null
}

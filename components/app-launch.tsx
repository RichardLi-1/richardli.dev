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
 * keyframes for the Web Animations API (one sample per 1/120 s). Almost
 * everything animates transform/opacity, which browsers run on the GPU
 * compositor. So the motion stays smooth even while the main thread is busy
 * rendering the next page. Corner radii are the only main-thread properties,
 * on two small elements.
 * 📖 Learn: Web Animations API (element.animate), compositor-only properties
 *
 * Skipped (plain navigation) for Reduce Motion, Save-Data / slow connections,
 * and low-memory or low-core devices. At runtime, if the first frames show
 * the device struggling, the animation jumps to its end and navigates.
 *
 * Styles: "App launch" section in app/globals.css.
 * Destination pages mark their banner box with `data-launch-target`.
 * ────────────────────────────────────────────────────────────────────────── */

import { useLayoutEffect } from "react"
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
const PAGE_TIMEOUT_MS = 4000 // give up waiting for a slow page and get out of the way
const JANK_WATCH_MS = 200 // watch this long for a struggling device...
const JANK_FRAME_MS = 34 //   ...and bail if frames average slower than this (~30fps)
const DECODE_WAIT_MS = 50 // max wait for the copied images to decode before starting

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
 *   corners → the box's corner radius (main thread, cheap)
 *   content → the card copy inside, counter-scaled so it stays aspect-filled
 *             and is never squashed when the box changes shape (GPU)
 */
function iconKeyframes(path: Rect[], card: { w: number; h: number }, radii: number[]) {
  const box: Keyframe[] = []
  const corners: Keyframe[] = []
  const content: Keyframe[] = []
  path.forEach((rect, i) => {
    const offset = path.length === 1 ? 1 : i / (path.length - 1)
    const sx = rect.w / card.w
    const sy = rect.h / card.h
    box.push({ offset, transform: `translate(${rect.x}px, ${rect.y}px) scale(${sx}, ${sy})` })
    // The box is scaled differently in x and y, so give it an elliptical
    // radius in its own (pre-scale) pixels. After scaling it looks circular.
    const radius = radii[i]
    corners.push({ offset, borderRadius: `${radius / sx}px / ${radius / sy}px` })
    // `fill` = the uniform scale that covers the box; dividing by the box's
    // own scale cancels it out (counter-scaling).
    const fill = Math.max(rect.w / card.w, rect.h / card.h)
    const offX = (rect.w - card.w * fill) / 2
    const offY = (rect.h - card.h * fill) / 2
    content.push({ offset, transform: `translate(${offX / sx}px, ${offY / sy}px) scale(${fill / sx}, ${fill / sy})` })
  })
  return { box, corners, content }
}

// ── Predicting the banner ────────────────────────────────────────────────────
// Real banner positions measured on previous launches, keyed by page + width.
// Module-level, so it lasts for the whole visit (client navigation keeps it).
const measuredTargets = new Map<string, Rect>()
const targetKey = (href: string, vw: number) => `${href}@${vw}`

/**
 * Where the project page's banner will probably be. Project pages share a
 * layout (max-w-3xl column, title block, then a 16:9-ish banner), so this
 * lands close. Phase 2 corrects any difference.
 */
function predictTarget(href: string, vw: number): Rect {
  const measured = measuredTargets.get(targetKey(href, vw))
  if (measured) return measured
  const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--page-gutter")) || 24
  const isMobile = vw < 768
  const width = Math.min(vw, 768) - 2 * gutter // max-w-3xl (768px) minus side padding
  return { x: (vw - width) / 2, y: isMobile ? 150 : 250, w: width, h: (width * 9) / 16 }
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
  // Lazy images in an off-flow overlay may never start; they're cached anyway
  clone.querySelectorAll("img").forEach((img) => (img.loading = "eager"))

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
interface Launch {
  href: string
  overlay: HTMLDivElement
  dim: HTMLDivElement
  win: HTMLDivElement
  iconBox: HTMLDivElement
  iconContent: HTMLDivElement
  card: { w: number; h: number }
  iconPath: Rect[] // the current flight's path, one box per baked frame (for reading velocity)
  iconRadii: number[] // the current flight's corner radius per baked frame
  iconAnimations: Animation[] // box, corners, content
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
}
let active: Launch | null = null

/**
 * True while a launch is running. The destination page's entrance
 * animations (AnimatedPage, StaggeredContent) check this on mount and skip
 * themselves: the launch *is* the entrance, and a banner that's still
 * sliding in would move under the landing icon.
 */
export function isAppLaunching() {
  return active !== null
}

interface LaunchOptions {
  href: string
  /** The card's visual box (image area) that becomes the icon */
  source: HTMLElement
  /** Element that zooms in behind the opening card (e.g. the homepage <main>) */
  backdrop?: HTMLElement | null
  push: (href: string) => void
  prefetch?: (href: string) => void
}

/**
 * Starts the launch animation and handles navigation itself.
 * Returns false when it decided not to animate: the caller should then let
 * the link navigate normally.
 */
export function launchApp({ href, source, backdrop = null, push, prefetch }: LaunchOptions): boolean {
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
  const predicted = predictTarget(href, vw)

  // ── Build the overlay: dim → window (launch screen) → icon ──
  const overlay = document.createElement("div")
  overlay.className = "app-launch"
  overlay.style.visibility = "hidden" // until the copied images have decoded
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
  const winCornerFrames: Keyframe[] = []
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
    // Corners shrink from the card's radius to square; elliptical in the
    // element's own pixels so they look circular after the uneven scale
    const radius = lerp(cardRadius, 0, px)
    winCornerFrames.push({ offset, borderRadius: `${radius / sx}px / ${radius / sy}px` })

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
  const iconRadii = iconPath.map(() => cardRadius) // keeps the card's corners while flying
  const iconFrames = iconKeyframes(iconPath, card, iconRadii)

  const launch: Launch = {
    href,
    overlay,
    dim,
    win,
    iconBox,
    iconContent,
    card,
    iconPath,
    iconRadii,
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
    navigate: () => {
      if (launch.navigated) return
      launch.navigated = true
      push(href)
      // A slow page shouldn't trap the user behind the launch screen
      launch.timers.push(window.setTimeout(() => reveal(launch), PAGE_TIMEOUT_MS))
    },
  }
  active = launch

  // ── Start once the copied images are decoded (avoids a blank first frame) ──
  const decodes = Array.from(iconContent.querySelectorAll("img")).map((img) => img.decode().catch(() => {}))
  const decodeTimeout = new Promise((resolve) => setTimeout(resolve, DECODE_WAIT_MS))
  Promise.race([Promise.all(decodes), decodeTimeout]).then(() => {
    if (active !== launch) return

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
      win.animate(winCornerFrames, timing),
      dim.animate(dimFrames, timing),
    )
    if (backdrop) launch.sceneAnimations.push(backdrop.animate(backdropFrames, timing))
    launch.iconAnimations = [
      iconBox.animate(iconFrames.box, timing),
      iconBox.animate(iconFrames.corners, timing),
      iconContent.animate(iconFrames.content, timing),
    ]

    // Navigate as soon as the old page is fully covered
    launch.timers.push(window.setTimeout(launch.navigate, framesToMs(coverFrame)))

    watchForJank(launch)
  })

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

/** Where the icon is right now, how fast each edge is moving (px/s), and its corner radius. */
function iconStateNow(launch: Launch): { rect: Rect; velocity: Rect; radius: number } {
  const path = launch.iconPath
  const radii = launch.iconRadii
  const last = path.length - 1
  const elapsed = Number(launch.iconAnimations[0]?.currentTime ?? 0) // ms
  const frame = (elapsed / 1000) * SAMPLE_RATE
  if (frame >= last) return { rect: path[last], velocity: { x: 0, y: 0, w: 0, h: 0 }, radius: radii[last] }
  const i = Math.floor(frame)
  const t = frame - i
  const a = path[i]
  const b = path[i + 1]
  return {
    rect: { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) },
    radius: lerp(radii[i], radii[i + 1], t),
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
function flyIconTo(launch: Launch, target: Rect, targetRadius: number): Animation {
  const { rect, velocity, radius } = iconStateNow(launch)
  const settle = LANDING_SETTLE_PX
  const xs = simulateSpring(LANDING_HORIZONTAL_SPRING, rect.x, target.x, velocity.x, settle)
  const ws = simulateSpring(LANDING_HORIZONTAL_SPRING, rect.w, target.w, velocity.w, settle)
  const ys = simulateSpring(LANDING_VERTICAL_SPRING, rect.y, target.y, velocity.y, settle)
  const hs = simulateSpring(LANDING_VERTICAL_SPRING, rect.h, target.h, velocity.h, settle)
  const count = Math.max(xs.length, ws.length, ys.length, hs.length)

  const path: Rect[] = []
  const radii: number[] = []
  for (let i = 0; i < count; i++) {
    path.push({ x: sampleAt(xs, i), y: sampleAt(ys, i), w: sampleAt(ws, i), h: sampleAt(hs, i) })
    // Start from the current radius (not the card's) so a redirect never makes the corners jump
    radii.push(lerp(radius, targetRadius, count === 1 ? 1 : i / (count - 1)))
  }
  const frames = iconKeyframes(path, launch.card, radii)
  // So the *next* redirect can read position, velocity and radius from this flight
  launch.iconPath = path
  launch.iconRadii = radii

  // Replace the current flight. cancel() and the new animate() happen in the
  // same task, so no frame is ever drawn in between.
  launch.iconAnimations.forEach((animation) => animation.cancel())
  const timing: KeyframeAnimationOptions = { duration: framesToMs(count - 1), easing: "linear", fill: "forwards" }
  launch.iconAnimations = [
    launch.iconBox.animate(frames.box, timing),
    launch.iconBox.animate(frames.corners, timing),
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
    targetEl.style.visibility = "hidden" // the icon stands in for it until it lands
    const targetRadius = parseFloat(getComputedStyle(targetEl).borderTopLeftRadius) || 0
    let goal = toRect(targetRect)
    measuredTargets.set(targetKey(launch.href, window.innerWidth), goal)
    flyIconTo(launch, goal, targetRadius)
    fadeOut(launch.dim, REVEAL_MS)
    fadeOut(launch.win, REVEAL_MS)

    // Track the banner every frame until the icon lands. A fresh page often
    // shifts right after mounting (e.g. it renders its desktop layout first,
    // then switches to mobile a frame later), so if the banner moves we
    // redirect the icon again, carrying its velocity. Stop chasing after
    // TRACK_MS in case something on the page never stops moving.
    const trackUntil = performance.now() + TRACK_MS
    const track = (now: number) => {
      if (active !== launch) return
      const latest = toRect(targetEl.getBoundingClientRect())
      if (now < trackUntil && distance(latest, goal) > 0.5) {
        goal = latest
        measuredTargets.set(targetKey(launch.href, window.innerWidth), goal)
        flyIconTo(launch, goal, targetRadius)
      }
      // Close enough? Show the real banner underneath and dissolve the icon
      // into it while it finishes its last (invisible) fraction of a pixel.
      const landed = launch.iconAnimations[0]?.playState === "finished"
      if (!landed && distance(iconStateNow(launch).rect, goal) > DISSOLVE_WITHIN_PX) {
        requestAnimationFrame(track)
        return
      }
      targetEl.style.visibility = ""
      fadeOut(launch.iconBox, DISSOLVE_MS).then(() => cleanup(launch))
    }
    requestAnimationFrame(track)
  })
}

const toRect = (r: DOMRect): Rect => ({ x: r.left, y: r.top, w: r.width, h: r.height })

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
  cancelBackdrop(launch)
  launch.source.style.visibility = ""
  if (launch.target) launch.target.style.visibility = ""
  launch.overlay.remove()
  active = null
}

/** Called by AppLaunchRouteWatcher whenever the route changes. */
function notifyRouteChange(pathname: string) {
  const launch = active
  if (!launch || pathname === launch.startPath) return
  // The old page is gone; its zoom animation went with it
  cancelBackdrop(launch)
  reveal(launch)
}

/**
 * Mount once in the layout (outside the scroll shell). Tells a running launch
 * when the new page has rendered so it can land and get out of the way.
 * useLayoutEffect runs right after React commits the new page, before paint.
 * 📖 Learn: useEffect vs useLayoutEffect
 */
export function AppLaunchRouteWatcher() {
  const pathname = usePathname()
  useLayoutEffect(() => {
    notifyRouteChange(pathname)
  }, [pathname])
  return null
}

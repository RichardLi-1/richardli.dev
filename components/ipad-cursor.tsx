"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

/* ──────────────────────────────────────────────────────────────────────────
 * iPadOS pointer (the translucent grey circle from iPadOS 13.4)
 *
 * Recreates the three pointer "content effects" Apple described in WWDC20
 * ("Design for the iPadOS pointer" / "Build for the iPadOS pointer"):
 *
 *   default   → small translucent grey circle that tracks the mouse 1:1
 *   text      → circle squashes into an I-beam sized to the text under it
 *   highlight → circle morphs into a rounded rect *behind* a button, and the
 *               button + platter drift a few px toward the pointer (parallax)
 *   lift      → for big things (project cards): the element scales up, gains
 *               a shadow and a specular glare. Unlike iPadOS, the pointer stays
 *               visible as a dot so smaller buttons inside the card are easy to hit
 *
 * Which effect is used is decided automatically (see resolveTarget), and any
 * element can override it with a data attribute:
 *
 *   data-cursor="highlight" | "lift" | "text" | "none" | "native"
 *   data-cursor-surface     → on a descendant of a lift target: the part that
 *                             actually lifts (e.g. the image, not the caption)
 *   data-cursor-growth="8"  → on the lifted element: grow by this many px
 *                             instead of LIFT_GROWTH_PX (for subtler cards)
 *   data-cursor-glare="0.3" → on the lifted element: glare strength (0–1)
 *                             instead of GLARE_ALPHA
 *
 * Everything here runs in a requestAnimationFrame loop that writes styles
 * directly to the DOM instead of going through React state.
 * Why: React re-rendering 60×/sec would be slow and cause jank; the cursor is
 * a purely visual overlay, so imperative DOM writes are the right tool.
 * 📖 Learn: requestAnimationFrame, and "escape hatches" (refs) in React docs
 * ────────────────────────────────────────────────────────────────────────── */

// ── Tuning knobs ─────────────────────────────────────────────────────────────
const DOT_SIZE = 20 // iPadOS default pointer is ~19pt
const DOT_PRESSED_SIZE = 16 // pointer shrinks while the mouse button is held
const BEAM_WIDTH = 3
const HIGHLIGHT_PAD_X = 8 // extra room around tight elements (e.g. inline links)
const HIGHLIGHT_PAD_Y = 4
const HIGHLIGHT_PARALLAX = 4 // max px a highlighted button drifts toward the pointer
const LIFT_PARALLAX = 6 // max px a lifted card drifts toward the pointer
const LIFT_GROWTH_PX = 16 // a lifted card grows by ~this many px on its long side
const GLARE_ALPHA = 0.5 // brightness of the white spot on a lifted card
const LIFT_MIN_WIDTH = 160 // clickable things at least this big get "lift" instead of "highlight"
const LIFT_MIN_HEIGHT = 100
const PRESS_SCALE = 0.97 // buttons dip slightly while pressed

// Spring presets. stiffness = how hard it pulls toward the target,
// dampingRatio = how quickly it stops wobbling (1 = no overshoot, <1 = bouncy).
const POSITION_SPRING = { stiffness: 700, dampingRatio: 0.78 }
const SIZE_SPRING = { stiffness: 600, dampingRatio: 0.8 }
const FADE_SPRING = { stiffness: 400, dampingRatio: 1 }
const PARALLAX_SPRING = { stiffness: 300, dampingRatio: 0.7 }
const LIFT_SPRING = { stiffness: 350, dampingRatio: 0.62 } // a touch of bounce when a card lifts

// Things that count as "clickable". Many clickable divs on this site use an
// inline `cursor: pointer` style instead of being real <button>s, so those are
// matched too (React may serialize the style with or without the space).
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "summary",
  "label[for]",
  "select",
  "input[type='checkbox']",
  "input[type='radio']",
  "input[type='submit']",
  "input[type='button']",
  ".cursor-pointer",
  "[style*='cursor: pointer']",
  "[style*='cursor:pointer']",
  "[data-cursor]",
].join(", ")

// Places you type → I-beam that follows the mouse freely.
const TEXT_ENTRY_SELECTOR = [
  "input:not([type])",
  "input[type='text']",
  "input[type='email']",
  "input[type='search']",
  "input[type='url']",
  "input[type='tel']",
  "input[type='password']",
  "input[type='number']",
  "textarea",
  "[contenteditable='true']",
  "[contenteditable='']",
].join(", ")

// Elements that ask for a special system cursor (zoom lightbox, draggable
// stickers…). The iPad pointer has no equivalent, so we step aside and let the
// browser's native cursor show there.
const NATIVE_CURSORS = ["zoom-in", "zoom-out", "grab", "grabbing", "move", "crosshair", "not-allowed", "col-resize", "row-resize"]
const NATIVE_CURSOR_SELECTOR = [
  "[data-cursor='native']",
  ...NATIVE_CURSORS.map((name) => `.cursor-${name}`),
  ...NATIVE_CURSORS.flatMap((name) => [`[style*='cursor: ${name}']`, `[style*='cursor:${name}']`]),
].join(", ")

// ── Types ────────────────────────────────────────────────────────────────────
type Mode = "default" | "text" | "highlight" | "lift" | "hidden" | "native"

/** What the pointer should currently be doing, recomputed when the mouse moves or the page scrolls. */
interface Target {
  mode: Mode
  el: HTMLElement | null // element whose box the pointer morphs to
  fxEl: HTMLElement | null // element that physically moves (parallax / lift); null for inline links
  isInline: boolean // inline links can wrap onto 2 lines, so we pick the line under the pointer
  radius: number
  padX: number
  padY: number
  lineCenterY: number | null // text mode: vertical centre of the line, so the beam snaps to it
  beamHeight: number
}

const baseTarget: Target = {
  mode: "default",
  el: null,
  fxEl: null,
  isInline: false,
  radius: 0,
  padX: 0,
  padY: 0,
  lineCenterY: null,
  beamHeight: 0,
}
const DEFAULT_TARGET: Target = baseTarget
const HIDDEN_TARGET: Target = { ...baseTarget, mode: "hidden" }
const NATIVE_TARGET: Target = { ...baseTarget, mode: "native" }

interface Spring {
  value: number
  velocity: number
  target: number
}

/** Per-element animation state for a highlighted/lifted element. */
interface ElementEffect {
  el: HTMLElement
  kind: "highlight" | "lift"
  radius: number
  tx: Spring // parallax offset x (px)
  ty: Spring // parallax offset y (px)
  scale: Spring
  lift: Spring // 0 → 1, drives the shadow and glare strength
  growthPx: number // how many px the long side grows when lifted
  glareAlpha: number // brightness of the glare spot when lifted
  // Inline styles the element had before we touched it, restored on release.
  saved: { translate: string; scale: string; boxShadow: string; transition: string }
  baseShadow: string
}

// ── Spring physics ───────────────────────────────────────────────────────────
// 📖 Learn: damped harmonic oscillator ("spring animations", same model as
// SwiftUI/UIKit springs and framer-motion's useSpring).
function makeSpring(value: number): Spring {
  return { value, velocity: 0, target: value }
}

function stepSpring(s: Spring, config: { stiffness: number; dampingRatio: number }, dt: number) {
  const damping = 2 * config.dampingRatio * Math.sqrt(config.stiffness)
  // Split big frames into small sub-steps so the simulation stays stable
  // even if a frame takes a while (e.g. tab was in the background).
  const steps = Math.ceil(dt / (1 / 240))
  const h = dt / steps
  for (let i = 0; i < steps; i++) {
    const force = config.stiffness * (s.target - s.value) - damping * s.velocity
    s.velocity += force * h
    s.value += s.velocity * h
  }
}

function isSettled(s: Spring, epsilon = 0.01) {
  return Math.abs(s.velocity) < epsilon && Math.abs(s.target - s.value) < epsilon
}

function snap(s: Spring, value: number) {
  s.value = value
  s.target = value
  s.velocity = 0
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

// ── DOM helpers ──────────────────────────────────────────────────────────────
function parseRadius(style: CSSStyleDeclaration, width: number, height: number, fallback: number) {
  const raw = style.borderTopLeftRadius
  const n = parseFloat(raw)
  if (!n) return fallback
  // "50%" style radii are relative to the element's size
  if (raw.endsWith("%")) return (n / 100) * Math.min(width, height)
  return n
}

/**
 * Finds the character under the pointer, if any, and returns the line it sits
 * on. Uses the browser's caret hit-testing API: "if the user clicked here, where
 * would the text cursor go?"
 * 📖 Learn: document.caretPositionFromPoint / caretRangeFromPoint, Range.getBoundingClientRect
 */
function findTextLineAtPoint(x: number, y: number): { lineCenterY: number; height: number } | null {
  let node: Node | null = null
  let offset = 0
  // Firefox + newer Chrome have the standard API; older Safari only has the WebKit one.
  // Typed as optional because not every browser ships both.
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
    caretRangeFromPoint?: (x: number, y: number) => Range | null
  }
  if (typeof doc.caretPositionFromPoint === "function") {
    const pos = doc.caretPositionFromPoint(x, y)
    node = pos?.offsetNode ?? null
    offset = pos?.offset ?? 0
  } else if (typeof doc.caretRangeFromPoint === "function") {
    const range = doc.caretRangeFromPoint(x, y)
    node = range?.startContainer ?? null
    offset = range?.startOffset ?? 0
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return null

  const text = node.textContent ?? ""
  if (text.trim() === "") return null
  const parent = node.parentElement
  if (parent && getComputedStyle(parent).userSelect === "none") return null

  // The caret sits *between* two characters, so test the one on each side.
  // The caret API happily returns the *nearest* text even when the pointer is
  // in empty space, so we check the pointer is really inside the glyph's box.
  for (const start of [offset, offset - 1]) {
    if (start < 0 || start >= text.length) continue
    const range = document.createRange()
    range.setStart(node, start)
    range.setEnd(node, start + 1)
    const rect = range.getBoundingClientRect()
    const insideX = x >= rect.left - 2 && x <= rect.right + 2
    const insideY = y >= rect.top - 4 && y <= rect.bottom + 4 // small slop so the gap between lines doesn't flicker
    if (rect.height > 0 && insideX && insideY) {
      return { lineCenterY: rect.top + rect.height / 2, height: clamp(rect.height, 12, 96) }
    }
  }
  return null
}

/** Decides what the pointer should do for whatever is under (x, y). */
function resolveTarget(x: number, y: number): Target {
  const hit = document.elementFromPoint(x, y)
  if (!hit) return HIDDEN_TARGET
  // Pointer events inside an iframe go to the iframe's own document, so we can't
  // track the mouse there. Hide ours and let the native cursor take over.
  if (hit.tagName === "IFRAME") return HIDDEN_TARGET

  const nativeEl = hit.closest(NATIVE_CURSOR_SELECTOR)
  const interactive = hit.closest<HTMLElement>(INTERACTIVE_SELECTOR)
  const textEntry = hit.closest<HTMLElement>(TEXT_ENTRY_SELECTOR)

  // The *nearest* ancestor wins: a zoomable image inside a link should still zoom.
  if (nativeEl && (!interactive || interactive.contains(nativeEl))) return NATIVE_TARGET

  if (textEntry && (!interactive || interactive.contains(textEntry))) {
    const fontSize = parseFloat(getComputedStyle(textEntry).fontSize) || 16
    return { ...baseTarget, mode: "text", beamHeight: fontSize * 1.25 }
  }

  if (interactive) {
    const attr = interactive.dataset.cursor
    if (attr === "none") return DEFAULT_TARGET
    if (attr === "text") {
      const line = findTextLineAtPoint(x, y)
      const fontSize = parseFloat(getComputedStyle(interactive).fontSize) || 16
      return { ...baseTarget, mode: "text", lineCenterY: line?.lineCenterY ?? null, beamHeight: line?.height ?? fontSize * 1.25 }
    }
    if (interactive.matches(":disabled, [aria-disabled='true']")) return DEFAULT_TARGET

    const style = getComputedStyle(interactive)
    const rect = interactive.getBoundingClientRect()
    const isInline = style.display === "inline"

    // Guard: a clickable full-screen backdrop (modal overlay) shouldn't turn
    // the whole screen into one giant button.
    if (!attr && rect.width > window.innerWidth * 0.6 && rect.height > window.innerHeight * 0.6) {
      return DEFAULT_TARGET
    }

    const isBig = rect.width >= LIFT_MIN_WIDTH && rect.height >= LIFT_MIN_HEIGHT
    if (attr === "lift" || (attr !== "highlight" && isBig)) {
      // `transform`-type properties don't apply to inline elements (like a
      // <Link> wrapping a card), so lift its first block child instead.
      const explicitSurface = interactive.querySelector<HTMLElement>("[data-cursor-surface]")
      const firstChild = interactive.firstElementChild
      const surface = explicitSurface ?? (isInline && firstChild instanceof HTMLElement ? firstChild : interactive)
      const surfaceRect = surface.getBoundingClientRect()
      return {
        ...baseTarget,
        mode: "lift",
        el: surface,
        fxEl: surface,
        radius: parseRadius(getComputedStyle(surface), surfaceRect.width, surfaceRect.height, 12),
      }
    }

    // Only bare inline text links get breathing room around them. Anything
    // block/flex (nav pills, icon buttons, rows) already has a deliberate box
    // and radius, so the platter hugs that shape exactly; padding it would
    // draw a second, differently-shaped outline around the element.
    const needsPadding = isInline && parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) < 8
    return {
      ...baseTarget,
      mode: "highlight",
      el: interactive,
      fxEl: isInline ? null : interactive, // translate has no effect on inline boxes
      isInline,
      radius: parseRadius(style, rect.width, rect.height, 8),
      padX: needsPadding ? HIGHLIGHT_PAD_X : 0,
      padY: needsPadding ? HIGHLIGHT_PAD_Y : 0,
    }
  }

  const line = findTextLineAtPoint(x, y)
  if (line) return { ...baseTarget, mode: "text", lineCenterY: line.lineCenterY, beamHeight: line.height }

  return DEFAULT_TARGET
}

// ── The engine ───────────────────────────────────────────────────────────────
// Plain closure (not a React component) that owns all per-frame state.
function createCursorEngine(cursor: HTMLDivElement, glare: HTMLDivElement) {
  const root = document.documentElement
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  let mouseX = -100
  let mouseY = -100
  let lastFrameMouseX = mouseX
  let lastFrameMouseY = mouseY
  let hasPointer = false // false until the first mouse move, and while outside the window
  let pressed = false
  let dirty = true // "something changed, re-check what's under the pointer"
  let target: Target = HIDDEN_TARGET

  // The pointer's own geometry, all animated.
  const x = makeSpring(mouseX)
  const y = makeSpring(mouseY)
  const w = makeSpring(DOT_SIZE)
  const h = makeSpring(DOT_SIZE)
  const r = makeSpring(DOT_SIZE / 2)
  const opacity = makeSpring(0)

  let activeFx: ElementEffect | null = null
  const releasingFx: ElementEffect[] = [] // elements springing back to rest after the pointer left
  let glareFx: ElementEffect | null = null
  let glareBase: { cx: number; cy: number; w: number; h: number } | null = null

  let shownMode = ""
  let shownPressed = false
  let nativeClassOn = false
  let rafId = 0
  let running = false
  let lastTime = 0

  root.classList.add("ipad-cursor-on")

  // ── Element effects ──
  function createFx(el: HTMLElement): ElementEffect {
    const computed = getComputedStyle(el)
    const saved = {
      translate: el.style.getPropertyValue("translate"),
      scale: el.style.getPropertyValue("scale"),
      boxShadow: el.style.boxShadow,
      transition: el.style.transition,
    }
    // If the element already transitions e.g. `all 0.3s`, the browser would
    // smooth out our per-frame values and make them lag. Appending
    // "translate 0s, scale 0s" overrides just those properties (later entries win).
    const existing = computed.transition
    if (existing && !existing.startsWith("all 0s")) {
      el.style.transition = `${existing}, translate 0s, scale 0s, box-shadow 0s`
    }
    return {
      el,
      kind: "highlight",
      radius: 0,
      tx: makeSpring(0),
      ty: makeSpring(0),
      scale: makeSpring(1),
      lift: makeSpring(0),
      // Read once here rather than every frame. `dataset.cursorGrowth` is the
      // camelCase form of the `data-cursor-growth` attribute.
      // 📖 Learn: HTMLElement.dataset
      growthPx: Number(el.dataset.cursorGrowth) || LIFT_GROWTH_PX,
      glareAlpha: Number(el.dataset.cursorGlare) || GLARE_ALPHA,
      saved,
      baseShadow: computed.boxShadow,
    }
  }

  function restoreFx(fx: ElementEffect) {
    fx.el.style.setProperty("translate", fx.saved.translate)
    fx.el.style.setProperty("scale", fx.saved.scale)
    fx.el.style.boxShadow = fx.saved.boxShadow
    fx.el.style.transition = fx.saved.transition
  }

  function releaseFx(fx: ElementEffect) {
    fx.tx.target = 0
    fx.ty.target = 0
    fx.scale.target = 1
    fx.lift.target = 0
    releasingFx.push(fx)
  }

  /** Reuse an element's effect if it's still springing back; its "saved" styles are the true originals. */
  function claimFx(el: HTMLElement): ElementEffect {
    const i = releasingFx.findIndex((fx) => fx.el === el)
    if (i !== -1) return releasingFx.splice(i, 1)[0]
    return createFx(el)
  }

  function stepFx(fx: ElementEffect, dt: number) {
    stepSpring(fx.tx, PARALLAX_SPRING, dt)
    stepSpring(fx.ty, PARALLAX_SPRING, dt)
    stepSpring(fx.scale, LIFT_SPRING, dt)
    stepSpring(fx.lift, LIFT_SPRING, dt)
  }

  function fxSettled(fx: ElementEffect) {
    return isSettled(fx.tx) && isSettled(fx.ty) && isSettled(fx.scale, 0.0005) && isSettled(fx.lift, 0.001)
  }

  function renderFx(fx: ElementEffect) {
    fx.el.style.setProperty("translate", `${fx.tx.value}px ${fx.ty.value}px`)
    fx.el.style.setProperty("scale", `${fx.scale.value}`)
    const l = Math.max(0, fx.lift.value)
    if (l > 0.001) {
      const lifted = `0 ${14 * l}px ${36 * l}px -${6 * l}px rgba(0, 0, 0, ${0.4 * l})`
      fx.el.style.boxShadow = fx.baseShadow && fx.baseShadow !== "none" ? `${lifted}, ${fx.baseShadow}` : lifted
    } else {
      fx.el.style.boxShadow = fx.saved.boxShadow
    }
  }

  /**
   * The element's box *without* our own parallax/scale applied, so targets
   * don't feed back into themselves. getBoundingClientRect includes transforms,
   * so we undo the offset and scale we wrote last frame.
   */
  function measureBase(el: HTMLElement, fx: ElementEffect | null, useLineUnderPointer: boolean) {
    let rect = el.getBoundingClientRect()
    if (useLineUnderPointer) {
      for (const fragment of Array.from(el.getClientRects())) {
        if (mouseX >= fragment.left && mouseX <= fragment.right && mouseY >= fragment.top && mouseY <= fragment.bottom) {
          rect = fragment
          break
        }
      }
    }
    const own = fx && fx.el === el ? fx : null
    const s = own ? own.scale.value : 1
    return {
      cx: rect.left + rect.width / 2 - (own ? own.tx.value : 0),
      cy: rect.top + rect.height / 2 - (own ? own.ty.value : 0),
      w: rect.width / s,
      h: rect.height / s,
    }
  }

  // ── Target switching ──
  function applyTarget(next: Target) {
    // While drag-selecting text, stay an I-beam even if the pointer slides over whitespace.
    // Drop the line snap though: keeping the old lineCenterY would pin the beam to
    // the last line it touched while the mouse drags far below it.
    if (pressed && target.mode === "text" && next.mode !== "text") {
      if (target.lineCenterY !== null) target = { ...target, lineCenterY: null }
      return
    }
    target = next

    const nextFxEl = next.mode === "highlight" || next.mode === "lift" ? next.fxEl : null
    if ((activeFx?.el ?? null) !== nextFxEl) {
      if (activeFx) releaseFx(activeFx)
      activeFx = nextFxEl ? claimFx(nextFxEl) : null
    }
    if (activeFx) {
      activeFx.kind = next.mode === "lift" ? "lift" : "highlight"
      activeFx.radius = next.radius
      if (activeFx.kind === "lift") glareFx = activeFx
    }

    // "native" mode removes our `cursor: none` rule so the element's own cursor shows.
    const wantNative = next.mode === "native"
    if (wantNative !== nativeClassOn) {
      root.classList.toggle("ipad-cursor-native", wantNative)
      nativeClassOn = wantNative
    }
  }

  // ── Per-frame: set every spring's target (reads layout, never writes) ──
  function updateTargets(mouseDX: number, mouseDY: number) {
    // "Follow" = track the mouse 1:1 like a real pointer. We shift the spring's
    // current value by however far the mouse moved, so only the *leftover*
    // offset (e.g. after leaving a button) is animated. No laggy trailing.
    const invisible = opacity.value < 0.05
    const follow = (s: Spring, mouse: number, delta: number) => {
      if (invisible) return snap(s, mouse) // reappearing: jump straight to the mouse
      s.value += delta
      s.target = mouse
    }

    glareBase = null

    switch (target.mode) {
      case "default":
      case "hidden":
      case "native": {
        follow(x, mouseX, mouseDX)
        follow(y, mouseY, mouseDY)
        const size = pressed ? DOT_PRESSED_SIZE : DOT_SIZE
        w.target = size
        h.target = size
        r.target = size / 2
        opacity.target = target.mode === "default" ? 1 : 0
        break
      }

      case "text": {
        follow(x, mouseX, mouseDX)
        if (target.lineCenterY === null) {
          follow(y, mouseY, mouseDY)
        } else {
          // Snap to the line, with a little give toward the mouse so it feels
          // magnetic rather than locked.
          y.target = target.lineCenterY + (mouseY - target.lineCenterY) * 0.15
        }
        w.target = BEAM_WIDTH
        h.target = target.beamHeight
        r.target = BEAM_WIDTH / 2
        opacity.target = 1
        break
      }

      case "highlight": {
        const el = target.el!
        const base = measureBase(el, activeFx, target.isInline)
        // -1…1: where the pointer is inside the element, relative to its centre.
        const nx = clamp((mouseX - base.cx) / (base.w / 2), -1, 1)
        const ny = clamp((mouseY - base.cy) / (base.h / 2), -1, 1)
        const parallax = reducedMotion ? 0 : HIGHLIGHT_PARALLAX
        const offX = nx * parallax
        const offY = ny * parallax
        if (activeFx) {
          activeFx.tx.target = offX
          activeFx.ty.target = offY
          activeFx.scale.target = pressed ? PRESS_SCALE : 1
          activeFx.lift.target = 0
        }
        const platterScale = pressed ? PRESS_SCALE : 1
        x.target = base.cx + offX
        y.target = base.cy + offY
        w.target = (base.w + target.padX * 2) * platterScale
        h.target = (base.h + target.padY * 2) * platterScale
        r.target = Math.min(target.radius + Math.min(target.padX, target.padY), Math.min(w.target, h.target) / 2)
        opacity.target = 1
        break
      }

      case "lift": {
        const fx = activeFx!
        const base = measureBase(fx.el, fx, false)
        const nx = clamp((mouseX - base.cx) / (base.w / 2), -1, 1)
        const ny = clamp((mouseY - base.cy) / (base.h / 2), -1, 1)
        const parallax = reducedMotion ? 0 : LIFT_PARALLAX
        const grow = reducedMotion ? 1 : 1 + fx.growthPx / Math.max(base.w, base.h)
        // Pressing pushes the card most of the way back down, like tapping it.
        const scale = pressed ? 1 + (grow - 1) * 0.25 : grow
        fx.tx.target = nx * parallax
        fx.ty.target = ny * parallax
        fx.scale.target = scale
        fx.lift.target = reducedMotion ? 0 : pressed ? 0.5 : 1
        // Real iPadOS fades the pointer out beneath a lifted element, but on big
        // thumbnails that makes it hard to find smaller buttons inside them
        // (like "Click here to use!"). So the pointer stays a visible dot that
        // follows the mouse while the card still lifts underneath it.
        follow(x, mouseX, mouseDX)
        follow(y, mouseY, mouseDY)
        const size = pressed ? DOT_PRESSED_SIZE : DOT_SIZE
        w.target = size
        h.target = size
        r.target = size / 2
        opacity.target = 1
        break
      }
    }

    // Glare keeps tracking its card while the card settles back down.
    if (glareFx && (glareFx.lift.value > 0.005 || glareFx.lift.target > 0)) {
      glareBase = measureBase(glareFx.el, glareFx, false)
    } else {
      glareFx = null
    }
  }

  // ── Per-frame: write styles (writes only, after all reads) ──
  function render() {
    const width = Math.max(0, w.value)
    const height = Math.max(0, h.value)
    cursor.style.transform = `translate3d(${x.value - width / 2}px, ${y.value - height / 2}px, 0)`
    cursor.style.width = `${width}px`
    cursor.style.height = `${height}px`
    cursor.style.borderRadius = `${Math.max(0, r.value)}px`
    cursor.style.opacity = `${clamp(opacity.value, 0, 1)}`

    // data-* attributes drive colour changes in CSS; only touch them when they change.
    if (shownMode !== target.mode) {
      cursor.dataset.mode = target.mode
      shownMode = target.mode
    }
    if (shownPressed !== pressed) {
      cursor.dataset.pressed = String(pressed)
      shownPressed = pressed
    }

    if (activeFx) renderFx(activeFx)
    for (const fx of releasingFx) renderFx(fx)

    if (glareFx && glareBase) {
      const s = glareFx.scale.value
      const gw = glareBase.w * s
      const gh = glareBase.h * s
      const left = glareBase.cx + glareFx.tx.value - gw / 2
      const top = glareBase.cy + glareFx.ty.value - gh / 2
      glare.style.transform = `translate3d(${left}px, ${top}px, 0)`
      glare.style.width = `${gw}px`
      glare.style.height = `${gh}px`
      glare.style.borderRadius = `${glareFx.radius * s}px`
      // Specular highlight: a soft white spot under the pointer, like light
      // reflecting off a raised surface.
      // 📖 Learn: CSS radial-gradient, mix-blend-mode: soft-light
      glare.style.background = `radial-gradient(circle at ${mouseX - left}px ${mouseY - top}px, rgba(255,255,255,${glareFx.glareAlpha}), rgba(255,255,255,0) 55%)`
      glare.style.opacity = `${clamp(glareFx.lift.value, 0, 1)}`
    } else {
      glare.style.opacity = "0"
    }
  }

  function frame(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now

    // 1. What's under the pointer? (only when the mouse moved / page scrolled)
    if (activeFx && !activeFx.el.isConnected) dirty = true // element was removed (route change)
    if (dirty) {
      dirty = false
      applyTarget(hasPointer ? resolveTarget(mouseX, mouseY) : HIDDEN_TARGET)
    }

    // 2. Set spring targets (layout reads)
    const mouseDX = mouseX - lastFrameMouseX
    const mouseDY = mouseY - lastFrameMouseY
    lastFrameMouseX = mouseX
    lastFrameMouseY = mouseY
    updateTargets(mouseDX, mouseDY)

    // 3. Advance the physics
    stepSpring(x, POSITION_SPRING, dt)
    stepSpring(y, POSITION_SPRING, dt)
    stepSpring(w, SIZE_SPRING, dt)
    stepSpring(h, SIZE_SPRING, dt)
    stepSpring(r, SIZE_SPRING, dt)
    stepSpring(opacity, FADE_SPRING, dt)
    if (activeFx) stepFx(activeFx, dt)
    for (const fx of releasingFx) stepFx(fx, dt)

    // 4. Write styles (layout writes)
    render()

    // Elements that have fully sprung back get their original styles restored.
    for (let i = releasingFx.length - 1; i >= 0; i--) {
      if (fxSettled(releasingFx[i])) {
        restoreFx(releasingFx[i])
        releasingFx.splice(i, 1)
      }
    }

    // 5. Sleep when nothing is moving, so an idle page costs zero CPU.
    const allSettled =
      [x, y, w, h, r, opacity].every((s) => isSettled(s)) &&
      (!activeFx || fxSettled(activeFx)) &&
      releasingFx.length === 0
    if (allSettled && !dirty) {
      running = false
    } else {
      rafId = requestAnimationFrame(frame)
    }
  }

  function ensureRunning() {
    if (running) return
    running = true
    lastTime = performance.now()
    rafId = requestAnimationFrame(frame)
  }

  function markDirty() {
    dirty = true
    ensureRunning()
  }

  // ── Event listeners ──
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") {
      hasPointer = false
      markDirty()
      return
    }
    mouseX = e.clientX
    mouseY = e.clientY
    if (!hasPointer) {
      hasPointer = true
      lastFrameMouseX = mouseX
      lastFrameMouseY = mouseY
    }
    markDirty()
  }
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") return
    pressed = true
    markDirty()
  }
  const onPointerUp = () => {
    pressed = false
    markDirty()
  }
  // relatedTarget is null when the mouse leaves the browser window entirely.
  const onMouseOut = (e: MouseEvent) => {
    if (!e.relatedTarget) {
      hasPointer = false
      markDirty()
    }
  }
  const onBlur = () => {
    hasPointer = false
    pressed = false
    markDirty()
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true })
  window.addEventListener("pointerdown", onPointerDown, { passive: true })
  window.addEventListener("pointerup", onPointerUp, { passive: true })
  window.addEventListener("resize", markDirty)
  window.addEventListener("blur", onBlur)
  document.addEventListener("mouseout", onMouseOut)
  // `scroll` doesn't bubble, but capture-phase listeners on document still see
  // it for every scroll container (this site scrolls .app-scroll-shell, not window).
  // 📖 Learn: event capturing vs bubbling
  document.addEventListener("scroll", markDirty, { capture: true, passive: true })

  ensureRunning()

  return {
    markDirty,
    destroy() {
      cancelAnimationFrame(rafId)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("resize", markDirty)
      window.removeEventListener("blur", onBlur)
      document.removeEventListener("mouseout", onMouseOut)
      document.removeEventListener("scroll", markDirty, { capture: true })
      if (activeFx) restoreFx(activeFx)
      releasingFx.forEach(restoreFx)
      root.classList.remove("ipad-cursor-on", "ipad-cursor-native")
    },
  }
}

// ── React wrapper ────────────────────────────────────────────────────────────
export function IPadCursor() {
  const [enabled, setEnabled] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const markDirtyRef = useRef<() => void>(() => {})
  const pathname = usePathname()

  // Only turn on for devices with a real mouse/trackpad. Phones and tablets
  // (touch-only) keep their normal behaviour.
  // 📖 Learn: CSS interaction media features — (hover: hover) and (pointer: fine)
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setEnabled(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!enabled || !cursorRef.current || !glareRef.current) return
    const engine = createCursorEngine(cursorRef.current, glareRef.current)
    markDirtyRef.current = engine.markDirty
    return () => {
      engine.destroy()
      markDirtyRef.current = () => {}
    }
  }, [enabled])

  // After client-side navigation the page changes under a still mouse, so
  // re-check what the pointer is over.
  useEffect(() => {
    markDirtyRef.current()
  }, [pathname])

  if (!enabled) return null
  return (
    <>
      <div ref={glareRef} className="ipad-cursor-glare" aria-hidden="true" />
      <div ref={cursorRef} className="ipad-cursor" aria-hidden="true" />
    </>
  )
}

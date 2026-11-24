// Pure logic behind the Transit Control experiments card (no React here).
//
// Everything in this file is ported line for line from the simulator's own frontend
// (github.com/RichardLi-1/cbtc, frontend/src), so the card draws trains exactly the way the app does:
//   - Route.appendRange / pointAtU  ← motion/routeIndex.ts  (chainage → point on the map)
//   - trainBody / bodyPaths          ← render/layers/TrainLayer.ts  (bodyGeometry, drawBody)
//   - nextDisplayedKmh               ← motion/speedDisplay.ts  (the km/h shown in the roster)
// and the motion itself is a lap recorded from the real sim (scripts/transit-control-visual).
//
// "Chainage" = distance in metres along the line's loop: Vaughan MC → Finch on the
// southbound/eastbound track, then back on the other track. 📖 Learn: railway chainage

import type { VisualData } from "./types"

// ── Route: chainage (metres) → map position (px) ──────────────────────────────────────────

interface Seg {
  startM: number      // chainage where this piece of track starts
  lengthM: number     // real metres of track
  pts: number[]       // map polyline, flat [x0, y0, x1, y1, …]
  cum: number[]       // map distance from the first point to each point
  mapLen: number      // total map length of the polyline
}

export class Route {
  readonly lengthM: number
  private segs: Seg[]

  constructor(data: VisualData["route"]) {
    this.lengthM = data.lengthM
    this.segs = data.segs.map(([startM, lengthM, ...pts]) => {
      const cum = [0]
      for (let i = 2; i < pts.length; i += 2) {
        cum.push(cum[cum.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]))
      }
      return { startM, lengthM, pts, cum, mapLen: cum[cum.length - 1] }
    })
  }

  /** Chainage wrapped into [0, lengthM): the loop has no end. */
  wrap(c: number): number {
    let r = c % this.lengthM
    if (r < 0) r += this.lengthM
    return r
  }

  /** Index of the segment containing chainage c (binary search on segment starts). */
  private segIndexAt(c: number): number {
    const s = this.segs
    if (c < s[0].startM) return s.length - 1
    let lo = 0
    let hi = s.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (s[mid].startM <= c) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  /** Point at fraction u (0–1) of a segment's map length. Within a segment, real metres map
   *  linearly onto map distance, so u is the same fraction of both. */
  private pointAtU(seg: Seg, u: number): [number, number] {
    const n = seg.pts.length / 2
    if (n === 1 || seg.mapLen <= 0) return [seg.pts[0], seg.pts[1]]
    const target = Math.max(0, Math.min(1, u)) * seg.mapLen
    let i = 1
    while (i < n - 1 && seg.cum[i] < target) i++
    const piece = seg.cum[i] - seg.cum[i - 1]
    const t = piece > 0 ? (target - seg.cum[i - 1]) / piece : 0
    const ax = seg.pts[2 * i - 2]
    const ay = seg.pts[2 * i - 1]
    return [ax + (seg.pts[2 * i] - ax) * t, ay + (seg.pts[2 * i + 1] - ay) * t]
  }

  /** Map polyline from chainage c0 forward for `len` metres, as flat [x, y, …]. */
  appendRange(c0: number, len: number): number[] {
    const out: number[] = []
    let remaining = Math.max(0, Math.min(len, this.lengthM))
    let c = this.wrap(c0)
    let si = this.segIndexAt(c)
    let seg = this.segs[si]
    let u0 = Math.max(0, seg.lengthM > 0 ? (c - seg.startM) / seg.lengthM : 0)
    out.push(...this.pointAtU(seg, u0))
    let guard = 0
    while (remaining > 1e-9 && guard++ < this.segs.length + 2) {
      const take = Math.min(Math.max(0, seg.startM + seg.lengthM - c), remaining)
      const u1 = seg.lengthM > 0 ? (c + take - seg.startM) / seg.lengthM : 1
      if (seg.mapLen > 0) {
        // interior bends between u0 and u1
        for (let i = 1; i < seg.pts.length / 2 - 1; i++) {
          const w = seg.cum[i]
          if (w > u0 * seg.mapLen && w < u1 * seg.mapLen) out.push(seg.pts[2 * i], seg.pts[2 * i + 1])
        }
      }
      out.push(...this.pointAtU(seg, u1))
      remaining -= take
      c += take
      if (remaining > 1e-9) {
        si = (si + 1) % this.segs.length
        seg = this.segs[si]
        c = seg.startM
        u0 = 0
        const n = out.length
        if (out[n - 2] !== seg.pts[0] || out[n - 1] !== seg.pts[1]) out.push(seg.pts[0], seg.pts[1])
      }
    }
    return out
  }
}

// ── Train bodies (TrainLayer.ts) ───────────────────────────────────────────────────────────

export const BODY_W = 6       // px: body stroke width; the knockout outline is BODY_W + 2
const MIN_BODY_PX = 13        // a train is never drawn shorter than this

function polyLen(p: number[]): number {
  let s = 0
  for (let i = 2; i < p.length; i += 2) s += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1])
  return s
}

/** The body's map polyline, tail → nose. It follows the track behind the nose for the train's
 *  length at the layout's typical scale, stretched to at least MIN_BODY_PX. Kept identical to the
 *  app, including its one-step correction: when the body spans a change of map scale (a tail still
 *  on the widened Union loop), the corrected body can come out only a few px long. */
export function trainBody(route: Route, noseC: number, lengthM: number, pxPerM: number): number[] {
  let pts = route.appendRange(noseC - lengthM, lengthM)
  const natural = polyLen(pts)
  const target = Math.max(MIN_BODY_PX, lengthM * pxPerM)
  if (Math.abs(natural - target) > target * 0.08) {
    const ext = natural > 0.05 ? Math.min((lengthM * target) / natural, route.lengthM * 0.05) : lengthM * 20
    pts = route.appendRange(noseC - ext, ext)
  }
  return pts
}

const f2 = (v: number) => (Math.round(v * 100) / 100).toString()

/** SVG path data for a body: the polyline, plus the pointed nose grown by 1 px (outline) and
 *  at its true size (fill). The nose shows the direction of travel. */
export function bodyPaths(p: number[]): { line: string; noseOutline: string; nose: string } {
  let line = `M${f2(p[0])} ${f2(p[1])}`
  for (let i = 2; i < p.length; i += 2) line += `L${f2(p[i])} ${f2(p[i + 1])}`
  const n = p.length
  const nx = p[n - 2]
  const ny = p[n - 1]
  let dx = nx - p[n - 4]
  let dy = ny - p[n - 3]
  const dl = Math.hypot(dx, dy) || 1
  dx /= dl
  dy /= dl
  const half = BODY_W / 2
  const tipX = nx + dx * (half + 1.5)
  const tipY = ny + dy * (half + 1.5)
  const nose = (grow: number) =>
    `M${f2(tipX + dx * grow)} ${f2(tipY + dy * grow)}` +
    `L${f2(nx - dy * (half + grow))} ${f2(ny + dx * (half + grow))}` +
    `L${f2(nx + dy * (half + grow))} ${f2(ny - dx * (half + grow))}Z`
  return { line, noseOutline: nose(1), nose: nose(0) }
}

// ── Recorded lap → where a train is at any moment ────────────────────────────────────────

export type TrainState = "running" | "arriving" | "dwelling" | "stopped"

export interface TrainNow {
  c: number                  // nose chainage, metres
  kmh: number                // true speed
  state: TrainState
  station: string | null     // platform it is berthed at (dwelling only)
  next: string | null        // next stop
  ebrake: boolean
  sStopM: number             // ATP emergency stopping distance at this speed
  sigStopC: number | null    // stop point of a red signal holding the train, if any
}

/**
 * One train's complete lap of the line, sampled every second from the real sim. Every train on
 * the card replays this lap from its own starting phase, so after `periodS` seconds each train
 * is exactly where it began: the animation loops forever with no jump.
 */
export class Lap {
  readonly periodS: number
  private c: Float64Array    // chainage at each second (unwrapped: keeps growing past lengthM)
  private v: Float64Array    // km/h at each second
  private s: Float64Array    // ATP stopping distance at each second
  private events: number[][] // [second, state, station, next, ebrake] whenever one of them changes
  private sig: number[][]    // [fromSecond, toSecond, stopChainage] while a red signal held it
  private names: string[]

  constructor(data: VisualData["lap"], private route: Route) {
    this.periodS = data.periodS
    this.names = data.names
    this.events = data.events
    this.sig = data.sig
    // Positions and speeds are stored as differences from the previous second (small numbers,
    // so the JSON stays small); add them back up once here. 📖 Learn: delta encoding
    const n = data.dc.length + 1
    this.c = new Float64Array(n + 1)
    this.v = new Float64Array(n + 1)
    this.s = new Float64Array(n + 1)
    this.c[0] = data.c0 / 10 // decimetres → metres
    this.v[0] = data.v0 / 10 // tenths of km/h → km/h
    this.s[0] = data.s0 / 10 // decimetres → metres
    for (let i = 1; i < n; i++) {
      this.c[i] = this.c[i - 1] + data.dc[i - 1] / 10
      this.v[i] = this.v[i - 1] + data.dv[i - 1] / 10
      this.s[i] = this.s[i - 1] + data.ds[i - 1] / 10
    }
    // One extra sample: the lap's end is its own start, one loop further on.
    this.c[n] = this.c[0] + route.lengthM
    this.v[n] = this.v[0]
    this.s[n] = this.s[0]
  }

  /** Last row of `rows` (sorted by first column) starting at or before second i. */
  private static lastAtOrBefore(rows: number[][], i: number): number {
    let lo = 0
    let hi = rows.length - 1
    if (hi < 0 || rows[0][0] > i) return -1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (rows[mid][0] <= i) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  /** Where the train is `s` seconds into its lap (any s; wraps). */
  at(s: number): TrainNow {
    let t = s % this.periodS
    if (t < 0) t += this.periodS
    const i = Math.floor(t)
    const f = t - i
    // Linear in-between: with 1 s samples the error is under 13 cm at full acceleration.
    const c = this.c[i] + (this.c[i + 1] - this.c[i]) * f
    const kmh = this.v[i] + (this.v[i + 1] - this.v[i]) * f
    const sStopM = this.s[i] + (this.s[i + 1] - this.s[i]) * f
    // Discrete fields come from the last change at or before this second.
    const [, state, station, next, ebrake] = this.events[Math.max(0, Lap.lastAtOrBefore(this.events, i))]
    const k = Lap.lastAtOrBefore(this.sig, i)
    const sigStopC = k >= 0 && i < this.sig[k][1] ? this.sig[k][2] / 10 : null
    return {
      c: this.route.wrap(c),
      kmh: Math.max(0, kmh),
      state: this.names[state] as TrainState,
      station: station >= 0 ? this.names[station] : null,
      next: next >= 0 ? this.names[next] : null,
      ebrake: ebrake === 1,
      sStopM: Math.max(0, sStopM),
      sigStopC,
    }
  }
}

// ── Movement authority ("Safe zones", on by default in the app) ─────────────────────────

const ZC_SAFETY_MARGIN_M = 15 // the authority stops this far behind the train ahead's tail
const ZC_STEP_S = 0.2         // the sim's step; the zone controller runs before trains move in it
const MA_MAX_M = 6000         // the map never draws more than 6 km of authority
const SLACK_CAUTION_M = 15
const SLACK_DANGER_M = 0

export interface AuthorityInput {
  c: number                 // nose chainage
  lengthM: number
  kmh: number
  sigStopC: number | null   // red signal's stop point, when the recorded lap was held by one
}

/** How far each train may run (its end of authority, EOA), the way the sim's zone controller
 *  sets it under moving block: the train ahead's tail less a 15 m margin, measured where that
 *  tail was when the controller last ran (one 0.2 s step back), or a red signal's stop point
 *  if that comes first. Returns metres ahead of each nose, in input order. */
export function authorities(route: Route, trains: AuthorityInput[]): number[] {
  const L = route.lengthM
  const ahead = (a: number, b: number) => (((b - a) % L) + L) % L
  const order = trains.map((_, i) => i).sort((a, b) => trains[a].c - trains[b].c)
  const out = new Array<number>(trains.length)
  order.forEach((idx, k) => {
    const me = trains[idx]
    const leader = trains[order[(k + 1) % order.length]]
    const tail = leader.c - leader.lengthM - (leader.kmh / 3.6) * ZC_STEP_S
    let gap = ahead(me.c, tail)
    if (gap > L - leader.lengthM) gap = 0 // overlapping: the sim treats this as no room at all
    let eoa = gap - ZC_SAFETY_MARGIN_M
    if (me.sigStopC != null) {
      const d = ahead(me.c, me.sigStopC)
      if (d < L / 2) eoa = Math.min(eoa, d)
    }
    out[idx] = Math.max(0, eoa)
  })
  return out
}

export interface Band {
  line: string
  stroke: string
  width: number
  opacity: number
  tick: string
  tickStroke: string
  tickWidth: number
  tickOpacity: number
}

/** The authority line from the nose to the EOA, with a tick across the rail at its end
 *  (TrainLayer.drawBand). Colour and weight warn when the ATP's margin ("slack": authority left
 *  after the train's emergency stopping distance) runs low. `quiet` dims nominal bands when the
 *  map is zoomed out; `nowMs` drives the danger pulse. */
export function band(
  route: Route,
  c: number,
  eoaM: number,
  sStopM: number,
  colors: VisualData["colors"],
  quiet: number,
  nowMs: number,
): Band | null {
  let len = eoaM
  if (len > route.lengthM * 0.75) len = 0
  if (!(len > 0.5)) return null
  len = Math.min(len, MA_MAX_M)
  const p = route.appendRange(c, len)
  if (p.length < 4 || polyLen(p) < 1.5) return null
  const slack = eoaM - sStopM
  const tier = slack < SLACK_DANGER_M ? "danger" : slack < SLACK_CAUTION_M ? "caution" : "nominal"
  let stroke = colors.maBand
  let width = 1.25
  let tickAlpha = 0.85
  if (tier === "caution") { stroke = colors.caution; width = 2.5; tickAlpha = 1 }
  if (tier === "danger") { stroke = colors.danger; width = 3; tickAlpha = 1 }
  const a = tier === "nominal" ? quiet : 1
  let line = `M${f2(p[0])} ${f2(p[1])}`
  for (let i = 2; i < p.length; i += 2) line += `L${f2(p[i])} ${f2(p[i + 1])}`
  const n = p.length
  const ex = p[n - 2]
  const ey = p[n - 1]
  const dx = ex - p[n - 4]
  const dy = ey - p[n - 3]
  const dl = Math.hypot(dx, dy) || 1
  const px = -dy / dl
  const py = dx / dl
  const half = tier === "nominal" ? 3.5 : 4.5
  return {
    line,
    stroke,
    width,
    opacity: Math.max(0, tier === "danger" ? a * (0.7 + 0.3 * Math.sin(nowMs / 140)) : a),
    tick: `M${f2(ex + px * half)} ${f2(ey + py * half)}L${f2(ex - px * half)} ${f2(ey - py * half)}`,
    tickStroke: tier === "nominal" ? colors.maEoa : stroke,
    tickWidth: tier === "nominal" ? 1.5 : 2,
    tickOpacity: Math.max(0, a * tickAlpha),
  }
}

// ── Colours and the displayed speed ──────────────────────────────────────────────────────

/** Body colour on the map (TrainLayer.fillFor). */
export function mapFill(t: TrainNow, colors: VisualData["colors"]): string {
  if (t.ebrake) return colors.ebrake
  if (t.state === "dwelling") return colors.dwelling
  if (t.state === "stopped") return colors.stopped
  if (t.state === "arriving") return colors.arriving
  return colors.running
}

/** Swatch colour in the roster (TrainPanel.trainColor: no separate "arriving" colour). */
export function rosterFill(t: TrainNow, colors: VisualData["colors"]): string {
  if (t.ebrake) return colors.ebrake
  if (t.state === "dwelling") return colors.dwelling
  if (t.state === "stopped") return colors.stopped
  return colors.running
}

const HYSTERESIS_KMH = 0.9

/** The integer km/h the app shows: it only changes once the true speed moves more than 0.9 km/h
 *  away from it, so a steady 79.5 doesn't flicker 79 ↔ 80. Stationary shows exactly 0; moving
 *  never shows 0. 📖 Learn: hysteresis */
export function nextDisplayedKmh(prev: number | undefined, trueKmh: number, stationary: boolean): number {
  if (stationary || !Number.isFinite(trueKmh)) return 0
  const k = Math.max(0, trueKmh)
  if (prev == null || prev === 0) return Math.max(1, Math.round(k))
  if (Math.abs(k - prev) > HYSTERESIS_KMH) return Math.max(1, Math.round(k))
  return prev
}

/** "07:45:00" from seconds since midnight. */
export function formatClock(s: number): string {
  const t = Math.floor(((s % 86400) + 86400) % 86400)
  const two = (n: number) => String(n).padStart(2, "0")
  return `${two(Math.floor(t / 3600))}:${two(Math.floor(t / 60) % 60)}:${two(t % 60)}`
}

"use client"
// The "Automatic Transit Control Simulator for the TTC" experiments card, drawn in code instead of
// a screenshot. It reproduces the simulator's default view (transitcontrol.richardli.dev, 1440×900)
// and keeps it running:
//   - the map's track, platforms, signals, switches and labels are the app's own canvas drawing,
//     recorded as SVG (transit-control-data.json → map.under / map.over)
//   - trains move along a lap recorded from the real sim, drawn with the app's train code
//     (playback.ts), with their movement-authority lines ("Safe zones" is on by default)
//   - the top bar, the inspector's train list and the status bar are laid out with the app's
//     measured geometry, fonts (IBM Plex) and colours
// The whole card is one SVG with viewBox 1440×900, so it scales to any card width with no
// JavaScript measuring and renders the same first frame on the server. 📖 Learn: SVG viewBox

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"
import rawData from "./transit-control-data.json"
import type { VisualData } from "./types"
import {
  Lap, Route, authorities, band, bodyPaths, formatClock, mapFill, nextDisplayedKmh, rosterFill, trainBody,
  type TrainNow,
} from "./playback"

// The app's two typefaces. next/font self-hosts them and exposes CSS variables, which the
// <style> below hands to the SVG text. 📖 Learn: next/font
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--tcv-sans" })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--tcv-mono" })

const data = rawData as unknown as VisualData
const route = new Route(data.route)
const lap = new Lap(data.lap, route)

/** Simulated seconds per real second. 1 = real time, the pace the live app runs at. */
const PLAYBACK_RATE = 1
/** The app re-reads /state every 200 ms; the clock and train list refresh at that rate here too. */
const LIST_REFRESH_MS = 200

// The app's colour tokens (cbtc frontend/src/styles/app.css)
const C = {
  background: "#09090b",
  card: "#111113",
  foreground: "#f4f4f5",
  muted: "#a1a1aa",
  faint: "#71717a",
  border: "#27272a",
  borderStrong: "#3f3f46",
  accent: "#232326",
  rowBorder: "rgba(39, 39, 42, 0.6)", // border-border/60
  ok: "#3dbb7e",
  line1: "#ffcd00",
  line1Foreground: "#16130a",
}

// Layout, measured from the app at 1440×900 (CSS px)
const TOP_BAR_H = 40
const STATUS_Y = 872
const INSPECTOR_X = 1120
const ROW_Y0 = 138       // first train row
const ROW_H = 28
const COL_RUN_X = 1153   // "Run N" (after the 12×8 swatch at 1133)
const COL_NEXT_X = 1231.38
const COL_KMH_RIGHT = 1428

// Trains sorted by run number, the order of the app's train list (TrainPanel Roster)
const runNo = (label: string) => Number(label.match(/\d+/)?.[0] ?? 0)
const rosterOrder = data.trains.map((_, i) => i).sort((a, b) => runNo(data.trains[a].label) - runNo(data.trains[b].label))
const VISIBLE_ROWS = Math.ceil((STATUS_Y - ROW_Y0) / ROW_H)

// ── one moment of the line ────────────────────────────────────────────────────────────────

interface TrainFrame {
  now: TrainNow
  body: ReturnType<typeof bodyPaths>
  fill: string
  band: ReturnType<typeof band>
}

/** Every train `tau` seconds after the recorded snapshot (tau = 0 is the snapshot itself). */
function frameAt(tau: number, nowMs: number): TrainFrame[] {
  const trains = data.trains.map((t) => ({ ...lap.at(t.phase + tau), lengthM: t.lengthM }))
  const eoa = authorities(route, trains)
  return trains.map((now, i) => ({
    now,
    body: bodyPaths(trainBody(route, now.c, now.lengthM, data.pxPerM)),
    fill: mapFill(now, data.colors),
    band: band(route, now.c, eoa[i], now.sStopM, data.colors, data.bandQuiet, nowMs),
  }))
}

interface Row {
  label: string
  swatch: string
  nextStop: string
  kmh: number
}

/** The train list's rows. `shown` remembers each train's displayed km/h between refreshes. */
function rowsAt(frame: TrainFrame[], shown: Map<number, number>): Row[] {
  return rosterOrder.slice(0, VISIBLE_ROWS).map((i) => {
    const t = frame[i].now
    const kmh = nextDisplayedKmh(shown.get(i), t.kmh, t.state === "dwelling" || t.kmh < 0.05)
    shown.set(i, kmh)
    return {
      label: data.trains[i].label,
      swatch: rosterFill(t, data.colors),
      nextStop: t.state === "dwelling" && t.station ? `At ${t.station}` : t.next ?? "—",
      kmh,
    }
  })
}

// ── the component ─────────────────────────────────────────────────────────────────────────

export function TransitControlVisual() {
  // The first frame (also what the server renders): the snapshot itself.
  const first = useMemo(() => frameAt(0, 0), [])
  const [list, setList] = useState(() => ({ clock: data.clockS, rows: rowsAt(first, new Map()) }))

  const rootRef = useRef<SVGSVGElement>(null)
  // One <path> per drawn piece, updated directly each animation frame (no React re-render:
  // 59 trains × 6 paths at display rate would be wasted work). 📖 Learn: useRef for DOM nodes
  const bandRefs = useRef<(SVGPathElement | null)[]>([])
  const tickRefs = useRef<(SVGPathElement | null)[]>([])
  const bodyRefs = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    // Visitors who ask their OS for less motion get the still first frame. 📖 Learn: prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let visible = false
    let tau = 0
    let last = 0
    let raf = 0
    let lastList = 0
    const shown = new Map<number, number>()

    const draw = (ms: number) => {
      raf = requestAnimationFrame(draw)
      // Off-screen time is paused rather than skipped, so the trains never jump.
      const dt = last ? Math.min(0.25, (ms - last) / 1000) : 0
      last = ms
      tau += dt * PLAYBACK_RATE
      const frame = frameAt(tau, ms)
      frame.forEach((f, i) => {
        const bandEl = bandRefs.current[i]
        const tickEl = tickRefs.current[i]
        if (bandEl && tickEl) {
          const b = f.band
          bandEl.setAttribute("d", b ? b.line : "")
          tickEl.setAttribute("d", b ? b.tick : "")
          if (b) {
            bandEl.setAttribute("stroke", b.stroke)
            bandEl.setAttribute("stroke-width", String(b.width))
            bandEl.setAttribute("opacity", String(b.opacity))
            tickEl.setAttribute("stroke", b.tickStroke)
            tickEl.setAttribute("stroke-width", String(b.tickWidth))
            tickEl.setAttribute("opacity", String(b.tickOpacity))
          }
        }
        const g = bodyRefs.current[i]
        if (g) {
          const [outline, outlineNose, body, nose] = g.children
          outline.setAttribute("d", f.body.line)
          outlineNose.setAttribute("d", f.body.noseOutline)
          body.setAttribute("d", f.body.line)
          body.setAttribute("stroke", f.fill)
          nose.setAttribute("d", f.body.nose)
          nose.setAttribute("fill", f.fill)
        }
      })
      if (ms - lastList >= LIST_REFRESH_MS) {
        lastList = ms
        setList({ clock: data.clockS + tau, rows: rowsAt(frame, shown) })
      }
    }

    // Only animate while the card is on screen. 📖 Learn: IntersectionObserver
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true
        last = 0
        raf = requestAnimationFrame(draw)
      } else if (!entry.isIntersecting && visible) {
        visible = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(root)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const { width: W, height: H } = data.stage
  const M = data.map

  return (
    <svg
      ref={rootRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`${plexSans.variable} ${plexMono.variable}`}
      style={{ display: "block", width: "100%", height: "auto", background: C.background }}
      role="img"
      aria-label={`The simulator running TTC Line 1: ${data.status.inService} trains on the line diagram from Vaughan Metropolitan Centre to Finch, with the train list beside it`}
    >
      <style>{`
        .tcv-s { font-family: var(--tcv-sans), sans-serif; }
        .tcv-m { font-family: var(--tcv-mono), monospace; font-variant-numeric: tabular-nums slashed-zero; }
        .tcv-chrome text { -webkit-font-smoothing: antialiased; }
        .tcv-map text { -webkit-font-smoothing: auto; }
      `}</style>

      {/* ── Map (the app's canvas: 1120×832 under the top bar) ── */}
      <svg x={M.x} y={M.y} width={M.width} height={M.height} viewBox={`0 0 ${M.width} ${M.height}`} className="tcv-map">
        <rect width={M.width} height={M.height} fill={data.colors.background} />
        <g dangerouslySetInnerHTML={{ __html: M.under }} />
        <MapTrains first={first} bandRefs={bandRefs} tickRefs={tickRefs} bodyRefs={bodyRefs} />
        <g dangerouslySetInnerHTML={{ __html: M.over }} />
        <ZoomControl />
      </svg>

      <g className="tcv-chrome">
        <TopBar clock={formatClock(list.clock)} />
        <Inspector rows={list.rows} />
        <StatusBar />
      </g>
    </svg>
  )
}

// ── trains layer ─────────────────────────────────────────────────────────────────────────

type Refs<T> = React.MutableRefObject<(T | null)[]>

/** Authority lines under every train, then the bodies. Rendered once with the first frame, then
 *  moved by the animation loop through the refs; memo keeps the 5 Hz list updates from ever
 *  re-rendering it. 📖 Learn: React.memo */
const MapTrains = memo(function MapTrains(props: {
  first: TrainFrame[]
  bandRefs: Refs<SVGPathElement>
  tickRefs: Refs<SVGPathElement>
  bodyRefs: Refs<SVGGElement>
}) {
  const { first, bandRefs, tickRefs, bodyRefs } = props
  return (
    <>
      <g>
        {first.map((f, i) => (
          <g key={i}>
            <path
              ref={(el) => { bandRefs.current[i] = el }}
              d={f.band?.line ?? ""}
              fill="none"
              stroke={f.band?.stroke}
              strokeWidth={f.band?.width}
              strokeLinejoin="round"
              opacity={f.band?.opacity}
            />
            <path
              ref={(el) => { tickRefs.current[i] = el }}
              d={f.band?.tick ?? ""}
              fill="none"
              stroke={f.band?.tickStroke}
              strokeWidth={f.band?.tickWidth}
              strokeLinejoin="round"
              opacity={f.band?.tickOpacity}
            />
          </g>
        ))}
      </g>
      <g>
        {first.map((f, i) => (
          // knockout outline (8 px, background colour) then the body (6 px, state colour)
          <g key={i} ref={(el) => { bodyRefs.current[i] = el }}>
            <path d={f.body.line} fill="none" stroke={data.colors.border} strokeWidth={8} strokeLinejoin="round" />
            <path d={f.body.noseOutline} fill={data.colors.border} />
            <path d={f.body.line} fill="none" stroke={f.fill} strokeWidth={6} strokeLinejoin="round" />
            <path d={f.body.nose} fill={f.fill} />
          </g>
        ))}
      </g>
    </>
  )
})

// ── chrome ───────────────────────────────────────────────────────────────────────────────

/** SVG text in the app's type: sans unless `mono`; `upper` mirrors CSS text-transform. */
function T(props: {
  x: number
  y: number
  size: number
  weight?: number
  color: string
  mono?: boolean
  anchor?: "start" | "middle" | "end"
  spacing?: number
  children: string | number
}) {
  return (
    <text
      x={props.x}
      y={props.y}
      className={props.mono ? "tcv-m" : "tcv-s"}
      fontSize={props.size}
      fontWeight={props.weight ?? 400}
      fill={props.color}
      textAnchor={props.anchor}
      letterSpacing={props.spacing}
    >
      {props.children}
    </text>
  )
}

/** A 1 px border drawn inside a box, like CSS `border: 1px` (the stroke sits on the half pixel). */
function Box(props: { x: number; y: number; w: number; h: number; r?: number; fill?: string; stroke?: string }) {
  return (
    <rect
      x={props.x + 0.5}
      y={props.y + 0.5}
      width={props.w - 1}
      height={props.h - 1}
      rx={props.r}
      fill={props.fill ?? "none"}
      stroke={props.stroke ?? "none"}
    />
  )
}

/** A lucide icon (24×24 grid, 2 px strokes) at `size` px. */
function Icon(props: { x: number; y: number; size: number; color: string; children: React.ReactNode }) {
  return (
    <g
      transform={`translate(${props.x} ${props.y}) scale(${props.size / 24})`}
      fill="none"
      stroke={props.color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {props.children}
    </g>
  )
}

/** Two joined buttons (Schematic | Map, Safe zones | Labels). `on` says which halves are pressed. */
function Segmented(props: { x: number; split: number; right: number; labels: [string, number][]; on: [boolean, boolean] }) {
  const { x, split, right, on } = props
  return (
    <g>
      {on[0] && <path d={`M${x + 4} 5.5H${split}V33.5H${x + 4}A4 4 0 0 1 ${x} 29.5V9.5A4 4 0 0 1 ${x + 4} 5.5Z`} fill={C.accent} />}
      {on[1] && <path d={`M${split} 5.5H${right - 4}A4 4 0 0 1 ${right} 9.5V29.5A4 4 0 0 1 ${right - 4} 33.5H${split}Z`} fill={C.accent} />}
      <Box x={x} y={5.5} w={right - x} h={28} r={3.5} stroke={C.borderStrong} />
      <rect x={split - 1} y={5.5} width={1} height={28} fill={C.borderStrong} />
      {props.labels.map(([text, tx], i) => (
        <T key={text} x={tx} y={23.5} size={12} weight={500} color={on[i] ? C.foreground : C.muted}>{text}</T>
      ))}
    </g>
  )
}

function TopBar({ clock }: { clock: string }) {
  return (
    <g>
      <rect width={1440} height={TOP_BAR_H} fill={C.card} />
      <rect y={TOP_BAR_H - 1} width={1440} height={1} fill={C.border} />
      {/* Line 1 roundel and title */}
      <circle cx={22} cy={19.5} r={10} fill={C.line1} />
      <T x={22} y={23} size={11} weight={700} color={C.line1Foreground} anchor="middle">1</T>
      <T x={42} y={23.5} size={13} weight={500} color={C.foreground}>Yonge–University</T>
      <T x={156} y={23.5} size={12} color={C.muted}>CBTC simulator</T>
      {/* The app's separators sit at the top of the bar, not centred: kept as drawn */}
      <rect x={255} y={0} width={1} height={16} fill={C.border} />
      <T x={272} y={23.5} size={10.5} weight={500} color={C.faint} spacing={0.63}>SIM</T>
      <T x={301.09} y={23.5} size={13} weight={500} color={C.foreground} mono>{clock}</T>

      <Segmented x={996.2} split={1072} right={1112.4} labels={[["Schematic", 1005.22], ["Map", 1079.95]]} on={[true, false]} />
      <Segmented x={1118.4} split={1195.8} right={1248.6} labels={[["Safe zones", 1127.44], ["Labels", 1203.75]]} on={[true, true]} />
      <rect x={1264.6} y={0} width={1} height={16} fill={C.border} />
      <Box x={1281.6} y={5.5} w={54.4} h={28} r={3.5} stroke={C.borderStrong} />
      <T x={1292.63} y={23.5} size={12} weight={500} color={C.foreground}>Guide</T>
      {/* About (info), More (⋯) and the pressed inspector toggle */}
      <Icon x={1346} y={11.5} size={16} color={C.muted}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </Icon>
      <Icon x={1378} y={11.5} size={16} color={C.muted}>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </Icon>
      <rect x={1404} y={5.5} width={28} height={28} rx={4} fill={C.accent} />
      <Icon x={1410} y={11.5} size={16} color={C.foreground}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M15 3v18" />
      </Icon>
    </g>
  )
}

/** + / − / fit, bottom right of the map (coordinates relative to the map). */
function ZoomControl() {
  const x = 1078
  const y = 774 - TOP_BAR_H
  return (
    <g className="tcv-chrome">
      <Box x={x} y={y} w={30} h={86} r={3.5} fill={C.card} stroke={C.borderStrong} />
      <Box x={x + 1} y={y + 1} w={28} h={28} stroke={C.border} />
      <Box x={x + 1} y={y + 29} w={28} h={28} stroke={C.border} />
      <Icon x={x + 8} y={y + 8} size={14} color={C.foreground}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </Icon>
      <Icon x={x + 8} y={y + 36} size={14} color={C.foreground}>
        <path d="M5 12h14" />
      </Icon>
      <Icon x={x + 8} y={y + 64} size={14} color={C.foreground}>
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </Icon>
    </g>
  )
}

function Inspector({ rows }: { rows: Row[] }) {
  const x = INSPECTOR_X
  return (
    <g>
      <rect x={x} y={TOP_BAR_H} width={320} height={STATUS_Y - TOP_BAR_H} fill={C.card} />
      <rect x={x} y={TOP_BAR_H} width={1} height={STATUS_Y - TOP_BAR_H} fill={C.border} />
      {/* Tabs: Train (selected, 2 px underline) · Dispatch · Events */}
      <rect x={x + 1} y={75} width={319} height={1} fill={C.border} />
      <T x={1137} y={61.5} size={12} weight={500} color={C.foreground}>Train</T>
      <rect x={1133} y={74} width={35.6} height={2} fill={C.foreground} />
      <T x={1184.63} y={61.5} size={12} weight={500} color={C.muted}>Dispatch</T>
      <T x={1252.98} y={61.5} size={12} weight={500} color={C.muted}>Events</T>
      <T x={1296.08} y={60.5} size={10} color={C.faint} mono>{data.status.events}</T>

      <T x={1133} y={98} size={12} color={C.muted}>No train selected. Click one on the map or pick it here.</T>
      <rect x={x + 1} y={112} width={319} height={1} fill={C.border} />
      <T x={1133} y={129} size={10.5} weight={500} color={C.faint} spacing={0.63}>RUN</T>
      <T x={1231.38} y={129} size={10.5} weight={500} color={C.faint} spacing={0.63}>NEXT STOP</T>
      <T x={1398.13} y={129} size={10.5} weight={500} color={C.faint} spacing={0.63}>KM/H</T>
      <rect x={x + 1} y={137} width={319} height={1} fill={C.border} />

      {/* The train list scrolls in the app; here it is cut off at the status bar like the default view */}
      <svg x={x + 1} y={ROW_Y0} width={319} height={STATUS_Y - ROW_Y0} overflow="hidden">
        <g transform={`translate(${-(x + 1)} ${-ROW_Y0})`}>
          {rows.map((r, i) => {
            const top = ROW_Y0 + i * ROW_H
            return (
              <g key={r.label}>
                <rect x={1133} y={top + 9.5} width={12} height={8} rx={1} fill={r.swatch} />
                <T x={COL_RUN_X} y={top + 17.5} size={12} color={C.foreground}>{r.label}</T>
                <T x={COL_NEXT_X} y={top + 17.5} size={12} color={C.muted}>{r.nextStop}</T>
                <T x={COL_KMH_RIGHT} y={top + 17.5} size={11} color={C.muted} mono anchor="end">{r.kmh}</T>
                <rect x={x + 1} y={top + ROW_H - 1} width={319} height={1} fill={C.rowBorder} />
              </g>
            )
          })}
        </g>
      </svg>
    </g>
  )
}

function StatusBar() {
  const s = data.status
  return (
    <g>
      <rect y={STATUS_Y} width={1440} height={900 - STATUS_Y} fill={C.card} />
      <rect y={STATUS_Y} width={1440} height={1} fill={C.border} />
      <circle cx={15} cy={886.5} r={3} fill={C.ok} />
      <T x={24} y={890.5} size={11} weight={500} color={C.foreground}>Live</T>
      <rect x={56.2} y={873} width={1} height={12} fill={C.border} />
      <T x={69.22} y={890.5} size={11} color={C.foreground} mono>{s.inService}</T>
      <T x={85.02} y={890.5} size={11} color={C.muted}>trains</T>
      <T x={125.11} y={890.5} size={11} color={C.muted}>Headway</T>
      <T x={173.45} y={890.5} size={11} color={C.foreground} mono>{s.headway}</T>
      <T x={206.45} y={890.5} size={11} color={C.muted} mono>/</T>
      <T x={219.67} y={890.5} size={11} color={C.muted} mono>{s.target}</T>
      <T x={258.08} y={890.5} size={11} color={C.muted}>{s.period}</T>
      <T x={1385.5} y={890.5} size={11} weight={500} color={C.muted}>Legend</T>
    </g>
  )
}

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

// Shared drawing kit for the Transit Planner diagrams (council-graph.tsx, architecture.tsx).
//
// Every node is drawn like the Transit Planner app's "Ask AI" button
// (transit-planner web/src/app/_components/TransitMap.tsx): a rounded-xl pill with a
// 1px border, a soft shadow, an icon, and a grey Google Sans label.
//
// Each diagram is ONE <svg> with a fixed viewBox, so it scales to any column width with no
// JavaScript measuring and renders the same on the server.
// 📖 Learn: SVG viewBox (one coordinate system that the browser scales for you)

// ── Theme ─────────────────────────────────────────────────────────────────────
// The app's own colours, light and dark, copied from transit-planner
// web/src/styles/globals.css (its dark mode remaps bg-white → #1c1c1e, stone-400 → #8e8e93…).
// They're hardcoded instead of using this site's vars because the diagrams reproduce the
// app's UI. The dark set switches on with this site's theme: next-themes puts
// class="dark" on <html>. 📖 Learn: CSS custom properties (var(--name))
const LIGHT = {
  canvas: "#efeeeb", // a step darker than the app's map so the white pills stand out
  canvasDot: "#dbd8d3",
  pill: "#ffffff",
  pillBorder: "#D7D7D7", // border-[#D7D7D7] on the app's buttons
  label: "#57534e", // stone-600
  codeLabel: "#78716c", // stone-500
  muted: "#a8a29e", // stone-400: the Ask AI pill's resting text and icon colour
  note: "#8c857f",
  edge: "#b5afa9",
  ai: "#0d9488", // teal-600: the app's house rule is teal = AI
  loop: "#6366f1", // indigo-500: the app's chrome accent
  zoneFill: "rgba(255,255,255,0.5)",
  zoneBorder: "#dedad5",
  terminal: "#ebe8e4",
  mapbox: "#000000", // Mapbox's brand colour is black, which vanishes on the dark canvas
}

const DARK: typeof LIGHT = {
  canvas: "#0b0b0c", // near-black, so the #1c1c1e pills read clearly against it
  canvasDot: "#1f1f21",
  pill: "#1c1c1e", // the app's dark bg-white
  pillBorder: "#3a3a3c",
  label: "#e5e5ea", // dark stone-700
  codeLabel: "#c7c7cc", // dark stone-600
  muted: "#8e8e93", // dark stone-400
  note: "#8e8e93",
  edge: "#55555a",
  ai: "#2dd4bf", // the app lightens teal for dark backgrounds
  loop: "#818cf8", // indigo-400, readable on dark
  zoneFill: "rgba(255,255,255,0.025)",
  zoneBorder: "#38383b",
  terminal: "#2c2c2e",
  mapbox: "#ffffff",
}

type TokenName = keyof typeof LIGHT

// "canvasDot" → "--tpd-canvas-dot"
function cssVarName(name: string): string {
  return "--tpd-" + name.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase())
}

function declarations(tokens: typeof LIGHT): string {
  return Object.entries(tokens)
    .map(([name, value]) => `${cssVarName(name)}: ${value};`)
    .join(" ")
}

// ── Flow animation timing (used by FlowOverlay and Pill) ─────────────────────
// Colour flows along an edge in TRAVEL_MS; the node it reaches lights up just before it arrives.
export const TRAVEL_MS = 560
const ARRIVAL_DELAY_MS = 420 // a node's border waits this long, so it lights as the colour lands
const TRAIL_FADE_DELAY_MS = 900 // the drawn trail lingers, then fades

// Keyframes for FlowOverlay. Paths there use pathLength="1", so dash lengths and offsets are
// fractions of the path (0 = start, 1 = end) whatever the path's real length.
// 📖 Learn: SVG pathLength, stroke-dasharray / stroke-dashoffset line-drawing animations
const FLOW_CSS = `
@keyframes tpd-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes tpd-fade { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .tpd * { animation: none !important; transition: none !important; }
}`

const THEME_CSS = `.tpd { ${declarations(LIGHT)} } .dark .tpd { ${declarations(DARK)} } ${FLOW_CSS}`

/** Colour tokens as var() references, e.g. APP.pill → "var(--tpd-pill)". Use them in `style`. */
export const APP = Object.fromEntries(
  Object.keys(LIGHT).map((name) => [name, `var(${cssVarName(name)})`]),
) as Record<TokenName, string>

export const FONT = '"Google Sans", ui-sans-serif, system-ui, sans-serif'
export const MONO = '"Google Sans Code", ui-monospace, SFMono-Regular, Menlo, monospace'

// The app loads Google Sans the same way (a Google Fonts stylesheet in its layout).
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&family=Google+Sans+Code:wght@400&display=swap"

// ── Brand logos ───────────────────────────────────────────────────────────────
// Paths from Simple Icons v16 (simpleicons.org, CC0), all drawn in a 24×24 box, with each
// brand's own colour. The logos themselves are their owners' trademarks, used here only to
// name the service. Langfuse and the TTC aren't in Simple Icons, so they use a plain icon.
export type BrandLogo = { path: string; color: string }

export const LOGOS = {
  mapbox: {
    color: APP.mapbox,
    path: "M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.696 14.943c-4.103 4.103-11.433 2.794-11.433 2.794S4.94 10.421 9.057 6.304c2.281-2.281 6.061-2.187 8.45.189s2.471 6.168.189 8.45zm-4.319-7.91l-1.174 2.416-2.416 1.174 2.416 1.174 1.174 2.416 1.174-2.416 2.416-1.174-2.416-1.174-1.174-2.416z",
  },
  claude: {
    color: "#D97757",
    path: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
  },
  gemini: {
    color: "#8E75B2",
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
  supabase: {
    color: "#3FCF8E",
    path: "M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z",
  },
} satisfies Record<string, BrandLogo>

// ── Pill geometry ─────────────────────────────────────────────────────────────
// A pill's width = measured text width + its padding. Text widths in the diagram files were
// measured once in headless Chrome with Google Sans; re-measure if you change a label.
type PillSize = "md" | "sm"
const GEOMETRY = {
  md: { padX: 18, icon: 15, gap: 9 }, // the default, sized like the app's buttons
  sm: { padX: 14, icon: 14, gap: 8 }, // tighter, for a crowded row (external services)
}

/** Extra width a pill adds around its text: both paddings, plus the icon and its gap. */
export function pillPadding(size: PillSize, hasIcon: boolean): number {
  const g = GEOMETRY[size]
  return hasIcon ? g.padX * 2 + g.icon + g.gap : g.padX * 2 + 4
}

/** Height of a pill, so diagrams can compute where edges should start and end. */
export function pillHeight(hasSub: boolean): number {
  return hasSub ? 52 : 40
}

// The four-point star from the app's Ask AI button, in a 16×16 box.
const SPARKLE_PATH = "M8 1.5L9.5 6L14 7.5L9.5 9L8 13.5L6.5 9L2 7.5L6.5 6Z"

export function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  // A nested <svg> is how you place a small icon at any spot inside a bigger SVG.
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 16 16">
      <path d={SPARKLE_PATH} style={{ fill: APP.ai }} />
    </svg>
  )
}

/** A lucide icon in the muted grey. lucide strokes with currentColor, so we set `color`. */
export function MutedIcon({ Icon, x, y, size }: { Icon: LucideIcon; x: number; y: number; size: number }) {
  return <Icon x={x} y={y} size={size} strokeWidth={1.75} style={{ color: APP.muted }} />
}

type PillIcon = "ai" | LucideIcon | BrandLogo | null

type PillProps = {
  id: string // the diagram's id prefix, for the shared shadow filter
  cx: number
  cy: number
  textWidth: number // measured width of the longest line (label or sub)
  label: string
  sub?: string
  subMono?: boolean // set for code-ish subs like "/api/council"
  /** "ai" = teal sparkle, a lucide icon = plain code, a BrandLogo = an outside service, null = text only */
  icon: PillIcon
  size?: PillSize
  /** Animated diagrams: true while this node is the current step (its border lights up). */
  active?: boolean
}

function isBrandLogo(icon: PillIcon): icon is BrandLogo {
  // lucide icons are React components (objects too), so check for the logo's own field
  return typeof icon === "object" && icon !== null && "path" in icon
}

export function Pill({ id, cx, cy, textWidth, label, sub, subMono, icon, size = "md", active }: PillProps) {
  const g = GEOMETRY[size]
  const hasIcon = icon !== null
  const width = Math.ceil(textWidth) + pillPadding(size, hasIcon)
  const height = pillHeight(Boolean(sub))
  const left = cx - width / 2
  const top = cy - height / 2

  // With an icon, text starts after it; with no icon, text is centred in the pill.
  const textX = hasIcon ? left + g.padX + g.icon + g.gap : cx
  const anchor = hasIcon ? "start" : "middle"
  const labelY = sub ? cy - 8 : cy
  const iconX = left + g.padX
  const iconY = labelY - g.icon / 2

  let iconElement: ReactNode = null
  if (icon === "ai") {
    iconElement = <Sparkle x={iconX} y={iconY} size={g.icon} />
  } else if (isBrandLogo(icon)) {
    iconElement = (
      <svg x={iconX} y={iconY} width={g.icon} height={g.icon} viewBox="0 0 24 24">
        <path d={icon.path} style={{ fill: icon.color }} />
      </svg>
    )
  } else if (icon !== null) {
    iconElement = <MutedIcon Icon={icon} x={iconX} y={iconY} size={g.icon} />
  }

  // A lit node gets a flat border in the accent colour (no glow), following the app's rule:
  // teal for AI, indigo (the chrome accent) for the rest.
  const accent = icon === "ai" ? APP.ai : APP.loop
  // Lighting up waits for the flowing colour to arrive; going dark fades slowly with no wait.
  // (A CSS transition uses the timing of the state it is moving TO.)
  const borderTransition = active
    ? `stroke 450ms ease-out ${ARRIVAL_DELAY_MS}ms, stroke-width 450ms ease-out ${ARRIVAL_DELAY_MS}ms`
    : "stroke 900ms ease-in-out, stroke-width 900ms ease-in-out"

  return (
    <g>
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={12}
        filter={`url(#${id}-shadow)`}
        style={{
          fill: APP.pill,
          stroke: active ? accent : APP.pillBorder,
          strokeWidth: active ? 1.75 : 1,
          transition: borderTransition,
        }}
      />
      {iconElement}
      <text
        x={textX}
        y={labelY}
        textAnchor={anchor}
        dominantBaseline="central"
        fontSize={14}
        style={{ fill: icon === "ai" ? APP.label : APP.codeLabel }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={textX}
          y={cy + 10}
          textAnchor={anchor}
          dominantBaseline="central"
          fontSize={subMono ? 11 : 11.5}
          fontFamily={subMono ? MONO : undefined}
          style={{ fill: APP.muted }}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

/** The small grey START / END chips LangGraph uses for a graph's entry and exit. */
export function Terminal({ cx, cy, label, active }: { cx: number; cy: number; label: string; active?: boolean }) {
  return (
    <g>
      <rect x={cx - 30} y={cy - 11} width={60} height={22} rx={11} style={{ fill: APP.terminal }} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        letterSpacing={1}
        style={{
          fill: active ? APP.loop : APP.muted,
          transition: active ? `fill 450ms ease-out ${ARRIVAL_DELAY_MS}ms` : "fill 900ms ease-in-out",
        }}
      >
        {label}
      </text>
    </g>
  )
}

export type Point = [number, number]

/**
 * Turns a list of corner points into an SVG path whose corners are rounded.
 * For each inner corner we stop `radius` short of it, then curve through it with a
 * quadratic Bézier (Q) to a point `radius` past it.
 * 📖 Learn: SVG path commands (M = move, L = line, Q = quadratic curve)
 */
function roundedPath(points: Point[], radius: number): string {
  const [startX, startY] = points[0]
  let path = `M ${startX} ${startY}`

  for (let i = 1; i < points.length - 1; i++) {
    const [prevX, prevY] = points[i - 1]
    const [cornerX, cornerY] = points[i]
    const [nextX, nextY] = points[i + 1]

    const lengthIn = Math.hypot(cornerX - prevX, cornerY - prevY)
    const lengthOut = Math.hypot(nextX - cornerX, nextY - cornerY)
    // Never round more than half a segment, or short segments would overlap.
    const r = Math.min(radius, lengthIn / 2, lengthOut / 2)

    const beforeX = cornerX - ((cornerX - prevX) / lengthIn) * r
    const beforeY = cornerY - ((cornerY - prevY) / lengthIn) * r
    const afterX = cornerX + ((nextX - cornerX) / lengthOut) * r
    const afterY = cornerY + ((nextY - cornerY) / lengthOut) * r

    path += ` L ${beforeX} ${beforeY} Q ${cornerX} ${cornerY} ${afterX} ${afterY}`
  }

  const [endX, endY] = points[points.length - 1]
  return `${path} L ${endX} ${endY}`
}

type EdgeProps = {
  id: string
  points: Point[]
  tone?: "default" | "loop"
  dashed?: boolean
  arrow?: "end" | "both" | "none"
}

export function Edge({ id, points, tone = "default", dashed = false, arrow = "end" }: EdgeProps) {
  const marker = `url(#${id}-arrow-${tone})`
  return (
    <path
      d={roundedPath(points, 10)}
      fill="none"
      strokeWidth={1.5}
      strokeDasharray={dashed ? "4 4" : undefined}
      markerEnd={arrow === "none" ? undefined : marker}
      // orient="auto-start-reverse" on the marker flips the start arrow to point backwards
      markerStart={arrow === "both" ? marker : undefined}
      style={{ stroke: tone === "loop" ? APP.loop : APP.edge }}
    />
  )
}

type FlowOverlayProps = {
  points: Point[] // the same corner points as the Edge it travels
  color: "ai" | "loop"
  reverse?: boolean // travel end → start (the two-way arrows between paired agents)
}

/**
 * Colour flowing along an edge: a flat line in the accent colour draws in from start to end,
 * lingers, then fades. Mount it with a new React `key` for each trip, since remounting is
 * what restarts a CSS animation.
 */
export function FlowOverlay({ points, color, reverse = false }: FlowOverlayProps) {
  // Reversing the point list makes the same path run the other way.
  const d = roundedPath(reverse ? [...points].reverse() : points, 10)
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      style={{
        pointerEvents: "none",
        stroke: color === "ai" ? APP.ai : APP.loop,
        strokeWidth: 2,
        strokeDasharray: "1 1", // one dash as long as the whole path, then a gap
        strokeDashoffset: 1, // start fully hidden; tpd-draw slides it into view
        animation: `tpd-draw ${TRAVEL_MS}ms ease-in-out forwards, tpd-fade 700ms ease-in-out ${TRAIL_FADE_DELAY_MS}ms forwards`,
      }}
    />
  )
}

type LabelProps = {
  x: number
  y: number
  children: ReactNode
  anchor?: "start" | "middle" | "end"
  tone?: "note" | "loop"
  mono?: boolean
  size?: number
  rotate?: number // degrees, turned about (x, y)
}

/**
 * Small text beside a node or an edge. Labels always sit NEXT TO lines, never on them:
 * an outline trick to cut a gap in the line still let it show through the spaces between words.
 */
export function Label({ x, y, children, anchor = "start", tone = "note", mono = false, size, rotate }: LabelProps) {
  return (
    <text
      x={x}
      y={y}
      // rotate(angle cx cy) turns the text about its own anchor point
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={size ?? (mono ? 10.5 : 12)}
      fontFamily={mono ? MONO : undefined}
      style={{ fill: tone === "loop" ? APP.loop : APP.note }}
    >
      {children}
    </text>
  )
}

type ZoneProps = {
  x: number
  y: number
  width: number
  height: number
  label: string
  labelX?: number // override when an edge would cross the label at its usual spot
}

/** A dashed rounded box that groups nodes, e.g. "Browser" or "External services". */
export function Zone({ x, y, width, height, label, labelX }: ZoneProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={18}
        strokeDasharray="5 5"
        style={{ fill: APP.zoneFill, stroke: APP.zoneBorder }}
      />
      <text
        x={labelX ?? x + 16}
        y={y + 18}
        dominantBaseline="central"
        fontSize={10.5}
        letterSpacing={1}
        style={{ fill: APP.muted }}
      >
        {label}
      </text>
    </g>
  )
}

type FrameProps = {
  id: string // unique per diagram: prefixes the <defs> ids so two diagrams on one page don't clash
  width: number
  height: number
  title: string
  description: string
  caption: ReactNode
  children: ReactNode
}

/** The canvas (dot grid, rounded card) plus the shared <defs> every diagram needs. */
export function DiagramFrame({ id, width, height, title, description, caption, children }: FrameProps) {
  return (
    <figure className="tpd my-6 max-w-[860px]">
      {/* React 19 moves a <link rel="stylesheet" precedence> or a <style href precedence>
          rendered anywhere up into <head>, and de-duplicates them by href, so the fonts and
          theme tokens load once, and only on pages that show a diagram.
          📖 Learn: React 19 stylesheet support (the `precedence` prop) */}
      <link rel="stylesheet" href={FONT_HREF} precedence="default" />
      <style href="tp-diagram-theme" precedence="default">
        {THEME_CSS}
      </style>
      {/* overflow-x-auto + a min width: on a phone the diagram keeps a readable text size
          and scrolls sideways inside its card instead of shrinking to unreadable. */}
      <div
        className="squircle overflow-x-auto border"
        style={{ background: APP.canvas, borderColor: "var(--border-2)", borderRadius: 16 }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full"
          style={{ minWidth: 560, fontFamily: FONT }}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>{title}</title>
          <desc id={`${id}-desc`}>{description}</desc>
          <defs>
            <pattern id={`${id}-dots`} width={16} height={16} patternUnits="userSpaceOnUse">
              <circle cx={1.5} cy={1.5} r={1} style={{ fill: APP.canvasDot }} />
            </pattern>
            {/* Two stacked drop shadows, close to Tailwind's shadow-sm on the app's buttons */}
            <filter id={`${id}-shadow`} x="-20%" y="-40%" width="140%" height="200%">
              <feDropShadow dx={0} dy={1} stdDeviation={1.2} floodColor="#000" floodOpacity={0.08} />
              <feDropShadow dx={0} dy={3} stdDeviation={5} floodColor="#000" floodOpacity={0.07} />
            </filter>
            {/* One arrowhead per colour (simpler and better supported than fill="context-stroke") */}
            <ArrowMarker id={`${id}-arrow-default`} color={APP.edge} />
            <ArrowMarker id={`${id}-arrow-loop`} color={APP.loop} />
          </defs>
          <rect width={width} height={height} style={{ fill: APP.canvas }} />
          <rect width={width} height={height} fill={`url(#${id}-dots)`} />
          {children}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm" style={{ color: "var(--text-3)" }}>
        {caption}
      </figcaption>
    </figure>
  )
}

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX={9}
      refY={5}
      markerWidth={7}
      markerHeight={7}
      orient="auto-start-reverse"
    >
      <path d="M 1 1 L 9 5 L 1 9 Z" style={{ fill: color }} />
    </marker>
  )
}

"use client"
import { useEffect, useState } from "react"
import { RotateCcw, Settings, Shuffle, Users, Vote } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { DiagramFrame, Edge, FlowOverlay, Label, MutedIcon, Pill, Sparkle, Terminal, type Point } from "./diagram-kit"

// The AI council's LangGraph StateGraph, node for node and edge for edge, as wired in
// transit-planner web/src/server/council-graph.ts (the addNode / addEdge calls at the bottom).
// Sparkle nodes call a model; the others are plain code (routers, the simulation, the vote count).
//
// Once the diagram is scrolled into view it "runs": colour flows along each edge in execution
// order and the node it reaches lights up, including one trip round the revise loop, then repeats.
//
// Coordinates are hand-placed on a 720×850 canvas. `textWidth` is the measured width of a
// pill's longest line in Google Sans (14px label, 11.5px sub); change a label, re-measure it.

const ID = "tp-council" // prefixes this SVG's <defs> ids
const W = 720
const H = 850
const MAIN_X = 400 // the centre column the single nodes sit on

// modA = the moderator before the planners (plannerRouter), modB = before the critics (criticRouter)
type NodeKey =
  | "start" | "setup" | "modA" | "alex" | "jordan" | "sim" | "modB"
  | "margaret" | "devon" | "tally" | "revise" | "commission" | "end"

const AI_NODES: NodeKey[] = ["alex", "jordan", "margaret", "devon", "commission"]

// One run of the graph. The second pass flips who speaks first, because the moderators
// really are coin flips (Math.random in plannerRouterNode / criticRouterNode).
const STEPS: NodeKey[] = [
  "start", "setup", "modA", "alex", "jordan", "sim", "modB", "margaret", "devon", "tally",
  "revise", // ≥ 2 stops contested: back to the planners
  "modA", "jordan", "alex", "sim", "modB", "devon", "margaret", "tally",
  "commission", "end",
]
const STEP_MS = 1100 // time per step: colour flows along the edge for ~560 ms, then the node stays lit
const PAUSE_STEPS = 3 // quiet ticks after END before the run starts over

type EdgeSpec = {
  name: string // stable React key
  points: Point[] // corner points, listed in the edge's forward direction
  transitions: string[] // "from>to" steps this edge carries forwards, e.g. "alex>sim"
  reverseTransitions?: string[] // steps it carries backwards (only the two-way arrows)
  tone?: "loop"
  arrow?: "both"
}

// Drawn before the pills, so pills paint over the line ends.
const EDGES: EdgeSpec[] = [
  { name: "start-setup", points: [[MAIN_X, 41], [MAIN_X, 69]], transitions: ["start>setup"] },
  { name: "setup-modA", points: [[MAIN_X, 110], [MAIN_X, 149]], transitions: ["setup>modA"] },
  // Moderator → whichever planner goes first; each planner hands off to the other;
  // the second planner to finish routes to the simulation.
  { name: "modA-alex", points: [[MAIN_X, 190], [MAIN_X, 210], [280, 210], [280, 237]], transitions: ["modA>alex"] },
  { name: "modA-jordan", points: [[MAIN_X, 190], [MAIN_X, 210], [520, 210], [520, 237]], transitions: ["modA>jordan"] },
  { name: "alex-jordan", points: [[378, 264], [422, 264]], transitions: ["alex>jordan"], reverseTransitions: ["jordan>alex"], arrow: "both" },
  { name: "alex-sim", points: [[280, 290], [280, 316], [MAIN_X, 316], [MAIN_X, 341]], transitions: ["alex>sim"] },
  { name: "jordan-sim", points: [[520, 290], [520, 316], [MAIN_X, 316], [MAIN_X, 341]], transitions: ["jordan>sim"] },
  { name: "sim-modB", points: [[MAIN_X, 382], [MAIN_X, 421]], transitions: ["sim>modB"] },
  // Same shape for the two critics
  { name: "modB-margaret", points: [[MAIN_X, 462], [MAIN_X, 482], [278, 482], [278, 509]], transitions: ["modB>margaret"] },
  { name: "modB-devon", points: [[MAIN_X, 462], [MAIN_X, 482], [522, 482], [522, 509]], transitions: ["modB>devon"] },
  { name: "margaret-devon", points: [[379, 536], [421, 536]], transitions: ["margaret>devon"], reverseTransitions: ["devon>margaret"], arrow: "both" },
  { name: "margaret-tally", points: [[278, 562], [278, 588], [MAIN_X, 588], [MAIN_X, 613]], transitions: ["margaret>tally"] },
  { name: "devon-tally", points: [[522, 562], [522, 588], [MAIN_X, 588], [MAIN_X, 613]], transitions: ["devon>tally"] },
  { name: "tally-commission", points: [[MAIN_X, 654], [MAIN_X, 707]], transitions: ["tally>commission"] },
  { name: "commission-end", points: [[MAIN_X, 760], [MAIN_X, 806]], transitions: ["commission>end"] },
  // The feedback loop (indigo): both exits into Revise, and Revise back to the planners
  { name: "tally-revise", points: [[356, 634], [140, 634]], transitions: ["tally>revise"], tone: "loop" },
  { name: "commission-revise", points: [[302, 734], [88, 734], [88, 655]], transitions: ["commission>revise"], tone: "loop" },
  { name: "revise-modA", points: [[88, 613], [88, 170], [335, 170]], transitions: ["revise>modA"], tone: "loop" },
]

/**
 * A counter that starts at 0 once `started` is true and ticks every STEP_MS, wrapping after
 * one full run plus a short pause. -1 means "not started". People who ask their OS for
 * reduced motion get the static diagram (the counter never starts).
 * 📖 Learn: prefers-reduced-motion, setInterval cleanup in useEffect
 */
function useTick(started: boolean): number {
  const [tick, setTick] = useState(-1)

  useEffect(() => {
    if (!started) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    setTick(0)
    const cycleLength = STEPS.length + PAUSE_STEPS
    const timer = window.setInterval(() => {
      // The updater form reads the latest tick, so the interval never sees a stale value.
      setTick((previous) => (previous + 1) % cycleLength)
    }, STEP_MS)
    return () => window.clearInterval(timer) // stop the timer if the component unmounts
  }, [started])

  return tick
}

type Trip = { key: string; edge: EdgeSpec; reverse: boolean; color: "ai" | "loop" }

/** The edge travelled to reach STEPS[step], or null for the first step. */
function tripInto(step: number): Trip | null {
  if (step < 1 || step >= STEPS.length) return null
  const from = STEPS[step - 1]
  const to = STEPS[step]
  const transition = `${from}>${to}`
  const color = AI_NODES.includes(to) ? "ai" : "loop" // the light takes the colour of where it's going

  for (const edge of EDGES) {
    if (edge.transitions.includes(transition)) return { key: `trip-${step}`, edge, reverse: false, color }
    if (edge.reverseTransitions?.includes(transition)) return { key: `trip-${step}`, edge, reverse: true, color }
  }
  return null
}

export function TransitPlannerCouncilGraph() {
  // 0.45: start when nearly half the diagram is on screen, so the run begins where people can see it
  const { ref, inView } = useInView(0.45)
  const tick = useTick(inView)

  // Ticks past the last step are the pause at the end of a run: no node is lit.
  const activeNode: NodeKey | null = tick >= 0 && tick < STEPS.length ? STEPS[tick] : null
  const isActive = (key: NodeKey) => activeNode === key

  // Keep the previous trip mounted too, so its trail can finish fading while the next one runs.
  const trips = [tripInto(tick - 1), tripInto(tick)].filter((trip): trip is Trip => trip !== null)

  return (
    <div ref={ref}>
      <DiagramFrame
        id={ID}
        width={W}
        height={H}
        title="Transit Planner AI council as a LangGraph state graph"
        description="Setup builds the brief. A moderator flips a coin for which planner proposes first, then the other planner proposes. Both routes are simulated with 150 commuters. A second moderator opens a ballot where the neighbourhood rep and the PR director vote against stops. A tally counts stops both critics oppose: two or more sends the planners back to revise, otherwise the planning commission rules. A rejection also loops back to revise, at most twice; an approval ends the graph."
        caption={
          <>
            The council as it runs today, drawn from its LangGraph <code>StateGraph</code>: 11 nodes, 5 of
            which call a model. Indigo edges are the feedback loop, capped at two revisions.
          </>
        }
      >
        <Legend />

        {EDGES.map((edge) => (
          <Edge key={edge.name} id={ID} points={edge.points} tone={edge.tone} arrow={edge.arrow} />
        ))}

        {/* Colour flowing along the edge just taken. A new key per trip remounts it, which restarts its CSS animation. */}
        {trips.map((trip) => (
          <FlowOverlay key={trip.key} points={trip.edge.points} color={trip.color} reverse={trip.reverse} />
        ))}

        <Label x={MAIN_X + 10} y={680}>otherwise</Label>
        <Label x={MAIN_X + 10} y={783}>approve</Label>
        {/* Loop labels sit just above their line */}
        <Label x={248} y={624} anchor="middle" tone="loop" size={11}>≥ 2 stops contested</Label>
        <Label x={195} y={724} anchor="middle" tone="loop" size={11}>reject</Label>
        <Label x={212} y={160} anchor="middle" tone="loop" size={11}>re-propose (max 2)</Label>

        {/* ── Nodes ── */}
        <Terminal cx={MAIN_X} cy={30} label="START" active={isActive("start")} />

        <Pill id={ID} cx={MAIN_X} cy={90} textWidth={36.7} label="Setup" icon={Settings} active={isActive("setup")} />
        <Label x={468} y={90}>Builds the brief from census data</Label>

        <Pill id={ID} cx={MAIN_X} cy={170} textWidth={67.1} label="Moderator" icon={Shuffle} active={isActive("modA")} />
        <Label x={482} y={170}>Coin flip: who proposes first</Label>

        {/* Both planners share one width so the pair looks balanced */}
        <Pill id={ID} cx={280} cy={264} textWidth={134} label="Alex Chen" sub="Ridership planner · Sonnet" icon="ai" active={isActive("alex")} />
        <Pill id={ID} cx={520} cy={264} textWidth={134} label="Jordan Park" sub="Cost analyst · Sonnet" icon="ai" active={isActive("jordan")} />

        <Pill id={ID} cx={MAIN_X} cy={362} textWidth={65.1} label="Simulation" icon={Users} active={isActive("sim")} />
        <Label x={482} y={362}>150 commuters ride each route</Label>

        <Pill id={ID} cx={MAIN_X} cy={442} textWidth={67.1} label="Moderator" icon={Shuffle} active={isActive("modB")} />
        <Label x={482} y={442}>Opens the ballot round</Label>

        <Pill id={ID} cx={278} cy={536} textWidth={138.6} label="Margaret Thompson" sub="Neighbourhood rep · Haiku" icon="ai" active={isActive("margaret")} />
        <Pill id={ID} cx={522} cy={536} textWidth={138.6} label="Devon Walsh" sub="PR director · Haiku" icon="ai" active={isActive("devon")} />

        <Pill id={ID} cx={MAIN_X} cy={634} textWidth={26.8} label="Tally" icon={Vote} active={isActive("tally")} />
        <Label x={462} y={634}>Stops both critics vote against</Label>

        <Pill id={ID} cx={88} cy={634} textWidth={40.5} label="Revise" icon={RotateCcw} active={isActive("revise")} />

        <Pill id={ID} cx={MAIN_X} cy={734} textWidth={134.6} label="Planning Commission" sub="Final ruling · Sonnet" icon="ai" active={isActive("commission")} />
        <Label x={516} y={734}>Approves or rejects the route</Label>

        <Terminal cx={MAIN_X} cy={818} label="END" active={isActive("end")} />
      </DiagramFrame>
    </div>
  )
}

function Legend() {
  return (
    <g>
      <Sparkle x={24} y={22} size={13} />
      <Label x={44} y={28.5}>Calls an LLM</Label>
      <MutedIcon Icon={Settings} x={24} y={44} size={13} />
      <Label x={44} y={50.5}>Plain code</Label>
    </g>
  )
}

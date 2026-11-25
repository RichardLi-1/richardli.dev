// `Map as MapIcon`: lucide's icon is called Map, which would hide JavaScript's built-in Map in this file
import { Activity, Layers, Map as MapIcon, Radio, Train, Users, Wrench } from "lucide-react"
import { DiagramFrame, Edge, Label, LOGOS, Pill, Sparkle, Zone } from "./diagram-kit"

// Transit Planner's current architecture, checked against the code (imports, fetch calls,
// env vars) in transit-planner web/, not the README. One Next.js app on Vercel serves the UI
// and every API route; there is no separate backend.
//
// Simplified on purpose: auth (Auth0), council voices (ElevenLabs), Street View, feedback and
// analytics webhooks are left out, and "Data routes" stands for /api/vehicles,
// /api/transit-speeds, /api/population, /api/traffic and the population tile route.
//
// Coordinates are hand-placed on an 800×528 canvas; `textWidth` values were measured in
// Google Sans (14px labels, 11.5px subs). Change a label, re-measure it.

const ID = "tp-arch"
const W = 800
const H = 528

// The four columns shared by the Browser row and the first server row
const COL = { map: 123, ask: 293, council: 485.5, sim: 691 }

const ZONE_X = 40
const ZONE_W = 744
const BROWSER_Y = 70 // pill centre lines
const ROUTES_Y = 186
const SHARED_Y = 276
const DATA_Y = 362
const EXTERNAL_Y = 478

// x centres of the external-service pills (small size, laid out edge to edge with ~13 gaps)
const EXT = { mapbox: 106.5, ttc: 237, claude: 365, gemini: 474, langfuse: 589, supabase: 712 }

export function TransitPlannerArchitecture() {
  return (
    <DiagramFrame
      id={ID}
      width={W}
      height={H}
      title="Transit Planner architecture"
      description="The browser runs the Mapbox map editor, the Ask AI panel, the council panel and the simulation panel. Each calls an API route in one Next.js app on Vercel: data routes for live vehicles and tiles, the Ask AI agent loop and the LangGraph council over server-sent events, and the commuter simulation. The agent loop and the council share one AI provider layer (Claude or Gemini, traced in Langfuse) and one tool registry of 7 read tools and 12 map actions, which reads a data layer backed by Supabase census data. The registry can also run the simulation. The map talks to Mapbox directly and the data routes read TTC GTFS-RT."
      caption={
        <>
          One Next.js app on Vercel serves the UI and every API route. Ask AI and the council share
          the same AI provider layer and the same grounded tool registry, so both read the same
          numbers. Simplified: auth, council voices and analytics are left out.
        </>
      }
    >
      <Zone x={ZONE_X} y={16} width={ZONE_W} height={88} label="BROWSER" />
      {/* labelX: the default spot would sit under the Data routes arrow */}
      <Zone x={ZONE_X} y={128} width={ZONE_W} height={272} label="NEXT.JS APP ON VERCEL" labelX={136} />
      <Zone x={ZONE_X} y={424} width={ZONE_W} height={88} label="EXTERNAL SERVICES" />

      <Sparkle x={692} y={28} size={12} />
      <Label x={710} y={34}>AI-powered</Label>

      {/* ── Browser → API routes (labels sit in the gap between the two zones) ── */}
      <Edge id={ID} points={[[COL.map, 91], [COL.map, 165]]} />
      <Label x={COL.map + 8} y={116} mono>JSON, tiles</Label>
      <Edge id={ID} points={[[COL.ask, 91], [COL.ask, 165]]} />
      <Label x={COL.ask + 8} y={116} mono>/api/ai/chat · SSE</Label>
      <Edge id={ID} points={[[COL.council, 91], [COL.council, 165]]} />
      <Label x={COL.council + 8} y={116} mono>/api/council · SSE</Label>
      <Edge id={ID} points={[[COL.sim, 91], [COL.sim, 165]]} />
      <Label x={COL.sim + 8} y={116} mono>/api/simulation</Label>

      {/* ── Both AI surfaces use both shared modules. Drawn as a "bus": the four paths
             overlap on one horizontal line, which reads as "each uses each" without an X. ── */}
      <Edge id={ID} points={[[COL.ask, 207], [COL.ask, 228], [262, 228], [262, 249]]} />
      <Edge id={ID} points={[[COL.ask, 207], [COL.ask, 228], [500, 228], [500, 249]]} />
      <Edge id={ID} points={[[COL.council, 207], [COL.council, 228], [262, 228], [262, 249]]} />
      <Edge id={ID} points={[[COL.council, 207], [COL.council, 228], [500, 228], [500, 249]]} />

      {/* The Ask AI agent can start a simulation through the registry's run_simulation tool */}
      <Edge id={ID} dashed points={[[602, SHARED_Y], [COL.sim, SHARED_Y], [COL.sim, 207]]} />
      <Label x={610} y={SHARED_Y + 15} mono>run_simulation</Label>

      <Edge id={ID} points={[[500, 302], [500, 335]]} />

      {/* ── → external services ── */}
      {/* The map calls Mapbox straight from the browser, so this edge skips the server zone */}
      <Edge id={ID} points={[[58, BROWSER_Y], [24, BROWSER_Y], [24, EXTERNAL_Y], [55, EXTERNAL_Y]]} />
      <Label x={12} y={300} anchor="middle" mono rotate={-90}>tiles, isochrones, road snapping</Label>

      <Edge id={ID} points={[[COL.map, 207], [COL.map, 416], [EXT.ttc, 416], [EXT.ttc, 457]]} />

      <Edge id={ID} points={[[262, 302], [262, 416], [EXT.claude, 416], [EXT.claude, 457]]} />
      <Edge id={ID} points={[[262, 302], [262, 416], [EXT.gemini, 416], [EXT.gemini, 457]]} />
      <Edge id={ID} dashed points={[[262, 302], [262, 416], [EXT.langfuse, 416], [EXT.langfuse, 457]]} />
      <Label x={531} y={406} anchor="middle" mono>traces</Label>

      <Edge id={ID} points={[[604, DATA_Y], [EXT.supabase, DATA_Y], [EXT.supabase, 457]]} />
      <Label x={EXT.supabase + 8} y={420} mono>pop_data</Label>
      {/* The simulation reads census population directly, so it gets its own line to Supabase */}
      <Edge id={ID} points={[[769, ROUTES_Y], [792, ROUTES_Y], [792, EXTERNAL_Y], [769, EXTERNAL_Y]]} />

      {/* ── Nodes ── */}
      <Pill id={ID} cx={COL.map} cy={BROWSER_Y} textWidth={68.6} label="Map editor" icon={MapIcon} />
      <Pill id={ID} cx={COL.ask} cy={BROWSER_Y} textWidth={39.2} label="Ask AI" icon="ai" />
      <Pill id={ID} cx={COL.council} cy={BROWSER_Y} textWidth={47.7} label="Council" icon="ai" />
      <Pill id={ID} cx={COL.sim} cy={BROWSER_Y} textWidth={65.1} label="Simulation" icon={Users} />

      <Pill id={ID} cx={COL.map} cy={ROUTES_Y} textWidth={73.1} label="Data routes" icon={Radio} />
      <Pill id={ID} cx={COL.ask} cy={ROUTES_Y} textWidth={69.5} label="Agent loop" icon="ai" />
      <Pill id={ID} cx={COL.council} cy={ROUTES_Y} textWidth={118.8} label="LangGraph council" icon="ai" />
      <Pill id={ID} cx={COL.sim} cy={ROUTES_Y} textWidth={93.7} label="Commuter sim" icon={Users} />

      <Pill id={ID} cx={262} cy={SHARED_Y} textWidth={90.3} label="AI provider" sub="Claude or Gemini" icon="ai" />
      <Pill id={ID} cx={500} cy={SHARED_Y} textWidth={142.6} label="Tool registry" sub="7 read tools, 12 map actions" icon={Wrench} />
      <Pill id={ID} cx={500} cy={DATA_Y} textWidth={146.9} label="Data layer" sub="census raster, network, gaps" icon={Layers} />

      {/* External services: brand logos where Simple Icons has one, a plain icon otherwise */}
      <Pill id={ID} size="sm" cx={EXT.mapbox} cy={EXTERNAL_Y} textWidth={51} label="Mapbox" icon={LOGOS.mapbox} />
      <Pill id={ID} size="sm" cx={EXT.ttc} cy={EXTERNAL_Y} textWidth={83.1} label="TTC GTFS-RT" icon={Train} />
      <Pill id={ID} size="sm" cx={EXT.claude} cy={EXTERNAL_Y} textWidth={44.7} label="Claude" icon={LOGOS.claude} />
      <Pill id={ID} size="sm" cx={EXT.gemini} cy={EXTERNAL_Y} textWidth={45.2} label="Gemini" icon={LOGOS.gemini} />
      <Pill id={ID} size="sm" cx={EXT.langfuse} cy={EXTERNAL_Y} textWidth={58} label="Langfuse" icon={Activity} />
      <Pill id={ID} size="sm" cx={EXT.supabase} cy={EXTERNAL_Y} textWidth={61.7} label="Supabase" icon={LOGOS.supabase} />
    </DiagramFrame>
  )
}

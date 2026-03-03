import { useState, useEffect, useRef } from "react";

const C = {
  metrolinx: "#191919",
  go:        "#477328",
  ttcRed:    "#DA291C",
  ttcGreen:  "#00853F",
  ttcPurple: "#702082",
  warning:   "#D4870A",
  critical:  "#C0392B",
  info:      "#2563EB",
  bg:        "#13161B",
  panel:     "#1A1D24",
  border:    "#272B35",
  muted:     "#6B7280",
  text:      "#E8EAF0",
  subtext:   "#9CA3AF",
};

const SVG_W = 900, SVG_H = 600;

const TTC_LINES = {
  line1: {
    name:"Line 1 Yonge–University", color:C.ttcRed, width:4,
    path:[
      [420,22],[420,65],[420,108],[420,148],[420,188],
      [420,226],[420,258],[420,288],
      [420,322],[420,352],
      [420,382],[420,410],[420,436],
      [420,464],[420,492],
      [400,492],[375,470],[355,445],[335,418],[318,390],
      [306,362],[298,332],[292,302],[288,272],[284,242],
      [280,210],[278,175],[276,140],[274,100],[272,60],[270,22],
    ],
    stations:[
      { name:"Finch",        x:420, y:22  },
      { name:"Sheppard",     x:420, y:65  },
      { name:"Lawrence",     x:420, y:108 },
      { name:"Eglinton",     x:420, y:148 },
      { name:"St Clair",     x:420, y:188 },
      { name:"Bloor–Yonge",  x:420, y:322, flag:"critical" },
      { name:"Wellesley",    x:420, y:352 },
      { name:"College",      x:420, y:382 },
      { name:"Dundas",       x:420, y:410 },
      { name:"Queen",        x:420, y:436 },
      { name:"King",         x:420, y:464 },
      { name:"Union",        x:420, y:492, flag:"warning" },
      { name:"Spadina",      x:288, y:272 },
      { name:"St George",    x:292, y:302 },
    ],
  },
  line2: {
    name:"Line 2 Bloor–Danforth", color:C.ttcGreen, width:4,
    path:[
      [60,322],[100,322],[140,322],[180,322],[222,322],[264,322],
      [306,322],[360,322],[420,322],[464,322],[506,322],
      [548,322],[590,322],[632,322],[674,322],[716,322],[758,322],
    ],
    stations:[
      { name:"Kipling",      x:60,  y:322 },
      { name:"Islington",    x:100, y:322 },
      { name:"Royal York",   x:140, y:322 },
      { name:"Old Mill",     x:180, y:322 },
      { name:"Jane",         x:222, y:322 },
      { name:"Runnymede",    x:264, y:322 },
      { name:"High Park",    x:306, y:322 },
      { name:"Bloor–Yonge",  x:420, y:322, flag:"critical" },
      { name:"Bay",          x:464, y:322 },
      { name:"Sherbourne",   x:506, y:322 },
      { name:"Broadview",    x:548, y:322 },
      { name:"Pape",         x:632, y:322 },
      { name:"Donlands",     x:674, y:322 },
      { name:"Greenwood",    x:716, y:322 },
      { name:"Kennedy",      x:758, y:322, flag:"warning" },
    ],
  },
  eglinton: {
    name:"Eglinton Crosstown LRT", color:C.ttcPurple, width:3,
    path:[
      [80,188],[130,188],[185,188],[240,188],[295,188],[345,188],
      [420,188],[475,188],[530,188],[585,188],[630,188],[668,188],
      [700,205],[718,235],[724,268],
    ],
    stations:[
      { name:"Mount Dennis",   x:80,  y:188, flag:"info" },
      { name:"Keelesdale",     x:130, y:188 },
      { name:"Caledonia",      x:185, y:188 },
      { name:"Dufferin",       x:240, y:188 },
      { name:"Fairbank",       x:295, y:188 },
      { name:"Eglinton",       x:420, y:188 },
      { name:"Leaside",        x:530, y:188 },
      { name:"Science Centre", x:630, y:188 },
      { name:"Kennedy LRT",    x:724, y:268, flag:"warning" },
    ],
  },
};

const GO_LINES = [
  { name:"Lakeshore West", path:[[420,492],[346,506],[268,518],[180,525],[85,530]] },
  { name:"Lakeshore East", path:[[420,492],[498,506],[582,516],[672,522],[768,527]] },
  { name:"Barrie",         path:[[420,492],[415,428],[408,354],[400,274],[392,192],[384,112],[375,35]] },
  { name:"Kitchener",      path:[[420,492],[368,464],[312,430],[252,392],[186,348],[124,298],[62,244]] },
  { name:"Richmond Hill",  path:[[420,492],[432,420],[444,340],[456,254],[466,166],[474,90],[480,28]] },
  { name:"Stouffville",    path:[[420,492],[474,464],[528,428],[582,386],[640,335],[702,278],[758,218]] },
];

const FLAGS = [
  {
    id:"F1", x:420, y:322, severity:"critical",
    title:"Overcrowded Platforms",
    location:"Bloor–Yonge Station (Lines 1 & 2)",
    detail:"Peak-hour volumes at 340% of design capacity. ATC dwell extensions causing cascade delays across both lines. Interchange volumes grew 28% since 2019.",
    action:"Relief Line EA — recommend immediate scoping",
  },
  {
    id:"F2", x:420, y:492, severity:"warning",
    title:"Interchange Capacity Constraint",
    location:"Union Station",
    detail:"GO/TTC interchange volumes projected to exceed platform capacity by 2027. Bay Concourse at 91% saturation during AM peak.",
    action:"TPAP scoping initiated",
  },
  {
    id:"F3", x:80, y:188, severity:"info",
    title:"LRT / GO Integration Gap",
    location:"Mount Dennis — Eglinton Crosstown",
    detail:"Fare payment and wayfinding integration with Kitchener GO corridor not yet resolved. Transfer modelling incomplete.",
    action:"Feasibility study required",
  },
  {
    id:"F4", x:758, y:322, severity:"warning",
    title:"Terminus Capacity",
    location:"Kennedy Station",
    detail:"Scarborough extension demand modelling shows inadequate tail tracks for projected 2031 ridership. Storage yard EA not initiated.",
    action:"EA alternatives analysis needed",
  },
  {
    id:"F5", x:270, y:22, severity:"info",
    title:"Active Project: Finch West BRT",
    location:"Finch Ave W Corridor",
    detail:"TPAP filing in progress. Phase 2 alignment under EA review. FW-BRT-EXT-2024 — AI-assisted EPR 68% complete.",
    action:"FW-BRT-EXT-2024 · TPAP active",
    isProject: true,
  },
];

function pts2path(pts) {
  return pts.map((p,i) => `${i===0?"M":"L"}${p[0]},${p[1]}`).join(" ");
}

function lerp(a, b, t) { return { x: a[0]+(b[0]-a[0])*t, y: a[1]+(b[1]-a[1])*t }; }

function posOnPath(path, progress) {
  const pct = ((progress % 1) + 1) % 1;
  const total = path.length - 1;
  const seg = pct * total;
  const i = Math.min(Math.floor(seg), total - 1);
  return lerp(path[i], path[i+1], seg - i);
}

function useVehicles() {
  const tRef = useRef(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let raf;
    const loop = () => {
      tRef.current += 0.5;
      setTick(t => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const t = tRef.current;
  const vehicles = [];

  const speed1 = 0.00065, speed2 = 0.00072, speedEG = 0.00048, speedGO = 0.00022;

  [0, 0.34, 0.67].forEach((o,i) => {
    const p = posOnPath(TTC_LINES.line1.path, t*speed1+o);
    vehicles.push({ id:`1a${i}`, ...p, color:C.ttcRed, r:5 });
  });
  [0.17, 0.51, 0.84].forEach((o,i) => {
    const rev = [...TTC_LINES.line1.path].reverse();
    const p = posOnPath(rev, t*speed1+o);
    vehicles.push({ id:`1b${i}`, ...p, color:C.ttcRed, r:5 });
  });
  [0, 0.26, 0.52, 0.78].forEach((o,i) => {
    const p = posOnPath(TTC_LINES.line2.path, t*speed2+o);
    vehicles.push({ id:`2a${i}`, ...p, color:C.ttcGreen, r:5 });
  });
  [0.13, 0.39, 0.65, 0.91].forEach((o,i) => {
    const rev = [...TTC_LINES.line2.path].reverse();
    const p = posOnPath(rev, t*speed2+o);
    vehicles.push({ id:`2b${i}`, ...p, color:C.ttcGreen, r:5 });
  });
  [0, 0.38, 0.72].forEach((o,i) => {
    const p = posOnPath(TTC_LINES.eglinton.path, t*speedEG+o);
    vehicles.push({ id:`eg${i}`, ...p, color:C.ttcPurple, r:4 });
  });
  [0.2, 0.58].forEach((o,i) => {
    const rev = [...TTC_LINES.eglinton.path].reverse();
    const p = posOnPath(rev, t*speedEG+o);
    vehicles.push({ id:`egr${i}`, ...p, color:C.ttcPurple, r:4 });
  });
  GO_LINES.forEach((line, li) => {
    [0, 0.54].forEach((o,i) => {
      const p = posOnPath(line.path, t*speedGO + o + li*0.09);
      vehicles.push({ id:`go${li}x${i}`, ...p, color:C.go, r:6 });
    });
    [0.27, 0.81].forEach((o,i) => {
      const rev = [...line.path].reverse();
      const p = posOnPath(rev, t*speedGO + o + li*0.09);
      vehicles.push({ id:`gor${li}x${i}`, ...p, color:C.go, r:6 });
    });
  });

  return vehicles;
}

function flagColor(sev) {
  return sev==="critical"?C.critical:sev==="warning"?C.warning:C.info;
}

export default function App() {
  const vehicles = useVehicles();
  const [activeFlag, setActiveFlag] = useState(null);
  const [hovered, setHovered]       = useState(null);
  const [pulseOn, setPulseOn]        = useState(true);
  const [legendOpen, setLegendOpen]  = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPulseOn(p=>!p), 900);
    return () => clearInterval(id);
  }, []);

  const active = FLAGS.find(f=>f.id===activeFlag);

  return (
    <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", background:C.bg, height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .flag-marker{cursor:pointer;}
        .flag-marker:hover circle.dot{r:10;}
        .panel-item{transition:background .12s, border-left .12s;cursor:pointer;}
        .panel-item:hover{background:#22262E !important;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#272B35;border-radius:2px;}
      `}</style>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ background:C.metrolinx, height:48, display:"flex", alignItems:"center", padding:"0 18px", gap:12, flexShrink:0, borderBottom:"1px solid #272B35", zIndex:60 }}>
        <div style={{ background:C.go, width:30, height:30, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <rect x="1" y="4.5" width="16" height="3.5" rx="1.75" fill={C.metrolinx}/>
            <rect x="3.5" y="1.5" width="3" height="3" rx=".8" fill={C.metrolinx}/>
            <rect x="11.5" y="1.5" width="3" height="3" rx=".8" fill={C.metrolinx}/>
            <circle cx="4.5" cy="11.5" r="1.8" fill={C.metrolinx}/>
            <circle cx="13.5" cy="11.5" r="1.8" fill={C.metrolinx}/>
          </svg>
        </div>
        <div style={{ lineHeight:1 }}>
          <span style={{ fontSize:13.5, fontWeight:600, fontFamily:"'IBM Plex Serif',serif", color:"white" }}>TransitPilot</span>
          <span style={{ fontSize:10, color:"#6B7280", letterSpacing:"0.08em", textTransform:"uppercase", marginLeft:8 }}>Network Planning</span>
        </div>
        <div style={{ width:1, height:22, background:"#2A2D35", marginLeft:4 }} />
        <span style={{ fontSize:11.5, color:"#6B7280" }}>Greater Toronto &amp; Hamilton Area</span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#1A1D24", border:"1px solid #272B35", borderRadius:4, padding:"3px 10px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.go, animation:"blink 2s infinite" }}/>
            <span style={{ fontSize:10.5, fontFamily:"'IBM Plex Mono',monospace", color:"#9CA3AF" }}>LIVE · AM PEAK</span>
          </div>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"#272B35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, color:"#9CA3AF" }}>JC</div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* MAP ───────────────────────────────────────────────── */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>

          {/* Lake Ontario fill */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:64, background:"linear-gradient(180deg,#0A1628,#0C1E3A)", borderTop:"1px solid #1A3558" }}>
            <span style={{ position:"absolute", top:8, left:18, fontSize:9.5, letterSpacing:"0.14em", color:"#1A3A5C", textTransform:"uppercase", fontWeight:600 }}>Lake Ontario</span>
          </div>

          {/* Subtle grid */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.055 }}>
            {Array.from({length:22}).map((_,i)=>(
              <line key={`h${i}`} x1="0" y1={i*28} x2="100%" y2={i*28} stroke={C.go} strokeWidth=".4"/>
            ))}
            {Array.from({length:36}).map((_,i)=>(
              <line key={`v${i}`} x1={i*28} y1="0" x2={i*28} y2="100%" stroke={C.go} strokeWidth=".4"/>
            ))}
          </svg>

          {/* Main SVG map */}
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* GO corridors */}
            {GO_LINES.map((line,i)=>(
              <path key={`go${i}`} d={pts2path(line.path)} fill="none" stroke={C.go} strokeWidth="2" strokeOpacity=".45" strokeDasharray="7 5"/>
            ))}

            {/* TTC lines */}
            {Object.entries(TTC_LINES).map(([key,line])=>(
              <g key={key}>
                <path d={pts2path(line.path)} fill="none" stroke="black" strokeWidth={line.width+4} strokeOpacity=".5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={pts2path(line.path)} fill="none" stroke={line.color} strokeWidth={line.width} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
              </g>
            ))}

            {/* Regular stations */}
            {Object.entries(TTC_LINES).map(([key,line])=>
              line.stations.filter(s=>!s.flag).map(s=>(
                <g key={s.name}>
                  <circle cx={s.x} cy={s.y} r="4.5" fill={C.bg} stroke={line.color} strokeWidth="1.5"/>
                </g>
              ))
            )}

            {/* Vehicles */}
            {vehicles.map(v=>(
              <g key={v.id}>
                <circle cx={v.x} cy={v.y} r={v.r+2.5} fill="black" fillOpacity=".35"/>
                <circle cx={v.x} cy={v.y} r={v.r} fill={v.color}/>
                <circle cx={v.x} cy={v.y} r={v.r-1.5} fill="rgba(0,0,0,.25)"/>
              </g>
            ))}

            {/* Issue flags */}
            {FLAGS.map(flag=>{
              const fc = flagColor(flag.severity);
              const isActive = activeFlag===flag.id;
              const isHov    = hovered===flag.id;
              const scale    = isActive||isHov ? 1.3 : 1;
              return (
                <g key={flag.id} className="flag-marker"
                  onClick={()=>setActiveFlag(isActive?null:flag.id)}
                  onMouseEnter={()=>setHovered(flag.id)}
                  onMouseLeave={()=>setHovered(null)}
                  transform={`translate(${flag.x},${flag.y}) scale(${scale})`}
                  style={{ transformOrigin:`${flag.x}px ${flag.y}px`, transition:"transform .15s" }}
                >
                  {/* Pulse rings */}
                  {flag.severity!=="info" && (
                    <>
                      <circle cx="0" cy="0" r="13" fill="none" stroke={fc} strokeWidth="1.5"
                        strokeOpacity={pulseOn?.55:.12} style={{ transition:"stroke-opacity .9s ease" }}/>
                      <circle cx="0" cy="0" r="20" fill="none" stroke={fc} strokeWidth="1"
                        strokeOpacity={pulseOn?.18:.45} style={{ transition:"stroke-opacity .9s ease" }}/>
                    </>
                  )}
                  {/* Badge */}
                  <circle cx="0" cy="0" r="8" fill={fc}/>
                  <circle className="dot" cx="0" cy="0" r="8" fill={fc} style={{ transition:"r .15s" }}/>
                  {flag.severity==="critical" && <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">!</text>}
                  {flag.severity==="warning"  && <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">⚡</text>}
                  {flag.severity==="info"     && <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">i</text>}
                </g>
              );
            })}

            {/* Street labels */}
            {[
              { x:422,y:14,  label:"Steeles Ave W / N York boundary" },
              { x:422,y:336, label:"Bloor St" },
              { x:422,y:505, label:"Front St — Union Station" },
              { x:180,y:180, label:"Eglinton Ave" },
              { x:634,y:178, label:"Eglinton Ave E" },
            ].map((l,i)=>(
              <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize="8.5" fill="#374151"
                fontFamily="IBM Plex Sans" letterSpacing="0.05em">{l.label}</text>
            ))}
          </svg>

          {/* Active flag detail popup */}
          {active && (
            <div style={{
              position:"absolute", top:14, left:"50%", transform:"translateX(-50%)",
              background:"rgba(26,29,36,.97)", backdropFilter:"blur(14px)",
              border:`1px solid ${flagColor(active.severity)}44`,
              borderTop:`2.5px solid ${flagColor(active.severity)}`,
              borderRadius:8, padding:"14px 18px", width:360,
              animation:"fadeUp .2s ease", zIndex:30, boxShadow:"0 8px 32px rgba(0,0,0,.6)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:flagColor(active.severity), marginBottom:4 }}>
                    {active.severity==="critical"?"⚠ Critical Planning Issue":active.severity==="warning"?"⚡ Planning Warning":"ℹ Planning Note"}
                  </div>
                  <div style={{ fontSize:15.5, fontWeight:600, fontFamily:"'IBM Plex Serif',serif", color:C.text }}>{active.title}</div>
                  <div style={{ fontSize:11.5, color:C.subtext, marginTop:2 }}>{active.location}</div>
                </div>
                <button onClick={()=>setActiveFlag(null)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:15, marginLeft:10, lineHeight:1 }}>✕</button>
              </div>
              <div style={{ fontSize:12.5, color:"#CBD5E1", lineHeight:1.65, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                {active.detail}
              </div>
              <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, fontFamily:"'IBM Plex Mono',monospace", color:flagColor(active.severity), lineHeight:1.4 }}>
                  → {active.action}
                </span>
                <button style={{
                  background: active.isProject ? "#1B3A6B" : C.go,
                  color:"white", border:"none", borderRadius:4,
                  fontSize:11, fontWeight:600, padding:"6px 14px", cursor:"pointer",
                  fontFamily:"'IBM Plex Sans',sans-serif",
                }}>
                  {active.isProject ? "Open Project →" : "Begin EA Scoping →"}
                </button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{
            position:"absolute", bottom:72, left:14,
            background:"rgba(26,29,36,.94)", backdropFilter:"blur(10px)",
            border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden", minWidth:175,
            animation:"fadeUp .4s ease",
          }}>
            <button onClick={()=>setLegendOpen(o=>!o)} style={{
              width:"100%", background:"none", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"8px 12px",
            }}>
              <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:C.muted }}>Legend</span>
              <span style={{ fontSize:11, color:C.muted }}>{legendOpen?"▾":"▸"}</span>
            </button>
            {legendOpen && (
              <div style={{ padding:"0 12px 10px", display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { color:C.ttcRed,    label:"Line 1  Yonge–University" },
                  { color:C.ttcGreen,  label:"Line 2  Bloor–Danforth" },
                  { color:C.ttcPurple, label:"Eglinton Crosstown LRT" },
                  { color:C.go,        label:"GO Train corridors", dash:true },
                ].map((l,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke={l.color} strokeWidth="2.5" strokeDasharray={l.dash?"5 3":"none"}/></svg>
                    <span style={{ fontSize:10.5, color:C.subtext }}>{l.label}</span>
                  </div>
                ))}
                <div style={{ borderTop:`1px solid ${C.border}`, marginTop:4, paddingTop:6, display:"flex", flexDirection:"column", gap:5 }}>
                  {[
                    { color:C.critical, label:"Critical issue" },
                    { color:C.warning,  label:"Warning" },
                    { color:C.info,     label:"Info / active project" },
                  ].map((l,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:9, height:9, borderRadius:"50%", background:l.color, flexShrink:0 }}/>
                      <span style={{ fontSize:10.5, color:C.subtext }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL ─────────────────────────────────────── */}
        <div style={{ width:292, background:C.panel, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>

          <div style={{ padding:"13px 15px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:600, fontFamily:"'IBM Plex Serif',serif" }}>Network Issues</div>
            <div style={{ fontSize:11, color:C.subtext, marginTop:2 }}>Early-stage planning flags · AI-detected</div>
          </div>

          <div style={{ flex:1, overflowY:"auto" }}>
            {FLAGS.map((flag,i)=>{
              const fc = flagColor(flag.severity);
              const isAct = activeFlag===flag.id;
              return (
                <div key={flag.id} className="panel-item"
                  onClick={()=>setActiveFlag(isAct?null:flag.id)}
                  style={{
                    padding:"12px 15px", borderBottom:`1px solid ${C.border}`,
                    background:isAct?"#22262E":"transparent",
                    borderLeft:`3px solid ${isAct?fc:"transparent"}`,
                    animation:`fadeUp .3s ease ${i*.06}s both`,
                  }}
                >
                  <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:fc, flexShrink:0, marginTop:3.5, boxShadow:flag.severity!=="info"?`0 0 7px ${fc}99`:"none" }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:C.text, lineHeight:1.3 }}>{flag.title}</span>
                        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.06em", color:fc, background:`${fc}18`, padding:"2px 6px", borderRadius:3, textTransform:"uppercase", flexShrink:0 }}>{flag.severity}</span>
                      </div>
                      <div style={{ fontSize:11, color:C.subtext, marginTop:2 }}>{flag.location}</div>
                      <div style={{ fontSize:10.5, fontFamily:"'IBM Plex Mono',monospace", color:C.go, marginTop:5 }}>→ {flag.action}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats + CTA */}
          <div style={{ padding:"13px 15px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:C.muted, marginBottom:9 }}>Live Network</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {[
                { label:"Vehicles tracked", value:`${vehicles.length}`, color:C.text },
                { label:"Lines active",     value:"4 + GO", color:C.text },
                { label:"Flags raised",     value:"5",      color:C.warning },
                { label:"Critical",         value:"1",      color:C.critical },
              ].map((s,i)=>(
                <div key={i} style={{ background:C.bg, borderRadius:4, padding:"7px 9px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:16, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:9.5, color:C.muted, marginTop:1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button style={{
              width:"100%", marginTop:11, padding:"9px 0",
              background:C.go, color:"white", border:"none", borderRadius:5,
              fontSize:12.5, fontWeight:600, cursor:"pointer",
              fontFamily:"'IBM Plex Sans',sans-serif",
            }}>
              Begin Network EA Scoping →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

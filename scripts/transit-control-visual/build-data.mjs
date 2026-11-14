// Builds components/transit-control-visual/transit-control-data.json from two recordings of the
// real simulator (github.com/RichardLi-1/cbtc):
//   rec.json  ← record.py   (headless sim: a /state snapshot + one train's full lap)
//   map.json  ← capture.mjs (the real app in Chrome: map drawn to SVG by its own layer code,
//                            plus the chrome's measured text)
//
// Regenerate after the simulator's look or behaviour changes. Needs the cbtc repo next to this
// one (or CBTC_DIR), with its frontend dev server on :5173 and backend on :8000 (the app loads
// /topology from the backend; /state is answered from rec.json), and Google Chrome:
//   ../cbtc/backend/venv/bin/python scripts/transit-control-visual/record.py /tmp/tcv/rec.json
//   node scripts/transit-control-visual/capture.mjs /tmp/tcv/rec.json /tmp/tcv
//   node scripts/transit-control-visual/build-data.mjs /tmp/tcv/rec.json /tmp/tcv
// build-data prints how closely each train's starting point matches the snapshot.
import { readFileSync, writeFileSync } from "node:fs"

const [, , recPath, capDir] = process.argv
const rec = JSON.parse(readFileSync(recPath, "utf8"))
const map = JSON.parse(readFileSync(`${capDir}/map.json`, "utf8"))
const dom = JSON.parse(readFileSync(`${capDir}/dom.json`, "utf8"))
const OUT = new URL("../../components/transit-control-visual/transit-control-data.json", import.meta.url)

const L = map.route.lengthM
const fwd = (a, b) => (((b - a) % L) + L) % L // metres travelling forward from a to b

// ── the lap: unwrap chainage so it only grows ────────────────────────────────────────────
const lap = rec.lap
const cu = [lap[0].chainage_m]
for (let i = 1; i < lap.length; i++) cu.push(cu[i - 1] + fwd(lap[i - 1].chainage_m, lap[i].chainage_m))
const travelled = cu[cu.length - 1] - cu[0]
if (travelled > L || travelled < L - 500) throw new Error(`lap covers ${travelled} m of a ${L} m loop`)

const names = ["running", "arriving", "dwelling", "stopped"]
const nameIdx = (n) => {
  if (n == null) return -1
  let i = names.indexOf(n)
  if (i < 0) { names.push(n); i = names.length - 1 }
  return i
}
const events = []
lap.forEach((r, i) => {
  const ev = [i, nameIdx(r.state), r.state === "dwelling" ? nameIdx(r.station_name) : -1, nameIdx(r.next_station_name), r.e_brake ? 1 : 0]
  const last = events[events.length - 1]
  if (!last || ev.slice(1).some((v, k) => v !== last[k + 1])) events.push(ev)
})
const dm = cu.map((c) => Math.round(c * 10))
const kmh10 = lap.map((r) => Math.round(r.speed * 36))
const sdm = lap.map((r) => Math.round(Math.max(0, r.s_stop) * 10))
const delta = (xs) => xs.slice(1).map((v, i) => v - xs[i])
const dc = delta(dm)
const dv = delta(kmh10)
const ds = delta(sdm)
// spans where a red signal was the binding limit: [from, to) seconds + the stop point (dm)
const sig = []
lap.forEach((r, i) => {
  const last = sig[sig.length - 1]
  if (r.eoa_src !== "signal") return
  if (last && last[1] === i) last[1] = i + 1
  else sig.push([i, i + 1, Math.round(r.eoa_sig_c * 10)])
})

// ── each snapshot train's phase in the lap ───────────────────────────────────────────────
function phaseOf(t) {
  if (t.state === "dwelling" && t.station_name) {
    // the lap's dwell at the same platform; line up departure times
    const rows = lap.map((r, i) => [r, i]).filter(([r]) => r.state === "dwelling" && r.station_name === t.station_name && r.leg === t.leg)
    if (rows.length) {
      const first = rows[0][1]
      const end = rows[rows.length - 1][1] + 1
      return Math.max(first, end - (t.dwell_remaining_sec ?? 0))
    }
  }
  // moving (or stopped between stations): the moment the lap's nose passes the same chainage
  let best = null
  for (let i = 0; i < lap.length - 1; i++) {
    const d = cu[i + 1] - cu[i]
    if (d <= 0) continue
    const into = fwd(lap[i].chainage_m, t.chainage_m)
    if (into <= d) { best = i + into / d; break }
  }
  if (best == null) {
    // between the lap's last sample and its wrap back to the start
    best = lap.length - 1 + Math.min(1, fwd(lap[lap.length - 1].chainage_m, t.chainage_m) / Math.max(1e-6, cu[0] + L - cu[cu.length - 1]))
  }
  return best
}

const at = (s) => {
  const i = Math.floor(s) % lap.length
  const f = s - Math.floor(s)
  const c1 = i + 1 < cu.length ? cu[i + 1] : cu[0] + L
  return { c: (((cu[i] + (c1 - cu[i]) * f) % L) + L) % L, state: lap[i].state }
}
const trains = rec.snapshot.trains.map((t) => ({ label: t.label, phase: Math.round(phaseOf(t) * 100) / 100, lengthM: t.length_m }))
const errs = rec.snapshot.trains.map((t, k) => {
  const p = at(trains[k].phase)
  const e = Math.min(fwd(p.c, t.chainage_m), fwd(t.chainage_m, p.c))
  return { label: t.label, err: e, snap: t.state, lap: p.state }
})
errs.sort((a, b) => b.err - a.err)
console.log("phase fit: worst chainage error", errs.slice(0, 3).map((e) => `${e.label} ${e.err.toFixed(2)} m (${e.snap}/${e.lap})`).join(", "))
console.log("state mismatches:", errs.filter((e) => (e.snap === "dwelling") !== (e.lap === "dwelling")).map((e) => e.label).join(", ") || "none")

// ── chrome text, exactly as the app rendered it ──────────────────────────────────────────
const text = (pred) => dom.find((e) => pred(e))?.text
const headway = text((e) => e.text && /^\d+:\d\d$/.test(e.text) && e.r[1] > 860)
const target = text((e) => e.text?.startsWith("/ "))?.slice(2)
const period = rec.snapshot.ops.service.period
const eventsCount = Number(text((e) => e.tag === "span" && /^\d+$/.test(e.text) && e.r[1] < 76 && e.r[0] > 1250))
const C = map.colors
const scope = (svg) => svg.replace(/class="([sm])"/g, 'class="tcv-$1"')
// The app's own band opacity at this zoom: the first nominal band stroke in its recorded train layer.
const bandAttr = map.trainLayer.match(new RegExp(`stroke="${C.MA_BAND.replace(/[()]/g, "\\$&")}"[^>]*?opacity="([\\d.]+)"`))
const bandQuiet = bandAttr ? Number(bandAttr[1]) : 1
const data = {
  stage: { width: 1440, height: 900 },
  // the recorder's font classes, renamed so no site-wide CSS can match them
  map: { x: map.mapRect.x, y: map.mapRect.y, width: map.width, height: map.height, under: scope(map.under), over: scope(map.over) },
  route: { lengthM: L, segs: map.route.segs.map((s) => [s.startM, s.lengthM, ...s.pts.flat()]) },
  pxPerM: Math.round(map.pxPerM * 1e6) / 1e6,
  colors: {
    background: C.BACKGROUND, border: C.TRAIN_BORDER, running: C.TRAIN_FILL, arriving: C.TRAIN_ARRIVING, dwelling: C.TRAIN_DWELL,
    stopped: C.TRAIN_STOPPED, ebrake: C.TRAIN_EBRAKE, maBand: C.MA_BAND, maEoa: C.MA_EOA, caution: C.CAUTION, danger: C.DANGER,
  },
  bandQuiet,
  lap: { periodS: lap.length * rec.sample_s, c0: dm[0], dc, v0: kmh10[0], dv, s0: sdm[0], ds, names, events, sig },
  trains,
  clockS: rec.snapshot_clock_s,
  status: { inService: rec.snapshot.ops.service.trains_in_service, headway, target, period, events: eventsCount },
}
const json = JSON.stringify(data)
writeFileSync(OUT, json)
console.log(`wrote ${OUT.pathname}: ${(json.length / 1024).toFixed(0)} KB, ${trains.length} trains, lap ${data.lap.periodS} s, ${events.length} events, status`, data.status)

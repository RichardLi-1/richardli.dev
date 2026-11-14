import { describe, expect, it } from "vitest"
import rawData from "./transit-control-data.json"
import type { VisualData } from "./types"
import { Lap, Route, authorities, nextDisplayedKmh, trainBody } from "./playback"

const data = rawData as unknown as VisualData
const route = new Route(data.route)
const lap = new Lap(data.lap, route)
const L = route.lengthM
const ahead = (a: number, b: number) => (((b - a) % L) + L) % L
const trainsAt = (tau: number) => data.trains.map((t) => ({ ...lap.at(t.phase + tau), lengthM: t.lengthM }))
// sample a whole lap at irregular steps
const TAUS = Array.from({ length: 60 }, (_, i) => i * 137.3)

describe("recorded lap", () => {
  it("closes on itself, so the animation loops with no jump", () => {
    const start = lap.at(0)
    const justBefore = lap.at(lap.periodS - 0.001)
    expect(lap.at(lap.periodS).c).toBeCloseTo(start.c, 6)
    expect(Math.min(ahead(justBefore.c, start.c), ahead(start.c, justBefore.c))).toBeLessThan(2)
  })

  it("stops at both terminals and downtown", () => {
    const stops = new Set<string>()
    for (let s = 0; s < lap.periodS; s += 5) {
      const t = lap.at(s)
      if (t.state === "dwelling" && t.station) stops.add(t.station)
    }
    for (const name of ["Vaughan MC", "Finch", "Union", "St George", "Bloor–Yonge"]) expect(stops).toContain(name)
  })
})

describe("trains on the card", () => {
  it("never overlap the train ahead", () => {
    for (const tau of TAUS) {
      const ts = trainsAt(tau).sort((a, b) => a.c - b.c)
      ts.forEach((t, i) => {
        const leader = ts[(i + 1) % ts.length]
        expect(ahead(t.c, leader.c - leader.lengthM)).toBeGreaterThan(0)
      })
    }
  })

  it("get an authority that stops short of the train ahead's tail (moving block)", () => {
    for (const tau of TAUS) {
      const ts = trainsAt(tau)
      const eoa = authorities(route, ts)
      const order = ts.map((_, i) => i).sort((a, b) => ts[a].c - ts[b].c)
      order.forEach((idx, k) => {
        const leader = ts[order[(k + 1) % order.length]]
        expect(eoa[idx]).toBeGreaterThanOrEqual(0)
        expect(eoa[idx]).toBeLessThanOrEqual(ahead(ts[idx].c, leader.c - leader.lengthM))
      })
    }
  })

  // No minimum-length check: like the app, a body whose tail is still on the widened Union loop
  // can come out a few px long (see trainBody).
  it("draw a body that ends at the nose", () => {
    for (const t of trainsAt(0)) {
      const p = trainBody(route, t.c, t.lengthM, data.pxPerM)
      const nose = route.appendRange(t.c, 0)
      expect(p.length).toBeGreaterThanOrEqual(4)
      expect(p[p.length - 2]).toBeCloseTo(nose[0], 6)
      expect(p[p.length - 1]).toBeCloseTo(nose[1], 6)
    }
  })
})

describe("displayed km/h", () => {
  it("holds within the 0.9 km/h band, so 79.5 doesn't flicker", () => {
    expect(nextDisplayedKmh(undefined, 79.5, false)).toBe(80)
    expect(nextDisplayedKmh(80, 79.3, false)).toBe(80)
    expect(nextDisplayedKmh(80, 78.9, false)).toBe(79)
  })

  it("is exactly 0 when stationary and never 0 when moving", () => {
    expect(nextDisplayedKmh(12, 0.2, true)).toBe(0)
    expect(nextDisplayedKmh(0, 0.2, false)).toBe(1)
  })
})

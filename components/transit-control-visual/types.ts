// Shape of transit-control-data.json, written by scripts/transit-control-visual/build-data.mjs.
// Every value in it was measured from the real simulator, not typed in by hand.

export interface VisualData {
  /** The app's viewport the card reproduces, in CSS px (it is scaled down to fit the card). */
  stage: { width: number; height: number }
  /** The map canvas's box inside the stage, and its static drawing as SVG markup: `under` is
   *  everything drawn before trains (track, platforms, switches, signals), `over` is the label
   *  pass drawn on top of them. Text uses class "s" (IBM Plex Sans) or "m" (IBM Plex Mono). */
  map: { x: number; y: number; width: number; height: number; under: string; over: string }
  /** The route in map px. Each segment: [startM, lengthM, x0, y0, x1, y1, …]. */
  route: { lengthM: number; segs: number[][] }
  /** Map px per real metre at the layout's typical scale (sets train length on screen). */
  pxPerM: number
  colors: {
    background: string
    border: string
    running: string
    arriving: string
    dwelling: string
    stopped: string
    ebrake: string
    maBand: string
    maEoa: string
    caution: string
    danger: string
  }
  /** Opacity of a nominal authority band at this zoom (the app dims them when zoomed out). */
  bandQuiet: number
  /** One recorded lap, 1 sample per second. c0 / dc and s0 / ds (ATP stopping distance) in
   *  decimetres, v0 / dv in tenths of km/h. events rows: [second, state, station, next, ebrake];
   *  state / station / next index `names` (-1 = none). sig rows: [fromSecond, toSecond,
   *  stopChainage in dm] while a red signal was the binding limit. */
  lap: {
    periodS: number
    c0: number
    dc: number[]
    v0: number
    dv: number[]
    s0: number
    ds: number[]
    names: string[]
    events: number[][]
    sig: number[][]
  }
  /** Trains in the order the app draws them; `phase` = seconds into the lap at the snapshot. */
  trains: { label: string; phase: number; lengthM: number }[]
  /** SIM clock at the snapshot, seconds since midnight. */
  clockS: number
  /** Status bar and inspector values at the snapshot. */
  status: { inService: number; headway: string; target: string; period: string; events: number }
}

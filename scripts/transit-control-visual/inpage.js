// Runs inside the real app page (vite dev). Exposes window.__captureVisual(): draws the map with
// the app's own layer functions into an SVG-recording 2D context, and exports the geometry the
// experiments card needs.
(() => {
  const r2 = (v) => Math.round(v * 100) / 100

  // ── a CanvasRenderingContext2D stand-in that records SVG ────────────────────────────────
  class SvgRecorder {
    constructor(width, height) {
      this.canvas = { width, height, clientWidth: width, clientHeight: height }
      const m = document.createElement('canvas').getContext('2d')
      this._m = m // real context for measureText
      this._s = {
        fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
        miterLimit: 10, globalAlpha: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic',
        t: [1, 0, 0, 1, 0, 0],
      }
      this._stack = []
      this._d = []
      this._cur = null
      this._start = null
      this.out = []
    }
    // state ------------------------------------------------------------------------------
    save() { this._stack.push({ ...this._s, t: this._s.t.slice() }) }
    restore() { if (this._stack.length) this._s = this._stack.pop() }
    _mul(a, b, c, d, e, f) {
      const [A, B, C, D, E, F] = this._s.t
      this._s.t = [A * a + C * b, B * a + D * b, A * c + C * d, B * c + D * d, A * e + C * f + E, B * e + D * f + F]
    }
    translate(x, y) { this._mul(1, 0, 0, 1, x, y) }
    rotate(a) { const c = Math.cos(a), s = Math.sin(a); this._mul(c, s, -s, c, 0, 0) }
    scale(x, y) { this._mul(x, 0, 0, y, 0, 0) }
    transform(a, b, c, d, e, f) { this._mul(a, b, c, d, e, f) }
    setTransform(a, b, c, d, e, f) { this._s.t = typeof a === 'object' ? [a.a, a.b, a.c, a.d, a.e, a.f] : [a, b, c, d, e, f] }
    resetTransform() { this._s.t = [1, 0, 0, 1, 0, 0] }
    getTransform() { return new DOMMatrix(this._s.t) }
    setLineDash() {}
    getLineDash() { return [] }
    measureText(text) { this._m.font = this._s.font; return this._m.measureText(text) }
    _scale() { const [a, b] = this._s.t; return Math.hypot(a, b) }
    _p(x, y) { const [a, b, c, d, e, f] = this._s.t; return [a * x + c * y + e, b * x + d * y + f] }
    // path --------------------------------------------------------------------------------
    beginPath() { this._d = []; this._cur = null; this._start = null }
    moveTo(x, y) { const p = this._p(x, y); this._d.push(`M${r2(p[0])} ${r2(p[1])}`); this._cur = p; this._start = p }
    lineTo(x, y) {
      if (!this._cur) return this.moveTo(x, y)
      const p = this._p(x, y); this._d.push(`L${r2(p[0])} ${r2(p[1])}`); this._cur = p
    }
    closePath() { if (this._cur) { this._d.push('Z'); this._cur = this._start } }
    rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.closePath(); this.moveTo(x, y) }
    arc(cx, cy, r, a0, a1, ccw = false) {
      const TAU = Math.PI * 2
      let delta
      if (!ccw && a1 - a0 >= TAU) delta = TAU
      else if (ccw && a0 - a1 >= TAU) delta = -TAU
      else if (!ccw) { delta = (a1 - a0) % TAU; if (delta < 0) delta += TAU }
      else { delta = (a0 - a1) % TAU; if (delta < 0) delta += TAU; delta = -delta }
      const sx = cx + r * Math.cos(a0), sy = cy + r * Math.sin(a0)
      if (this._cur) this.lineTo(sx, sy); else this.moveTo(sx, sy)
      if (delta === 0) return
      const [a, b, c, d] = this._s.t
      const flip = a * d - b * c < 0
      const rr = r2(r * this._scale())
      const pieces = Math.ceil(Math.abs(delta) / Math.PI - 1e-9)
      for (let i = 1; i <= pieces; i++) {
        const ang = a0 + (delta * i) / pieces
        const p = this._p(cx + r * Math.cos(ang), cy + r * Math.sin(ang))
        const sweep = (delta > 0) !== flip ? 1 : 0
        this._d.push(`A${rr} ${rr} 0 0 ${sweep} ${r2(p[0])} ${r2(p[1])}`)
        this._cur = p
      }
    }
    roundRect(x, y, w, h, radii = 0) {
      let r = Array.isArray(radii) ? radii[0] ?? 0 : radii
      if (typeof r === 'object') r = r.x ?? 0
      r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))
      const H = Math.PI / 2
      this.moveTo(x + r, y)
      this.lineTo(x + w - r, y)
      this.arc(x + w - r, y + r, r, -H, 0)
      this.lineTo(x + w, y + h - r)
      this.arc(x + w - r, y + h - r, r, 0, H)
      this.lineTo(x + r, y + h)
      this.arc(x + r, y + h - r, r, H, 2 * H)
      this.lineTo(x, y + r)
      this.arc(x + r, y + r, r, 2 * H, 3 * H)
      this.closePath()
      this.moveTo(x, y)
    }
    // painting ------------------------------------------------------------------------------
    _alpha() { return this._s.globalAlpha < 1 ? ` opacity="${r2(this._s.globalAlpha)}"` : '' }
    fill() {
      if (!this._d.length) return
      this.out.push({ k: 'path', d: this._d.join(''), a: `fill="${this._s.fillStyle}"${this._alpha()}`, solid: this._s.globalAlpha >= 1 })
    }
    stroke() {
      if (!this._d.length) return
      const s = this._s
      let a = `fill="none" stroke="${s.strokeStyle}" stroke-width="${r2(s.lineWidth * this._scale())}"`
      if (s.lineCap !== 'butt') a += ` stroke-linecap="${s.lineCap}"`
      if (s.lineJoin !== 'miter') a += ` stroke-linejoin="${s.lineJoin}"`
      else if (s.miterLimit !== 4) a += ` stroke-miterlimit="${s.miterLimit}"`
      this.out.push({ k: 'path', d: this._d.join(''), a: a + this._alpha(), solid: s.globalAlpha >= 1 })
    }
    fillRect(x, y, w, h) {
      const saved = [this._d, this._cur, this._start]
      this.beginPath(); this.rect(x, y, w, h); this.fill()
      ;[this._d, this._cur, this._start] = saved
    }
    strokeRect(x, y, w, h) {
      const saved = [this._d, this._cur, this._start]
      this.beginPath(); this.rect(x, y, w, h); this.stroke()
      ;[this._d, this._cur, this._start] = saved
    }
    clearRect() {}
    _text(text, x, y, paint) {
      const s = this._s
      const m = this._m
      m.font = s.font
      // Canvas positions text on `textBaseline`; SVG on the alphabetic baseline. Shift by the
      // difference between the two (both measured from the font's bounding-box top).
      m.textBaseline = 'alphabetic'
      const ascAlpha = m.measureText(text).fontBoundingBoxAscent
      m.textBaseline = s.textBaseline
      const ascHere = m.measureText(text).fontBoundingBoxAscent
      m.textBaseline = 'alphabetic'
      const dy = ascAlpha - ascHere
      const anchor = s.textAlign === 'center' ? 'middle' : s.textAlign === 'right' || s.textAlign === 'end' ? 'end' : 'start'
      const [a, b, c, d, e, f] = s.t
      const tf = a === 1 && b === 0 && c === 0 && d === 1 ? null : `matrix(${[a, b, c, d, e, f].map(r2).join(' ')})`
      const [px, py] = tf ? [x, y + dy] : [x + e, y + dy + f]
      this.out.push({ k: 'text', text, font: s.font, anchor, x: r2(px), y: r2(py), tf, paint, solid: false })
    }
    fillText(text, x, y) { this._text(text, x, y, `fill="${this._s.fillStyle}"${this._alpha()}`) }
    strokeText(text, x, y) {
      const s = this._s
      this._text(text, x, y, `fill="none" stroke="${s.strokeStyle}" stroke-width="${r2(s.lineWidth)}" stroke-linejoin="${s.lineJoin}"${this._alpha()}`)
    }
    take() { const o = this.out; this.out = []; return o }
  }

  // Layers assign style props directly (ctx.fillStyle = …): route them into the saved state.
  for (const k of ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'globalAlpha', 'font', 'textAlign', 'textBaseline']) {
    Object.defineProperty(SvgRecorder.prototype, k, {
      get() { return this._s[k] },
      set(v) {
        if ((k === 'lineWidth' || k === 'miterLimit') && !(v > 0)) return // canvas ignores these
        if (k === 'globalAlpha' && !(v >= 0 && v <= 1)) return
        this._s[k] = v
      },
    })
  }

  // Serialize recorded items, merging consecutive opaque paths that share every attribute.
  function toSvg(items, fontClass) {
    const parts = []
    let last = null
    for (const it of items) {
      if (it.k === 'path') {
        if (last && last.k === 'path' && last.solid && it.solid && last.a === it.a) { last.d += it.d; continue }
        last = { ...it }
        parts.push(last)
      } else {
        last = null
        parts.push(it)
      }
    }
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return parts.map((p) => {
      if (p.k === 'path') return `<path d="${p.d}" ${p.a}/>`
      const f = fontClass(p.font)
      const tf = p.tf ? ` transform="${p.tf}"` : ''
      const anchor = p.anchor === 'start' ? '' : ` text-anchor="${p.anchor}"`
      return `<text x="${p.x}" y="${p.y}" class="${f.cls}" font-size="${f.size}" font-weight="${f.weight}"${anchor}${tf} ${p.paint}>${esc(p.text)}</text>`
    }).join('')
  }

  function fontClass(font) {
    const m = font.match(/^(?:(\w+)\s+)?(?:(\d{3}|bold|normal)\s+)?([\d.]+)px\s+(.*)$/)
    if (!m) throw new Error('unparsed font: ' + font)
    const weight = /^\d{3}$/.test(m[2] ?? '') ? m[2] : m[2] === 'bold' ? '700' : /^\d{3}$/.test(m[1] ?? '') ? m[1] : '400'
    return { cls: /mono/i.test(m[4]) ? 'm' : 's', size: m[3], weight }
  }

  // Prefer the ?t= URL (the app's instance) over a plain one, which would be a second copy.
  window.__visImport = (p) => {
    const urls = performance.getEntriesByType('resource').map((e) => e.name).filter((u) => new URL(u).pathname === p)
    const hit = urls.find((u) => u.includes('?t=')) ?? urls[0]
    return import(/* @vite-ignore */ hit ?? p)
  }

  window.__captureVisual = async () => {
    // Import the exact URL the app loaded (vite adds ?t= to modules edited since the server
    // started), so we share the app's module instances: same stores, same label registry.
    const loaded = performance.getEntriesByType('resource').map((e) => e.name)
    const imp = window.__visImport
    const { useTopologyStore } = await imp('/src/store/topologyStore.ts')
    const { useRuntimeStore } = await imp('/src/store/runtimeStore.ts')
    const { Viewport } = await imp('/src/render/Viewport.ts')
    const { renderTrackLayer } = await imp('/src/render/layers/TrackLayer.ts')
    const { renderLabelLayer } = await imp('/src/render/layers/LabelLayer.ts')
    const { renderSwitchLayer } = await imp('/src/render/layers/SwitchLayer.ts')
    const { renderSignalLayer } = await imp('/src/render/layers/SignalLayer.ts')
    const { renderTrainLayer } = await imp('/src/render/layers/TrainLayer.ts')
    const { getRouteIndex } = await imp('/src/motion/routeIndex.ts')
    const { worldPerMetre } = await imp('/src/layout/chainage.ts')
    const { COLORS } = await imp('/src/constants/colors.ts')

    const topology = useTopologyStore.getState().topology
    if (!topology) {
      throw new Error('no topology; store keys=' + Object.keys(useTopologyStore.getState()).join(',') +
        ' loaded=' + loaded.filter((u) => /Store|main|App/.test(u)).join(' '))
    }
    const st = useRuntimeStore.getState()
    const runtime = st.runtime
    const opts = { showSafeZones: st.showSafeZones, showLabels: st.showLabels, hoveredId: null, selectedId: null }
    const canvas = document.querySelector('canvas')
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    const bounds = { minX: topology.bounds.min_x, minY: topology.bounds.min_y, maxX: topology.bounds.max_x, maxY: topology.bounds.max_y }
    const vp = new Viewport()
    vp.resize(W, H)
    vp.fitToBounds(bounds)
    const route = getRouteIndex(topology)

    const layersUnder = (ctx) => {
      renderTrackLayer(ctx, vp, topology)
      renderLabelLayer(ctx, vp, topology, opts.showLabels)
      renderSwitchLayer(ctx, vp, topology, runtime)
      renderSignalLayer(ctx, vp, topology, runtime, false)
    }
    const motionFrame = (trains) => ({ nowMs: performance.now(), simT: runtime.sim_time_s, route, trains, byId: new Map(trains.map((m) => [m.id, m])) })
    const motionTrains = () => runtime.trains.map((t) => ({
      id: t.train_id, train: t, c: t.chainage_m, speed: t.speed, stationary: t.state === 'dwelling', eoa: t.authority_eoa_m,
      firstSeenMs: 0, lengthM: t.length_m, displayKmh: Math.round(t.speed * 3.6), alpha: 1,
      drawn: false, screenPts: [], halfWidth: 3, naturalPx: 0, labelRect: null, badgeRect: null,
    }))

    // 1. SVG: everything under the trains, then the label pass (drawn over them)
    const rec = new SvgRecorder(W, H)
    layersUnder(rec)
    const under = toSvg(rec.take(), fontClass)
    renderTrainLayer(rec, vp, topology, runtime, motionFrame([]), opts)
    const over = toSvg(rec.take(), fontClass)

    // 2. Reference: the real renderer, trains included, at 2x
    const ref = document.createElement('canvas')
    ref.width = W * 2
    ref.height = H * 2
    const g = ref.getContext('2d')
    g.setTransform(2, 0, 0, 2, 0, 0)
    g.fillStyle = COLORS.BACKGROUND
    g.fillRect(0, 0, W, H)
    layersUnder(g)
    const drawn = motionTrains()
    renderTrainLayer(g, vp, topology, runtime, motionFrame(drawn), opts)

    // 2b. The train layer alone through the recorder: bands + bodies exactly as the app styles them
    const recT = new SvgRecorder(W, H)
    renderTrainLayer(recT, vp, topology, runtime, motionFrame(motionTrains()), opts)
    const trainLayer = toSvg(recT.take(), fontClass)

    // 3. Route in screen space (chainage → screen is linear by arc length within a segment)
    const { cx, cy, zoom } = vp.camera
    const toS = (p) => [r2((p.x - cx) * zoom + W / 2), r2((p.y - cy) * zoom + H / 2)]
    return {
      width: W,
      height: H,
      mapRect: canvas.getBoundingClientRect().toJSON(),
      opts,
      colors: { ...COLORS },
      route: { lengthM: route.lengthM, segs: route.segs.map((s) => ({ startM: s.startM, lengthM: s.lengthM, pts: s.pts.map(toS) })) },
      pxPerM: worldPerMetre(topology) * zoom,
      under,
      over,
      trainLayer,
      refPng: ref.toDataURL('image/png'),
      drawnTrains: drawn.filter((m) => m.drawn).map((m) => ({ id: m.id, c: m.c, state: m.train.state, pts: m.screenPts.map(r2) })),
    }
  }
})()

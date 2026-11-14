// Drive the real app (vite dev :5173) in headless Chrome with /state answered from a recorded
// snapshot, then export the map (SVG via the app's own layers), the chrome's DOM geometry, and
// reference screenshots.  usage: node capture.mjs <rec.json> <outDir> [width height]
// CBTC_APP_URL (default http://localhost:5173) and CHROME (default: macOS Google Chrome) override.
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'

const [, , recPath, outDir, wArg, hArg] = process.argv
const W = Number(wArg ?? 1440)
const H = Number(hArg ?? 900)
const HERE = new URL('.', import.meta.url).pathname
mkdirSync(outDir, { recursive: true })
const rec = JSON.parse(readFileSync(recPath, 'utf8'))
const inpage = readFileSync(`${HERE}/inpage.js`, 'utf8')

const profile = `${outDir}/.chrome`
rmSync(profile, { recursive: true, force: true })
const port = 9950 + Math.floor(Math.random() * 40)
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const APP_URL = process.env.CBTC_APP_URL ?? 'http://localhost:5173'
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, `--window-size=${W},${H}`, '--no-first-run', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// Never hang: if Chrome or the app stops answering, give up with a clear error.
setTimeout(() => { console.error('capture timed out after 120 s (is the app running at ' + APP_URL + '?)'); chrome.kill(); process.exit(1) }, 120_000).unref()
let targets
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break } catch { await sleep(200) }
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') console.log('page exception:', m.params.exceptionDetails.exception?.description?.split('\n')[0])
})
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800))
  return r.result.result.value
}

await send('Runtime.enable')
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: false })
// Answer /state with the recorded snapshot so the real UI renders exactly that moment.
const fake = `(() => {
  const body = ${JSON.stringify(JSON.stringify(rec.snapshot))}
  const real = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href)
    if (url.pathname === '/state') return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }))
    return real(input, init)
  }
})()`
await send('Page.addScriptToEvaluateOnNewDocument', { source: fake })
await send('Page.addScriptToEvaluateOnNewDocument', { source: inpage })
await send('Page.navigate', { url: `${APP_URL}/?intro=0` })

for (let i = 0; i < 60; i++) {
  await sleep(250)
  const ok = await evaluate(`(async () => {
    if (document.fonts.status !== 'loaded') return false
    const { useRuntimeStore } = await window.__visImport('/src/store/runtimeStore.ts')
    const { useTopologyStore } = await window.__visImport('/src/store/topologyStore.ts')
    return !!useRuntimeStore.getState().runtime && !!useTopologyStore.getState().topology
  })()`).catch(() => false)
  if (ok) break
}
await sleep(2500) // let the motion engine settle on the snapshot

const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(`${outDir}/app.png`, Buffer.from(shot.result.data, 'base64'))

const map = await evaluate('window.__captureVisual()')
writeFileSync(`${outDir}/refmap.png`, Buffer.from(map.refPng.split(',')[1], 'base64'))
delete map.refPng
writeFileSync(`${outDir}/map.json`, JSON.stringify(map))

// Chrome geometry + computed styles for everything visible outside the canvas.
const dom = await evaluate(`(() => {
  const out = []
  const keep = ['color', 'backgroundColor', 'borderTopWidth', 'borderTopColor', 'borderRightWidth', 'borderRightColor',
    'borderBottomWidth', 'borderBottomColor', 'borderLeftWidth', 'borderLeftColor', 'borderRadius', 'fontFamily', 'fontSize',
    'fontWeight', 'letterSpacing', 'lineHeight', 'textTransform', 'opacity', 'paddingLeft', 'paddingRight', 'fontVariantNumeric', 'boxShadow']
  let rows = 0
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('canvas')) continue
    if (el.closest('li') && el.closest('ul[aria-label="Trains"]')) {
      const li = el.closest('li')
      const idx = [...li.parentElement.children].indexOf(li)
      if (idx > 2) continue
    }
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim()
    const st = {}
    for (const k of keep) st[k] = cs[k]
    out.push({ tag: el.tagName.toLowerCase(), cls: String(el.getAttribute('class') ?? '').slice(0, 160), aria: el.getAttribute('aria-label'),
      data: el.getAttribute('data-help'), text, r: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100), st,
      svg: el.tagName.toLowerCase() === 'svg' ? el.outerHTML.slice(0, 600) : undefined })
  }
  return out
})()`)
writeFileSync(`${outDir}/dom.json`, JSON.stringify(dom, null, 1))

// Text runs: where each visible text node starts, how wide it is, and its alphabetic baseline
// (range box top + the font's ascent), with the paint that matters for SVG text.
const runs = await evaluate(`(() => {
  const g = document.createElement('canvas').getContext('2d')
  const out = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent
    if (!t.trim()) continue
    const el = n.parentElement
    if (el.closest('ul[aria-label="Trains"]')) {
      const li = el.closest('li'); if ([...li.parentElement.children].indexOf(li) > 1) continue
    }
    const range = document.createRange(); range.selectNodeContents(n)
    const r = range.getBoundingClientRect()
    if (r.width < 1 || r.bottom < 0 || r.top > innerHeight) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden') continue
    g.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily
    const m = g.measureText(t)
    const lead = t.length - t.trimStart().length
    let x = r.x
    if (lead) { const r2 = document.createRange(); r2.setStart(n, lead); r2.setEnd(n, t.length); x = r2.getBoundingClientRect().x }
    out.push({ text: t.trim(), x: +x.toFixed(2), right: +r.right.toFixed(2), baseline: +(r.top + m.fontBoundingBoxAscent).toFixed(2),
      size: cs.fontSize, weight: cs.fontWeight, mono: /Mono/.test(cs.fontFamily), color: cs.color, ls: cs.letterSpacing,
      tt: cs.textTransform, fvn: cs.fontVariantNumeric, align: getComputedStyle(el).textAlign })
  }
  return out
})()`)
writeFileSync(`${outDir}/runs.json`, JSON.stringify(runs, null, 1))
console.log('map', map.width, 'x', map.height, 'at', JSON.stringify(map.mapRect), 'under', map.under.length, 'B, over', map.over.length, 'B, trains drawn', map.drawnTrains.length, '| dom', dom.length, 'elements')
ws.close()
chrome.kill()
await new Promise((r) => { chrome.once('exit', r); setTimeout(r, 3000) })
try { rmSync(profile, { recursive: true, force: true }) } catch {}
process.exit(0)

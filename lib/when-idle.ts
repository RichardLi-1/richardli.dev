// Runs `callback` once the page has finished loading AND the browser has a
// quiet moment, so non-essential work (analytics recorders, the custom cursor,
// the chat orb…) doesn't compete with the first render, hydration and the
// visitor's first scroll. Browser only.
//
// requestIdleCallback = "call me when the main thread has nothing urgent to
// do"; `timeout` makes sure it still runs on a page that's never idle. Safari
// added it late, so there's a setTimeout fallback.
//
// `quietMs` goes further: also wait until the *visitor* has stopped moving the
// mouse, scrolling or typing for that long. The browser being idle isn't enough
// for heavy one-off work (a session recorder copying the whole page can block
// for 100ms+), because the freeze would land mid-gesture and the cursor would
// stall. Waiting for a pause puts it where nobody is watching. `maxWaitMs`
// stops a constantly-active visitor from postponing it forever.
// 📖 Learn: requestIdleCallback, the window "load" event
export interface WhenIdleOptions {
  delay?: number // wait this long after load before looking for an idle moment
  timeout?: number // run even if the browser is never idle, after this long
  quietMs?: number // also require this long without mouse / scroll / key input
  maxWaitMs?: number // give up waiting for quiet after this long, run anyway
}

// One shared record of the visitor's last input, for every whenIdle caller
let lastInputAt = 0
let trackingInput = false
function trackInput() {
  if (trackingInput) return
  trackingInput = true
  const mark = () => {
    lastInputAt = performance.now()
  }
  for (const type of ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"]) {
    window.addEventListener(type, mark, { capture: true, passive: true })
  }
}

export function whenIdle(
  callback: () => void,
  { delay = 0, timeout = 3000, quietMs = 0, maxWaitMs = 20000 }: WhenIdleOptions = {},
): () => void {
  let cancelled = false
  let timer = 0
  let idleId = 0
  let waitingSince = 0
  if (quietMs) trackInput()

  // Called when the browser is idle; also checks the visitor has paused
  const attempt = () => {
    if (cancelled) return
    if (quietMs) {
      const now = performance.now()
      const quietFor = now - lastInputAt
      if (quietFor < quietMs && now - waitingSince < maxWaitMs) {
        timer = window.setTimeout(waitForIdle, quietMs - quietFor + 50)
        return
      }
    }
    callback()
  }

  const waitForIdle = () => {
    if (cancelled) return
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(attempt, { timeout })
    } else {
      timer = window.setTimeout(attempt, 200)
    }
  }

  const runWhenIdle = () => {
    timer = window.setTimeout(() => {
      waitingSince = performance.now()
      waitForIdle()
    }, delay)
  }

  // Wait for "load" first: until then the page is still fetching and decoding
  if (document.readyState === "complete") runWhenIdle()
  else window.addEventListener("load", runWhenIdle, { once: true })

  // Returns a cancel function (for React effect cleanups)
  return () => {
    cancelled = true
    window.clearTimeout(timer)
    window.removeEventListener("load", runWhenIdle)
    if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId)
  }
}

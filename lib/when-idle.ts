// Runs `callback` once the page has finished loading AND the browser has a
// quiet moment, so non-essential work (analytics recorders, the custom cursor,
// the chat orb…) doesn't compete with the first render, hydration and the
// visitor's first scroll. Browser only.
//
// requestIdleCallback = "call me when the main thread has nothing urgent to
// do"; `timeout` makes sure it still runs on a page that's never idle. Safari
// added it late, so there's a setTimeout fallback.
// 📖 Learn: requestIdleCallback, the window "load" event
export function whenIdle(callback: () => void, { delay = 0, timeout = 3000 } = {}): () => void {
  let cancelled = false
  let timer = 0
  let idleId = 0

  const runWhenIdle = () => {
    timer = window.setTimeout(() => {
      if (cancelled) return
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => !cancelled && callback(), { timeout })
      } else {
        timer = window.setTimeout(() => !cancelled && callback(), 200)
      }
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

// Sends a named event to /api/track, which forwards it to Discord server-side.
// Call this from any client component for button clicks, interactions, etc.
//
// Why a standalone function instead of a hook?
// Hooks must be called at the top level of a component and can't be used in
// event handlers called conditionally. A plain async function has no such rules.
// 📖 Learn: Rules of Hooks — https://react.dev/reference/rules/rules-of-hooks
//
// Usage:
//   trackEvent("Clicked GitHub")
//   trackEvent("Toggled dark mode", { from: "dark", to: "light" })

export function trackEvent(event: string, meta?: Record<string, string>) {
  // fire-and-forget — we don't await or surface errors to the user
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, meta }),
  }).catch(() => {
    // silently swallow network errors — tracking should never break the UI
  })
}

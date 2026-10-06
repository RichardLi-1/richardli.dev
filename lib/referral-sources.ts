// ─── Edit this to add/rename referral sources ─────────────────────────────────
// key   = the URL query param (e.g. "l" matches "?l" or "?l=anything")
// value = display name, bolded in the Discord message and passed on as
//         utm_content when visitors follow a link to another of your sites
// Used by hooks/use-page-view-tracker.ts and lib/outbound-links.ts.
export const REFERRAL_SOURCES: Record<string, string> = {
  c: "Cover Letter",
  l: "LinkedIn",
  r: "Resume",
  t: "Twitter/X",
  e: "Email",
  g: "GitHub",
  z: "Resume",
}
// ──────────────────────────────────────────────────────────────────────────────

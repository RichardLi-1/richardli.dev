// Tags links that leave this site for one of Richard's *other* sites
// (e.g. transitplanner.app), so those sites know where the visitor came from:
//
//   https://www.transitplanner.app/
//     ?utm_source=richardli.dev     ← the site that sent them (this one)
//     &utm_medium=referral
//     &utm_campaign=transitplanner  ← the page they clicked from ("home" for /)
//     &utm_content=chatgpt.com      ← how they reached *this* site, if known
//     &m                            ← only for visitors who opted out of tracking
//
// UTM parameters are read automatically by most analytics tools (PostHog,
// Vercel Analytics, Google Analytics), so the other site needs no extra code
// to see them. "?m" = "don't track me" (see hooks/use-preserve-m.ts).
// 📖 Learn: UTM parameters (utm_source / utm_medium / utm_campaign / utm_content)
import { mainProjects } from "@/components/mainProjects"
import { REFERRAL_SOURCES } from "@/lib/referral-sources"

const NO_TRACK_KEY = "skip_tracking" // localStorage, set when ?m is seen
const LANDING_SOURCE_KEY = "landing_source" // sessionStorage: how this visit arrived

// Project links that point at third-party stores rather than Richard's own
// sites; they wouldn't understand these params, so leave them clean.
const THIRD_PARTY_HOSTS = new Set(["apps.apple.com", "chromewebstore.google.com"])

// Hosts of every project's external site (e.g. transitplanner.app), minus stores
const PROJECT_HOSTS = new Set(
  mainProjects
    .map((project) => (project as { externalLink?: string }).externalLink)
    .filter((link): link is string => !!link)
    .map((link) => new URL(link).hostname)
    .filter((host) => !THIRD_PARTY_HOSTS.has(host)),
)

/** True if this visitor has asked not to be tracked (?m was seen at some point). */
export function isNoTrack(): boolean {
  try {
    return localStorage.getItem(NO_TRACK_KEY) === "1"
  } catch {
    return false // storage blocked (private mode etc.)
  }
}

/**
 * Remembers how this visit reached the site, from the landing URL, before
 * use-preserve-m strips its params. Checked in order:
 *   1. ?utm_source=… (e.g. ChatGPT adds utm_source=chatgpt.com)
 *   2. one of the referral keys (?z → "Resume", ?l → "LinkedIn", …)
 *   3. the external page that linked here (document.referrer)
 * An explicit param always replaces what's stored; a bare referrer only fills
 * in when nothing is stored yet. sessionStorage = this tab's visit only.
 * 📖 Learn: document.referrer, sessionStorage
 */
export function recordLandingSource(params: URLSearchParams) {
  try {
    let source = params.get("utm_source")
    if (!source) {
      for (const key of params.keys()) {
        if (REFERRAL_SOURCES[key]) {
          source = REFERRAL_SOURCES[key]
          break
        }
      }
    }
    if (source) {
      sessionStorage.setItem(LANDING_SOURCE_KEY, source)
      return
    }
    if (sessionStorage.getItem(LANDING_SOURCE_KEY) || !document.referrer) return
    const referrer = new URL(document.referrer).hostname
    if (referrer && referrer !== window.location.hostname) {
      sessionStorage.setItem(LANDING_SOURCE_KEY, referrer.replace(/^www\./, ""))
    }
  } catch {
    // storage blocked or an odd referrer: just don't record anything
  }
}

function readLandingSource(): string | null {
  try {
    return sessionStorage.getItem(LANDING_SOURCE_KEY)
  } catch {
    return null
  }
}

/** richardli.dev (any subdomain) or one of the projects' own sites, but not this site itself. */
function isOwnOtherSite(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false // mailto:, tel:, …
  if (url.origin === window.location.origin) return false // internal link
  const host = url.hostname.replace(/^www\./, "")
  return host === "richardli.dev" || host.endsWith(".richardli.dev") || PROJECT_HOSTS.has(url.hostname) || PROJECT_HOSTS.has(host)
}

/** utm_campaign: the page the click came from, e.g. "home" or "transitplanner". */
function campaignFor(pathname: string): string {
  const slug = pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-")
  return slug || "home"
}

/**
 * Returns `href` with attribution added if it goes to one of Richard's other
 * sites; otherwise unchanged. Safe to call more than once on the same link:
 * existing utm_* params (and an existing ?m) are never overwritten.
 */
export function withOutboundParams(href: string): string {
  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return href // not a URL we understand
  }
  if (!isOwnOtherSite(url)) return href

  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", window.location.hostname.replace(/^www\./, ""))
    url.searchParams.set("utm_medium", "referral")
    url.searchParams.set("utm_campaign", campaignFor(window.location.pathname))
    const origin = readLandingSource()
    if (origin) url.searchParams.set("utm_content", origin)
  }
  if (isNoTrack() && !url.searchParams.has("m")) {
    // Written by hand so it reads "&m" rather than URLSearchParams' "&m="
    url.search = url.search ? `${url.search}&m` : "?m"
  }
  return url.toString()
}

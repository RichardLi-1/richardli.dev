// "?m" = "don't track me". Visiting any page with ?m stores a flag in
// localStorage (hooks/use-preserve-m.ts), and analytics skip visits while
// it's set. This file passes that flag on to Richard's *other* sites: links
// to them get ?m added, so following a link from here doesn't count either.
import { mainProjects } from "@/components/mainProjects"

const FLAG_KEY = "skip_tracking"

// Project links that point at third-party stores rather than Richard's own
// sites; they wouldn't understand ?m, so leave them clean.
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
    return localStorage.getItem(FLAG_KEY) === "1"
  } catch {
    return false // storage blocked (private mode etc.)
  }
}

/** richardli.dev (any subdomain) or one of the projects' own sites, but not this site itself. */
function isOwnOtherSite(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false // mailto:, tel:, …
  if (url.origin === window.location.origin) return false // internal pages already read the flag
  const host = url.hostname.replace(/^www\./, "")
  return host === "richardli.dev" || host.endsWith(".richardli.dev") || PROJECT_HOSTS.has(url.hostname) || PROJECT_HOSTS.has(host)
}

/**
 * Returns `href` with ?m added, if this visitor has the no-tracking flag and
 * the link goes to one of Richard's other sites. Otherwise returns it unchanged.
 */
export function withNoTrackParam(href: string): string {
  if (!isNoTrack()) return href
  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return href // not a URL we understand
  }
  if (!isOwnOtherSite(url) || url.searchParams.has("m")) return href
  // Written by hand so it reads "?m" rather than URLSearchParams' "?m="
  url.search = url.search ? `${url.search}&m` : "?m"
  return url.toString()
}

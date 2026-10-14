// Describes what's on the visitor's screen for the agent: the page's sections
// (for scroll_to) and the links/buttons it can point at or click. Browser only.
//
// Each target gets a short id ("t1", "t2"…) written onto the element as
// data-agent-id, so when the model says point_at "t7", the orb can find it.
// Anything inside [data-agent-ignore] (the chat window, the orb) is skipped.
import type { PageMap } from "@/lib/agent"

const MAX_SECTIONS = 30
const MAX_TARGETS = 60
const MAX_LABEL = 60

/** Whitespace-collapsed, length-capped text. */
function clean(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_LABEL)
}

/** What a person would call this element: its accessible name, else its text. */
function labelFor(el: HTMLElement): string {
  return (
    clean(el.getAttribute("aria-label")) ||
    clean(el.innerText) ||
    clean(el.getAttribute("title")) ||
    clean(el.querySelector("img")?.getAttribute("alt"))
  )
}

function isShown(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false
  const style = getComputedStyle(el)
  return style.visibility !== "hidden" && style.display !== "none"
}

/** Leaves the site, opens a new tab, or launches another app (mail, phone). */
function isExternal(el: HTMLElement): boolean {
  if (!(el instanceof HTMLAnchorElement)) return false
  if (el.target === "_blank") return true
  const href = el.getAttribute("href") ?? ""
  if (/^(mailto|tel):/i.test(href)) return true
  try {
    return new URL(href, window.location.href).origin !== window.location.origin
  } catch {
    return true
  }
}

export function buildPageMap(): PageMap {
  // Fresh ids every time: the page may have changed since the last message
  document.querySelectorAll("[data-agent-id]").forEach((el) => el.removeAttribute("data-agent-id"))

  const sections: PageMap["sections"] = []
  // Headings with ids are the case study sections (the same ones CaseStudyNav jumps to)
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("main h1[id], main h2[id], main h3[id], main section[id]"))) {
    if (sections.length >= MAX_SECTIONS) break
    const label = clean(el.innerText)
    if (label && isShown(el)) sections.push({ id: el.id, label })
  }

  const targets: PageMap["targets"] = []
  let next = 1
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("a[href], button, [role='button']"))) {
    if (targets.length >= MAX_TARGETS) break
    if (el.closest("[data-agent-ignore]") || !isShown(el)) continue
    const label = labelFor(el)
    if (!label) continue
    const external = isExternal(el)
    const id = `t${next++}`
    el.setAttribute("data-agent-id", id)
    targets.push({
      id,
      // The bot may point at external links but never click them: a new tab
      // or a mail app opening on its own would be a nasty surprise
      label: external ? `${label} (opens outside the site)` : label,
      kind: el instanceof HTMLAnchorElement ? "link" : "button",
      clickable: !external,
    })
  }

  return { path: window.location.pathname, sections, targets }
}

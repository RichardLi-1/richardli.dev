// Shared by the chat (browser) and /api/chat (server) for the experimental
// "Let Richard drive" mode, where the chatbot can act on the site for the
// visitor: open pages, scroll, point at things, and click.
// Plain data + types only, so it's safe to import on both sides.
import { mainProjects } from "@/components/mainProjects"

/** One thing the bot does on the page. The server sends these; components/agent-cursor.tsx performs them. */
export type AgentAction =
  | { type: "open_page"; path: string }
  | { type: "scroll_to"; section: string } // an element id on the current page
  | { type: "point_at"; target: string } // a PageMap target id
  | { type: "click"; target: string } // a PageMap target id
  | { type: "start_tour"; stops: string[] } // page paths; the orb visits each and asks the bot to present it

/**
 * What the visitor is looking at, sent with each message so the model knows
 * what it can point at. Built in the browser by buildPageMap().
 */
export interface PageMap {
  path: string
  sections: { id: string; label: string }[]
  targets: { id: string; label: string; kind: "link" | "button"; clickable: boolean }[]
}

// Case studies that have their own page (app/<id>/page.tsx). Not /classprofile
// or /transitto: those just redirect to other sites, so "opening" them would
// silently take the visitor off richardli.dev.
const CASE_STUDY_IDS = [
  "4sight", "amd", "boink", "cec", "fatherfigure", "futureforward",
  "safuture", "salespatriot", "transitplanner", "yrhacks",
]

/** Every page the bot may open, with a short description for the model. */
export const SITE_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Home: hero, what Richard's up to, featured projects" },
  { path: "/about", label: "About Richard" },
  { path: "/resume", label: "Resume" },
  { path: "/contact", label: "Contact form" },
  { path: "/chat", label: "Full-page chat with Richard" },
  { path: "/side-quests", label: "Side quests: smaller projects and experiments" },
  { path: "/transit/fanning", label: "Transit photography gallery" },
  // (/transit/hypo-maps is left out: the page is empty for now)
  ...CASE_STUDY_IDS.map((id) => {
    const project = mainProjects.find((p) => p.id === id)
    return { path: `/${id}`, label: `Case study: ${project?.title ?? id}` }
  }),
]

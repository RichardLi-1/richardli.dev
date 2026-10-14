"use client"

/* ──────────────────────────────────────────────────────────────────────────
 * WebMCP tools: lets AI agents in the browser drive the site through real
 * tools instead of guessing at buttons from a screenshot.
 *
 * WebMCP is a W3C draft (Google + Microsoft): a page registers tools with
 * document.modelContext.registerTool(), and an agent in the browser (Gemini in
 * Chrome is expected first) can discover and call them.
 * 📖 Learn: WebMCP — https://developer.chrome.com/docs/ai/webmcp
 *
 * The tools mirror what the chatbot's own Drive mode can do, and run through
 * the same orb (components/agent-orb.tsx), so whatever an outside agent does
 * on the site is visible to the person watching.
 *
 * Status (Oct 2026): a Chrome origin trial (149–156). Visitors only get it when
 * the origin-trial token is set (see app/layout.tsx); locally, turn on
 * chrome://flags/#enable-webmcp-testing. Everywhere else this does nothing.
 *
 * Chrome quirks handled here:
 *   - some versions pass a tool's input as a JSON string, others as an object
 *   - there's no unregisterTool(): tools are removed by aborting the `signal`
 *     passed when registering them
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect } from "react"
import { SITE_PAGES, type AgentAction } from "@/lib/agent"
import { buildPageMap } from "@/lib/agent-page-map"
import { runChatTurn } from "@/lib/chat-client"
import { startAgentRun } from "@/components/agent-orb"

// The WebMCP API isn't in TypeScript's DOM types yet, so describe the parts we use
interface WebMcpTool {
  name: string
  title?: string
  description: string
  inputSchema: object
  annotations?: { readOnlyHint?: boolean }
  execute: (input: unknown) => Promise<{ content: { type: "text"; text: string }[] }>
}
interface ModelContext {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => Promise<void> | void
}

/** document.modelContext is the current name; navigator.modelContext the older one Chrome still serves. */
function getModelContext(): ModelContext | null {
  const doc = document as Document & { modelContext?: ModelContext }
  const nav = navigator as Navigator & { modelContext?: ModelContext }
  return doc.modelContext ?? nav.modelContext ?? null
}

/** A tool's input as an object, whichever form Chrome sent it in. */
function readInput(input: unknown): Record<string, unknown> {
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {}
}

/** The result shape WebMCP expects: a list of content blocks (MCP style). */
const reply = (text: string) => ({ content: [{ type: "text" as const, text }] })

/** Runs one action through the orb, so it's visible, then reports back. */
async function perform(action: AgentAction, done: string) {
  const ran = await startAgentRun([action])
  return reply(ran ? done : "The site's agent orb isn't available on this page (e.g. Windows XP mode).")
}

const stringField = (description: string, values?: string[]) => ({
  type: "object",
  properties: { value: { type: "string", description, ...(values ? { enum: values } : {}) } },
  required: ["value"],
  additionalProperties: false,
})

function buildTools(): WebMcpTool[] {
  return [
    {
      name: "list_pages",
      title: "List pages",
      description: "Every page on Richard Li's site, with a one-line summary. Start here.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => reply(SITE_PAGES.map((p) => `${p.path}: ${p.label}`).join("\n")),
    },
    {
      name: "describe_page",
      title: "Describe this page",
      description:
        "What's on the current page: its sections (for scroll_to_section) and the links and buttons on it, each with an id (for highlight and click). Call again after the page changes; ids are only valid until the next call.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => reply(JSON.stringify({ title: document.title, ...buildPageMap() }, null, 2)),
    },
    {
      name: "open_page",
      title: "Open a page",
      description: "Go to another page on the site (paths from list_pages).",
      inputSchema: stringField("Page path, e.g. /transitplanner", SITE_PAGES.map((p) => p.path)),
      execute: async (input) => {
        const path = readInput(input).value
        if (typeof path !== "string" || !SITE_PAGES.some((p) => p.path === path)) {
          return reply(`Unknown page. Valid paths: ${SITE_PAGES.map((p) => p.path).join(", ")}`)
        }
        return perform({ type: "open_page", path }, `Opening ${path}.`)
      },
    },
    {
      name: "scroll_to_section",
      title: "Scroll to a section",
      description: "Scroll the current page to a section, by its id from describe_page.",
      inputSchema: stringField("Section id from describe_page"),
      execute: async (input) => {
        const section = readInput(input).value
        if (typeof section !== "string" || !document.getElementById(section)) {
          return reply("No section with that id on this page. Call describe_page for the current ids.")
        }
        return perform({ type: "scroll_to", section }, `Scrolled to ${section}.`)
      },
    },
    {
      name: "highlight",
      title: "Highlight something",
      description: "Point at a link or button on the current page and highlight it for a moment, without clicking it. Uses an id from describe_page.",
      inputSchema: stringField("Target id from describe_page, e.g. t7"),
      execute: async (input) => {
        const target = readInput(input).value
        if (typeof target !== "string" || !document.querySelector(`[data-agent-id="${CSS.escape(target)}"]`)) {
          return reply("No element with that id. Call describe_page for the current ids.")
        }
        return perform({ type: "point_at", target }, `Highlighted ${target}.`)
      },
    },
    {
      name: "click",
      title: "Click something",
      description:
        "Click a link or button on the current page, by its id from describe_page. Links that leave the site can't be clicked.",
      inputSchema: stringField("Target id from describe_page, e.g. t5"),
      execute: async (input) => {
        const target = readInput(input).value
        const map = buildPageMap() // fresh ids, so check against what's on screen right now
        const found = typeof target === "string" ? map.targets.find((t) => t.id === target) : undefined
        if (!found) return reply("No element with that id. Call describe_page for the current ids.")
        if (!found.clickable) return reply(`"${found.label}" leaves the site, so it can't be clicked. Tell the visitor about it instead.`)
        return perform({ type: "click", target: found.id }, `Clicked "${found.label}".`)
      },
    },
    {
      name: "ask_richard",
      title: "Ask Richard",
      description:
        "Ask the site's chatbot, which answers as Richard Li using his projects, work history and writing. Good for questions the pages don't answer directly.",
      inputSchema: stringField("The question"),
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const question = readInput(input).value
        if (typeof question !== "string" || !question.trim()) return reply("Ask a question.")
        // Shows up in the site's chat history too, so it's visible to the visitor
        const result = await runChatTurn({ text: question }).catch(() => null)
        return reply(result?.content || "Richard couldn't answer right now. Try again in a minute.")
      },
    },
  ]
}

/** Mount once in the root layout. Registers the tools if the browser supports WebMCP. */
export function WebMcpTools() {
  useEffect(() => {
    const modelContext = getModelContext()
    if (!modelContext) return // no WebMCP here: nothing to do

    // One signal for all the tools: aborting it unregisters every one of them
    // 📖 Learn: AbortController / AbortSignal
    const controller = new AbortController()
    for (const tool of buildTools()) {
      Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal })).catch((err: unknown) => {
        // e.g. a duplicate name while React re-mounts in development
        console.warn(`[webmcp] couldn't register ${tool.name}:`, err)
      })
    }
    return () => controller.abort()
  }, [])

  return null
}

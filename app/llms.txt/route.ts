// GET /llms.txt: a plain-text guide to the site for AI agents and LLM crawlers.
//
// llms.txt is an emerging convention (like robots.txt, but for language
// models): a Markdown file at the site root saying what the site is, which
// pages matter, and how to use them. Agents read it before acting.
// 📖 Learn: llms.txt — https://llmstxt.org
//
// Generated from the same page list the chatbot's Drive mode and the WebMCP
// tools use (lib/agent.ts), so it can't drift out of date.
import { SITE_PAGES } from "@/lib/agent"
import { mainProjects } from "@/components/mainProjects"

const SITE = "https://richardli.dev"

// Built once at build time: the content only changes when the code does
export const dynamic = "force-static"

/** "Home: hero, …" → "- [Home](…/): hero, …" (the part before the colon is the link text) */
function pageLine(page: { path: string; label: string }): string {
  const [name, ...rest] = page.label.split(":")
  const note = rest.join(":").trim()
  return `- [${name}](${SITE}${page.path})${note ? `: ${note}` : ""}`
}

export function GET() {
  const caseStudies = SITE_PAGES.filter((p) => p.label.startsWith("Case study:"))
  const otherPages = SITE_PAGES.filter((p) => !p.label.startsWith("Case study:"))

  const caseStudyLines = caseStudies.map((page) => {
    const project = mainProjects.find((p) => `/${p.id}` === page.path) as { title: string; description?: string } | undefined
    const title = project?.title ?? page.label.replace("Case study: ", "")
    return `- [${title}](${SITE}${page.path})${project?.description ? `: ${project.description}` : ""}`
  })

  const body = `# Richard Li

> Personal site and portfolio of Richard Li: transit, software, AI and design work, with case studies, photography and a chatbot that answers as Richard.

## Pages

${otherPages.map(pageLine).join("\n")}

## Case studies

${caseStudyLines.join("\n")}

## For AI agents

- **WebMCP tools** (in browsers that support WebMCP, e.g. Chrome's origin trial): \`list_pages\`, \`describe_page\`, \`open_page\`, \`scroll_to_section\`, \`highlight\`, \`click\`, \`ask_richard\`. Call \`describe_page\` first; it returns ids for \`highlight\` and \`click\`. Actions run visibly on the page.
- **Page structure**: every page has a \`<nav aria-label="Site">\` and a \`<main>\`. Case study sections are \`<h2>\` headings with ids, listed in the side nav.
- **The chatbot**: the chat button in the header opens a chat with Richard. Its "Drive" toggle lets it open pages, point things out and give guided tours.

## Contact

- Email: r575li@uwaterloo.ca
`

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}

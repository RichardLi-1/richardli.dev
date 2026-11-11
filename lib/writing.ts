// Every writing post, newest first. A post's title and year live only here; its text lives in
// content/writing/<slug>.md. app/writing/page.tsx lists these, and app/writing/[slug]/page.tsx
// builds one page per entry.
// To add a post: create content/writing/<slug>.md, then add a line below.
//
// People only: never add these posts to the chatbot (lib/chunks.json, SITE_PAGES in lib/agent.ts,
// lib/system-prompt.ts), the sitemap or llms.txt. Bots are kept out by app/robots.ts, middleware.ts
// and app/writing/layout.tsx.
export type WritingPost = {
  slug: string  // the URL (/writing/<slug>) and the file name (content/writing/<slug>.md)
  title: string
  year: string  // shown on the right of the list row, e.g. "2026"
}

export const WRITING_POSTS: WritingPost[] = [
  { slug: "onselfexpression", title: "On Self Expression", year: "2026" },
]

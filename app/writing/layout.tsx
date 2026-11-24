import type React from "react"
import type { Metadata } from "next"

// Applies to every page under /writing, including future posts, so nothing can be forgotten.
// Pages' own metadata (their titles) merges on top of this; `robots` is inherited.
// 📖 Learn: Next.js metadata merging across layouts
export const metadata: Metadata = {
  // <meta name="robots" content="noindex, nofollow, nocache">: don't list, follow or cache these pages.
  // Most bots never get this far: app/robots.ts disallows /writing and middleware.ts 404s them.
  robots: { index: false, follow: false, nocache: true },
}

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  // data-agent-ignore hides everything here from the site's chatbot and in-browser AI agents
  // (lib/agent-page-map.ts skips it), so they can't read the post's headings or click its links.
  return <div data-agent-ignore>{children}</div>
}

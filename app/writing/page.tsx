import type { Metadata } from "next"
import Link from "next/link"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { StaggeredContent } from "@/components/staggered-content"
import { PageViewTracker } from "@/components/page-view-tracker"
import { WRITING_POSTS } from "@/lib/writing"

// A server component (no "use client"), so it can export metadata itself instead of
// needing a layout.tsx like app/experiments does.
export const metadata: Metadata = {
  title: "Writing",
}

export default function WritingPage() {
  return (
    <AnimatedPage>
      <PageViewTracker />
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/writing" />

        {/* Same top spacing and side gutters as app/experiments. pb-24 on mobile keeps the
            last row clear of the fixed bottom nav pill (there's no footer to do it). */}
        <main className="pt-0 md:pt-10 pb-24 md:pb-10 px-[var(--page-gutter)] md:px-10">
          <StaggeredContent delay={0}>
            {/* margin: 0 auto centers the column; the text inside stays left-aligned */}
            <section style={{ maxWidth: 560, margin: "0 auto" }}>
              {/* The heading's divider runs the full width; the rows below are inset 8px
                  (marginLeft on each li), so their dividers start a little further in. */}
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "var(--text)",
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--border-2)",
                }}
              >
                Writing
              </h1>

              <ul>
                {WRITING_POSTS.map((post) => (
                  <li key={post.slug} style={{ marginLeft: 8 }}>
                    {/* next/link instead of <a>: navigates without a full page reload and
                        prefetches the post when the row scrolls into view. 📖 Learn: next/link */}
                    <Link
                      href={`/writing/${post.slug}`}
                      className="flex items-baseline justify-between gap-4 py-3 border-b border-[var(--border-2)] text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
                      style={{ fontFamily: "'SFCamera', sans-serif", fontSize: 15, textDecoration: "none" }}
                    >
                      <span>{post.title}</span>
                      <span style={{ color: "var(--text-4)" }}>{post.year}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </StaggeredContent>
        </main>
      </div>
    </AnimatedPage>
  )
}

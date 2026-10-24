import { readFile } from "fs/promises"
import path from "path"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm" // adds GitHub-style tables, which BRAND.md uses for every dos/don'ts list
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { StaggeredContent } from "@/components/staggered-content"

export const metadata: Metadata = {
  title: "Brand",
}

// BRAND.md at the repo root is the single source of truth: edit that file and
// this page updates. This is a server component, so the file is read on the
// server at build time and never shipped to the browser as a separate request.
// 📖 Learn: Next.js Server Components reading files with fs
export default async function BrandPage() {
  const markdown = await readFile(path.join(process.cwd(), "BRAND.md"), "utf8")

  return (
    <AnimatedPage>
      <div className="min-h-screen page-bg">
        <AnimatedHeader currentPage="/brand" />

        {/* Same column + spacing as the case study pages (e.g. app/amd/page.tsx) */}
        <main className="max-w-3xl mx-auto py-6 pt-0 md:pt-10 pb-24 px-[var(--page-gutter)]">
          <StaggeredContent delay={0}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // Maps each Markdown element to the site's own styles instead of
              // adding a prose plugin. 📖 Learn: react-markdown `components` prop
              components={{
                h1: ({ children }) => <h1 className="text-4xl font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-14 mb-4" style={{ color: "var(--text)" }}>{children}</h2>,
                h3: ({ children }) => <h3 className="section-label mt-8 mb-3">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed" style={{ color: "var(--text-2)" }}>{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2" style={{ color: "var(--text-2)" }}>{children}</ul>,
                strong: ({ children }) => <strong className="hl">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} className="underline underline-offset-2" style={{ color: "var(--text)" }}>{children}</a>
                ),
                code: ({ children }) => (
                  <code className="text-[0.85em] px-1 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--text)" }}>{children}</code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="pl-4 my-4" style={{ borderLeft: "2px solid var(--border-2)" }}>{children}</blockquote>
                ),
                // overflow-x-auto lets wide tables scroll sideways on phones instead of breaking the layout
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="section-label text-left font-normal py-2 pr-4" style={{ borderBottom: "1px solid var(--border-2)" }}>{children}</th>
                ),
                td: ({ children }) => (
                  <td className="py-2 pr-4 align-top" style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border-2)" }}>{children}</td>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </StaggeredContent>
        </main>
      </div>
    </AnimatedPage>
  )
}

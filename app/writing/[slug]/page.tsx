import { readFile } from "fs/promises"
import path from "path"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { StaggeredContent } from "@/components/staggered-content"
import { PageViewTracker } from "@/components/page-view-tracker"
import { WRITING_POSTS } from "@/lib/writing"

// Every post is built as a static page at build time, one per entry in WRITING_POSTS.
// dynamicParams = false makes any other slug a 404 instead of a lookup at request time,
// so the .md files are only read during the build.
// 📖 Learn: generateStaticParams and dynamicParams (Next.js App Router)
export const dynamicParams = false

export function generateStaticParams() {
  return WRITING_POSTS.map((post) => ({ slug: post.slug }))
}

// In Next.js 15, params arrives as a Promise, so it has to be awaited.
// 📖 Learn: async request APIs in Next.js 15
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = WRITING_POSTS.find((p) => p.slug === slug)
  return { title: post?.title ?? "Writing" }
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params
  const post = WRITING_POSTS.find((p) => p.slug === slug)
  if (!post) notFound()

  // The file name comes from the matched list entry, not straight from the URL, so a
  // crafted URL can't point readFile at some other file on disk.
  // process.cwd() is the project root when Next builds the site.
  const markdown = await readFile(path.join(process.cwd(), "content", "writing", `${post.slug}.md`), "utf8")

  return (
    <AnimatedPage>
      <PageViewTracker />
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/writing" />

        <main className="pt-0 md:pt-10 pb-24 md:pb-10 px-[var(--page-gutter)] md:px-10">
          <StaggeredContent delay={0}>
            {/* margin: 0 auto centers the column; the text inside stays left-aligned */}
            <article style={{ maxWidth: 640, margin: "0 auto" }}>
              {/* hover: beats .section-label's color because a class + :hover is more specific
                  than the class alone. 📖 Learn: CSS specificity */}
              <Link href="/writing" className="section-label transition-colors hover:text-[var(--text)]" style={{ textDecoration: "none" }}>
                ← Writing
              </Link>

              <h1 style={{ fontSize: 24, fontWeight: 400, color: "var(--text)", marginTop: 24 }}>{post.title}</h1>
              <p style={{ fontFamily: "'SFCamera', sans-serif", fontSize: 14, color: "var(--text-4)", marginTop: 4 }}>{post.year}</p>

              {/* react-markdown turns the .md text into plain HTML tags; remark-gfm adds tables,
                  strikethrough and task lists. Both are the same libraries the chatbot uses
                  (components/chat-box.tsx). .writing-body in globals.css styles the output. */}
              <div className="writing-body" style={{ marginTop: 32 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
            </article>
          </StaggeredContent>
        </main>
      </div>
    </AnimatedPage>
  )
}

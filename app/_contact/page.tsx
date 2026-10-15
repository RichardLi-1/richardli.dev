"use client"

// RETIRED (2026-10-14): the contact form is switched off. The folder name
// starts with "_", which Next.js treats as a private folder: the code stays
// here but isn't routed. To bring it back, rename the folder back (drop the
// "_"), remove the /contact redirect in next.config.mjs, and re-add /contact
// to app/sitemap.ts, lib/agent.ts, lib/system-prompt.ts, app/llms.txt and the
// chat's PAGE_META.
// 📖 Learn: Next.js private folders

import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { StaggeredContent } from "@/components/staggered-content"
import { ContactForm } from "@/components/contact-form"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

export default function ContactPage() {
  // <CHANGE> Add Discord webhook tracking
  usePageViewTracker()

  return (
    <AnimatedPage>
      <AnimatedHeader currentPage="/contact" />

      <main className="min-h-screen page-bg">
        <div className="container mx-auto px-[var(--page-gutter)] py-20">
          <StaggeredContent delay={0}>
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-6xl mb-6 text-center">
                Get in Touch
              </h1>
              <p className="text-lg mb-12 text-center" style={{ color: "var(--text-3)" }}>
                Have a project in mind? Let's discuss how we can work together.
              </p>

              <ContactForm />
            </div>
          </StaggeredContent>
        </div>
      </main>
    </AnimatedPage>
  )
}

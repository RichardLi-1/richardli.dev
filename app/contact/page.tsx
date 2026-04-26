"use client"

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
        <div className="container mx-auto px-6 py-20">
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

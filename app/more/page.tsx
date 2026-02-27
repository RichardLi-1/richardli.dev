"use client"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { useWindowsXP } from "@/contexts/windows-xp-context"

export default function MorePage() {
  const { toggleXPMode } = useWindowsXP()

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen flex flex-col">
        <AnimatedHeader currentPage="/more" backHref="/" backText="More" />

        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <p
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: "clamp(2rem, 6vw, 4rem)",
              color: "var(--text)",
              lineHeight: 1.1,
            }}
          >
            soon to come...
          </p>

          <p style={{ color: "var(--text-3)", fontSize: "15px", maxWidth: "360px", lineHeight: 1.6 }}>
            in the meantime,{" "}
            <button
              onClick={toggleXPMode}
              style={{
                color: "var(--text)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "inherit",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              check out Windows XP
            </button>
          </p>
        </main>

        <Footer />
      </div>
    </AnimatedPage>
  )
}

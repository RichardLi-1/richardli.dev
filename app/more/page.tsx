"use client"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"

export default function MorePage() {
  const { togglePersonalizedMode } = useWindowsXP()
  const {isPersonalized} = useWindowsXP()

  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen flex flex-col" style={{ position: "relative" }}>
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
              onClick={togglePersonalizedMode}
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

          {isPersonalized && (
            <>
              <a href="/more/functions"><DraggableSticker src="/images/functions/photo1sticker.png" ix={0.85} iy={0.6} size={120}  /></a>
            </>
          )}
        </main>

        <Footer />
      </div>
    </AnimatedPage>
  )
}

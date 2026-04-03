"use client"
import { useRef } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { useWindowsXP } from "@/contexts/windows-xp-context"
import { DraggableSticker } from "@/components/draggable-sticker"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

export default function MorePage() {
  usePageViewTracker()
  const { togglePersonalizedMode } = useWindowsXP()
  const {isPersonalized} = useWindowsXP()
  const audioRef = useRef<HTMLAudioElement>(null)

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
            {/* Placeholder for audio player 
          <button
            onClick={() => audioRef.current?.play()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: 9999,
              padding: "10px 22px",
              color: "var(--text)",
              fontFamily: "'Toronto Subway', sans-serif",
              fontSize: 13,
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            ▶ Play
          </button>
          <audio ref={audioRef} src="/audio/placeholder.mp3" />*/}

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

        <section
          style={{
            padding: "32px 32px 48px",
            maxWidth: 480,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <p
            style={{
              fontFamily: "'Toronto Subway', sans-serif",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-4)",
              marginBottom: 16,
            }}
          >
            Updates
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "'Toronto Subway', sans-serif",
                  fontSize: 11,
                  color: "var(--text-4)",
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                  paddingTop: 1,
                }}
              >
                prev
              </span>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-3)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                april 2: today is autism acceptance day!
              </p>
            </div>
          </div>
        </section>
      </div>
    </AnimatedPage>
  )
}

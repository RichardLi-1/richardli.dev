"use client"
import Link from "next/link"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"

export default function NotFound() {
  return (
    <AnimatedPage>
      <div className="min-h-screen page-bg flex flex-col">
        <AnimatedHeader currentPage="/404" backHref="/" backText="Home" />

        <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          {/* Ambient orb */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{
              position: "absolute",
              width: 500, height: 500,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(232,228,220,0.04) 0%, transparent 65%)",
              borderRadius: "50%",
            }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(72px, 20vw, 160px)",
                lineHeight: 1,
                color: "var(--text-5)",
                letterSpacing: "-0.02em",
                marginBottom: 0,
              }}
            >
              404
            </h1>
            <p
              style={{
                fontFamily: "'SFCamera', sans-serif",
                fontSize: "clamp(18px, 4vw, 28px)",
                color: "var(--text-2)",
                marginTop: 12,
                marginBottom: 32,
                lineHeight: 1.3,
              }}
            >
              this stop doesn't exist
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 22px",
                  borderRadius: 9999,
                  background: "var(--text)",
                  color: "var(--bg)",
                  fontFamily: "'Toronto Subway', sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Go Home
              </Link>
              <Link
                href="/projects"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: 9999,
                  background: "transparent",
                  color: "var(--text-2)",
                  fontFamily: "'Toronto Subway', sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  border: "1px solid var(--border-2)",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text-4)" }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border-2)" }}
              >
                See my work
              </Link>
            </div>
          </div>
        </main>

      </div>
    </AnimatedPage>
  )
}

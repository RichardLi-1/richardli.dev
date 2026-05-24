"use client"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { mainProjects } from "@/components/mainProjects"

export function RelatedProjects({ currentId }: { currentId: string }) {
  const router = useRouter()

  const next = useMemo(() => {
    // Visible projects, in the order they're declared in mainProjects.ts.
    // Sequential walk: find the current project's position, return the next one,
    // wrapping back to index 0 after the last project.
    // 📖 Learn: the `%` (modulo) operator gives the remainder — pairing it with
    // `length` is the standard JS idiom for wrap-around indexing.
    const visible = mainProjects.filter(p => !(p as any).hidden)
    const currentIdx = visible.findIndex(p => p.id === currentId)
    // If currentId isn't in the visible list (e.g. it's hidden), fall back to the
    // first project so the button never disappears unexpectedly.
    if (currentIdx === -1) return visible[0]
    return visible[(currentIdx + 1) % visible.length]
  }, [currentId])

  if (!next) return null

  // Detect video sources so we render <video> for .mov/.mp4 and <img> for stills.
  // 📖 Learn: HTMLVideoElement autoplay requires `muted` + `playsInline` on iOS Safari.
  const thumbSrc = next.image
  const isVideo = thumbSrc.endsWith(".mp4") || thumbSrc.endsWith(".mov")

  return (
    <div style={{ marginTop: 48 }}>
      <button
        onClick={() => router.push(`/${next.id}`)}
        aria-label={`Go to ${next.title}`}
        style={{
          background: "var(--surface)",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          // Asymmetric padding: more on the left (where text sits) than the right
          // (where the thumbnail sits flush-ish inside the pill).
          padding: "6px 6px 6px 6px",
          borderRadius: 16,
          cornerShape: "squircle",
          height: 60,
        } as React.CSSProperties}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--surface-hover)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "var(--surface)"
        }}
      >
        {/* Arrow circle */}
        <span style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--surface-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="var(--text-3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {/* Label */}
        <span style={{
          fontFamily: "'Toronto Subway', sans-serif",
          fontSize: 13,
          color: "var(--text-3)",
          letterSpacing: "0.02em",
          paddingRight: 4,
        }}>
          next case study
        </span>

        {/* Thumbnail nested on the right inside the same pill */}
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            cornerShape: "squircle",
            overflow: "hidden",
            background: "var(--surface-hover)",
            flexShrink: 0,
            display: "block",
          } as React.CSSProperties}
        >
          {isVideo ? (
            <video
              src={thumbSrc}
              muted
              autoPlay
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt={next.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
        </span>
      </button>
    </div>
  )
}

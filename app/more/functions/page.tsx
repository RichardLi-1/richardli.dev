"use client"
import { useState, useEffect, useRef } from "react"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { useInView } from "@/hooks/use-in-view"

// ── Shared photo renderer ─────────────────────────────────────────────────────

function PhotoImage({
  src,
  realSrc,
  rotation,
  width,
  visible,
  style = {},
}: {
  src: string
  realSrc?: string
  rotation: number
  width: number
  visible: boolean
  style?: React.CSSProperties
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      onClick={() => realSrc && setFlipped((f) => !f)}
      style={{
        width,
        cursor: realSrc ? "pointer" : "default",
        position: "relative",
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transform: visible
          ? `scale(1) rotate(${rotation}deg)`
          : `scale(0.78) rotate(${rotation}deg)`,
        transition: "opacity 0.55s ease-out, transform 0.55s ease-out",
        ...style,
      }}
    >
      <img
        src={`/images/functions/${src}`}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          borderRadius: 10,
          boxShadow: "0 4px 28px rgba(0,0,0,0.24)",
          display: "block",
          position: "relative",
          opacity: flipped ? 0 : 1,
          transition: "opacity 0.35s ease",
          zIndex: 2,
        }}
      />
      {realSrc && (
        <img
          src={`/images/functions/${realSrc}`}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            borderRadius: 10,
            boxShadow: "0 4px 28px rgba(0,0,0,0.24)",
            display: "block",
            position: "absolute",
            inset: 0,
            opacity: flipped ? 1 : 0,
            transition: "opacity 0.35s ease",
            zIndex: 1,
            objectFit: "cover",
          }}
        />
      )}
    </div>
  )
}

// ── Sticky scene ─────────────────────────────────────────────────────────────
// Tall container (300vh). Inner content is position:sticky top:0, height:100vh.
// Scroll progress drives which photos are visible.

function StickyScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handle = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, -rect.top / scrollable)))
    }
    window.addEventListener("scroll", handle, { passive: true })
    handle()
    return () => window.removeEventListener("scroll", handle)
  }, [])

  const show1 = progress >= 0.25
  const show2 = progress >= 0.55
  const show3 = progress >= 0.82

  return (
    // tall scroll container
    <div ref={containerRef} style={{ height: "300vh" }}>
      {/* viewport-sized sticky frame */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* scene: quote + photos absolutely placed around it */}
        <div style={{ position: "relative", textAlign: "center", padding: "0 40px", maxWidth: 900, width: "100%" }}>

          {/* Quote text */}
          <p
            style={{
              fontFamily: "'SFCamera', sans-serif",
              fontSize: "clamp(2.2rem, 6vw, 5.5rem)",
              lineHeight: 1.1,
              color: "var(--text)",
              margin: 0,
              position: "relative",
              zIndex: 0,
            }}
          >
            "Function this Friday"
          </p>

          {/* Photo 1 — top-left */}
          <div style={{ position: "absolute", top: "-170px", left: "-60px", zIndex: 2 }}>
            <PhotoImage
              src="photo1sticker.png"
              realSrc="photo1.JPG"
              rotation={-8}
              width={200}
              visible={show1}
              style={{ transitionDelay: "0ms" }}
            />
          </div>

          {/* Photo 2 — top-right */}
          <div style={{ position: "absolute", top: "-120px", right: "-80px", zIndex: 2 }}>
            <PhotoImage
              src="IMG_3330.JPG"
              rotation={10}
              width={190}
              visible={show2}
              style={{ transitionDelay: "60ms" }}
            />
          </div>

          {/* Photo 3 — bottom-center */}
          <div style={{ position: "absolute", bottom: "-150px", left: "50%", transform: `translateX(-50%) rotate(-4deg)`, zIndex: 2,
            opacity: show3 ? 1 : 0,
            transition: "opacity 0.55s ease-out 120ms",
          }}>
            <PhotoImage
              src="photo3sticker.png"
              rotation={0}
              width={170}
              visible={show3}
              style={{ transform: "none" }} // rotation handled by parent
            />
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Scatter photo (collage section, IntersectionObserver) ────────────────────

interface ScatterProps {
  src: string
  realSrc?: string
  x: string
  y: string
  rotation: number
  size: number
  delay?: number
}

function ScatterPhoto({ src, realSrc, x, y, rotation, size, delay = 0 }: ScatterProps) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} style={{ position: "absolute", left: x, top: y, zIndex: 1 }}>
      <PhotoImage
        src={src}
        realSrc={realSrc}
        rotation={rotation}
        width={size}
        visible={inView}
        style={{ transitionDelay: `${delay}ms` }}
      />
    </div>
  )
}

// ── Closing quote ─────────────────────────────────────────────────────────────

function ClosingQuote() {
  const { ref, inView } = useInView(0.2)
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 1s ease-out, transform 1s ease-out",
        textAlign: "center",
        padding: "100px 24px 80px",
      }}
    >
      <p
        style={{
          fontFamily: "'SFCamera', sans-serif",
          fontSize: "clamp(1.4rem, 3.5vw, 2.6rem)",
          lineHeight: 1.3,
          color: "var(--text)",
          margin: 0,
          maxWidth: 560,
          marginInline: "auto",
        }}
      >
        In my opinion, you need time in life to let loose
      </p>
    </div>
  )
}

// ── Collage data ──────────────────────────────────────────────────────────────

const collageItems: ScatterProps[] = [
  { src: "photo2sticker.png", realSrc: "photo2.JPG", x: "4%",  y: "0px",   rotation: -6,  size: 220, delay: 0  },
  { src: "IMG_3326.JPG",                              x: "54%", y: "20px",  rotation:  7,  size: 220, delay: 40 },
  { src: "photo4sticker.png",                         x: "30%", y: "220px", rotation: -3,  size: 165, delay: 80 },
  { src: "photo5sticker.png", realSrc: "photo5.JPG",  x: "6%",  y: "380px", rotation: -4,  size: 240, delay: 0  },
  { src: "IMG_5442.jpg",                              x: "62%", y: "340px", rotation: -7,  size: 200, delay: 60 },
  { src: "photo6sticker.png", realSrc: "photo6.JPG",  x: "14%", y: "600px", rotation:  5,  size: 250, delay: 0  },
  { src: "photo7sticker.png", realSrc: "photo7.JPG",  x: "3%",  y: "820px", rotation:  8,  size: 230, delay: 0  },
  { src: "photo8sticker.png", realSrc: "photo8.JPG",  x: "46%", y: "780px", rotation: -3,  size: 260, delay: 40 },
  { src: "IMG_3731.JPG",                              x: "68%", y: "580px", rotation: 11,  size: 190, delay: 80 },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FunctionsPage() {
  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen">
        <AnimatedHeader currentPage="/more/functions" backHref="/more" backText="Functions" />

        {/* ── Hero ── */}
        <section style={{ padding: "80px 40px 120px" }}>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 1, marginBottom: 12 }}>
            Functions
          </h1>
          <p style={{ fontFamily: "'Toronto Subway', sans-serif", fontSize: "clamp(0.9rem, 2vw, 1.1rem)", color: "var(--text-3)", letterSpacing: "0.05em" }}>
            Welcome in!
          </p>
        </section>

        {/* ── Scroll-pinned "Function this Friday" scene ── */}
        <StickyScene />

        {/* ── Collage ── */}
        <section style={{ padding: "60px 40px 160px" }}>
          {/* Desktop */}
          <div className="hidden md:block" style={{ position: "relative", minHeight: 1200 }}>
            {collageItems.map((item, i) => (
              <ScatterPhoto key={i} {...item} />
            ))}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden flex-wrap gap-5 justify-center">
            {collageItems.map((item, i) => (
              <PhotoImage
                key={i}
                src={item.src}
                realSrc={item.realSrc}
                rotation={item.rotation}
                width={Math.min(item.size, 150)}
                visible={true}
              />
            ))}
          </div>
        </section>

        <ClosingQuote />
        <Footer />
      </div>
    </AnimatedPage>
  )
}

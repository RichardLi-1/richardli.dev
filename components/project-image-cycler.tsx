"use client"
import { useState, useEffect } from "react"

interface ProjectImageCyclerProps {
  images: (string | undefined)[]
  alt: string
  className?: string
}

export function ProjectImageCycler({ images, alt, className = "" }: ProjectImageCyclerProps) {
  const validImages = images.filter((img): img is string => !!img)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (validImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % validImages.length)
    }, 2000) // Cycle every 2 seconds

    return () => clearInterval(interval)
  }, [validImages.length])

  const current = validImages.length > 0 ? validImages[currentImageIndex] : null

  // Reset loaded state when the source changes
  useEffect(() => {
    setLoaded(false)
  }, [current])

  if (!current) {
    return <img src="/placeholder.svg" alt={alt} className={className} />
  }

  const isVideo = current.endsWith(".mp4") || current.endsWith(".mov")

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Skeleton shimmer */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "var(--surface)",
        opacity: loaded ? 0 : 1,
        transition: "opacity 0.3s ease",
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        <div className="skeleton-shimmer" />
      </div>

      {/* Media */}
      {isVideo ? (
        <video
          key={current}
          src={current}
          autoPlay
          loop
          muted
          playsInline
          className={className}
          onLoadedData={() => setLoaded(true)}
          style={{ objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        />
      ) : (
        <img
          key={current}
          src={current}
          alt={alt}
          className={className}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--surface-hover), transparent);
          animation: shimmer 1.4s infinite;
        }
      `}</style>
    </div>
  )
}

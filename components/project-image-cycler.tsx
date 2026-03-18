"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface ProjectImageCyclerProps {
  images: (string | undefined)[]
  alt: string
  className?: string
}

export function ProjectImageCycler({ images, alt, className = "" }: ProjectImageCyclerProps) {
  const validImages = images.filter((img): img is string => !!img)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement>(null)

  useEffect(() => {
    if (validImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % validImages.length)
    }, 2000) // Cycle every 2 seconds

    return () => clearInterval(interval)
  }, [validImages.length])

  const current = validImages.length > 0 ? validImages[currentImageIndex] : null

  // Reset loaded state when source changes; immediately resolve if already cached
  useEffect(() => {
    setLoaded(false)
    const el = mediaRef.current
    if (!el) return
    if (el instanceof HTMLImageElement && el.complete) setLoaded(true)
    if (el instanceof HTMLVideoElement && el.readyState >= 2) setLoaded(true)
  }, [current])

  if (!current) {
    return <Image src="/placeholder.svg" alt={alt} className={className} fill sizes="100vw" />
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
          ref={mediaRef}
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
          ref={mediaRef}
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

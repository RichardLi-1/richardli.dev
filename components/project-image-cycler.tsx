"use client"
import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface ProjectImageCyclerProps {
  images: (string | undefined)[]
  alt: string
  className?: string
}

export function ProjectImageCycler({ images, alt, className = "" }: ProjectImageCyclerProps) {
  // Filter out undefined/null entries. The type predicate `img is string` narrows
  // the array type from (string | undefined)[] to string[] after this call.
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

  // When the displayed media source changes, hide it (setLoaded(false)) to show
  // the skeleton shimmer again. But if the browser already has it cached
  // (el.complete / readyState >= 2), skip the shimmer and show it immediately.
  // readyState >= 2 means the video has enough data to play (HAVE_CURRENT_DATA).
  // 📖 Learn: HTMLMediaElement.readyState — https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
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
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", cornerShape: "squircle" } as React.CSSProperties}>
      {/* Skeleton shimmer: visible while the image/video is loading, then fades out.
          pointerEvents: "none" so it doesn't block hover/click on the media below. */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "var(--surface)",
        opacity: loaded || isVideo ? 0 : 1,
        transition: "opacity 0.3s ease",
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        <div className="skeleton-shimmer" />
      </div>

      {/* `key={current}` forces React to unmount and remount the element when the
          source changes, which resets the video playback to the beginning. */}
      {isVideo ? (
        <video
          ref={mediaRef}
          key={current}
          src={current}
          poster={`/images/thumbnails/${current.split("/").pop()!.replace(/\.[^.]+$/, "")}.jpg`}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          className={className}
          onLoadedData={() => setLoaded(true)}
          style={{ objectFit: "cover", opacity: 1, transition: "opacity 0.3s ease" }}
        >
          {/* Required for accessibility (Lighthouse) — muted demo videos have no spoken content,
              so the track is empty. `default` makes it active without user interaction. */}
          <track kind="captions" srcLang="en" label="No captions" default />
        </video>
      ) : (
        <img
          ref={mediaRef}
          key={current}
          src={current}
          alt={alt}
          loading="lazy"
          decoding="async"
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

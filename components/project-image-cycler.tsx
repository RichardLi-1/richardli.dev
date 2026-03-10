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

  useEffect(() => {
    if (validImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % validImages.length)
    }, 2000) // Cycle every 2 seconds

    return () => clearInterval(interval)
  }, [validImages.length])

  if (validImages.length === 0) {
    return <img src="/placeholder.svg" alt={alt} className={className} />
  }

  const current = validImages[currentImageIndex] || "/placeholder.svg"

  if (current.endsWith(".mp4") || current.endsWith(".mov")) {
    return (
      <video
        src={current}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        style={{ objectFit: "cover" }}
      />
    )
  }

  return <img src={current} alt={alt} className={className} />
}

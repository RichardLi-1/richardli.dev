"use client"
import { useRef, useState, useEffect } from "react"
import { useWindowsXP } from "@/contexts/windows-xp-context"

function DraggableSticker({ src, ix, iy, size = 120 }: {
  src: string; ix: number; iy: number; size?: number
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const offset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const x = window.innerWidth * ix
    const y = window.innerHeight * iy
    pos.current = { x, y }
    if (imgRef.current) {
      imgRef.current.style.left = `${x}px`
      imgRef.current.style.top = `${y}px`
    }
    setMounted(true)
  }, [ix, iy])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !imgRef.current) return
      const x = e.clientX - offset.current.x
      const y = e.clientY - offset.current.y
      pos.current = { x, y }
      imgRef.current.style.left = `${x}px`
      imgRef.current.style.top = `${y}px`
    }
    const onUp = () => {
      if (!dragging.current || !imgRef.current) return
      dragging.current = false
      imgRef.current.style.cursor = "grab"
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || !imgRef.current) return
      e.preventDefault()
      const t = e.touches[0]
      const x = t.clientX - offset.current.x
      const y = t.clientY - offset.current.y
      pos.current = { x, y }
      imgRef.current.style.left = `${x}px`
      imgRef.current.style.top = `${y}px`
    }
    const onTouchEnd = () => { dragging.current = false }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    document.addEventListener("touchmove", onTouchMove, { passive: false })
    document.addEventListener("touchend", onTouchEnd)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  if (!mounted) return null

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      draggable={false}
      onMouseDown={(e) => {
        e.preventDefault()
        offset.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y }
        dragging.current = true
        if (imgRef.current) imgRef.current.style.cursor = "grabbing"
      }}
      onTouchStart={(e) => {
        const t = e.touches[0]
        offset.current = { x: t.clientX - pos.current.x, y: t.clientY - pos.current.y }
        dragging.current = true
      }}
      style={{
        position: "fixed",
        left: pos.current.x,
        top: pos.current.y,
        width: size,
        cursor: "grab",
        userSelect: "none",
        zIndex: 40,
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
        pointerEvents: "auto",
      }}
    />
  )
}

export function GlobalStickers() {
  const { isPersonalized } = useWindowsXP()
  if (!isPersonalized) return null

  return (
    <>
      <DraggableSticker src="/images/clippynew.png"                                          ix={0.88} iy={0.65} size={110} />
      <DraggableSticker src="/images/design-mode/pngtree-goose-flat-icon-png-image_9148185.png" ix={0.04} iy={0.70} size={90}  />
      <DraggableSticker src="/images/functions/photo1sticker.png"                            ix={0.90} iy={0.20} size={100} />
    </>
  )
}

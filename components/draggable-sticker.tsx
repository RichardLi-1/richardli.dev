"use client"
import { useRef, useState, useEffect, useCallback } from "react"

export function DraggableSticker({ src, ix, iy, size = 120 }: {
  src: string
  ix: number
  iy: number
  size?: number
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const fraction = useRef({ x: ix, y: iy })
  const offset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const hasDragged = useRef(false)
  const [ready, setReady] = useState(false)

  const applyPosition = useCallback(() => {
    if (!imgRef.current) return
    const x = window.innerWidth * fraction.current.x
    const y = window.innerHeight * fraction.current.y
    imgRef.current.style.left = `${x}px`
    imgRef.current.style.top = `${y}px`
    setReady(true)
  }, [])

  useEffect(() => {
    fraction.current = { x: ix, y: iy }
    applyPosition()
    window.addEventListener("resize", applyPosition)
    return () => window.removeEventListener("resize", applyPosition)
  }, [ix, iy, applyPosition])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !imgRef.current) return
      hasDragged.current = true
      const x = e.clientX - offset.current.x
      const y = e.clientY - offset.current.y
      fraction.current = { x: x / window.innerWidth, y: y / window.innerHeight }
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
      fraction.current = { x: x / window.innerWidth, y: y / window.innerHeight }
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

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      draggable={false}
      onMouseDown={(e) => {
        e.preventDefault()
        const x = window.innerWidth * fraction.current.x
        const y = window.innerHeight * fraction.current.y
        offset.current = { x: e.clientX - x, y: e.clientY - y }
        dragging.current = true
        hasDragged.current = false
        if (imgRef.current) imgRef.current.style.cursor = "grabbing"
      }}
      onClick={(e) => {
        if (hasDragged.current) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      onTouchStart={(e) => {
        const t = e.touches[0]
        const x = window.innerWidth * fraction.current.x
        const y = window.innerHeight * fraction.current.y
        offset.current = { x: t.clientX - x, y: t.clientY - y }
        dragging.current = true
      }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        cursor: "grab",
        userSelect: "none",
        zIndex: 40,
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
        visibility: ready ? "visible" : "hidden",
      }}
    />
  )
}

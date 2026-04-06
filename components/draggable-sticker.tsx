"use client"
import { useRef, useState, useEffect, useCallback } from "react"

export function DraggableSticker({ src, ix, iy, size = 120, delay = 0 }: {
  src: string
  ix: number
  iy: number
  size?: number
  delay?: number
}) {
  // All drag state is stored in refs, not useState — updating a ref doesn't
  // trigger a re-render, which is important here because drag events fire
  // hundreds of times per second and re-rendering that often would cause jank.
  // 📖 Learn: refs vs state for mutable values — https://react.dev/learn/referencing-values-with-refs
  const imgRef = useRef<HTMLImageElement>(null)
  // `fraction` stores position as a 0–1 fraction of viewport size so the sticker
  // repositions correctly when the window is resized.
  const fraction = useRef({ x: ix, y: iy })
  // `offset` is the distance from the pointer's initial click to the sticker's
  // top-left corner — keeps the sticker from jumping on mousedown.
  const offset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  // hasDragged distinguishes a "drag release" from a genuine "click" so we can
  // suppress the onClick event after a drag.
  const hasDragged = useRef(false)
  const [ready, setReady] = useState(false)
  const [popped, setPopped] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPopped(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  // Convert the 0–1 fraction back to pixel coordinates and apply directly to
  // the DOM node (bypassing React state) for instant, jank-free repositioning.
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
      // preventDefault stops the page from scrolling while dragging a sticker on touch.
      // This only works because the listener was registered with { passive: false } below.
      e.preventDefault()
      const t = e.touches[0]
      const x = t.clientX - offset.current.x
      const y = t.clientY - offset.current.y
      fraction.current = { x: x / window.innerWidth, y: y / window.innerHeight }
      imgRef.current.style.left = `${x}px`
      imgRef.current.style.top = `${y}px`
    }
    const onTouchEnd = () => { dragging.current = false }
    // Mouse events go on `document` (not the img) so dragging outside the image
    // boundary still works. `{ passive: false }` on touchmove is required to be
    // allowed to call e.preventDefault() inside the handler.
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
        // Initial left/top are overridden by applyPosition immediately after mount.
        // They're set to 0 here just as a placeholder.
        left: 0,
        top: 0,
        width: size,
        cursor: "grab",
        userSelect: "none",
        zIndex: 40,
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
        // Using `visibility` instead of `display: none` preserves layout space and
        // avoids a flash at position (0,0) before applyPosition has run.
        visibility: ready && popped ? "visible" : "hidden",
        // cubic-bezier(0.34,1.56,0.64,1) is a spring-style easing with overshoot —
        // gives the sticker a playful "bounce in" feel.
        animation: popped ? "stickerPop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
      }}
    />
  )
}

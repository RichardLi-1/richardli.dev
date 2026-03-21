"use client"
import { useEffect, useState } from "react"

export function SwissGrid() {
  const [showColumns, setShowColumns] = useState(false)
  const [showRows, setShowRows] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "g" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        setShowColumns((v) => !v)
      }
      if (e.key === "G" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault()
        setShowRows((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  if (!showColumns && !showRows) return null

  const columns = 12
  const baseline = 8
  const rowHeight = 64 // px per horizontal band

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {/* Vertical column grid */}
      {showColumns && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            columnGap: "1rem",
            padding: "0 2.5rem",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 0, 80, 0.08)",
                borderLeft: "1px solid rgba(255, 0, 80, 0.25)",
                borderRight: "1px solid rgba(255, 0, 80, 0.25)",
              }}
            />
          ))}
        </div>
      )}

      {/* Horizontal row grid */}
      {showRows && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              rgba(0, 180, 255, 0.06) 0px,
              rgba(0, 180, 255, 0.06) ${rowHeight - 1}px,
              rgba(0, 180, 255, 0.35) ${rowHeight - 1}px,
              rgba(0, 180, 255, 0.35) ${rowHeight}px
            )`,
          }}
        />
      )}

      {/* Baseline grid */}
      {showColumns && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent ${baseline - 1}px,
              rgba(0, 120, 255, 0.12) ${baseline - 1}px,
              rgba(0, 120, 255, 0.12) ${baseline}px
            )`,
          }}
        />
      )}

      {/* Label */}
      <div
        style={{
          position: "fixed",
          bottom: 12,
          right: 16,
          fontSize: 10,
          fontFamily: "monospace",
          color: "rgba(255, 0, 80, 0.6)",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
      >
        {showColumns && `⌘G ${columns}COL / ${baseline}PX BASE`}
        {showColumns && showRows && "  ·  "}
        {showRows && `⌘⇧G ${rowHeight}PX ROWS`}
      </div>
    </div>
  )
}

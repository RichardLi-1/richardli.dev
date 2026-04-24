"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface Props {
  labels: string[]
  children: React.ReactNode
}

export function CollapsibleDetails({ labels, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full mb-3 group"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-300 shrink-0"
          style={{
            color: "var(--text-3)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
        <span className="section-label">{labels.join(" · ")}</span>
      </button>

      {/* CSS grid-template-rows trick: animates from 0fr→1fr with no height-jump */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

import type React from "react"
import type { Metadata } from "next"
import "../fanning/photography.css"

export const metadata: Metadata = {
  title: "Transit Photography",
}

export default function FanningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

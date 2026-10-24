import type React from "react"
import type { Metadata } from "next"

// page.tsx is a client component ("use client"), which can't export metadata,
// so the tab title lives in this server layout instead.
export const metadata: Metadata = {
  title: "Experiments",
}

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from "next"

// Experimental layout of the /transitplanner case study. noindex keeps search
// engines from treating it as a duplicate of the main /transitplanner page.
export const metadata: Metadata = {
  title: "Transit Planner Case Study",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

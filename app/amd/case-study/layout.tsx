import type { Metadata } from "next"

// Experimental layout of the /amd case study. noindex keeps search engines
// from treating it as a duplicate of the main /amd page.
export const metadata: Metadata = {
  title: "AMD Case Study",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

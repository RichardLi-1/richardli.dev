import type { Metadata } from "next"

// The XP page is nearly retired: keep it out of search results.
// 📖 Learn: Next.js metadata robots (noindex)
export const metadata: Metadata = {
  title: "Windows XP",
  robots: { index: false, follow: false },
}

export default function XPLayout({ children }: { children: React.ReactNode }) {
  return children
}

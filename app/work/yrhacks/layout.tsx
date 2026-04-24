import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "YRHacks",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

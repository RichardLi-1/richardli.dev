import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TO Transit",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

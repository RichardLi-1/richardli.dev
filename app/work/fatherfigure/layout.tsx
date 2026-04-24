import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Father Figure",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

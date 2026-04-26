"use client"
import { AnimatedHeader } from "@/components/animated-header"

interface ResponsiveHeaderProps {
  isHomepage?: boolean
  currentPage?: string
  rightLinks?: Array<{
    href: string
    text: string
    external?: boolean
  }>
}

export function ResponsiveHeader({
  isHomepage = false,
  currentPage = "",
  rightLinks = [],
}: ResponsiveHeaderProps) {
  return (
    <AnimatedHeader
      isHomepage={isHomepage}
      currentPage={currentPage}
      rightLinks={rightLinks}
    />
  )
}

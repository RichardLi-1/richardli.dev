"use client"

import type { AnchorHTMLAttributes, MouseEvent } from "react"
import { trackCaseStudyLinkClick } from "@/lib/track"

type TrackedExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  projectId: string
  linkLabel: string
  location?: string
}

export function TrackedExternalLink({
  projectId,
  linkLabel,
  location = "case-study",
  href,
  onClick,
  children,
  ...rest
}: TrackedExternalLinkProps) {
  const hrefString = typeof href === "string" ? href : ""

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // # 📖 Learn: wrapper components (compose behavior + preserve native props)
    // Track first, then run caller's custom click handler if one exists.
    trackCaseStudyLinkClick({
      projectId,
      linkLabel,
      href: hrefString,
      location,
    })
    onClick?.(event)
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

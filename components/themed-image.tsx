"use client"
import { CaseStudyImage } from "@/components/case-study-image"
import { cn } from "@/lib/utils"

type ThemedImageProps = {
  light: string // shown in light mode
  dark: string // shown in dark mode
  alt: string
  width?: number
  height?: number
  className?: string
}

/**
 * A screenshot with a light-mode and a dark-mode version; the one matching the site theme shows.
 * Both are in the HTML, and Tailwind's `dark:` classes hide one with display:none. A lazy image
 * inside display:none is never downloaded, so a visitor only fetches the version they see.
 * 📖 Learn: Tailwind dark mode (darkMode: "class"), native lazy loading
 */
export function ThemedImage({ light, dark, alt, width = 1600, height = 1000, className }: ThemedImageProps) {
  return (
    <>
      <CaseStudyImage
        src={light}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("w-full h-auto dark:hidden", className)}
      />
      <CaseStudyImage
        src={dark}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("hidden w-full h-auto dark:block", className)}
      />
    </>
  )
}

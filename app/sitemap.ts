import type { MetadataRoute } from "next"
import { mainProjects } from "@/components/mainProjects"

// Dynamically builds the sitemap from mainProjects so it never drifts out of
// sync. Previously this was a hand-maintained list that included routes for
// commented-out projects (/4sight, /classprofile) and missed pages like /about.
// 📖 Learn: Next.js sitemap.ts — https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://richardli.dev"

  // Core pages — things every crawler (human or AI) should find
  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/chat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/transit/photography`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/transit/hypo-maps`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  // Project pages — only include non-hidden projects so crawlers don't hit
  // pages you've intentionally taken offline
  const projectPages: MetadataRoute.Sitemap = mainProjects
    .filter((p) => !p.hidden)
    .map((p) => ({
      url: `${baseUrl}/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))

  return [...corePages, ...projectPages]
}

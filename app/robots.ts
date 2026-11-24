import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /writing is private. This only asks politely; middleware.ts blocks
        // bots that ignore it.
        disallow: ["/api/", "/admin/", "/writing"],
      },
    ],
    sitemap: "https://richardli.dev/sitemap.xml",
  }
}

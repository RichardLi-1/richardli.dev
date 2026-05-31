/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
 
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Old portfolio URLs used /work and /work/[slug]; keep those bookmarks working.
  async redirects() {
    return [
      { source: "/work", destination: "/", permanent: true },
      { source: "/work/:slug", destination: "/:slug", permanent: true },
    ]
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ]
  },

  skipTrailingSlashRedirect: true,
}

export default nextConfig
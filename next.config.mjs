/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
}

export default nextConfig
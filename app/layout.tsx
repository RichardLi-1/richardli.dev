import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LayoutClient } from "./layout-content"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  metadataBase: new URL("https://richardli.dev"),
  title: {
    default: "Richard Li",
    template: "%s | Richard Li",
  },
  description:
    "Richard Li is a Full Stack Developer and Systems Design Engineering student at the University of Waterloo. Experienced in React, Next.js, Swift, TypeScript, and AI integration. View my portfolio, projects, and interactive resume.",
  keywords: [
    "Richard Li",
    "Richard Li developer",
    "Richard Li Waterloo",
    "Richard Li portfolio",
    "Richard Li full stack developer",
    "Richard Li Systems Design Engineering",
    "Richard Li UWaterloo",
    "Richard Li React",
    "Richard Li Next.js",
    "Richard Li Swift",
    "Richard Li iOS developer",
    "Richard Li SalesPatriot",
    "Richard Li YRHacks",
    "Richard Li Future Forward",
    "Richard Li Career Education Council",
    "r575li@uwaterloo.ca",
    "richardli.dev",
    "full stack developer",
    "systems design engineering",
    "University of Waterloo",
    "iOS app developer",
    "React developer",
    "TypeScript developer",
  ],
  authors: [{ name: "Richard Li", url: "https://richardli.dev" }],
  creator: "Richard Li",
  publisher: "Richard Li",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://richardli.dev",
    siteName: "Richard Li - Portfolio",
    title: "Richard Li - Full Stack Developer & Systems Design Engineering Student",
    description:
      "Explore Richard Li's portfolio featuring full-stack development projects, iOS apps, and AI integrations. Currently studying Systems Design Engineering at the University of Waterloo.",
    images: [
      {
        url: "/images/website-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Richard Li's Portfolio - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Richard Li - Full Stack Developer",
    description:
      "Full Stack Developer & Systems Design Engineering student at UWaterloo. Specializing in React, Next.js, Swift, and AI integration.",
    images: ["/images/website-thumbnail.png"],
    creator: "@richardli",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    other: {
      rel: "shortcut icon",
      url: "/favicon.ico",
    },
  },
  verification: {
    google: "google-site-verification-code", // User should replace with actual verification code
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Toronto-Subway-W01-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SFCamera-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: 'history.scrollRestoration = "manual"' }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Richard Li",
              url: "https://richardli.dev",
              image: "https://richardli.dev/images/website-thumbnail.png",
              sameAs: ["https://linkedin.com/in/richardli0", "https://github.com/richardli-1"],
              jobTitle: "Full Stack Developer",
              worksFor: {
                "@type": "Organization",
                name: "SaFuture Inc.",
              },
              alumniOf: {
                "@type": "EducationalOrganization",
                name: "University of Waterloo",
                department: "Systems Design Engineering",
              },
              email: "r575li@uwaterloo.ca",
              description:
                "Full Stack Developer and Systems Design Engineering student at the University of Waterloo, specializing in React, Next.js, Swift, TypeScript, and AI integration.",
              knowsAbout: [
                "Full Stack Development",
                "React",
                "Next.js",
                "TypeScript",
                "Swift",
                "iOS Development",
                "Python",
                "Java",
                "C++",
                "AI Integration",
                "OpenAI API",
                "UI/UX Design",
                "Systems Design Engineering",
              ],
            }),
          }}
        />
      </head>
      <body className={inter.variable}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LayoutClient } from "./layout-content"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Richard Li</title>
      </head>
      <body>{children}</body>
    </html>
  )
}

export const metadata: Metadata = {
  title: "Richard Li",
  description: "Personal website and chatbot for Richard Li",
  openGraph: {
    title: "Richard Li",
    description: "Personal website and chatbot for Richard Li",
    images: [
      {
        url: "/images/website-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Richard Li's Windows XP-style personal website",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Richard Li",
    description: "Personal website and chatbot for Richard Li",
    images: ["/images/website-thumbnail.png"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LayoutClient } from "./layout-content"

const inter = Inter({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "Richard Li",
  description: "Personal website and chatbot for Richard Li",
  openGraph: {
    title: "Richard Li",
    description: "Personal website and chatbot for Richard Li",
	icons: {
		icon: "/images/favicon.svg",       // path to your favicon in /public
		apple: "/images/favicon.svg",      // optional: for Apple devices
		other: {
			rel: "shortcut icon",
			url: "/images/favicon.ico",
		},
  	},
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

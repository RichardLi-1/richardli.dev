"use client"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

// usePageViewTracker is a hook, and hooks only run in client components. Server components
// (like app/writing, which reads files from disk) render this instead: it shows nothing and
// just calls the hook. 📖 Learn: Server vs Client Components in the Next.js App Router
export function PageViewTracker() {
  usePageViewTracker()
  return null
}

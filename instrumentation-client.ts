import posthog from "posthog-js"
import { whenIdle } from "@/lib/when-idle"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  // Session replay starts a few seconds in (below), not during page load. Its
  // recorder copies the whole page and watches every change, which made the
  // first scroll choppy. Pageviews and events still count from the start.
  disable_session_recording: true,
})

// Once the page has loaded and gone quiet. With no arguments this still
// respects the project's sampling and flag settings for replays.
whenIdle(() => posthog.startSessionRecording(), { delay: 3000 })

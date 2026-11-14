import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"
import { reportAiFetch } from "@/lib/ai-fetch-reporter"
import { isBotUserAgent } from "@/lib/ai-assistants"

// Runs before every page request (see `matcher` below). It has two jobs:
//   1. Spot AI assistants that fetch pages themselves; see lib/ai-fetch-reporter.ts.
//   2. Keep bots out of /writing, which is for people only.
export function middleware(request: NextRequest, event: NextFetchEvent) {
  // waitUntil lets the Discord post finish AFTER the response is sent, so the
  // request (bot or human) never waits on Discord.
  // 📖 Learn: waitUntil in middleware — https://nextjs.org/docs/app/api-reference/file-conventions/middleware#waituntil-and-nextfetchevent
  const aiFetchReport = reportAiFetch(request)
  if (aiFetchReport) event.waitUntil(aiFetchReport)

  // /writing is people-only. robots.txt (app/robots.ts) only asks politely;
  // this enforces it for bots that ignore robots.txt, including user-triggered
  // AI fetchers like ChatGPT-User. Runs AFTER the report above so blocked AI
  // hits still get logged.
  const { pathname } = request.nextUrl
  // Check "/writing/" with the slash so a page like "/writings-old" isn't caught.
  const isWritingPage = pathname === "/writing" || pathname.startsWith("/writing/")
  if (isWritingPage && isBotUserAgent(request.headers.get("user-agent"))) {
    // 404 instead of 403: a 403 says "something is here, you can't see it",
    // while a 404 makes the page look like it doesn't exist at all.
    // 📖 Learn: HTTP 403 vs 404 — https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
    return new NextResponse("Not found", { status: 404 })
  }

  return NextResponse.next()
}

// Pages only. Skips API routes, Next.js internals, and anything with a file
// extension (images, videos, fonts, robots.txt…), so static files don't each
// cost a middleware invocation.
// 📖 Learn: middleware matcher — https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}

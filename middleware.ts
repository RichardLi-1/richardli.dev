import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"
import { reportAiFetch } from "@/lib/ai-fetch-reporter"

// Runs before every page request (see `matcher` below). Its only job right now
// is spotting AI assistants that fetch pages themselves; see lib/ai-fetch-reporter.ts.
export function middleware(request: NextRequest, event: NextFetchEvent) {
  // waitUntil lets the Discord post finish AFTER the response is sent, so the
  // request (bot or human) never waits on Discord.
  // 📖 Learn: waitUntil in middleware — https://nextjs.org/docs/app/api-reference/file-conventions/middleware#waituntil-and-nextfetchevent
  const aiFetchReport = reportAiFetch(request)
  if (aiFetchReport) event.waitUntil(aiFetchReport)

  return NextResponse.next()
}

// Pages only. Skips API routes, Next.js internals, and anything with a file
// extension (images, videos, fonts, robots.txt…), so static files don't each
// cost a middleware invocation.
// 📖 Learn: middleware matcher — https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}

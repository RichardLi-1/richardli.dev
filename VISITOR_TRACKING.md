# Visitor Tracking

**Sources:** `hooks/use-page-view-tracker.ts`, `hooks/use-preserve-m.ts`, `lib/track.ts`, `app/api/track/route.ts`, `middleware.ts`, `lib/ai-fetch-reporter.ts`, `lib/ai-assistants.ts`, `lib/referral-sources.ts`

## What it does

Answers "who visited, where did they come from, and what did they look at?"

| System | Sees | Where to look |
|---|---|---|
| **Discord tracker** (custom) | Each human page view: referral source, device, path, IP/geo, quick bounces | The Discord channel behind `DISCORD_WEBHOOK_URL` |
| **AI fetch reporter** (custom) | AI bots fetching pages server-side (ChatGPT, Claude, Perplexity) | Vercel runtime logs (`ai_fetch`), plus Discord for user-triggered fetches |
| PostHog, Microsoft Clarity | Product analytics, session replay | Their own dashboards (see `posthog-setup-report.md`) |

## Flow

```
Human visit
  browser ── usePageViewTracker() ── trackEvent() ── POST /api/track ── adds geo ── Discord
          └─ usePreserveM() (root layout): records landing source, strips params from the URL

AI bot fetch (no JavaScript)
  request ── middleware.ts ── reportAiFetch() ── console.log (every AI bot)
                                             └─ Discord ("user" kind only)
```

### 1. Classifying a human visit

`usePageViewTracker()` is called at the top of each page, so it re-runs on every client-side navigation. It picks a referral source in this order:

1. **Short params**: `?l` LinkedIn, `?r`/`?z` Resume, `?t` Twitter/X, `?e` Email, `?g` GitHub, `?c` Cover Letter (`lib/referral-sources.ts`).
2. **AI `utm_source`**: `utm_source=chatgpt.com` becomes "ChatGPT" (from `lib/ai-assistants.ts`). Any other `utm_source` is *not* turned into a source; it shows as "CUSTOM REFERRAL".
3. **AI referrer**: if the URL has no params but `document.referrer` is an AI assistant (e.g. Perplexity), that assistant becomes the source.
4. **Stored source**: otherwise, the last source saved in `localStorage.referral_source`, so later pages and return visits keep their original source.

The raw query string is always included as `🔗 Params`, so the real landing URL is visible even when the label says "ChatGPT".

### 2. AI-assistant visits

AI detection only happens on the **fresh landing**: the first page this tab tracks (`sessionStorage.nav_path` is empty). `document.referrer` keeps its value across client-side navigations, so without this check every later page would look like a new ChatGPT arrival.

AI visits go to the same Discord channel as everything else, with:
- a 🤖 label: `🤖 New visitor from **ChatGPT** (AI assistant) on /…` (and `🤖 Quick bounce from …` for bounces)
- `↩️ Referrer`: the full referrer, when the browser sent one
- `🤖 AI assistant`: `ChatGPT (web, referrer sent)` or `ChatGPT (no referrer, often the mobile app)`

### 3. AI fetchers

AI assistants also fetch pages themselves. They don't run JavaScript, so only `middleware.ts` sees them, by User-Agent:

| Kind | Bots | Meaning | Output |
|---|---|---|---|
| `user` | `ChatGPT-User`, `Claude-User`, `Perplexity-User` | A person asked the assistant something just now and it opened this page | Logs **and** Discord |
| `search` | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` | Indexing pages so they can be cited later | Logs only |
| `training` | `GPTBot`, `ClaudeBot` | Collecting training data | Logs only |

Each hit is one JSON log line, e.g. `{"type":"ai_fetch","vendor":"OpenAI","bot":"GPTBot","kind":"training","page":"/about"}`. The Discord post goes through `event.waitUntil`, so it never slows the response. The middleware matcher skips `/api`, `_next` and any path with a file extension.

## Why visits show `?utm_source=chatgpt.com`

ChatGPT adds it to every link it shows in an answer, so each one is a person clicking through from a ChatGPT answer. **The prompt they typed is never passed to us.** What we can see instead:
- **Which page** they landed on (the topic clue).
- **Web vs app**: web usually sends a referrer, the mobile app often doesn't.
- **What they did next**: the `🛤️ Path` trail, or PostHog filtered by `utm_source`.

## Environment variables

| Variable | Used for |
|---|---|
| `DISCORD_WEBHOOK_URL` | Every visit, bounce and user-triggered AI fetch. Unset = tracking silently does nothing. |
| `VERCEL_ENV` | Set by Vercel. Middleware only posts to Discord when it is `production` (not previews, not local). |

The webhook URL stays server-side; the browser only calls `/api/track`.

## When tracking is skipped

- `localhost` and `vusercontent.net` previews.
- Visitors who opened any URL with `?m` (saved as `skip_tracking` in `localStorage`).
- Holding the `/` key while the page loads.
- Middleware Discord posts unless `VERCEL_ENV=production`. The JSON log line is always written.

## Common changes

**Add a referral link:** add a short key to `REFERRAL_SOURCES` in `lib/referral-sources.ts`.

**Add an AI assistant or bot:** edit `lib/ai-assistants.ts` only. Use `AI_ASSISTANT_HOSTS` for a site humans arrive from, and `AI_FETCHERS` for a bot User-Agent token. Then run `npm test`.

## Limitations

- **Vercel runtime logs are short-lived**, so `ai_fetch` history doesn't last. Use a log drain if long-term data matters.
- **Bot list is hand-maintained.** Vendors add and rename crawlers; Gemini can't be told apart from Googlebot.
- **Fresh landing is per tab.** Opening a second AI link in a tab that already has a `nav_path` won't be flagged as AI.
- **Privacy:** Discord receives IP, approximate location and the referrer URL.

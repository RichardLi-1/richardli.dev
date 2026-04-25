# CLAUDE.md — richardli.dev Codebase Guide

## Project Overview
Personal portfolio site for Richard Li. Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS + shadcn/ui. Features a dual UI system: normal responsive site + a full Windows XP desktop overlay mode.

## Package Manager
Always use `npm install --legacy-peer-deps`. Do NOT use pnpm (lock file exists but pnpm is not installed).

## Running Locally
```bash
npm install --legacy-peer-deps
npm run dev
```

## Directory Structure
```
app/                        # Next.js App Router pages + API routes
  page.tsx                  # Homepage (hero, Currently, featured projects)
  layout.tsx                # Root layout: metadata, JSON-LD, font loading
  layout-content.tsx        # Client wrapper: ThemeProvider → WindowsXPProvider → GifLoadingScreen
  globals.css               # CSS variables, custom fonts (@font-face), animations
  api/
    chat/route.ts           # Claude Haiku streaming chatbot (POST)
    contact/route.ts        # Nodemailer email delivery (POST)
  projects/
    page.tsx                # Split-pane grid (iframe detail panel on desktop)
    [id]/page.tsx           # Individual project pages (one folder each)
  transit/
    photography/            # Photo gallery + PhotoModal
    fanning/                # FanningGallery layout
    hypo-maps/              # Hypothetical transit maps
  chat/page.tsx             # Dedicated chatbot page
  contact/page.tsx          # Contact form
  resume/page.tsx           # Resume
  more/page.tsx             # More section
components/
  animated-header.tsx       # Main site header (sticky glass pill desktop / bottom pill mobile)
  animated-page.tsx         # Page fade-in wrapper (700ms)
  staggered-content.tsx     # Delayed fade-in with Y translate
  responsiveheader.tsx      # Thin wrapper around AnimatedHeader
  footer.tsx                # Footer with version + changelog modal
  chat-box.tsx              # Streaming chatbot UI (react-markdown)
  contact-form.tsx          # Zod-validated contact form
  project-image-cycler.tsx  # Auto-rotating image/video carousel (2s)
  draggable-sticker.tsx     # Draggable PNG (personalized mode)
  global-stickers.tsx       # Sticker collection manager
  gif-loading-screen.tsx    # Initial load animation
  PhotoModal.tsx            # Photo zoom modal
  swiss-grid.tsx            # Debug grid (Cmd+G / Cmd+Shift+G)
  changelog.tsx             # Modal changelog viewer
  mainProjects.ts           # Project data array (source of truth for all projects)
  theme-provider.tsx        # next-themes wrapper
  ui/                       # shadcn/ui primitives (button, card, input)
  windows-xp/               # Full XP desktop: desktop, window, taskbar, start-menu,
                            # desktop-icon, notepad, mail-program, windows-media-player,
                            # clippy-chatbot, projects-ie-content, etc.
contexts/
  windows-xp-context.tsx   # Global state: XP mode, personalization, window management
hooks/
  use-page-view-tracker.ts # Discord webhook analytics on every page view
  use-in-view.ts           # IntersectionObserver hook
  use-is-panel.ts          # Checks ?panel=1 URL param
  use-preserve-m.ts        # Preserves ?m param across navigation
lib/
  utils.ts                 # cn() utility (clsx + tailwind-merge)
public/
  fonts/                   # Toronto-Subway-W01-Regular.ttf, SFCamera-Regular.otf
  images/                  # Project images, stickers, changelogs
  videos/                  # Project demo videos
  sounds/                  # cha ching.mp3 (used in XP mode)
```

## Design System

### Fonts
- **Toronto Subway** (`public/fonts/Toronto-Subway-W01-Regular.ttf`) — body text, UI labels, nav
- **SFCamera** (`public/fonts/SFCamera-Regular.otf`) — h1 headings only (applied globally via `app/globals.css`)
- **Inter** — fallback via Google Fonts

### CSS Variables (`app/globals.css`)
All color/surface values use CSS variables. Never hardcode hex colors; use these vars.

Dark mode defaults (`:root, .dark`):
- `--bg: #000000`, `--text: #e8e4dc`
- `--text-2` through `--text-5`: descending opacity hierarchy
- `--card-bg: #181715`, `--surface: #141210`, `--surface-hover: #1e1c1a`
- `--border-2: rgba(255,255,255,0.08)`, `--glass-bg: rgba(12,12,11,0.85)`

Light mode (`.light`): equivalent lighter/cream values.

### Utility Classes (defined in `globals.css`, not Tailwind)
- `.page-bg` — applies `--bg` + `--text` to page wrappers
- `.photo-card` — photography card (card-bg, squircle corners, border-2)
- `.section-label` — Toronto Subway, 11px, uppercase, 0.08em letter-spacing (use for section h2s)
- `.liquid-glass-pill` — backdrop-blur(24px) + saturate(180%) glass card
- `.squircle` / `.squircle-md` / `.squircle-lg` — corner-shape variants
- `.hero-title` — responsive clamped h1 font-size

### Tailwind Dark Mode
Dark mode strategy: `["class"]`. Always add `dark:` variants alongside light classes.

## Theming
- Provider: `next-themes` with `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`
- Toggle: sun/moon button in `AnimatedHeader` (right side, all states)
- To avoid hydration mismatch: always use `mounted` state + `useEffect` before calling `useTheme()`

## Layout & Navigation
- **All pages** use `<ResponsiveHeader />` (thin wrapper around `AnimatedHeader`)
- Header is sticky (desktop glass pill) / fixed bottom pill (mobile)
- Nav links: Home, Work, Transit, More + Email/LinkedIn/GitHub icons + theme toggle
- Pages wrap content in `<AnimatedPage>` for fade-in, `<StaggeredContent delay={N}>` for stagger

## Key Components

### AnimatedHeader (`components/animated-header.tsx`)
The main header used on all pages. Has XP mode toggle + sun/moon theme toggle. Do not duplicate nav logic elsewhere.

### WindowsXP Context (`contexts/windows-xp-context.tsx`)
Global state for XP mode. Access via `useWindowsXP()`.
```typescript
const { isXPMode, setIsXPMode, isPersonalized, openWindow, closeWindow, ... } = useWindowsXP()
```
Window structure: `{ id, title, content, position, size, zIndex, isMinimized, isMaximized }`

### Project Data (`components/mainProjects.ts`)
Single source of truth for all projects. Shape:
```typescript
{
  id: string          // URL slug
  title: string
  year: string        // "2026", "2024-2025"
  description?: string
  image: string       // Primary image/video path
  image2?: string
  image3?: string
  logo?: string
  tags: string[]      // ["iOS", "Swift", "Game Development"]
  colors: string      // Hex for theming
  externalLink?: string
  hidden?: boolean    // Excludes from grid if true
}
```

### Projects Page (`app/projects/page.tsx`)
Split-pane layout: left grid + right iframe detail panel (desktop). On mobile, clicking navigates. Uses `?panel=1` param on individual project pages to signal they're rendered inside the panel.

## API Routes

### POST `/api/chat`
- Model: `claude-haiku-4-5` via `@anthropic-ai/sdk`
- Max tokens: 300 (includes budget for the `[Q: ...]` follow-up question appended to every response)
- System prompt: first-person Richard Li persona with background, interests, work history
- Returns streaming response

#### Chat UI patterns (`components/chat-box.tsx`)
- **`MessageItem`** is wrapped in `React.memo` — completed messages don't re-render during streaming, keeping Apple Music iframes stable
- **Follow-up question system**: Claude ends every response with `[Q: short question]`. `Q_PATTERN` regex extracts it after streaming, strips it from the stored message content, and stores it in `followUpQuestion` state. A tappable chip renders between the messages area and the input form.
- **Link cards**: `PageCard`, `ExternalCard`, `MusicCard`, `EmailCard` render instead of plain `<a>` tags. The system prompt instructs Claude to link eagerly — cards replace prose descriptions.
- **Sound panel**: `SOUNDS` array + `SoundPanel` component + `soundEnabled`/`showSoundPanel` state are all present in `animated-header.tsx` but the trigger buttons are commented out. Un-comment the `{/* Sound panel button — hidden for now */}` blocks to re-enable.

### POST `/api/contact`
- Nodemailer via Outlook SMTP
- Env vars required: `EMAIL_USER`, `EMAIL_PASS`
- Sends to `richardli0@outlook.com`

## Analytics
`usePageViewTracker` (in `hooks/use-page-view-tracker.ts`) sends a Discord webhook on each page call. It captures device, platform, IP (ipify), path trail, user-agent. Skip conditions: localhost, `?m` param, `sessionStorage.preserve_m`. Called at the top of pages that need tracking.

## Environment Variables (`.env.local`)
```
ANTHROPIC_API_KEY=...   # For /api/chat
EMAIL_USER=...          # Outlook SMTP user
EMAIL_PASS=...          # Outlook SMTP password
```

## Special Features

### Personalized Mode
- Toggle via header button (hidden by default unless enabled)
- Stored in `localStorage` key `isPersonalized`
- Enables `DraggableSticker` overlays on pages

### Windows XP Mode
- Full desktop overlay at z-index 50
- Pre-opened windows: "About Me", "Why Windows XP?"
- Desktop icons launch windows: About Me, Projects (IE), My Computer, Contact Me
- Clippy chatbot appears after 7s
- Sends Discord webhook on activation with timing stats + plays startup sound

### Design Debug Grid
- `Cmd+G`: 12-column + 8px baseline grid overlay
- `Cmd+Shift+G`: 64px row grid overlay
- Implemented in `swiss-grid.tsx`, pointer-events: none

## Build Config (`next.config.mjs`)
- `typescript.ignoreBuildErrors: true`
- `eslint.ignoreDuringBuilds: true`
- `images.unoptimized: true`

## Routes
| Route | File |
|-------|------|
| `/` | `app/page.tsx` |
| `/projects` | `app/projects/page.tsx` |
| `/projects/[id]` | `app/projects/[id]/page.tsx` |
| `/chat` | `app/chat/page.tsx` |
| `/contact` | `app/contact/page.tsx` |
| `/resume` | `app/resume/page.tsx` |
| `/transit/photography` | `app/transit/photography/page.tsx` |
| `/transit/fanning` | `app/transit/fanning/page.tsx` |
| `/transit/hypo-maps` | `app/transit/hypo-maps/page.tsx` |
| `/more` | `app/more/page.tsx` |
| `/more/functions` | `app/more/functions/page.tsx` |

## Coding Conventions
- Prefer editing existing files over creating new ones
- Use CSS vars (`var(--text-2)`) over hardcoded colors
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- Use `mounted` state before accessing `useTheme()` to prevent hydration mismatch
- Use `<AnimatedPage>` to wrap page content for consistent fade-in
- Use `.section-label` class for section headings (not custom Tailwind)
- Link to changed files in every response (per user preference in claude.local.md)


Always link the user to the LINES of all code changes (e.g. [file.tsx:42-51](path/file.tsx#L42-L51))
# richardli.dev

Personal portfolio website for Richard Li — [richardli.dev](https://www.richardli.dev/)

Design inspired by Toronto Subway signage, the Apple Camera app, and iOS tab bars.

---

## "Cool" Features

- **AI Chatbot** — Ask anything about Richard's background, experience, and projects. Powered by Claude Haiku with real-time streaming responses and suggested question prompts. Features embeds, custom info cards, etc. Try asking it for my favourite song
- <img width="552" height="351" alt="Image of chatbot" src="https://github.com/user-attachments/assets/3533cabb-59cf-40cc-b79e-15485c747249" />
~~- **Windows XP Mode** — A toggleable nostalgia mode that transforms the site into a Windows XP desktop experience.~~
- **Light / Dark Theme and High Contrast** — Warm dark and cream light modes with a sun/moon toggle, and high contrast for accessibility of COURSE. As per my commitment to accessibility.
- - **Case Studies** — Learn about the rest of my projects
---

## Tech Stack

### Languages & Frameworks

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org/) (App Router) | Full-stack React framework |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Accessible component primitives |
| [next-themes](https://github.com/pacocoursey/next-themes) | Theme management |
| [Nodemailer](https://nodemailer.com/) | Server-side email delivery |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering in chat |
| [Zod](https://zod.dev/) + [react-hook-form](https://react-hook-form.com/) | Form validation |

### AI/ML APIs

| Service | Model | Usage |
|---|---|---|
| [Anthropic](https://www.anthropic.com/) | `claude-haiku-4-5` | Conversational chatbot — answers questions about Richard in first person, streamed in real time |
| [Vercel AI SDK](https://sdk.vercel.ai/) | — | Streaming abstraction layer for LLM responses |

The chatbot is configured with a detailed system prompt covering work experience, volunteer roles, skills, achievements, and personal interests so it can respond accurately and in character.

---

### Project Structure

```
hi-sg/
├── app/
│   ├── page.tsx                  # Homepage (bio, projects, chatbot)
│   ├── layout.tsx                # Root layout + metadata
│   ├── layout-content.tsx        # Client wrapper: ThemeProvider → XPProvider → GifLoadingScreen
│   ├── globals.css               # CSS variables, custom fonts, design tokens
│   ├── api/
│   │   ├── chat/route.ts         # Claude AI chatbot endpoint (streaming)
│   │   └── contact/route.ts      # Contact form email handler
│   ├── projects/
│   │   ├── page.tsx              # Projects grid
│   │   └── [id]/page.tsx         # Individual project pages
│   ├── transit/
│   │   ├── transit.tsx           # Transit page component
│   │   ├── photography/          # Photo gallery + modal viewer
│   │   └── hypo-maps/            # Hypothetical transit maps
│   ├── chat/page.tsx             # Dedicated chatbot page
│   ├── contact/page.tsx          # Contact form
│   └── resume/page.tsx           # Resume page
├── components/
│   ├── animated-header.tsx       # Main nav: XP mode + theme toggles
│   ├── chat-box.tsx              # Chatbot UI with streaming + suggestions
│   ├── windows-xp/               # Full Windows XP theme mode
│   ├── ui/                       # shadcn/ui component library
│   └── ...
├── contexts/
│   └── windows-xp-context.tsx    # XP mode global state
├── hooks/
│   └── use-page-view-tracker.ts  # Discord webhook page analytics
├── public/
│   ├── fonts/                    # Toronto Subway + SFCamera typefaces
│   └── images/                   # Project screenshots and assets
└── styles/                       # Additional stylesheets (photography.css, etc.)
```

---

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Requires a `.env.local` file with:

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

---

## License

All rights reserved. The code in this repository is not licensed for reuse, redistribution, or modification without explicit permission from the author.

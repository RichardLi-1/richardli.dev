# richardli.dev Brand Guidelines

## Introduction

These guidelines cover how the name "Richard Li", the richardli.dev wordmark, the site icon and the site's visual style should look wherever they appear. They are for two readers: anyone building a page or asset for richardli.dev, and anyone outside it (clubs, hackathons, employers, press) who shows Richard's name or work in their own materials.

The source of truth is the code. Every color and type value here maps to a token in `app/globals.css`; if this doc and the CSS disagree, the CSS wins and this doc gets fixed.

## Logo

The brand has two marks: the **RICHARD LI** wordmark, which is the primary signature, and the **RL monogram**, which is used where space is tight.

### Wordmark

The wordmark is the name set in Toronto Subway, all caps, tracked at 0.08em, in `var(--text)`. It is live text, not an image: the `.nav-logo` class in `app/globals.css` defines it, and the header renders it at 16px. On hover it dims to 60% opacity and never changes color.

### RL monogram

The monogram draws the letters R and L as transit lines: green strokes with round caps, right angles and one 45° diagonal, running over a grey track grid on black. It lives in `public/favicon.svg` (with `public/images/favicon1.png` as the raster source) and appears as the browser icon.

Use the monogram for favicons, avatars and app icons. Use the wordmark everywhere else, and never use both side by side as a lockup.

### Clear space and size (proposed)

- **Clear space:** keep empty space around either mark equal to the height of the R's bowl.
- **Minimum size:** 16px for the monogram, 12px cap height for the wordmark.
- **Background:** the monogram sits on `#000000`; on light backgrounds, keep its black tile rather than dropping the grid onto cream.

### Dos and don'ts

| Do | Don't |
| --- | --- |
| Keep the green strokes and grey grid exactly as drawn | Recolor the monogram or swap the green for another accent |
| Set the wordmark in Toronto Subway, uppercase | Retype the name in another font or in sentence case |
| Give the mark the clear space above | Crop, stretch, rotate or outline either mark |
| Place marks on flat `--bg` or a quiet photo | Place marks over busy images or add shadows, glows or textures |
| Use the monogram as the small-size stand-in | Use the monogram as the main brand on a page that has room for the wordmark |

## Color

The palette is warm neutrals plus one green. Dark mode is the default; light mode swaps the same tokens for cream values. Always reference the token (`var(--text-2)`), never the hex.

| Token | Role | Dark | Light |
| --- | --- | --- | --- |
| `--bg` | Page background | `#000000` | `#f5f4f0` |
| `--text` | Headings, primary text | `#dedad2` | `#1a1815` |
| `--text-2` | Body copy | `#b8b4ac` | `#4a4845` |
| `--text-3` | Labels, metadata | `#888480` | `#7a7775` |
| `--text-4` | Hints, disabled | `#605c58` | `#aaa8a5` |
| `--text-5` | Placeholders, faint rules | `#403c38` | `#ccc9c5` |
| `--card-bg` | Cards | `#181715` | `#ffffff` |
| `--surface` | Panels, inputs | `#141210` | `#efede8` |
| `--surface-hover` | Hovered surface | `#1e1c1a` | `#e5e3de` |
| `--border-2` | Hairline borders | white at 8% | black at 9% |
| `--glass-bg` | Glass overlays | `#0c0c0b` at 85% | `#f5f4f0` at 85% |

### The green

`#4ade80` is the only accent. It marks text selection and the homepage hero highlight, and nothing else: no green buttons, links or icons. One accent used rarely is what makes it read as a signal line rather than decoration.

### Rules

- **Text ladder:** step down `--text` → `--text-5` for hierarchy instead of introducing new greys.
- **Emphasis:** inside dimmed body copy, use `.hl` (full `--text` plus weight 600), not color.
- **High contrast:** `html.hc` overrides these tokens with pure black and white; new tokens need an `hc` value too.
- **Open question:** the monogram's green is a softer shade than `#4ade80`. Pick one and make it a `--accent` token.

## Typography

Two typefaces, one weight each. **Toronto Subway**, the signage face of the TTC, carries almost everything; **SFCamera** is reserved for large `h1` headings. Both load from `public/fonts/` with `font-display: swap`, and fall back to Helvetica Neue, then Helvetica.

The pairing is the brand in miniature: transit signage for structure, a camera face for the photography side.

| Style | Class | Face | Size | Tracking | Case |
| --- | --- | --- | --- | --- | --- |
| Hero title | `.hero-title` | Toronto Subway | 28–52px (fluid) | 0.01em | Sentence |
| Wordmark | `.nav-logo` | Toronto Subway | 16px | 0.08em | Upper |
| Nav link | `.nav-item` | Toronto Subway | 13px | 0.05em | Upper |
| Hero subline | `.hero-sub` | Toronto Subway | 12px | 0.06em | Upper |
| Section label | `.section-label` | Toronto Subway | 11px | 0.08em | Upper |
| Page heading | `h1` | SFCamera | per page | default | Sentence |

### Dos and don'ts

| Do | Don't |
| --- | --- |
| Track small uppercase text at 0.05–0.08em | Set long paragraphs in all caps |
| Use `.section-label` for every section `h2` | Style section headings with one-off Tailwind sizes |
| Show hierarchy through size, case and the text ladder | Add a third typeface or a decorative display font |
| Keep SFCamera to headings | Use SFCamera for body copy or UI labels |

**Open question:** both fonts ship one Regular weight, so `.hl`'s weight 600 is a browser-faked bold. Either accept it as part of the look or switch `.hl` to color-only emphasis.

## Shape and surface

Soft corners, flat surfaces and one layer of glass. Content sits on flat `--bg`; only the navigation floats.

- **Squircles:** `.squircle` (16px) and `.squircle-lg` (24px) use `corner-shape: squircle`, the smooth Apple-style corner. Browsers without it fall back to near-square 3–4px corners on purpose, so a plain rounded rectangle never stands in.
- **Cards:** `.photo-card` at 14px radius on `--card-bg` with a `--border-2` hairline. On hover a card shrinks to 98% instead of lifting or glowing.
- **Glass pill:** `.liquid-glass-pill` (24px blur, 180% saturation, fully round) is for the header and floating controls only. One glass layer per screen; never glass on glass.
- **Motion:** pages fade in over 700ms (`AnimatedPage`) and sections stagger in (`StaggeredContent`). Springy curves such as `cubic-bezier(0.34, 1.56, 0.64, 1)` are for small UI like the chat orb, not page layout.

### Dos and don'ts

| Do | Don't |
| --- | --- |
| Use the squircle classes for rounded surfaces | Hand-pick new radius values |
| Keep shadows faint and borders hairline | Use heavy drop shadows or colored borders |
| Let photography and project media carry the color | Add gradients or patterns behind content |

## Voice and language

The site talks like Richard does: first person, casual but technical, and honest about tradeoffs.

- **First person:** "I" for my own decisions, "we" for team work, with collaborators thanked by name.
- **Motivate decisions:** name the naive approach, say why it falls short, then give the one chosen.
- **Specific over hype:** numbers, tools and dates instead of adjectives like "cutting-edge" or "passionate".
- **Light touch:** an aside or a ":)" is fine; exclamation marks and emoji in headings are not.
- **Punctuation:** no em dashes. Use a colon, a comma or a new sentence.

### Naming

| Write | Not |
| --- | --- |
| Richard Li | Rich Li, R. Li, richard li |
| richardli.dev (always lowercase) | RichardLi.dev, Richardli.com |
| Systems Design Engineering, University of Waterloo | SYDE (on first mention), UW Engineering |
| Toronto Subway (the typeface) | TTC font |

## Collaborations

Partner logos appear on the site as credit, never as decoration; partners showing Richard's name follow the reverse of the same rules.

**On richardli.dev.** Organization logos (Hack the North, University of Waterloo, SaFuture, SalesPatriot, AMD, FormulaTech Hacks) live in `public/logos/` and appear only next to the work done with that organization. Show each logo in its own approved colors, at a matched height, with a white-on-transparent logo given `.invert-on-light` so it survives light mode. Never imply an endorsement the organization didn't give.

**On a partner's materials.** A club, hackathon or employer listing Richard should use the name as text, or the wordmark with the clear space above. Keep the two marks at about the same height with a clear gap, and run anything that pairs the RL monogram with another logo past Richard first.

| Do | Don't |
| --- | --- |
| Match logo heights and leave generous space between them | Shrink one logo to a footnote next to the other |
| Keep each logo in its own colors on a quiet background | Tint a partner logo green or set it over a busy photo |
| Tie each logo to a specific project or role | Use logos as a wall of social proof on the homepage |

## Press, usage and contact

### Short bio

When describing Richard in event pages, articles or speaker lists, use:

> Richard Li is a full-stack developer and Systems Design Engineering student at the University of Waterloo, building GIS and municipal AI products and transit software.

### Usage terms

- Use the marks only to refer to Richard or his work, exactly as provided.
- Don't put the marks on merchandise, or fold them into your own logo or branding, without asking.
- Don't make Richard's name or marks more prominent than your own on co-branded material.
- These guidelines may change; materials should follow the latest version within a reasonable time.

### Contact

For permission requests, logo files or questions about these guidelines, email [r575li@uwaterloo.ca](mailto:r575li@uwaterloo.ca). Richard is also on [LinkedIn](https://www.linkedin.com/in/richardli0/) and [GitHub](https://github.com/RichardLi-1).

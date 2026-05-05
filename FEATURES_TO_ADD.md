Alt tags for every image/vid

A/B test loading vs not loading retention

A way to track retention better

animates up text saying Light Dark High Contrast: On when pressing these buttons

Make the chat window slide up from the bottom for mobile and fill half the screen

add voice option


Make ask richard corner radius match other things

Chatbot rich media system — semantically tagged media DB
- Tag-based image/video library (lib/media-db.ts)
- Claude writes card:tag:transit etc, system resolves to matching item
- Card types: project, image, video, social, app store, external link
- Registry pattern for the a-tag interceptor in chat-box.tsx
- Populate with curated images Richard likes / things that relate to topics

Fix the problem that cards don't show the proper preview image like transit fanning shows future forward image

more things to add:
fav lotion: ones that smell like molly tea

Add ability to render my fav transit line


Make data structures for the case studies
typed TS objects, not raw JSON.

Why:

you get autocomplete + type safety
easier to embed small bits of logic when needed
no separate JSON parsing/validation overhead
So conceptually yes, it becomes “freeform structured data,” but with guardrails via TypeScript unions.

Example shape:

const fatherFigureCaseStudy: CaseStudySection[] = [
  {
    id: "case-study",
    label: "Case Study",
    blocks: [
      { type: "paragraph", text: "We implemented three distinct father personas..." },
      { type: "bullets", items: ["Gemini for responses", "ElevenLabs voice", "Speech queue"] },
      { type: "videoEmbed", title: "Full demo", youtubeId: "rnDSdft8QbM" },
    ],
  },
]
Not truly “anything goes” freeform — it’s structured freeform.

📖 Learn: This is often called a “block-based content model” (same concept many CMSes use internally).

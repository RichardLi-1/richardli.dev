// Generates blurred placeholders for case study images.
//
// For every image under public/images/projects/ it records:
//   w, h  → so <CaseStudyImage> can reserve the right-shaped box before the
//           image has downloaded (otherwise it's 0px tall until then)
//   blur  → a tiny (16px wide) copy of the image wrapped in an SVG with a blur
//           filter, as a data URL. Shown while the real image loads.
//
// Output: lib/image-placeholders.json (gitignored; regenerated before every
// `npm run dev` and `npm run build` by the predev/prebuild scripts).
//
// Uses sharp, the image library Next.js itself uses.
// 📖 Learn: sharp — https://sharp.pixelplumbing.com
//
// Run by hand: node scripts/generate-image-placeholders.mjs

import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const PUBLIC_DIR = "public"
const SOURCE_DIR = path.join(PUBLIC_DIR, "images", "projects")
const OUTPUT = path.join("lib", "image-placeholders.json")
const TINY_WIDTH = 16 // px. Bigger = more detail in the blur, but more bytes in every page
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"])

/** Every file under `dir`, recursively. */
async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? listFiles(full) : [full]
    }),
  )
  return nested.flat()
}

/**
 * Why an SVG instead of just the 16px image: the browser would stretch a
 * 16px image with simple smoothing, which looks blocky at full size. The SVG
 * applies a real Gaussian blur at whatever size it's drawn.
 * - viewBox is in tiny-image pixels, so the blur scales with the image
 * - edgeMode="duplicate" stops the edges from blurring into transparency
 * - the alpha table forces every pixel fully opaque, for the same reason
 * 📖 Learn: SVG filters (feGaussianBlur, feComponentTransfer)
 */
function blurSvg(tinyBase64, width, height) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">` +
    `<filter id="b" color-interpolation-filters="sRGB">` +
    `<feGaussianBlur stdDeviation="1" edgeMode="duplicate"/>` +
    `<feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer>` +
    `</filter>` +
    `<image href="data:image/webp;base64,${tinyBase64}" width="${width}" height="${height}" preserveAspectRatio="none" filter="url(#b)"/>` +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const files = (await listFiles(SOURCE_DIR)).filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))

const placeholders = {}
let skipped = 0
for (const file of files) {
  try {
    const image = sharp(file).rotate() // .rotate() with no angle = apply the photo's own orientation
    const { width, height } = await image.metadata()
    // Images with see-through parts are logos/badges. A blurred logo just looks
    // like a smudge, so those keep loading as normal. isOpaque checks the actual
    // pixels: plenty of PNG screenshots have an alpha channel that's fully solid.
    const { isOpaque } = await image.stats()
    if (!width || !height || !isOpaque) {
      skipped++
      continue
    }
    const tinyHeight = Math.max(1, Math.round((TINY_WIDTH * height) / width))
    const tiny = await sharp(file).rotate().resize(TINY_WIDTH, tinyHeight, { fit: "fill" }).webp({ quality: 60 }).toBuffer()
    // Key = the path the page uses in src, e.g. "/images/projects/amd/team-lunch.webp"
    const src = "/" + path.relative(PUBLIC_DIR, file).split(path.sep).join("/")
    placeholders[src] = { w: width, h: height, blur: blurSvg(tiny.toString("base64"), TINY_WIDTH, tinyHeight) }
  } catch (err) {
    // One unreadable file shouldn't fail the whole build
    console.warn(`[placeholders] skipped ${file}: ${err.message}`)
    skipped++
  }
}

await writeFile(OUTPUT, JSON.stringify(placeholders))
const bytes = Buffer.byteLength(JSON.stringify(placeholders))
console.log(`[placeholders] ${Object.keys(placeholders).length} images → ${OUTPUT} (${(bytes / 1024).toFixed(1)} KB), ${skipped} skipped`)

import { execSync } from "child_process";
import { readdirSync, existsSync, mkdirSync } from "fs"
import { join, basename, extname } from "path"

const videosDir = "public/videos";
const thumbsDir = "public/images/thumbnails"

if (!existsSync(thumbsDir)) mkdirSync(thumbsDir, { recursive: true })

const videoExts = [".mp4", ".mov", ".MOV"]

for (const file of readdirSync(videosDir)) {
  if (!videoExts.includes(extname(file))) continue

  const name = basename(file, extname(file))
  const out  = join(thumbsDir, `${name}.jpg`)

  if (existsSync(out)) { console.log(`skip  ${file}`); continue }

  // -ss 0: seek to 0s, -vframes 1: grab one frame, -q:v 2: high JPEG quality
  execSync(`ffmpeg -ss 0 -i "${join(videosDir, file)}" -vframes 1 -q:v 2 "${out}"`)
  console.log(`done  ${file} → ${out}`)
}

"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Animated backdrop for the AMD banner (homepage card + /amd hero).
// Two looks are being trialled; styles live in app/globals.css under "AMD atmosphere".
//   horizon → a planet's edge at sunrise, drawn per-pixel by a WebGL shader
//   aurora  → heavily blurred colour fields that slowly bleed into each other (CSS)
// Add ?amd=aurora (or ?amd=horizon) to any URL to switch while comparing.
type Variant = "horizon" | "aurora"

export function AmdAtmosphere({
  className,
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  const [variant, setVariant] = useState<Variant>("horizon")

  // Read the URL on the client only. Using useSearchParams would force a
  // Suspense boundary on these pages, which is overkill for a temporary switch.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("amd")
    if (param === "horizon" || param === "aurora") setVariant(param)
  }, [])

  return (
    <div className={cn("amd-atmosphere", `amd-${variant}`, className)} style={style}>
      {/* aria-hidden: purely decorative layers, nothing for screen readers */}
      {variant === "horizon" ? (
        <HorizonCanvas />
      ) : (
        <>
          <div aria-hidden className="amd-layer amd-a-fields">
            <div className="amd-a-field amd-a-f1" />
            <div className="amd-a-field amd-a-f2" />
            <div className="amd-a-field amd-a-f3" />
            <div className="amd-a-field amd-a-f4" />
          </div>
          <div aria-hidden className="amd-layer amd-a-shade" />
          <div aria-hidden className="amd-layer amd-grain" />
        </>
      )}
      {children}
    </div>
  )
}

// ── Horizon shader ───────────────────────────────────────────────────────────
// Why a shader instead of CSS gradients: CSS blends *linearly* between a few
// colour stops, so glows get visible edges and plateaus. Real scattered light
// fades off exponentially. A fragment shader computes every pixel's colour
// directly, so each glow can use a true exp() falloff and the result is smooth.
// 📖 Learn: fragment shaders ("The Book of Shaders"), WebGL full-screen triangle

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_res;     // canvas size in device pixels
uniform float u_time;   // seconds
uniform float u_dpr;    // device pixel ratio (keeps stars the same size on retina)
uniform float u_light;  // 0 = dark theme, 1 = light theme

// Cheap pseudo-random number in [0,1) from a 2D input
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  // y: 0 at the bottom, 1 at the top. x: 0 at the centre, measured in
  // card-heights so shapes don't stretch on wide banners.
  float y = frag.y / u_res.y;
  float x = (frag.x - 0.5 * u_res.x) / u_res.y;
  float px = 1.0 / u_res.y; // one device pixel in these units

  // Horizon 20% up from the bottom, with only a slight planet curve
  float d = y - (0.20 - 0.045 * x * x); // distance from the horizon: >0 sky, <0 ground
  float sky = max(d, 0.0);

  // Slow, unsynchronised breathing (periods ~9s / ~14s / ~17s)
  float breathe  = 0.88 + 0.12 * sin(u_time * 0.70);
  float sunPulse = 0.82 + 0.18 * sin(u_time * 0.45 + 1.3);
  float spread   = 1.0  + 0.12 * sin(u_time * 0.37 + 0.4);

  // Palette: mix() picks the dark or light version via u_light
  vec3 skyTop   = mix(vec3(0.004, 0.004, 0.008), vec3(0.985, 0.985, 0.980), u_light);
  vec3 skyLow   = mix(vec3(0.028, 0.036, 0.080), vec3(0.870, 0.895, 0.950), u_light);
  vec3 atmoFar  = mix(vec3(0.090, 0.140, 0.340), vec3(0.820, 0.860, 0.950), u_light);
  vec3 atmoMid  = mix(vec3(0.270, 0.390, 0.820), vec3(0.900, 0.930, 0.990), u_light);
  vec3 atmoNear = mix(vec3(0.720, 0.810, 1.000), vec3(1.000, 1.000, 1.000), u_light);
  vec3 ground   = mix(vec3(0.007, 0.009, 0.015), vec3(0.925, 0.932, 0.945), u_light);
  vec3 groundLow = mix(vec3(0.003, 0.004, 0.007), vec3(0.870, 0.880, 0.905), u_light);
  vec3 scatter  = mix(vec3(0.150, 0.210, 0.400), vec3(1.000, 1.000, 1.000), u_light);
  vec3 warm     = mix(vec3(1.000, 0.620, 0.450), vec3(1.000, 0.800, 0.700), u_light);
  vec3 core     = vec3(1.000, 0.970, 0.930);

  // Sky: dark overhead, lifting toward the horizon
  vec3 c = mix(skyLow, skyTop, smoothstep(0.0, 0.75, sky));

  // Light gathers around the sunrise and fades along the limb
  float wNear = exp(-x * x / (0.30 * spread));
  float wWide = exp(-x * x / (1.20 * spread));

  // Atmosphere: three exponential falloffs (wide haze → blue band → bright edge)
  // (the wide layers are halved in the light theme, otherwise the whole lower
  // half of a pale sky turns lavender)
  float hazeAmount = mix(1.0, 0.45, u_light);
  c = mix(c, atmoFar,  clamp(exp(-sky / 0.30)  * 0.55 * wWide * breathe * hazeAmount, 0.0, 1.0));
  c = mix(c, atmoMid,  clamp(exp(-sky / 0.07)  * 0.65 * mix(0.35, 1.0, wNear) * breathe * hazeAmount, 0.0, 1.0));
  c = mix(c, atmoNear, clamp(exp(-sky / 0.012) * 0.85 * mix(0.25, 1.0, wNear), 0.0, 1.0));

  // Ground: shaded darker toward the bottom edge so it reads as a curved
  // surface, with light scattering just below the rim and a 2-pixel antialiased edge
  vec3 g = mix(ground, groundLow, smoothstep(0.0, 0.2, -d));
  g = mix(g, scatter, clamp(exp(d / 0.025) * 0.55 * wNear, 0.0, 1.0));
  c = mix(c, g, 1.0 - smoothstep(-px, px, d));

  // Razor-thin lit rim that follows the curve exactly
  c = mix(c, atmoNear, clamp(exp(-abs(d) / (1.6 * px)) * mix(0.25, 1.0, wNear), 0.0, 1.0));

  // Sunrise: warm halo, hot core, and a streak that runs along the limb
  // (warmth is toned down in the light theme, where it reads as an orange smudge)
  c = mix(c, warm, clamp(exp(-(x * x / 0.012  + d * d / 0.0012))  * mix(0.6, 0.28, u_light) * sunPulse, 0.0, 1.0));
  c = mix(c, core, clamp(exp(-(x * x / 0.0012 + d * d / 0.00012)) * sunPulse, 0.0, 1.0));
  c = mix(c, core, clamp(exp(-d * d / 0.000004) * exp(-x * x / (0.10 * spread)) * 0.55, 0.0, 1.0));

  // Sparse twinkling stars (dark theme only), fading out near the glow
  float cellSize = 26.0 * u_dpr;
  vec2 cell = floor(frag / cellSize);
  float h = hash(cell);
  if (h > 0.93) {
    vec2 centre = (cell + vec2(hash(cell + 1.7), hash(cell + 3.1))) * cellSize;
    float r = length(frag - centre) / u_dpr;
    float twinkle = 0.55 + 0.45 * sin(u_time * (0.8 + 2.0 * hash(cell + 5.3)) + h * 40.0);
    float star = exp(-r * r / 0.45) * twinkle * smoothstep(0.08, 0.45, d) * (0.35 + 0.65 * hash(cell + 9.1));
    c += vec3(star * 0.8 * (1.0 - u_light));
  }

  // Dithering: +/- half a colour step of noise per pixel stops smooth dark
  // gradients from showing banding "rings" on 8-bit screens.
  c += (hash(frag) - 0.5) / 255.0;

  gl_FragColor = vec4(c, 1.0);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("AMD horizon shader failed to compile:", gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

// ── One shared WebGL renderer ────────────────────────────────────────────────
// Why share: on Apple GPUs, Chrome only builds the real GPU pipeline for a
// shader the first time it's *drawn*, and for this shader that took ~300ms
// (measured in a performance trace), during which no frame could be shown.
// When the AMD page threw away the homepage card's context and made a fresh
// one, it paid that cost again mid-way through the project-launch animation,
// freezing it. So the canvas + context are created once and *moved* between
// whichever banner is on screen (homepage card → /amd hero). The compiled
// pipeline stays alive, and it's literally the same banner travelling across.
// 📖 Learn: WebGL contexts, shader compilation cost, "warming" GPU pipelines
interface HorizonRenderer {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  draw: (seconds: number, light: number) => void
}

let sharedRenderer: HorizonRenderer | null = null
let sharedInUse = false // only one banner can hold the shared canvas at a time

function createRenderer(): HorizonRenderer | null {
  const canvas = document.createElement("canvas")
  canvas.className = "amd-h-canvas"
  canvas.setAttribute("aria-hidden", "true")
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false })
  if (!gl) return null

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vertex || !fragment) return null
  const program = gl.createProgram()!
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.useProgram(program)

  // One triangle big enough to cover the whole canvas; the fragment shader
  // then runs once per pixel inside it.
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const positionLoc = gl.getAttribLocation(program, "a_pos")
  gl.enableVertexAttribArray(positionLoc)
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, "u_res")
  const uTime = gl.getUniformLocation(program, "u_time")
  const uDpr = gl.getUniformLocation(program, "u_dpr")
  const uLight = gl.getUniformLocation(program, "u_light")
  const dpr = Math.min(window.devicePixelRatio || 1, 2) // cap: 3x screens don't need 9x the pixels

  const draw = (seconds: number, light: number) => {
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uTime, seconds)
    gl.uniform1f(uDpr, dpr)
    gl.uniform1f(uLight, light)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  return { canvas, gl, draw }
}

// Shared clock, so the sky doesn't jump back to t=0 when the canvas moves pages
const clockStart = typeof performance !== "undefined" ? performance.now() : 0

function HorizonCanvas() {
  // The canvas itself is appended into this host by the effect below
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // Borrow the shared renderer if it's free (creating it the first time),
    // otherwise make a private one. If WebGL isn't available we just return:
    // the CSS sky gradient on .amd-horizon stays visible as a fallback.
    let renderer: HorizonRenderer | null
    const usesShared = !sharedInUse
    if (usesShared) {
      if (!sharedRenderer || sharedRenderer.gl.isContextLost()) sharedRenderer = createRenderer()
      renderer = sharedRenderer
      if (renderer) sharedInUse = true
    } else {
      renderer = createRenderer()
    }
    if (!renderer) return
    const { canvas, gl, draw } = renderer
    host.appendChild(canvas)

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const readTheme = () => (document.documentElement.classList.contains("light") ? 1 : 0)
    let light = readTheme()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const drawNow = () => draw((performance.now() - clockStart) / 1000, light)

    // Match the canvas's pixel buffer to its on-screen size (x DPR for sharpness)
    const resize = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      drawNow()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    // Redraw when the site's theme toggle flips the class on <html>
    const themeObserver = new MutationObserver(() => {
      light = readTheme()
      drawNow()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    // The project-launch animation copies this canvas into its overlay.
    // WebGL clears its pixels after each frame is shown, so it asks for a
    // fresh draw first; drawing and copying in the same task works.
    // (Event name shared with components/app-launch.tsx)
    canvas.addEventListener("app-launch:snapshot", drawNow)

    // Animate at ~30fps, and only while the banner is on screen. The motion
    // is slow, so 60fps would just burn battery.
    let rafId = 0
    let lastFrame = 0
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      if (now - lastFrame < 33) return
      lastFrame = now
      drawNow()
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reducedMotion) {
        if (!rafId) rafId = requestAnimationFrame(loop)
      } else {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    })
    visibilityObserver.observe(canvas)

    resize()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      visibilityObserver.disconnect()
      canvas.removeEventListener("app-launch:snapshot", drawNow)
      canvas.remove()
      if (usesShared) {
        // Keep the context alive for the next banner (e.g. the /amd page)
        sharedInUse = false
      } else {
        // Browsers cap how many WebGL contexts can exist; free private ones
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      }
    }
  }, [])

  return <div ref={hostRef} aria-hidden className="amd-layer" />
}

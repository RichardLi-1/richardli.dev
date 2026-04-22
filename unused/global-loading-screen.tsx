"use client"

import { useState, useEffect } from "react"

export function GlobalLoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500) // Wait for exit animation
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-transform duration-500 ease-in ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="relative w-[80vw] h-[80vh] max-w-4xl max-h-4xl">
        <svg viewBox="0 0 800 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#4a5568" strokeWidth="3" fill="none">
            {/* Main horizontal lines */}
            <line x1="50" y1="150" x2="750" y2="150" />
            <line x1="100" y1="250" x2="700" y2="250" />
            <line x1="50" y1="350" x2="750" y2="350" />
            <line x1="150" y1="450" x2="650" y2="450" />

            {/* Main vertical lines */}
            <line x1="150" y1="50" x2="150" y2="550" />
            <line x1="250" y1="100" x2="250" y2="500" />
            <line x1="350" y1="50" x2="350" y2="550" />
            <line x1="450" y1="100" x2="450" y2="500" />
            <line x1="550" y1="50" x2="550" y2="550" />

            {/* R Letter formation - natural part of grid */}
            {/* Vertical line of R */}
            <line x1="200" y1="200" x2="200" y2="400" />
            {/* Top horizontal of R */}
            <line x1="200" y1="200" x2="280" y2="200" />
            {/* Middle horizontal of R */}
            <line x1="200" y1="300" x2="280" y2="300" />
            {/* Right vertical top of R */}
            <line x1="280" y1="200" x2="280" y2="300" />
            {/* Diagonal leg of R */}
            <line x1="280" y1="300" x2="320" y2="400" />

            {/* L Letter formation - natural part of grid */}
            {/* Vertical line of L */}
            <line x1="400" y1="200" x2="400" y2="400" />
            {/* Bottom horizontal of L */}
            <line x1="400" y1="400" x2="480" y2="400" />

            {/* Random connecting lines to make it look like a real transit map */}
            <line x1="50" y1="100" x2="200" y2="200" />
            <line x1="320" y1="150" x2="400" y2="200" />
            <line x1="480" y1="250" x2="600" y2="350" />
            <line x1="150" y1="450" x2="250" y2="350" />
            <line x1="550" y1="150" x2="650" y2="250" />
            <line x1="100" y1="500" x2="300" y2="450" />
            <line x1="500" y1="100" x2="700" y2="200" />
            <line x1="350" y1="500" x2="550" y2="400" />

            {/* Additional random intersections */}
            <line x1="180" y1="80" x2="320" y2="180" />
            <line x1="420" y1="120" x2="580" y2="220" />
            <line x1="120" y1="380" x2="280" y2="480" />
            <line x1="520" y1="320" x2="680" y2="420" />
          </g>

          {/* Train 1: Moving to R vertical */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="50,149;200,199"
              dur="2s"
              begin="0s"
              fill="freeze"
            />
          </rect>

          {/* Train 2: Moving to R top horizontal */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="150,50;200,199"
              dur="2s"
              begin="0.2s"
              fill="freeze"
            />
          </rect>

          {/* Train 3: Moving to R middle horizontal */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="100,249;200,299"
              dur="2s"
              begin="0.4s"
              fill="freeze"
            />
          </rect>

          {/* Train 4: Moving to R right vertical */}
          <rect width="3" height="24" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="279,100;279,199"
              dur="2s"
              begin="0.6s"
              fill="freeze"
            />
          </rect>

          {/* Train 5: Moving to R diagonal leg */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="250,349;280,299"
              dur="2s"
              begin="0.8s"
              fill="freeze"
            />
          </rect>

          {/* Train 6: Moving to L vertical */}
          <rect width="3" height="24" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="399,100;399,199"
              dur="2s"
              begin="1s"
              fill="freeze"
            />
          </rect>

          {/* Train 7: Moving to L bottom horizontal */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="650,449;400,399"
              dur="2s"
              begin="1.2s"
              fill="freeze"
            />
          </rect>

          {/* Train 8: Additional train for R */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="750,349;320,399"
              dur="2s"
              begin="1.4s"
              fill="freeze"
            />
          </rect>

          {/* Train 9: Additional train for L */}
          <rect width="24" height="3" fill="#10b981">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="550,49;480,399"
              dur="2s"
              begin="1.6s"
              fill="freeze"
            />
          </rect>

          <g opacity="0" stroke="#10b981" strokeWidth="5" fill="none">
            <animate attributeName="opacity" values="0;1;0.7" dur="1s" begin="2s" fill="freeze" />

            {/* Highlighted R */}
            <line x1="200" y1="200" x2="200" y2="400" />
            <line x1="200" y1="200" x2="280" y2="200" />
            <line x1="200" y1="300" x2="280" y2="300" />
            <line x1="280" y1="200" x2="280" y2="300" />
            <line x1="280" y1="300" x2="320" y2="400" />

            {/* Highlighted L */}
            <line x1="400" y1="200" x2="400" y2="400" />
            <line x1="400" y1="400" x2="480" y2="400" />
          </g>
        </svg>
      </div>
    </div>
  )
}

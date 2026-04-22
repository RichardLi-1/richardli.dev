"use client"

import { useState, useEffect } from "react"

export function ContactLoadingScreen({ onComplete }: { onComplete: () => void }) {
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
      <div className="relative w-96 h-96">
        <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Static transit lines */}
          <g stroke="#4a5568" strokeWidth="4" fill="none">
            {/* Horizontal lines */}
            <line x1="50" y1="100" x2="350" y2="100" />
            <line x1="50" y1="200" x2="350" y2="200" />
            <line x1="50" y1="300" x2="350" y2="300" />

            {/* Vertical lines */}
            <line x1="100" y1="50" x2="100" y2="350" />
            <line x1="200" y1="50" x2="200" y2="350" />
            <line x1="300" y1="50" x2="300" y2="350" />

            {/* Diagonal lines */}
            <line x1="50" y1="50" x2="350" y2="350" />
            <line x1="350" y1="50" x2="50" y2="350" />

            {/* Additional connecting lines */}
            <line x1="150" y1="50" x2="250" y2="150" />
          </g>

          {/* Animated trains */}
          {/* Train 1: Top horizontal line */}
          <rect width="20" height="4" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="50,98;200,98"
              dur="2s"
              begin="0s"
              fill="freeze"
            />
          </rect>

          {/* Train 2: Bottom horizontal line */}
          <rect width="20" height="4" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="350,298;200,298"
              dur="2s"
              begin="0.2s"
              fill="freeze"
            />
          </rect>

          {/* Train 3: Left vertical line */}
          <rect width="4" height="20" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="98,50;98,200"
              dur="2s"
              begin="0.4s"
              fill="freeze"
            />
          </rect>

          {/* Train 4: Right vertical line */}
          <rect width="4" height="20" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="298,350;298,200"
              dur="2s"
              begin="0.6s"
              fill="freeze"
            />
          </rect>

          {/* Train 5: Main diagonal */}
          <rect width="20" height="4" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="50,50;200,200"
              dur="2s"
              begin="0.8s"
              fill="freeze"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="45 10 2;45 10 2"
              dur="2s"
              begin="0.8s"
              fill="freeze"
            />
          </rect>

          {/* Train 6: Counter diagonal */}
          <rect width="20" height="4" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="350,50;200,200"
              dur="2s"
              begin="1s"
              fill="freeze"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-45 10 2;-45 10 2"
              dur="2s"
              begin="1s"
              fill="freeze"
            />
          </rect>

          {/* Train 7: Middle horizontal */}
          <rect width="20" height="4" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="50,198;200,198"
              dur="2s"
              begin="1.2s"
              fill="freeze"
            />
          </rect>

          {/* Train 8: Middle vertical */}
          <rect width="4" height="20" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="198,50;198,200"
              dur="2s"
              begin="1.4s"
              fill="freeze"
            />
          </rect>

          {/* Train 9: Connecting line */}
          <rect width="20" height="4" fill="#10b981" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="150,50;200,100"
              dur="2s"
              begin="1.6s"
              fill="freeze"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="45 10 2;45 10 2"
              dur="2s"
              begin="1.6s"
              fill="freeze"
            />
          </rect>

          {/* RL Text Formation */}
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.5s" begin="2s" fill="freeze" />

            {/* R Letter */}
            <path
              d="M 170 180 L 170 220 M 170 180 L 185 180 L 185 200 L 170 200 M 185 200 L 185 220"
              stroke="#10b981"
              strokeWidth="4"
              fill="none"
            />

            {/* L Letter */}
            <path d="M 210 180 L 210 220 L 225 220" stroke="#10b981" strokeWidth="4" fill="none" />
          </g>
        </svg>
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "framer-motion"

interface Props {
  labels: string[]
  children: React.ReactNode
  // When true, children should be motion.div elements — they'll stagger in on open
  animateContent?: boolean
}

// Variants shared between the container and each child.
// 📖 Learn: framer-motion staggerChildren — parent schedules children's
// animations in sequence; each child uses the same variant key names.
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
  exit: {},
}

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.15 } },
}

export function CollapsibleDetails({ labels, children, animateContent }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full mb-3 group"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-300 shrink-0"
          style={{
            color: "var(--text-3)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
        <motion.span
          className="section-label"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >{labels.join(" · ")}</motion.span>
      </button>

      {animateContent ? (
        // AnimatePresence lets framer-motion run exit animations before unmounting
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ overflow: "hidden" }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        // Default: CSS grid-template-rows trick for smooth height animation
        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

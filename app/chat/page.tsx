"use client"
import { AnimatedPage } from "@/components/animated-page"
import { AnimatedHeader } from "@/components/animated-header"
import { Footer } from "@/components/footer"
import { ChatBox } from "@/components/chat-box"

export default function ChatPage() {
  return (
    <AnimatedPage>
      <div className="page-bg min-h-screen flex flex-col w-full">
        <AnimatedHeader currentPage="/chat" backHref="/" backText="Chat" />

        <main className="flex flex-col flex-1 max-w-4xl w-full mx-auto px-6 py-8" style={{ minHeight: 0 }}>
          <div className="mb-6">
            <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", marginBottom: "6px" }}>Ask me anything</h1>
          </div>

            <ChatBox fullHeight />
        </main>

        <Footer />
      </div>
    </AnimatedPage>
  )
}

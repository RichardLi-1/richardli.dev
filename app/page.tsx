"use client"
import { useState } from "react"
import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, ExternalLink } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function PersonalWebsite() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                setIsLoading(false)
                return
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantContent += parsed.content
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
                  )
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent
    setTimeout(() => {
      handleSubmit(syntheticEvent)
    }, 100)
  }

  const suggestedQuestions = [
    "What did you do at Mochi Doh?",
    "Tell me about your role as Shift Leader at CoCo",
    "What was your iOS app development experience like?",
    "What did you do as a tutor?",
    "Tell me about Toteally Yours",
    "What are your responsibilities at YRHacks?",
    "What did you achieve at DECA?",
    "How did you score so well on the SAT?",
  ]

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/IMG_2486.jpg?height=48&width=48" alt="Profile" />
            <AvatarFallback>RC</AvatarFallback>
          </Avatar>
        </div>
        <nav className="flex space-x-8">
          <a href="#contact" className="hover:text-green-300 transition-colors">
            CONTACT
          </a>
          <a href="https://www.linkedin.com/in/richardli0/" className="hover:text-green-300 transition-colors flex items-center gap-1">
            LINKEDIN <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://github.com/RichardLi-1" className="hover:text-green-300 transition-colors flex items-center gap-1">
            GITHUB <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Introduction */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Hey, I'm Richard!</h1>
          <div className="space-y-2 text-gray-300">
            <p>
              I'm 18, based in <span className="underline">toronto</span>.
            </p>
          </div>
        </section>

        {/* Current Activities */}
        <section className="space-y-4">
          <h2 className="text-xl">
            I'm <span className="underline">currently</span>...
          </h2>
          <ul className="space-y-2 text-gray-300 ml-4">
          <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>an incoming  
              {' '}<a href="https://uwaterloo.ca/systems-design-engineering/" target="_blank" rel="noopener noreferrer" class="underline hover:text-stone-100 transition-colors inline-block transform transition-transform duration-200 hover:scale-110"> systems design engineering </a>{' '}
               student at the <img
  alt="University of Waterloo"
  className="inline w-4 h-4 mr-1"
  src="https://i.pinimg.com/originals/90/19/17/901917f9b6e74d254525c3e37d3dd934.png"
/>
                <a href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer" class="underline hover:text-stone-100 transition-colors inline-block transform transition-transform duration-200 hover:scale-110">university of waterloo</a></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>interning at a YC-backed SaaS startup, analyzing ai trends and working on product design</span>
            </li>
          </ul>
        </section>

        {/* Previous Experience */}
        <section className="space-y-4">
          <h2 className="text-xl">Previously I...</h2>
          <ul className="space-y-2 text-gray-300 ml-4">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                helped organize{" "}<img
  alt="YRHacks Logo"
  className="inline w-4 h-4 mr-1"
  src="https://www.yrhacks.ca/_next/static/media/logo.3aecaa9f.svg"
/>
                <a href="https://yrhacks.ca/" className="underline" target="_blank" rel="noopener noreferrer">
                  YRHacks
                </a>
                , Canada's largest high school hackathon
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Tutored a second year university student Python and CS principles
              </span>
              </li>
              <li>
              <span className="mr-2">•</span>
              <span>
                Conceptualized and designed <img
  alt="Bo!nk Logo"
  className="inline w-4 h-4 mr-1"
  src="https://is1-ssl.mzstatic.com/image/thumb/Purple115/v4/35/fe/3a/35fe3a98-71fa-7e9a-9d34-584b90cac389/AppIcon-0-0-1x_U007emarketing-0-0-0-5-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/460x0w.webp"
/><a href="https://apps.apple.com/ca/app/bo-nk/id1570376501" className="underline" target="_blank" rel="noopener noreferrer">
                  Bo!nk
                </a>, a Windows Vista-inspired inkball game published on the App Store
              </span>
            </li>
          </ul>
        </section>

        {/* Projects */}
        <section className="space-y-4">
          <h2 className="text-xl">Currently working on...</h2>
          <div className="text-gray-300 ml-4">
            <span className="mr-2">•</span>
            <a
              href="https://www.futureforward.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300 transition-colors"
            >
              future forward
            </a>
            {" - non-profit focusing on helping students discover their vocations"}
          </div>
        </section>

        {/* Chatbot Section */}
        <section className="space-y-4">
          <h2 className="text-xl">What else do you want to know about me?</h2>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              {/* Suggested Questions */}
              {messages.length === 0 && (
                <div className="mb-4">
                  <div className="text-gray-500 text-sm mb-3">
                    Ask me detailed questions about Richard's specific roles and experiences:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="text-sm font-semibold">{message.role === "user" ? "You:" : "Richard:"}</div>
                    <div className="text-gray-300 whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))}
                {isLoading && <div className="text-gray-500 text-sm">Richard is thinking...</div>}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about specific roles, like 'What did you do at CoCo?'"
                  className="flex-1 bg-gray-800 border-gray-600 text-green-400 placeholder-gray-500"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
        <br />
        <span>
                I'd love to hear from you! Want to hire me? or simply wanna chat? Feel free to reach out by 
                {" "}<a href="mailto:richardli0@outlook.com" class="text-stone-400 underline hover:text-stone-100 font-minecraft inline-block transform transition-transform duration-200 hover:scale-110">email</a>
                , or connect with me on <a href="https://www.linkedin.com/in/richardli0" class="text-stone-400 underline hover:text-stone-100 font-minecraft inline-block transform transition-transform duration-200 hover:scale-110">LinkedIn</a>.
        </span>
      </main>
    </div>
  )
}

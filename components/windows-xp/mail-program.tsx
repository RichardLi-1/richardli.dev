"use client"
import { useState } from "react"
import type React from "react"

import {
  Send,
  Paperclip,
  Check,
  SpellCheckIcon as Spell,
  FocusIcon as Priority,
  Shield,
  Lock,
  Wifi,
} from "lucide-react"

export function MailProgram() {
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    subject: "",
    message: "",
  })
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSend = async () => {
    setIsSending(true)
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSent(true)
    setIsSending(false)

    // Reset after 3 seconds
    setTimeout(() => {
      setSent(false)
      setFormData({ to: "", cc: "", subject: "", message: "" })
    }, 3000)
  }

  if (sent) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
          <p className="text-gray-600">Your message has been delivered successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSend}
            disabled={isSending || !formData.to || !formData.subject}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
          <div className="w-px h-6 bg-gray-300" />
          <button className="p-1 hover:bg-gray-200 rounded" title="Cut">
            <span className="text-sm">✂️</span>
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Copy">
            <span className="text-sm">📋</span>
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Paste">
            <span className="text-sm">📄</span>
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Undo">
            <span className="text-sm">↶</span>
          </button>
          <div className="w-px h-6 bg-gray-300" />
          <button className="p-1 hover:bg-gray-200 rounded" title="Check">
            <Check className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Spelling">
            <Spell className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Attach">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Priority">
            <Priority className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Sign">
            <Shield className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Encrypt">
            <Lock className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded" title="Offline">
            <Wifi className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Form */}
      <div className="flex-1 p-4 space-y-3">
        {/* To Field */}
        <div className="flex items-center space-x-2">
          <label className="w-12 text-sm font-bold text-gray-700">To:</label>
          <input
            type="email"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="r575li@uwaterloo.ca"
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* CC Field */}
        <div className="flex items-center space-x-2">
          <label className="w-12 text-sm font-bold text-gray-700">Cc:</label>
          <input
            type="email"
            name="cc"
            value={formData.cc}
            onChange={handleChange}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Subject Field */}
        <div className="flex items-center space-x-2">
          <label className="w-12 text-sm font-bold text-gray-700">Subject:</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Let's work together!"
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col">
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Hi Richard,&#10;&#10;I'd love to discuss a project with you...&#10;&#10;Best regards"
            className="flex-1 min-h-48 p-3 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-1 text-xs text-gray-600">
        {isSending ? "Sending message..." : "Ready"}
      </div>
    </div>
  )
}

// The chat conversation, shared by the chat window (inside the header, which
// remounts on every page) and the agent orb (in the root layout, which never
// unmounts). Saved to sessionStorage, so it survives page changes and refreshes
// for the rest of this tab's visit.
//
// A tiny store instead of React state/context: the two components live in
// different trees, and the conversation has to outlive either one.
// useSyncExternalStore is React's built-in way to subscribe to data like this.
// 📖 Learn: useSyncExternalStore — https://react.dev/reference/react/useSyncExternalStore
import { useSyncExternalStore } from "react"
import type { AgentAction } from "@/lib/agent"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  actions?: AgentAction[] // what the bot did on the page (agent mode)
  hidden?: boolean // sent by the site, not the visitor (e.g. "carry on the tour"); not shown
}

type Listener = () => void

/** A value + its listeners, saved under `key` in the given storage. */
function createStore<T>(key: string, storage: () => Storage, fallback: T) {
  let value: T | null = null // loaded lazily: storage doesn't exist on the server
  const listeners = new Set<Listener>()

  const get = (): T => {
    if (typeof window === "undefined") return fallback
    if (value === null) {
      try {
        const saved = storage().getItem(key)
        value = saved ? (JSON.parse(saved) as T) : fallback
      } catch {
        value = fallback // storage blocked (private mode) or bad JSON
      }
    }
    return value
  }

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next
    try {
      storage().setItem(key, JSON.stringify(value))
    } catch {
      // Not saved; it still works for this page
    }
    listeners.forEach((listener) => listener())
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  // getServerSnapshot returns the fallback, so the server-rendered HTML and the
  // first client render match; React then switches to the saved value.
  const use = () => [useSyncExternalStore(subscribe, get, () => fallback), set] as const

  return { get, set, use }
}

const NO_MESSAGES: ChatMessage[] = []
const messagesStore = createStore("chat_messages", () => sessionStorage, NO_MESSAGES)
export const getMessages = messagesStore.get
export const setMessages = messagesStore.set
/** Same shape as useState: [messages, setMessages] */
export const useChatMessages = messagesStore.use

// "Let Richard drive" (experimental agent mode). localStorage: stays on across visits.
const agentModeStore = createStore("chat_agent_mode", () => localStorage, false)
export const getAgentMode = agentModeStore.get
export const useAgentMode = agentModeStore.use

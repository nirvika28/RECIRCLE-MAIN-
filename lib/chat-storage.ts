"use client"

import { authService } from "./auth-service"

export type Message = {
  id: string
  withId: string
  withName: string
  at: number
  from: "me" | "them"
  text: string
}

const LOCAL_KEY = "recircle:chats"

export function loadChats(): Record<string, Message[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Message[]>) : {}
  } catch {
    return {}
  }
}

export function saveChats(chats: Record<string, Message[]>) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_KEY, JSON.stringify(chats))
}

export function ensureConversation(withId: string, withName: string) {
  const chats = loadChats()
  if (!chats[withId]) {
    chats[withId] = []
    saveChats(chats)
  }
  return chats
}

/**
 * Send a message to the backend with auth token
 * Fallback: store locally if backend fails
 */
export async function sendMessage(withId: string, withName: string, text: string) {
  const msg: Message = {
    id: crypto.randomUUID(),
    withId,
    withName,
    at: Date.now(),
    from: "me",
    text,
  }

  // Save locally for instant display
  const chats = ensureConversation(withId, withName)
  chats[withId] = chats[withId] ? [...chats[withId], msg] : [msg]
  saveChats(chats)

  // Send to backend
  const token = authService.getToken()
  if (!token) {
    console.warn("No token found, message only stored locally")
    return msg
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ withId, withName, text }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error("Failed to send message:", err.message)
    }
  } catch (error) {
    console.error("Error sending message to backend:", error)
  }

  return msg
}

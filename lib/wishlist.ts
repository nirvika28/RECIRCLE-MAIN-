"use client"

const KEY = "recircle:wishlist"

export function loadWishlist(): Set<number> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as number[]) : []
    return new Set(arr)
  } catch {
    return new Set()
  }
}

export function saveWishlist(s: Set<number>) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify([...s]))
}

export function toggleWishlist(id: number): Set<number> {
  const set = loadWishlist()
  if (set.has(id)) set.delete(id)
  else set.add(id)
  saveWishlist(set)
  return set
}

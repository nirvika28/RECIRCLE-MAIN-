"use client"

export type UserProfile = {
  displayName: string
  email?: string
  city?: string
  state?: string
  ecoCoins: number
  communityRank: number
  totalRecycled: number
  co2Saved: number
  activeStreak: number
  isNewUser: boolean
  createdAt: string
}

const KEY = "recircle:user"

export function loadUser(): UserProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveUser(u: UserProfile) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(u))
}

export function createNewUser(userData: {
  displayName: string
  email: string
  city: string
  state: string
}): UserProfile {
  const newUser: UserProfile = {
    displayName: userData.displayName,
    email: userData.email,
    city: userData.city,
    state: userData.state,
    ecoCoins: 0,
    communityRank: 0,
    totalRecycled: 0,
    co2Saved: 0,
    activeStreak: 0,
    isNewUser: true,
    createdAt: new Date().toISOString()
  }
  saveUser(newUser)
  return newUser
}

export function updateUser(patch: Partial<UserProfile>) {
  const u = loadUser()
  if (!u) return null
  const next = { ...u, ...patch }
  saveUser(next)
  return next
}

export function isAuthenticated(): boolean {
  return loadUser() !== null
}

export function logout() {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}

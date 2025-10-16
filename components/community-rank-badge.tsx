"use client"

import { Award } from "lucide-react"

export function CommunityRankBadge({ rank = 12 }: { rank?: number }) {
  // Simple color cue: Top 10 = gold, else green
  const isTop10 = rank <= 10
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isTop10 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
      }`}
      aria-label={`Community rank ${rank}`}
    >
      <Award className="h-3.5 w-3.5" />
      Rank #{rank}
    </span>
  )
}

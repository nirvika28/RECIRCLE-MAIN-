"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    user: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "PS",
    },
    action: "recycled 5.2 kg of paper",
    time: "2 hours ago",
    type: "recycling",
  },
  {
    id: 2,
    user: {
      name: "Arjun Nair",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AN",
    },
    action: "organized a community cleanup",
    time: "Yesterday",
    type: "event",
  },
  {
    id: 3,
    user: {
      name: "Aisha Khan",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AK",
    },
    action: "shared a guide on composting",
    time: "2 days ago",
    type: "education",
  },
  {
    id: 4,
    user: {
      name: "Rohan Gupta",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "RG",
    },
    action: "reached 100kg recycling milestone",
    time: "3 days ago",
    type: "achievement",
  },
  {
    id: 5,
    user: {
      name: "Meera Iyer",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MI",
    },
    action: "joined the Bengaluru cluster",
    time: "4 days ago",
    type: "community",
  },
]

export function CommunityActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3">
          <Avatar>
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{activity.user.name}</p>
              <Badge
                variant="outline"
                className={`
                  ${activity.type === "recycling" ? "border-green-200 bg-green-50 text-green-700" : ""}
                  ${activity.type === "event" ? "border-blue-200 bg-blue-50 text-blue-700" : ""}
                  ${activity.type === "education" ? "border-purple-200 bg-purple-50 text-purple-700" : ""}
                  ${activity.type === "achievement" ? "border-amber-200 bg-amber-50 text-amber-700" : ""}
                  ${activity.type === "community" ? "border-pink-200 bg-pink-50 text-pink-700" : ""}
                `}
              >
                {activity.type}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{activity.action}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

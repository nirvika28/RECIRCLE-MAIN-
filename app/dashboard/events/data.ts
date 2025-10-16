export type EventItem = {
  id: number
  title: string
  cover: string
  date: string
  where: string
  description: string
  paid: boolean
  fee?: number
}

export const events: EventItem[] = [
  {
    id: 1,
    title: "Cubbon Park Cleanup",
    cover: "/riverside-cleanup-volunteers.jpg",
    date: "Sat, 26 Oct • 9:00 AM",
    where: "Cubbon Park, Bengaluru",
    description: "Join the neighborhood cleanup followed by chai at the bandstand.",
    paid: false,
  },
  {
    id: 2,
    title: "Repair Café Indiranagar",
    cover: "/repair-cafe-tools.jpg",
    date: "Sun, 27 Oct • 11:00 AM",
    where: "Indiranagar Makerspace, Bengaluru",
    description: "Bring your appliances and learn to fix them with volunteer experts.",
    paid: true,
    fee: 199,
  },
  {
    id: 3,
    title: "Zero-Waste Workshop — Jayanagar",
    cover: "/zero-waste-workshop.jpg",
    date: "Sat, 2 Nov • 10:00 AM",
    where: "Jayanagar Community Hall, Bengaluru",
    description: "Hands-on session on segregation and composting for Bengaluru households.",
    paid: true,
    fee: 299,
  },
]

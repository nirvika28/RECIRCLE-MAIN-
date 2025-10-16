"use client"

import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Leaf, Recycle, Search, Share2, Users, Info, Plus, Coins, CheckCircle, Heart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ShareDialog } from "@/components/share-dialog"
import { cn } from "@/lib/utils"
import { authService } from "@/lib/auth-service"

type Status = "active" | "completed"
type Material = "all" | "plastic" | "organic" | "ewaste" | "metal" | "glass"
type Category = "Environment" | "Infrastructure" | "Education"

type Project = {
  id: number
  title: string
  shortDesc: string
  longDesc: string
  category: Category
  material: Exclude<Material, "all">
  status: Status
  goalKg: number
  collectedKg: number
  participants: number
  daysLeft?: number
  image: string
  requirements: string[]
}

type DatabaseProject = {
  id: string
  title: string
  description: string
  category: string
  goalAmount: number
  currentAmount: number
  status: string
  creatorName: string
  imageUrl?: string
  deadline?: string
  createdAt: string
  totalPledges: number
  totalAmount: number
  progressPercentage: number
  pledgeTypes: Record<string, number>
}

type ProjectPledge = {
  id: string
  projectId: string
  projectTitle: string
  pledgeAmount: number
  pledgeType: 'vote' | 'donation' | 'volunteer'
  message?: string
  status: string
  createdAt: string
}

const seed: Project[] = [
  {
    id: 1,
    title: "Community Rainwater Filter",
    shortDesc: "Install a community rainwater harvesting and filtration system for the neighborhood park.",
    longDesc:
      "Durable, low-maintenance rainwater collection and filtration unit to provide clean water for park irrigation.",
    category: "Environment",
    material: "plastic",
    status: "active",
    goalKg: 40,
    collectedKg: 26,
    participants: 23,
    daysLeft: 15,
    image: "/close-up-of-rainwater-filter-pipe.jpg",
    requirements: ["Collect PET bottles", "Assist weekend installation", "Spread awareness"],
  },
  {
    id: 2,
    title: "Community Compost Bins",
    shortDesc: "Install community composting bins to reduce organic waste and create fertilizer.",
    longDesc:
      "Aerated bins with signage and weekly volunteers for turning and collection. Compost shared with gardens.",
    category: "Environment",
    material: "organic",
    status: "completed",
    goalKg: 30,
    collectedKg: 30,
    participants: 47,
    image: "/volunteers-with-large-compost-bins.jpg",
    requirements: ["Bring kitchen scraps (no meat/dairy)", "Volunteer weekly", "Help onboard households"],
  },
]

export default function UpcyclePlusPage() {
  const [projects, setProjects] = useState<Project[]>(seed)
  const [dbProjects, setDbProjects] = useState<DatabaseProject[]>([])
  const [userPledges, setUserPledges] = useState<ProjectPledge[]>([])
  const [category, setCategory] = useState<Category | "All">("Environment")
  const [status, setStatus] = useState<"All" | "Active" | "Completed">("All")
  const [material, setMaterial] = useState<Material>("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Project | null>(null)
  const [pledgeKg, setPledgeKg] = useState<number>(0)
  const [openShare, setOpenShare] = useState(false)
  const [userCoins, setUserCoins] = useState(0)
  const [loading, setLoading] = useState(false)

  // Pledge dialog
  const [openPledge, setOpenPledge] = useState(false)
  const [selectedProject, setSelectedProject] = useState<DatabaseProject | null>(null)
  const [pledgeAmount, setPledgeAmount] = useState<number>(0)
  const [pledgeType, setPledgeType] = useState<'vote' | 'donation' | 'volunteer'>('vote')
  const [pledgeMessage, setPledgeMessage] = useState('')

  // Create Project dialog
  const [openCreate, setOpenCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newMat, setNewMat] = useState<Exclude<Material, "all">>("plastic")
  const [newGoal, setNewGoal] = useState<number>(20)

  const [origin, setOrigin] = useState("")
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin)
    loadDatabaseProjects()
    loadUserPledges()
    loadUserCoins()
  }, [])

  const loadDatabaseProjects = async () => {
    try {
      console.log('Loading database projects...')
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        console.log('Projects loaded:', data.projects?.length || 0)
        setDbProjects(data.projects || [])
      } else {
        console.error('Failed to load projects:', response.status)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadUserPledges = async () => {
    try {
      const token = authService.getToken()
      if (!token) return

      console.log('Loading user pledges...')
      const response = await fetch('/api/projects/pledge', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User pledges loaded:', data.pledges?.length || 0)
        setUserPledges(data.pledges || [])
      } else {
        console.error('Failed to load user pledges:', response.status)
      }
    } catch (error) {
      console.error('Error loading user pledges:', error)
    }
  }

  const loadUserCoins = async () => {
    try {
      const user = await authService.getProfile()
      setUserCoins(user.ecoCoins || 0)
    } catch (error) {
      console.error('Error loading user coins:', error)
    }
  }

  const handlePledge = async () => {
    if (!selectedProject || pledgeAmount <= 0) return

    setLoading(true)
    try {
      const token = authService.getToken()
      if (!token) {
        alert('Please log in to pledge to projects')
        return
      }

      const response = await fetch('/api/projects/pledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          pledgeAmount,
          pledgeType,
          message: pledgeMessage || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create pledge')
      }

      alert(`Successfully pledged to ${selectedProject.title}!`)
      setOpenPledge(false)
      setSelectedProject(null)
      setPledgeAmount(0)
      setPledgeMessage('')
      
      // Refresh data
      await Promise.all([loadDatabaseProjects(), loadUserPledges(), loadUserCoins()])

    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const openPledgeDialog = (project: DatabaseProject) => {
    setSelectedProject(project)
    setPledgeAmount(0)
    setPledgeType('vote')
    setPledgeMessage('')
    setOpenPledge(true)
  }

  const isUserPledged = (projectId: string) => {
    return userPledges.some(pledge => pledge.projectId === projectId && pledge.status === 'active')
  }

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const categoryOk = category === "All" ? true : p.category === category
      const statusOk = status === "All" ? true : status === "Active" ? p.status === "active" : p.status === "completed"
      const materialOk = material === "all" ? true : p.material === material
      const queryOk =
        query.trim().length === 0
          ? true
          : [p.title, p.shortDesc, p.longDesc].join(" ").toLowerCase().includes(query.toLowerCase())
      return categoryOk && statusOk && materialOk && queryOk
    })
  }, [projects, category, status, material, query])

  function pct(p: Project) {
    return Math.min(100, Math.round((p.collectedKg / p.goalKg) * 100))
  }

  function participate(project: Project) {
    setSelected(project)
  }

  async function confirmPledge() {
    if (!selected) return
    const delta = Math.max(0, Math.round(pledgeKg))
    if (delta === 0) return

    try {
      const token = authService.getToken()
      if (!token) {
        alert('Please log in to pledge to projects')
        return
      }

      setLoading(true)

      // Update UI state first
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selected.id
            ? {
                ...p,
                collectedKg: Math.min(p.goalKg, p.collectedKg + delta),
                participants: p.participants + 1,
                status: p.collectedKg + delta >= p.goalKg ? "completed" : p.status,
              }
            : p,
        ),
      )

      // For featured projects, we need to create a database project entry first
      // Let's try to find if there's already a corresponding database project
      const existingDbProject = dbProjects.find(dbP => 
        dbP.title === selected.title && 
        dbP.description === selected.longDesc
      )

      if (existingDbProject) {
        // If we found a matching database project, save the pledge there
        try {
          const pledgeResponse = await fetch('/api/projects/pledge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              projectId: existingDbProject.id,
              pledgeAmount: delta,
              pledgeType: 'volunteer',
              message: `Pledged ${delta}kg of ${selected.material} to ${selected.title}`
            })
          })

          if (pledgeResponse.ok) {
            // Refresh data to show updated progress and pledges
            await Promise.all([loadDatabaseProjects(), loadUserPledges()])
            alert(`Successfully pledged ${delta}kg to ${selected.title}!`)
          } else {
            const errorData = await pledgeResponse.json()
            alert(`Pledge recorded locally but couldn't save to database: ${errorData.message || 'Unknown error'}`)
          }
        } catch (error) {
          console.error('Error saving pledge to database:', error)
          alert(`Pledge recorded locally but couldn't save to database. Please try again later.`)
        }
      } else {
        // For now, just update UI and show that the pledge is recorded locally
        // In a full implementation, you'd want to create the database project first
        console.log('Featured project not found in database, pledge recorded in UI only')
        alert(`Successfully pledged ${delta}kg to ${selected.title}! (Note: This is a featured project - pledge is recorded locally)`)
      }

      setPledgeKg(0)
      setSelected(null)
    } catch (error) {
      console.error('Error making pledge:', error)
      alert('Failed to make pledge. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = selected ? `${origin}/dashboard/projects#project-${selected.id}` : `${origin}/dashboard/projects`

  function createProject() {
    const id = Math.max(0, ...projects.map((p) => p.id)) + 1
    const proj: Project = {
      id,
      title: newTitle || "Untitled Project",
      shortDesc: newDesc || "Community-driven sustainability effort.",
      longDesc: newDesc || "Help us make this upgrade happen together.",
      category: "Environment",
      material: newMat,
      status: "active",
      goalKg: Math.max(1, Math.round(newGoal)),
      collectedKg: 0,
      participants: 0,
      daysLeft: 30,
      image:
        newMat === "organic" ? "/volunteers-with-large-compost-bins.jpg" : "/close-up-of-rainwater-filter-pipe.jpg",
      requirements: ["Contribute materials", "Share with neighbors", "Join weekend build"],
    }
    setProjects((prev) => [proj, ...prev])
    setOpenCreate(false)
    setNewTitle("")
    setNewDesc("")
    setNewGoal(20)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community Projects</h1>
            <p className="text-sm text-muted-foreground">
              Help fund community upgrades by contributing recyclable materials.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            
            <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto" onClick={() => setOpenCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 md:grid-cols-5">
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select onValueChange={(v) => setCategory(v as any)} defaultValue={category}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select onValueChange={(v) => setStatus(v as any)} defaultValue={status}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Projects</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">Material Needed</Label>
            <Select onValueChange={(v) => setMaterial(v as any)} defaultValue={material}>
              <SelectTrigger>
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                <SelectItem value="plastic">Plastic</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="ewaste">E-waste</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="glass">Glass</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Database Projects Section */}
        {dbProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Community Projects</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">{userCoins} eco coins</span>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {dbProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={project.imageUrl?.startsWith('/') ? project.imageUrl : (project.imageUrl?.startsWith('http') ? project.imageUrl : "/placeholder.svg")}
                      alt={project.title} 
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute left-3 top-3">
                      <Badge className="rounded-full px-2 py-1 bg-green-600">
                        {project.status.toUpperCase()}
                      </Badge>
                    </div>
                    {isUserPledged(project.id) && (
                      <div className="absolute right-3 top-3">
                        <Badge className="rounded-full px-2 py-1 bg-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          PLEDGED
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-green-600" />
                      {project.title}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progressPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={project.progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{project.currentAmount} / {project.goalAmount} coins</span>
                        <span>{project.totalPledges} pledges</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">by {project.creatorName}</span>
                      <span className="capitalize">{project.category}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => openPledgeDialog(project)}
                      disabled={isUserPledged(project.id) || project.status !== 'active'}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {isUserPledged(project.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already Pledged
                        </>
                      ) : project.status !== 'active' ? (
                        'Project Inactive'
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Pledge Support
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Original Projects Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} id={`project-${p.id}`} className="overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={p.image?.startsWith('/') ? p.image : (p.image || "/placeholder.svg")} 
                  alt={p.title} 
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute left-3 top-3">
                  <Badge
                    className={cn("rounded-full px-2 py-1", p.status === "active" ? "bg-green-600" : "bg-gray-500")}
                  >
                    {p.status === "active" ? "ACTIVE" : "COMPLETED"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {p.material === "organic" ? (
                    <Leaf className="h-5 w-5 text-green-600" />
                  ) : (
                    <Recycle className="h-5 w-5 text-green-600" />
                  )}
                  {p.title}
                </CardTitle>
                <CardDescription className="mt-1">{p.shortDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md bg-green-50 p-2 text-sm">
                  <span className="font-medium">Goal:</span> {p.goalKg}kg of {label(p.material)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.collectedKg}kg collected</span>
                    <span className="text-muted-foreground">
                      {p.collectedKg >= p.goalKg ? "Goal achieved" : `${p.goalKg - p.collectedKg}kg remaining`}
                    </span>
                  </div>
                  <Progress value={pct(p)} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{p.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{p.status === "completed" ? "Completed" : `${p.daysLeft ?? 0} days left`}</span>
                  </div>
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent sm:flex-none"
                    onClick={() => setOpenShare(true)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none"
                    onClick={() => participate(p)}
                  >
                    Participate
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          </div>
        </div>

        {/* User Pledge History */}
        {userPledges.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Pledges</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {userPledges.map((pledge) => (
                <Card key={pledge.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{pledge.projectTitle}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={pledge.pledgeType === 'donation' ? 'default' : 'secondary'}>
                          {pledge.pledgeType.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {pledge.pledgeAmount} {pledge.pledgeType === 'donation' ? 'coins' : 'points'}
                        </span>
                      </div>
                      {pledge.message && (
                        <p className="text-sm text-muted-foreground italic">"{pledge.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(pledge.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {pledge.status === 'active' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{pledge.status}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Participate Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] w-[min(100vw-2rem,720px)] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Project Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.image || "/placeholder.svg"}
                    alt={selected.title}
                    className="h-40 w-full rounded-md object-cover"
                  />
                  <Badge className={selected.status === "active" ? "bg-green-600" : "bg-gray-500"}>
                    {selected.status === "active" ? "ACTIVE" : "COMPLETED"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">{selected.title}</h3>
                  <p className="text-sm text-muted-foreground">{selected.longDesc}</p>
                  <div className="rounded-md bg-green-50 p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">
                        Goal: {selected.goalKg}kg {label(selected.material)}
                      </span>
                      <span className="text-xs">{pct(selected)}%</span>
                    </div>
                    <Progress value={pct(selected)} className="h-2" />
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span>{selected.collectedKg}kg collected</span>
                      <span>
                        {selected.collectedKg >= selected.goalKg
                          ? "Goal reached"
                          : `${selected.goalKg - selected.collectedKg}kg remaining`}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Requirements</Label>
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                      {selected.requirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pledge">Contribute now (kg)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pledge"
                        type="number"
                        min={0}
                        placeholder="e.g. 5"
                        value={Number.isNaN(pledgeKg) ? "" : pledgeKg}
                        onChange={(e) => setPledgeKg(Number(e.target.value))}
                      />
                      <Button className="bg-green-600 hover:bg-green-700" onClick={confirmPledge}>
                        Pledge
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog
        open={openShare}
        onOpenChange={setOpenShare}
        title={selected?.title ?? "Community Project"}
        url={shareUrl}
      />

      {/* Create Project Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="w-[min(100vw-2rem,640px)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Project title" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short description" />
            </div>
            <div className="grid gap-2">
              <Label>Material</Label>
              <Select value={newMat} onValueChange={(v) => setNewMat(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="ewaste">E-waste</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Goal (kg)</Label>
              <Input type="number" min={1} value={newGoal} onChange={(e) => setNewGoal(Number(e.target.value))} />
            </div>
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700" onClick={createProject}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pledge Dialog */}
      <Dialog open={openPledge} onOpenChange={setOpenPledge}>
        <DialogContent className="w-[min(100vw-2rem,640px)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pledge to Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800">{selectedProject.title}</h3>
                <p className="text-sm text-green-700 mt-1">{selectedProject.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                  <span>Goal: {selectedProject.goalAmount} coins</span>
                  <span>Current: {selectedProject.currentAmount} coins</span>
                </div>
                <div className="mt-2">
                  <Progress value={selectedProject.progressPercentage} className="h-2" />
                  <span className="text-xs text-green-600">{selectedProject.progressPercentage.toFixed(1)}% funded</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pledgeType">Pledge Type</Label>
                  <Select value={pledgeType} onValueChange={(value: 'vote' | 'donation' | 'volunteer') => setPledgeType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vote">Vote (Free)</SelectItem>
                      <SelectItem value="donation">Donation (Eco Coins)</SelectItem>
                      <SelectItem value="volunteer">Volunteer (Free)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pledgeType === 'donation' && (
                  <div>
                    <Label htmlFor="pledgeAmount">Donation Amount (Eco Coins)</Label>
                    <Input
                      id="pledgeAmount"
                      type="number"
                      min="1"
                      max={userCoins}
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(Number(e.target.value))}
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your balance: {userCoins} eco coins
                    </p>
                  </div>
                )}

                {(pledgeType === 'vote' || pledgeType === 'volunteer') && (
                  <div>
                    <Label htmlFor="pledgeAmount">Pledge Amount (Symbolic)</Label>
                    <Input
                      id="pledgeAmount"
                      type="number"
                      min="1"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(Number(e.target.value))}
                      placeholder="Enter symbolic amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This is a symbolic amount for tracking purposes
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="pledgeMessage">Message (Optional)</Label>
                  <Textarea
                    id="pledgeMessage"
                    value={pledgeMessage}
                    onChange={(e) => setPledgeMessage(e.target.value)}
                    placeholder="Add a message with your pledge..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenPledge(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePledge}
                  disabled={loading || (pledgeType === 'donation' && (pledgeAmount <= 0 || pledgeAmount > userCoins))}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Pledging...' : 'Make Pledge'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function label(m: Exclude<Material, "all">) {
  switch (m) {
    case "plastic":
      return "plastic bottles"
    case "organic":
      return "organic waste"
    case "ewaste":
      return "e-waste"
    case "glass":
      return "glass"
    case "metal":
      return "metal"
  }
}

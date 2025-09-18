"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  TreePine,
  Users,
  Calendar,
  MapPin,
  Search,
  Star,
  Heart,
  Share2,
  ArrowRight,
  X,
  Phone,
  Mail,
  ExternalLink,
  Leaf,
  Building,
  Award,
  User,
} from "lucide-react"
import { checkAuthStatus } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

// Converted from TypeScript: removed interfaces

export default function ExploreEventsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [userId, setUserId] = useState(null)
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedOrganizer, setSelectedOrganizer] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [selectedTime, setSelectedTime] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const [joinLoading, setJoinLoading] = useState(false)
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [participatedEvents, setParticipatedEvents] = useState([])
  const [participatedLoading, setParticipatedLoading] = useState(false)
  const [participatedError, setParticipatedError] = useState(null)

  const toAbsoluteImageUrl = (url) => {
    if (!url) return "/community-tree-planting.png"
    if (url.startsWith("http")) return url
    const path = url.startsWith("/") ? url : `/${url}`
    return `http://localhost:8000${path}`
  }

  const isUpcoming = (date, time) => {
    const eventDateTime = new Date(`${date}T${time}`)
    if (isNaN(eventDateTime.getTime())) return false
    return eventDateTime >= new Date()
  }

  const mapAPIEventToEvent = (apiEvent) => {
    const getOrganizerType = (name) => {
      const lowerName = name.toLowerCase()
      if (lowerName.includes("ngo") || lowerName.includes("society") || lowerName.includes("foundation")) return "NGO"
      if (lowerName.includes("government") || lowerName.includes("department") || lowerName.includes("ministry")) return "Government"
      if (lowerName.includes("school") || lowerName.includes("college") || lowerName.includes("university") || lowerName.includes("education"))
        return "Educational"
      if (lowerName.includes("corp") || lowerName.includes("ltd") || lowerName.includes("inc") || lowerName.includes("company")) return "Corporate"
      return "NGO" // default
    }

    const organizerType = getOrganizerType(apiEvent.organizer_details.name)

    return {
      id: apiEvent.id.toString(),
      title: apiEvent.event_name,
      date: apiEvent.date,
      time: apiEvent.time,
      city: apiEvent.city,
      address: apiEvent.location,
      participants: apiEvent.participants,
      capacity: apiEvent.max_capacity,
      organizer: apiEvent.organizer_details.name,
      organizerType,
      description: apiEvent.description,
      plantationDetails: {
        treeTypes: apiEvent.trees.length > 0 ? apiEvent.trees : ["Native Trees", "Fruit Trees", "Shade Trees"],
        targetTrees: apiEvent.target,
        area: "2.0 acres",
      },
      contact: {
        phone: apiEvent.organizer_details.org_mobile || "",
        email: apiEvent.organizer_details.org_email || "",
      },
      mapLink: `https://maps.google.com/?q=${encodeURIComponent(apiEvent.location + ", " + apiEvent.city)}`,
      image: toAbsoluteImageUrl(apiEvent.event_picture),
      featured: Math.random() > 0.7,
      organizerDetails: {
        name: apiEvent.organizer_details.name,
        bio: apiEvent.organizer_details.bio,
        treesPlanted: apiEvent.organizer_details.trees_planted,
        eventsHosted: apiEvent.organizer_details.event_hosted,
        rating: 4.5,
        joinedDate: "January 2023",
        avatar: toAbsoluteImageUrl(apiEvent.organizer_details.org_picture),
      },
    }
  }

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (cityFilter) params.append("city", cityFilter)
      if (selectedTime !== "all") params.append("time_slot", selectedTime)

      const url = `http://localhost:8000/event/participant/events/?${params.toString()}`

      const response = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
        throw new Error(errorMsg)
      }

      const data = await response.json()
      const mappedEvents = data.results.map(mapAPIEventToEvent)

      // Exclude events user already participated in
      const nonParticipatedEvents = mappedEvents.filter(
        (event) => !event.participants.includes(userId)
      )

      // Exclude past events
      const upcomingEvents = nonParticipatedEvents.filter((event) =>
        isUpcoming(event.date, event.time)
      )

      setEvents(upcomingEvents)
      setFilteredEvents(upcomingEvents)
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch events")
      setEvents([])
      setFilteredEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipatedEvents = async () => {
    setParticipatedLoading(true)
    setParticipatedError(null)
    try {
      const response = await fetch("http://localhost:8000/event/participated", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
        throw new Error(errorMsg)
      }
      const data = await response.json()
      // Map according to the provided structure
      const mappedEvents = data.map((apiEvent) => {
        const getOrganizerType = (name) => {
          const lowerName = name.toLowerCase()
          if (lowerName.includes("ngo") || lowerName.includes("society") || lowerName.includes("foundation")) return "NGO"
          if (lowerName.includes("government") || lowerName.includes("department") || lowerName.includes("ministry")) return "Government"
          if (lowerName.includes("school") || lowerName.includes("college") || lowerName.includes("university") || lowerName.includes("education")) return "Educational"
          if (lowerName.includes("corp") || lowerName.includes("ltd") || lowerName.includes("inc") || lowerName.includes("company")) return "Corporate"
          return "NGO"
        }
        const organizerType = getOrganizerType(apiEvent.organizer_details.name)
        return {
          id: apiEvent.id.toString(),
          title: apiEvent.event_name,
          date: apiEvent.date,
          time: apiEvent.time,
          city: apiEvent.city,
          address: apiEvent.location,
          participants: apiEvent.participants, // Assigning directly as string[]
          capacity: apiEvent.max_capacity,
          organizer: apiEvent.organizer_details.name,
          organizerType,
          description: apiEvent.description,
          plantationDetails: {
            treeTypes: apiEvent.trees.length > 0 ? apiEvent.trees : ["Native Trees", "Fruit Trees", "Shade Trees"],
            targetTrees: apiEvent.target,
            area: "2.0 acres",
          },
          contact: {
            phone: apiEvent.organizer_details.org_mobile || "",
            email: apiEvent.organizer_details.org_email || "",
          },
          mapLink: `https://maps.google.com/?q=${encodeURIComponent(apiEvent.location + ", " + apiEvent.city)}`,
          image: toAbsoluteImageUrl(apiEvent.event_picture),
          featured: false,
          organizerDetails: {
            name: apiEvent.organizer_details.name,
            bio: apiEvent.organizer_details.bio,
            treesPlanted: apiEvent.organizer_details.trees_planted,
            eventsHosted: apiEvent.organizer_details.event_hosted || 0,
            rating: 4.5,
            joinedDate: "January 2023",
            avatar: toAbsoluteImageUrl(apiEvent.organizer_details.org_picture),
          },
        }
      })
      setParticipatedEvents(mappedEvents)
    } catch (err) {
      setParticipatedError(err instanceof Error ? err.message : "Failed to fetch participated events")
      setParticipatedEvents([])
    } finally {
      setParticipatedLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus()
        if (!authStatus.isAuthenticated) {
          router.push("/login")
          return
        }
        setIsAuthenticated(true)
        if (authStatus.user) {
          setUserId(authStatus.user.id.toString()) // Set user ID from auth status
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
        return
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    setMounted(true)
    fetchEvents()
  }, [])

  useEffect(() => {
    if (mounted && userId) {
      fetchEvents()
    }
  }, [searchQuery, cityFilter, selectedTime, mounted, userId])

  useEffect(() => {
    if (activeTab === "participated") {
      fetchParticipatedEvents()
    }
  }, [activeTab])

  const getOrganizerIcon = (type) => {
    switch (type) {
      case "NGO":
        return <Heart className="w-4 h-4" />
      case "Government":
        return <Building className="w-4 h-4" />
      case "Educational":
        return <TreePine className="w-4 h-4" />
      case "Corporate":
        return <Building className="w-4 h-4" />
      default:
        return <TreePine className="w-4 h-4" />
    }
  }

  const getOrganizerColor = (type) => {
    switch (type) {
      case "NGO":
        return "from-pink-500 to-rose-500"
      case "Government":
        return "from-blue-500 to-indigo-500"
      case "Educational":
        return "from-emerald-500 to-teal-500"
      case "Corporate":
        return "from-purple-500 to-violet-500"
      default:
        return "from-emerald-500 to-teal-500"
    }
  }

  if (!mounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleJoinEvent = async (eventId) => {
    setJoinLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/event/join/${eventId}`, {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) {
        let errorMsg = `Failed to join event: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
        return
      }
      toast({ title: "Joined event!", description: "You have successfully joined the event." })
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
      setFilteredEvents((prevFilteredEvents) =>
        prevFilteredEvents.filter((event) => event.id !== eventId)
      )
      fetchParticipatedEvents()
      setShowJoinConfirm(false)
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Failed to join event.", variant: "destructive" })
    } finally {
      setJoinLoading(false)
    }
  }

  const EventCard = ({ event }) => (
    <Card
      key={event.id}
      className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:from-emerald-400/40 hover:to-cyan-400/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/25 cursor-pointer"
      onClick={() => setSelectedEvent(event)}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3 relative overflow-hidden rounded-l-lg">
            <img
              src={event.image || "/community-tree-planting.png"}
              alt={event.title}
              className="w-full h-64 lg:h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                const target = e.target
                if (target && target.tagName === 'IMG') target.src = "/community-tree-planting.png"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            {event.featured && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 bg-gradient-to-r ${getOrganizerColor(
                  event.organizerType
                )} text-white text-xs font-medium rounded-full flex items-center`}
              >
                {getOrganizerIcon(event.organizerType)}
                <span className="ml-1">{event.organizerType}</span>
              </span>
            </div>
          </div>
          <div className="lg:w-2/3 p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300 mb-2">
                  {event.title}
                </h3>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-slate-300 mb-6 line-clamp-2 group-hover:text-slate-200 transition-colors">{event.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center text-slate-300">
                  <Calendar className="w-5 h-5 mr-3 text-emerald-400" />
                  <span>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                </div>
                <div className="flex items-center text-slate-300">
                  <MapPin className="w-5 h-5 mr-3 text-emerald-400" />
                  <span>{event.city}</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Users className="w-5 h-5 mr-3 text-emerald-400" />
                  <span>
                    {event.participants.length}/{event.capacity} participants
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-slate-300">
                  <TreePine className="w-5 h-5 mr-3 text-emerald-400" />
                  <span>{event.plantationDetails.targetTrees} trees planned</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Leaf className="w-5 h-5 mr-3 text-emerald-400" />
                  <span>{event.plantationDetails.area} area</span>
                </div>
                <div
                  className="flex items-center text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedOrganizer(event)
                  }}
                >
                  <Building className="w-5 h-5 mr-3 text-emerald-400" />
                  <span className="underline decoration-emerald-400/50 hover:decoration-emerald-400">{event.organizer}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {event.plantationDetails.treeTypes.slice(0, 3).map((tree, index) => (
                  <span key={index} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                    {tree}
                  </span>
                ))}
                {event.plantationDetails.treeTypes.length > 3 && (
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                    +{event.plantationDetails.treeTypes.length - 3} more
                  </span>
                )}
              </div>
              <Button className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white">
                View Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const LoadingState = () => (
    <div className="text-center py-20">
      <div className="relative mb-8">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-16 bg-gradient-to-t from-amber-700 to-amber-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full animate-ping opacity-75"></div>
            <div
              className="absolute top-2 left-2 w-16 h-16 bg-gradient-to-br from-emerald-300 to-green-500 rounded-full animate-ping opacity-75"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-emerald-200 to-green-400 rounded-full animate-ping opacity-75"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce opacity-60 ml-4" style={{ animationDelay: "0.8s" }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce opacity-60 -ml-2" style={{ animationDelay: "1.4s" }}></div>
          </div>
        </div>
        <div className="absolute top-4 left-8">
          <TreePine className="w-6 h-6 text-emerald-400 animate-bounce opacity-60" style={{ animationDelay: "0.3s" }} />
        </div>
        <div className="absolute top-8 right-12">
          <TreePine className="w-4 h-4 text-green-400 animate-bounce opacity-60" style={{ animationDelay: "0.7s" }} />
        </div>
        <div className="absolute bottom-4 left-12">
          <TreePine className="w-5 h-5 text-teal-400 animate-bounce opacity-60" style={{ animationDelay: "1.1s" }} />
        </div>
        <div className="absolute bottom-8 right-8">
          <TreePine className="w-3 h-3 text-cyan-400 animate-bounce opacity-60" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
          Growing Green Events...
        </h3>
        <p className="text-slate-400 text-lg">Planting seeds of community</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
      <div className="w-64 h-2 bg-slate-700 rounded-full mx-auto mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Explore Events
              </span>
            </h1>
            <p className="text-xl md:text-2xl bg-gradient-to-r from-slate-300 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
              Discover amazing tree plantation events near you
            </p>
          </div>

          <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-md rounded-2xl p-8 border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <Input
                  placeholder="Search events, cities, or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-12 rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <Input
                  placeholder="Enter city name..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="pl-12 bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-12 rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                />
              </div>
              <div>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="bg-white/10 border-emerald-400/30 text-white h-12 rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300">
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-emerald-400/30 rounded-xl">
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="noon">Noon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "all" ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" : "bg-slate-800 text-slate-300"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Events
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "participated" ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" : "bg-slate-800 text-slate-300"
            }`}
            onClick={() => setActiveTab("participated")}
          >
            Participated Events
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-6">
          {activeTab === "all" ? (
            loading ? (
              <LoadingState />
            ) : error ? (
              <div className="text-center py-20">
                <TreePine className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Error: {error}</h3>
                <p className="text-slate-400 mb-6">Failed to fetch events. Please try again later.</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setCityFilter("")
                    setSelectedTime("all")
                    fetchEvents()
                  }}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white"
                >
                  Retry
                </Button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-20">
                <TreePine className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
                <p className="text-slate-400 mb-6">Try adjusting your search criteria or filters</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setCityFilter("")
                    setSelectedTime("all")
                  }}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
            )
          ) : (
            participatedLoading ? (
                <LoadingState />
              ) : participatedError ? (
                <div className="text-center py-20">
                  <TreePine className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Error: {participatedError}</h3>
                  <p className="text-slate-400 mb-6">Failed to fetch your participated events.</p>
                  <Button
                    onClick={fetchParticipatedEvents}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white"
                  >
                    Retry
                  </Button>
                </div>
              ) : participatedEvents.length === 0 ? (
                <div className="text-center py-20">
                  <TreePine className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Participated Events</h3>
                  <p className="text-slate-400">You haven't joined any events yet. Go explore!</p>
                </div>
              ) : (
                participatedEvents.map((event) => <EventCard key={event.id} event={event} />)
              )
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-emerald-400/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {selectedEvent.title}
                </h2>
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedEvent.image || "/community-tree-planting.png"}
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                    onError={(e) => {
                      const target = e.target
                      if (target && target.tagName === 'IMG') target.src = "/community-tree-planting.png"
                    }}
                  />
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">
                        {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">{selectedEvent.address}</div>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">
                        {selectedEvent.participants.length}/{selectedEvent.capacity} participants
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-3 text-emerald-400" />
                      <div>
                        <div
                          className="text-white font-medium hover:text-emerald-400 cursor-pointer transition-colors duration-300 underline decoration-emerald-400/50 hover:decoration-emerald-400"
                          onClick={() => setSelectedOrganizer(selectedEvent)}
                        >
                          {selectedEvent.organizer}
                        </div>
                        <div className="text-slate-400">{selectedEvent.organizerType}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Plantation Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <TreePine className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">Target: {selectedEvent.plantationDetails.targetTrees} trees</div>
                    </div>
                    <div className="flex items-center">
                      <Leaf className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">Area: {selectedEvent.plantationDetails.area}</div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Tree Types:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.plantationDetails.treeTypes.map((tree, index) => (
                          <Badge key={index} variant="outline" className="border-emerald-400/30 text-emerald-300">
                            {tree}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4 mt-8">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">{selectedEvent.contact.phone}</div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-emerald-400" />
                      <div className="text-white">{selectedEvent.contact.email}</div>
                    </div>
                    {selectedEvent.mapLink && (
                      <div className="flex items-center">
                        <ExternalLink className="w-5 h-5 mr-3 text-emerald-400" />
                        <a
                          href={selectedEvent.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">About This Event</h3>
                <p className="text-slate-300 leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center space-x-4">
   
                </div>
                <div className="flex space-x-4">
                  {selectedEvent.mapLink && (
                    <Button
                      variant="outline"
                      className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                      onClick={() => window.open(selectedEvent.mapLink, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  )}
                  {activeTab === "all" && (
                    <Button
                      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white"
                      onClick={() => setShowJoinConfirm(true)}
                      disabled={joinLoading}
                    >
                      {joinLoading ? "Joining..." : "Join Event"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showJoinConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 rounded-xl p-8 max-w-sm w-full text-center border border-emerald-400/30">
            <h3 className="text-xl font-bold mb-4 text-white">Confirm Join</h3>
            <p className="text-slate-300 mb-6">Are you sure you want to join this event?</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleJoinEvent(selectedEvent?.id || "")}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                disabled={joinLoading}
              >
                {joinLoading ? "Joining..." : "Yes, Join"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJoinConfirm(false)}
                className="border-slate-600 text-slate-400 hover:bg-slate-700"
                disabled={joinLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Organizer Profile Modal */}
      {selectedOrganizer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-400/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Organizer Profile
                </h2>
                <Button
                  onClick={() => setSelectedOrganizer(null)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                {selectedOrganizer.organizerDetails.avatar ? (
                  <img
                    src={selectedOrganizer.organizerDetails.avatar}
                    alt={selectedOrganizer.organizerDetails.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400/40"
                    onError={(e) => {
                      const target = e.target
                      if (target && target.style) target.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedOrganizer.organizerDetails.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedOrganizer.organizerDetails.name}</h3>
                  <div className="flex items-center space-x-4 mb-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
                      {selectedOrganizer.organizerType}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-400/20 text-center">
                  <TreePine className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {selectedOrganizer.organizerDetails.treesPlanted.toLocaleString()}
                  </div>
                  <div className="text-slate-400">Trees Planted</div>
                </div>
                <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-teal-400/20 text-center">
                  <Calendar className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {selectedOrganizer.organizerDetails.eventsHosted}
                  </div>
                  <div className="text-slate-400">Events Hosted</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="w-6 h-6 mr-3 text-emerald-400" />
                  About
                </h3>
                <p className="text-slate-300 leading-relaxed">{selectedOrganizer.organizerDetails.bio}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </div>
                <Button
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white"
                  onClick={() => {
                    setSelectedOrganizer(null)
                    setSelectedEvent(selectedOrganizer)
                  }}
                >
                  View Event Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
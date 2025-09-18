"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Leaf, MapPin, TreePine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Converted from TypeScript: removed types

export default function RecommendPlantsPage() {
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState("recommendations") // "recommendations" or "common"

  const [currentPage, setCurrentPage] = useState(1)

  const { toast } = useToast()

  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Common plants data
  const commonPlants = [
    {
      "name": "Banyan Tree (Ficus benghalensis)",
      "description": "The national tree of India, known for its vast canopy and aerial roots. It symbolizes longevity and shelter.",
      "image": "/banyan.jpg"
    },
    {
      "name": "Tulsi (Holy Basil)",
      "description": "A sacred herb in India, known for its medicinal and spiritual value. Commonly used in Ayurveda and worship.",
      "image": "/tulsi.jpg"
    },
    {
      "name": "Neem (Azadirachta indica)",
      "description": "A medicinal tree with antibacterial and antifungal properties. Widely used in Ayurveda and traditional remedies.",
      "image": "/neem.jpg"
    },
    {
      "name": "Aloe Vera",
      "description": "A succulent with thick, fleshy leaves containing soothing gel. Widely used for skincare and home remedies.",
      "image": "/alovera.jpg"
    },
    {
      "name": "Peepal (Ficus religiosa)",
      "description": "A sacred tree in Hinduism and Buddhism. Known for producing oxygen even at night and symbolizing spirituality.",
      "image": "/peepal.jpg"
    },
    {
      "name": "Money Plant (Pothos)",
      "description": "A fast-growing indoor vine believed to bring prosperity. Also acts as a natural air purifier.",
      "image": "/moneyplant.jpg"
    },
    {
      "name": "Mango (Mangifera indica)",
      "description": "The 'king of fruits' tree native to India. Its fruits are loved worldwide, and its leaves are used in rituals.",
      "image": "/mango.jpg"
    },
    {
      "name": "Curry Leaf Plant",
      "description": "An aromatic plant whose leaves are essential in Indian cooking. Also valued for its medicinal benefits.",
      "image": "/curryleaf.jpg"
    },
    {
      "name": "Jamun (Syzygium cumini)",
      "description": "A fruit-bearing tree valued for its sweet-sour purple fruits. Its seeds and bark are used in traditional medicine.",
      "image": "/jamun.jpg"
    },
    {
      "name": "Hibiscus",
      "description": "A flowering shrub with large colorful blooms. Used in hair care, worship, and as an ornamental plant.",
      "image": "/hibiscus.jpg"
    },
    {
      "name": "Gulmohar (Delonix regia)",
      "description": "A striking ornamental tree with bright red-orange flowers. Often planted along roadsides and gardens for shade and beauty.",
      "image": "/gulmahor.jpg"
    },
    {
      "name": "Marigold",
      "description": "A hardy plant with bright yellow-orange flowers. Commonly used in decorations and religious ceremonies.",
      "image": "/marigold.jpg"
    },
    {
      "name": "Indian Gooseberry / Amla (Phyllanthus emblica)",
      "description": "A small deciduous tree producing vitamin C-rich fruits. Widely used in Ayurveda, hair care, and health tonics.",
      "image": "/amla.jpg"
    },
    {
      "name": "Peace Lily",
      "description": "An elegant indoor plant with white blooms. Known for improving indoor air quality and thriving in low light.",
      "image": "/peacelily.jpg"
    },
    {
      "name": "Snake Plant",
      "description": "A resilient plant with upright sword-like leaves. Produces oxygen at night and removes toxins from air.",
      "image": "/snakeplant.jpg"
    },
    {
      "name": "Lemongrass",
      "description": "A tall, lemon-scented grass used in teas and cooking. Also acts as a natural mosquito repellent.",
      "image": "/lemongrass.jpg"
    }
  ]

  const totalPages = useMemo(() => {
    const count = data?.recommendations?.length || 0
    if (count === 0) return 0
    if (count <= 12) return 1
    if (count <= 24) return 2
    return 3
  }, [data])

  const pagedRecommendations = useMemo(() => {
    const list = data?.recommendations || []
    const count = list.length
    if (count === 0) return []

    let start = 0
    let size = 12
    if (currentPage === 1) {
      start = 0
      size = Math.min(12, count)
    } else if (currentPage === 2) {
      start = 12
      size = Math.min(12, Math.max(0, count - 12))
    } else {
      start = 24
      size = Math.max(0, count - 24) // typically 6 for 30 items
    }
    return list.slice(start, start + size)
  }, [data, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [data?.location])

  const submit = async () => {
    const trimmed = location.trim()
    if (!trimmed) {
      setError("Please enter a location.")
      toast({ title: "Location required", description: "Enter a city/area to get recommendations.", variant: "destructive" })
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8000/recommendation/recommend-plants/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: trimmed }),
      })

      if (!response.ok) {
        let message = `Request failed (${response.status})`
        try {
          const err = await response.json()
          message = err?.message || message
        } catch {}
        throw new Error(message)
      }

      const payload = await response.json()
      setData(payload)
    } catch (e) {
      const message = e?.message || "Something went wrong."
      setError(message)
      toast({ title: "Could not fetch recommendations", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      submit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {/* Header Section */}
      <div className="relative pt-24 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Plant & Tree Recommendations
              </span>
            </h1>
            <p className="text-slate-300 mt-2">Get the best plants for your environment by entering a location.</p>
          </div>

          <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="e.g., Maninagar, India"
                    className="bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-stretch">
                <Button onClick={submit} disabled={loading} className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600">
                  <Leaf className="w-4 h-4 mr-2" />
                  {loading ? "Fetching..." : "Get Recommendations"}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-3 text-red-400 text-sm">{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Section */}
      {loading && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 border border-emerald-400/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <TreePine className="w-5 h-5 text-emerald-400 animate-pulse" />
                Fetching tree-friendly picks...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {(data || activeTab === "common") && !loading && (
        <div className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Tab Navigation */}
            <div className="flex justify-center">
              <div className="bg-white/10 border border-emerald-400/20 rounded-xl p-1 backdrop-blur-md">
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === "recommendations"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Location-Based
                </button>
                <button
                  onClick={() => setActiveTab("common")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === "common"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Common Plants
                </button>
              </div>
            </div>

            {/* Location Results Card - Only show when activeTab is recommendations and data exists */}
            {activeTab === "recommendations" && data && (
              <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Results for {data.location}</CardTitle>
                  <CardDescription className="text-slate-300">
                    <span className="mr-4">Lat: {data.latitude.toFixed(4)}</span>
                    <span className="mr-4">Lng: {data.longitude.toFixed(4)}</span>
                    <span className="mr-4">Temp: {data.environment.temperature.toFixed(1)}°C</span>
                    <span className="mr-4">Rainfall: {Math.round(data.environment.rainfall)} mm</span>
                    <span>pH: {data.environment.ph}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeTab === "recommendations" ? (
                // Show location-based recommendations
                pagedRecommendations.map((rec, idx) => (
                  <Card
                    key={`${rec.name}-${idx}`}
                    className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelected(rec)
                      setDetailsOpen(true)
                    }}
                  >
                    <CardHeader className="p-0">
                      <div className="w-full h-44 bg-black/40 rounded-t-xl overflow-hidden flex items-center justify-center">
                        {/* Using a regular img to avoid adding next/image dependency setup */}
                        <img
                          src={rec.image_url && rec.image_url.startsWith("http") ? rec.image_url : "/placeholder.jpg"}
                          alt={rec.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target
                            if (target && target.tagName === 'IMG') target.src = "/placeholder.jpg"
                          }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{rec.name}</h3>
                        <span className="text-emerald-300 text-sm">{rec.match_percent.toFixed(1)}%</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-5">
                        {rec.summary || "No description available."}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Show common plants
                commonPlants.map((plant, idx) => (
                  <Card
                    key={`${plant.name}-${idx}`}
                    className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelected(plant)
                      setDetailsOpen(true)
                    }}
                  >
                    <CardHeader className="p-0">
                      <div className="w-full h-44 bg-black/40 rounded-t-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target
                            if (target && target.tagName === 'IMG') target.src = "/placeholder.jpg"
                          }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4">
                      <h3 className="text-lg font-semibold text-white">{plant.name}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-5">
                        {plant.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination - Only show for recommendations */}
            {activeTab === "recommendations" && totalPages > 1 && (
              <Pagination className="mt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)) }} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(page) }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)) }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-emerald-400/30 text-white">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  <span>{selected.name}</span>
                  {activeTab === "recommendations" && selected.match_percent && (
                    <span className="text-emerald-300 text-sm">{selected.match_percent.toFixed(1)}% match</span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  {activeTab === "recommendations" 
                    ? `Suggested plant for ${data?.location}`
                    : "Common plant information"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="w-full h-56 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20">
                  <img
                    src={selected.image_url && selected.image_url.startsWith("http") ? selected.image_url : "/placeholder.jpg"}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target
                      if (target && target.tagName === 'IMG') target.src = "/placeholder.jpg"
                    }}
                  />
                </div>
                <div className="space-y-3">
                  {activeTab === "recommendations" && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="text-slate-300 text-sm">
                        <span className="text-slate-400">Location:</span> {data?.location}
                      </div>
                      <div className="text-slate-300 text-sm mt-1">
                        <span className="text-slate-400">Match:</span> {selected.match_percent?.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  <div className="text-slate-200 text-sm leading-relaxed">
                    {activeTab === "recommendations" 
                      ? (selected.summary || "No description available.")
                      : (selected.description || "No description available.")
                    }
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}




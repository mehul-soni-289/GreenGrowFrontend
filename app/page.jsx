"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  TreePine,
  Users,
  Calendar,
  Leaf,
  ArrowRight,
  Play,
  MapPin,
  Clock,
  Star,
  Sparkles,
  ChevronDown,
  
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    { number: "Grow", label: "", icon: TreePine },
    { number: "Green", label: "", icon: Users },
    { number: "Grow", label: "", icon: Calendar },
    { number: "Tomorrow", label: "", icon: Leaf },
  ]

  const features = [
    {
      title: "Join Plantation Events",
      description: "Connect with NGOs and government organizations hosting tree plantation drives in your area.",
      image: "/community-tree-planting.png",
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Plant Species Guide",
      description: "Learn about different plant species, their benefits, and which ones thrive in your climate.",
      image: "/urban-forest-planting.png",
      icon: Leaf,
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      title: "Smart Planting Tips",
      description: "Get AI-powered suggestions for the best plants and trees based on your location and preferences.",
      image: "/smart-planting-app.png",
      icon: Sparkles,
      gradient: "from-green-500 to-emerald-500",
    },
  ]

  const events = [
    {
      title: "Urban Forest Initiative",
      date: "Dec 15, 2024",
      time: "9:00 AM",
      location: "Central Park, Mumbai",
      participants: 156,
      organizer: "Green Mumbai NGO",
      image: "/urban-forest-planting.png",
      type: "NGO Event",
    },
    {
      title: "Coastal Mangrove Restoration",
      date: "Dec 22, 2024",
      time: "7:00 AM",
      location: "Marine Drive, Chennai",
      participants: 89,
      organizer: "Govt. of Tamil Nadu",
      image: "/botanical-guide.png",
      type: "Government",
    },
    {
      title: "School Green Campus Drive",
      date: "Jan 5, 2025",
      time: "10:00 AM",
      location: "Delhi University",
      participants: 234,
      organizer: "EcoYouth Foundation",
      image: "/modern-botanical-ai-lab.png",
      type: "Educational",
    },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">

      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Additional floating orbs */}
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-teal-400/5 to-cyan-400/5 rounded-full blur-2xl animate-float delay-3000"></div>
      </div>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Enhanced gradient background */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent via-teal-900/10 to-cyan-900/20 animate-gradient"></div> */}

        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-float ${
                i % 3 === 0
                  ? "w-3 h-3 bg-emerald-400/40"
                  : i % 3 === 1
                    ? "w-2 h-2 bg-teal-400/30"
                    : "w-1 h-1 bg-cyan-400/50"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <span className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-sm border border-gradient-to-r from-emerald-400/30 to-cyan-400/30 text-xs sm:text-sm font-medium animate-pulse shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-400" />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Join the Green Revolution
              </span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent animate-fade-in relative">
            <span className="relative inline-block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Plant Today,
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-lg animate-pulse"></div>
            </span>
            <br />
            <span className="relative inline-block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Breathe Tomorrow
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 blur-xl animate-pulse delay-1000"></div>
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 animate-fade-in-delay px-4">
            <span className="bg-gradient-to-r from-slate-200 via-emerald-100 to-teal-100 bg-clip-text text-transparent">
              Join the revolution of sustainable living and make a
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent font-semibold">
              real impact on our planet
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
            <Link href="/explore-events">
              <Button
                size="lg"
                className="w-full sm:w-auto group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 transform hover:scale-105 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center">
                  Explore Events
                  <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
    
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-400/30 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-24 relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Go Green
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-slate-300 via-emerald-200 to-teal-200 bg-clip-text text-transparent max-w-4xl mx-auto">
              Discover, learn, and participate in the green revolution with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            <Card className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:from-emerald-400/40 hover:to-cyan-400/40 transition-all duration-700 hover:-translate-y-6 hover:shadow-2xl hover:shadow-emerald-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-teal-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 sm:p-8 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg animate-glow mx-auto">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300">
                  Join Events
                </h3>
                <p className="text-slate-300 mb-4 sm:mb-6 group-hover:text-slate-200 transition-colors text-base sm:text-lg leading-relaxed">
                  Connect with NGOs and government organizations hosting tree plantation drives in your area.
                </p>
                <Link href="/explore-events">
                  <Button
                    variant="outline"
                    className="border-gradient-to-r from-emerald-500/50 to-cyan-500/50 text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-400 bg-transparent group-hover:scale-105 transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      Explore Events
                    </span>
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform text-emerald-400" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:from-emerald-400/40 hover:to-cyan-400/40 transition-all duration-700 hover:-translate-y-6 hover:shadow-2xl hover:shadow-emerald-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-teal-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 sm:p-8 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg animate-glow mx-auto">
                  <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300">
                  Leaf Disease Detection
                </h3> 
                <p className="text-slate-300 mb-4 sm:mb-6 group-hover:text-slate-200 transition-colors text-base sm:text-lg leading-relaxed">
                  Detect diseases in your plants and get recommendations for treatment.
                </p>
                  <Link href="/disease-detection">
                  <Button
                    variant="outline"
                    className="border-gradient-to-r from-emerald-500/50 to-cyan-500/50 text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-400 bg-transparent group-hover:scale-105 transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      Detect Diseases
                    </span>
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform text-emerald-400" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:from-emerald-400/40 hover:to-cyan-400/40 transition-all duration-700 hover:-translate-y-6 hover:shadow-2xl hover:shadow-emerald-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-teal-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 sm:p-8 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg animate-glow mx-auto">
                  <TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300">
                  Talk with Your Tree
                </h3>
                <p className="text-slate-300 mb-4 sm:mb-6 group-hover:text-slate-200 transition-colors text-base sm:text-lg leading-relaxed">
                  Have interactive conversations with your planted trees using AI and learn about their growth and care.
                </p>
                <Link href="/talk-with-tree">
                  <Button
                    variant="outline"
                    className="border-gradient-to-r from-emerald-500/50 to-cyan-500/50 text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-400 bg-transparent group-hover:scale-105 transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      Start Talking
                    </span>
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform text-emerald-400" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:from-emerald-400/40 hover:to-cyan-400/40 transition-all duration-700 hover:-translate-y-6 hover:shadow-2xl hover:shadow-emerald-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-teal-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 sm:p-8 text-center relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg animate-glow mx-auto">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300">
                  Plant Recommendations
                </h3>
                <p className="text-slate-300 mb-4 sm:mb-6 group-hover:text-slate-200 transition-colors text-base sm:text-lg leading-relaxed">
                  Get AI-powered suggestions for the best plants and trees based on your location and climate
                  conditions.
                </p>
                <Link href="/recommend-plants">
                <Button
                  variant="outline"
                  className="border-gradient-to-r from-emerald-500/50 to-cyan-500/50 text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 px-4 sm:px-6 py-2 sm:py-3 bg-transparent"
                >
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Get Recommendations
                  </span>
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform text-emerald-400" />
                </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="events" className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Upcoming Plantation
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                Events
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-slate-300 via-emerald-200 to-teal-200 bg-clip-text text-transparent max-w-4xl mx-auto">
              Join hands with NGOs and government organizations in making our planet greener
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-12 sm:mb-16">
            {events.map((event, index) => (
              <Card
                key={index}
                className="group bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:from-emerald-400/40 hover:to-cyan-400/40 transition-all duration-700 hover:-translate-y-6 hover:rotate-1 hover:shadow-2xl hover:shadow-emerald-500/30 relative overflow-hidden"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-125 transition-transform duration-700"
                  />
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                    <span className="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-emerald-400/50 shadow-lg">
                      {event.type}
                    </span>
                  </div>
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-4 sm:py-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center text-white text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent font-semibold">
                        {event.participants}
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8 relative z-10">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300">
                    {event.title}
                  </h3>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-base sm:text-lg">{event.date}</span>
                    </div>
                    <div className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-base sm:text-lg">{event.time}</span>
                    </div>
                    <div className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-base sm:text-lg">{event.location}</span>
                    </div>
                    <div className="flex items-center text-slate-300 group-hover:text-slate-200 transition-colors">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-base sm:text-lg">{event.participants} participants</span>
                    </div>
                  </div>

                  <div className="text-slate-400 mb-4 sm:mb-6 group-hover:text-slate-300 transition-colors text-base sm:text-lg">
                    <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                      Organized by {event.organizer}
                    </span>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 py-2 sm:py-3 text-base sm:text-lg">
                    Join Event
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/explore-events">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gradient-to-r from-emerald-500/50 to-cyan-500/50 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 px-8 sm:px-10 py-3 sm:py-4 bg-transparent text-lg sm:text-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Discover All Events
                </span>
                <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

 

      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 sm:mb-8">
            <span className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-gradient-to-r from-emerald-400/30 to-cyan-500/30 text-base sm:text-lg font-medium animate-pulse shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-400" />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Ready to Make a Real Impact?
              </span>
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
              Start Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Green Journey Today
            </span>
          </h2>

          <p className="text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 max-w-3xl mx-auto">
            <span className="bg-gradient-to-r from-slate-300 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
              Join thousands of environmental enthusiasts making a difference. Plant trees, learn about nature, and
              build a sustainable future together.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
            <Button
              size="lg"
              className="w-full sm:w-auto group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-10 sm:px-12 py-5 sm:py-6 text-xl sm:text-2xl shadow-2xl hover:shadow-emerald-500/40 transition-all duration-500 transform hover:scale-110 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                Join Now - It's Free
                <ArrowRight className="ml-3 w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto group border-2 border-gradient-to-r from-emerald-400/50 to-cyan-500/50 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 px-10 sm:px-12 py-5 sm:py-6 text-xl sm:text-2xl bg-transparent hover:border-emerald-400 transition-all duration-500 transform hover:scale-110"
            >
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Learn More
              </span>
            </Button>
          </div>

    
        </div>
      </section>

    </div>
  )
}

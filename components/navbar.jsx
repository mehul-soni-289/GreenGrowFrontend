"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TreePine, Menu, X, User } from "lucide-react"
import { checkAuthStatus } from "@/lib/auth"

export function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, user } = await checkAuthStatus()
        setIsAuthenticated(isAuthenticated)
        setUser(user || null)
      } finally {
        setAuthReady(true)
      }
    }
    checkAuth()
  }, [])

  // Prefetch common routes to speed up navigation
  useEffect(() => {
    const routesToPrefetch = [
      "/",
      "/explore-events",
      "/organize-events",
      "/recommend-plants",
      "/disease-detection",
      "/talk-with-tree",
      "/profile",
      "/login",
      "/register",
    ]
    routesToPrefetch.forEach((path) => {
      try {
        router.prefetch(path)
      } catch {}
    })
  }, [router])

  return (
    <nav className="sticky top-0 w-full z-50 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-2xl border-b border-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link prefetch href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center animate-glow">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              GreenGrow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link prefetch href="/" className="hover:text-emerald-400 transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated && (
              <>
                <Link prefetch href="/explore-events" className="hover:text-emerald-400 transition-colors relative group">
                  Events
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link prefetch href="/organize-events" className="hover:text-emerald-400 transition-colors relative group">
                  Organize
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            )}
            <Link prefetch href="/recommend-plants" className="hover:text-emerald-400 transition-colors relative group">
              Recommendations
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link prefetch href="/disease-detection" className="hover:text-emerald-400 transition-colors relative group">
              Disease Detection
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link prefetch href="/talk-with-tree" className="hover:text-emerald-400 transition-colors relative group">
              Talk with Tree
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>

          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!authReady ? null : isAuthenticated ? (
              <>
                <Link prefetch href="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gradient-to-r from-emerald-400/30 to-teal-400/30 text-white hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 bg-transparent transition-all duration-300"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user?.username || "Profile"}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link prefetch href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gradient-to-r from-emerald-400/30 to-teal-400/30 text-white hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 bg-transparent transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link prefetch href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                  >
                    Join Revolution
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-emerald-500/10 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-black/30 via-black/40 to-black/30 backdrop-blur-xl border-t border-emerald-500/20 rounded-b-2xl mx-4 mb-4">
            <div className="px-6 py-6 space-y-4">
              <Link
                prefetch
                href="/"
                className="block px-4 py-3 text-white hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    prefetch
                    href="/explore-events"
                    className="block px-4 py-3 text-white hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Events
                  </Link>
                  <Link
                    prefetch
                    href="/organize-events"
                    className="block px-4 py-3 text-white hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Organize
                  </Link>
                </>
              )}
              <Link
                prefetch
                href="/recommend-plants"
                className="block px-4 py-3 text-white hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Recommendations
              </Link>
              <Link
                prefetch
                href="/disease-detection"
                className="block px-4 py-3 text-white hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Disease Detection
              </Link>
              <Link
                prefetch
                href="/talk-with-tree"
                className="block px-4 py-3 text-white hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Talk with Tree
              </Link>
  
              <div className="flex flex-col space-y-3 pt-4 border-t border-emerald-500/20">
                {!authReady ? null : isAuthenticated ? (
                  <>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-400/30 text-white hover:bg-emerald-500/10 bg-transparent py-3 text-lg"
                      >
                        <User className="w-5 h-5 mr-2" />
                        {user?.username || "Profile"}
                      </Button>
                    </Link>

                  </>
                ) : (
                  <>
                    <Link prefetch href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-400/30 text-white hover:bg-emerald-500/10 bg-transparent py-3 text-lg"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link prefetch href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 text-lg">
                        Join Revolution
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

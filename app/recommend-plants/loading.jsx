import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center">
            <div className="h-10 bg-white/10 rounded-2xl animate-pulse mb-3" />
            <div className="h-5 bg-white/5 rounded-xl animate-pulse max-w-2xl mx-auto" />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="h-44 bg-white/5 rounded-xl animate-pulse mb-4" />
                <div className="h-5 bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-4 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}





import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      <Navbar />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-16 bg-white/10 rounded-2xl animate-pulse mb-4" />
            <div className="h-8 bg-white/5 rounded-xl animate-pulse max-w-2xl mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="h-16 bg-white/10 rounded-2xl animate-pulse" />
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

import { TreePine, Leaf, AlertTriangle } from "lucide-react"

export default function DiseaseDetectionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="relative pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Disease Detection
              </span>
            </h1>
            <p className="text-xl md:text-2xl bg-gradient-to-r from-slate-300 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
              Upload a photo of your plant's leaf to detect diseases early
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section Skeleton */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 bg-emerald-400/30 rounded mr-3 animate-pulse"></div>
                  <div className="h-8 bg-slate-700/50 rounded w-32 animate-pulse"></div>
                </div>
                
                <div className="border-2 border-dashed border-emerald-400/30 rounded-2xl p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Leaf className="w-10 h-10 text-emerald-400/50" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-700/50 rounded w-64 mx-auto animate-pulse"></div>
                      <div className="h-4 bg-slate-700/50 rounded w-48 mx-auto animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-slate-700/50 rounded w-32 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section Skeleton */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 bg-slate-700/50 rounded mr-3 animate-pulse"></div>
                  <div className="h-8 bg-slate-700/50 rounded w-40 animate-pulse"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-emerald-400/20">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-slate-700/50 rounded-full mx-auto animate-pulse"></div>
                      <div className="h-6 bg-slate-700/50 rounded w-32 mx-auto animate-pulse"></div>
                      <div className="h-8 bg-slate-700/50 rounded w-40 mx-auto animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-emerald-400/20">
                      <div className="h-6 bg-slate-700/50 rounded w-24 mb-3 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-700/50 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20">
                      <div className="h-6 bg-slate-700/50 rounded w-32 mb-3 animate-pulse"></div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4">
          <TreePine className="w-8 h-8 text-emerald-400/30 animate-bounce" style={{ animationDelay: "0s" }} />
        </div>
        <div className="absolute top-2/3 right-1/4">
          <Leaf className="w-6 h-6 text-teal-400/30 animate-bounce" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute bottom-1/3 left-1/3">
          <AlertTriangle className="w-7 h-7 text-cyan-400/30 animate-bounce" style={{ animationDelay: "1s" }} />
        </div>
      </div>
    </div>
  )
}


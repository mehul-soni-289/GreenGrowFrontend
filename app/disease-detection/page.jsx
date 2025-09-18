"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  TreePine,
  Upload,
  ImageIcon,
  Leaf,
  AlertTriangle,
  CheckCircle,
  X,
  Camera,
  FileImage,
  Info,
  Shield,
  Droplets,
  Sun,
  Wind,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const diseaseDatabase = {
  "Yellow_Leaf_Curl_Virus": {
    cause: "This disease is caused by the Tomato Yellow Leaf Curl Virus (TYLCV). It's primarily transmitted by the silverleaf whitefly when it feeds on the plant.",
    cure: "There is no cure for an infected plant; remove and destroy it immediately. Manage whitefly populations using insecticides or by introducing natural predators."
  },
  "bacterial_spot": {
    cause: "Caused by several species of Xanthomonas bacteria. The bacteria spread easily through splashing water from rain or irrigation.",
    cure: "Apply copper-based bactericides as a preventive spray. Avoid working with plants when they are wet and ensure good air circulation."
  },
  "early_blight": {
    cause: "This is caused by the fungus Alternaria solani. The fungus survives in the soil and on infected plant debris from previous seasons.",
    cure: "Treat with fungicides containing chlorothalonil or mancozeb. Practice crop rotation and mulch around the base of plants to prevent fungal spores from splashing up."
  },
  "late_blight": {
    cause: "Caused by the water mold Phytophthora infestans. It thrives and spreads rapidly in cool, moist conditions.",
    cure: "Apply preventative fungicides, especially before cool, wet weather is expected. Ensure proper spacing between plants for good airflow to keep leaves dry."
  },
  "leaf_mold": {
    cause: "This disease is caused by the fungus Passalora fulva. It is most common in greenhouses with high humidity and poor air circulation.",
    cure: "Improve ventilation to lower humidity around the plants. Apply fungicides containing copper or mancozeb, and remove lower infected leaves."
  },
  "mosaic_virus": {
    cause: "Caused by various viruses, most commonly the Tobacco Mosaic Virus (TMV) or Tomato Mosaic Virus (ToMV). It spreads through infected seeds, sap, or by insects.",
    cure: "No cure exists; infected plants must be removed and destroyed to prevent spread. Practice good sanitation by washing hands and tools between plants."
  },
  "septoria_leaf_spot": {
    cause: "This is a fungal disease caused by Septoria lycopersici. Its spores spread via splashing water and can survive on old plant debris.",
    cure: "Treat with fungicides containing chlorothalonil or copper. Remove and destroy infected leaves and avoid overhead watering."
  },
  "target_Spot": {
    cause: "Caused by the fungus Corynespora cassiicola. It is most severe during periods of warm, humid, and rainy weather.",
    cure: "Apply fungicides containing chlorothalonil or mancozeb. Prune lower branches to improve air circulation and remove infected plant debris."
  },
  "two-spotted_spider_mite": {
    cause: "This is not a disease but an infestation by the pest Tetranychus urticae. These mites thrive in hot, dry conditions, sucking cell contents from leaves.",
    cure: "Spray plants with horticultural oil or insecticidal soap, ensuring complete coverage. Introduce natural predators like ladybugs or predatory mites for biological control."
  }
}

export default function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file)
        setError(null)
        setDetectionResult(null)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result || null)
        }
        reader.readAsDataURL(file)
      } else {
        setError("Please select a valid image file")
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        })
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      setError(null)
      setDetectionResult(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result || null)
      }
      reader.readAsDataURL(file)
    } else {
      setError("Please drop a valid image file")
      toast({
        title: "Invalid file type",
        description: "Please drop an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      })
    }
  }

  const handleDetection = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    setError(null)
    setDetectionResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch('http://localhost:8000/detection/detect/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Add a small delay to make detection feel more natural
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setDetectionResult(result)
      
      toast({
        title: "Detection Complete",
        description: result.disease_detected 
          ? `Disease detected: ${result.disease_name}` 
          : "No disease detected",
        variant: result.disease_detected ? "destructive" : "default"
      })

    } catch (err) {
      console.error('Detection error:', err)
      setError(err.message || 'Failed to detect disease')
      toast({
        title: "Detection Failed",
        description: err.message || "Failed to detect disease. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setDetectionResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getDiseaseInfo = (diseaseName) => {
    return diseaseDatabase[diseaseName] || null
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-400"
    if (confidence >= 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return "bg-green-500/20 text-green-400 border-green-400/30"
    if (confidence >= 0.6) return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
    return "bg-red-500/20 text-red-400 border-red-400/30"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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
            {/* Upload Section */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Leaf className="w-6 h-6 mr-3 text-emerald-400" />
                    Upload Image
                  </h2>
                  
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      selectedImage 
                        ? 'border-emerald-400/40 bg-emerald-500/5' 
                        : 'border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/5'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg mx-auto"
                        />
                        <div className="flex justify-center space-x-3">
                          <Button
                            onClick={handleDetection}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Detecting...
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Detect Disease
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={clearImage}
                            variant="outline"
                            className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-white mb-2">
                            Drop your image here or click to browse
                          </p>
                          <p className="text-slate-400 text-sm">
                            Supports JPEG, PNG, and other image formats
                          </p>
                        </div>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {detectionResult ? (
                <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      {detectionResult.disease_detected ? (
                        <AlertTriangle className="w-6 h-6 mr-3 text-red-400" />
                      ) : (
                        <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                      )}
                      Detection Results
                    </h2>

                    <div className="space-y-6">
                      {/* Status */}
                      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-emerald-400/20">
                        {detectionResult.disease_detected ? (
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                              <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-red-400">Disease Detected</h3>
                            <Badge className={`text-lg px-4 py-2 ${getConfidenceBadge(detectionResult.confidence_level)}`}>
                              Confidence: {(detectionResult.confidence_level * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-green-400">No Disease Found</h3>
                            <p className="text-slate-300">Your plant appears to be healthy!</p>
                          </div>
                        )}
                      </div>

                      {/* Disease Details */}
                      {detectionResult.disease_detected && (
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-400/20">
                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                              <Info className="w-5 h-5 mr-2 text-red-400" />
                              Disease: {detectionResult.disease_name.replace(/_/g, ' ')}
                            </h4>
                            
                            {getDiseaseInfo(detectionResult.disease_name) ? (
                              <div className="space-y-4">
                                <div>
                                  <h5 className="text-emerald-400 font-medium mb-2 flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Cause
                                  </h5>
                                  <p className="text-slate-300 text-sm leading-relaxed">
                                    {getDiseaseInfo(detectionResult.disease_name)?.cause}
                                  </p>
                                </div>
                                
                                <div>
                                  <h5 className="text-emerald-400 font-medium mb-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Treatment
                                  </h5>
                                  <p className="text-slate-300 text-sm leading-relaxed">
                                    {getDiseaseInfo(detectionResult.disease_name)?.cure}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-400 text-sm">
                                Disease information not available in our database.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Prevention Tips */}
                      <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20">
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <Leaf className="w-5 h-5 mr-2 text-emerald-400" />
                          Prevention Tips
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center text-slate-300">
                            <Sun className="w-4 h-4 mr-2 text-emerald-400" />
                            Proper sunlight
                          </div>
                          <div className="flex items-center text-slate-300">
                            <Droplets className="w-4 h-4 mr-2 text-emerald-400" />
                            Adequate watering
                          </div>
                          <div className="flex items-center text-slate-300">
                            <Wind className="w-4 h-4 mr-2 text-emerald-400" />
                            Good air circulation
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Ready to Detect</h3>
                      <p className="text-slate-400">
                        Upload an image of your plant's leaf to start disease detection
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

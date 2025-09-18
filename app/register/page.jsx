"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Upload, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    mobile: "",
    city: "",
    password: "",
    confirmPassword: "",
    about: "",
    profilePhoto: null,
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required"
    } else if (!/^\d{6,}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Please enter a valid mobile number (min 6 digits)"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.about.trim()) {
      newErrors.about = "About is required"
    }

    if (!formData.profilePhoto) {
      newErrors.profilePhoto = "Profile picture is required"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setApiError("")

    try {
      const body = new FormData()
      body.append("username", formData.username.trim())
      body.append("password", formData.password)
      body.append("email", formData.email)
      body.append("city", formData.city.trim())
      body.append("mobile", formData.mobile.replace(/\D/g, ""))
      body.append("first_name", formData.first_name.trim())
      body.append("last_name", formData.last_name.trim())
      body.append("about", formData.about.trim())
      if (formData.profilePhoto) {
        body.append("profile_picture", formData.profilePhoto)
      }

      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        credentials: "include",
        body,
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        toast({ title: "Registration successful", description: "Your account has been created. Please sign in." })
        router.push("/login")
      } else {
        const message = data?.message || "Registration failed. Please try again."
        setApiError(message)
        toast({ title: "Registration failed", description: message, variant: "destructive" })
      }
    } catch (error) {
      const message = "Network error. Please check your connection and try again."
      setApiError(message)
      toast({ title: "Network error", description: message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    if (apiError) {
      setApiError("")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen pt-16 px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Join GreenGrow
              </h1>
              <p className="text-gray-400">Start your journey towards a greener planet</p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-2 border-emerald-400/30 mx-auto mb-4">
                    {formData.profilePhoto ? (
                      <img
                        src={URL.createObjectURL(formData.profilePhoto) || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-gray-400">Upload profile photo *</p>
                {errors.profilePhoto && <p className="text-red-400 text-sm mt-2">{errors.profilePhoto}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.first_name
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    }`}
                    placeholder="Your first name"
                  />
                  {errors.first_name && <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.last_name
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    }`}
                    placeholder="Your last name"
                  />
                  {errors.last_name && <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.username
                          ? "border-red-500 focus:ring-red-500/50"
                          : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      }`}
                      placeholder="Choose a unique username"
                    />
                  </div>
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.mobile
                          ? "border-red-500 focus:ring-red-500/50"
                          : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      }`}
                      placeholder="1234567890"
                    />
                  </div>
                  {errors.mobile && <p className="text-red-400 text-sm mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.city
                          ? "border-red-500 focus:ring-red-500/50"
                          : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      }`}
                      placeholder="Your city"
                    />
                  </div>
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">About *</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.about
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  }`}
                  placeholder="Tell us about yourself"
                />
                {errors.about && <p className="text-red-400 text-sm mt-1">{errors.about}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500/50"
                          : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500/50"
                          : "border-emerald-400/30 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-emerald-500 bg-white/5 border-emerald-400/30 rounded focus:ring-emerald-500/50 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{" "}
                    <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-red-400 text-sm mt-1">{errors.agreeToTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-emerald-500/25"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

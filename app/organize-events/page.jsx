 "use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  TreePine,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Share2,
  Mail,
  Phone,
  Upload,
  ImageIcon,
  FileText,
  Menu,
  Clock,
  Users,
  CheckCircle,
  Heart,
  User,
  CalendarIcon,
} from "lucide-react"
import Link from "next/link"

 
import { checkAuthStatus } from "@/lib/auth"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Converted from TypeScript: removed interfaces

export default function OrganizeEventsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [events, setEvents] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedTab, setSelectedTab] = useState("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [showOrgProfileModal, setShowOrgProfileModal] = useState(false)
  const [orgProfile, setOrgProfile] = useState({
    name: "",
    bio: "",
    org_mobile: "",
    org_email: "",
    org_picture: null,
    type: "NGO",
  })
  const [orgPictureFile, setOrgPictureFile] = useState(null)

  // Form state for creating/editing events
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    date: "",
    time: "",
    max_capacity: "",
    location: "",
    city: "",
    target: "",
    trees: "",
  })
  const [eventImageFile, setEventImageFile] = useState(null)

  const [formErrors, setFormErrors] = useState({})
  const [orgFormErrors, setOrgFormErrors] = useState({})

  const { toast } = useToast();
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [pendingUpdateEventId, setPendingUpdateEventId] = useState(null);
  const [viewEvent, setViewEvent] = useState(null)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [pendingCompleteEventId, setPendingCompleteEventId] = useState(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [showParticipantModal, setShowParticipantModal] = useState(false)
  const [participantLoading, setParticipantLoading] = useState(false)
  const [participantDetails, setParticipantDetails] = useState(null)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [participantsUsernames, setParticipantsUsernames] = useState([])
  const [participantsEventTitle, setParticipantsEventTitle] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pendingDeleteEventId, setPendingDeleteEventId] = useState(null)

  const toAbsoluteImageUrl = (url) => {
    if (!url) return "/placeholder.jpg"
    if (url.startsWith("http")) return url
    const path = url.startsWith("/") ? url : `/${url}`
    return `http://localhost:8000${path}`
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
    if (isAuthenticated) {
      checkOrganizerProfile()
      fetchEvents()
    }
  }, [isAuthenticated])

  const checkOrganizerProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/me/organizer", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 404) {
        // Organizer doesn't exist, show modal
        setShowOrgProfileModal(true)
      } else if (response.ok) {
        // Organizer exists, set profile data
        const profileData = await response.json()
        setOrgProfile(profileData)
      } else {
        let errorMsg = `Failed to check organizer profile: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error checking organizer profile.", variant: "destructive" })
      console.error("Error checking organizer profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:8000/event/organizer/events/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const apiEvents = await response.json()
        const transformedEvents = apiEvents.map((apiEvent) => ({
          id: apiEvent.id.toString(),
          title: apiEvent.event_name,
          date: apiEvent.date,
          time: apiEvent.time,
          city: apiEvent.city,
          address: apiEvent.location,
          participants: apiEvent.participants, // keep usernames
          capacity: apiEvent.max_capacity,
          organizer: apiEvent.organizer_details.name,
          organizerType: apiEvent.organizer_details.type,
          description: apiEvent.description,
          plantationDetails: {
            treeTypes: apiEvent.trees.map((tree) => tree.name || "Unknown"),
            targetTrees: apiEvent.target,
            area: "N/A", // Not provided in API
          },
          contact: {
            phone: apiEvent.organizer_details.org_mobile,
            email: apiEvent.organizer_details.org_email || "",
          },
          mapLink: "",
          image: toAbsoluteImageUrl(apiEvent.event_picture),
          rating: 0,
          price: 0,
          status: getEventStatus(apiEvent.date, apiEvent.time, apiEvent.is_completed === true),
          createdAt: new Date().toISOString().split("T")[0], // Not provided in API
          registrations: apiEvent.participants.length,
          targetTrees: apiEvent.target,
          area: "N/A",
        }))
        setEvents(transformedEvents)
      } else {
        let errorMsg = `Failed to fetch events: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error fetching events.", variant: "destructive" })
      console.error("Error fetching events:", error)
    }
  }

  const getEventStatus = (
    date,
    time,
    isCompletedFlag = false
  ) => {
    const eventDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const twentyFourHoursMs = 24 * 60 * 60 * 1000
    const isOlderThan24h = now.getTime() - eventDateTime.getTime() >= twentyFourHoursMs

    if (isCompletedFlag || isOlderThan24h) {
      return "Completed"
    }
    return "Published" // Assuming all events from API are published
  }

  const validateOrgProfile = () => {
    const newErrors = {}

    if (!orgProfile.name.trim()) {
      newErrors.name = "Organization name is required"
    } else if (orgProfile.name.trim().length < 3) {
      newErrors.name = "Organization name must be at least 3 characters"
    }

    if (!orgProfile.bio.trim()) {
      newErrors.bio = "Organization bio is required"
    } else if (orgProfile.bio.trim().length < 20) {
      newErrors.bio = "Bio must be at least 20 characters"
    }

    if (!orgProfile.org_mobile.trim()) {
      newErrors.org_mobile = "Mobile number is required"
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(orgProfile.org_mobile)) {
      newErrors.org_mobile = "Please enter a valid mobile number"
    }

    setOrgFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveOrgProfile = async () => {
    if (validateOrgProfile()) {
      try {
        const formData = new FormData()
        formData.append("name", orgProfile.name)
        formData.append("bio", orgProfile.bio)
        formData.append("org_mobile", orgProfile.org_mobile)
        if (orgProfile.org_email) {
          formData.append("org_email", orgProfile.org_email)
        }
        formData.append("type", orgProfile.type)

        if (orgPictureFile) {
          formData.append("org_picture", orgPictureFile)
        }

        const response = await fetch("http://localhost:8000/api/organizer/", {
          method: "POST",
          credentials: "include",
          body: formData,
        })

        if (response.ok) {
          const savedProfile = await response.json()
          setOrgProfile(savedProfile)
          setShowOrgProfileModal(false)
          setOrgPictureFile(null)
        } else {
          let errorMsg = `Failed to save organizer profile: ${response.status}`
          try {
            const err = await response.json()
            errorMsg = err.message || errorMsg
          } catch {}
          toast({ title: "Error", description: errorMsg, variant: "destructive" })
        }
      } catch (error) {
        toast({ title: "Error", description: error?.message || "Error saving organizer profile.", variant: "destructive" })
        console.error("Error saving organizer profile:", error)
      }
    }
  }

  const validateEventForm = () => {
    const newErrors = {}

    if (!formData.event_name.trim()) {
      newErrors.event_name = "Event name is required"
    } else if (formData.event_name.trim().length < 5) {
      newErrors.event_name = "Event name must be at least 5 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required"
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (!formData.date) {
      newErrors.date = "Event date is required"
    } else if (new Date(formData.date) < new Date()) {
      newErrors.date = "Event date cannot be in the past"
    }

    if (!formData.time) {
      newErrors.time = "Event time is required"
    }

    if (!formData.max_capacity) {
      newErrors.max_capacity = "Capacity is required"
    } else if (Number(formData.max_capacity) < 1) {
      newErrors.max_capacity = "Capacity must be at least 1"
    } else if (Number(formData.max_capacity) > 10000) {
      newErrors.max_capacity = "Capacity cannot exceed 10,000"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    } else if (formData.location.trim().length < 10) {
      newErrors.location = "Please provide a detailed location"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.target) {
      newErrors.target = "Target trees count is required"
    } else if (Number(formData.target) < 1) {
      newErrors.target = "Target trees must be at least 1"
    }

    if (!formData.trees.trim()) {
      newErrors.trees = "Tree types are required"
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (showOrgProfileModal || isCreating || editingEvent) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showOrgProfileModal, isCreating, editingEvent])

  const filteredEvents = events.filter((event) => {
    if (selectedTab === "all") return true
    return event.status.toLowerCase() === selectedTab
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleOrgPictureUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }
      setOrgPictureFile(file)
    }
  }

  const handleEventImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }
      setEventImageFile(file)
    }
  }

  const handleCreateEvent = async () => {
    if (!validateEventForm()) {
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("event_name", formData.event_name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("date", formData.date)
      formDataToSend.append("time", formData.time)
      formDataToSend.append("max_capacity", formData.max_capacity)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("city", formData.city)
      formDataToSend.append("target", formData.target)

      const treesArray = formData.trees.split(",").map((t) => t.trim())
    
      formDataToSend.append("trees", JSON.stringify(treesArray))
      

      if (eventImageFile) {
        formDataToSend.append("event_picture", eventImageFile)
      }

      const response = await fetch("http://localhost:8000/event/create/", {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      })

      if (response.ok) {
        await response.json()
        fetchEvents()
        setIsCreating(false)
        resetForm()
        setEventImageFile(null)
      } else {
        let errorMsg = `Provide Valid Data: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error creating event.", variant: "destructive" })
      console.error("Error creating event:", error)
    }
  }

  const handleUpdateEvent = (eventId) => {
    setPendingUpdateEventId(eventId);
    setShowUpdateConfirm(true);
  };

  const submitUpdateEvent = async () => {
    if (!pendingUpdateEventId) return;
    if (!validateEventForm()) return;
    setUpdateLoading(true);
    try {
      let body;
      let headers = { };
      let isFormData = false;
      if (eventImageFile) {
        body = new FormData();
        body.append("event_name", formData.event_name);
        body.append("description", formData.description);
        body.append("date", formData.date);
        body.append("time", formData.time);
        body.append("max_capacity", formData.max_capacity);
        body.append("location", formData.location);
        body.append("city", formData.city);
        body.append("target", formData.target);
        const treesArray = formData.trees.split(",").map((t) => t.trim());
        body.append("trees", JSON.stringify(treesArray));
        body.append("event_picture", eventImageFile);
        isFormData = true;
      } else {
        body = {
          event_name: formData.event_name,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          max_capacity: Number(formData.max_capacity),
          location: formData.location,
          city: formData.city,
          target: Number(formData.target),
          trees: formData.trees.split(",").map((t) => t.trim()),
          event_picture: null,
        };
        headers["Content-Type"] = "application/json";
      }
      const response = await fetch(`http://localhost:8000/event/organizer/events/${pendingUpdateEventId}`, {
        method: "PUT",
        credentials: "include",
        headers: isFormData ? undefined : headers,
        body: isFormData ? body : JSON.stringify(body),
      });
      if (response.ok) {
        toast({ title: "Event updated!", description: "Your event was updated successfully." });
        fetchEvents();
        setEditingEvent(null);
        resetForm();
        setEventImageFile(null);
      } else {
        let errorMsg = "Could not update the event."
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Update failed", description: errorMsg, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Update failed", description: error?.message || "An error occurred while updating the event.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
      setShowUpdateConfirm(false);
      setPendingUpdateEventId(null);
    }
  };

  const handleEditEvent = (event) => {
    setFormData({
      event_name: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      max_capacity: event.capacity.toString(),
      location: event.address,
      city: event.city,
      target: event.targetTrees.toString(),
      trees: event.plantationDetails.treeTypes.join(", "),
    })
    setEditingEvent(event.id)
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8000/event/organizer/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        setEvents((prev) => prev.filter((event) => event.id !== eventId))
        if (viewEvent?.id === eventId) setViewEvent(null)
        toast({ title: "Event deleted", description: "The event has been removed successfully." })
      } else {
        let errorMsg = `Failed to delete event: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Delete failed", description: errorMsg, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Delete failed", description: error?.message || "An error occurred while deleting the event.", variant: "destructive" })
    }
  }

  const requestDeleteEvent = (eventId) => {
    setPendingDeleteEventId(eventId)
    setShowDeleteConfirm(true)
  }

  const submitDeleteEvent = async () => {
    if (!pendingDeleteEventId) return
    setDeleteLoading(true)
    try {
      await handleDeleteEvent(pendingDeleteEventId)
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
      setPendingDeleteEventId(null)
    }
  }

  const handlePublishEvent = (eventId) => {
    // In a real implementation, you would call a publish API
    console.log(`Publishing event ${eventId}`)
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, status: "Published" } : event))
    )
  }

  const handleCompleteEvent = (eventId) => {
    setPendingCompleteEventId(eventId)
    setShowCompleteConfirm(true)
  }

  const openAttendanceDetails = async (eventId) => {
    setAttendanceLoading(true)
    setAttendanceError(null)
    setShowAttendanceModal(true)
    try {
      const response = await fetch(`http://localhost:8000/attendance/events/${eventId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        let msg = `Failed to load attendance (${response.status})`
        try {
          const err = await response.json()
          msg = err.message || msg
        } catch {}
        throw new Error(msg)
      }
      const data = await response.json()
      setAttendanceData(data)
      // Update the event card with participant counts for completed tab
      if (data && Array.isArray(data.attendance)) {
        const presentCount = data.attendance.filter((a) => a.status?.toLowerCase() === "present").length
        setEvents((prev) => prev.map((e) => (e.id === String(eventId) ? { ...e, registrations: presentCount } : e)))
      }
    } catch (e) {
      const message = e?.message || "Something went wrong."
      setAttendanceError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setAttendanceLoading(false)
    }
  }

  const openParticipantDetails = async (username) => {
    setParticipantLoading(true)
    setShowParticipantModal(true)
    try {
      const response = await fetch(`http://localhost:8000/api/participant/${username}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        let msg = `Failed to load participant (${response.status})`
        try {
          const err = await response.json()
          msg = err.message || msg
        } catch {}
        throw new Error(msg)
      }
      const data = await response.json()
      setParticipantDetails(data)
    } catch (e) {
      const message = e?.message || "Something went wrong."
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setParticipantLoading(false)
    }
  }

  const openPublishedParticipants = (event) => {
    try {
      const usernames = Array.isArray(event.participants) ? event.participants : []
      setParticipantsUsernames(usernames)
      setParticipantsEventTitle(event.title)
      setShowParticipantsModal(true)
    } catch (e) {
      toast({ title: "Error", description: "No participants to show.", variant: "destructive" })
    }
  }

  const submitCompleteEvent = async () => {
    if (!pendingCompleteEventId) return
    setCompleteLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/event/complete-event/${pendingCompleteEventId}/`, {
        method: "POST",
        credentials: "include",
      })
      if (response.ok) {
        setEvents((prev) => prev.map((e) => (e.id === pendingCompleteEventId ? { ...e, status: "Completed" } : e)))
        toast({ title: "Event completed", description: "The event has been marked as completed." })
      } else {
        let errorMsg = `Failed to complete event: ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Completion failed", description: errorMsg, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Completion failed", description: error?.message || "An error occurred while completing the event.", variant: "destructive" })
    } finally {
      setCompleteLoading(false)
      setShowCompleteConfirm(false)
      setPendingCompleteEventId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      event_name: "",
      description: "",
      date: "",
      time: "",
      max_capacity: "",
      location: "",
      city: "",
      target: "",
      trees: "",
    })
    setFormErrors({})
    setEventImageFile(null)
  }

  if (!mounted || isAuthenticated === null || loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">

      {showOrgProfileModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] border border-emerald-400/30 shadow-2xl shadow-emerald-500/10 my-4 sm:my-8 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[90vh]">
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 animate-pulse">
                  <TreePine className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                  Complete Your Organization Profile
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm lg:text-base px-2">
                  Set up your organization details to start creating events
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div>
                  <Label
                    htmlFor="orgName"
                    className="text-slate-200 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 block"
                  >
                    Organization Name *
                  </Label>
                  <Input
                    id="orgName"
                    value={orgProfile.name}
                    onChange={(e) => setOrgProfile({ ...orgProfile, name: e.target.value })}
                    className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-9 sm:h-10 lg:h-12 text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 w-full ${
                      orgFormErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    placeholder="Enter your organization name"
                  />
                  {orgFormErrors.name && <p className="text-red-400 text-xs mt-1">{orgFormErrors.name}</p>}
                </div>

                <div>
                  <Label
                    htmlFor="orgType"
                    className="text-slate-200 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 block"
                  >
                    Organization Type *
                  </Label>
                  <Select
                    value={orgProfile.type}
                    onValueChange={(value) => setOrgProfile({ ...orgProfile, type: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-emerald-400/30 text-white h-9 sm:h-10 lg:h-12 rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 text-xs sm:text-sm lg:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-emerald-400/30 rounded-lg sm:rounded-xl">
                      <SelectItem value="NGO" className="text-xs sm:text-sm">
                        NGO
                      </SelectItem>
                      <SelectItem value="Government" className="text-xs sm:text-sm">
                        Government
                      </SelectItem>
                      <SelectItem value="Educational" className="text-xs sm:text-sm">
                        Educational
                      </SelectItem>
                      <SelectItem value="Corporate" className="text-xs sm:text-sm">
                        Corporate
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="orgBio"
                    className="text-slate-200 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 block"
                  >
                    Organization Bio *
                  </Label>
                  <Textarea
                    id="orgBio"
                    value={orgProfile.bio}
                    onChange={(e) => setOrgProfile({ ...orgProfile, bio: e.target.value })}
                    className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] w-full resize-none ${
                      orgFormErrors.bio ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    placeholder="Tell us about your organization, its mission, and environmental goals..."
                    rows={3}
                  />
                  {orgFormErrors.bio && <p className="text-red-400 text-xs mt-1">{orgFormErrors.bio}</p>}
                </div>

                <div>
                  <Label
                    htmlFor="orgMobile"
                    className="text-slate-200 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 block"
                  >
                    Mobile Number *
                  </Label>
                  <Input
                    id="orgMobile"
                    value={orgProfile.org_mobile}
                    onChange={(e) => setOrgProfile({ ...orgProfile, org_mobile: e.target.value })}
                    className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-9 sm:h-10 lg:h-12 text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 w-full ${
                      orgFormErrors.org_mobile ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {orgFormErrors.org_mobile && (
                    <p className="text-red-400 text-xs mt-1">{orgFormErrors.org_mobile}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="orgEmail"
                    className="text-slate-200 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 block"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="orgEmail"
                    value={orgProfile.org_email || ""}
                    onChange={(e) => setOrgProfile({ ...orgProfile, org_email: e.target.value || null })}
                    className="bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-9 sm:h-10 lg:h-12 text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 w-full"
                    placeholder="contact@example.org"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="orgPicture"
                    className="text-slate-200 text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 block"
                  >
                    Organization Picture
                  </Label>
                  <div className="border-2 border-dashed border-emerald-400/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:border-emerald-400/50 transition-all duration-300">
                    {orgPictureFile ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm">{orgPictureFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setOrgPictureFile(null)}
                          className="border-red-400/30 text-red-400 hover:bg-red-500/10 bg-transparent text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mx-auto" />
                        <p className="text-slate-300 text-xs sm:text-sm">
                          Upload organization logo or picture
                        </p>
                        <p className="text-slate-500 text-xs mb-2">
                          Recommended size: 400x400px, Max: 5MB
                        </p>
                        <Input
                          id="orgPicture"
                          type="file"
                          accept="image/*"
                          onChange={handleOrgPictureUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("orgPicture")?.click()}
                          className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent text-xs sm:text-sm"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Choose Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 sm:mt-6 lg:mt-8">
                <Button
                  onClick={handleSaveOrgProfile}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 w-full sm:w-auto font-medium"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10">
        {/* Header */}
        <div className="relative pt-24 pb-8 sm:pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-10 lg:mb-12 space-y-6 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    Organize Events
                  </span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-slate-300 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  Create and manage your tree plantation events
                </p>
                {orgProfile.id && (
                  <p className="text-base sm:text-lg text-emerald-300 mt-2">
                    {orgProfile.name} • {orgProfile.type}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                <Link href="/profile?type=organization" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                  >
                    Organization Profile
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create New Event
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
              <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
                <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {events.length}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm lg:text-base">Total Events</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
                <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {events.filter((e) => e.status === "Published").length}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm lg:text-base">Published</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
                <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {events.reduce((sum, e) => sum + e.registrations, 0)}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm lg:text-base">Total Registrations</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
                <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {events.filter((e) => e.status === "Completed").length}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm lg:text-base">Completed</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap space-x-1 mb-6 sm:mb-8 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md rounded-xl p-1 border border-emerald-400/20">
              {[
                { key: "all", label: "All Events" },
                { key: "published", label: "Published" },
                { key: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedTab === tab.key
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Create/Edit Event Modal */}
        {(isCreating || editingEvent) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-emerald-400/30 shadow-2xl shadow-emerald-500/10 my-4">
              <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 lg:mb-10 space-y-4 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      {isCreating ? "Create New Event" : "Edit Event"}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
                      Fill in the details to organize your tree plantation event
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsCreating(false)
                      setEditingEvent(null)
                      resetForm()
                    }}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-emerald-400/50 transition-all duration-300 self-end sm:self-auto p-2 rounded-full"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-400/20">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-emerald-400" />
                        Basic Information
                      </h3>
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <Label
                            htmlFor="event_name"
                            className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                          >
                            Event Name *
                          </Label>
                          <Input
                            id="event_name"
                            value={formData.event_name}
                            onChange={(e) => handleInputChange("event_name", e.target.value)}
                            className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-10 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 ${
                              formErrors.event_name
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : ""
                            }`}
                            placeholder="Enter event name"
                          />
                          {formErrors.event_name && (
                            <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.event_name}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <Label
                              htmlFor="date"
                              className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                            >
                              Date *
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => handleInputChange("date", e.target.value)}
                              className={`bg-white/10 border-emerald-400/30 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 ${
                                formErrors.date
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                  : ""
                              }`}
                            />
                            {formErrors.date && (
                              <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.date}</p>
                            )}
                          </div>
                          <div>
                            <Label
                              htmlFor="time"
                              className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                            >
                              Time *
                            </Label>
                            <Input
                              id="time"
                              type="time"
                              value={formData.time}
                              onChange={(e) => handleInputChange("time", e.target.value)}
                              className={`bg-white/10 border-emerald-400/30 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 ${
                                formErrors.time
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                  : ""
                              }`}
                            />
                            {formErrors.time && (
                              <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.time}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="city"
                            className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                          >
                            City *
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-10 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 ${
                              formErrors.city ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                            }`}
                            placeholder="Enter city name"
                          />
                          {formErrors.city && (
                            <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor="location"
                            className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                          >
                            Location *
                          </Label>
                          <Textarea
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 text-sm sm:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 min-h-[80px] ${
                              formErrors.location
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : ""
                            }`}
                            placeholder="Enter complete location with landmarks"
                            rows={3}
                          />
                          {formErrors.location && (
                            <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.location}</p>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor="max_capacity"
                            className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                          >
                            Maximum Capacity *
                          </Label>
                          <Input
                            id="max_capacity"
                            type="number"
                            value={formData.max_capacity}
                            onChange={(e) => handleInputChange("max_capacity", e.target.value)}
                            className={`bg-white/10 border-emerald-400/30 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 ${
                              formErrors.max_capacity
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : ""
                            }`}
                            placeholder="Max participants"
                          />
                          {formErrors.max_capacity && (
                            <p className="text-red-400 text-xs sm:text-sm mt-1">
                              {formErrors.max_capacity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <div className="bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-teal-400/20">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center">
                        <TreePine className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-400" />
                        Plantation Details
                      </h3>
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <Label
                            htmlFor="trees"
                            className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                          >
                            Tree Types *
                          </Label>
                          <Input
                            id="trees"
                            value={formData.trees}
                            onChange={(e) => handleInputChange("trees", e.target.value)}
                            className={`bg-white/10 border-teal-400/30 text-white placeholder:text-slate-400 h-10 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 ${
                              formErrors.trees
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : ""
                            }`}
                            placeholder="e.g., Mango, Neem, Peepal (comma separated)"
                          />
                          {formErrors.trees && (
                            <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.trees}</p>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor="target"
                            className="text-slate-200 text-sm sm:text-base font-medium mb-2 sm:mb-3 block"
                          >
                            Target Trees *
                          </Label>
                          <Input
                            id="target"
                            type="number"
                            value={formData.target}
                            onChange={(e) => handleInputChange("target", e.target.value)}
                            className={`bg-white/10 border-teal-400/30 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 ${
                              formErrors.target
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : ""
                            }`}
                            placeholder="Number of trees"
                          />
                          {formErrors.target && (
                            <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.target}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-teal-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-400/20">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center">
                        <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-emerald-400" />
                        Event Image
                      </h3>
                      <div className="border-2 border-dashed border-emerald-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-emerald-400/50 transition-all duration-300">
                        {eventImageFile ? (
                          <div className="space-y-2">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-slate-300 text-xs sm:text-sm">{eventImageFile.name}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEventImageFile(null)}
                              className="border-red-400/30 text-red-400 hover:bg-red-500/10 bg-transparent text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mx-auto" />
                            <p className="text-slate-300 text-xs sm:text-sm">
                              Upload event image or banner
                            </p>
                            <p className="text-slate-500 text-xs mb-2">
                              Recommended size: 1200x600px, Max: 5MB
                            </p>
                            <Input
                              id="eventImage"
                              type="file"
                              accept="image/*"
                              onChange={handleEventImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("eventImage")?.click()}
                              className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent text-xs sm:text-sm"
                            >
                              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Choose Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-600/30">
                    <Label
                      htmlFor="description"
                      className="text-slate-200 text-lg font-medium mb-3 sm:mb-4 block flex items-center"
                    >
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-emerald-400" />
                      Event Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 text-sm sm:text-base rounded-lg sm:rounded-xl focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 min-h-[100px] ${
                        formErrors.description
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                      placeholder="Describe your event, its goals, what participants can expect, and any special instructions..."
                      rows={4}
                    />
                    {formErrors.description && (
                      <p className="text-red-400 text-xs sm:text-sm mt-1">{formErrors.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                  <Button
                    onClick={() => {
                      setIsCreating(false)
                      setEditingEvent(null)
                      resetForm()
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-slate-500 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingEvent) {
                        handleUpdateEvent(editingEvent);
                      } else {
                        handleCreateEvent()
                      }
                    }}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Confirmation Dialog */}
        <Dialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Event</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to update this event?</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateConfirm(false)} disabled={updateLoading}>
                Cancel
              </Button>
              <Button onClick={submitUpdateEvent} disabled={updateLoading}>
                {updateLoading ? "Updating..." : "Yes, Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Events List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="space-y-4 sm:space-y-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 group"
              >
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                    <div className="w-full lg:w-48 xl:w-56 h-32 sm:h-40 lg:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <img
                        src={event.image || "/placeholder.jpg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target
                          if (target && target.tagName === 'IMG') target.src = "/placeholder.jpg"
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-emerald-400 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {event.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {event.time}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {event.city}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`text-xs ${
                              event.status === "Published"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                                : event.status === "Draft"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-400/30"
                            }`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="text-center p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div className="font-semibold text-emerald-400">{event.capacity}</div>
                          <div className="text-slate-400">Capacity</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div className="font-semibold text-teal-400">{event.registrations}</div>
                          <div className="text-slate-400">Registered</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div className="font-semibold text-cyan-400">{event.targetTrees}</div>
                          <div className="text-slate-400">Trees</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-white/5 rounded-lg">
                          <div className="font-semibold text-emerald-400">{event.area}</div>
                          <div className="text-slate-400">Area</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-4 border-t border-white/10">
                        {selectedTab === "all" ? (
                          <Button
                            onClick={() => setViewEvent(event)}
                            variant="outline"
                            size="sm"
                            className="border-teal-400/30 text-teal-400 hover:bg-teal-500/10 bg-transparent text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            View
                          </Button>
                        ) : (
                          <>
                            {event.status !== "Completed" ? (
                              <Button
                                onClick={() => handleEditEvent(event)}
                                variant="outline"
                                size="sm"
                                className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent text-xs sm:text-sm"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Edit
                              </Button>
                            ) : (
                              <Button
                                onClick={() => openAttendanceDetails(event.id)}
                                variant="outline"
                                size="sm"
                                className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent text-xs sm:text-sm"
                              >
                                Attendance Details
                              </Button>
                            )}
                            <Button
                              onClick={() => setViewEvent(event)}
                              variant="outline"
                              size="sm"
                              className="border-teal-400/30 text-teal-400 hover:bg-teal-500/10 bg-transparent text-xs sm:text-sm"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              View
                            </Button>
                            {event.status === "Published" && (
                              <>
                                <Button
                                  onClick={() => openPublishedParticipants(event)}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-400/30 text-purple-400 hover:bg-purple-500/10 bg-transparent text-xs sm:text-sm"
                                >
                                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  View Participants
                                </Button>
                                <Button
                                  onClick={() => handleCompleteEvent(event.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-400/30 text-blue-400 hover:bg-blue-500/10 bg-transparent text-xs sm:text-sm"
                                >
                                  Mark Complete
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => requestDeleteEvent(event.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-400/30 text-red-400 hover:bg-red-500/10 bg-transparent text-xs sm:text-sm"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Delete
                            </Button>
                            {event.status === "Published" && (
                              <Button
                                onClick={() => router.push(`/attendance/${event.id}`)}
                                variant="outline"
                                size="sm"
                                className="border-purple-400/30 text-purple-400 hover:bg-purple-500/10 bg-transparent text-xs sm:text-sm"
                              >
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Attendance
                              </Button>
                            )}
                            {event.status === "Draft" && (
                              <Button
                                onClick={() => handlePublishEvent(event.id)}
                                variant="outline"
                                size="sm"
                                className="border-green-400/30 text-green-400 hover:bg-green-500/10 bg-transparent text-xs sm:text-sm"
                              >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Publish
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <TreePine className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-emerald-400/50 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-300 mb-2 sm:mb-4">
                No events found
              </h3>
              <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto px-4">
                {selectedTab === "all"
                  ? "You haven't created any events yet. Start organizing your first tree plantation event!"
                  : `No ${selectedTab} events found. Try switching to a different tab.`}
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Your  Event
              </Button>
            </div>
          )}
        </div>
      </main>
      

      {/* Complete Confirmation Dialog */}
      <Dialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-emerald-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Complete Event</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to mark this event as completed?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteConfirm(false)} disabled={completeLoading}>
              Cancel
            </Button>
            <Button onClick={submitCompleteEvent} disabled={completeLoading}>
              {completeLoading ? "Completing..." : "Yes, Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-red-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">Delete Event</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this event? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button onClick={submitDeleteEvent} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Details Modal */}
      <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
        <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-emerald-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Attendance Details</DialogTitle>
          </DialogHeader>
          {attendanceLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-10 h-10 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
          ) : attendanceError ? (
            <div className="text-red-400 text-sm">{attendanceError}</div>
          ) : attendanceData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{attendanceData.event}</h3>
                <div className="text-sm text-slate-300">
                  Present: {attendanceData.attendance.filter((a) => a.status?.toLowerCase() === "present").length} / {attendanceData.attendance.length}
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20 max-h-[60vh] overflow-y-auto">
                {attendanceData.attendance.map((a, i) => (
                  <div key={`${a.username}-${i}`} className="px-4 py-4 flex items-center justify-between border-b border-white/10 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                        {a.username.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{a.username}</div>
                        <button className="text-emerald-300 text-xs underline" onClick={() => openParticipantDetails(a.username)}>View profile</button>
                      </div>
                    </div>
                    <span className="text-emerald-300 text-sm capitalize bg-white/5 px-3 py-1 rounded-full border border-emerald-400/20">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Participant Profile Dialog (attendance style) */}
      <Dialog open={showParticipantModal} onOpenChange={setShowParticipantModal}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-400/20 rounded-2xl" showCloseButton={false}>
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Participant Profile
              </h2>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>

            {participantLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-10 h-10 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
              </div>
            ) : participantDetails ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                    {participantDetails.profile_picture ? (
                      <img
                        src={toAbsoluteImageUrl(participantDetails.profile_picture)}
                        alt={participantDetails.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      `${(participantDetails.first_name || "").toString().charAt(0).toUpperCase()}${(participantDetails.last_name || "").toString().charAt(0).toUpperCase()}`
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{participantDetails.first_name} {participantDetails.last_name}</h3>
                    <p className="text-slate-400">@{participantDetails.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-400/20 text-center">
                    <TreePine className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white mb-1">
                      {participantDetails.trees_planted?.toLocaleString?.() || participantDetails.trees_planted || "0"}
                    </div>
                    <div className="text-slate-400">Trees Planted</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-teal-400/20 text-center">
                    <CalendarIcon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white mb-1">
                      {participantDetails.event_participated || "0"}
                    </div>
                    <div className="text-slate-400">Events Participated</div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <User className="w-6 h-6 mr-3 text-emerald-400" />
                    About
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{participantDetails.about || 'No bio available.'}</p>
                </div>

                <div className="flex space-x-4">
        
          
                </div>
              </div>
            ) : (
              <div className="text-slate-400">No details available.</div>
            )}

            <DialogFooter className="mt-8">
              <Button onClick={() => setShowParticipantModal(false)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Published Event Participants Modal */}
      <Dialog open={showParticipantsModal} onOpenChange={setShowParticipantsModal}>
        <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-emerald-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Participants</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-slate-300">{participantsEventTitle}</div>
            {participantsUsernames && participantsUsernames.length > 0 ? (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20 max-h-[60vh] overflow-y-auto">
                {participantsUsernames.map((username, idx) => (
                  <div key={`${username}-${idx}`} className="px-4 py-4 flex items-center justify-between border-b border-white/10 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                        {username.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{username}</div>
                        <button className="text-emerald-300 text-xs underline" onClick={() => openParticipantDetails(username)}>View profile</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-sm">No participants yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Event Modal */}
      {viewEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-emerald-400/20">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {viewEvent.title}
                </h2>
                <Button
                  onClick={() => setViewEvent(null)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-black/40 mb-4">
                    <img
                      src={viewEvent.image || "/placeholder.jpg"}
                      alt={viewEvent.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target
                        if (target && target.tagName === 'IMG') target.src = "/placeholder.jpg"
                      }}
                    />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-slate-300">
                      <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                      {viewEvent.date} at {viewEvent.time}
                    </div>
                    <div className="flex items-center text-slate-300">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-400" />
                      {viewEvent.city} • {viewEvent.address}
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Users className="w-4 h-4 mr-2 text-emerald-400" />
                      {viewEvent.registrations}/{viewEvent.capacity} registered
                    </div>
                    <div className="flex items-center text-slate-300">
                      <TreePine className="w-4 h-4 mr-2 text-emerald-400" />
                      Target: {viewEvent.targetTrees} trees • Area: {viewEvent.area}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">{viewEvent.description}</p>
                  <h4 className="text-white font-medium mb-2">Tree Types</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {viewEvent.plantationDetails.treeTypes.map((t, idx) => (
                      <Badge key={idx} className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">{t}</Badge>
                    ))}
                  </div>
                  <h4 className="text-white font-medium mb-2">Contact</h4>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-emerald-400" />{viewEvent.contact.phone}</div>
                    <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-emerald-400" />{viewEvent.contact.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
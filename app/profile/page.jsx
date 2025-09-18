"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Phone,
  Mail,
  MapPin,
  TreePine,
  Calendar,
  Award,
  Edit3,
  Save,
  X,
  Camera,
  Star,
  Building2,
  Users,
  LogOut,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
 

// Converted from TS: removed interfaces and explicit types

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const profileType = searchParams.get("type") || "personal"

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState(profileType)
  const [loading, setLoading] = useState(true)
  const [orgLoading, setOrgLoading] = useState(false)

  const [orgProfileData, setOrgProfileData] = useState(null)
  const [personalProfileData, setPersonalProfileData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    treesPlanted: 0,
    eventsParticipated: 0,
    greenCoins: 0,
    rating: 4.5,
    joinedDate: "January 2024",
    profilePicture: null,
  })

  const { toast } = useToast();
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [orgImageFile, setOrgImageFile] = useState(null);

  const [originalPersonalProfile, setOriginalPersonalProfile] = useState(null);
  const [originalOrgProfile, setOriginalOrgProfile] = useState(null);

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
    }
  };
  const handleOrgImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setOrgImageFile(file);
    }
  };

  useEffect(() => {
    fetchProfileData()
  }, [activeTab])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      // Fetch personal profile data
      const [userResponse, participantResponse] = await Promise.all([
        fetch("http://localhost:8000/api/me/", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("http://localhost:8000/api/me/participant/", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ])

      if (userResponse.ok && participantResponse.ok) {
        const userData = await userResponse.json()
        const participantData = await participantResponse.json()

        // Merge the data
        const mergedData = {
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || userData.username,
          username: userData.username,
          email: userData.email || "",
          phone: userData.mobile || "",
          city: userData.city || "",
          bio: userData.about || "Environmental enthusiast passionate about tree plantation and sustainability.",
          treesPlanted: participantData.trees_planted || 0,
          eventsParticipated: participantData.event_participated || 0,
          greenCoins: participantData.green_coins || 0,
          rating: 4.5, // Default rating
          joinedDate: "January 2024", // Default date
          profilePicture: userData.profile_picture,
        }

        setPersonalProfileData(mergedData)
        setOriginalPersonalProfile(mergedData)
      } else {
        let errorMsg = "Failed to fetch profile data."
        try {
          const err = await userResponse.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
      }

      // Fetch organization profile data if needed
      if (activeTab === "organization") {
        const orgResponse = await fetch("http://localhost:8000/api/me/organizer", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          setOrgProfileData(orgData)
          setOriginalOrgProfile(orgData)
        } else {
          let errorMsg = "Failed to fetch organization profile."
          try {
            const err = await orgResponse.json()
            errorMsg = err.message || errorMsg
          } catch {}
          toast({ title: "Error", description: errorMsg, variant: "destructive" })
        }
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error fetching profile data.", variant: "destructive" })
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (activeTab === "organization" && orgProfileData) {
      setOrgProfileData((prev) => prev ? { ...prev, [field]: value } : null)
    } else {
      setPersonalProfileData((prev) => ({ ...prev, [field]: value }))
    }
  }

  // Fetch organization profile data when switching to organization tab
  const handleTabChange = async (newTab) => {
    if (newTab === "organization" && !orgProfileData) {
      // Fetch organization profile data if not already loaded
      await fetchOrganizationProfile()
    }
    setActiveTab(newTab)
  }

  const fetchOrganizationProfile = async () => {
    setOrgLoading(true)
    try {
      const orgResponse = await fetch("http://localhost:8000/api/me/organizer", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrgProfileData(orgData)
        setOriginalOrgProfile(orgData)
      } else {
        let errorMsg = "Failed to fetch organization profile."
        try {
          const err = await orgResponse.json()
          errorMsg = err.message || errorMsg
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error fetching organization profile.", variant: "destructive" })
      console.error("Error fetching organization profile:", error)
    } finally {
      setOrgLoading(false)
    }
  }

  const handleSave = () => {
    setShowUpdateConfirm(true);
  };

  const submitUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      if (activeTab === "personal" && originalPersonalProfile) {
        // Only send changed fields
        let changed = {};
        const fields = ["name", "email", "phone", "city", "bio"];
        for (const field of fields) {
          if (personalProfileData[field] !== originalPersonalProfile[field]) {
            changed[field] = personalProfileData[field];
          }
        }
        // Handle splitting name
        if (changed.name) {
          changed.first_name = changed.name.split(" ")[0] || "";
          changed.last_name = changed.name.split(" ").slice(1).join(" ") || "";
    
        }
        if (profileImageFile) {
          changed.profile_picture = profileImageFile;
        }
        let body;
        let headers = {};
        let isFormData = false;
        if (profileImageFile) {
          body = new FormData();
          for (const key in changed) {
            body.append(key, changed[key]);
          }
          isFormData = true;
        } else {
          body = { ...changed };
          headers["Content-Type"] = "application/json";
        }
        if (Object.keys(changed).length === 0) {
          toast({ title: "No changes", description: "No fields were changed.", variant: "destructive" });
          setUpdateLoading(false);
          setShowUpdateConfirm(false);
          return;
        }
        const response = await fetch("http://localhost:8000/api/user/update/", {
          method: "PUT",
          credentials: "include",
          headers: isFormData ? undefined : headers,
          body: isFormData ? body : JSON.stringify(body),
        });
        if (response.ok) {
          toast({ title: "Profile updated!", description: "Your personal profile was updated successfully." });
          fetchProfileData();
          setIsEditing(false);
          setProfileImageFile(null);
        } else {
          let errorMsg = "Could not update your profile."
          try {
            const err = await response.json()
            if ((changed.email || changed.username) && err.message && /exist|taken|already/i.test(err.message)) {
              errorMsg = err.message;
            } else {
              errorMsg = err.message || errorMsg;
            }
          } catch {}
          toast({ title: "Update failed", description: errorMsg, variant: "destructive" });
        }
      } else if (activeTab === "organization" && orgProfileData && originalOrgProfile) {
        // Only send changed fields
        let changed = {};
        const orgFields = [
          "name",
          "bio",
          "trees_planted",
          "org_mobile",
          "org_email",
          "event_hosted",
          "participants_reached",
          "type",
        ];
        for (const field of orgFields) {
          if (orgProfileData[field] !== originalOrgProfile[field]) {
            changed[field] = orgProfileData[field];
          }
        }
        if (orgImageFile) {
          changed.org_picture = orgImageFile;
        }
        let body;
        let headers = {};
        let isFormData = false;
        if (orgImageFile) {
          body = new FormData();
          for (const key in changed) {
            body.append(key, changed[key]);
          }
          isFormData = true;
        } else {
          body = { ...changed };
          headers["Content-Type"] = "application/json";
        }
        if (Object.keys(changed).length === 0) {
          toast({ title: "No changes", description: "No fields were changed.", variant: "destructive" });
          setUpdateLoading(false);
          setShowUpdateConfirm(false);
          return;
        }
        const response = await fetch("http://localhost:8000/api/update/organizer", {
          method: "PUT",
          credentials: "include",
          headers: isFormData ? undefined : headers,
          body: isFormData ? body : JSON.stringify(body),
        });
        if (response.ok) {
          toast({ title: "Organization profile updated!", description: "Your organization profile was updated successfully." });
          fetchProfileData();
          setIsEditing(false);
          setOrgImageFile(null);
        } else {
          let errorMsg = "Could not update your organization profile."
          try {
            const err = await response.json()
            if (changed.org_email && err.message && /exist|taken|already/i.test(err.message)) {
              errorMsg = err.message;
            } else {
              errorMsg = err.message || errorMsg;
            }
          } catch {}
          toast({ title: "Update failed", description: errorMsg, variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "Update failed", description: error?.message || "An error occurred while updating.", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
      setShowUpdateConfirm(false);
    }
  };

  const currentProfile = activeTab === "organization" ? orgProfileData : personalProfileData
  


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    if (activeTab === "organization") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-white mb-4">Organization profile not found</p>
            <p className="text-slate-400 mb-6">You may not have an organization profile yet.</p>
            <Button
              onClick={() => handleTabChange("personal")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            >
              Switch to Personal Profile
            </Button>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
   

      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Profile Content */}
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Profile Type Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1 backdrop-blur-md border border-white/20">
              <button
                onClick={() => handleTabChange("personal")}
                className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === "personal"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Personal Profile
              </button>
              <button
                onClick={() => handleTabChange("organization")}
                disabled={orgLoading}
                className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === "organization"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                } ${orgLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {orgLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  "Organization Profile"
                )}
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="mb-12">
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                  <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                    <div className="relative">
                      {activeTab === "organization" && (orgImageFile || orgProfileData?.org_picture) ? (
                        <img
                          src={orgImageFile ? URL.createObjectURL(orgImageFile) : orgProfileData.org_picture}
                          alt={orgProfileData.name}
                          className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                        />
                      ) : activeTab === "personal" && (profileImageFile || personalProfileData.profilePicture) ? (
                        <img
                          src={profileImageFile ? URL.createObjectURL(profileImageFile) : personalProfileData.profilePicture}
                          alt={personalProfileData.name}
                          className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                        />
                      ) : (
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold animate-glow">
                          {currentProfile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 bg-emerald-500 hover:bg-emerald-600 p-0 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                        onClick={() => {
                          if (activeTab === "organization") {
                            document.getElementById("orgImageInput")?.click();
                          } else {
                            document.getElementById("profileImageInput")?.click();
                          }
                        }}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageUpload}
                      />
                      <Input
                        id="orgImageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOrgImageUpload}
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 animate-gradient">
                        {currentProfile.name}
                      </h1>
                      <p className="text-slate-400">{activeTab === "personal" ? `@${personalProfileData.username}` : ``}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                  >
                    {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-400/20 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                    <TreePine className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
                      {activeTab === "organization" 
                        ? orgProfileData?.trees_planted.toLocaleString() || "0"
                        : personalProfileData.treesPlanted.toLocaleString()
                      }
                    </div>
                    <div className="text-slate-400">Trees Planted</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-teal-400/20 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
                    <Calendar className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                      {activeTab === "organization" 
                        ? orgProfileData?.event_hosted || 0
                        : personalProfileData.eventsParticipated
                      }
                    </div>
                    <div className="text-slate-400">
                      {activeTab === "organization" ? "Events Hosted" : "Events Participated"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-2xl p-6 border border-cyan-400/20 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                    {activeTab === "organization" ? (
                      <>
                        <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                          {orgProfileData?.participants_reached.toLocaleString() || "0"}
                        </div>
                        <div className="text-slate-400">Participants Reached</div>
                      </>
                    ) : (
                      <>
                        <Award className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                          {personalProfileData.greenCoins}
                        </div>
                        <div className="text-slate-400">Green Coins</div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal/Organization Information */}
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-emerald-400/20 to-cyan-400/20 hover:border-emerald-400/30 transition-all duration-300">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6 flex items-center">
                  {activeTab === "organization" ? (
                    <>
                      <Building2 className="w-6 h-6 mr-3 text-emerald-400" />
                      Organization Information
                    </>
                  ) : (
                    <>
                      <User className="w-6 h-6 mr-3 text-emerald-400" />
                      Personal Information
                    </>
                  )}
                </h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      {activeTab === "organization" ? "Organization Name" : "Full Name"}
                    </Label>
                    {isEditing ? (
                      <Input
                        value={currentProfile.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-white/10 border-emerald-400/30 text-white focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                      />
                    ) : (
                      <p className="text-white text-lg">{currentProfile.name}</p>
                    )}
                  </div>

                  {activeTab === "organization" && orgProfileData && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">Organization Type</Label>
                      {isEditing ? (
                        <Select value={orgProfileData.type} onValueChange={(value) => handleInputChange("type", value)}>
                          <SelectTrigger className="bg-white/10 border-emerald-400/30 text-white focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-emerald-400/30 rounded-xl">
                            <SelectItem value="NGO">NGO</SelectItem>
                            <SelectItem value="Government">Government</SelectItem>
                            <SelectItem value="Educational">Educational</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white text-lg">{orgProfileData.type}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-slate-300 mb-2 block flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        value={activeTab === "organization" ? orgProfileData?.org_email || "" : personalProfileData.email}
                        onChange={(e) => handleInputChange(activeTab === "organization" ? "org_email" : "email", e.target.value)}
                        className="bg-white/10 border-emerald-400/30 text-white focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                      />
                    ) : (
                      <p className="text-white text-lg">
                        {activeTab === "organization" ? orgProfileData?.org_email || "Not provided" : personalProfileData.email || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        value={activeTab === "organization" ? orgProfileData?.org_mobile || "" : personalProfileData.phone}
                        onChange={(e) => handleInputChange(activeTab === "organization" ? "org_mobile" : "phone", e.target.value)}
                        className="bg-white/10 border-emerald-400/30 text-white focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                      />
                    ) : (
                      <p className="text-white text-lg">
                        {activeTab === "organization" ? orgProfileData?.org_mobile || "Not provided" : personalProfileData.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  {activeTab === "personal" && (
                    <div>
                      <Label className="text-slate-300 mb-2 block flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        City
                      </Label>
                      {isEditing ? (
                        <Input
                          value={personalProfileData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="bg-white/10 border-emerald-400/30 text-white focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                        />
                      ) : (
                        <p className="text-white text-lg">{personalProfileData.city || "Not provided"}</p>
                      )}
                    </div>
                  )}

                  {/* Logout Button - Only show in personal profile */}
                  {activeTab === "personal" && (
                    <div className="pt-4 border-t border-emerald-400/20">
                      <Button
                        onClick={async () => {
                          try {
                            await fetch("http://localhost:8000/api/logout/", {
                              method: "POST",
                              credentials: "include",
                            })
                          } catch (e) {
                            console.error("Logout API failed:", e)
                          } finally {
                            window.location.replace("/")
                          }
                        }}
                        variant="outline"
                        className="w-full border-red-400/30 text-red-400 hover:bg-red-500/10 bg-transparent transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <Button
                    onClick={handleSave}
                    className="mt-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-gradient-to-r from-teal-400/20 to-cyan-400/20 hover:border-teal-400/30 transition-all duration-300">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                  {activeTab === "organization" ? "About Organization" : "About Me"}
                </h2>
                {isEditing ? (
                  <Textarea
                    value={activeTab === "organization" ? orgProfileData?.bio || "" : personalProfileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="bg-white/10 border-teal-400/30 text-white min-h-[200px] focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                    placeholder={
                      activeTab === "organization"
                        ? "Tell us about your organization, its mission, and environmental goals..."
                        : "Tell us about yourself and your environmental initiatives..."
                    }
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {activeTab === "organization" ? orgProfileData?.bio || "No bio available" : personalProfileData.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      

      {/* Update Confirmation Dialog */}
      <Dialog open={showUpdateConfirm} onOpenChange={setShowUpdateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to update your {activeTab === "organization" ? "organization" : "personal"} profile?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateConfirm(false)} disabled={updateLoading}>
              Cancel
            </Button>
            <Button onClick={submitUpdateProfile} disabled={updateLoading}>
              {updateLoading ? "Updating..." : "Yes, Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

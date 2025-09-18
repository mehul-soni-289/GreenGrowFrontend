"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Camera, Mic, MicOff, Users, CheckCircle, XCircle, RotateCcw, StopCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Phone,
  Mail,
  MapPin,
  TreePine,
  Calendar as CalendarIcon,
  Award,
  Building2,
  Users as UsersIcon,
  Star,
  Heart,
} from "lucide-react"
import { usePathname } from "next/navigation";

// Converted from TypeScript: removed interfaces

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId
  const pathname = usePathname();

  const [isListening, setIsListening] = useState(false)
  const [capturedName, setCapturedName] = useState("")
  const [enteredUsername, setEnteredUsername] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState(null)
  const [isAttendanceActive, setIsAttendanceActive] = useState(true)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const recognitionRef = useRef(null)

  const eventData = {
    id: eventId,
    title: "Community Tree Plantation Drive",
    date: "2024-01-15",
    time: "09:00 AM",
    location: "Central Park, Mumbai",
    capacity: 50,
    registered: 35,
  }

  const cleanupResources = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const endAttendance = () => {
    setIsAttendanceActive(false)
    cleanupResources()
    router.push(`/organize-events`)
  }

  const { toast } = useToast();
  const [attendanceList, setAttendanceList] = useState([]);
  const [matching, setMatching] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [faceMatchResult, setFaceMatchResult] = useState(null);
  const [showParticipantProfileModal, setShowParticipantProfileModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participantLoading, setParticipantLoading] = useState(false);

  // Fetch attendance list
  const fetchAttendanceList = async () => {
    try {
      const response = await fetch(`http://localhost:8000/attendance/events/${eventId}` , {
        credentials: "include",
      });
      if (response.ok) {  
        const data = await response.json();
        setAttendanceList(data.attendance || []);
      } else {
        let errorMsg = "Failed to fetch attendance list.";
        try {
          const err = await response.json();
          errorMsg = err.message || errorMsg;
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error fetching attendance list.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAttendanceList();
  }, [eventId]);

  useEffect(() => {
    if (isAttendanceActive) {
      startCamera()
      setupSpeechRecognition()
    }

    const handleBeforeUnload = () => {
      cleanupResources()
    }

    const handlePopState = () => {
      cleanupResources()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    return () => {
      cleanupResources()
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isAttendanceActive, pathname])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const setupSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setCapturedName(transcript.trim())
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setCapturedName("")
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const capturePhoto = async () => {
    if (!capturedName.trim() && !enteredUsername.trim()) {
      toast({ title: "Input Required", description: "Please say your name OR enter your username first!", variant: "destructive" });
      return;
    }

    if (!isAttendanceActive) {
      toast({ title: "Session Ended", description: "Attendance session has ended!", variant: "destructive" });
      return;
    }

    setIsCapturing(true);
    setMatching(true); // Start matching loading state
    setShowNext(false);
    setShowResultDialog(false);
    setFaceMatchResult(null);

    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setMatching(false);
            toast({ title: "Error", description: "Failed to capture image.", variant: "destructive" });
            return;
          }

          const formData = new FormData();
          // Username is always the typed input (or empty if not provided)
          formData.append("username", enteredUsername.trim());
          // Name is always the spoken name (or empty if not provided)
          formData.append("name", capturedName.trim());
          formData.append("event_id", eventId);
          formData.append("face_image", blob, "face.jpg");

          try {
            const response = await fetch("http://localhost:8000/attendance/attendance/", {
              method: "POST",
              credentials: "include",
              body: formData,
            });

            setMatching(false);
            if (response.ok) {
              const data = await response.json();
              setFaceMatchResult({
                success: data.isPresent,
                message: data.isPresent ? "Face matched successfully!" : "Face did not match with registered participants.",
              });
              setShowResultDialog(true);
              fetchAttendanceList();
            } else {
              let errorMsg = "Failed to mark attendance.";
              try {
                const err = await response.json();
                errorMsg = err.message || errorMsg;
              } catch {}
              setFaceMatchResult({
                success: false,
                message: errorMsg,
              });
              setShowResultDialog(true);
            }
          } catch (error) {
            setMatching(false);
            setFaceMatchResult({
              success: false,
              message: error?.message || "An error occurred during face matching.",
            });
            setShowResultDialog(true);
          }
        }, "image/jpeg", 0.8);
        setIsCapturing(false);
      }
    }
  };

  const resetCapture = () => {
    setCapturedName("")
    setEnteredUsername("")
    setIsListening(false)
  }

  const handleNext = () => {
    setCapturedName("");
    setEnteredUsername("");
    setIsListening(false);
    setShowResultDialog(false);
    setFaceMatchResult(null);
    setShowNext(false);
  };

  const fetchParticipantDetails = async (username) => {
    setParticipantLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/participant/${username}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedParticipant(data);
        setShowParticipantProfileModal(true);
      } else {
        let errorMsg = "Failed to fetch participant details.";
        try {
          const err = await response.json();
          errorMsg = err.message || errorMsg;
        } catch {}
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.message || "Error fetching participant details.", variant: "destructive" });
    } finally {
      setParticipantLoading(false);
    }
  };

  if (!isAttendanceActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Attendance Session Ended</h2>
          <p className="text-slate-400 mb-6">The attendance session has been completed.</p>
          <Button
            onClick={() => router.push("/organize-events")}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

  

      <div className="relative z-10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Event Attendance
              </span>
            </h1>
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{eventData.title}</h2>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
                <span>
                  {eventData.date} • {eventData.time}
                </span>
                <span>{eventData.location}</span>
                <span>Capacity: {eventData.capacity}</span>
              </div>
              <div className="mt-4">
                <Button
                  onClick={endAttendance}
                  variant="outline"
                  className="border-red-400/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  End Attendance
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Camera className="w-6 h-6 mr-2 text-emerald-400" />
                  Take Attendance
                </h3>

                <div className="relative mb-6">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 sm:h-80 object-cover rounded-xl bg-gray-800"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isCapturing && (
                    <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                      <div className="text-2xl font-bold text-gray-800">📸</div>
                    </div>
                  )}
                  {matching && (
                    <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center z-20">
                      <div className="text-white text-xl font-bold animate-pulse">Matching face...</div>
                    </div>
                  )}
                  {showNext && (
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Next</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Say your name:</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Enter username"
                        value={enteredUsername}
                        onChange={(e) => setEnteredUsername(e.target.value)}
                        className="bg-white/10 border-emerald-400/30 text-white placeholder:text-slate-400 h-9 sm:h-10 text-sm rounded-lg focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 w-full max-w-[180px]"
                      />
                      <Button
                        onClick={isListening ? stopListening : startListening}
                        variant="outline"
                        size="sm"
                        className={`border-emerald-400/30 ${
                          isListening
                            ? "text-red-400 border-red-400/30 hover:bg-red-500/10"
                            : "text-emerald-400 hover:bg-emerald-500/10"
                        } bg-transparent`}
                      >
                        {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                        {isListening ? "Stop" : "Listen"}
                      </Button>
                    </div>
                  </div>

                  {capturedName && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                      <span className="text-emerald-400 font-medium">Captured name: {capturedName}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={capturePhoto}
                      disabled={(!capturedName.trim() && !enteredUsername.trim()) || matching}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:opacity-50"
                    >
                      {matching ? "Matching..." : <><Camera className="w-4 h-4 mr-2" />Capture Photo</>}
                    </Button>
                    <Button
                      onClick={resetCapture}
                      variant="outline"
                      className="border-slate-400/30 text-slate-400 hover:bg-slate-500/10 bg-transparent"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-emerald-400/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-emerald-400" />
                  Attendance Summary
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">{attendanceList.filter((r) => r.status === "present").length}</div>
                    <div className="text-sm text-slate-400">Present</div>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{attendanceList.length - attendanceList.filter((r) => r.status === "present").length}</div>
                    <div className="text-sm text-slate-400">Absent</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{attendanceList.length}</div>
                    <div className="text-sm text-slate-400">Total</div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceList.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">No attendance records yet</div>
                  ) : (
                    attendanceList.map((record, idx) => (
                      <div
                        key={record.username + idx}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors duration-200"
                        onClick={() => fetchParticipantDetails(record.username)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-white font-bold">
                            {record.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{record.username}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={record.status === "present" ? "default" : "destructive"}
                            className={`text-xs ${record.status === "present" ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30" : "bg-red-500/20 text-red-400 border-red-400/30"}`}
                          >
                            {record.status === "present" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

  

      {/* Face Matching Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{faceMatchResult?.success ? "Attendance Marked!" : "Matching Failed"}</DialogTitle>
          </DialogHeader>
          <div className={`text-lg font-medium ${
            faceMatchResult?.success ? "text-emerald-400" : "text-red-400"
          }`}>
            {faceMatchResult?.message}
          </div>
          <DialogFooter>
            <Button onClick={handleNext} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              Next Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participant Profile Dialog */}
      {selectedParticipant && (
        <Dialog open={showParticipantProfileModal} onOpenChange={setShowParticipantProfileModal}>
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
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedParticipant.profile_picture ? (
                        <img
                          src={selectedParticipant.profile_picture}
                          alt={selectedParticipant.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        selectedParticipant.first_name[0]?.toUpperCase() + selectedParticipant.last_name[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedParticipant.first_name} {selectedParticipant.last_name}</h3>
                      <p className="text-slate-400">@{selectedParticipant.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-400/20 text-center">
                      <TreePine className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">
                        {selectedParticipant.trees_planted?.toLocaleString() || "0"}
                      </div>
                      <div className="text-slate-400">Trees Planted</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-teal-400/20 text-center">
                      <CalendarIcon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">
                        {selectedParticipant.event_participated || "0"}
                      </div>
                      <div className="text-slate-400">Events Participated</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <User className="w-6 h-6 mr-3 text-emerald-400" />
                      About
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{selectedParticipant.about || 'No bio available.'}</p>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button
                      variant="outline"
                      className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </div>
              )}
              <DialogFooter className="mt-8">
                <Button onClick={() => setShowParticipantProfileModal(false)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  Close
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

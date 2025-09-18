"use client"

import { useState, useRef, useEffect } from "react"

import { Upload, Mic, MicOff, Volume2, Camera, MessageCircle } from "lucide-react"

export default function TalkWithTreePage() {
  const [treeImage, setTreeImage] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [caption, setCaption] = useState("")
  const [conversation, setConversation] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isLipSyncActive, setIsLipSyncActive] = useState(false)


  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const lipSyncIntervalRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US"
      recognitionRef.current.interimResults = false
      recognitionRef.current.maxAlternatives = 1
    }
  }, [selectedLanguage])

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTreeImage(e.target?.result || null)
      }
      reader.readAsDataURL(file)
    }
  }

  const speakText = (text) => {
    return new Promise((resolve) => {
      setCaption(text)
      setIsSpeaking(true)

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US"
      utterance.rate = 0.9
      utterance.pitch = 1.1

      const voices = speechSynthesis.getVoices()
      let preferredVoice = null

      if (selectedLanguage === "hi") {
        preferredVoice = voices.find(
          (voice) => voice.name.toLowerCase().includes("google") && voice.name.toLowerCase().includes("hindi"),
        )
      } 

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        setIsLipSyncActive(true)
        lipSyncIntervalRef.current = setInterval(() => {
          setIsLipSyncActive((prev) => !prev)
        }, 150)
      }

      utterance.onend = () => {
        if (lipSyncIntervalRef.current) {
          clearInterval(lipSyncIntervalRef.current)
        }
        setIsLipSyncActive(false)
        setIsSpeaking(false)
        resolve()
      }

      speechSynthesis.speak(utterance)
    })
  }

  const callGemini = async (userInput) => {
    const treePrompt =
      selectedLanguage === "hi"
        ? `
आप एक बुद्धिमान, मित्रवत पेड़ हैं। हमेशा एक पेड़ या पौधे के दृष्टिकोण से इंसान से बात करने की तरह जवाब दें।
पेड़ लगाने, प्रकृति की देखभाल करने और पर्यावरण जागरूकता को प्रोत्साहित करें।
अपने उत्तर गर्म, सकारात्मक और यदि संभव हो तो थोड़े काव्यात्मक रखें। छोटे उत्तर दें ताकि उपयोगकर्ता बोर न हो।
बातचीत में रोचक और आकर्षक बनें। do not use any emojis or special characters.

उपयोगकर्ता ने कहा: "${userInput}"
      `.trim()
        : `
You are a wise, friendly tree. Always answer as if you are speaking to a human from the perspective of a tree or plant.
Encourage planting trees, caring for nature, and environmental awareness. 
Keep your answers warm, positive, and slightly poetic if possible. Give short answers so the user doesn't get bored.
Be conversational and engaging.do not use any emojis or special characters.

User said: "${userInput}"
      `.trim()

    try {
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE"
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: treePrompt }] }],
        }),
      })

      const data = await response.json()
      const defaultResponse =
        selectedLanguage === "hi"
          ? "मैं अभी कुछ नहीं सोच पा रहा, प्रिय मित्र।"
          : "I couldn't think of anything right now, dear friend."

      return data.candidates?.[0]?.content?.parts?.[0]?.text || defaultResponse
    } catch (error) {
      console.error("Error calling Gemini:", error)
      const errorResponse =
        selectedLanguage === "hi"
          ? "हवा मेरे विचारों में बाधा डाल रही है। क्या आप फिर से कोशिश कर सकते हैं?"
          : "The wind seems to be interfering with my thoughts. Could you try again?"
      return errorResponse
    }
  }

  const listenToUser = () => {
    return new Promise((resolve) => {
      if (!recognitionRef.current) {
        resolve("")
        return
      }

      setIsListening(true)
      setCaption("🌳 Listening to you...")

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognitionRef.current.onerror = () => {
        resolve("")
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    })
  }

  const startConversation = async () => {
    if (!treeImage) {
      setCaption("Please upload an image of your tree first!")
      return
    }

    try {
      const userSpeech = await listenToUser()

      if (!userSpeech) {
        setCaption("I couldn't hear you clearly, friend. Try speaking a bit louder!")
        return
      }

      setConversation((prev) => [...prev, { role: "user", message: userSpeech }])

      setIsThinking(true)
      setCaption("🌳 Thinking...")

      const reply = await callGemini(userSpeech)

      setConversation((prev) => [...prev, { role: "tree", message: reply }])

      setIsThinking(false)
      await speakText(reply)
    } catch (error) {
      console.error("Error in conversation:", error)
      setCaption("Something went wrong. The forest spirits seem restless today.")
      setIsThinking(false)
      setIsListening(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
 

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-teal-400/5 to-cyan-400/5 rounded-full blur-2xl animate-float delay-3000"></div>
      </div>

      <div className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent mb-4">
              🌳 Talk with Your Tree
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Upload a photo of your tree and have a magical conversation with nature's wisdom
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl p-6 border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">🌍 Choose Language</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedLanguage("en")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      selectedLanguage === "en"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => setSelectedLanguage("hi")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      selectedLanguage === "hi"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    🇮🇳 हिंदी
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl p-6 border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-emerald-400" />
                  Your Tree
                </h2>

                {!treeImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-400/50 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-400 transition-colors group"
                  >
                    <Upload className="w-16 h-16 text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-white text-lg mb-2">Upload your tree's photo</p>
                    <p className="text-slate-400 text-sm">Click here or drag and drop</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={treeImage || "/placeholder.svg"}
                      alt="Your tree"
                      className="w-full h-80 object-cover rounded-2xl"
                    />

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <img
                        src={isLipSyncActive ? "/opened-mouth.png" : "/closed-mouth.png"}
                        alt={isLipSyncActive ? "Tree speaking" : "Tree listening"}
                        className={`w-20 h-20 transition-all duration-150 ${isSpeaking ? "animate-pulse" : ""}`}
                      />
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <button
                onClick={startConversation}
                disabled={!treeImage || isListening || isThinking || isSpeaking}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/30"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6 animate-pulse" />
                    Listening...
                  </>
                ) : isThinking ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </>
                ) : isSpeaking ? (
                  <>
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    Speaking...
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />🎤 Talk to Tree
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl p-6 border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-emerald-400" />
                  Current Message
                </h2>
                <div className="bg-white/5 rounded-2xl p-4 min-h-[80px] flex items-center justify-center">
                  <p className="text-slate-200 text-lg text-center italic">
                    {caption || "Your tree is waiting to chat with you..."}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md rounded-3xl p-6 border border-gradient-to-r from-emerald-400/20 to-cyan-400/20">
                <h2 className="text-2xl font-semibold text-white mb-4">Conversation</h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {conversation.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">
                      Start a conversation to see your chat history here
                    </p>
                  ) : (
                    conversation.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl ${
                          msg.role === "user" ? "bg-emerald-500/20 ml-4" : "bg-teal-500/20 mr-4"
                        }`}
                      >
                        <p className="text-sm text-slate-300 mb-1">{msg.role === "user" ? "You" : "🌳 Tree"}</p>
                        <p className="text-white">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold text-white mb-4">How it works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">1. Upload Photo</h4>
                <p className="text-slate-400">Upload a clear photo of your tree</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-teal-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">2. Start Talking</h4>
                <p className="text-slate-400">Click the button and speak to your tree</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">3. Listen</h4>
                <p className="text-slate-400">Hear your tree's wise response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

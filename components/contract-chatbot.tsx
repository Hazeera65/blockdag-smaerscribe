"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Loader2, AlertCircle, Volume2, VolumeX, Mic, MicOff } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot" | "error"
  content: string
  timestamp: Date
}

interface ContractChatbotProps {
  results: any // Changed from 'contract' to 'results'
}

export function ContractChatbot({ results }: ContractChatbotProps) {
  // Destructure 'results'
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `Hi! I'm your AI smart contract assistant. I've analyzed the **${results.contractName}** and I'm ready to answer your questions.

You can ask me:
• Who can call specific functions?
• What are the main security risks?
• Can the owner drain funds?
• Is this contract upgradeable?

What would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    // Initialize speech recognition
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
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

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()

      // Clean text for better speech (already has markdown stripping)
      const cleanText = text
        .replace(/\*\*/g, "") // Remove markdown bold
        .replace(/\*/g, "") // Remove markdown italic
        .replace(/`/g, "") // Remove code backticks
        .replace(/#{1,6}\s/g, "") // Remove markdown headers
        .replace(/\[.*?\]$$.*?$$/g, "$1") // Remove markdown links, keep text
        .replace(/\n+/g, ". ") // Replace newlines with periods

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          contractData: results, // Pass 'results' as 'contractData'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response")
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])

      // Auto-speak the response
      setTimeout(() => {
        speakText(data.response)
      }, 500)
    } catch (error) {
      console.error("Chat error:", error)

      let errorMessage = "I'm sorry, I encountered an error processing your question. Please try again."

      if (error.message?.includes("temporarily unavailable")) {
        errorMessage = "The AI assistant is temporarily unavailable. Please try again in a few moments."
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: errorMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const formatMessage = (content: string) => {
    let formattedContent = content

    // Remove markdown headers (e.g., ### Header)
    formattedContent = formattedContent.replace(/#{1,6}\s/g, "")

    // Remove bold/italic markers (e.g., **text**, *text*, __text__, _text_)
    formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    formattedContent = formattedContent.replace(/__([^_]+)__/g, "$1") // __bold__
    formattedContent = formattedContent.replace(/\*([^*]+)\*/g, "$1") // *italic*
    formattedContent = formattedContent.replace(/_([^_]+)_/g, "$1") // _italic_

    // Remove list item markers (e.g., - item, * item, 1. item)
    formattedContent = formattedContent.replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, "")

    // Remove blockquote markers (e.g., > quote)
    formattedContent = formattedContent.replace(/^>\s*/gm, "")

    // Remove horizontal rules (e.g., ---, ***, ___)
    formattedContent = formattedContent.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, "")

    // Replace links with just the text (e.g., [text](url) -> text)
    formattedContent = formattedContent.replace(/\[(.*?)\]$$.*?$$/g, "$1")

    // Handle code blocks (```code```) - remove the backticks and trim whitespace
    formattedContent = formattedContent.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```/g, "").trim()
    })

    // Handle inline code (e.g., `code`) - keep the styling as it's useful for code snippets in chat
    formattedContent = formattedContent.replace(/`(.*?)`/g, "<code class='bg-slate-600 px-1 rounded'>$1</code>")

    // Replace newlines with <br> for proper display
    formattedContent = formattedContent.replace(/\n/g, "<br>")

    return formattedContent
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Smart Contract Assistant
        </CardTitle>
        <CardDescription>Ask questions about the analyzed contract with voice support</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* This div contains both the avatar and the message bubble, and controls their order */}
                <div className={`flex gap-3 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : message.type === "error"
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : "bg-gradient-to-r from-purple-500 to-purple-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-5 w-5 text-white" />
                    ) : message.type === "error" ? (
                      <AlertCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 shadow-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white text-right" // Added text-right here
                        : message.type === "error"
                          ? "bg-red-900/50 border border-red-700 text-red-200 text-left" // Added text-left here
                          : "bg-gradient-to-r from-slate-700 to-slate-600 text-gray-100 text-left" // Added text-left here
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    <div
                      className={`flex items-center mt-2 ${message.type === "user" ? "justify-end" : "justify-between"}`}
                    >
                      {" "}
                      {/* Adjusted justify for timestamp/button */}
                      <div className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</div>
                      {message.type === "bot" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => (isSpeaking ? stopSpeaking() : speakText(message.content))}
                          className="h-6 w-6 p-0 hover:bg-white/10 text-gray-300 hover:text-white"
                        >
                          {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    <span className="text-sm text-gray-300">AI is analyzing...</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Ask about the contract or use voice..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400 pr-12"
              disabled={isTyping}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                isListening ? "text-red-400 animate-pulse" : "text-gray-400 hover:text-white"
              }`}
              disabled={isTyping}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            <span>Voice Input</span>
          </div>
          <div className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            <span>Voice Output</span>
          </div>
          {isListening && (
            <div className="flex items-center gap-1 text-red-400 animate-pulse">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span>Listening...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Upload, Bot, User, Send, Loader2, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "user" | "bot" | "error"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `Hello! I'm SmartScribe AI, your smart contract assistant powered by Google Gemini. 

I can help you with:
• Smart contract security analysis
• Explaining contract functions and risks
• Solidity code review and best practices
• DeFi protocol analysis
• Token contract evaluation

You can either:
1. Upload a contract for analysis first, then ask specific questions
2. Ask general questions about smart contract security
3. Get help with Solidity development

What would you like to know about smart contracts?`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [contractCode, setContractCode] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [hasContract, setHasContract] = useState(false)

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
          contractData: hasContract
            ? {
                contractCode,
                hasContract: true,
                contractName: "Uploaded Contract",
              }
            : { hasContract: false },
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
    } catch (error) {
      console.error("Chat error:", error)

      let errorMessage = "I'm sorry, I encountered an error processing your question. Please try again."

      if (error.message?.includes("temporarily unavailable")) {
        errorMessage = "The AI assistant is temporarily unavailable. Please try again in a few moments."
      } else if (error.message?.includes("configuration error")) {
        errorMessage = "There's a configuration issue with the AI service. Please contact support."
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

  const handleUploadContract = () => {
    if (contractCode.trim()) {
      setHasContract(true)
      const contractMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: "I've uploaded a smart contract for analysis.",
        timestamp: new Date(),
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `Great! I've received your smart contract code. I can now answer specific questions about this contract including:

• Security vulnerabilities and risks
• Function analysis and access controls
• Gas optimization opportunities
• Best practice recommendations
• Potential attack vectors

What would you like to know about your contract?`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, contractMessage, botResponse])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">AI Smart Contract Assistant</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Chat with our AI assistant about smart contracts, security, and blockchain development
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contract Upload Panel */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Contract
                </CardTitle>
                <CardDescription>Upload your smart contract for specific analysis and questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="pragma solidity ^0.8.0;

contract MyContract {
    // Your contract code here...
}"
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleUploadContract}
                  disabled={!contractCode.trim()}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Upload for Analysis
                </Button>
                {hasContract && (
                  <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contract uploaded! Ask me anything about it.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant Chat
                </CardTitle>
                <CardDescription>
                  Ask questions about smart contracts, security, and blockchain development
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === "user"
                                ? "bg-blue-600"
                                : message.type === "error"
                                  ? "bg-red-600"
                                  : "bg-purple-600"
                            }`}
                          >
                            {message.type === "user" ? (
                              <User className="h-4 w-4" />
                            ) : message.type === "error" ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.type === "user"
                                ? "bg-blue-600 text-white"
                                : message.type === "error"
                                  ? "bg-red-900/50 border border-red-700 text-red-200"
                                  : "bg-slate-700 text-gray-100"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-300">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Ask about smart contracts, security, or upload a contract first..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

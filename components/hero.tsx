"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Globe } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-300 ring-1 ring-white/10 hover:ring-white/20">
            {"🚀 AI-Powered Smart Contract Analysis"}
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Decode Smart Contracts with{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Intelligence
          </span>
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
          SmartScribe transforms complex Ethereum smart contracts into clear, understandable insights. Analyze risks,
          understand functions, and get AI-powered explanations in your language.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => {
              document.getElementById("contract-analyzer")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Start Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {/* Removed View Demo button */}
        </div>

        <div className="mt-16 flex justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            Security Analysis
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            Instant Results
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Multi-Language
          </div>
        </div>
      </div>
    </section>
  )
}

import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Navigation } from "@/components/navigation"
import CryptoTracker from "@/components/crypto-tracker"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <Hero />

      {/* Quick Market Overview */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Live Market Data</h2>
            <p className="text-gray-300">Real-time cryptocurrency prices and market trends</p>
          </div>
          <CryptoTracker />
        </div>
      </section>

      <Features />
      <HowItWorks />
    </div>
  )
}

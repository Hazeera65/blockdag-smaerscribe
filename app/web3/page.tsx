import { Navigation } from "@/components/navigation"
import { Web3Dashboard } from "@/components/web3-dashboard"

export default function Web3Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Web3 Dashboard</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Manage your wallet, tokens, and blockchain interactions directly from SmartScribe
            </p>
          </div>

          <Web3Dashboard />
        </div>
      </div>
    </div>
  )
}

import { Navigation } from "@/components/navigation"
import { ContractAnalyzer } from "@/components/contract-analyzer"
import { PopularContracts } from "@/components/popular-contracts"

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Smart Contract Analysis</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Upload your smart contract or enter a contract address for comprehensive AI-powered security analysis
            </p>
          </div>

          <ContractAnalyzer />

          <div className="mt-8">
            <PopularContracts
              onSelectContract={(address) => {
                // This will be handled by the ContractAnalyzer component
                window.dispatchEvent(new CustomEvent("selectContract", { detail: address }))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

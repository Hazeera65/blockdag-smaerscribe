"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Calendar, Code, Shield, Loader2, Star } from "lucide-react"

interface ContractInfo {
  address: string
  etherscanUrl: string
  balance: string
  transactionCount: number
  isContract: boolean
  isVerified: boolean
  contractName: string
  compilerVersion: string | null
  creationDate: string | null
}

interface ContractInfoCardProps {
  address: string
  onAnalyze: (address: string) => void // Changed to pass address
  error?: string // Prop to receive external errors
}

export function ContractInfoCard({ address, onAnalyze, error: externalError }: ContractInfoCardProps) {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null) // Internal error for this component's fetch
  const [isStarred, setIsStarred] = useState(false) // New state for watchlist

  const fetchContractInfo = async () => {
    if (!address) return

    setLoading(true)
    setInternalError(null) // Clear internal errors
    setContractInfo(null) // Clear previous info

    try {
      const response = await fetch("/api/contract-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contract info")
      }

      setContractInfo(data)
    } catch (err: any) {
      setInternalError(err.message || "Failed to fetch contract information")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Automatically fetch info when address changes or component mounts
  // This might be redundant if handleGetContractInfo is always called explicitly
  // useEffect(() => {
  //   if (address) {
  //     fetchContractInfo();
  //   }
  // }, [address]);

  if (!address) return null

  const displayError = externalError || internalError

  const handleStarToggle = () => {
    setIsStarred(!isStarred)
    // In a real app, you'd send this to a backend to save to user's watchlist
    console.log(`Contract ${address} ${isStarred ? "removed from" : "added to"} watchlist.`)
    if (!isStarred) {
      alert(`Contract ${address} added to your watchlist! You'll receive simulated alerts.`)
    } else {
      alert(`Contract ${address} removed from watchlist.`)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contract Information
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStarToggle}
            className={`text-gray-400 hover:text-yellow-400 ${isStarred ? "text-yellow-400" : ""}`}
            title={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Star className={`h-5 w-5 ${isStarred ? "fill-yellow-400" : ""}`} />
          </Button>
        </div>
        <CardDescription>Detailed information about the contract from Etherscan</CardDescription>
      </CardHeader>
      <CardContent>
        {!contractInfo && !loading && !displayError && (
          <Button onClick={fetchContractInfo} className="w-full bg-blue-600 hover:bg-blue-700">
            Fetch Contract Details
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-300">Fetching contract information...</span>
          </div>
        )}

        {displayError && <div className="text-red-400 text-center py-4">{displayError}</div>}

        {contractInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Contract Name</h4>
                <p className="text-white font-medium">{contractInfo.contractName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
                <div className="flex gap-2">
                  <Badge variant={contractInfo.isContract ? "default" : "secondary"}>
                    {contractInfo.isContract ? "Contract" : "EOA"}
                  </Badge>
                  <Badge variant={contractInfo.isVerified ? "default" : "destructive"}>
                    {contractInfo.isVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Balance</h4>
                <p className="text-white">{contractInfo.balance}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Transactions</h4>
                <p className="text-white">{(contractInfo.transactionCount || 0).toLocaleString()}</p>
              </div>
              {contractInfo.compilerVersion && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Compiler</h4>
                  <p className="text-white text-sm">{contractInfo.compilerVersion}</p>
                </div>
              )}
              {contractInfo.creationDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Created</h4>
                  <p className="text-white text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {(() => {
                      const date = new Date(contractInfo.creationDate)
                      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()
                    })()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onAnalyze(address)} // Pass address to onAnalyze
                disabled={!contractInfo.isVerified}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Code className="h-4 w-4 mr-2" />
                {contractInfo.isVerified ? "Analyze Contract" : "Source Not Available"}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(contractInfo.etherscanUrl, "_blank")}
                className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Etherscan
              </Button>
            </div>

            {!contractInfo.isVerified && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                <p className="text-yellow-200 text-sm">
                  ⚠️ This contract's source code is not verified on Etherscan. Analysis is not available.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

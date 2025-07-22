"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import CryptoTracker from "@/components/crypto-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, BarChart3, Globe, Loader2, AlertTriangle, RefreshCw } from "lucide-react"

interface MarketStats {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  ethDominance: number
  marketCapChange24h: number
}

export default function MarketPage() {
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Added error state for market stats

  const fetchMarketStats = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use the proxy route for global stats
      const response = await fetch("/api/coingecko/global")

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429 || errorData.rateLimited) {
          throw new Error("Rate limit exceeded for market stats. Please try again later.")
        }
        throw new Error(errorData.error || "Failed to fetch global market stats.")
      }

      const data = await response.json()

      setMarketStats({
        totalMarketCap: data.data.total_market_cap.usd,
        totalVolume: data.data.total_volume.usd,
        btcDominance: data.data.market_cap_percentage.btc,
        ethDominance: data.data.market_cap_percentage.eth,
        marketCapChange24h: data.data.market_cap_change_percentage_24h_usd,
      })
    } catch (error: any) {
      console.error("Error fetching market stats:", error)
      setError(error.message || "Failed to fetch global market data. Please try again later.")

      // Set fallback market stats
      setMarketStats({
        totalMarketCap: 1650000000000, // $1.65T
        totalVolume: 45000000000, // $45B
        btcDominance: 51.2,
        ethDominance: 19.3,
        marketCapChange24h: 1.5,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketStats()
    const interval = setInterval(fetchMarketStats, 300000) // Update every 5 minutes instead of 1 minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Cryptocurrency Market Data</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Real-time cryptocurrency prices, market trends, and comprehensive market analysis
            </p>
          </div>

          {/* Market Overview Stats */}
          {loading && !error && (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-300">Loading market overview...</span>
            </div>
          )}

          {error && (
            <Card className="bg-red-900/50 border-red-700 mb-8">
              <CardContent className="p-4 text-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchMarketStats}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Retry Global Stats
                </button>
              </CardContent>
            </Card>
          )}

          {marketStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Market Cap</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${(marketStats.totalMarketCap / 1e12).toFixed(2)}T
                  </div>
                  <p className={`text-xs ${marketStats.marketCapChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {marketStats.marketCapChange24h >= 0 ? "+" : ""}
                    {marketStats.marketCapChange24h.toFixed(2)}% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">24h Volume</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">${(marketStats.totalVolume / 1e9).toFixed(1)}B</div>
                  <p className="text-xs text-gray-400">Trading volume</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">BTC Dominance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{marketStats.btcDominance.toFixed(1)}%</div>
                  <p className="text-xs text-gray-400">Bitcoin market share</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">ETH Dominance</CardTitle>
                  <Globe className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{marketStats.ethDominance.toFixed(1)}%</div>
                  <p className="text-xs text-gray-400">Ethereum market share</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="w-full">
            <CryptoTracker />
          </div>

          {/* Market Analysis Section */}
          <Card className="bg-slate-800/50 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Analysis & Insights
              </CardTitle>
              <CardDescription>AI-powered market analysis and trading insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Fear & Greed Index</span>
                      <span className="text-yellow-400 font-medium">Neutral (52)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "52%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Top Gainers (24h)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Loading...</span>
                      <span className="text-green-400">+0.00%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

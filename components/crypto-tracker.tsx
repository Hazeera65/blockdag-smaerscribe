"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, RefreshCw, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CryptoData {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

// Fallback data for when API is unavailable
const fallbackCryptos: CryptoData[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: "/placeholder.svg?height=32&width=32",
    current_price: 43250,
    price_change_percentage_24h: 2.5,
    market_cap: 847000000000,
    total_volume: 25000000000,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    image: "/placeholder.svg?height=32&width=32",
    current_price: 2650,
    price_change_percentage_24h: -1.2,
    market_cap: 318000000000,
    total_volume: 15000000000,
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "usdt",
    image: "/placeholder.svg?height=32&width=32",
    current_price: 1.0,
    price_change_percentage_24h: 0.1,
    market_cap: 91000000000,
    total_volume: 45000000000,
  },
]

const CryptoTracker = () => {
  const [cryptos, setCryptos] = useState<CryptoData[]>(fallbackCryptos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [nextRetryTime, setNextRetryTime] = useState<number | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(true)

  const BASE_URL = "/api/coingecko/coins/markets"
  const MAX_RETRIES = 2 // Reduced retries to avoid hitting rate limits

  const fetchCryptos = async (attempt = 1) => {
    // Don't fetch if we're rate limited and it's too soon
    if (isRateLimited && nextRetryTime && Date.now() < nextRetryTime) {
      console.log("Skipping fetch due to rate limit")
      return
    }

    setRefreshing(true)
    setError(null)
    if (attempt === 1) setLoading(true)

    const url = `${BASE_URL}?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429 || data.rateLimited) {
          setIsRateLimited(true)
          setNextRetryTime(Date.now() + (data.retryAfter || 60000))
          setError("Rate limit reached. Using cached data. Will retry automatically.")
          return
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      // Success - clear rate limit flags and update data
      setIsRateLimited(false)
      setNextRetryTime(null)
      setUsingFallbackData(false)
      setCryptos(data)
      setError(null)
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed (Crypto):`, error)

      if (attempt < MAX_RETRIES && !error.message?.includes("Rate limit")) {
        const delay = Math.pow(2, attempt) * 2000 // Longer delays: 2s, 4s
        await new Promise((res) => setTimeout(res, delay))
        return fetchCryptos(attempt + 1)
      }

      console.error("Error fetching crypto data:", error)

      if (error.message?.includes("Rate limit") || error.message?.includes("429")) {
        setIsRateLimited(true)
        setNextRetryTime(Date.now() + 120000) // 2 minutes
        setError("Rate limit exceeded. Using fallback data. Will retry in 2 minutes.")
      } else {
        setError("Unable to fetch live data. Showing fallback data.")
      }

      setUsingFallbackData(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCryptos()

    // Much longer intervals to avoid rate limits
    const interval = setInterval(() => {
      if (!isRateLimited || (nextRetryTime && Date.now() >= nextRetryTime)) {
        fetchCryptos()
      }
    }, 120000) // Update every 2 minutes instead of 30 seconds

    return () => clearInterval(interval)
  }, [isRateLimited, nextRetryTime])

  const handleManualRefresh = () => {
    if (isRateLimited && nextRetryTime && Date.now() < nextRetryTime) {
      const remainingTime = Math.ceil((nextRetryTime - Date.now()) / 1000)
      setError(`Rate limited. Please wait ${remainingTime} seconds before retrying.`)
      return
    }
    fetchCryptos()
  }

  if (loading && cryptos.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold text-white">Top Cryptocurrencies</CardTitle>
            {usingFallbackData && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Demo Data</span>
              </div>
            )}
            {isRateLimited && (
              <div className="flex items-center gap-1 text-orange-400 text-sm">
                <Clock className="h-4 w-4" />
                <span>Rate Limited</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing || (isRateLimited && nextRetryTime && Date.now() < nextRetryTime)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700"
            title={isRateLimited ? "Rate limited - please wait" : "Refresh data"}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {error && (
          <div className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cryptos.map((crypto) => (
            <div
              key={crypto.id}
              className="bg-slate-700 p-4 rounded-lg flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:bg-slate-600"
            >
              <div className="flex items-center">
                <img
                  src={crypto.image || "/placeholder.svg?height=32&width=32"}
                  alt={crypto.name}
                  className="w-8 h-8 mr-3 rounded-full"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-white font-semibold">{crypto.name}</h3>
                  <p className="text-gray-400 text-sm">{crypto.symbol.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">${crypto.current_price.toLocaleString()}</p>
                <p
                  className={`flex items-center justify-end ${
                    crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {usingFallbackData && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-yellow-200 text-sm">
              📊 Currently showing demo data due to API limitations. Live data will resume automatically when available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CryptoTracker

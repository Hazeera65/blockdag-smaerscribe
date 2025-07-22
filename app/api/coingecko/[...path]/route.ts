import { type NextRequest, NextResponse } from "next/server"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url)
  const path = pathname.replace("/api/coingecko", "") // Get the original CoinGecko path

  const coingeckoUrl = new URL(`${COINGECKO_BASE_URL}${path}`)
  searchParams.forEach((value, key) => {
    coingeckoUrl.searchParams.append(key, value)
  })

  const cacheKey = coingeckoUrl.toString()

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Returning cached data for:", cacheKey)
    return NextResponse.json(cached.data)
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Add CoinGecko Pro API key if available
  if (process.env.COINGECKO_API_KEY) {
    headers["x_cg_pro_api_key"] = process.env.COINGECKO_API_KEY
  }

  try {
    const response = await fetch(coingeckoUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(10000), // 10-second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`CoinGecko proxy error: ${response.status} - ${errorText}`)

      // Handle rate limit specifically
      if (response.status === 429) {
        // Return cached data if available, even if expired
        if (cached) {
          console.log("Rate limited, returning expired cached data")
          return NextResponse.json(cached.data)
        }

        return new NextResponse(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a few minutes.",
            rateLimited: true,
            retryAfter: 60000, // Suggest retry after 1 minute
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      return new NextResponse(errorText, { status: response.status })
    }

    const data = await response.json()

    // Cache the successful response
    cache.set(cacheKey, { data, timestamp: Date.now() })

    // Clean up old cache entries (simple cleanup)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Proxy fetch error:", error)

    // Return cached data if available during errors
    if (cached) {
      console.log("Error occurred, returning cached data")
      return NextResponse.json(cached.data)
    }

    return new NextResponse(
      JSON.stringify({
        error: `Failed to fetch from CoinGecko: ${error.message}`,
        offline: true,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

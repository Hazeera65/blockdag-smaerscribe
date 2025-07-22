import { type NextRequest, NextResponse } from "next/server"

// Helper function for exponential backoff retry
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000, // Initial delay in ms
  errorCheck?: (e: any) => boolean,
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && (errorCheck ? errorCheck(error) : true)) {
      console.warn(`Retrying after error: ${error.message}. Retries left: ${retries}`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retry(fn, retries - 1, delay * 2, errorCheck) // Exponential backoff
    }
    throw error // Re-throw if no retries left or error not retryable
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  let url = ""
  let errorMessage = "Failed to fetch data from CoinGecko."

  switch (type) {
    case "coins":
      url =
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false"
      errorMessage = "Failed to fetch cryptocurrency data."
      break
    case "defi":
      url =
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=decentralized-finance&order=market_cap_desc&per_page=12&page=1&sparkline=false"
      errorMessage = "Failed to fetch DeFi token data."
      break
    case "global":
      url = "https://api.coingecko.com/api/v3/global"
      errorMessage = "Failed to fetch global market stats."
      break
    default:
      return NextResponse.json({ error: "Invalid data type requested." }, { status: 400 })
  }

  try {
    const response = await retry(
      async () => {
        const res = await fetch(url)
        if (!res.ok) {
          const errorBody = await res.text()
          console.error(`CoinGecko API Error: ${res.status} ${res.statusText}. Response body: ${errorBody}`)
          let specificError = `HTTP Error: ${res.status} ${res.statusText}`
          if (res.status === 429) {
            specificError = "CoinGecko API rate limit exceeded."
          } else if (res.status >= 500) {
            specificError = "CoinGecko API server error."
          }
          throw new Error(specificError)
        }
        return res.json()
      },
      3,
      1000,
      (e) => e.message?.includes("429") || e.message?.includes("500") || e.message?.includes("Failed to fetch"),
    )

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`Proxy fetch error for type ${type}:`, error)
    return NextResponse.json(
      {
        error: `${errorMessage} Details: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

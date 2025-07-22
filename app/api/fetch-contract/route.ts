import { type NextRequest, NextResponse } from "next/server"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!ETHERSCAN_API_KEY) {
      console.error("Etherscan API key is not set.")
      return NextResponse.json({ error: "Etherscan API key is not configured." }, { status: 500 })
    }

    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Contract address is required" }, { status: 400 })
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
    }

    // Fetch contract source code from Etherscan
    const etherscanUrl = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`

    try {
      const response = await fetch(etherscanUrl)
      const data = await response.json()

      if (data.status === "1" && data.result && data.result[0]) {
        const contractData = data.result[0]

        // Check if source code is available
        if (!contractData.SourceCode || contractData.SourceCode === "") {
          return NextResponse.json(
            {
              error: "Contract source code not verified on Etherscan",
              contractName: contractData.ContractName || "Unknown Contract",
              address: address,
            },
            { status: 404 },
          )
        }

        // Handle different source code formats (single file vs multiple files)
        let sourceCode = contractData.SourceCode

        // If it's a JSON object (multiple files), extract the main contract
        if (sourceCode.startsWith("{")) {
          try {
            const parsed = JSON.parse(sourceCode.slice(1, -1)) // Remove outer braces
            if (parsed.sources) {
              // Find the main contract file
              const mainFile = Object.keys(parsed.sources).find(
                (key) => key.includes(contractData.ContractName) || key.includes(".sol"),
              )
              if (mainFile && parsed.sources[mainFile]) {
                sourceCode = parsed.sources[mainFile].content
              } else {
                // Take the first available source
                const firstKey = Object.keys(parsed.sources)[0]
                sourceCode = parsed.sources[firstKey].content
              }
            }
          } catch (parseError) {
            console.log("Could not parse multi-file source, using raw source")
          }
        }

        return NextResponse.json({
          sourceCode: sourceCode,
          contractName: contractData.ContractName || "Unknown Contract",
          compilerVersion: contractData.CompilerVersion,
          constructorArguments: contractData.ConstructorArguments,
          abi: contractData.ABI,
          isVerified: true,
          address: address,
          etherscanUrl: `https://etherscan.io/address/${address}`,
        })
      } else {
        return NextResponse.json(
          {
            error: "Contract not found or not verified on Etherscan",
            address: address,
            etherscanUrl: `https://etherscan.io/address/${address}`,
          },
          { status: 404 },
        )
      }
    } catch (fetchError: any) {
      console.error("Etherscan API error:", fetchError)
      let errorMessage = "Failed to fetch contract from Etherscan. Please check the address and try again."
      if (fetchError.message.includes("403")) {
        errorMessage = "Etherscan API key might be invalid or rate-limited. Please check your API key."
      } else if (fetchError.message.includes("Failed to fetch")) {
        errorMessage = "Network error or Etherscan API is unreachable. Please try again later."
      }
      return NextResponse.json(
        {
          error: errorMessage,
          address: address,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Fetch contract error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

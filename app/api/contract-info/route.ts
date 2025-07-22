import { type NextRequest, NextResponse } from "next/server"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!ETHERSCAN_API_KEY) {
      console.error("Etherscan API key is not set.")
      return NextResponse.json({ error: "Etherscan API key is not configured." }, { status: 500 })
    }

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 })
    }

    // Fetch multiple contract details in parallel
    const [sourceResponse, balanceResponse, txCountResponse] = await Promise.all([
      fetch(
        `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`,
      ),
      fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`,
      ),
      fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`,
      ),
    ])

    const [sourceData, balanceData, txCountData] = await Promise.all([
      sourceResponse.json(),
      balanceResponse.json(),
      txCountResponse.json(),
    ])

    const contractInfo = {
      address: address,
      etherscanUrl: `https://etherscan.io/address/${address}`,
      balance: balanceData.status === "1" ? (Number.parseInt(balanceData.result) / 1e18).toFixed(4) + " ETH" : "0 ETH",
      transactionCount: txCountData.result ? Number.parseInt(txCountData.result, 16) : 0,
      isContract: false,
      isVerified: false,
      contractName: "Unknown Contract",
      compilerVersion: null,
      creationDate: null,
    }

    if (sourceData.status === "1" && sourceData.result && sourceData.result[0]) {
      const contract = sourceData.result[0]
      contractInfo.isContract = true
      contractInfo.isVerified = contract.SourceCode !== ""
      contractInfo.contractName = contract.ContractName || "Unknown Contract"
      contractInfo.compilerVersion = contract.CompilerVersion
    }

    // Get contract creation transaction
    try {
      const creationResponse = await fetch(
        `https://api.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${ETHERSCAN_API_KEY}`,
      )
      const creationData = await creationResponse.json()

      if (creationData.status === "1" && creationData.result && creationData.result[0]) {
        const txHash = creationData.result[0].txHash

        // Get transaction details for timestamp
        const txResponse = await fetch(
          `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`,
        )
        const txData = await txResponse.json()

        if (txData.result && txData.result.blockNumber) {
          const blockResponse = await fetch(
            `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${txData.result.blockNumber}&boolean=false&apikey=${ETHERSCAN_API_KEY}`,
          )
          const blockData = await blockResponse.json()

          if (blockData.result && blockData.result.timestamp) {
            contractInfo.creationDate = new Date(Number.parseInt(blockData.result.timestamp, 16) * 1000).toISOString()
          }
        }
      }
    } catch (creationError) {
      console.log("Could not fetch creation date:", creationError)
    }

    return NextResponse.json(contractInfo)
  } catch (error: any) {
    console.error("Contract info error:", error)
    let errorMessage = "Failed to fetch contract information."
    if (error.message.includes("403")) {
      errorMessage = "Etherscan API key might be invalid or rate-limited. Please check your API key."
    } else if (error.message.includes("Failed to fetch")) {
      errorMessage = "Network error or Etherscan API is unreachable. Please try again later."
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

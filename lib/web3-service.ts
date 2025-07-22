interface ContractInteraction {
  address: string
  functionName: string
  args: any[]
  value?: string
}

interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  balance: string
}

export class Web3Service {
  private ethereum: any

  constructor() {
    if (typeof window !== "undefined") {
      this.ethereum = (window as any).ethereum
    }
  }

  // Get connected account
  async getAccount(): Promise<string | null> {
    if (!this.ethereum) return null

    try {
      const accounts = await this.ethereum.request({ method: "eth_accounts" })
      return accounts[0] || null
    } catch (error) {
      console.error("Error getting account:", error)
      return null
    }
  }

  // Get network information
  async getNetwork(): Promise<{ chainId: string; name: string }> {
    if (!this.ethereum) throw new Error("MetaMask not available")

    const chainId = await this.ethereum.request({ method: "eth_chainId" })
    const networkNames: Record<string, string> = {
      "0x1": "Ethereum Mainnet",
      "0x5": "Goerli Testnet",
      "0xaa36a7": "Sepolia Testnet",
      "0x89": "Polygon Mainnet",
      "0x38": "BSC Mainnet",
    }

    return {
      chainId,
      name: networkNames[chainId] || `Unknown Network (${chainId})`,
    }
  }

  // Get ETH balance
  async getBalance(address: string): Promise<string> {
    if (!this.ethereum) throw new Error("MetaMask not available")

    const balance = await this.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })

    // Convert from wei to ETH
    return (Number.parseInt(balance, 16) / 1e18).toFixed(4)
  }

  // Get token information (ERC20)
  async getTokenInfo(contractAddress: string, userAddress: string): Promise<TokenInfo | null> {
    if (!this.ethereum) return null

    try {
      // ERC20 function signatures
      const nameSelector = "0x06fdde03" // name()
      const symbolSelector = "0x95d89b41" // symbol()
      const decimalsSelector = "0x313ce567" // decimals()
      const totalSupplySelector = "0x18160ddd" // totalSupply()
      const balanceOfSelector = "0x70a08231" // balanceOf(address)

      const [nameResult, symbolResult, decimalsResult, totalSupplyResult, balanceResult] = await Promise.all([
        this.ethereum.request({
          method: "eth_call",
          params: [{ to: contractAddress, data: nameSelector }, "latest"],
        }),
        this.ethereum.request({
          method: "eth_call",
          params: [{ to: contractAddress, data: symbolSelector }, "latest"],
        }),
        this.ethereum.request({
          method: "eth_call",
          params: [{ to: contractAddress, data: decimalsSelector }, "latest"],
        }),
        this.ethereum.request({
          method: "eth_call",
          params: [{ to: contractAddress, data: totalSupplySelector }, "latest"],
        }),
        this.ethereum.request({
          method: "eth_call",
          params: [
            {
              to: contractAddress,
              data: balanceOfSelector + userAddress.slice(2).padStart(64, "0"),
            },
            "latest",
          ],
        }),
      ])

      // Parse results (simplified - in production you'd use a proper ABI decoder)
      const name = this.parseStringResult(nameResult)
      const symbol = this.parseStringResult(symbolResult)
      const decimals = Number.parseInt(decimalsResult, 16)
      const totalSupply = (Number.parseInt(totalSupplyResult, 16) / Math.pow(10, decimals)).toFixed(2)
      const balance = (Number.parseInt(balanceResult, 16) / Math.pow(10, decimals)).toFixed(4)

      return { name, symbol, decimals, totalSupply, balance }
    } catch (error) {
      console.error("Error getting token info:", error)
      return null
    }
  }

  // Send transaction
  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    if (!this.ethereum) throw new Error("MetaMask not available")

    const account = await this.getAccount()
    if (!account) throw new Error("No account connected")

    const txParams = {
      from: account,
      to,
      value: "0x" + (Number.parseFloat(value) * 1e18).toString(16), // Convert ETH to wei
      ...(data && { data }),
    }

    return await this.ethereum.request({
      method: "eth_sendTransaction",
      params: [txParams],
    })
  }

  // Add token to MetaMask
  async addTokenToWallet(address: string, symbol: string, decimals: number, image?: string): Promise<boolean> {
    if (!this.ethereum) return false

    try {
      await this.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address,
            symbol,
            decimals,
            image,
          },
        },
      })
      return true
    } catch (error) {
      console.error("Error adding token to wallet:", error)
      return false
    }
  }

  // Switch network
  async switchNetwork(chainId: string): Promise<boolean> {
    if (!this.ethereum) return false

    try {
      await this.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      })
      return true
    } catch (error: any) {
      // If network doesn't exist, try to add it
      if (error.code === 4902) {
        return await this.addNetwork(chainId)
      }
      console.error("Error switching network:", error)
      return false
    }
  }

  // Add network to MetaMask
  private async addNetwork(chainId: string): Promise<boolean> {
    const networks: Record<string, any> = {
      "0x89": {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
      "0x38": {
        chainId: "0x38",
        chainName: "Binance Smart Chain",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com/"],
      },
    }

    const networkConfig = networks[chainId]
    if (!networkConfig) return false

    try {
      await this.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networkConfig],
      })
      return true
    } catch (error) {
      console.error("Error adding network:", error)
      return false
    }
  }

  // Simple string parser for contract calls (simplified version)
  private parseStringResult(hex: string): string {
    if (!hex || hex === "0x") return ""

    try {
      // Remove 0x prefix and decode hex to string
      const cleanHex = hex.slice(2)
      const bytes = []
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(Number.parseInt(cleanHex.substr(i, 2), 16))
      }

      // Find the actual string data (skip the first 64 bytes which contain length info)
      const stringBytes = bytes.slice(64).filter((b) => b !== 0)
      return String.fromCharCode(...stringBytes)
    } catch (error) {
      return "Unknown"
    }
  }

  // Add this method to the Web3Service class
  async disconnect(): Promise<void> {
    // MetaMask doesn't have a direct disconnect method, but we can clear local state
    // and request account permissions to be revoked (if supported)
    if (this.ethereum && this.ethereum.request) {
      try {
        // Some wallets support wallet_requestPermissions to reset connection
        await this.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        })
      } catch (error) {
        // If that doesn't work, we'll handle disconnect in the UI layer
        console.log("Wallet disconnect requested")
      }
    }
  }

  // Add method to check if wallet is connected
  async isConnected(): Promise<boolean> {
    if (!this.ethereum) return false

    try {
      const accounts = await this.ethereum.request({ method: "eth_accounts" })
      return accounts && accounts.length > 0
    } catch (error) {
      return false
    }
  }
}

export const web3Service = new Web3Service()

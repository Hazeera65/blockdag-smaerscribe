"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  Send,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Coins,
  Network,
  History,
} from "lucide-react"
import { web3Service } from "@/lib/web3-service"
import { useWeb3 } from "@/lib/web3-context"
import { WalletButton } from "@/components/wallet-button"

interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  balance: string
}

interface Transaction {
  hash: string
  to: string
  value: string
  status: "pending" | "success" | "failed"
  timestamp: number
}

export function Web3Dashboard() {
  const { isConnected, walletInfo, error: web3Error, refreshWallet } = useWeb3()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [tokenAddress, setTokenAddress] = useState("")
  const [sendToAddress, setSendToAddress] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [isAddingToken, setIsAddingToken] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isConnected && walletInfo) {
      loadPopularTokens(walletInfo.address)
    } else {
      // Clear data when disconnected
      setTokens([])
      setTransactions([])
      setError(null)
    }
  }, [isConnected, walletInfo])

  const loadPopularTokens = async (userAddress: string) => {
    setLoading(true)
    // Popular token addresses (Ethereum mainnet)
    const popularTokens = [
      "0xA0b86a33E6441b8e776f89d2b5B977c737C5e0b6", // USDC
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
    ]

    const tokenInfos: TokenInfo[] = []

    for (const address of popularTokens) {
      try {
        const tokenInfo = await web3Service.getTokenInfo(address, userAddress)
        if (tokenInfo) {
          tokenInfos.push({
            address,
            ...tokenInfo,
          })
        }
      } catch (error) {
        console.log(`Failed to load token ${address}:`, error)
      }
    }

    setTokens(tokenInfos)
    setLoading(false)
  }

  const handleAddToken = async () => {
    if (!tokenAddress || !walletInfo) return

    setIsAddingToken(true)
    try {
      const tokenInfo = await web3Service.getTokenInfo(tokenAddress, walletInfo.address)
      if (tokenInfo) {
        const newToken = {
          address: tokenAddress,
          ...tokenInfo,
        }
        setTokens((prev) => [...prev, newToken])

        // Add to MetaMask wallet
        await web3Service.addTokenToWallet(tokenAddress, tokenInfo.symbol, tokenInfo.decimals)

        setTokenAddress("")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAddingToken(false)
    }
  }

  const handleSendETH = async () => {
    if (!sendToAddress || !sendAmount || !walletInfo) return

    setIsSending(true)
    try {
      const txHash = await web3Service.sendTransaction(sendToAddress, sendAmount)

      // Add to local transaction history
      const newTx: Transaction = {
        hash: txHash,
        to: sendToAddress,
        value: sendAmount,
        status: "pending",
        timestamp: Date.now(),
      }

      setTransactions((prev) => [newTx, ...prev])
      setSendToAddress("")
      setSendAmount("")

      // Refresh balance after a delay
      setTimeout(refreshWallet, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleSwitchNetwork = async (chainId: string) => {
    try {
      await web3Service.switchNetwork(chainId)
      setTimeout(refreshWallet, 1000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-4">Connect MetaMask to access Web3 features</p>
          <WalletButton variant="default" showBalance={false} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {(error || web3Error) && (
        <Card className="bg-red-900/50 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="h-5 w-5" />
              <span>{error || web3Error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-200 hover:text-white"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Overview */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-400" />
              Wallet Overview
            </CardTitle>
            <WalletButton variant="compact" showBalance={true} />
          </div>
        </CardHeader>
        <CardContent>
          {walletInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Address</div>
                <div className="flex items-center gap-2">
                  <code className="text-white font-mono text-sm">
                    {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(walletInfo.address)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Balance</div>
                <div className="text-white font-semibold text-lg">{walletInfo.balance} ETH</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Network</div>
                <Badge variant="outline" className="text-white border-slate-600">
                  <Network className="h-3 w-3 mr-1" />
                  {walletInfo.network.name}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={refreshWallet} disabled={loading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {walletInfo && (
              <Button
                onClick={() => window.open(`https://etherscan.io/address/${walletInfo.address}`, "_blank")}
                size="sm"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Etherscan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="tokens">
            <Coins className="h-4 w-4 mr-2" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Send
          </TabsTrigger>
          <TabsTrigger value="networks">
            <Network className="h-4 w-4 mr-2" />
            Networks
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Token Portfolio</CardTitle>
              <CardDescription>Your ERC-20 token holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter token contract address..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button
                  onClick={handleAddToken}
                  disabled={isAddingToken || !tokenAddress}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAddingToken ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-3">
                {tokens.map((token) => (
                  <div key={token.address} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{token.name}</div>
                      <div className="text-gray-400 text-sm">{token.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{token.balance}</div>
                      <div className="text-gray-400 text-sm">Supply: {token.totalSupply}</div>
                    </div>
                  </div>
                ))}

                {tokens.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-400">
                    No tokens found. Add a token address above to get started.
                  </div>
                )}

                {loading && (
                  <div className="text-center py-8 text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading tokens...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Send ETH</CardTitle>
              <CardDescription>Send Ethereum to another address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Recipient Address</label>
                  <Input
                    placeholder="0x..."
                    value={sendToAddress}
                    onChange={(e) => setSendToAddress(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Amount (ETH)</label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.1"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleSendETH}
                  disabled={isSending || !sendToAddress || !sendAmount}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send ETH
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Switch Networks</CardTitle>
              <CardDescription>Change your active blockchain network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {[
                  { chainId: "0x1", name: "Ethereum Mainnet", icon: "⟠" },
                  { chainId: "0x89", name: "Polygon Mainnet", icon: "⬟" },
                  { chainId: "0x38", name: "Binance Smart Chain", icon: "🟡" },
                  { chainId: "0xaa36a7", name: "Sepolia Testnet", icon: "🧪" },
                ].map((network) => (
                  <div
                    key={network.chainId}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{network.icon}</span>
                      <div>
                        <div className="text-white font-medium">{network.name}</div>
                        <div className="text-gray-400 text-sm">{network.chainId}</div>
                      </div>
                    </div>

                    {walletInfo && walletInfo.network.chainId === network.chainId ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSwitchNetwork(network.chainId)}
                        className="border-slate-600 text-white"
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">
                          Send to {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </div>
                        <div className="text-gray-400 text-sm">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{tx.value} ETH</div>
                        <Badge
                          variant={
                            tx.status === "success" ? "default" : tx.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No transactions yet. Send some ETH to get started!</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

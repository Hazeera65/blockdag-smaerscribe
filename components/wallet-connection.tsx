"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle, AlertTriangle, ExternalLink, LogOut, RefreshCw } from "lucide-react"
import { web3Service } from "@/lib/web3-service"

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean) => void
}

export function WalletConnection({ onConnectionChange }: WalletConnectionProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [network, setNetwork] = useState<{ chainId: string; name: string } | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()

    // Listen for account/network changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum

      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          loadAccountData(accounts[0])
        } else {
          handleDisconnect()
        }
      })

      ethereum.on("chainChanged", () => {
        if (account) {
          loadAccountData(account)
        }
      })
    }
  }, [])

  const checkConnection = async () => {
    try {
      const connected = await web3Service.isConnected()
      if (connected) {
        const acc = await web3Service.getAccount()
        if (acc) {
          setAccount(acc)
          await loadAccountData(acc)
        }
      }
      onConnectionChange?.(connected)
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }

  const loadAccountData = async (address: string) => {
    try {
      const [bal, net] = await Promise.all([web3Service.getBalance(address), web3Service.getNetwork()])
      setBalance(bal)
      setNetwork(net)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })

        if (accounts.length > 0) {
          setAccount(accounts[0])
          await loadAccountData(accounts[0])
          onConnectionChange?.(true)
        }
      } else {
        throw new Error("MetaMask is not installed")
      }
    } catch (err: any) {
      setError(err.message)
      onConnectionChange?.(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)

    try {
      await web3Service.disconnect()

      // Clear all state
      setAccount(null)
      setNetwork(null)
      setBalance("0")
      setError(null)

      onConnectionChange?.(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const getNetworkColor = (chainId: string) => {
    switch (chainId) {
      case "0x1":
        return "bg-blue-600"
      case "0x89":
        return "bg-purple-600"
      case "0x38":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  if (!account) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <CardTitle className="text-white">Connect Your Wallet</CardTitle>
          <CardDescription>Connect MetaMask to access Web3 features and interact with smart contracts</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="mt-4 text-xs text-gray-400">
            Don't have MetaMask?{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Install it here
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <CardTitle className="text-white">Wallet Connected</CardTitle>
          </div>
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            size="sm"
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
          >
            {isDisconnecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Address</div>
              <div className="flex items-center gap-2">
                <code className="text-white font-mono text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(account)}
                  className="h-6 w-6 p-0"
                  title="Copy address"
                >
                  📋
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Balance</div>
              <div className="text-white font-semibold">{balance} ETH</div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Network</div>
              {network && <Badge className={`${getNetworkColor(network.chainId)} text-white`}>{network.name}</Badge>}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => loadAccountData(account)}
              size="sm"
              variant="outline"
              className="border-slate-600 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => window.open(`https://etherscan.io/address/${account}`, "_blank")}
              size="sm"
              variant="outline"
              className="border-slate-600 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Etherscan
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

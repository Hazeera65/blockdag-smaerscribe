"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { web3Service } from "./web3-service"

interface WalletInfo {
  address: string
  balance: string
  network: { chainId: string; name: string }
}

interface Web3ContextType {
  isConnected: boolean
  walletInfo: WalletInfo | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshWallet: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()

    // Listen for account/network changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum

      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          loadWalletInfo(accounts[0])
        } else {
          handleDisconnect()
        }
      })

      ethereum.on("chainChanged", () => {
        if (walletInfo) {
          loadWalletInfo(walletInfo.address)
        }
      })
    }
  }, [])

  const checkConnection = async () => {
    try {
      const connected = await web3Service.isConnected()
      if (connected) {
        const account = await web3Service.getAccount()
        if (account) {
          await loadWalletInfo(account)
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }

  const loadWalletInfo = async (address: string) => {
    try {
      const [balance, network] = await Promise.all([web3Service.getBalance(address), web3Service.getNetwork()])

      setWalletInfo({
        address,
        balance,
        network,
      })
      setIsConnected(true)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setIsConnected(false)
    }
  }

  const connect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })

        if (accounts.length > 0) {
          await loadWalletInfo(accounts[0])
        }
      } else {
        throw new Error("MetaMask is not installed")
      }
    } catch (err: any) {
      setError(err.message)
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await web3Service.disconnect()
      handleDisconnect()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDisconnect = () => {
    setWalletInfo(null)
    setIsConnected(false)
    setError(null)
  }

  const refreshWallet = async () => {
    if (walletInfo) {
      await loadWalletInfo(walletInfo.address)
    }
  }

  const value: Web3ContextType = {
    isConnected,
    walletInfo,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshWallet,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

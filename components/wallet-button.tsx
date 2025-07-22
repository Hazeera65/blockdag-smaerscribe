"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Network,
  DollarSign,
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"

interface WalletButtonProps {
  variant?: "default" | "compact"
  showBalance?: boolean
}

export function WalletButton({ variant = "default", showBalance = true }: WalletButtonProps) {
  const { isConnected, walletInfo, isConnecting, error, connect, disconnect, refreshWallet } = useWeb3()
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
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
      case "0xaa36a7":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  const getNetworkIcon = (chainId: string) => {
    switch (chainId) {
      case "0x1":
        return "⟠"
      case "0x89":
        return "⬟"
      case "0x38":
        return "🟡"
      case "0xaa36a7":
        return "🧪"
      default:
        return "🔗"
    }
  }

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={connect}
              disabled={isConnecting}
              className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 ${
                variant === "compact" ? "px-3" : "px-4"
              }`}
              size={variant === "compact" ? "sm" : "default"}
            >
              {isConnecting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
              {variant === "compact" ? "Connect" : "Connect Wallet"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connect your MetaMask wallet to access Web3 features</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!walletInfo) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
          size={variant === "compact" ? "sm" : "default"}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="font-mono text-sm">
                {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
              </span>
            </div>
            {showBalance && variant !== "compact" && (
              <>
                <div className="h-4 w-px bg-slate-600" />
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-sm font-medium">{walletInfo.balance} ETH</span>
                </div>
              </>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700 text-white" align="end">
        <DropdownMenuLabel className="text-gray-300">Wallet Details</DropdownMenuLabel>

        {/* Wallet Address */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
            <div>
              <div className="text-xs text-gray-400">Address</div>
              <div className="font-mono text-sm">{walletInfo.address.slice(0, 20)}...</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(walletInfo.address)}
              className="h-8 w-8 p-0 hover:bg-slate-600"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="px-2 py-1">
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
            <div>
              <div className="text-xs text-gray-400">Balance</div>
              <div className="font-semibold">{walletInfo.balance} ETH</div>
            </div>
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
        </div>

        {/* Network */}
        <div className="px-2 py-1">
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
            <div>
              <div className="text-xs text-gray-400">Network</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNetworkIcon(walletInfo.network.chainId)}</span>
                <span className="text-sm">{walletInfo.network.name}</span>
              </div>
            </div>
            <Badge className={`${getNetworkColor(walletInfo.network.chainId)} text-white`}>
              <Network className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-600" />

        {/* Actions */}
        <DropdownMenuItem onClick={refreshWallet} className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Refresh Wallet</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(`https://etherscan.io/address/${walletInfo.address}`, "_blank")}
          className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>View on Etherscan</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-600" />

        <DropdownMenuItem
          onClick={disconnect}
          className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect Wallet</span>
        </DropdownMenuItem>

        {error && (
          <>
            <DropdownMenuSeparator className="bg-slate-600" />
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-700/50 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-200">{error}</span>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface PopularContract {
  name: string
  address: string
  description: string
  type: string
  verified: boolean
}

const popularContracts: PopularContract[] = [
  {
    name: "USDC Token",
    address: "0xA0b86a33E6441b8e776f89d2b5B977c737C5e0b6",
    description: "USD Coin - A fully collateralized US dollar stablecoin",
    type: "ERC20",
    verified: true,
  },
  {
    name: "Uniswap V3 Router",
    address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    description: "Uniswap V3 SwapRouter for token swaps",
    type: "DeFi",
    verified: true,
  },
  {
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    description: "WETH - Wrapped Ether token contract",
    type: "ERC20",
    verified: true,
  },
  {
    name: "Compound cUSDC",
    address: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
    description: "Compound USD Coin lending token",
    type: "DeFi",
    verified: true,
  },
  {
    name: "Chainlink ETH/USD",
    address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    description: "Chainlink ETH/USD price feed oracle",
    type: "Oracle",
    verified: true,
  },
  {
    name: "OpenSea Registry",
    address: "0xa5409ec958C83C3f309868babACA7c86DCB077c1",
    description: "OpenSea Wyvern Exchange Registry",
    type: "NFT",
    verified: true,
  },
]

interface PopularContractsProps {
  onSelectContract: (address: string) => void
}

export function PopularContracts({ onSelectContract }: PopularContractsProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Popular Contracts</CardTitle>
        <CardDescription>Try analyzing these well-known Ethereum contracts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {popularContracts.map((contract, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium">{contract.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {contract.type}
                  </Badge>
                  {contract.verified && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{contract.description}</p>
                <p className="text-gray-500 text-xs font-mono">{contract.address}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onSelectContract(contract.address)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Analyze
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`https://etherscan.io/address/${contract.address}`, "_blank")}
                  className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-600"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

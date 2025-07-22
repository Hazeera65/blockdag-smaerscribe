"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageIcon } from "lucide-react"
import {
  Table,
  TableIcon as TableBody,
  TableIcon as TableCell,
  TableIcon as TableHead,
  TableIcon as TableRow,
  AlertTriangle,
  Loader2,
} from "lucide-react"

interface NftMetadata {
  tokenId: number
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string }>
  uriStatus: "ok" | "broken" | "loading"
}

const dummyNfts: NftMetadata[] = [
  {
    tokenId: 1,
    name: "SmartScribe NFT #1",
    description: "A unique certificate from SmartScribe.",
    image: "/placeholder.svg?height=200&width=200",
    attributes: [{ trait_type: "Rarity", value: "Common" }],
    uriStatus: "ok",
  },
  {
    tokenId: 2,
    name: "SmartScribe NFT #2",
    description: "Another certificate, but with a broken image link.",
    image: "https://broken.link/image.png", // Simulate broken link
    attributes: [{ trait_type: "Rarity", value: "Rare" }],
    uriStatus: "broken",
  },
  {
    tokenId: 3,
    name: "SmartScribe NFT #3",
    description: "A certificate with multiple attributes.",
    image: "/placeholder.svg?height=200&width=200",
    attributes: [
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Background", value: "Blue" },
    ],
    uriStatus: "ok",
  },
]

interface NftMetadataInspectorProps {
  contractAddress: string // The NFT contract address
}

export function NftMetadataInspector({ contractAddress }: NftMetadataInspectorProps) {
  const [nfts, setNfts] = useState<NftMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenRange, setTokenRange] = useState("1-3") // Default range

  const fetchNftMetadata = async () => {
    setLoading(true)
    setError(null)
    setNfts([])

    console.log(`Simulating fetching NFT metadata for ${contractAddress} (tokens ${tokenRange})...`)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call

    try {
      // In a real scenario, you'd call tokenURI for each token ID
      // and then fetch the metadata JSON and check image URIs.
      // For now, we'll use dummy data.
      setNfts(dummyNfts)
    } catch (err: any) {
      setError("Failed to fetch NFT metadata. Please check the contract address and token range.")
      console.error("NFT fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-400" />
          NFT Metadata Inspector
        </CardTitle>
        <CardDescription>Preview NFT metadata and check for insecure or broken links.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Token IDs (e.g., 1-10)"
            value={tokenRange}
            onChange={(e) => setTokenRange(e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400"
            disabled={loading}
          />
          <Button onClick={fetchNftMetadata} disabled={loading || !contractAddress}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Inspect NFTs"}
          </Button>
        </div>

        {error && <div className="text-red-400 text-center py-4">{error}</div>}

        {nfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.tokenId} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      className="w-full h-48 object-cover rounded-md mb-2"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                        // In a real app, you'd update the nft.uriStatus state here
                      }}
                    />
                    {nft.uriStatus === "broken" && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Broken URI
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{nft.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{nft.description}</p>
                  {nft.attributes.length > 0 && (
                    <Table className="text-sm text-gray-300">
                      <TableHead>
                        <TableRow className="border-slate-600">
                          <TableCell className="text-gray-400">Trait Type</TableCell>
                          <TableCell className="text-gray-400">Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nft.attributes.map((attr, attrIndex) => (
                          <TableRow key={attrIndex} className="border-slate-700">
                            <TableCell className="font-medium">{attr.trait_type}</TableCell>
                            <TableCell>{attr.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

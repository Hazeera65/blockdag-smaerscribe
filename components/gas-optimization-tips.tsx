import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ExternalLink } from "lucide-react"

const gasTips = [
  {
    title: "Minimize Storage Writes",
    description: "Writing to storage is the most expensive operation. Cache values in memory when possible.",
    link: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html",
  },
  {
    title: "Pack Variables Efficiently",
    description: "Group smaller variables (e.g., uint8, uint16) into a single storage slot to save gas.",
    link: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#structs-and-array-data-layout",
  },
  {
    title: "Use `calldata` for External Parameters",
    description: "For external function parameters, use `calldata` instead of `memory` to avoid copying data.",
    link: "https://docs.soliditylang.org/en/latest/types.html#data-location",
  },
  {
    title: "Avoid Redundant Calculations",
    description: "Store results of complex calculations if they are used multiple times.",
    link: "#", // Placeholder link
  },
  {
    title: "Optimize Loops",
    description: "Be mindful of loops, especially over dynamic arrays. Consider gas limits.",
    link: "#", // Placeholder link
  },
  {
    title: "Use `view` and `pure` Functions",
    description: "Mark functions as `view` or `pure` when they don't modify state to make them free to call off-chain.",
    link: "https://docs.soliditylang.org/en/latest/contracts.html#view-functions",
  },
]

export function GasOptimizationTips() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Gas & Fee Optimization Tips
        </CardTitle>
        <CardDescription>Actionable recommendations to reduce transaction costs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {gasTips.map((tip, index) => (
            <div key={index} className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
              <h4 className="font-medium text-white text-lg mb-1">{tip.title}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{tip.description}</p>
              {tip.link && (
                <a
                  href={tip.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  Learn More <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Brain, FileText, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Contract",
    description: "Paste Solidity code or enter a contract address from any EVM-compatible blockchain.",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI processes the contract, identifying functions, risks, and security patterns.",
    step: "02",
  },
  {
    icon: FileText,
    title: "Get Results",
    description: "Receive comprehensive analysis with risk assessment, function breakdown, and security score.",
    step: "03",
  },
  {
    icon: MessageCircle,
    title: "Ask Questions",
    description: "Use our smart chatbot to ask specific questions about the contract in natural language.",
    step: "04",
  },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How SmartScribe Works</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Simple, fast, and intelligent smart contract analysis in four easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 relative">
              <CardHeader className="text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
                <step.icon className="h-12 w-12 text-blue-400 mx-auto mb-4 mt-4" />
                <CardTitle className="text-white text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Powered by advanced AI models</span>
          </div>
        </div>
      </div>
    </section>
  )
}

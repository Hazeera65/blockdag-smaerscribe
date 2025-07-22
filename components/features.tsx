import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Globe, MessageCircle, FileText, GitCompare, TrendingUp, Lock } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Security Analysis",
    description: "Comprehensive risk assessment with vulnerability detection and security scoring.",
    color: "text-green-400",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get detailed contract analysis in seconds with AI-powered processing.",
    color: "text-yellow-400",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Translate contract analysis into multiple languages including Tamil, Hindi, and more.",
    color: "text-blue-400",
  },
  {
    icon: MessageCircle,
    title: "Smart Chatbot",
    description: "Ask natural language questions about your contract and get intelligent answers.",
    color: "text-purple-400",
  },
  {
    icon: FileText,
    title: "Downloadable Reports",
    description: "Export detailed analysis as PDF or Markdown for documentation and sharing.",
    color: "text-orange-400",
  },
  {
    icon: GitCompare,
    title: "Contract Comparison",
    description: "Compare different versions of contracts to identify changes and improvements.",
    color: "text-cyan-400",
  },
  {
    icon: TrendingUp,
    title: "Market Integration",
    description: "Real-time crypto and stock market data via FinHub for contextual analysis.",
    color: "text-pink-400",
  },
  {
    icon: Lock,
    title: "Access Control Analysis",
    description: "Detailed breakdown of who can call which functions and their permission levels.",
    color: "text-red-400",
  },
]

export function Features() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Powerful Features for Smart Contract Analysis</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Everything you need to understand, analyze, and interact with Ethereum smart contracts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <feature.icon className={`h-8 w-8 ${feature.color} mb-2`} />
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

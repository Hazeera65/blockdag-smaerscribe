"use client"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent as DialogContentComponent,
  DialogHeader as DialogHeaderComponent,
  DialogFooter as DialogFooterComponent,
  DialogTitle as DialogTitleComponent,
  DialogDescription as DialogDescriptionComponent,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Globe,
  Shield,
  BarChart3,
  PieChart,
  Volume2,
  VolumeX,
  Loader2,
  Lightbulb,
  FileText,
} from "lucide-react"
import jsPDF from "jspdf"
import { GasOptimizationTips } from "./gas-optimization-tips"

interface ContractResultsProps {
  results: {
    contractName: string
    summary: string
    functions: Array<{
      name: string
      access: string
      risk: string
      description: string
    }>
    risks: Array<{
      level: string
      title: string
      description: string
    }>
    securityScore: number
    recommendations?: string[]
    isUpgradeable?: boolean
    hasOwnerPrivileges?: boolean
    tokenStandard?: string
    aiResponse?: string
  }
  contractAddress: string
}

// Helper function to strip markdown for display and PDF
const stripMarkdown = (text: string) => {
  let cleanedText = text

  // Remove markdown headers (e.g., ### Header)
  cleanedText = cleanedText.replace(/#{1,6}\s/g, "")

  // Remove bold/italic markers (e.g., **text**, *text*, __text__, _text_)
  cleanedText = cleanedText.replace(/\*\*([^*]+)\*\*/g, "$1")
  cleanedText = cleanedText.replace(/__([^_]+)__/g, "$1")
  cleanedText = cleanedText.replace(/\*([^*]+)\*/g, "$1")
  cleanedText = cleanedText.replace(/_([^_]+)_/g, "$1")

  // Remove list item markers (e.g., - item, * item, 1. item)
  cleanedText = cleanedText.replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, "")

  // Remove blockquote markers (e.g., > quote)
  cleanedText = cleanedText.replace(/^>\s*/gm, "")

  // Remove horizontal rules (e.g., ---, ***, ___)
  cleanedText = cleanedText.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, "")

  // Replace links with just the text (e.g., [text](url) -> text)
  cleanedText = cleanedText.replace(/\[(.*?)\]$$.*?$$/g, "$1")

  // Handle code blocks (\`\`\`code\`\`\`) - remove the backticks and trim whitespace
  cleanedText = cleanedText.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```/g, "").trim()
  })

  // Handle inline code (e.g., `code`) - remove the backticks
  cleanedText = cleanedText.replace(/`(.*?)`/g, "$1")

  return cleanedText.trim()
}

export function ContractResults({ results, contractAddress }: ContractResultsProps) {
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false)
  const [isSpeakingRecommendations, setIsSpeakingRecommendations] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [generatedProposal, setGeneratedProposal] = useState("")

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <XCircle className="h-4 w-4" />
      case "medium":
        return <AlertTriangle className="h-4 w-4" />
      case "low":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const speakText = (text: string, setIsSpeaking: (val: boolean) => void) => {
    if ("speechSynthesis" in window) {
      if (setIsSpeaking === setIsSpeakingSummary && isSpeakingSummary) {
        window.speechSynthesis.cancel()
        setIsSpeakingSummary(false)
        return
      }
      if (setIsSpeaking === setIsSpeakingRecommendations && isSpeakingRecommendations) {
        window.speechSynthesis.cancel()
        setIsSpeakingRecommendations(false)
        return
      }

      window.speechSynthesis.cancel() // Stop any other ongoing speech

      const cleanText = stripMarkdown(text)

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const generatePdfReport = () => {
    const doc = new jsPDF()
    let y = 20 // Initial Y position
    const margin = 10
    const lineHeight = 7 // Approximate line height
    const maxPageHeight = 280 // Max Y position before adding a new page

    const addText = (text: string, x: number, yPos: number, fontSize = 12, fontStyle = "normal") => {
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", fontStyle)
      const splitText = doc.splitTextToSize(text, 190 - x) // Max width based on x position
      let currentY = yPos

      splitText.forEach((line) => {
        if (currentY > maxPageHeight) {
          doc.addPage()
          currentY = margin + 10 // Reset Y for new page, with a small top margin
        }
        doc.text(line, x, currentY)
        currentY += lineHeight
      })
      return currentY
    }

    y = addText("SMART CONTRACT ANALYSIS REPORT", margin, y, 22, "bold")
    y = addText("Generated by SmartScribe AI", margin, y, 12)
    y += 10 // Add some space

    y = addText(`Contract Name: ${results.contractName}`, margin, y, 14, "bold")
    y = addText(`Security Score: ${results.securityScore}/10`, margin, y)
    y = addText(`Token Standard: ${results.tokenStandard || "Custom"}`, margin, y)
    y = addText(`Upgradeable: ${results.isUpgradeable ? "Yes" : "No"}`, margin, y)
    y = addText(`Owner Privileges: ${results.hasOwnerPrivileges ? "High" : "Low"}`, margin, y)

    y = addText(`\nSUMMARY:`, margin, y, 14, "bold")
    y = addText(stripMarkdown(results.summary), margin, y)

    y = addText(`\nFUNCTIONS ANALYSIS:`, margin, y, 14, "bold")
    results.functions.forEach((func) => {
      y = addText(`- ${func.name}()`, margin + 5, y, 12, "bold")
      y = addText(`  Access: ${func.access}`, margin + 5, y)
      y = addText(`  Risk Level: ${func.risk.toUpperCase()}`, margin + 5, y)
      y = addText(`  Description: ${stripMarkdown(func.description)}`, margin + 5, y)
      y += 5
    })

    y = addText(`\nRISK ASSESSMENT:`, margin, y, 14, "bold")
    results.risks.forEach((risk) => {
      y = addText(`- ${risk.title} (${risk.level.toUpperCase()} RISK)`, margin + 5, y, 12, "bold")
      y = addText(`  ${stripMarkdown(risk.description)}`, margin + 5, y)
      y += 5
    })

    if (results.recommendations && results.recommendations.length > 0) {
      y = addText(`\nRECOMMENDATIONS:`, margin, y, 14, "bold")
      results.recommendations.forEach((rec) => {
        y = addText(`- ${stripMarkdown(rec)}`, margin + 5, y)
        y += 2
      })
    }

    y = addText(`\nGenerated on: ${new Date().toLocaleString()}`, margin, y, 10, "italic")
    y = addText(`Powered by SmartScribe AI & Grok AI`, margin, y, 10, "italic")

    doc.save(`${results.contractName.replace(/\s+/g, "_")}_analysis_report.pdf`)
  }

  const handleTranslateSummary = async (targetLanguage: string) => {
    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: results.summary,
          targetLanguage: targetLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      alert(`Translated Summary (${targetLanguage}):\n\n${data.translatedText}`)
    } catch (error: any) {
      console.error("Translation error:", error)
      alert(`Failed to translate: ${error.message}`)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleGenerateProposal = () => {
    const proposalTitle = `Proposal: Action for ${results.contractName} Contract`
    const proposalBody = `
## Summary
This proposal outlines actions regarding the **${results.contractName}** smart contract, which has a security score of **${results.securityScore}/10**.

## Identified Risks
${results.risks.map((risk) => `- **${stripMarkdown(risk.title)}** (${risk.level.toUpperCase()}): ${stripMarkdown(risk.description)}`).join("\n")}

## Recommendations
${results.recommendations?.map((rec) => `- ${stripMarkdown(rec)}`).join("\n") || "No specific recommendations provided."}

## Proposed Action
Based on the analysis, we propose the following action:
[Describe the specific action, e.g., "Upgrade the contract to a new version to address identified vulnerabilities," "Transfer ownership to a DAO multisig wallet," "Pause critical functions until a re-audit is complete."]

## Rationale
This action is necessary to [explain why the action is needed, e.g., "enhance security," "decentralize control," "prevent potential exploits"].

## Voting Options
*   For
*   Against
*   Abstain

---
*Contract Address: ${contractAddress || "N/A"}*
*Generated by SmartScribe AI*
  `
    setGeneratedProposal(proposalBody.trim())
    setShowProposalModal(true)
  }

  // Calculate risk distribution for visualization
  const riskDistribution = results.risks.reduce(
    (acc, risk) => {
      acc[risk.level] = (acc[risk.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Contract Overview with Voice */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-white flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-blue-400" />
                {results.contractName}
              </CardTitle>
              <CardDescription className="mt-2 text-lg">{stripMarkdown(results.summary)}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white mb-2">{results.securityScore}/10</div>
              <div className="text-sm text-gray-400">Security Score</div>
              <Button
                onClick={() => speakText(results.summary, setIsSpeakingSummary)}
                variant="outline"
                size="sm"
                className="mt-2 border-slate-600 text-white bg-transparent hover:bg-slate-700"
              >
                {isSpeakingSummary ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isSpeakingSummary ? "Stop Summary" : "Listen Summary"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={results.securityScore * 10} className="mb-6 h-3" />

          {/* Enhanced Contract Properties */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-lg border border-blue-600/30">
              <div className="text-sm text-blue-300">Token Standard</div>
              <div className="font-medium text-white">{results.tokenStandard || "Custom"}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-lg border border-purple-600/30">
              <div className="text-sm text-purple-300">Upgradeable</div>
              <div className={`font-medium ${results.isUpgradeable ? "text-yellow-400" : "text-green-400"}`}>
                {results.isUpgradeable ? "Yes" : "No"}
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-lg border border-red-600/30">
              <div className="text-sm text-red-300">Owner Control</div>
              <div className={`font-medium ${results.hasOwnerPrivileges ? "text-red-400" : "text-green-400"}`}>
                {results.hasOwnerPrivileges ? "High" : "Low"}
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-lg border border-green-600/30">
              <div className="text-sm text-green-300">Functions</div>
              <div className="font-medium text-white">{results.functions.length}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-lg border border-orange-600/30">
              <div className="text-sm text-orange-300">Risks Found</div>
              <div className="font-medium text-white">{results.risks.length}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={generatePdfReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report (PDF)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
              onClick={() => handleTranslateSummary("ta")} // 'ta' for Tamil
              disabled={isTranslating}
            >
              {isTranslating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
              {isTranslating ? "Translating..." : "Translate (Tamil)"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
              onClick={handleGenerateProposal}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Proposal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-blue-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600">
            <PieChart className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="gas-optimization" className="data-[state=active]:bg-blue-600">
            <Lightbulb className="h-4 w-4 mr-2" />
            Gas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Visualization */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(riskDistribution).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className={`w-4 h-4 rounded ${getRiskColor(level)}`} />
                      <span className="text-white capitalize">{level} Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getRiskColor(level)}`}
                            style={{ width: `${(count / results.risks.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Metrics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Overall Security</span>
                    <div className="flex items-center gap-2">
                      <Progress value={results.securityScore * 10} className="w-20" />
                      <span className="text-white font-medium">{results.securityScore}/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Function Safety</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          (results.functions.filter((f) => f.risk === "low").length / results.functions.length) * 100
                        }
                        className="w-20"
                      />
                      <span className="text-white font-medium">
                        {Math.round(
                          (results.functions.filter((f) => f.risk === "low").length / results.functions.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Access Control</span>
                    <div className="flex items-center gap-2">
                      <Progress value={results.hasOwnerPrivileges ? 60 : 90} className="w-20" />
                      <span className="text-white font-medium">{results.hasOwnerPrivileges ? "60%" : "90%"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Risk Assessment
              </CardTitle>
              <CardDescription>Comprehensive security risks and vulnerabilities identified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {results.risks.map((risk, index) => (
                  <div
                    key={index}
                    className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white ${getRiskColor(risk.level)}`}
                      >
                        {getRiskIcon(risk.level)}
                        {risk.level.toUpperCase()} RISK
                      </div>
                      <h4 className="font-medium text-white text-lg">{risk.title}</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{stripMarkdown(risk.description)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {results.recommendations && results.recommendations.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Security recommendations and best practices from AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {results.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 leading-relaxed">{stripMarkdown(rec)}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => speakText(results.recommendations.join(". "), setIsSpeakingRecommendations)}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-slate-600 text-white bg-transparent hover:bg-slate-700"
                >
                  {isSpeakingRecommendations ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isSpeakingRecommendations ? "Stop Recommendations" : "Listen Recommendations"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gas-optimization" className="mt-6">
          <GasOptimizationTips />
        </TabsContent>
      </Tabs>

      {/* Governance Proposal Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContentComponent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
          <DialogHeaderComponent>
            <DialogTitleComponent className="text-white">Governance Proposal Draft</DialogTitleComponent>
            <DialogDescriptionComponent className="text-gray-400">
              A draft proposal based on the contract analysis. Copy and adapt for your DAO.
            </DialogDescriptionComponent>
          </DialogHeaderComponent>
          <div className="grid gap-4 py-4">
            <Textarea
              value={generatedProposal}
              readOnly
              className="min-h-[300px] bg-slate-900/50 border-slate-600 text-white font-mono"
            />
          </div>
          <DialogFooterComponent>
            <Button
              onClick={() => navigator.clipboard.writeText(generatedProposal)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Copy to Clipboard
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowProposalModal(false)}
              className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
            >
              Close
            </Button>
          </DialogFooterComponent>
        </DialogContentComponent>
      </Dialog>
    </div>
  )
}

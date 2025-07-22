"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, Loader2, Code, FileText, ExternalLink, GitCompare, RotateCcw } from "lucide-react"
import { ContractResults } from "@/components/contract-results"
import { ContractComparison } from "@/components/contract-comparison"
import { SAMPLE_CONTRACT } from "@/components/sample-contract"
import { ContractInfoCard } from "@/components/contract-info-card"
import { compareAnalysisResults, createRemixProject } from "@/lib/comparison-utils"

export function ContractAnalyzer() {
  const [contractInput, setContractInput] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFetchingSource, setIsFetchingSource] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("input")
  const [error, setError] = useState("")
  const [showContractInfo, setShowContractInfo] = useState(false)

  // Playground state
  const [playgroundCode, setPlaygroundCode] = useState(SAMPLE_CONTRACT)
  const [playgroundAnalysisResults, setPlaygroundAnalysisResults] = useState<any>(null)
  const [isPlaygroundAnalyzing, setIsPlaygroundAnalyzing] = useState(false)

  // Comparison state
  const [originalCode, setOriginalCode] = useState("")
  const [originalAnalysis, setOriginalAnalysis] = useState<any>(null)
  const [comparisonResults, setComparisonResults] = useState<any>(null)
  const [showComparison, setShowComparison] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")

  const handleAnalyzeCode = useCallback(
    async (codeToAnalyze: string, isPlayground = false) => {
      if (!codeToAnalyze.trim()) {
        setError("Please enter Solidity code")
        return
      }

      if (isPlayground) {
        setIsPlaygroundAnalyzing(true)
        setPlaygroundAnalysisResults(null)
      } else {
        setIsAnalyzing(true)
        setError("")
        setAnalysisResults(null)
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contractCode: codeToAnalyze,
          }),
        })

        const results = await response.json()

        if (!response.ok) {
          throw new Error(results.error || "Analysis failed due to an unknown error.")
        }

        if (isPlayground) {
          setPlaygroundAnalysisResults(results)

          // If we have original analysis, create comparison
          if (originalAnalysis && originalCode) {
            const comparison = compareAnalysisResults(originalAnalysis, results, originalCode, codeToAnalyze)
            setComparisonResults(comparison)
            setShowComparison(true)
          } else {
            // Set this as the original for future comparisons
            setOriginalCode(codeToAnalyze)
            setOriginalAnalysis(results)
          }
        } else {
          setAnalysisResults(results)
          setActiveTab("results")
        }
      } catch (error: any) {
        console.error("Analysis error:", error)
        setError(error.message || "Failed to analyze contract. Please try again.")
      } finally {
        if (isPlayground) {
          setIsPlaygroundAnalyzing(false)
        } else {
          setIsAnalyzing(false)
        }
      }
    },
    [originalAnalysis, originalCode], // Dependencies for comparison
  )

  const handleStartAIAnalysis = useCallback(
    async (addressToAnalyze: string) => {
      if (!addressToAnalyze.trim()) {
        setError("No contract address provided for analysis.")
        return
      }

      setIsFetchingSource(true)
      setIsAnalyzing(true)
      setError("")
      setAnalysisResults(null)
      setShowContractInfo(false)

      try {
        const fetchSourceResponse = await fetch("/api/fetch-contract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: addressToAnalyze,
          }),
        })

        const sourceData = await fetchSourceResponse.json()

        if (!fetchSourceResponse.ok) {
          setError(sourceData.error || "Failed to fetch contract source code for analysis.")
          setShowContractInfo(true)
          return
        }

        // Now that we have the source code, call handleAnalyzeCode
        await handleAnalyzeCode(sourceData.sourceCode)
        setContractAddress(addressToAnalyze) // Ensure address is set for ContractResults
      } catch (error: any) {
        console.error("Fetch/Analysis error:", error)
        setError(error.message || "An unexpected error occurred during fetch or analysis. Please try again.")
      } finally {
        setIsFetchingSource(false)
        setIsAnalyzing(false)
      }
    },
    [handleAnalyzeCode], // Dependency on handleAnalyzeCode
  )

  const handleGetContractInfo = useCallback(() => {
    if (!contractAddress.trim() || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      setError("Please enter a valid Ethereum address to get info.")
      return
    }
    setError("")
    setAnalysisResults(null)
    setShowContractInfo(true)
  }, [contractAddress])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
      const reader = new FileReader()
      reader.onload = (e) => {
        setFileContent(e.target?.result as string)
      }
      reader.onerror = () => {
        setError("Failed to read file.")
        setFileContent("")
      }
      reader.readAsText(file)
    } else {
      setSelectedFile(null)
      setFileContent("")
    }
  }

  const handleOpenRemix = () => {
    const codeToOpen = playgroundCode || contractInput || fileContent
    const contractName = playgroundAnalysisResults?.contractName || analysisResults?.contractName || "Contract"

    if (codeToOpen.trim()) {
      const remixUrl = createRemixProject(codeToOpen, contractName)
      window.open(remixUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleResetComparison = () => {
    setOriginalCode("")
    setOriginalAnalysis(null)
    setComparisonResults(null)
    setShowComparison(false)
    setPlaygroundCode(SAMPLE_CONTRACT)
    setPlaygroundAnalysisResults(null)
  }

  const handleSetAsOriginal = () => {
    if (playgroundAnalysisResults && playgroundCode) {
      setOriginalCode(playgroundCode)
      setOriginalAnalysis(playgroundAnalysisResults)
      setComparisonResults(null)
      setShowComparison(false)
    }
  }

  useEffect(() => {
    const handleSelectContract = (event: Event) => {
      const customEvent = event as CustomEvent
      const address = customEvent.detail
      if (address) {
        setContractAddress(address)
        setActiveTab("address") // Switch to the address tab
        // Trigger analysis immediately after setting address
        handleStartAIAnalysis(address)
      }
    }

    window.addEventListener("selectContract", handleSelectContract)

    return () => {
      window.removeEventListener("selectContract", handleSelectContract)
    }
  }, [handleStartAIAnalysis]) // Add handleStartAIAnalysis to dependencies

  return (
    <section id="contract-analyzer" className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Analyze Your Smart Contract</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Paste your Solidity code, enter a contract address, or upload a file to get instant AI-powered analysis
            using Grok AI with real-time comparison and Remix IDE integration
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="input" className="data-[state=active]:bg-blue-600">
              Paste Code
            </TabsTrigger>
            <TabsTrigger value="address" className="data-[state=active]:bg-blue-600">
              Address
            </TabsTrigger>
            <TabsTrigger value="file-upload" className="data-[state=active]:bg-blue-600">
              Upload File
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResults}>
              Results
            </TabsTrigger>
            <TabsTrigger value="playground">Playground</TabsTrigger>
            <TabsTrigger value="comparison" disabled={!showComparison}>
              Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">{error}</div>
            )}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Solidity Code
                </CardTitle>
                <CardDescription>Paste your smart contract source code for AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="pragma solidity ^0.8.0;

contract MyToken {
    // Your contract code here...
}"
                  value={contractInput}
                  onChange={(e) => setContractInput(e.target.value)}
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContractInput(SAMPLE_CONTRACT)}
                    className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                  >
                    Try Sample Contract
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContractInput("")}
                    className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenRemix}
                    disabled={!contractInput.trim()}
                    className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Remix
                  </Button>
                </div>
                <Button
                  onClick={() => handleAnalyzeCode(contractInput)}
                  disabled={!contractInput.trim() || isAnalyzing}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    "Analyze Code with Grok AI"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="mt-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">{error}</div>
            )}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Contract Address
                </CardTitle>
                <CardDescription>Enter an Ethereum contract address to fetch and analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartAIAnalysis(contractAddress)}
                    disabled={isFetchingSource || isAnalyzing}
                    className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                  >
                    {isFetchingSource || isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Contract"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGetContractInfo}
                    disabled={isFetchingSource || isAnalyzing}
                    className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                  >
                    Get Contract Info
                  </Button>
                </div>
              </CardContent>
            </Card>
            {showContractInfo && (
              <ContractInfoCard address={contractAddress} error={error} onAnalyze={handleStartAIAnalysis} />
            )}
          </TabsContent>

          <TabsContent value="file-upload" className="mt-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">{error}</div>
            )}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Solidity File
                </CardTitle>
                <CardDescription>Upload a .sol file for AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="file"
                  accept=".sol"
                  onChange={handleFileChange}
                  className="mb-4 bg-slate-900/50 border-slate-600 text-white file:text-blue-400 file:bg-slate-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-2"
                />
                {selectedFile && (
                  <div className="mb-4 text-gray-300 text-sm">
                    Selected file: <span className="font-medium">{selectedFile.name}</span> (
                    {(selectedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
                <Textarea
                  placeholder="File content will appear here..."
                  value={fileContent}
                  readOnly
                  className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenRemix}
                    disabled={!fileContent.trim()}
                    className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Remix
                  </Button>
                </div>
                <Button
                  onClick={() => handleAnalyzeCode(fileContent)}
                  disabled={!fileContent.trim() || isAnalyzing}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing File...
                    </>
                  ) : (
                    "Analyze File with Grok AI"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {analysisResults ? (
              <ContractResults results={analysisResults} contractAddress={contractAddress} />
            ) : (
              <div className="text-center mt-6">
                <p className="text-gray-300">No analysis results available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="playground" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Code Playground with Real-time Comparison
                    </CardTitle>
                    <CardDescription>
                      Edit contract code and see real-time security analysis comparison with Remix IDE integration
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {originalAnalysis && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSetAsOriginal}
                        className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Set as Original
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetComparison}
                      className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                    >
                      Reset Comparison
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenRemix}
                      disabled={!playgroundCode.trim()}
                      className="border-slate-600 text-gray-300 bg-transparent hover:bg-slate-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Remix
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Edit your Solidity code here..."
                  value={playgroundCode}
                  onChange={(e) => setPlaygroundCode(e.target.value)}
                  className="min-h-[300px] bg-slate-900/50 border-slate-600 text-white placeholder:text-gray-400 font-mono"
                />
                <Button
                  onClick={() => handleAnalyzeCode(playgroundCode, true)}
                  disabled={!playgroundCode.trim() || isPlaygroundAnalyzing}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isPlaygroundAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing & Comparing...
                    </>
                  ) : (
                    <>
                      <GitCompare className="mr-2 h-4 w-4" />
                      Analyze & Compare Changes
                    </>
                  )}
                </Button>

                {playgroundAnalysisResults && !showComparison && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Analysis Results:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Security Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white font-bold text-2xl">{playgroundAnalysisResults.securityScore}/10</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Risks Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white font-bold text-2xl">{playgroundAnalysisResults.risks.length}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {playgroundAnalysisResults.risks.some((r: any) => r.level === "high")
                              ? "High Risk"
                              : playgroundAnalysisResults.risks.some((r: any) => r.level === "medium")
                                ? "Medium Risk"
                                : "Low Risk"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white font-bold text-2xl">
                            {playgroundAnalysisResults.recommendations?.length || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            {showComparison && comparisonResults && originalAnalysis && playgroundAnalysisResults ? (
              <ContractComparison
                comparison={comparisonResults}
                originalAnalysis={originalAnalysis}
                modifiedAnalysis={playgroundAnalysisResults}
                onOpenRemix={handleOpenRemix}
                onResetComparison={handleResetComparison}
              />
            ) : (
              <div className="text-center mt-6">
                <p className="text-gray-300">
                  No comparison data available. Make changes in the playground to see comparisons.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

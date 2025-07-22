"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X,
  ArrowRight,
  Code,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import type { ComparisonResult } from "@/lib/comparison-utils"

interface ContractComparisonProps {
  comparison: ComparisonResult
  originalAnalysis: any
  modifiedAnalysis: any
  onOpenRemix: () => void
  onResetComparison: () => void
}

export function ContractComparison({
  comparison,
  originalAnalysis,
  modifiedAnalysis,
  onOpenRemix,
  onResetComparison,
}: ContractComparisonProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getImprovementIcon = (improvement: string) => {
    switch (improvement) {
      case "better":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "worse":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getImprovementColor = (improvement: string) => {
    switch (improvement) {
      case "better":
        return "text-green-400 bg-green-900/20 border-green-700/50"
      case "worse":
        return "text-red-400 bg-red-900/20 border-red-700/50"
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-700/50"
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

  return (
    <div className="space-y-6">
      {/* Comparison Overview */}
      <Card
        className={`bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700 ${getImprovementColor(comparison.improvement)}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getImprovementIcon(comparison.improvement)}
              <div>
                <CardTitle className="text-white text-2xl">Code Comparison Results</CardTitle>
                <CardDescription className="text-lg mt-2">{comparison.summary}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onOpenRemix} className="bg-blue-600 hover:bg-blue-700" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Remix
              </Button>
              <Button
                onClick={onResetComparison}
                variant="outline"
                className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Security Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <div className="text-sm text-gray-300 mb-2">Original Score</div>
              <div className="text-3xl font-bold text-white">{originalAnalysis.securityScore}/10</div>
              <Progress value={originalAnalysis.securityScore * 10} className="mt-2" />
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-blue-400" />
            </div>

            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <div className="text-sm text-gray-300 mb-2">Modified Score</div>
              <div className="text-3xl font-bold text-white">{modifiedAnalysis.securityScore}/10</div>
              <Progress value={modifiedAnalysis.securityScore * 10} className="mt-2" />
              {comparison.securityScoreChange !== 0 && (
                <div
                  className={`text-sm mt-2 flex items-center justify-center gap-1 ${
                    comparison.securityScoreChange > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {comparison.securityScoreChange > 0 ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {Math.abs(comparison.securityScoreChange).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-blue-600">
            Risk Changes
          </TabsTrigger>
          <TabsTrigger value="functions" className="data-[state=active]:bg-blue-600">
            Functions
          </TabsTrigger>
          <TabsTrigger value="code" className="data-[state=active]:bg-blue-600">
            Code Diff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Risk Changes Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.riskChanges.added.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-red-400" />
                        <span className="text-red-400">New Risks</span>
                      </div>
                      <Badge variant="destructive">{comparison.riskChanges.added.length}</Badge>
                    </div>
                  )}

                  {comparison.riskChanges.removed.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Resolved Risks</span>
                      </div>
                      <Badge className="bg-green-600">{comparison.riskChanges.removed.length}</Badge>
                    </div>
                  )}

                  {comparison.riskChanges.modified.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400">Modified Risks</span>
                      </div>
                      <Badge className="bg-yellow-600">{comparison.riskChanges.modified.length}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Function Summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Function Changes Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.functionChanges.added.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-400">New Functions</span>
                      </div>
                      <Badge className="bg-blue-600">{comparison.functionChanges.added.length}</Badge>
                    </div>
                  )}

                  {comparison.functionChanges.removed.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-900/20 border border-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">Removed Functions</span>
                      </div>
                      <Badge variant="secondary">{comparison.functionChanges.removed.length}</Badge>
                    </div>
                  )}

                  {comparison.functionChanges.modified.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-400">Modified Functions</span>
                      </div>
                      <Badge className="bg-purple-600">{comparison.functionChanges.modified.length}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <div className="space-y-6">
            {/* Added Risks */}
            {comparison.riskChanges.added.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-red-400" />
                    New Risks Introduced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparison.riskChanges.added.map((risk, index) => (
                      <div key={index} className="border border-red-700/50 rounded-lg p-4 bg-red-900/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white ${getRiskColor(risk.level)}`}
                          >
                            {getRiskIcon(risk.level)}
                            {risk.level.toUpperCase()}
                          </div>
                          <h4 className="font-medium text-white">{risk.title}</h4>
                        </div>
                        <p className="text-gray-300 text-sm">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Removed Risks */}
            {comparison.riskChanges.removed.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Risks Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparison.riskChanges.removed.map((risk, index) => (
                      <div key={index} className="border border-green-700/50 rounded-lg p-4 bg-green-900/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white ${getRiskColor(risk.level)}`}
                          >
                            {getRiskIcon(risk.level)}
                            {risk.level.toUpperCase()}
                          </div>
                          <h4 className="font-medium text-white">{risk.title}</h4>
                        </div>
                        <p className="text-gray-300 text-sm">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modified Risks */}
            {comparison.riskChanges.modified.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-yellow-400" />
                    Modified Risks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comparison.riskChanges.modified.map((change, index) => (
                      <div key={index} className="border border-yellow-700/50 rounded-lg p-4 bg-yellow-900/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-400 mb-2">Before:</div>
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white ${getRiskColor(change.before.level)}`}
                              >
                                {getRiskIcon(change.before.level)}
                                {change.before.level.toUpperCase()}
                              </div>
                              <h4 className="font-medium text-white">{change.before.title}</h4>
                            </div>
                            <p className="text-gray-300 text-sm">{change.before.description}</p>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400 mb-2">After:</div>
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white ${getRiskColor(change.after.level)}`}
                              >
                                {getRiskIcon(change.after.level)}
                                {change.after.level.toUpperCase()}
                              </div>
                              <h4 className="font-medium text-white">{change.after.title}</h4>
                            </div>
                            <p className="text-gray-300 text-sm">{change.after.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="functions" className="mt-6">
          <div className="space-y-6">
            {/* Added Functions */}
            {comparison.functionChanges.added.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-400" />
                    New Functions Added
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparison.functionChanges.added.map((func, index) => (
                      <div key={index} className="border border-blue-700/50 rounded-lg p-4 bg-blue-900/10">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">{func.name}()</code>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {func.access}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${getRiskColor(func.risk)}`}
                          >
                            {func.risk.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{func.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Removed Functions */}
            {comparison.functionChanges.removed.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-400" />
                    Functions Removed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparison.functionChanges.removed.map((func, index) => (
                      <div key={index} className="border border-gray-700/50 rounded-lg p-4 bg-gray-900/10">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="bg-slate-700 px-2 py-1 rounded text-gray-300">{func.name}()</code>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {func.access}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${getRiskColor(func.risk)}`}
                          >
                            {func.risk.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{func.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Differences
              </CardTitle>
              <CardDescription>Line-by-line comparison of your code changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm">
                  {comparison.codeChanges.map((change, index) => (
                    <div
                      key={index}
                      className={`${
                        change.type === "added"
                          ? "bg-green-900/30 text-green-300"
                          : change.type === "removed"
                            ? "bg-red-900/30 text-red-300"
                            : "text-gray-300"
                      } ${change.type !== "unchanged" ? "px-2 py-1" : ""}`}
                    >
                      <span className="text-gray-500 mr-4 select-none">
                        {change.type === "added" ? "+" : change.type === "removed" ? "-" : " "}
                      </span>
                      {change.value}
                    </div>
                  ))}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { diffLines } from "diff"

export interface ComparisonResult {
  securityScoreChange: number
  riskChanges: {
    added: Array<{ level: string; title: string; description: string }>
    removed: Array<{ level: string; title: string; description: string }>
    modified: Array<{
      before: { level: string; title: string; description: string }
      after: { level: string; title: string; description: string }
    }>
  }
  functionChanges: {
    added: Array<{ name: string; access: string; risk: string; description: string }>
    removed: Array<{ name: string; access: string; risk: string; description: string }>
    modified: Array<{
      before: { name: string; access: string; risk: string; description: string }
      after: { name: string; access: string; risk: string; description: string }
    }>
  }
  codeChanges: Array<{
    type: "added" | "removed" | "unchanged"
    value: string
    lineNumber?: number
  }>
  summary: string
  improvement: "better" | "worse" | "neutral"
}

export function compareAnalysisResults(
  originalAnalysis: any,
  modifiedAnalysis: any,
  originalCode: string,
  modifiedCode: string,
): ComparisonResult {
  // Calculate security score change
  const securityScoreChange = modifiedAnalysis.securityScore - originalAnalysis.securityScore

  // Compare risks
  const originalRisks = originalAnalysis.risks || []
  const modifiedRisks = modifiedAnalysis.risks || []

  const riskChanges = {
    added: modifiedRisks.filter((risk: any) => !originalRisks.some((orig: any) => orig.title === risk.title)),
    removed: originalRisks.filter((risk: any) => !modifiedRisks.some((mod: any) => mod.title === risk.title)),
    modified: [] as any[],
  }

  // Find modified risks
  originalRisks.forEach((origRisk: any) => {
    const modRisk = modifiedRisks.find((risk: any) => risk.title === origRisk.title)
    if (modRisk && (origRisk.level !== modRisk.level || origRisk.description !== modRisk.description)) {
      riskChanges.modified.push({
        before: origRisk,
        after: modRisk,
      })
    }
  })

  // Compare functions
  const originalFunctions = originalAnalysis.functions || []
  const modifiedFunctions = modifiedAnalysis.functions || []

  const functionChanges = {
    added: modifiedFunctions.filter((func: any) => !originalFunctions.some((orig: any) => orig.name === func.name)),
    removed: originalFunctions.filter((func: any) => !modifiedFunctions.some((mod: any) => mod.name === func.name)),
    modified: [] as any[],
  }

  // Find modified functions
  originalFunctions.forEach((origFunc: any) => {
    const modFunc = modifiedFunctions.find((func: any) => func.name === origFunc.name)
    if (modFunc && (origFunc.risk !== modFunc.risk || origFunc.access !== modFunc.access)) {
      functionChanges.modified.push({
        before: origFunc,
        after: modFunc,
      })
    }
  })

  // Compare code changes
  const codeDiff = diffLines(originalCode, modifiedCode)
  const codeChanges = codeDiff.map((part, index) => ({
    type: part.added ? ("added" as const) : part.removed ? ("removed" as const) : ("unchanged" as const),
    value: part.value,
    lineNumber: index + 1,
  }))

  // Generate summary
  let summary = ""
  let improvement: "better" | "worse" | "neutral" = "neutral"

  if (securityScoreChange > 0) {
    summary += `Security score improved by ${securityScoreChange.toFixed(1)} points. `
    improvement = "better"
  } else if (securityScoreChange < 0) {
    summary += `Security score decreased by ${Math.abs(securityScoreChange).toFixed(1)} points. `
    improvement = "worse"
  } else {
    summary += "Security score remained the same. "
  }

  if (riskChanges.added.length > 0) {
    summary += `${riskChanges.added.length} new risk(s) introduced. `
    if (improvement !== "worse") improvement = "worse"
  }

  if (riskChanges.removed.length > 0) {
    summary += `${riskChanges.removed.length} risk(s) resolved. `
    if (improvement !== "better") improvement = "better"
  }

  if (functionChanges.added.length > 0) {
    summary += `${functionChanges.added.length} new function(s) added. `
  }

  if (functionChanges.removed.length > 0) {
    summary += `${functionChanges.removed.length} function(s) removed. `
  }

  return {
    securityScoreChange,
    riskChanges,
    functionChanges,
    codeChanges,
    summary: summary.trim() || "No significant changes detected.",
    improvement,
  }
}

export function generateRemixUrl(contractCode: string, contractName = "Contract"): string {
  // Encode the contract code for URL
  const encodedCode = encodeURIComponent(contractCode)

  // Create Remix IDE URL with the contract code
  const remixBaseUrl = "https://remix.ethereum.org"
  const remixUrl = `${remixBaseUrl}/#code=${encodedCode}&autoCompile=true&lang=en&optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.19+commit.7dd6d404.js`

  return remixUrl
}

export function createRemixProject(contractCode: string, contractName: string): string {
  // Create a more sophisticated Remix project structure
  const projectStructure = {
    "contracts/": {
      [`${contractName}.sol`]: contractCode,
      "README.md": `# ${contractName} Smart Contract\n\nThis contract was analyzed using SmartScribe AI.\n\n## Analysis Results\n- Generated on: ${new Date().toISOString()}\n- Platform: SmartScribe AI\n\n## Instructions\n1. Compile the contract using Solidity compiler\n2. Deploy to test network for testing\n3. Run unit tests if available\n\n## Security Notes\nThis contract has been analyzed by AI. Please conduct a thorough manual review and professional audit before mainnet deployment.`,
    },
    "tests/": {
      [`${contractName}.test.js`]: `// Test file for ${contractName}\n// Add your tests here\n\nconst { expect } = require("chai");\n\ndescribe("${contractName}", function () {\n  it("Should deploy successfully", async function () {\n    // Add deployment test\n  });\n});`,
    },
  }

  // Convert to Remix-compatible format
  const remixProject = JSON.stringify(projectStructure, null, 2)
  return `https://remix.ethereum.org/#activate=solidity,udapp&call=fileManager//open//contracts/${contractName}.sol&template=${encodeURIComponent(remixProject)}`
}

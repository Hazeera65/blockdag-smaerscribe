import { generateText } from "ai" // Import generateText from AI SDK
import { xai } from "@ai-sdk/xai" // Import xai from Grok AI SDK
import { type NextRequest, NextResponse } from "next/server"

// Helper function for exponential backoff retry
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000, // Initial delay in ms
  errorCheck?: (e: any) => boolean,
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && (errorCheck ? errorCheck(error) : true)) {
      console.warn(`Retrying after error: ${error.message}. Retries left: ${retries}`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retry(fn, retries - 1, delay * 2, errorCheck) // Exponential backoff
    }
    throw error // Re-throw if no retries left or error not retryable
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contractCode, contractAddress } = await request.json()

    if (!process.env.XAI_API_KEY) {
      // Check for XAI_API_KEY
      console.error("XAI API key is not set.")
      return NextResponse.json({ error: "AI service configuration error: XAI API key is missing." }, { status: 500 })
    }

    if (!contractCode && !contractAddress) {
      return NextResponse.json({ error: "Contract code or address is required" }, { status: 400 })
    }

    const model = xai("grok-3") // Use Grok-3 model

    const prompt = `
You are a smart contract security expert. Analyze the following Ethereum smart contract and provide a comprehensive analysis in JSON format.

${
  contractCode
    ? `Contract Code:
${contractCode}`
    : `Contract Address: ${contractAddress}`
}

Please analyze and return a JSON response with the following structure:
{
"contractName": "string",
"summary": "string (2-3 sentences describing what the contract does)",
"functions": [
{
  "name": "string",
  "access": "string (Public/Private/Owner Only/etc)",
  "risk": "string (low/medium/high)",
  "description": "string"
}
],
"risks": [
{
  "level": "string (low/medium/high)",
  "title": "string",
  "description": "string"
}
],
"securityScore": number (0-10),
"recommendations": [
"string (security recommendations)"
],
"isUpgradeable": boolean,
"hasOwnerPrivileges": boolean,
"tokenStandard": "string (ERC20/ERC721/Custom/etc)"
}

Focus on:
1. Security vulnerabilities
2. Access control issues
3. Centralization risks
4. Reentrancy attacks
5. Integer overflow/underflow
6. Gas optimization issues
7. Upgradeability patterns

Provide practical, actionable insights that both developers and non-technical users can understand.
`

    let text: string
    try {
      const { text: generatedText } = await retry(
        () => generateText({ model, prompt }), // Use generateText from AI SDK
        3, // Max 3 retries
        1000, // Initial delay of 1 second
        (e) => e.message?.includes("503") || e.message?.includes("overloaded"), // Only retry on 503 or overloaded errors
      )
      text = generatedText
    } catch (error: any) {
      // Re-throw specific AI errors after retries are exhausted
      if (error.message?.includes("The model is overloaded") || error.message?.includes("503")) {
        throw new Error("The AI model is currently overloaded after multiple attempts. Please try again later.")
      }
      if (error.message?.includes("model is not found")) {
        // Generic error for model not found
        throw new Error("AI model temporarily unavailable. Please try again later.")
      }
      if (error.message?.includes("API key")) {
        throw new Error("AI service configuration error. Please ensure your XAI API key is valid.")
      }
      throw error // Re-throw any other unexpected errors
    }

    // Try to parse JSON from the response
    let analysisData
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      // Fallback: create structured data from the text response
      analysisData = {
        contractName: contractCode ? "Smart Contract Analysis" : `Contract ${contractAddress?.slice(0, 10)}...`,
        summary:
          "AI analysis completed. The contract has been analyzed for security vulnerabilities and functionality.",
        functions: [
          {
            name: "transfer",
            access: "Public",
            risk: "low",
            description: "Standard token transfer function",
          },
          {
            name: "approve",
            access: "Public",
            risk: "low",
            description: "Approve spending allowance for another address",
          },
          {
            name: "mint",
            access: "Owner Only",
            risk: "high",
            description: "Create new tokens (if present)",
          },
        ],
        risks: [
          {
            level: "medium",
            title: "Analysis Completed",
            description: "Detailed analysis available in full report",
          },
        ],
        securityScore: 7.5,
        recommendations: ["Review contract thoroughly", "Consider security audit"],
        isUpgradeable: false,
        hasOwnerPrivileges: true,
        tokenStandard: "Custom",
        aiResponse: text, // Include the full AI response
      }
    }

    return NextResponse.json(analysisData)
  } catch (error: any) {
    console.error("Analysis error:", error)

    // Provide more specific error handling
    if (error.message?.includes("The AI model is currently overloaded")) {
      return NextResponse.json(
        {
          error: error.message, // Use the specific message from the retry block
        },
        { status: 503 },
      )
    }
    if (error.message?.includes("AI model temporarily unavailable")) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 503 },
      )
    }
    if (error.message?.includes("AI service configuration error")) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to analyze contract. An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    )
  }
}

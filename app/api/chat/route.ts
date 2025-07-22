import { generateText } from "ai" // Import generateText from AI SDK
import { xai } from "@ai-sdk/xai" // Import xai from Grok AI SDK
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, contractData } = await request.json()

    if (!process.env.XAI_API_KEY) {
      // Check for XAI_API_KEY
      console.error("XAI API key is not set.")
      return NextResponse.json({ error: "AI service configuration error: XAI API key is missing." }, { status: 500 })
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const model = xai("grok-3") // Use Grok-3 model

    let prompt = ""

    if (contractData && contractData.hasContract) {
      // If user has uploaded a contract
      prompt = `
You are a smart contract expert assistant. You have analyzed the following smart contract:

Contract Name: ${contractData.contractName || "Smart Contract"}
Summary: ${contractData.summary || "Contract analysis available"}
Security Score: ${contractData.securityScore || "N/A"}/10
Functions: ${JSON.stringify(contractData.functions || [])}
Risks: ${JSON.stringify(contractData.risks || [])}
Is Upgradeable: ${contractData.isUpgradeable || false}
Has Owner Privileges: ${contractData.hasOwnerPrivileges || false}
Token Standard: ${contractData.tokenStandard || "Custom"}

${contractData.contractCode ? `Contract Code:\n${contractData.contractCode}` : ""}

User Question: "${message}"

Please provide a helpful, accurate answer about this specific smart contract. Keep your response:
1. Focused on the analyzed contract
2. Clear and understandable for both technical and non-technical users
3. Specific about risks, functions, and security implications
4. Conversational but informative

If the question is about specific functions, refer to the function list above.
If asked about risks, reference the identified risks.
If asked about security, mention the security score and specific vulnerabilities.
`
    } else {
      // General smart contract questions
      prompt = `
You are a smart contract expert assistant. The user hasn't uploaded a specific contract yet, so provide general guidance about smart contracts, security, and blockchain development.

User Question: "${message}"

Please provide a helpful answer about smart contracts, focusing on:
1. General smart contract security principles
2. Common vulnerabilities and how to avoid them
3. Best practices for smart contract development
4. Solidity programming guidance
5. DeFi and blockchain concepts

Keep your response clear, educational, and actionable. If the user asks about analyzing a specific contract, suggest they upload their contract code first for personalized analysis.
`
    }

    const { text } = await generateText({ model, prompt }) // Use generateText from AI SDK

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Chat error:", error)

    // Provide more specific error handling
    if (error.message?.includes("model is not found")) {
      // Generic error for model not found
      return NextResponse.json(
        {
          error: "AI assistant temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      )
    }

    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          error: "AI service configuration error. Please contact support.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "I'm sorry, I encountered an error processing your question. Please try again.",
      },
      { status: 500 },
    )
  }
}

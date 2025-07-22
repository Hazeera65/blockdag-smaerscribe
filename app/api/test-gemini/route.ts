import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI("AIzaSyBIcam5C9h85htWNZpInC-GiKOumMcoRZU")

export async function GET(request: NextRequest) {
  try {
    // Test different available models
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]

    const results = []

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent("Hello, this is a test message.")
        const response = await result.response
        const text = response.text()

        results.push({
          model: modelName,
          status: "success",
          response: text.substring(0, 100) + "...",
        })
      } catch (error) {
        results.push({
          model: modelName,
          status: "error",
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: "Gemini API test results",
      results: results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test Gemini API",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

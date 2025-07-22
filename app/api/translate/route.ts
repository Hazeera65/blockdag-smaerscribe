import { generateText } from "ai" // Import generateText from AI SDK
import { xai } from "@ai-sdk/xai" // Import xai from Grok AI SDK
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!process.env.XAI_API_KEY) {
      // Check for XAI_API_KEY
      console.error("XAI API key is not set for translation.")
      return NextResponse.json({ error: "AI service configuration error: XAI API key is missing." }, { status: 500 })
    }

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Text and target language are required for translation." }, { status: 400 })
    }

    const model = xai("grok-3") // Use Grok-3 model

    const prompt = `Translate the following English text into ${targetLanguage}. Provide only the translated text, without any additional commentary or formatting.

English Text: "${text}"

Translated ${targetLanguage} Text:`

    try {
      const { text: translatedText } = await generateText({ model, prompt }) // Use generateText from AI SDK

      return NextResponse.json({ translatedText: translatedText.trim() })
    } catch (error: any) {
      console.error("Translation AI error:", error)
      if (error.message?.includes("503") || error.message?.includes("overloaded")) {
        return NextResponse.json(
          { error: "Translation service is currently overloaded. Please try again later." },
          { status: 503 },
        )
      }
      if (error.message?.includes("API key")) {
        return NextResponse.json(
          { error: "Translation service configuration error. Please ensure your XAI API key is valid." },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: "Failed to translate text. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Translate route error:", error)
    return NextResponse.json({ error: "Internal server error during translation request." }, { status: 500 })
  }
}

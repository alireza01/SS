import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Initialize the Gemini API client
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

// Safety settings to avoid harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Get Gemini model
export const getGeminiModel = (modelName = "gemini-2.0-flash") => {
  if (!apiKey) {
    console.warn("Gemini API key is not set")
    return null
  }

  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings,
  })
}

// Generate content with Gemini
export const generateContent = async (prompt: string, modelName = "gemini-2.0-flash") => {
  const model = getGeminiModel(modelName)

  if (!model) {
    throw new Error("Gemini API key not configured. Please configure the API key in your environment variables.")
  }

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return {
      success: true,
      content: text,
    }
  } catch (error) {
    console.error("Error generating content with Gemini:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Generate JSON content with Gemini
export const generateJsonContent = async (prompt: string, modelName = "gemini-2.0-flash") => {
  const model = getGeminiModel(modelName)

  if (!model) {
    return {
      success: false,
      error: "API key not configured",
      mockResponse: true,
      data: { message: "Mock response as Gemini API key is not configured" },
    }
  }

  try {
    const formattedPrompt = `${prompt}\n\nRespond ONLY with valid JSON.`
    const result = await model.generateContent(formattedPrompt)
    const response = result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return {
        success: true,
        data: JSON.parse(jsonMatch[0]),
      }
    }

    throw new Error("Failed to parse JSON from response")
  } catch (error) {
    console.error("Error generating JSON content with Gemini:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

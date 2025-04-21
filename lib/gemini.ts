"use server"

import { generateContent, generateJsonContent } from "./gemini/client"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

/**
 * ترجمه متن با استفاده از Gemini API
 * @param text متن برای ترجمه
 * @param targetLanguage زبان مقصد (پیش‌فرض: فارسی)
 * @returns متن ترجمه شده
 */
export async function translateText(text: string, targetLanguage = "fa"): Promise<string> {
  try {
    const prompt = `Translate the following text to ${targetLanguage === "fa" ? "Persian" : targetLanguage === "en" ? "English" : targetLanguage}. Return only the translation, without any additional explanation:

${text}`

    const result = await generateContent(prompt)
    if (!result.success) {
      throw new Error(result.error || "Translation failed")
    }

    if (!result.content) {
      throw new Error("No content returned from translation")
    }

    return result.content.trim()
  } catch (error) {
    console.error("Error in text translation:", error)
    throw new Error("Error in text translation")
  }
}

/**
 * دریافت معنی و توضیحات کلمه با استفاده از Gemini API
 * @param word کلمه
 * @param targetLanguage زبان مقصد (پیش‌فرض: فارسی)
 * @returns معنی و توضیحات کلمه
 */
export async function getWordDefinition(word: string, targetLanguage = "fa") {
  try {
    const prompt = `Please provide the meaning and details of the word "${word}" in ${targetLanguage === "fa" ? "Persian" : targetLanguage === "en" ? "English" : targetLanguage}. Respond ONLY with valid JSON in this format:
{
  "meaning": "brief word meaning",
  "explanation": "detailed explanation and usage",
  "examples": ["example 1", "example 2"],
  "level": "word difficulty level (beginner, intermediate, advanced)"
}`

    const result = await generateJsonContent(prompt)
    if (!result.success) {
      throw new Error(result.error || "Failed to get word definition")
    }

    return result.data
  } catch (error) {
    console.error("Error getting word definition:", error)
    throw new Error("Error getting word definition")
  }
}

/**
 * تحلیل متن و استخراج کلمات کلیدی با استفاده از Gemini API
 * @param text متن برای تحلیل
 * @returns کلمات کلیدی و سطح دشواری آن‌ها
 */
export async function analyzeText(text: string) {
  try {
    const prompt = `Analyze the following text and extract 10 key words with their difficulty levels (beginner, intermediate, advanced). Respond ONLY with valid JSON in this format:
{
  "keywords": [
    {"word": "word1", "level": "beginner"},
    {"word": "word2", "level": "intermediate"},
    {"word": "word3", "level": "advanced"}
  ]
}

Text:
${text.substring(0, 2000)}`

    const result = await generateJsonContent(prompt)
    if (!result.success) {
      return []
    }

    return result.data.keywords || []
  } catch (error) {
    console.error("Error in text analysis:", error)
    return []
  }
}

interface DifficultWord {
  word: string
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  persianMeaning: string
  position: number
}

interface AnalyzeResult {
  difficultWords: DifficultWord[]
}

export async function analyzeTextForDifficultWords(
  text: string,
  userLevel: "beginner" | "intermediate" | "advanced"
): Promise<AnalyzeResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Analyze the following English text and identify difficult words based on the user's level (${userLevel}).
      For each difficult word, provide:
      1. The word itself
      2. Its difficulty level (beginner/intermediate/advanced)
      3. Persian meaning
      4. Position in the text (character index)

      Text: "${text}"

      Return the result in the following JSON format:
      {
        "difficultWords": [
          {
            "word": "example",
            "difficultyLevel": "intermediate",
            "persianMeaning": "مثال",
            "position": 0
          }
        ]
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const textResult = response.text()

    // Extract JSON from the response
    const jsonMatch = textResult.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const parsedResult = JSON.parse(jsonMatch[0]) as AnalyzeResult
    return parsedResult
  } catch (error) {
    console.error("Error analyzing text:", error)
    return { difficultWords: [] }
  }
}

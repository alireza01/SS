export type ApiKeyType = "gemini" | "openai"

export interface ApiKey {
  id: string
  name: string
  key: string
  type: ApiKeyType
  createdAt: string
  lastUsed: string | null
  isActive: boolean
  userId: string
} 
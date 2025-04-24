export interface ApiKey {
  id: string
  name: string
  key: string
  type: ApiKeyType
  createdAt: string
  lastUsed: string | null
  isActive: boolean
  created_by?: string
}

export type ApiKeyType = 'custom' | 'gemini' | 'system' 

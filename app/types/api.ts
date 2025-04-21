export interface ApiKey {
  id: string
  name: string
  key: string
  type: string
  created_by: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export type ApiKeyType = 'custom' | 'gemini' | 'system' 
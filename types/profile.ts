
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  is_active: boolean
  language_preference: string
  created_at: string
  updated_at: string
  level: "beginner" | "intermediate" | "advanced"
  bio: string | null
  website: string | null
} 
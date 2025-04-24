export interface Settings {
  id: string
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  maintenanceMode: boolean
  smtpHost: string | null
  smtpPort: number | null
  smtpUsername: string | null
  smtpPassword: string | null
  createdAt: string
  updatedAt: string
} 
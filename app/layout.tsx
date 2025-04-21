import type { ReactNode } from "react"

import { Inter, Vazirmatn } from "next/font/google"

import { ErrorBoundary } from "@/components/error-boundary"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { AnalyticsProvider } from "@/components/providers/analytics-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { LoadingProvider } from "@/components/providers/loading-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import type { Metadata } from "next"

import "./globals.css"

// فونت‌های مورد استفاده در برنامه
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ketabyar.ir"),
  title: {
    default: "کتاب‌یار - پلتفرم مطالعه آنلاین",
    template: "%s | کتاب‌یار"
  },
  description: "پلتفرم مطالعه آنلاین با امکانات پیشرفته برای یادگیری زبان انگلیسی",
  keywords: ["کتاب", "مطالعه", "آنلاین", "یادگیری", "زبان انگلیسی", "کتاب‌یار"],
  authors: [{ name: "تیم کتاب‌یار" }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://ketabyar.ir",
    title: "کتاب‌یار - پلتفرم مطالعه آنلاین",
    description: "پلتفرم مطالعه آنلاین با امکانات پیشرفته برای یادگیری زبان انگلیسی",
    siteName: "کتاب‌یار",
  },
  twitter: {
    card: "summary_large_image",
    title: "کتاب‌یار - پلتفرم مطالعه آنلاین",
    description: "پلتفرم مطالعه آنلاین با امکانات پیشرفته برای یادگیری زبان انگلیسی",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  generator: "کتاب‌یار"
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${vazirmatn.variable} font-vazirmatn text-right min-h-screen antialiased`}>
        <ErrorBoundary>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem
          >
            <QueryProvider>
              <LoadingProvider>
                <AnalyticsProvider>
                  <AuthProvider>
                    <div className="relative flex min-h-screen flex-col">
                      <SiteHeader />
                      <main className="flex-1">{children}</main>
                      <SiteFooter />
                    </div>
                    <Toaster position="bottom-left" />
                  </AuthProvider>
                </AnalyticsProvider>
              </LoadingProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

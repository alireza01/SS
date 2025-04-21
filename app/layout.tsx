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
})

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
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

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${vazirmatn.variable} min-h-screen font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <LoadingProvider>
                <AnalyticsProvider>
                  <AuthProvider>
                    <div className="relative flex min-h-screen flex-col">
                      <SiteHeader />
                      <main className="flex-1">{children}</main>
                      <SiteFooter />
                    </div>
                    <Toaster position="bottom-center" />
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

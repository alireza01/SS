"use client"

import * as React from "react"

import Link from "next/link"

import { Facebook, Instagram, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNewsletter } from "@/hooks/use-newsletter"

interface FooterSection {
  title: string
  links: Array<{
    href: string
    label: string
  }>
}

const quickLinks: FooterSection = {
  title: "لینک‌های سریع",
  links: [
    { href: "/", label: "صفحه اصلی" },
    { href: "/library", label: "کتابخانه" },
    { href: "/categories", label: "دسته‌بندی‌ها" },
    { href: "/about", label: "درباره ما" },
  ],
}

const supportLinks: FooterSection = {
  title: "پشتیبانی",
  links: [
    { href: "/faq", label: "سوالات متداول" },
    { href: "/contact", label: "تماس با ما" },
    { href: "/privacy", label: "حریم خصوصی" },
    { href: "/terms", label: "شرایط استفاده" },
  ],
}

const socialLinks = [
  { icon: Facebook, label: "فیسبوک", href: "https://facebook.com" },
  { icon: Instagram, label: "اینستاگرام", href: "https://instagram.com" },
  { icon: Twitter, label: "توییتر", href: "https://twitter.com" },
]

export function SiteFooter() {
  const [email, setEmail] = React.useState("")
  const { subscribe, loading } = useNewsletter()

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      await subscribe(email)
      setEmail("")
    } catch (error) {
      // Error is handled by the hook
      console.error("Newsletter subscription error:", error)
    }
  }

  const renderFooterSection = ({ title, links }: FooterSection) => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-bold">کتاب‌یار</h3>
            <p className="text-muted-foreground text-sm">
              پلتفرم مطالعه آنلاین با امکانات پیشرفته برای یادگیری زبان انگلیسی
            </p>
            <div className="flex space-x-3 space-x-reverse">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <Button key={href} variant="ghost" size="icon" asChild>
                  <Link href={href} target="_blank" rel="noopener noreferrer">
                    <Icon className="size-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          {renderFooterSection(quickLinks)}
          {renderFooterSection(supportLinks)}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">خبرنامه</h3>
            <p className="text-muted-foreground text-sm">
              برای دریافت آخرین اخبار و بروزرسانی‌ها در خبرنامه ما عضو شوید.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "در حال ثبت..." : "عضویت"}
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} کتاب‌یار. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  )
}

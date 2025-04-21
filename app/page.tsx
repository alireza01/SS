import Link from "next/link"

import { AppFeatures } from "@/components/home/app-features"
import { DownloadApp } from "@/components/home/download-app"
import { FeaturesSection } from "@/components/home/features-section"
import { HeroSection } from "@/components/home/hero-section"
import { HowItWorks } from "@/components/home/how-it-works"
import { PopularCategories } from "@/components/home/popular-categories"
import { TestimonialSection } from "@/components/home/testimonial-section"
import { TrendingBooks } from "@/components/home/trending-books"
import { Button } from "@/components/ui/button"

export default async function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <TrendingBooks />
      <HowItWorks />
      <TestimonialSection />
      <PopularCategories />
      <AppFeatures />
      <DownloadApp />

      <section className="bg-primary/5 py-20">
        <div className="container text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">همین امروز شروع کنید</h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            با کتاب‌یار، مطالعه کتاب‌های انگلیسی آسان‌تر از همیشه است. همین حالا ثبت‌نام کنید و از امکانات ویژه بهره‌مند
            شوید.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/register">ثبت‌نام رایگان</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/library">مشاهده کتابخانه</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

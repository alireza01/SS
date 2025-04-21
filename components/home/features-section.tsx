"use client"

import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500 size-10"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="m9 10 2 2 4-4" />
        </svg>
      ),
      title: "یادگیری هوشمند",
      description:
        "با کمک هوش مصنوعی، کلمات دشوار بر اساس سطح زبانی شما مشخص می‌شوند و معنی دقیق آن‌ها نمایش داده می‌شود.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500 size-10"
        >
          <path d="M12 3c.53 0 1.039.21 1.414.586l7 7 .002.002c.37.372.584.877.584 1.412s-.214 1.04-.584 1.412l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12c0-.535.21-1.04.586-1.414l7-7C10.961 3.21 11.47 3 12 3z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      ),
      title: "ترجمه دقیق",
      description:
        "ترجمه‌های دقیق و روان با حفظ مفهوم اصلی متن، به جای ترجمه‌های تحت‌اللفظی که معنای واقعی را منتقل نمی‌کنند.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500 size-10"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="m2 12 5.45 5.45" />
          <path d="M2 12h7" />
          <path d="m2 12-5.45 5.45" />
          <path d="m22 12-5.45 5.45" />
          <path d="M22 12h-7" />
          <path d="m22 12-5.45-5.45" />
        </svg>
      ),
      title: "رابط کاربری مدرن",
      description: "تجربه مطالعه لذت‌بخش با رابط کاربری مدرن و زیبا که برای تمام دستگاه‌ها بهینه‌سازی شده است.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500 size-10"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      ),
      title: "پیشرفت مطالعه",
      description: "پیگیری پیشرفت مطالعه و ذخیره کلمات یادگرفته شده برای مرور در آینده.",
    },
  ]

  return (
    <section className="bg-white py-20 dark:bg-gray-950">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">ویژگی‌های کتاب‌یار</h2>
          <p className="text-muted-foreground text-lg">
            کتاب‌یار با ویژگی‌های منحصر به فرد خود، تجربه مطالعه کتاب‌های انگلیسی را برای شما لذت‌بخش می‌کند.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-gold-200 h-full transition-shadow hover:shadow-md dark:border-gray-800">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

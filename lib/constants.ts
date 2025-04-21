export const siteConfig = {
  name: "کتاب‌یار",
  description: "پلتفرم مطالعه آنلاین با امکانات پیشرفته برای یادگیری زبان انگلیسی",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ketabyar.ir",
  ogImage: "https://ketabyar.ir/og.jpg",
  links: {
    twitter: "https://twitter.com/ketabyar",
    github: "https://github.com/ketabyar",
  },
}

export const bookLevels = [
  { value: "beginner", label: "مبتدی", color: "bg-green-500" },
  { value: "intermediate", label: "متوسط", color: "bg-yellow-500" },
  { value: "advanced", label: "پیشرفته", color: "bg-red-500" },
] as const

export const subscriptionPlans = [
  {
    id: "free",
    name: "رایگان",
    description: "دسترسی به امکانات پایه",
    features: ["دسترسی به کتاب‌های رایگان", "امکان مطالعه آنلاین", "ذخیره کلمات جدید"],
    price: 0,
    priceId: "",
  },
  {
    id: "pro",
    name: "حرفه‌ای",
    description: "دسترسی به تمام امکانات",
    features: [
      "دسترسی به تمام کتاب‌ها",
      "امکان دانلود کتاب‌ها",
      "دسترسی به دستیار هوش مصنوعی",
      "تلفظ کلمات با هوش مصنوعی",
      "بدون محدودیت در ذخیره کلمات",
    ],
    price: 49000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  },
] as const

export const MAX_FREE_BOOKS = 3
export const MAX_FREE_WORDS = 50

export const READING_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const

export const AI_MODELS = {
  GPT_3: "gpt-3",
  GPT_4: "gpt-4",
  GEMINI_PRO: "gemini-pro",
} as const

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB 
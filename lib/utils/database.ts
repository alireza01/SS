import type { Book } from "@/types/books"
import type { Database } from "@/types/supabase"

export function mapDatabaseBookToBook(dbBook: Database["public"]["Tables"]["books"]["Row"]): Book {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    coverImage: dbBook.cover_image,
    description: dbBook.description || "",
    language: "fa", // Default to Persian
    level: (dbBook.level as "beginner" | "intermediate" | "advanced") || "beginner",
    totalPages: 0, // This needs to be calculated or stored
    isPremium: false, // This needs to be stored
    categoryId: "", // This needs to be stored
    category: { id: "", name: "", slug: "" }, // This needs to be fetched
    categories: [], // This needs to be fetched
    createdAt: dbBook.created_at,
    isPublished: true, // This needs to be stored
    bookStatistics: [] // This needs to be fetched
  }
} 
export interface BookStatistics {
  total_readers: number;
  completed_readers: number;
  average_progress: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  description: string;
  language: string;
  level: "beginner" | "intermediate" | "advanced";
  totalPages: number;
  isPremium: boolean;
  categoryId: string;
  category: Category;
  categories: Category[];
  createdAt: string;
  rating?: number;
  book_statistics?: BookStatistics[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  is_published: boolean;
  created_at: string;
} 
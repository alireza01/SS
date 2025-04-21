export interface Word {
  id: string;
  term: string;
  definition: string;
  examples?: string[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  book_id?: string;
} 
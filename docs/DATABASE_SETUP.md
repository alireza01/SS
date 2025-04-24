# Database Setup and Configuration

## Overview
This document outlines the database setup for our Next.js application using Supabase as the backend.

## Environment Setup
Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

### Core Tables

1. `books`
   ```sql
   CREATE TABLE books (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     author TEXT NOT NULL,
     description TEXT,
     cover_image TEXT,
     language TEXT NOT NULL,
     level TEXT NOT NULL,
     total_pages INTEGER NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

2. `book_content`
   ```sql
   CREATE TABLE book_content (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
     page INTEGER NOT NULL,
     text TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

3. `book_words`
   ```sql
   CREATE TABLE book_words (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
     word TEXT NOT NULL,
     meaning TEXT NOT NULL,
     level TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

### User Data Tables

4. `reading_progress`
   ```sql
   CREATE TABLE reading_progress (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
     current_page INTEGER NOT NULL,
     last_read_at TIMESTAMPTZ NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

5. `user_words`
   ```sql
   CREATE TABLE user_words (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     book_id UUID REFERENCES books(id) ON DELETE CASCADE,
     word TEXT NOT NULL,
     meaning TEXT NOT NULL,
     example TEXT,
     level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
     status TEXT NOT NULL CHECK (status IN ('new', 'learning', 'known')),
     next_review_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

6. `user_words_stats`
   ```sql
   CREATE TABLE user_words_stats (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     total_words INTEGER NOT NULL DEFAULT 0,
     learning_words INTEGER NOT NULL DEFAULT 0,
     known_words INTEGER NOT NULL DEFAULT 0,
     review_streak INTEGER NOT NULL DEFAULT 0,
     last_reviewed_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(user_id)
   );
   ```

7. `user_settings`
   ```sql
   CREATE TABLE user_settings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     theme TEXT NOT NULL CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
     font_size TEXT NOT NULL CHECK (font_size IN ('small', 'medium', 'large')) DEFAULT 'medium',
     email_notifications BOOLEAN NOT NULL DEFAULT true,
     push_notifications BOOLEAN NOT NULL DEFAULT false,
     review_reminders BOOLEAN NOT NULL DEFAULT true,
     auto_play_pronunciation BOOLEAN NOT NULL DEFAULT false,
     show_translation_hints BOOLEAN NOT NULL DEFAULT true,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(user_id)
   );
   ```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

1. User Settings Example:
```sql
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### Permissions
- Authenticated users have appropriate SELECT, INSERT, UPDATE permissions
- Service role has full access for administrative tasks

## Performance Optimizations

### Indexes
Important indexes are created for frequently accessed columns:
```sql
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_user_words_user_status ON user_words(user_id, status);
CREATE INDEX idx_books_level ON books(level);
```

### Triggers
Automatic timestamp updates are handled by triggers:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to all tables with updated_at column
CREATE TRIGGER trigger_update_timestamp
    BEFORE UPDATE ON [table_name]
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

## Client Integration

### Type Safety
Types are automatically generated and maintained in `types/supabase.ts`

### Client Setup
1. Browser Client (`lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

2. Server Client (`lib/supabase/server.ts`):
```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function createServerClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie is read-only in middleware
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // Cookie is read-only in middleware
          }
        }
      }
    }
  )
}
```

## Migrations
All migrations are stored in `supabase/migrations/` and are versioned with timestamps:
- `20240101000000_books_schema.sql`
- `20240101000001_app_stats.sql`
- `20240320000000_admin_activity_logs.sql`
- `20240320000001_user_settings.sql`

## Best Practices
1. Always use migrations for schema changes
2. Implement proper RLS policies for all tables
3. Use appropriate indexes for performance
4. Keep types up to date
5. Use transactions for related operations
6. Implement proper error handling
7. Follow naming conventions
8. Document all schema changes

## Stored Procedures

### Word Stats Management

```sql
-- Function to update word stats when word status changes
CREATE OR REPLACE FUNCTION update_word_stats_on_status_change(
  user_id_param UUID,
  old_status TEXT,
  new_status TEXT
) RETURNS void AS $$
BEGIN
  -- Create stats record if it doesn't exist
  INSERT INTO user_words_stats (user_id, total_words)
  VALUES (user_id_param, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update learning words count
  IF old_status = 'new' AND new_status = 'learning' THEN
    UPDATE user_words_stats
    SET learning_words = learning_words + 1
    WHERE user_id = user_id_param;
  ELSIF old_status = 'learning' AND new_status = 'known' THEN
    UPDATE user_words_stats
    SET learning_words = learning_words - 1,
        known_words = known_words + 1
    WHERE user_id = user_id_param;
  ELSIF old_status = 'known' AND new_status = 'learning' THEN
    UPDATE user_words_stats
    SET learning_words = learning_words + 1,
        known_words = known_words - 1
    WHERE user_id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update review streak
CREATE OR REPLACE FUNCTION update_review_streak(
  user_id_param UUID
) RETURNS void AS $$
DECLARE
  last_review TIMESTAMPTZ;
BEGIN
  -- Get last review time
  SELECT last_reviewed_at INTO last_review
  FROM user_words_stats
  WHERE user_id = user_id_param;

  -- Update streak based on last review
  UPDATE user_words_stats
  SET last_reviewed_at = NOW(),
      review_streak = CASE
        WHEN last_reviewed_at IS NULL THEN 1
        WHEN last_reviewed_at > NOW() - INTERVAL '1 day' THEN review_streak
        WHEN last_reviewed_at > NOW() - INTERVAL '2 days' THEN review_streak + 1
        ELSE 1
      END
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate word stats
CREATE OR REPLACE FUNCTION recalculate_word_stats(
  user_id_param UUID
) RETURNS void AS $$
BEGIN
  UPDATE user_words_stats
  SET total_words = (
    SELECT COUNT(*) FROM user_words WHERE user_id = user_id_param
  ),
  learning_words = (
    SELECT COUNT(*) FROM user_words 
    WHERE user_id = user_id_param AND status = 'learning'
  ),
  known_words = (
    SELECT COUNT(*) FROM user_words 
    WHERE user_id = user_id_param AND status = 'known'
  )
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;
```
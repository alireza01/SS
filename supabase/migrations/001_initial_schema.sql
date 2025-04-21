-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create site settings table
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name text,
  site_description text,
  allow_registration boolean DEFAULT true,
  maintenance_mode boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create email settings table
CREATE TABLE email_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create word searches table
CREATE TABLE word_searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  word text NOT NULL,
  count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user',
  subscription_tier text DEFAULT 'free',
  subscription_status text,
  subscription_end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  author text NOT NULL,
  cover_image text,
  content text,
  level text NOT NULL,
  is_premium boolean DEFAULT false,
  read_count integer DEFAULT 0,
  category_id uuid REFERENCES categories(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  book_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create words table
CREATE TABLE words (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  word text NOT NULL,
  definition text NOT NULL,
  context text,
  book_id uuid REFERENCES books(id),
  user_id uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  book_id uuid REFERENCES books(id),
  user_id uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create reading_progress table
CREATE TABLE reading_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  progress integer NOT NULL DEFAULT 0,
  last_read_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  book_id uuid REFERENCES books(id),
  user_id uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_assistants table
CREATE TABLE ai_assistants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  model text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_conversations table
CREATE TABLE ai_conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id uuid REFERENCES ai_assistants(id),
  user_id uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_messages table
CREATE TABLE ai_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  conversation_id uuid REFERENCES ai_conversations(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_words_book_id ON words(book_id);
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_assistants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp(); 
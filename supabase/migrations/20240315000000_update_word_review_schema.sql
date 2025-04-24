-- Add missing columns to user_words table
ALTER TABLE user_words
ADD COLUMN IF NOT EXISTS meaning TEXT,
ADD COLUMN IF NOT EXISTS example TEXT,
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced'));

-- Create word_reviews table if not exists
CREATE TABLE IF NOT EXISTS word_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES user_words(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  knew_word BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_word_reviews_word_id ON word_reviews(word_id);
CREATE INDEX IF NOT EXISTS idx_word_reviews_user_id ON word_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_word_reviews_date ON word_reviews(review_date);

-- Update user_words_stats trigger to handle new status changes
CREATE OR REPLACE FUNCTION update_word_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Update stats based on status change
    IF OLD.status = 'learning' THEN
      UPDATE user_words_stats 
      SET learning_words = learning_words - 1
      WHERE user_id = NEW.user_id;
    ELSIF OLD.status = 'known' THEN
      UPDATE user_words_stats 
      SET known_words = known_words - 1
      WHERE user_id = NEW.user_id;
    END IF;

    IF NEW.status = 'learning' THEN
      UPDATE user_words_stats 
      SET learning_words = learning_words + 1
      WHERE user_id = NEW.user_id;
    ELSIF NEW.status = 'known' THEN
      UPDATE user_words_stats 
      SET known_words = known_words + 1
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS tr_update_word_stats ON user_words;
CREATE TRIGGER tr_update_word_stats
AFTER UPDATE ON user_words
FOR EACH ROW
EXECUTE FUNCTION update_word_stats(); 
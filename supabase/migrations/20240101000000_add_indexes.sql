 -- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(userId, bookId);
CREATE INDEX IF NOT EXISTS idx_user_words_user_status ON user_words(userId, status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(userId, createdAt);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON reading_sessions(userId, startedAt);

-- Add foreign key constraints if missing
ALTER TABLE reading_progress 
  ADD CONSTRAINT fk_reading_progress_user 
  FOREIGN KEY (userId) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_words 
  ADD CONSTRAINT fk_user_words_user 
  FOREIGN KEY (userId) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_settings 
  ADD CONSTRAINT fk_user_settings_user 
  FOREIGN KEY (userId) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add check constraints for enums
ALTER TABLE user_words 
  ADD CONSTRAINT check_word_status 
  CHECK (status IN ('new', 'learning', 'known'));

ALTER TABLE profiles 
  ADD CONSTRAINT check_language_level 
  CHECK (level IN ('beginner', 'intermediate', 'advanced'));
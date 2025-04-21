-- Add indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_books_level ON books(level);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_book_id ON user_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_book ON user_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_word ON vocabulary(user_id, word);

-- Add indexes for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_read ON user_progress(last_read_at DESC); 
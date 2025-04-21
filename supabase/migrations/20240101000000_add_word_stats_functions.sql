-- Update word stats when word status changes
CREATE OR REPLACE FUNCTION update_word_stats_on_status_change(
  user_id_param UUID,
  old_status TEXT,
  new_status TEXT
) RETURNS void AS $$
BEGIN
  -- Decrease count for old status
  IF old_status = 'new' THEN
    UPDATE user_words_stats 
    SET totalWords = totalWords - 1
    WHERE userId = user_id_param;
  ELSIF old_status = 'learning' THEN
    UPDATE user_words_stats 
    SET learningWords = learningWords - 1
    WHERE userId = user_id_param;
  ELSIF old_status = 'known' THEN
    UPDATE user_words_stats 
    SET knownWords = knownWords - 1
    WHERE userId = user_id_param;
  END IF;

  -- Increase count for new status
  IF new_status = 'new' THEN
    UPDATE user_words_stats 
    SET totalWords = totalWords + 1
    WHERE userId = user_id_param;
  ELSIF new_status = 'learning' THEN
    UPDATE user_words_stats 
    SET learningWords = learningWords + 1
    WHERE userId = user_id_param;
  ELSIF new_status = 'known' THEN
    UPDATE user_words_stats 
    SET knownWords = knownWords + 1
    WHERE userId = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update review streak
CREATE OR REPLACE FUNCTION update_review_streak(user_id_param UUID) 
RETURNS void AS $$
DECLARE
  last_review_date DATE;
BEGIN
  -- Get the last review date
  SELECT MAX(updated_at)::DATE 
  INTO last_review_date 
  FROM user_words 
  WHERE user_id = user_id_param;

  -- If last review was yesterday, increment streak
  IF last_review_date = CURRENT_DATE - 1 THEN
    UPDATE user_words_stats 
    SET review_streak = review_streak + 1
    WHERE user_id = user_id_param;
  -- If last review was before yesterday, reset streak to 1
  ELSIF last_review_date < CURRENT_DATE - 1 THEN
    UPDATE user_words_stats 
    SET review_streak = 1
    WHERE user_id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_user_words_user_id ON user_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_words_next_review ON user_words(next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_words_status ON user_words(status);
CREATE INDEX IF NOT EXISTS idx_user_words_updated_at ON user_words(updated_at);

-- Add trigger for automatic stats updates
CREATE OR REPLACE FUNCTION initialize_user_word_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_words_stats (
    user_id,
    total_words,
    learning_words,
    known_words,
    review_streak,
    created_at,
    updated_at
  ) VALUES (
    NEW.user_id,
    1,
    0,
    0,
    0,
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_initialize_user_word_stats
AFTER INSERT ON user_words
FOR EACH ROW
EXECUTE FUNCTION initialize_user_word_stats();
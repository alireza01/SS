-- Update word stats functions to handle review tracking
CREATE OR REPLACE FUNCTION update_word_stats_on_status_change(
  user_id_param UUID,
  old_status TEXT,
  new_status TEXT
) RETURNS void AS $$
BEGIN
  -- Decrease count for old status
  IF old_status = 'new' THEN
    UPDATE user_words_stats 
    SET total_words = total_words - 1
    WHERE user_id = user_id_param;
  ELSIF old_status = 'learning' THEN
    UPDATE user_words_stats 
    SET learning_words = learning_words - 1
    WHERE user_id = user_id_param;
  ELSIF old_status = 'known' THEN
    UPDATE user_words_stats 
    SET known_words = known_words - 1
    WHERE user_id = user_id_param;
  END IF;

  -- Increase count for new status
  IF new_status = 'new' THEN
    UPDATE user_words_stats 
    SET total_words = total_words + 1
    WHERE user_id = user_id_param;
  ELSIF new_status = 'learning' THEN
    UPDATE user_words_stats 
    SET learning_words = learning_words + 1
    WHERE user_id = user_id_param;
  ELSIF new_status = 'known' THEN
    UPDATE user_words_stats 
    SET known_words = known_words + 1
    WHERE user_id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update review streak based on word_reviews table
CREATE OR REPLACE FUNCTION update_review_streak(user_id_param UUID) 
RETURNS void AS $$
DECLARE
  last_review_date DATE;
BEGIN
  -- Get the last review date from word_reviews table
  SELECT MAX(review_date)::DATE 
  INTO last_review_date 
  FROM word_reviews 
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

-- Function to get review count for a word
CREATE OR REPLACE FUNCTION get_word_review_count(word_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO review_count
  FROM word_reviews
  WHERE word_id = word_id_param;
  
  RETURN review_count;
END;
$$ LANGUAGE plpgsql; 
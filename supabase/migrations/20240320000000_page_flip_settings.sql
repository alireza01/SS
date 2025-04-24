-- Add page_flip_settings column to reading_settings table
ALTER TABLE reading_settings ADD COLUMN IF NOT EXISTS page_flip_settings JSONB DEFAULT jsonb_build_object(
  'interactiveFlipEnabled', true,
  'pageFlipSpeed', 0.5,
  'pageFlipThreshold', 0.3,
  'pageFlipEasing', 'easeOut'
);

-- Add validation for page_flip_settings column
ALTER TABLE reading_settings ADD CONSTRAINT page_flip_settings_check CHECK (
  jsonb_typeof(page_flip_settings) = 'object' AND
  jsonb_typeof(page_flip_settings->'interactiveFlipEnabled') = 'boolean' AND
  jsonb_typeof(page_flip_settings->'pageFlipSpeed') = 'number' AND
  jsonb_typeof(page_flip_settings->'pageFlipThreshold') = 'number' AND
  jsonb_typeof(page_flip_settings->'pageFlipEasing') = 'string'
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_reading_settings_user_id ON reading_settings(user_id);

-- Add RLS policies
ALTER TABLE reading_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own reading settings"
  ON reading_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading settings"
  ON reading_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading settings"
  ON reading_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reading_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reading_settings_timestamp ON reading_settings;
CREATE TRIGGER update_reading_settings_timestamp
  BEFORE UPDATE ON reading_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_settings_updated_at(); 
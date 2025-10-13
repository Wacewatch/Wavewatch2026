-- Add missing columns to user_profiles table

-- Add hide_adult_content column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'hide_adult_content'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN hide_adult_content BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add auto_mark_watched column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'auto_mark_watched'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN auto_mark_watched BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add theme_preference column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN theme_preference TEXT DEFAULT 'dark';
  END IF;
END $$;

-- Update existing user profiles to have default values
UPDATE user_profiles 
SET 
  hide_adult_content = COALESCE(hide_adult_content, true),
  auto_mark_watched = COALESCE(auto_mark_watched, false),
  theme_preference = COALESCE(theme_preference, 'dark')
WHERE hide_adult_content IS NULL 
   OR auto_mark_watched IS NULL 
   OR theme_preference IS NULL;

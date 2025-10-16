-- Add missing columns to user_profiles table that are required by the application

-- Add hide_adult_content column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS hide_adult_content BOOLEAN DEFAULT true;

-- Add auto_mark_watched column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS auto_mark_watched BOOLEAN DEFAULT false;

-- Add theme_preference column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';

-- Add allow_messages column for messaging preferences
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT true;

-- Add profile information columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;

-- Update existing user profiles to have default values for any NULL columns
UPDATE user_profiles 
SET 
  hide_adult_content = COALESCE(hide_adult_content, true),
  auto_mark_watched = COALESCE(auto_mark_watched, false),
  theme_preference = COALESCE(theme_preference, 'system'),
  hide_spoilers = COALESCE(hide_spoilers, false),
  allow_messages = COALESCE(allow_messages, true),
  join_date = COALESCE(join_date, CURRENT_DATE)
WHERE hide_adult_content IS NULL 
   OR auto_mark_watched IS NULL 
   OR theme_preference IS NULL
   OR hide_spoilers IS NULL
   OR allow_messages IS NULL
   OR join_date IS NULL;

-- Add comments to document the columns
COMMENT ON COLUMN user_profiles.hide_adult_content IS 'Whether to hide adult content from this user';
COMMENT ON COLUMN user_profiles.auto_mark_watched IS 'Whether to automatically mark content as watched';
COMMENT ON COLUMN user_profiles.theme_preference IS 'User theme preference: system, light, or dark';
COMMENT ON COLUMN user_profiles.hide_spoilers IS 'Whether to hide spoilers for this user';
COMMENT ON COLUMN user_profiles.allow_messages IS 'Whether to allow receiving messages from other users';
COMMENT ON COLUMN user_profiles.birth_date IS 'User birth date';
COMMENT ON COLUMN user_profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN user_profiles.bio IS 'User biography/description';
COMMENT ON COLUMN user_profiles.profile_image IS 'URL or data URI for user profile image';
COMMENT ON COLUMN user_profiles.join_date IS 'Date when user joined the platform';

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS hide_adult_content boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_mark_watched boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system',
ADD COLUMN IF NOT EXISTS allow_messages boolean DEFAULT true;

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Update existing rows to set user_id = id if user_id is null
UPDATE user_profiles
SET user_id = id
WHERE user_id IS NULL;

-- Add unique constraint on user_id
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Update RLS policies to work with both id and user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

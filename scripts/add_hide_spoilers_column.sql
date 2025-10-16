-- Add hide_spoilers column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS hide_spoilers BOOLEAN DEFAULT FALSE;

-- Update existing rows to have the default value
UPDATE user_profiles 
SET hide_spoilers = FALSE 
WHERE hide_spoilers IS NULL;

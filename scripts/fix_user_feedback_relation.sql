-- Add foreign key relationship between user_feedback and user_profiles
-- This fixes the error: "Could not find a relationship between 'user_feedback' and 'user_profiles'"

-- First, ensure all user_feedback records have corresponding user_profiles
-- Create missing user_profiles for any orphaned feedback
INSERT INTO user_profiles (id, user_id, username, email, created_at, updated_at)
SELECT DISTINCT 
  uf.user_id,
  uf.user_id,
  'Utilisateur',
  NULL,
  NOW(),
  NOW()
FROM user_feedback uf
LEFT JOIN user_profiles up ON uf.user_id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Add the foreign key constraint
ALTER TABLE user_feedback
DROP CONSTRAINT IF EXISTS user_feedback_user_id_fkey;

ALTER TABLE user_feedback
ADD CONSTRAINT user_feedback_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_guestbook ON user_feedback(guestbook_message) WHERE guestbook_message IS NOT NULL;

-- Add unique constraint to user_watch_history for upsert operations
ALTER TABLE user_watch_history
ADD CONSTRAINT user_watch_history_user_content_unique 
UNIQUE (user_id, content_id, content_type);

-- Add unique constraint to user_ratings for upsert operations
ALTER TABLE user_ratings
ADD CONSTRAINT user_ratings_user_content_unique 
UNIQUE (user_id, content_id, content_type);

-- Create index for better performance on watch history queries
CREATE INDEX IF NOT EXISTS idx_user_watch_history_last_watched 
ON user_watch_history(user_id, last_watched_at DESC);

-- Create index for better performance on favorites queries
CREATE INDEX IF NOT EXISTS idx_user_favorites_created 
ON user_favorites(user_id, created_at DESC);

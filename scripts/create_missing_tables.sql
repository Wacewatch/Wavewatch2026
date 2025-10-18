-- Create tables for user data persistence across devices

-- User wishlist table (already exists in schema, but ensuring it's created)
CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_title VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites table (already exists, ensuring indexes)
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_content ON user_favorites(content_id, content_type);

-- User watch history table (already exists, ensuring indexes)
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_content ON user_watch_history(content_id, content_type);

-- User ratings table (already exists, ensuring indexes)
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_content ON user_ratings(content_id, content_type);

-- Enable Row Level Security
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_wishlist
CREATE POLICY "Users can view their own wishlist"
  ON user_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist"
  ON user_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist"
  ON user_wishlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
  ON user_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_watch_history
CREATE POLICY "Users can view their own watch history"
  ON user_watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watch history"
  ON user_watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
  ON user_watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watch history"
  ON user_watch_history FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_ratings
CREATE POLICY "Users can view their own ratings"
  ON user_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
  ON user_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON user_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON user_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE user_wishlist IS 'Stores user watchlist items - synced across devices';
COMMENT ON TABLE user_favorites IS 'Stores user favorite content - synced across devices';
COMMENT ON TABLE user_watch_history IS 'Stores user watch history - synced across devices';
COMMENT ON TABLE user_ratings IS 'Stores user ratings - synced across devices';

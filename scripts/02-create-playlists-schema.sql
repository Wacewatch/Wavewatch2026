-- Create comprehensive playlist system with user preferences
-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  theme_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_items table for movies and series
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position INTEGER DEFAULT 0
);

-- Create playlist_likes table
CREATE TABLE IF NOT EXISTS playlist_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL, -- true for like, false for dislike
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, user_id)
);

-- Create playlist_favorites table
CREATE TABLE IF NOT EXISTS playlist_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, user_id)
);

-- Update user_profiles table to include adult content and watched preferences
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS hide_adult_content BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_mark_watched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'system';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_likes_playlist_id ON playlist_likes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_favorites_user_id ON playlist_favorites(user_id);

-- Enable RLS on all tables
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists
CREATE POLICY "Users can view public playlists" ON playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlists" ON playlists
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for playlist_items
CREATE POLICY "Users can view items from accessible playlists" ON playlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage items in their own playlists" ON playlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- RLS Policies for playlist_likes
CREATE POLICY "Users can view all playlist likes" ON playlist_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own playlist likes" ON playlist_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for playlist_favorites
CREATE POLICY "Users can view their own playlist favorites" ON playlist_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlist favorites" ON playlist_favorites
  FOR ALL USING (auth.uid() = user_id);

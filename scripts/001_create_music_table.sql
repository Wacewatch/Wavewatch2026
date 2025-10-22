-- Create music_content table for managing music videos, concerts, and festivals
CREATE TABLE IF NOT EXISTS music_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration INTEGER, -- in minutes
  release_year INTEGER,
  genre VARCHAR(100),
  type VARCHAR(50), -- Concert, Festival, Documentary, Music Video
  quality VARCHAR(20), -- HD, 4K, SD
  views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_music_content_genre ON music_content(genre);
CREATE INDEX IF NOT EXISTS idx_music_content_type ON music_content(type);
CREATE INDEX IF NOT EXISTS idx_music_content_active ON music_content(is_active);

-- Enable Row Level Security
ALTER TABLE music_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active music content
CREATE POLICY "Anyone can view active music content"
  ON music_content
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert music content
CREATE POLICY "Admins can insert music content"
  ON music_content
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update music content
CREATE POLICY "Admins can update music content"
  ON music_content
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete music content
CREATE POLICY "Admins can delete music content"
  ON music_content
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

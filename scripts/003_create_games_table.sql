-- Create games table for managing game downloads
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  developer VARCHAR(255),
  publisher VARCHAR(255),
  description TEXT,
  cover_url TEXT,
  download_url TEXT,
  version VARCHAR(50),
  release_date DATE,
  genre VARCHAR(100), -- Action, RPG, Strategy, Puzzle, etc.
  platform VARCHAR(100), -- PC, PlayStation, Xbox, Nintendo, Mobile
  rating VARCHAR(10), -- PEGI 3, 7, 12, 16, 18
  file_size VARCHAR(50),
  downloads INTEGER DEFAULT 0,
  user_rating DECIMAL(2,1), -- 0.0 to 5.0
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active games
CREATE POLICY "Anyone can view active games"
  ON games
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert games
CREATE POLICY "Admins can insert games"
  ON games
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update games
CREATE POLICY "Admins can update games"
  ON games
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete games
CREATE POLICY "Admins can delete games"
  ON games
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

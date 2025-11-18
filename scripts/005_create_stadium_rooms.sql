-- Create stadium rooms table
CREATE TABLE IF NOT EXISTS interactive_stadium_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  theme TEXT NOT NULL DEFAULT 'stadium',
  match_title TEXT,
  poster_url TEXT,
  embed_url TEXT,
  schedule_start TIMESTAMP WITH TIME ZONE,
  schedule_end TIMESTAMP WITH TIME ZONE,
  access_level TEXT NOT NULL DEFAULT 'public',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE interactive_stadium_rooms ENABLE ROW LEVEL SECURITY;

-- Policies for stadium rooms
CREATE POLICY "Anyone can view stadium rooms"
  ON interactive_stadium_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify stadium rooms"
  ON interactive_stadium_rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Insert default stadium room
INSERT INTO interactive_stadium_rooms (room_number, name, capacity, theme, is_open, access_level, match_title) VALUES
(1, 'Grande Tribune', 100, 'stadium', true, 'public', 'Match en Direct')
ON CONFLICT (room_number) DO NOTHING;

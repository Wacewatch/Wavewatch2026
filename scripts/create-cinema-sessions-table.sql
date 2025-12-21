-- Create interactive_cinema_sessions table for multiple sessions per room
CREATE TABLE IF NOT EXISTS interactive_cinema_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES interactive_cinema_rooms(id) ON DELETE CASCADE,
  movie_title TEXT,
  movie_tmdb_id INTEGER,
  movie_poster TEXT,
  embed_url TEXT,
  schedule_start TIMESTAMP WITH TIME ZONE NOT NULL,
  schedule_end TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cinema_sessions_room_id ON interactive_cinema_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_cinema_sessions_schedule ON interactive_cinema_sessions(schedule_start, schedule_end);

-- Enable RLS
ALTER TABLE interactive_cinema_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view sessions
CREATE POLICY "Anyone can view cinema sessions" ON interactive_cinema_sessions
  FOR SELECT USING (true);

-- Policy: Only admins can manage sessions
CREATE POLICY "Admins can manage cinema sessions" ON interactive_cinema_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Add comment
COMMENT ON TABLE interactive_cinema_sessions IS 'Stores multiple movie sessions for each cinema room';

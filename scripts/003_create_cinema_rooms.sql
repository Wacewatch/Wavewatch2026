-- Create cinema rooms table
CREATE TABLE IF NOT EXISTS interactive_cinema_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  theme TEXT DEFAULT 'default', -- default, luxury, imax, vintage
  movie_tmdb_id INTEGER,
  movie_title TEXT,
  movie_poster TEXT,
  schedule_start TIMESTAMP WITH TIME ZONE,
  schedule_end TIMESTAMP WITH TIME ZONE,
  is_open BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'all', -- all, vip, vip_plus, admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seating table
CREATE TABLE IF NOT EXISTS interactive_cinema_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES interactive_cinema_rooms(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_occupied BOOLEAN DEFAULT false,
  occupied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, row_number, seat_number)
);

-- Enable RLS
ALTER TABLE interactive_cinema_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_cinema_seats ENABLE ROW LEVEL SECURITY;

-- Anyone can view open rooms
CREATE POLICY "Anyone can view open cinema rooms"
  ON interactive_cinema_rooms
  FOR SELECT
  TO public
  USING (is_open = true OR auth.uid() IS NOT NULL);

-- Only admins can manage rooms
CREATE POLICY "Admins can manage cinema rooms"
  ON interactive_cinema_rooms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Users can view seats in rooms they can access
CREATE POLICY "Users can view cinema seats"
  ON interactive_cinema_seats
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can occupy/release their own seats
CREATE POLICY "Users can manage their own seats"
  ON interactive_cinema_seats
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Create function to generate seats automatically
CREATE OR REPLACE FUNCTION generate_cinema_seats(room_uuid UUID, total_capacity INTEGER)
RETURNS void AS $$
DECLARE
  rows_count INTEGER;
  seats_per_row INTEGER;
  current_row INTEGER;
  current_seat INTEGER;
BEGIN
  -- Calculate optimal row/seat distribution
  rows_count := CEIL(SQRT(total_capacity * 0.6));
  seats_per_row := CEIL(total_capacity::FLOAT / rows_count);
  
  -- Delete existing seats for this room
  DELETE FROM interactive_cinema_seats WHERE room_id = room_uuid;
  
  -- Generate seats
  FOR current_row IN 1..rows_count LOOP
    FOR current_seat IN 1..seats_per_row LOOP
      -- Stop if we've reached capacity
      EXIT WHEN (current_row - 1) * seats_per_row + current_seat > total_capacity;
      
      INSERT INTO interactive_cinema_seats (room_id, row_number, seat_number)
      VALUES (room_uuid, current_row, current_seat);
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert example cinema rooms
INSERT INTO interactive_cinema_rooms (room_number, name, capacity, theme, is_open, access_level) VALUES
  (1, 'Salle Principale', 50, 'default', true, 'all'),
  (2, 'Salle VIP', 20, 'luxury', true, 'vip'),
  (3, 'Salle IMAX', 80, 'imax', false, 'all');

-- Generate seats for each room
DO $$
DECLARE
  room RECORD;
BEGIN
  FOR room IN SELECT id, capacity FROM interactive_cinema_rooms LOOP
    PERFORM generate_cinema_seats(room.id, room.capacity);
  END LOOP;
END $$;

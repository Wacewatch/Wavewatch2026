-- Table des salles de cinéma
CREATE TABLE IF NOT EXISTS cinema_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  room_number INTEGER,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  theme TEXT DEFAULT 'classic',
  status TEXT DEFAULT 'closed' CHECK (status IN ('open', 'closed', 'maintenance')),
  movie_id INTEGER,
  movie_title TEXT,
  movie_poster_url TEXT,
  schedule_start TIMESTAMP WITH TIME ZONE,
  schedule_end TIMESTAMP WITH TIME ZONE,
  access_level TEXT DEFAULT 'free' CHECK (access_level IN ('free', 'vip', 'vip_plus', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cinema_rooms_status ON cinema_rooms(status);
CREATE INDEX IF NOT EXISTS idx_cinema_rooms_access_level ON cinema_rooms(access_level);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_cinema_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cinema_room_updated_at
BEFORE UPDATE ON cinema_rooms
FOR EACH ROW
EXECUTE FUNCTION update_cinema_room_updated_at();

-- Table des sièges réservés
CREATE TABLE IF NOT EXISTS cinema_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reserved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, seat_number)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cinema_seats_room_id ON cinema_seats(room_id);
CREATE INDEX IF NOT EXISTS idx_cinema_seats_user_id ON cinema_seats(user_id);

-- Row Level Security
ALTER TABLE cinema_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cinema_seats ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut voir les salles
CREATE POLICY "Anyone can view cinema rooms"
ON cinema_rooms FOR SELECT
USING (true);

-- Politique : Seuls les admins peuvent créer des salles
CREATE POLICY "Only admins can insert cinema rooms"
ON cinema_rooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.is_admin = true
  )
);

-- Politique : Seuls les admins peuvent modifier des salles
CREATE POLICY "Only admins can update cinema rooms"
ON cinema_rooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.is_admin = true
  )
);

-- Politique : Seuls les admins peuvent supprimer des salles
CREATE POLICY "Only admins can delete cinema rooms"
ON cinema_rooms FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.is_admin = true
  )
);

-- Politique : Tout le monde peut voir les sièges
CREATE POLICY "Anyone can view cinema seats"
ON cinema_seats FOR SELECT
USING (true);

-- Politique : Les utilisateurs peuvent réserver des sièges
CREATE POLICY "Users can reserve seats"
ON cinema_seats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres réservations
CREATE POLICY "Users can update their own seat reservations"
ON cinema_seats FOR UPDATE
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent annuler leurs propres réservations
CREATE POLICY "Users can delete their own seat reservations"
ON cinema_seats FOR DELETE
USING (auth.uid() = user_id);

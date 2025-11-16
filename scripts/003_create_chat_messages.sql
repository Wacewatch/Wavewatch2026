-- Table des messages de chat dans le monde interactif
CREATE TABLE IF NOT EXISTS interactive_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  room TEXT NOT NULL DEFAULT 'city',
  position_x REAL,
  position_y REAL,
  position_z REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON interactive_chat_messages(room);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON interactive_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON interactive_chat_messages(user_id);

-- Row Level Security
ALTER TABLE interactive_chat_messages ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut voir les messages récents
CREATE POLICY "Anyone can view recent chat messages"
ON interactive_chat_messages FOR SELECT
USING (created_at > NOW() - INTERVAL '1 hour');

-- Politique : Les utilisateurs authentifiés peuvent envoyer des messages
CREATE POLICY "Authenticated users can send messages"
ON interactive_chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Fonction pour nettoyer les anciens messages (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM interactive_chat_messages
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

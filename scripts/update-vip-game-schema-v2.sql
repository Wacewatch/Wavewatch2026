-- Mise à jour du schéma pour le nouveau système de jeu VIP
-- Ajoute une colonne pour compter les parties jouées dans la journée

-- Supprimer l'ancienne table et recréer avec le nouveau schéma
DROP TABLE IF EXISTS vip_game_plays CASCADE;

CREATE TABLE vip_game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize VARCHAR(50) NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ad_watched BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_vip_game_plays_user_date ON vip_game_plays(user_id, played_at);

-- Activer RLS
ALTER TABLE vip_game_plays ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres parties
CREATE POLICY "Users can view own plays" ON vip_game_plays
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion
CREATE POLICY "Users can insert own plays" ON vip_game_plays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

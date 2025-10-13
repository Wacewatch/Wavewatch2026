-- Create achievements system tables

-- Achievements table: defines all available achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'movie', 'tv', 'anime', 'tv-channel', 'radio', 'retrogaming', 'playlist', 'vip', 'social', 'general'
  icon VARCHAR(50) NOT NULL, -- lucide icon name
  color VARCHAR(50) NOT NULL, -- tailwind color class
  requirement_type VARCHAR(50) NOT NULL, -- 'count', 'streak', 'time', 'rating', 'special'
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 10,
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table: tracks which achievements users have unlocked
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for all authenticated users)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default achievements

-- MOVIE ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('movie_first', 'Premier Film', 'Regardez votre premier film', 'movie', 'Film', 'text-blue-400', 'count', 1, 10, 'common'),
('movie_10', 'Cinéphile Débutant', 'Regardez 10 films', 'movie', 'Film', 'text-blue-400', 'count', 10, 25, 'common'),
('movie_50', 'Amateur de Cinéma', 'Regardez 50 films', 'movie', 'Film', 'text-blue-400', 'count', 50, 50, 'rare'),
('movie_100', 'Cinéphile Confirmé', 'Regardez 100 films', 'movie', 'Film', 'text-blue-400', 'count', 100, 100, 'epic'),
('movie_500', 'Maître du 7ème Art', 'Regardez 500 films', 'movie', 'Film', 'text-blue-400', 'count', 500, 250, 'legendary'),
('movie_marathon', 'Marathon Cinéma', 'Regardez 5 films en une journée', 'movie', 'Zap', 'text-purple-400', 'special', 5, 50, 'rare'),
('movie_critic', 'Critique Exigeant', 'Notez 50 films', 'movie', 'Star', 'text-yellow-400', 'count', 50, 40, 'rare');

-- TV SHOW ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('tv_first', 'Première Série', 'Regardez votre première série', 'tv', 'Tv', 'text-green-400', 'count', 1, 10, 'common'),
('tv_10', 'Sériephile Débutant', 'Regardez 10 séries', 'tv', 'Tv', 'text-green-400', 'count', 10, 25, 'common'),
('tv_50', 'Amateur de Séries', 'Regardez 50 séries', 'tv', 'Tv', 'text-green-400', 'count', 50, 50, 'rare'),
('tv_100', 'Sériephile Confirmé', 'Regardez 100 séries', 'tv', 'Tv', 'text-green-400', 'count', 100, 100, 'epic'),
('tv_binge', 'Binge Watcher', 'Regardez 10 épisodes en une journée', 'tv', 'Zap', 'text-purple-400', 'special', 10, 50, 'rare'),
('tv_episodes_100', 'Marathonien', 'Regardez 100 épisodes', 'tv', 'Trophy', 'text-yellow-400', 'count', 100, 50, 'rare'),
('tv_episodes_500', 'Légende des Séries', 'Regardez 500 épisodes', 'tv', 'Crown', 'text-yellow-400', 'count', 500, 150, 'epic'),
('tv_episodes_1000', 'Dieu des Séries', 'Regardez 1000 épisodes', 'tv', 'Crown', 'text-purple-400', 'count', 1000, 300, 'legendary');

-- ANIME ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('anime_first', 'Premier Anime', 'Regardez votre premier anime', 'anime', 'Sparkles', 'text-pink-400', 'count', 1, 10, 'common'),
('anime_10', 'Otaku Débutant', 'Regardez 10 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 10, 25, 'common'),
('anime_50', 'Otaku Confirmé', 'Regardez 50 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 50, 50, 'rare'),
('anime_100', 'Maître Otaku', 'Regardez 100 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 100, 100, 'epic');

-- TV CHANNEL ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('tv_channel_first', 'Première Chaîne', 'Ajoutez votre première chaîne TV en favoris', 'tv-channel', 'Tv2', 'text-cyan-400', 'count', 1, 10, 'common'),
('tv_channel_5', 'Zappeur', 'Ajoutez 5 chaînes TV en favoris', 'tv-channel', 'Tv2', 'text-cyan-400', 'count', 5, 20, 'common'),
('tv_channel_10', 'Collectionneur de Chaînes', 'Ajoutez 10 chaînes TV en favoris', 'tv-channel', 'Tv2', 'text-cyan-400', 'count', 10, 40, 'rare'),
('tv_channel_like_10', 'Fan de TV', 'Likez 10 chaînes TV', 'tv-channel', 'ThumbsUp', 'text-green-400', 'count', 10, 30, 'rare');

-- RADIO ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('radio_first', 'Première Radio', 'Ajoutez votre première radio en favoris', 'radio', 'Radio', 'text-orange-400', 'count', 1, 10, 'common'),
('radio_5', 'Auditeur Régulier', 'Ajoutez 5 radios en favoris', 'radio', 'Radio', 'text-orange-400', 'count', 5, 20, 'common'),
('radio_10', 'Mélomane', 'Ajoutez 10 radios en favoris', 'radio', 'Radio', 'text-orange-400', 'count', 10, 40, 'rare'),
('radio_like_10', 'Fan de Radio', 'Likez 10 radios', 'radio', 'ThumbsUp', 'text-green-400', 'count', 10, 30, 'rare');

-- RETROGAMING ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('game_first', 'Premier Jeu', 'Jouez à votre premier jeu rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 1, 10, 'common'),
('game_10', 'Gamer Rétro', 'Jouez à 10 jeux rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 10, 25, 'common'),
('game_50', 'Collectionneur Rétro', 'Jouez à 50 jeux rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 50, 50, 'rare'),
('game_like_20', 'Passionné de Rétro', 'Likez 20 jeux rétro', 'retrogaming', 'ThumbsUp', 'text-green-400', 'count', 20, 40, 'rare');

-- PLAYLIST ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('playlist_first', 'Première Playlist', 'Créez votre première playlist', 'playlist', 'List', 'text-indigo-400', 'count', 1, 10, 'common'),
('playlist_5', 'Organisateur', 'Créez 5 playlists', 'playlist', 'List', 'text-indigo-400', 'count', 5, 25, 'common'),
('playlist_10', 'Curateur', 'Créez 10 playlists', 'playlist', 'List', 'text-indigo-400', 'count', 10, 50, 'rare'),
('playlist_like_10', 'Découvreur', 'Likez 10 playlists', 'playlist', 'ThumbsUp', 'text-green-400', 'count', 10, 30, 'rare'),
('playlist_popular', 'Playlist Populaire', 'Une de vos playlists atteint 50 likes', 'playlist', 'TrendingUp', 'text-yellow-400', 'special', 50, 100, 'epic');

-- VIP ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('vip_bronze', 'VIP Bronze', 'Atteignez le niveau VIP Bronze', 'vip', 'Award', 'text-orange-600', 'special', 1, 50, 'rare'),
('vip_silver', 'VIP Silver', 'Atteignez le niveau VIP Silver', 'vip', 'Award', 'text-gray-400', 'special', 1, 100, 'epic'),
('vip_gold', 'VIP Gold', 'Atteignez le niveau VIP Gold', 'vip', 'Award', 'text-yellow-400', 'special', 1, 150, 'epic'),
('vip_platinum', 'VIP Platinum', 'Atteignez le niveau VIP Platinum', 'vip', 'Crown', 'text-cyan-400', 'special', 1, 250, 'legendary'),
('vip_diamond', 'VIP Diamond', 'Atteignez le niveau VIP Diamond', 'vip', 'Crown', 'text-purple-400', 'special', 1, 500, 'legendary');

-- SOCIAL ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('social_likes_50', 'Critique Positif', 'Likez 50 contenus', 'social', 'ThumbsUp', 'text-green-400', 'count', 50, 30, 'common'),
('social_likes_100', 'Super Fan', 'Likez 100 contenus', 'social', 'Heart', 'text-red-400', 'count', 100, 50, 'rare'),
('social_likes_500', 'Ambassadeur', 'Likez 500 contenus', 'social', 'Heart', 'text-pink-400', 'count', 500, 150, 'epic'),
('social_favorites_50', 'Collectionneur', 'Ajoutez 50 favoris', 'social', 'Star', 'text-yellow-400', 'count', 50, 40, 'rare'),
('social_favorites_100', 'Grand Collectionneur', 'Ajoutez 100 favoris', 'social', 'Star', 'text-yellow-400', 'count', 100, 80, 'epic');

-- GENERAL ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('general_streak_7', 'Semaine Active', 'Connectez-vous 7 jours de suite', 'general', 'Calendar', 'text-blue-400', 'streak', 7, 30, 'common'),
('general_streak_30', 'Mois Actif', 'Connectez-vous 30 jours de suite', 'general', 'Calendar', 'text-blue-400', 'streak', 30, 100, 'rare'),
('general_streak_100', 'Fidèle', 'Connectez-vous 100 jours de suite', 'general', 'Flame', 'text-orange-400', 'streak', 100, 250, 'epic'),
('general_time_24h', 'Journée Complète', 'Regardez 24h de contenu', 'general', 'Clock', 'text-purple-400', 'time', 1440, 50, 'rare'),
('general_time_week', 'Semaine de Visionnage', 'Regardez 7 jours de contenu', 'general', 'Clock', 'text-purple-400', 'time', 10080, 150, 'epic'),
('general_time_month', 'Mois de Visionnage', 'Regardez 30 jours de contenu', 'general', 'Clock', 'text-purple-400', 'time', 43200, 500, 'legendary'),
('general_explorer', 'Explorateur', 'Essayez toutes les catégories', 'general', 'Compass', 'text-cyan-400', 'special', 1, 100, 'epic'),
('general_completionist', 'Perfectionniste', 'Débloquez 50 succès', 'general', 'Trophy', 'text-yellow-400', 'special', 50, 500, 'legendary');

-- Grant permissions
GRANT SELECT ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated;

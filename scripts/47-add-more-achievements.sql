-- Add ~80 more achievements to reach ~100 total

-- MOVIE ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('movie_5', 'Premiers Pas', 'Regardez 5 films', 'movie', 'Film', 'text-blue-400', 'count', 5, 15, 'common'),
('movie_25', 'Film Fan', 'Regardez 25 films', 'movie', 'Film', 'text-blue-400', 'count', 25, 35, 'common'),
('movie_250', 'Cinéphile Expert', 'Regardez 250 films', 'movie', 'Film', 'text-blue-400', 'count', 250, 150, 'epic'),
('movie_1000', 'Légende du Cinéma', 'Regardez 1000 films', 'movie', 'Film', 'text-blue-400', 'count', 1000, 500, 'legendary'),
('movie_like_50', 'Critique Enthousiaste', 'Likez 50 films', 'movie', 'ThumbsUp', 'text-green-400', 'count', 50, 40, 'rare'),
('movie_like_100', 'Fan de Cinéma', 'Likez 100 films', 'movie', 'ThumbsUp', 'text-green-400', 'count', 100, 80, 'epic'),
('movie_fav_25', 'Collection Cinéma', 'Ajoutez 25 films en favoris', 'movie', 'Star', 'text-yellow-400', 'count', 25, 35, 'common'),
('movie_fav_50', 'Grande Collection', 'Ajoutez 50 films en favoris', 'movie', 'Star', 'text-yellow-400', 'count', 50, 60, 'rare'),
('movie_fav_100', 'Collectionneur Ultime', 'Ajoutez 100 films en favoris', 'movie', 'Star', 'text-yellow-400', 'count', 100, 120, 'epic'),
('movie_weekend', 'Weekend Cinéma', 'Regardez 3 films en un weekend', 'movie', 'Calendar', 'text-purple-400', 'special', 3, 40, 'rare');

-- TV SHOW ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('tv_5', 'Découvreur de Séries', 'Regardez 5 séries', 'tv', 'Tv', 'text-green-400', 'count', 5, 15, 'common'),
('tv_25', 'Sériephile Passionné', 'Regardez 25 séries', 'tv', 'Tv', 'text-green-400', 'count', 25, 35, 'common'),
('tv_250', 'Expert en Séries', 'Regardez 250 séries', 'tv', 'Tv', 'text-green-400', 'count', 250, 150, 'epic'),
('tv_episodes_10', 'Premier Marathon', 'Regardez 10 épisodes', 'tv', 'Zap', 'text-purple-400', 'count', 10, 15, 'common'),
('tv_episodes_50', 'Marathonien Amateur', 'Regardez 50 épisodes', 'tv', 'Zap', 'text-purple-400', 'count', 50, 35, 'common'),
('tv_episodes_250', 'Marathonien Pro', 'Regardez 250 épisodes', 'tv', 'Crown', 'text-yellow-400', 'count', 250, 80, 'rare'),
('tv_episodes_2000', 'Dieu du Binge', 'Regardez 2000 épisodes', 'tv', 'Crown', 'text-purple-400', 'count', 2000, 400, 'legendary'),
('tv_like_25', 'Fan de Séries', 'Likez 25 séries', 'tv', 'ThumbsUp', 'text-green-400', 'count', 25, 35, 'common'),
('tv_like_50', 'Super Fan TV', 'Likez 50 séries', 'tv', 'ThumbsUp', 'text-green-400', 'count', 50, 60, 'rare'),
('tv_season_complete', 'Saison Complète', 'Terminez une saison entière', 'tv', 'Trophy', 'text-yellow-400', 'special', 1, 50, 'rare');

-- ANIME ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('anime_5', 'Initié Anime', 'Regardez 5 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 5, 15, 'common'),
('anime_25', 'Otaku Passionné', 'Regardez 25 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 25, 35, 'common'),
('anime_250', 'Otaku Légendaire', 'Regardez 250 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 250, 150, 'epic'),
('anime_500', 'Senpai Ultime', 'Regardez 500 animes', 'anime', 'Sparkles', 'text-pink-400', 'count', 500, 300, 'legendary'),
('anime_like_50', 'Fan d''Anime', 'Likez 50 animes', 'anime', 'ThumbsUp', 'text-green-400', 'count', 50, 40, 'rare'),
('anime_like_100', 'Otaku Enthousiaste', 'Likez 100 animes', 'anime', 'ThumbsUp', 'text-green-400', 'count', 100, 80, 'epic'),
('anime_fav_25', 'Collection Anime', 'Ajoutez 25 animes en favoris', 'anime', 'Star', 'text-yellow-400', 'count', 25, 35, 'common'),
('anime_fav_50', 'Grande Collection Anime', 'Ajoutez 50 animes en favoris', 'anime', 'Star', 'text-yellow-400', 'count', 50, 60, 'rare'),
('anime_fav_100', 'Collectionneur Anime', 'Ajoutez 100 animes en favoris', 'anime', 'Star', 'text-yellow-400', 'count', 100, 120, 'epic'),
('anime_marathon', 'Marathon Anime', 'Regardez 10 épisodes d''anime en une journée', 'anime', 'Zap', 'text-purple-400', 'special', 10, 50, 'rare');

-- TV CHANNEL ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('tv_channel_3', 'Explorateur TV', 'Ajoutez 3 chaînes TV en favoris', 'tv-channel', 'Tv2', 'text-cyan-400', 'count', 3, 15, 'common'),
('tv_channel_20', 'Maître du Zapping', 'Ajoutez 20 chaînes TV en favoris', 'tv-channel', 'Tv2', 'text-cyan-400', 'count', 20, 60, 'rare'),
('tv_channel_50', 'Roi du Zapping', 'Ajoutez 50 chaînes TV en favoris', 'tv-channel', 'Tv2', 'text-cyan-400', 'count', 50, 120, 'epic'),
('tv_channel_like_5', 'Amateur de TV', 'Likez 5 chaînes TV', 'tv-channel', 'ThumbsUp', 'text-green-400', 'count', 5, 15, 'common'),
('tv_channel_like_25', 'Passionné de TV', 'Likez 25 chaînes TV', 'tv-channel', 'ThumbsUp', 'text-green-400', 'count', 25, 50, 'rare'),
('tv_channel_like_50', 'Expert TV', 'Likez 50 chaînes TV', 'tv-channel', 'ThumbsUp', 'text-green-400', 'count', 50, 100, 'epic'),
('tv_channel_watch_10', 'Téléspectateur Actif', 'Regardez 10 chaînes différentes', 'tv-channel', 'Eye', 'text-blue-400', 'count', 10, 30, 'common'),
('tv_channel_watch_50', 'Explorateur TV Pro', 'Regardez 50 chaînes différentes', 'tv-channel', 'Eye', 'text-blue-400', 'count', 50, 80, 'rare'),
('tv_channel_watch_100', 'Maître TV', 'Regardez 100 chaînes différentes', 'tv-channel', 'Eye', 'text-blue-400', 'count', 100, 150, 'epic'),
('tv_channel_news', 'Informé', 'Regardez une chaîne d''info', 'tv-channel', 'Newspaper', 'text-blue-400', 'special', 1, 20, 'common');

-- RADIO ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('radio_3', 'Auditeur Curieux', 'Ajoutez 3 radios en favoris', 'radio', 'Radio', 'text-orange-400', 'count', 3, 15, 'common'),
('radio_20', 'Collectionneur Radio', 'Ajoutez 20 radios en favoris', 'radio', 'Radio', 'text-orange-400', 'count', 20, 60, 'rare'),
('radio_50', 'Expert Radio', 'Ajoutez 50 radios en favoris', 'radio', 'Radio', 'text-orange-400', 'count', 50, 120, 'epic'),
('radio_like_5', 'Amateur de Radio', 'Likez 5 radios', 'radio', 'ThumbsUp', 'text-green-400', 'count', 5, 15, 'common'),
('radio_like_25', 'Passionné de Radio', 'Likez 25 radios', 'radio', 'ThumbsUp', 'text-green-400', 'count', 25, 50, 'rare'),
('radio_like_50', 'Fan de Radio Ultime', 'Likez 50 radios', 'radio', 'ThumbsUp', 'text-green-400', 'count', 50, 100, 'epic'),
('radio_listen_10', 'Auditeur Régulier', 'Écoutez 10 radios différentes', 'radio', 'Headphones', 'text-orange-400', 'count', 10, 30, 'common'),
('radio_listen_50', 'Auditeur Passionné', 'Écoutez 50 radios différentes', 'radio', 'Headphones', 'text-orange-400', 'count', 50, 80, 'rare'),
('radio_listen_100', 'Maître de la Radio', 'Écoutez 100 radios différentes', 'radio', 'Headphones', 'text-orange-400', 'count', 100, 150, 'epic'),
('radio_music', 'Mélomane', 'Écoutez une radio musicale', 'radio', 'Music', 'text-pink-400', 'special', 1, 20, 'common');

-- RETROGAMING ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('game_5', 'Joueur Nostalgique', 'Jouez à 5 jeux rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 5, 15, 'common'),
('game_25', 'Gamer Vintage', 'Jouez à 25 jeux rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 25, 35, 'common'),
('game_100', 'Maître du Rétro', 'Jouez à 100 jeux rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 100, 100, 'epic'),
('game_250', 'Légende Rétro', 'Jouez à 250 jeux rétro', 'retrogaming', 'Gamepad2', 'text-red-400', 'count', 250, 200, 'legendary'),
('game_like_10', 'Fan de Rétro', 'Likez 10 jeux rétro', 'retrogaming', 'ThumbsUp', 'text-green-400', 'count', 10, 25, 'common'),
('game_like_50', 'Passionné de Rétro', 'Likez 50 jeux rétro', 'retrogaming', 'ThumbsUp', 'text-green-400', 'count', 50, 60, 'rare'),
('game_play_25', 'Joueur Actif', 'Jouez à 25 jeux différents', 'retrogaming', 'Joystick', 'text-red-400', 'count', 25, 40, 'rare'),
('game_play_100', 'Joueur Expert', 'Jouez à 100 jeux différents', 'retrogaming', 'Joystick', 'text-red-400', 'count', 100, 120, 'epic'),
('game_arcade', 'Arcade Master', 'Jouez à un jeu d''arcade', 'retrogaming', 'Gamepad', 'text-yellow-400', 'special', 1, 30, 'common'),
('game_console', 'Console Collector', 'Jouez à des jeux de 5 consoles différentes', 'retrogaming', 'Trophy', 'text-yellow-400', 'special', 5, 80, 'rare');

-- PLAYLIST ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('playlist_3', 'Créateur', 'Créez 3 playlists', 'playlist', 'List', 'text-indigo-400', 'count', 3, 15, 'common'),
('playlist_25', 'Curateur Expert', 'Créez 25 playlists', 'playlist', 'List', 'text-indigo-400', 'count', 25, 60, 'rare'),
('playlist_50', 'Maître Curateur', 'Créez 50 playlists', 'playlist', 'List', 'text-indigo-400', 'count', 50, 120, 'epic'),
('playlist_like_5', 'Explorateur de Playlists', 'Likez 5 playlists', 'playlist', 'ThumbsUp', 'text-green-400', 'count', 5, 15, 'common'),
('playlist_like_25', 'Fan de Playlists', 'Likez 25 playlists', 'playlist', 'ThumbsUp', 'text-green-400', 'count', 25, 50, 'rare'),
('playlist_like_50', 'Collectionneur de Playlists', 'Likez 50 playlists', 'playlist', 'ThumbsUp', 'text-green-400', 'count', 50, 100, 'epic'),
('playlist_items_50', 'Playlist Fournie', 'Ajoutez 50 items dans vos playlists', 'playlist', 'ListPlus', 'text-indigo-400', 'count', 50, 40, 'rare'),
('playlist_items_100', 'Playlist Massive', 'Ajoutez 100 items dans vos playlists', 'playlist', 'ListPlus', 'text-indigo-400', 'count', 100, 80, 'epic'),
('playlist_items_250', 'Playlist Géante', 'Ajoutez 250 items dans vos playlists', 'playlist', 'ListPlus', 'text-indigo-400', 'count', 250, 150, 'legendary'),
('playlist_shared', 'Partageur', 'Partagez une playlist', 'playlist', 'Share', 'text-blue-400', 'special', 1, 30, 'common');

-- SOCIAL ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('social_likes_10', 'Premier Fan', 'Likez 10 contenus', 'social', 'ThumbsUp', 'text-green-400', 'count', 10, 15, 'common'),
('social_likes_25', 'Fan Actif', 'Likez 25 contenus', 'social', 'ThumbsUp', 'text-green-400', 'count', 25, 25, 'common'),
('social_likes_250', 'Super Ambassadeur', 'Likez 250 contenus', 'social', 'Heart', 'text-pink-400', 'count', 250, 100, 'rare'),
('social_likes_1000', 'Légende Sociale', 'Likez 1000 contenus', 'social', 'Heart', 'text-pink-400', 'count', 1000, 300, 'legendary'),
('social_favorites_25', 'Collectionneur Débutant', 'Ajoutez 25 favoris', 'social', 'Star', 'text-yellow-400', 'count', 25, 30, 'common'),
('social_favorites_250', 'Collectionneur Expert', 'Ajoutez 250 favoris', 'social', 'Star', 'text-yellow-400', 'count', 250, 150, 'epic'),
('social_favorites_500', 'Collectionneur Ultime', 'Ajoutez 500 favoris', 'social', 'Star', 'text-yellow-400', 'count', 500, 300, 'legendary'),
('social_diverse', 'Éclectique', 'Likez au moins 5 types de contenus différents', 'social', 'Sparkles', 'text-purple-400', 'special', 5, 60, 'rare'),
('social_active', 'Membre Actif', 'Interagissez 100 fois (likes + favoris)', 'social', 'Zap', 'text-yellow-400', 'special', 100, 80, 'rare'),
('social_influencer', 'Influenceur', 'Recevez 100 likes sur vos playlists', 'social', 'TrendingUp', 'text-yellow-400', 'special', 100, 150, 'epic');

-- GENERAL ACHIEVEMENTS (add 10 more)
INSERT INTO achievements (code, name, description, category, icon, color, requirement_type, requirement_value, points, rarity) VALUES
('general_streak_3', 'Régularité', 'Connectez-vous 3 jours de suite', 'general', 'Calendar', 'text-blue-400', 'streak', 3, 15, 'common'),
('general_streak_14', 'Deux Semaines', 'Connectez-vous 14 jours de suite', 'general', 'Calendar', 'text-blue-400', 'streak', 14, 50, 'rare'),
('general_streak_60', 'Deux Mois', 'Connectez-vous 60 jours de suite', 'general', 'Flame', 'text-orange-400', 'streak', 60, 150, 'epic'),
('general_streak_365', 'Année Complète', 'Connectez-vous 365 jours de suite', 'general', 'Flame', 'text-orange-400', 'streak', 365, 500, 'legendary'),
('general_time_1h', 'Première Heure', 'Regardez 1h de contenu', 'general', 'Clock', 'text-purple-400', 'time', 60, 10, 'common'),
('general_time_6h', 'Demi-Journée', 'Regardez 6h de contenu', 'general', 'Clock', 'text-purple-400', 'time', 360, 30, 'common'),
('general_time_12h', 'Journée Active', 'Regardez 12h de contenu', 'general', 'Clock', 'text-purple-400', 'time', 720, 40, 'rare'),
('general_time_3d', 'Trois Jours', 'Regardez 3 jours de contenu', 'general', 'Clock', 'text-purple-400', 'time', 4320, 80, 'rare'),
('general_time_2weeks', 'Deux Semaines', 'Regardez 2 semaines de contenu', 'general', 'Clock', 'text-purple-400', 'time', 21600, 200, 'epic'),
('general_time_3months', 'Trois Mois', 'Regardez 3 mois de contenu', 'general', 'Clock', 'text-purple-400', 'time', 129600, 600, 'legendary');

-- Grant permissions
GRANT SELECT ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated;

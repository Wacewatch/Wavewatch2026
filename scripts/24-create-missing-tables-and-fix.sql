-- Script pour créer les tables manquantes et corriger les problèmes d'administration

-- 1. Créer la table movies si elle n'existe pas
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    genre VARCHAR(100),
    rating DECIMAL(3,1) DEFAULT 0,
    duration INTEGER DEFAULT 0,
    director VARCHAR(255),
    cast TEXT[],
    synopsis TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    stream_url TEXT,
    download_url TEXT,
    tmdb_id INTEGER,
    quality VARCHAR(50) DEFAULT 'HD',
    language VARCHAR(100) DEFAULT 'Français',
    subtitles TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table tv_shows si elle n'existe pas
CREATE TABLE IF NOT EXISTS tv_shows (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    genre VARCHAR(100),
    rating DECIMAL(3,1) DEFAULT 0,
    seasons INTEGER DEFAULT 1,
    episodes INTEGER DEFAULT 1,
    creator VARCHAR(255),
    cast TEXT[],
    synopsis TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    stream_url TEXT,
    tmdb_id INTEGER,
    quality VARCHAR(50) DEFAULT 'HD',
    language VARCHAR(100) DEFAULT 'Français',
    subtitles TEXT,
    status VARCHAR(50) DEFAULT 'En cours',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table anime si elle n'existe pas
CREATE TABLE IF NOT EXISTS anime (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    genre VARCHAR(100),
    rating DECIMAL(3,1) DEFAULT 0,
    seasons INTEGER DEFAULT 1,
    episodes INTEGER DEFAULT 1,
    studio VARCHAR(255),
    cast TEXT[],
    synopsis TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    stream_url TEXT,
    mal_id INTEGER,
    quality VARCHAR(50) DEFAULT 'HD',
    language VARCHAR(100) DEFAULT 'Japonais',
    subtitles TEXT,
    status VARCHAR(50) DEFAULT 'En cours',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vérifier et ajouter les colonnes is_active aux tables existantes
DO $$ 
BEGIN
    -- Ajouter is_active à tv_channels si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tv_channels' AND column_name = 'is_active') THEN
        ALTER TABLE tv_channels ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Ajouter is_active à radio_stations si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'radio_stations' AND column_name = 'is_active') THEN
        ALTER TABLE radio_stations ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Ajouter is_active à retrogaming_sources si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retrogaming_sources' AND column_name = 'is_active') THEN
        ALTER TABLE retrogaming_sources ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 5. Mettre à jour les valeurs NULL vers true pour les tables existantes
UPDATE tv_channels SET is_active = true WHERE is_active IS NULL;
UPDATE radio_stations SET is_active = true WHERE is_active IS NULL;
UPDATE retrogaming_sources SET is_active = true WHERE is_active IS NULL;

-- 6. Activer RLS sur toutes les tables
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrogaming_sources ENABLE ROW LEVEL SECURITY;

-- 7. Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "tv_channels_policy" ON tv_channels;
DROP POLICY IF EXISTS "radio_stations_policy" ON radio_stations;
DROP POLICY IF EXISTS "retrogaming_sources_policy" ON retrogaming_sources;
DROP POLICY IF EXISTS "movies_policy" ON movies;
DROP POLICY IF EXISTS "tv_shows_policy" ON tv_shows;
DROP POLICY IF EXISTS "anime_policy" ON anime;

-- 8. Créer des politiques permissives pour toutes les tables
-- TV Channels
CREATE POLICY "tv_channels_select_policy" ON tv_channels FOR SELECT USING (true);
CREATE POLICY "tv_channels_insert_policy" ON tv_channels FOR INSERT WITH CHECK (true);
CREATE POLICY "tv_channels_update_policy" ON tv_channels FOR UPDATE USING (true);
CREATE POLICY "tv_channels_delete_policy" ON tv_channels FOR DELETE USING (true);

-- Radio Stations
CREATE POLICY "radio_stations_select_policy" ON radio_stations FOR SELECT USING (true);
CREATE POLICY "radio_stations_insert_policy" ON radio_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "radio_stations_update_policy" ON radio_stations FOR UPDATE USING (true);
CREATE POLICY "radio_stations_delete_policy" ON radio_stations FOR DELETE USING (true);

-- Retrogaming Sources
CREATE POLICY "retrogaming_sources_select_policy" ON retrogaming_sources FOR SELECT USING (true);
CREATE POLICY "retrogaming_sources_insert_policy" ON retrogaming_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "retrogaming_sources_update_policy" ON retrogaming_sources FOR UPDATE USING (true);
CREATE POLICY "retrogaming_sources_delete_policy" ON retrogaming_sources FOR DELETE USING (true);

-- Movies
CREATE POLICY "movies_select_policy" ON movies FOR SELECT USING (true);
CREATE POLICY "movies_insert_policy" ON movies FOR INSERT WITH CHECK (true);
CREATE POLICY "movies_update_policy" ON movies FOR UPDATE USING (true);
CREATE POLICY "movies_delete_policy" ON movies FOR DELETE USING (true);

-- TV Shows
CREATE POLICY "tv_shows_select_policy" ON tv_shows FOR SELECT USING (true);
CREATE POLICY "tv_shows_insert_policy" ON tv_shows FOR INSERT WITH CHECK (true);
CREATE POLICY "tv_shows_update_policy" ON tv_shows FOR UPDATE USING (true);
CREATE POLICY "tv_shows_delete_policy" ON tv_shows FOR DELETE USING (true);

-- Anime
CREATE POLICY "anime_select_policy" ON anime FOR SELECT USING (true);
CREATE POLICY "anime_insert_policy" ON anime FOR INSERT WITH CHECK (true);
CREATE POLICY "anime_update_policy" ON anime FOR UPDATE USING (true);
CREATE POLICY "anime_delete_policy" ON anime FOR DELETE USING (true);

-- 9. Accorder tous les privilèges sur les tables
GRANT ALL PRIVILEGES ON movies TO authenticated;
GRANT ALL PRIVILEGES ON tv_shows TO authenticated;
GRANT ALL PRIVILEGES ON anime TO authenticated;
GRANT ALL PRIVILEGES ON tv_channels TO authenticated;
GRANT ALL PRIVILEGES ON radio_stations TO authenticated;
GRANT ALL PRIVILEGES ON retrogaming_sources TO authenticated;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

-- 10. Accorder les privilèges sur les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 11. Insérer quelques données de test
-- Movies
INSERT INTO movies (title, year, genre, rating, synopsis, is_active)
SELECT 'Avengers: Endgame', 2019, 'Action', 8.4, 'Les Avengers s''unissent pour vaincre Thanos.', true
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Avengers: Endgame');

INSERT INTO movies (title, year, genre, rating, synopsis, is_active)
SELECT 'Inception', 2010, 'Sci-Fi', 8.8, 'Un voleur qui s''infiltre dans les rêves.', true
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Inception');

-- TV Shows
INSERT INTO tv_shows (title, year, genre, rating, seasons, synopsis, is_active)
SELECT 'Breaking Bad', 2008, 'Drame', 9.5, 5, 'Un professeur de chimie devient fabricant de drogue.', true
WHERE NOT EXISTS (SELECT 1 FROM tv_shows WHERE title = 'Breaking Bad');

INSERT INTO tv_shows (title, year, genre, rating, seasons, synopsis, is_active)
SELECT 'Stranger Things', 2016, 'Sci-Fi', 8.7, 4, 'Des enfants découvrent des phénomènes surnaturels.', true
WHERE NOT EXISTS (SELECT 1 FROM tv_shows WHERE title = 'Stranger Things');

-- Anime
INSERT INTO anime (title, year, genre, rating, seasons, synopsis, is_active)
SELECT 'Attack on Titan', 2013, 'Action', 9.0, 4, 'L''humanité lutte contre des titans géants.', true
WHERE NOT EXISTS (SELECT 1 FROM anime WHERE title = 'Attack on Titan');

INSERT INTO anime (title, year, genre, rating, seasons, synopsis, is_active)
SELECT 'One Piece', 1999, 'Aventure', 8.9, 1, 'Les aventures de Monkey D. Luffy et son équipage.', true
WHERE NOT EXISTS (SELECT 1 FROM anime WHERE title = 'One Piece');

-- 12. Afficher un résumé des tables créées
SELECT 'RÉSUMÉ DES TABLES CRÉÉES ET CONFIGURÉES' as status;

SELECT 
    'movies' as table_name, 
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END as status
FROM movies
UNION ALL
SELECT 
    'tv_shows', 
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END
FROM tv_shows
UNION ALL
SELECT 
    'anime', 
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END
FROM anime
UNION ALL
SELECT 
    'tv_channels', 
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END
FROM tv_channels
UNION ALL
SELECT 
    'radio_stations', 
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END
FROM radio_stations
UNION ALL
SELECT 
    'retrogaming_sources', 
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END
FROM retrogaming_sources
UNION ALL
SELECT 
    'user_profiles', 
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Vide' END
FROM user_profiles;

SELECT 'Configuration terminée avec succès !' as message;

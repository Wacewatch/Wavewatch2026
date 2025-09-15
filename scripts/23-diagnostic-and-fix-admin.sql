-- Script de diagnostic et correction pour l'administration

-- 1. Vérifier et créer les colonnes is_active si elles n'existent pas
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
    
    -- Ajouter is_active à movies si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'movies' AND column_name = 'is_active') THEN
        ALTER TABLE movies ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Ajouter is_active à tv_shows si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tv_shows' AND column_name = 'is_active') THEN
        ALTER TABLE tv_shows ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Ajouter is_active à anime si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'anime' AND column_name = 'is_active') THEN
        ALTER TABLE anime ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. Mettre à jour les valeurs NULL vers true
UPDATE tv_channels SET is_active = true WHERE is_active IS NULL;
UPDATE radio_stations SET is_active = true WHERE is_active IS NULL;
UPDATE retrogaming_sources SET is_active = true WHERE is_active IS NULL;
UPDATE movies SET is_active = true WHERE is_active IS NULL;
UPDATE tv_shows SET is_active = true WHERE is_active IS NULL;
UPDATE anime SET is_active = true WHERE is_active IS NULL;

-- 3. Supprimer les politiques RLS restrictives et créer des politiques permissives pour les admins
DROP POLICY IF EXISTS "tv_channels_policy" ON tv_channels;
DROP POLICY IF EXISTS "radio_stations_policy" ON radio_stations;
DROP POLICY IF EXISTS "retrogaming_sources_policy" ON retrogaming_sources;
DROP POLICY IF EXISTS "movies_policy" ON movies;
DROP POLICY IF EXISTS "tv_shows_policy" ON tv_shows;
DROP POLICY IF EXISTS "anime_policy" ON anime;

-- Créer des politiques permissives pour tous les utilisateurs authentifiés
CREATE POLICY "tv_channels_select_policy" ON tv_channels FOR SELECT USING (true);
CREATE POLICY "tv_channels_insert_policy" ON tv_channels FOR INSERT WITH CHECK (true);
CREATE POLICY "tv_channels_update_policy" ON tv_channels FOR UPDATE USING (true);
CREATE POLICY "tv_channels_delete_policy" ON tv_channels FOR DELETE USING (true);

CREATE POLICY "radio_stations_select_policy" ON radio_stations FOR SELECT USING (true);
CREATE POLICY "radio_stations_insert_policy" ON radio_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "radio_stations_update_policy" ON radio_stations FOR UPDATE USING (true);
CREATE POLICY "radio_stations_delete_policy" ON radio_stations FOR DELETE USING (true);

CREATE POLICY "retrogaming_sources_select_policy" ON retrogaming_sources FOR SELECT USING (true);
CREATE POLICY "retrogaming_sources_insert_policy" ON retrogaming_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "retrogaming_sources_update_policy" ON retrogaming_sources FOR UPDATE USING (true);
CREATE POLICY "retrogaming_sources_delete_policy" ON retrogaming_sources FOR DELETE USING (true);

CREATE POLICY "movies_select_policy" ON movies FOR SELECT USING (true);
CREATE POLICY "movies_insert_policy" ON movies FOR INSERT WITH CHECK (true);
CREATE POLICY "movies_update_policy" ON movies FOR UPDATE USING (true);
CREATE POLICY "movies_delete_policy" ON movies FOR DELETE USING (true);

CREATE POLICY "tv_shows_select_policy" ON tv_shows FOR SELECT USING (true);
CREATE POLICY "tv_shows_insert_policy" ON tv_shows FOR INSERT WITH CHECK (true);
CREATE POLICY "tv_shows_update_policy" ON tv_shows FOR UPDATE USING (true);
CREATE POLICY "tv_shows_delete_policy" ON tv_shows FOR DELETE USING (true);

CREATE POLICY "anime_select_policy" ON anime FOR SELECT USING (true);
CREATE POLICY "anime_insert_policy" ON anime FOR INSERT WITH CHECK (true);
CREATE POLICY "anime_update_policy" ON anime FOR UPDATE USING (true);
CREATE POLICY "anime_delete_policy" ON anime FOR DELETE USING (true);

-- 4. Accorder tous les privilèges sur les tables
GRANT ALL PRIVILEGES ON tv_channels TO authenticated;
GRANT ALL PRIVILEGES ON radio_stations TO authenticated;
GRANT ALL PRIVILEGES ON retrogaming_sources TO authenticated;
GRANT ALL PRIVILEGES ON movies TO authenticated;
GRANT ALL PRIVILEGES ON tv_shows TO authenticated;
GRANT ALL PRIVILEGES ON anime TO authenticated;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

-- 5. Accorder les privilèges sur les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. Créer quelques données de test si les tables sont vides
INSERT INTO tv_channels (name, category, country, language, stream_url, logo_url, description, quality, is_active)
SELECT 'TF1', 'Généraliste', 'France', 'Français', 'https://example.com/tf1', 'https://example.com/tf1-logo.png', 'Première chaîne française', 'HD', true
WHERE NOT EXISTS (SELECT 1 FROM tv_channels WHERE name = 'TF1');

INSERT INTO radio_stations (name, genre, country, frequency, stream_url, logo_url, description, is_active)
SELECT 'NRJ', 'Pop', 'France', '100.3 FM', 'https://example.com/nrj', 'https://example.com/nrj-logo.png', 'Radio musicale populaire', true
WHERE NOT EXISTS (SELECT 1 FROM radio_stations WHERE name = 'NRJ');

INSERT INTO retrogaming_sources (name, description, url, color, category, is_active)
SELECT 'GameOnline', 'Collection de jeux rétro en ligne', 'https://gam.onl/', 'bg-blue-600', 'Browser', true
WHERE NOT EXISTS (SELECT 1 FROM retrogaming_sources WHERE name = 'GameOnline');

-- 7. Afficher un résumé des tables
SELECT 'tv_channels' as table_name, COUNT(*) as count FROM tv_channels
UNION ALL
SELECT 'radio_stations', COUNT(*) FROM radio_stations
UNION ALL
SELECT 'retrogaming_sources', COUNT(*) FROM retrogaming_sources
UNION ALL
SELECT 'movies', COUNT(*) FROM movies
UNION ALL
SELECT 'tv_shows', COUNT(*) FROM tv_shows
UNION ALL
SELECT 'anime', COUNT(*) FROM anime
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;

-- Vérifier et créer la table radio_stations si elle n'existe pas
CREATE TABLE IF NOT EXISTS radio_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    country VARCHAR(100),
    frequency VARCHAR(50),
    stream_url TEXT,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter la colonne frequency si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='radio_stations' AND column_name='frequency') THEN
        ALTER TABLE radio_stations ADD COLUMN frequency VARCHAR(50);
    END IF;
END $$;

-- Ajouter la colonne website si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='radio_stations' AND column_name='website') THEN
        ALTER TABLE radio_stations ADD COLUMN website TEXT;
    END IF;
END $$;

-- Créer la table retrogaming_sources si elle n'existe pas
CREATE TABLE IF NOT EXISTS retrogaming_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    color VARCHAR(50) DEFAULT 'bg-blue-600',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrogaming_sources ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour radio_stations
DROP POLICY IF EXISTS "Allow public read access to radio_stations" ON radio_stations;
CREATE POLICY "Allow public read access to radio_stations" ON radio_stations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to radio_stations" ON radio_stations;
CREATE POLICY "Allow admin full access to radio_stations" ON radio_stations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

-- Créer les politiques RLS pour retrogaming_sources
DROP POLICY IF EXISTS "Allow public read access to retrogaming_sources" ON retrogaming_sources;
CREATE POLICY "Allow public read access to retrogaming_sources" ON retrogaming_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to retrogaming_sources" ON retrogaming_sources;
CREATE POLICY "Allow admin full access to retrogaming_sources" ON retrogaming_sources FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

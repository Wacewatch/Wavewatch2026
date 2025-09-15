-- Créer les tables pour le contenu géré par l'admin

-- Table pour les chaînes TV
CREATE TABLE IF NOT EXISTS tv_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    language VARCHAR(100) NOT NULL,
    stream_url TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    quality VARCHAR(50) DEFAULT 'HD',
    schedule VARCHAR(100) DEFAULT '24/7',
    is_active BOOLEAN DEFAULT true,
    viewers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les stations radio
CREATE TABLE IF NOT EXISTS radio_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    frequency VARCHAR(50),
    stream_url TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true,
    listeners INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les sources retrogaming
CREATE TABLE IF NOT EXISTS retrogaming_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    color VARCHAR(50) DEFAULT 'bg-blue-600',
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les données existantes des chaînes TV
INSERT INTO tv_channels (name, category, country, language, stream_url, logo_url, description, quality, schedule, viewers) VALUES
('Master TV', 'Premium', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/BgYgx', 'https://i.imgur.com/8QZqZqZ.png', 'Chaîne premium Master TV avec du contenu exclusif', 'HD', '24/7', 5420),
('TF1', 'Généraliste', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/Z4no6', 'https://logos-world.net/wp-content/uploads/2020/06/TF1-Logo.png', 'Première chaîne de télévision française', 'HD', '24/7', 12500),
('Canal+', 'Premium', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/Y6mnp', 'https://logos-world.net/wp-content/uploads/2020/06/Canal-Plus-Logo.png', 'Canal+ - Chaîne premium généraliste', '4K', '24/7', 8900),
('Canal+ Sport 1', 'Sport', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/X69ok', 'https://logos-world.net/wp-content/uploads/2020/06/Canal-Plus-Logo.png', 'Canal+ Sport 1 - Sports en direct', 'HD', '24/7', 7500),
('BeIN Sport 1', 'Sport', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/oYk7K', 'https://logos-world.net/wp-content/uploads/2020/06/beIN-Sports-Logo.png', 'BeIN Sport 1 - Sports internationaux', 'HD', '24/7', 6800),
('W9', 'Généraliste', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/1jNnj', 'https://logos-world.net/wp-content/uploads/2020/06/W9-Logo.png', 'W9 - Chaîne généraliste', 'HD', '24/7', 4200),
('6ter', 'Généraliste', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/2RNov', 'https://logos-world.net/wp-content/uploads/2020/06/6ter-Logo.png', '6ter - Chaîne du groupe M6', 'HD', '24/7', 3800),
('Canal J', 'Jeunesse', 'France', 'Français', 'https://embed.wavewatch.xyz/embed/Wn97W', 'https://i.imgur.com/CanalJ.png', 'Canal J - Chaîne jeunesse', 'HD', '24/7', 2900);

-- Insérer les données existantes des stations radio
INSERT INTO radio_stations (name, genre, country, frequency, stream_url, logo_url, description, website, listeners) VALUES
('NRJ', 'Pop', 'France', '100.3 FM', 'https://cdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3', 'https://upload.wikimedia.org/wikipedia/commons/f/ff/NRJ_2015_logo.png', 'Hit Music Only - La radio des hits', 'https://nrj.fr', 2150000),
('RTL', 'Talk/News', 'France', '104.3 FM', 'https://streaming.radio.rtl.fr/rtl-1-44-128', 'https://upload.wikimedia.org/wikipedia/commons/2/28/RTL_logo_2015.png', 'RTL, c est vous !', 'https://rtl.fr', 1850000),
('France Inter', 'Talk/News', 'France', '87.8 FM', 'https://direct.franceinter.fr/live/franceinter-midfi.mp3', 'https://upload.wikimedia.org/wikipedia/commons/9/9b/France_Inter_logo_2021.svg', 'L esprit d ouverture', 'https://franceinter.fr', 1650000),
('Skyrock', 'Rap/Hip-Hop', 'France', '96.0 FM', 'https://icecast.skyrock.net/s/natio_mp3_128k', 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Skyrock_logo_2019.png', 'Première sur le Rap', 'https://skyrock.fm', 1200000),
('Europe 1', 'Talk/News', 'France', '104.7 FM', 'https://europe1.lmn.fm/europe1.mp3', 'https://upload.wikimedia.org/wikipedia/commons/7/79/Europe_1_logo_2019.svg', 'La radio qui vous réveille', 'https://europe1.fr', 980000),
('Fun Radio', 'Électronique', 'France', '101.9 FM', 'https://streaming.radio.funradio.fr/fun-1-44-128', 'https://upload.wikimedia.org/wikipedia/commons/3/35/Fun_Radio_logo_2013.png', 'Son Dancefloor', 'https://funradio.fr', 850000);

-- Insérer les données existantes des sources retrogaming
INSERT INTO retrogaming_sources (name, description, url, color, category) VALUES
('GameOnline', 'Collection de jeux rétro classiques jouables directement dans le navigateur', 'https://gam.onl/', 'bg-blue-600', 'Arcade'),
('RetroGames Online', 'Jeux vintage des années 80-90', 'https://www.retrogames.onl/', 'bg-green-600', 'Console'),
('WebRcade', 'Émulateur web moderne', 'https://play.webrcade.com/', 'bg-purple-600', 'Émulateur'),
('EmuOS', 'Système d exploitation rétro', 'https://emupedia.net/beta/emuos/', 'bg-orange-600', 'OS Rétro'),
('RetroGames.me', 'Jeux de console portable', 'https://www.retrogames.me/', 'bg-red-600', 'Portable'),
('Play Retro Games', 'Plateforme de jeux classiques', 'https://playretrogames.online/', 'bg-indigo-600', 'Classique');

-- Activer RLS sur les tables
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrogaming_sources ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre la lecture à tous
CREATE POLICY "Allow read access to tv_channels" ON tv_channels FOR SELECT USING (true);
CREATE POLICY "Allow read access to radio_stations" ON radio_stations FOR SELECT USING (true);
CREATE POLICY "Allow read access to retrogaming_sources" ON retrogaming_sources FOR SELECT USING (true);

-- Politiques RLS pour permettre les modifications aux admins seulement
CREATE POLICY "Allow admin full access to tv_channels" ON tv_channels FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

CREATE POLICY "Allow admin full access to radio_stations" ON radio_stations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

CREATE POLICY "Allow admin full access to retrogaming_sources" ON retrogaming_sources FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
);

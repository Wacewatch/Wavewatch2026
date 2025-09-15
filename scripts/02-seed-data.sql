-- WaveWatch TV Channels Data
-- Insert real TV channels with iframe URLs

INSERT INTO public.tv_channels (name, description, stream_url, category, country, language, quality, is_active) VALUES
-- Master TV (en premier comme demandé)
('Master TV', 'Chaîne principale WaveWatch', 'https://embed.wavewatch.xyz/embed/BgYgx', 'Généraliste', 'FR', 'fr', 'HD', true),

-- Canal+ Sport
('Canal+ Sport 1', 'Canal+ Sport 1 - Sports en direct', 'https://embed.wavewatch.xyz/embed/X69ok', 'Sport', 'FR', 'fr', 'HD', true),
('Canal+ Sport', 'Canal+ Sport - Événements sportifs', 'https://embed.wavewatch.xyz/embed/VmVP5', 'Sport', 'FR', 'fr', 'HD', true),
('Canal+ Foot', 'Canal+ Foot - Football en direct', 'https://embed.wavewatch.xyz/embed/GZrEy', 'Sport', 'FR', 'fr', 'HD', true),
('Canal+ MotoGP', 'Canal+ MotoGP - Courses de moto', 'https://embed.wavewatch.xyz/embed/Q1807', 'Sport', 'FR', 'fr', 'HD', true),
('Canal+ Formula 1', 'Canal+ Formula 1 - Courses de F1', 'https://embed.wavewatch.xyz/embed/P1VZz', 'Sport', 'FR', 'fr', 'HD', true),

-- Canal+ Autres
('Canal+', 'Canal+ - Chaîne premium', 'https://embed.wavewatch.xyz/embed/Y6mnp', 'Premium', 'FR', 'fr', 'HD', true),
('Canal+ Cinéma', 'Canal+ Cinéma - Films et cinéma', 'https://embed.wavewatch.xyz/embed/O70yg', 'Cinéma', 'FR', 'fr', 'HD', true),
('Canal+ Séries', 'Canal+ Séries - Séries TV', 'https://embed.wavewatch.xyz/embed/RgVoL', 'Séries', 'FR', 'fr', 'HD', true),
('Canal J', 'Canal J - Chaîne jeunesse', 'https://embed.wavewatch.xyz/embed/Wn97W', 'Jeunesse', 'FR', 'fr', 'HD', true),

-- BeIN Sport
('BeIN Sport 1', 'BeIN Sport 1 - Sports internationaux', 'https://embed.wavewatch.xyz/embed/oYk7K', 'Sport', 'FR', 'fr', 'HD', true),
('BeIN Sport 2', 'BeIN Sport 2 - Sports internationaux', 'https://embed.wavewatch.xyz/embed/y8v8V', 'Sport', 'FR', 'fr', 'HD', true),
('BeIN Sport 3', 'BeIN Sport 3 - Sports internationaux', 'https://embed.wavewatch.xyz/embed/zmwmr', 'Sport', 'FR', 'fr', 'HD', true),

-- DAZN
('DAZN 1', 'DAZN 1 - Sports en streaming', 'https://embed.wavewatch.xyz/embed/0gPZL', 'Sport', 'FR', 'fr', 'HD', true),
('DAZN 2', 'DAZN 2 - Sports en streaming', 'https://embed.wavewatch.xyz/embed/wjqjJ', 'Sport', 'FR', 'fr', 'HD', true),
('DAZN 3', 'DAZN 3 - Sports en streaming', 'https://embed.wavewatch.xyz/embed/xGrGJ', 'Sport', 'FR', 'fr', 'HD', true),

-- RMC Sport
('RMC Sport 1', 'RMC Sport 1 - Sports français', 'https://embed.wavewatch.xyz/embed/DRVRB', 'Sport', 'FR', 'fr', 'HD', true),
('RMC Sport 2', 'RMC Sport 2 - Sports français', 'https://embed.wavewatch.xyz/embed/ElVlN', 'Sport', 'FR', 'fr', 'HD', true),
('RMC Sport 3', 'RMC Sport 3 - Sports français', 'https://embed.wavewatch.xyz/embed/GZVZy', 'Sport', 'FR', 'fr', 'HD', true),

-- Chaînes généralistes
('TF1', 'TF1 - Première chaîne française', 'https://embed.wavewatch.xyz/embed/Z4no6', 'Généraliste', 'FR', 'fr', 'HD', true),
('W9', 'W9 - Chaîne de divertissement', 'https://embed.wavewatch.xyz/embed/1jNnj', 'Divertissement', 'FR', 'fr', 'HD', true),
('6ter', '6ter - Chaîne du groupe M6', 'https://embed.wavewatch.xyz/embed/2RNov', 'Divertissement', 'FR', 'fr', 'HD', true),

-- Autres chaînes
('Warner TV', 'Warner TV - Films et séries', 'https://embed.wavewatch.xyz/embed/98N2J', 'Cinéma', 'FR', 'fr', 'HD', true),
('100% Doc', '100% Doc - Documentaires', 'https://embed.wavewatch.xyz/embed/r0l0w', 'Documentaire', 'FR', 'fr', 'HD', true),
('MGG Fast', 'MGG Fast - Gaming et esport', 'https://embed.wavewatch.xyz/embed/vgpgV', 'Gaming', 'FR', 'fr', 'HD', true);

-- Success message
SELECT 'TV channels data inserted successfully!' as status;

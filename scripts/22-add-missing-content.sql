-- Ajouter les chaînes TV manquantes

INSERT INTO tv_channels (name, category, country, language, stream_url, logo_url, description, quality, schedule, viewers) VALUES
-- Chaînes françaises supplémentaires
('France 2', 'Generaliste', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Fr2tv', 'https://logos-world.net/wp-content/uploads/2020/06/France-2-Logo.png', 'France 2 - Service public francais', 'HD', '24/7', 11200),
('France 3', 'Generaliste', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Fr3tv', 'https://logos-world.net/wp-content/uploads/2020/06/France-3-Logo.png', 'France 3 - Television regionale', 'HD', '24/7', 8900),
('M6', 'Generaliste', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/M6tv', 'https://logos-world.net/wp-content/uploads/2020/06/M6-Logo.png', 'M6 - La chaine qui ose', 'HD', '24/7', 9800),
('Arte', 'Documentaire', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Arte', 'https://logos-world.net/wp-content/uploads/2020/06/Arte-Logo.png', 'Arte - La chaine culturelle europeenne', 'HD', '24/7', 3200),
('France 5', 'Documentaire', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Fr5tv', 'https://logos-world.net/wp-content/uploads/2020/06/France-5-Logo.png', 'France 5 - La chaine de la connaissance', 'HD', '24/7', 2800),
('C8', 'Generaliste', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/C8tv', 'https://logos-world.net/wp-content/uploads/2020/06/C8-Logo.png', 'C8 - Divertissement et info', 'HD', '24/7', 4500),
('TMC', 'Generaliste', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/TMCtv', 'https://logos-world.net/wp-content/uploads/2020/06/TMC-Logo.png', 'TMC - Television Monte Carlo', 'HD', '24/7', 3800),
('TFX', 'Generaliste', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/TFXtv', 'https://logos-world.net/wp-content/uploads/2020/06/TFX-Logo.png', 'TFX - Groupe TF1', 'HD', '24/7', 3200),

-- Chaînes sport
('RMC Sport 1', 'Sport', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/RMC1', 'https://logos-world.net/wp-content/uploads/2020/06/RMC-Sport-Logo.png', 'RMC Sport 1 - Sports premium', 'HD', '24/7', 5200),
('RMC Sport 2', 'Sport', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/RMC2', 'https://logos-world.net/wp-content/uploads/2020/06/RMC-Sport-Logo.png', 'RMC Sport 2 - Sports premium', 'HD', '24/7', 4800),
('Eurosport 1', 'Sport', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Euro1', 'https://logos-world.net/wp-content/uploads/2020/06/Eurosport-Logo.png', 'Eurosport 1 - Sports europeens', 'HD', '24/7', 6200),
('Eurosport 2', 'Sport', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Euro2', 'https://logos-world.net/wp-content/uploads/2020/06/Eurosport-Logo.png', 'Eurosport 2 - Sports europeens', 'HD', '24/7', 4900),

-- Chaînes jeunesse
('Gulli', 'Jeunesse', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Gulli', 'https://logos-world.net/wp-content/uploads/2020/06/Gulli-Logo.png', 'Gulli - La chaine des enfants', 'HD', '24/7', 2100),
('Disney Channel', 'Jeunesse', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Disney', 'https://logos-world.net/wp-content/uploads/2020/06/Disney-Channel-Logo.png', 'Disney Channel - Magie Disney', 'HD', '24/7', 1800),
('Cartoon Network', 'Jeunesse', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/Cartoon', 'https://logos-world.net/wp-content/uploads/2020/06/Cartoon-Network-Logo.png', 'Cartoon Network - Dessins animes', 'HD', '24/7', 1600),

-- Chaînes premium
('OCS Max', 'Premium', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/OCSMax', 'https://logos-world.net/wp-content/uploads/2020/06/OCS-Logo.png', 'OCS Max - Cinema et series', 'HD', '24/7', 3500),
('OCS City', 'Premium', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/OCSCity', 'https://logos-world.net/wp-content/uploads/2020/06/OCS-Logo.png', 'OCS City - Series americaines', 'HD', '24/7', 2800),
('Cine+ Premier', 'Premium', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/CinePrem', 'https://logos-world.net/wp-content/uploads/2020/06/Cine-Plus-Logo.png', 'Cine+ Premier - Cinema premium', 'HD', '24/7', 2200),

-- Chaînes info
('BFM TV', 'Info', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/BFMTV', 'https://logos-world.net/wp-content/uploads/2020/06/BFM-TV-Logo.png', 'BFM TV - Info en continu', 'HD', '24/7', 4200),
('CNews', 'Info', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/CNews', 'https://logos-world.net/wp-content/uploads/2020/06/CNews-Logo.png', 'CNews - Information en continu', 'HD', '24/7', 3800),
('LCI', 'Info', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/LCI', 'https://logos-world.net/wp-content/uploads/2020/06/LCI-Logo.png', 'LCI - La Chaine Info', 'HD', '24/7', 2900),

-- Chaînes gaming
('Game One', 'Gaming', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/GameOne', 'https://logos-world.net/wp-content/uploads/2020/06/Game-One-Logo.png', 'Game One - Chaine gaming', 'HD', '24/7', 1200),
('ES1', 'Gaming', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/ES1', 'https://logos-world.net/wp-content/uploads/2020/06/ES1-Logo.png', 'ES1 - Esport et gaming', 'HD', '24/7', 800),

-- Chaînes musique
('NRJ 12', 'Musique', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/NRJ12', 'https://logos-world.net/wp-content/uploads/2020/06/NRJ-12-Logo.png', 'NRJ 12 - Musique et divertissement', 'HD', '24/7', 1500),
('MTV', 'Musique', 'France', 'Francais', 'https://embed.wavewatch.xyz/embed/MTV', 'https://logos-world.net/wp-content/uploads/2020/06/MTV-Logo.png', 'MTV - Music Television', 'HD', '24/7', 1100);

-- Ajouter les stations radio manquantes
INSERT INTO radio_stations (name, genre, country, frequency, stream_url, logo_url, description, website, listeners) VALUES
('RFM', 'Pop', 'France', '103.9 FM', 'https://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3', 'https://upload.wikimedia.org/wikipedia/commons/a/a8/RFM_logo_2016.png', 'RFM - Party Fun', 'https://rfm.fr', 750000),
('Nostalgie', 'Variete', 'France', '90.4 FM', 'https://scdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3', 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Nostalgie_logo_2019.png', 'Nostalgie - Les plus belles chansons', 'https://nostalgie.fr', 680000),
('Cherie FM', 'Variete', 'France', '91.3 FM', 'https://scdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3', 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Cherie_FM_logo_2015.png', 'Cherie FM - Only Love Songs', 'https://cheriefm.fr', 620000),
('Virgin Radio', 'Rock', 'France', '103.5 FM', 'https://virgin.lmn.fm/virgin.mp3', 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Virgin_Radio_logo_2015.png', 'Virgin Radio - Rock Alternative', 'https://virginradio.fr', 580000),
('Rire et Chansons', 'Variete', 'France', '97.4 FM', 'https://scdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3', 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Rire_et_Chansons_logo_2019.png', 'Rire et Chansons - 100% bonne humeur', 'https://rireetchansons.fr', 520000),
('RMC', 'Talk/News', 'France', '103.1 FM', 'https://rmc.bfmtv.com/rmcinfo-mp3', 'https://upload.wikimedia.org/wikipedia/commons/0/0a/RMC_logo_2017.svg', 'RMC - Info Talk Sport', 'https://rmc.bfmtv.com', 480000),
('Sud Radio', 'Talk/News', 'France', '101.4 FM', 'https://start-sud.ice.infomaniak.ch/start-sud-high.mp3', 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Sud_Radio_logo_2019.png', 'Sud Radio - Radio libre', 'https://sudradio.fr', 420000),
('Jazz Radio', 'Jazz', 'France', '98.8 FM', 'https://jazz.ice.infomaniak.ch/jazz-high.mp3', 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Jazz_Radio_logo_2019.png', 'Jazz Radio - All That Jazz', 'https://jazzradio.fr', 380000),
('FIP', 'Variete', 'France', '105.1 FM', 'https://direct.fipradio.fr/live/fip-midfi.mp3', 'https://upload.wikimedia.org/wikipedia/commons/f/f4/FIP_logo_2005.svg', 'FIP - Tout est possible', 'https://fipradio.fr', 350000),
('France Musique', 'Classique', 'France', '91.7 FM', 'https://direct.francemusique.fr/live/francemusique-midfi.mp3', 'https://upload.wikimedia.org/wikipedia/commons/c/c1/France_Musique_logo_2021.svg', 'France Musique - Classique et jazz', 'https://francemusique.fr', 320000);

-- Ajouter les sources retrogaming manquantes
INSERT INTO retrogaming_sources (name, description, url, color, category) VALUES
('ClassicReload', 'Jeux DOS et Windows classiques', 'https://classicreload.com/', 'bg-yellow-600', 'Browser'),
('Internet Archive', 'Collection massive de jeux retro', 'https://archive.org/details/softwarelibrary', 'bg-teal-600', 'Collection'),
('My Abandonware', 'Jeux abandonnes gratuits', 'https://www.myabandonware.com/', 'bg-pink-600', 'Collection'),
('Retro Games Online', 'Emulateurs en ligne', 'https://www.retrogames.onl/', 'bg-indigo-600', 'Emulateur'),
('PlayEmulator', 'Emulateur multi-consoles', 'https://playemulator.online/', 'bg-red-600', 'Emulateur'),
('Retro Games CC', 'Jeux retro gratuits', 'https://www.retrogames.cc/', 'bg-green-600', 'Browser'),
('8Bit.io', 'Jeux 8-bit en ligne', 'https://8bit.io/', 'bg-blue-600', 'Arcade'),
('Poki Retro', 'Jeux retro sur Poki', 'https://poki.com/fr/retro', 'bg-purple-600', 'Browser'),
('Retro Bowl', 'Football americain retro', 'https://retrobowl.me/', 'bg-orange-600', 'Browser'),
('Pac-Man Online', 'Pac-Man classique', 'https://pacman.live/', 'bg-yellow-600', 'Arcade');

-- Mettre à jour les compteurs
UPDATE tv_channels SET viewers = FLOOR(RANDOM() * 10000 + 1000) WHERE viewers = 0;
UPDATE radio_stations SET listeners = FLOOR(RANDOM() * 500000 + 100000) WHERE listeners = 0;

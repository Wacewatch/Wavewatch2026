-- Script pour corriger les politiques RLS pour l'administration
-- Permet aux administrateurs d'accéder à toutes les données

-- Supprimer les anciennes politiques restrictives et créer des nouvelles pour les admins

-- ===== USER_PROFILES =====
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Créer de nouvelles politiques pour les admins
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_admin = true
        )
        OR id = auth.uid()
    );

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_admin = true
        )
        OR id = auth.uid()
    );

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===== TV_CHANNELS =====
-- Activer RLS si pas déjà fait
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON tv_channels;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tv_channels;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tv_channels;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tv_channels;

-- Créer des politiques pour les chaînes TV
CREATE POLICY "Everyone can view active tv channels" ON tv_channels
    FOR SELECT USING (is_active = true OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

CREATE POLICY "Admins can insert tv channels" ON tv_channels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can update tv channels" ON tv_channels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete tv channels" ON tv_channels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- ===== RADIO_STATIONS =====
-- Activer RLS si pas déjà fait
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON radio_stations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON radio_stations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON radio_stations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON radio_stations;

-- Créer des politiques pour les stations radio
CREATE POLICY "Everyone can view active radio stations" ON radio_stations
    FOR SELECT USING (is_active = true OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

CREATE POLICY "Admins can insert radio stations" ON radio_stations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can update radio stations" ON radio_stations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete radio stations" ON radio_stations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- ===== RETROGAMING_SOURCES =====
-- Activer RLS si pas déjà fait
ALTER TABLE retrogaming_sources ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON retrogaming_sources;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON retrogaming_sources;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON retrogaming_sources;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON retrogaming_sources;

-- Créer des politiques pour les sources retrogaming
CREATE POLICY "Everyone can view active retrogaming sources" ON retrogaming_sources
    FOR SELECT USING (is_active = true OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

CREATE POLICY "Admins can insert retrogaming sources" ON retrogaming_sources
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can update retrogaming sources" ON retrogaming_sources
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete retrogaming sources" ON retrogaming_sources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- ===== TABLES D'ACTIVITÉ =====
-- Politiques pour les tables d'activité des utilisateurs

-- WATCHED_ITEMS
ALTER TABLE watched_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own watched items" ON watched_items;
DROP POLICY IF EXISTS "Users can insert own watched items" ON watched_items;
DROP POLICY IF EXISTS "Users can update own watched items" ON watched_items;
DROP POLICY IF EXISTS "Users can delete own watched items" ON watched_items;

CREATE POLICY "Users can manage own watched items" ON watched_items
    FOR ALL USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

-- WISHLIST_ITEMS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist_items;

CREATE POLICY "Users can manage own wishlist items" ON wishlist_items
    FOR ALL USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

-- FAVORITE_ITEMS
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorite items" ON favorite_items;
DROP POLICY IF EXISTS "Users can insert own favorite items" ON favorite_items;
DROP POLICY IF EXISTS "Users can update own favorite items" ON favorite_items;
DROP POLICY IF EXISTS "Users can delete own favorite items" ON favorite_items;

CREATE POLICY "Users can manage own favorite items" ON favorite_items
    FOR ALL USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

-- RATING_ITEMS
ALTER TABLE rating_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own rating items" ON rating_items;
DROP POLICY IF EXISTS "Users can insert own rating items" ON rating_items;
DROP POLICY IF EXISTS "Users can update own rating items" ON rating_items;
DROP POLICY IF EXISTS "Users can delete own rating items" ON rating_items;

CREATE POLICY "Users can manage own rating items" ON rating_items
    FOR ALL USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
    ));

-- Créer une fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
        AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une vue pour les admins pour voir tous les utilisateurs
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    id,
    username,
    email,
    is_admin,
    is_vip,
    is_vip_plus,
    is_beta,
    status,
    created_at,
    updated_at,
    vip_expires_at,
    show_adult_content
FROM user_profiles
WHERE is_admin(auth.uid()) = true;

-- Accorder les permissions sur la vue
GRANT SELECT ON admin_users_view TO authenticated;

-- Fonction pour obtenir les statistiques d'administration
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    tv_count INTEGER;
    radio_count INTEGER;
    retro_count INTEGER;
    user_count INTEGER;
    watched_count INTEGER;
    wishlist_count INTEGER;
    favorite_count INTEGER;
    rating_count INTEGER;
BEGIN
    -- Vérifier si l'utilisateur est admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Compter les éléments
    SELECT COUNT(*) INTO tv_count FROM tv_channels;
    SELECT COUNT(*) INTO radio_count FROM radio_stations;
    SELECT COUNT(*) INTO retro_count FROM retrogaming_sources;
    SELECT COUNT(*) INTO user_count FROM user_profiles;
    SELECT COUNT(*) INTO watched_count FROM watched_items;
    SELECT COUNT(*) INTO wishlist_count FROM wishlist_items;
    SELECT COUNT(*) INTO favorite_count FROM favorite_items;
    SELECT COUNT(*) INTO rating_count FROM rating_items;

    -- Construire le résultat JSON
    result := json_build_object(
        'tv_channels', tv_count,
        'radio_stations', radio_count,
        'retrogaming_sources', retro_count,
        'users', user_count,
        'watched_items', watched_count,
        'wishlist_items', wishlist_count,
        'favorite_items', favorite_count,
        'rating_items', rating_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions sur la fonction
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- Afficher un résumé des politiques créées
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS mises à jour pour l''administration';
    RAISE NOTICE '📊 Tables configurées: user_profiles, tv_channels, radio_stations, retrogaming_sources';
    RAISE NOTICE '🔐 Les administrateurs ont maintenant accès à toutes les données';
    RAISE NOTICE '👥 Les utilisateurs normaux peuvent toujours accéder à leurs propres données';
    RAISE NOTICE '🎯 Vue admin_users_view créée pour l''accès admin aux utilisateurs';
    RAISE NOTICE '📈 Fonction get_admin_stats() créée pour les statistiques';
END $$;

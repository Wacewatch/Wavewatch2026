-- Script pour corriger le système d'activation admin
-- Créé le 2025-01-28

-- 1. Vérifier et corriger les politiques RLS pour les admins
DO $$
BEGIN
    -- Politique pour permettre aux admins de voir tous les profils
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    CREATE POLICY "Admins can view all profiles" ON user_profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles admin_profile 
                WHERE admin_profile.id = auth.uid() 
                AND admin_profile.is_admin = true
            )
        );

    -- Politique pour permettre aux admins de voir toutes les activités
    DROP POLICY IF EXISTS "Admins can view all login history" ON user_login_history;
    CREATE POLICY "Admins can view all login history" ON user_login_history
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles admin_profile 
                WHERE admin_profile.id = auth.uid() 
                AND admin_profile.is_admin = true
            )
        );

    -- Politique pour permettre aux admins de voir tout l'historique de visionnage
    DROP POLICY IF EXISTS "Admins can view all viewing history" ON user_viewing_history;
    CREATE POLICY "Admins can view all viewing history" ON user_viewing_history
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles admin_profile 
                WHERE admin_profile.id = auth.uid() 
                AND admin_profile.is_admin = true
            )
        );

    -- Politique pour permettre aux admins de voir toutes les évaluations
    DROP POLICY IF EXISTS "Admins can view all ratings" ON user_ratings;
    CREATE POLICY "Admins can view all ratings" ON user_ratings
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles admin_profile 
                WHERE admin_profile.id = auth.uid() 
                AND admin_profile.is_admin = true
            )
        );

    -- Politique pour permettre aux admins de voir toutes les wishlists
    DROP POLICY IF EXISTS "Admins can view all wishlists" ON user_wishlist;
    CREATE POLICY "Admins can view all wishlists" ON user_wishlist
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles admin_profile 
                WHERE admin_profile.id = auth.uid() 
                AND admin_profile.is_admin = true
            )
        );

    RAISE NOTICE 'Politiques RLS pour les admins mises à jour avec succès';
END $$;

-- 2. Corriger la fonction d'activation admin pour utiliser user_id au lieu de id
CREATE OR REPLACE FUNCTION activate_admin_privileges(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user RECORD;
    new_username TEXT;
    result JSON;
BEGIN
    -- Récupérer les infos de l'utilisateur auth
    SELECT * INTO auth_user FROM auth.users WHERE id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé dans auth.users');
    END IF;
    
    -- Générer un nom d'utilisateur unique
    new_username := generate_unique_username(
        COALESCE(auth_user.raw_user_meta_data->>'username', SPLIT_PART(auth_user.email, '@', 1), 'admin'),
        user_id_param
    );
    
    -- Vérifier si le profil existe (utiliser user_id au lieu de id)
    SELECT * INTO user_record FROM user_profiles WHERE user_id = user_id_param;
    
    IF FOUND THEN
        -- Mettre à jour le profil existant
        UPDATE user_profiles SET
            is_admin = true,
            is_vip = true,  -- Admin inclut VIP
            status = 'active',
            updated_at = NOW()
        WHERE user_id = user_id_param;
        
        RAISE NOTICE 'Privilèges admin activés pour utilisateur existant: %', new_username;
    ELSE
        -- Créer un nouveau profil
        INSERT INTO user_profiles (
            id, user_id, username, email, is_admin, is_vip, is_vip_plus, is_beta, 
            status, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            user_id_param, 
            new_username,
            auth_user.email,
            true,  -- is_admin
            true,  -- is_vip (admin inclut VIP)
            false, -- is_vip_plus
            false, -- is_beta
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Nouveau profil admin créé pour: %', new_username;
    END IF;
    
    result := json_build_object(
        'success', true, 
        'username', new_username,
        'is_admin', true,
        'is_vip', true,
        'message', 'Privilèges admin activés avec succès'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''activation admin: %', SQLERRM;
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 3. Corriger la structure de la table user_wishlist si nécessaire
DO $$
BEGIN
    -- Vérifier si les colonnes tmdb_id et media_type existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wishlist' AND column_name = 'tmdb_id') THEN
        ALTER TABLE user_wishlist ADD COLUMN tmdb_id INTEGER;
        RAISE NOTICE 'Colonne tmdb_id ajoutée à user_wishlist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wishlist' AND column_name = 'media_type') THEN
        ALTER TABLE user_wishlist ADD COLUMN media_type TEXT;
        RAISE NOTICE 'Colonne media_type ajoutée à user_wishlist';
    END IF;
END $$;

-- 4. Diagnostic final
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC SYSTÈME D''ACTIVATION ===';;
    RAISE NOTICE 'Nombre total d''utilisateurs: %', (SELECT COUNT(*) FROM user_profiles);
    RAISE NOTICE 'Utilisateurs admin: %', (SELECT COUNT(*) FROM user_profiles WHERE is_admin = true);
    RAISE NOTICE 'Utilisateurs VIP: %', (SELECT COUNT(*) FROM user_profiles WHERE is_vip = true);
    RAISE NOTICE 'Fonction activate_admin_privileges: DISPONIBLE';
    RAISE NOTICE 'Politiques RLS admin: CONFIGURÉES';
    RAISE NOTICE 'Structure user_wishlist: VÉRIFIÉE';
END $$;

RAISE NOTICE 'Script d''activation admin terminé avec succès !';

-- Script pour corriger la récursion infinie dans les politiques RLS
-- Créé le 2025-01-28

-- 1. Supprimer toutes les politiques problématiques qui causent la récursion
DO $$
BEGIN
    -- Supprimer les politiques qui causent la récursion infinie
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can view all login history" ON user_login_history;
    DROP POLICY IF EXISTS "Admins can view all viewing history" ON user_viewing_history;
    DROP POLICY IF EXISTS "Admins can view all ratings" ON user_ratings;
    DROP POLICY IF EXISTS "Admins can view all wishlists" ON user_wishlist;
    
    RAISE NOTICE 'Politiques RLS problématiques supprimées';
END $$;

-- 2. Créer des politiques RLS simples sans récursion
DO $$
BEGIN
    -- Politique pour user_profiles : utilisateurs peuvent voir leur propre profil
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    CREATE POLICY "Users can view own profile" ON user_profiles
        FOR SELECT USING (id = auth.uid());
    
    -- Politique pour user_profiles : utilisateurs peuvent modifier leur propre profil
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    CREATE POLICY "Users can update own profile" ON user_profiles
        FOR UPDATE USING (id = auth.uid());
    
    -- Politique pour user_profiles : permettre l'insertion lors de l'inscription
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    CREATE POLICY "Users can insert own profile" ON user_profiles
        FOR INSERT WITH CHECK (id = auth.uid());
    
    -- Politique pour user_login_history : utilisateurs peuvent voir leur propre historique
    DROP POLICY IF EXISTS "Users can view own login history" ON user_login_history;
    CREATE POLICY "Users can view own login history" ON user_login_history
        FOR SELECT USING (user_id = auth.uid());
    
    -- Politique pour user_watch_history : utilisateurs peuvent voir leur propre historique
    DROP POLICY IF EXISTS "Users can view own watch history" ON user_watch_history;
    CREATE POLICY "Users can view own watch history" ON user_watch_history
        FOR SELECT USING (user_id = auth.uid());
    
    -- Politique pour user_ratings : utilisateurs peuvent voir leurs propres évaluations
    DROP POLICY IF EXISTS "Users can view own ratings" ON user_ratings;
    CREATE POLICY "Users can view own ratings" ON user_ratings
        FOR SELECT USING (user_id = auth.uid());
    
    -- Politique pour user_wishlist : utilisateurs peuvent voir leur propre wishlist
    DROP POLICY IF EXISTS "Users can view own wishlist" ON user_wishlist;
    CREATE POLICY "Users can view own wishlist" ON user_wishlist
        FOR SELECT USING (user_id = auth.uid());
    
    -- Politique pour user_preferences : utilisateurs peuvent voir leurs propres préférences
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
    CREATE POLICY "Users can view own preferences" ON user_preferences
        FOR SELECT USING (user_id = auth.uid());
    
    RAISE NOTICE 'Nouvelles politiques RLS créées sans récursion';
END $$;

-- 3. Créer une fonction pour vérifier les privilèges admin sans récursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    admin_status BOOLEAN := false;
BEGIN
    -- Vérification directe sans politique RLS
    SELECT is_admin INTO admin_status 
    FROM user_profiles 
    WHERE id = user_id_param;
    
    RETURN COALESCE(admin_status, false);
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Corriger la fonction activate_admin_privileges pour utiliser la bonne structure
CREATE OR REPLACE FUNCTION activate_admin_privileges(activation_code TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user RECORD;
    new_username TEXT;
    result JSON;
    current_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur connecté
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non connecté');
    END IF;
    
    -- Vérifier le code d'activation (code simple pour la démo)
    IF activation_code != 'ADMIN2024' THEN
        RETURN json_build_object('success', false, 'error', 'Code d''activation invalide');
    END IF;
    
    -- Récupérer les infos de l'utilisateur auth
    SELECT * INTO auth_user FROM auth.users WHERE id = current_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé');
    END IF;
    
    -- Générer un nom d'utilisateur unique
    new_username := COALESCE(
        auth_user.raw_user_meta_data->>'username', 
        SPLIT_PART(auth_user.email, '@', 1), 
        'admin'
    ) || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    -- Vérifier si le profil existe
    SELECT * INTO user_record FROM user_profiles WHERE id = current_user_id;
    
    IF FOUND THEN
        -- Mettre à jour le profil existant
        UPDATE user_profiles SET
            is_admin = true,
            is_vip = true,
            status = 'active',
            updated_at = NOW()
        WHERE id = current_user_id;
        
        RAISE NOTICE 'Privilèges admin activés pour utilisateur existant: %', new_username;
    ELSE
        -- Créer un nouveau profil
        INSERT INTO user_profiles (
            id, username, email, is_admin, is_vip, is_vip_plus, is_beta, 
            status, created_at, updated_at
        ) VALUES (
            current_user_id,
            new_username,
            auth_user.email,
            true,
            true,
            false,
            false,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Diagnostic final
DO $$
BEGIN
    RAISE NOTICE '=== CORRECTION RÉCURSION RLS TERMINÉE ===';
    RAISE NOTICE 'Politiques RLS simplifiées créées';
    RAISE NOTICE 'Fonction is_admin_user créée';
    RAISE NOTICE 'Fonction activate_admin_privileges corrigée';
    RAISE NOTICE 'Le système devrait maintenant fonctionner sans récursion';
END $$;

RAISE NOTICE 'Script de correction de récursion RLS terminé avec succès !';

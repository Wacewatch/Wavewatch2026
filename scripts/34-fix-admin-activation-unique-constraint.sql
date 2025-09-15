-- Script pour corriger les contraintes d'unicité et l'activation admin
-- Créé le 2025-01-28

-- 1. Diagnostic initial
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC INITIAL ===';
    RAISE NOTICE 'Nombre total d''utilisateurs dans auth.users: %', (SELECT COUNT(*) FROM auth.users);
    RAISE NOTICE 'Nombre total de profils dans user_profiles: %', (SELECT COUNT(*) FROM user_profiles);
    RAISE NOTICE 'Utilisateurs avec privilèges admin: %', (SELECT COUNT(*) FROM user_profiles WHERE is_admin = true);
    RAISE NOTICE 'Utilisateurs avec privilèges VIP: %', (SELECT COUNT(*) FROM user_profiles WHERE is_vip = true);
END $$;

-- 2. Fonction pour générer un nom d'utilisateur unique
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
    final_username TEXT;
    counter INTEGER := 1;
    max_attempts INTEGER := 100;
BEGIN
    -- Nettoyer le nom de base
    base_username := COALESCE(TRIM(base_username), '');
    
    -- Si le nom de base est vide, utiliser l'ID utilisateur
    IF base_username = '' OR base_username IS NULL THEN
        base_username := 'user_' || SUBSTRING(user_id::TEXT, 1, 8);
    END IF;
    
    -- Essayer le nom de base d'abord
    final_username := base_username;
    
    -- Si le nom existe déjà, ajouter un numéro
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = final_username AND id != user_id) AND counter <= max_attempts LOOP
        final_username := base_username || counter::TEXT;
        counter := counter + 1;
    END LOOP;
    
    -- Si on a atteint le maximum d'essais, utiliser l'UUID
    IF counter > max_attempts THEN
        final_username := 'user_' || SUBSTRING(user_id::TEXT, 1, 8);
    END IF;
    
    RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- 3. Nettoyer les doublons existants (garder le plus récent)
DO $$
DECLARE
    duplicate_record RECORD;
BEGIN
    RAISE NOTICE '=== NETTOYAGE DES DOUBLONS ===';
    
    FOR duplicate_record IN 
        SELECT username, COUNT(*) as count_duplicates
        FROM user_profiles 
        WHERE username IS NOT NULL
        GROUP BY username 
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Nettoyage des doublons pour username: % (% doublons)', duplicate_record.username, duplicate_record.count_duplicates;
        
        -- Supprimer tous sauf le plus récent
        DELETE FROM user_profiles 
        WHERE username = duplicate_record.username 
        AND id NOT IN (
            SELECT id FROM user_profiles 
            WHERE username = duplicate_record.username 
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST 
            LIMIT 1
        );
    END LOOP;
END $$;

-- 4. Fonction pour activer les privilèges admin
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
    
    -- Vérifier si le profil existe
    SELECT * INTO user_record FROM user_profiles WHERE id = user_id_param;
    
    IF FOUND THEN
        -- Mettre à jour le profil existant
        UPDATE user_profiles SET
            is_admin = true,
            is_vip = true,  -- Admin inclut VIP
            status = 'active',
            updated_at = NOW()
        WHERE id = user_id_param;
        
        RAISE NOTICE 'Privilèges admin activés pour utilisateur existant: %', new_username;
    ELSE
        -- Créer un nouveau profil
        INSERT INTO user_profiles (
            id, username, email, is_admin, is_vip, is_vip_plus, is_beta, 
            status, created_at, updated_at
        ) VALUES (
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

-- 5. Fonction pour activer les privilèges VIP
CREATE OR REPLACE FUNCTION activate_vip_privileges(user_id_param UUID, vip_type TEXT DEFAULT 'vip')
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
        COALESCE(auth_user.raw_user_meta_data->>'username', SPLIT_PART(auth_user.email, '@', 1), 'user'),
        user_id_param
    );
    
    -- Vérifier si le profil existe
    SELECT * INTO user_record FROM user_profiles WHERE id = user_id_param;
    
    IF FOUND THEN
        -- Mettre à jour selon le type VIP
        CASE vip_type
            WHEN 'vip_plus' THEN
                UPDATE user_profiles SET
                    is_vip = true,
                    is_vip_plus = true,
                    status = 'active',
                    updated_at = NOW()
                WHERE id = user_id_param;
            WHEN 'beta' THEN
                UPDATE user_profiles SET
                    is_beta = true,
                    status = 'active',
                    updated_at = NOW()
                WHERE id = user_id_param;
            ELSE -- vip
                UPDATE user_profiles SET
                    is_vip = true,
                    status = 'active',
                    updated_at = NOW()
                WHERE id = user_id_param;
        END CASE;
        
        RAISE NOTICE 'Privilèges % activés pour utilisateur existant: %', vip_type, new_username;
    ELSE
        -- Créer un nouveau profil selon le type
        INSERT INTO user_profiles (
            id, username, email, is_admin, is_vip, is_vip_plus, is_beta, 
            status, created_at, updated_at
        ) VALUES (
            user_id_param, 
            new_username,
            auth_user.email,
            false, -- is_admin
            CASE WHEN vip_type IN ('vip', 'vip_plus') THEN true ELSE false END,
            CASE WHEN vip_type = 'vip_plus' THEN true ELSE false END,
            CASE WHEN vip_type = 'beta' THEN true ELSE false END,
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Nouveau profil % créé pour: %', vip_type, new_username;
    END IF;
    
    result := json_build_object(
        'success', true, 
        'username', new_username,
        'vip_type', vip_type,
        'message', 'Privilèges ' || vip_type || ' activés avec succès'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''activation %: %', vip_type, SQLERRM;
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 6. Créer les profils manquants pour tous les utilisateurs auth
DO $$
DECLARE
    auth_user RECORD;
    new_username TEXT;
    profiles_created INTEGER := 0;
BEGIN
    RAISE NOTICE '=== CRÉATION DES PROFILS MANQUANTS ===';
    
    FOR auth_user IN 
        SELECT au.* 
        FROM auth.users au 
        LEFT JOIN user_profiles up ON au.id = up.id 
        WHERE up.id IS NULL
    LOOP
        -- Générer un nom d'utilisateur unique
        new_username := generate_unique_username(
            COALESCE(auth_user.raw_user_meta_data->>'username', SPLIT_PART(auth_user.email, '@', 1), 'user'),
            auth_user.id
        );
        
        -- Créer le profil
        INSERT INTO user_profiles (
            id, username, email, is_admin, is_vip, is_vip_plus, is_beta, 
            status, created_at, updated_at
        ) VALUES (
            auth_user.id, 
            new_username,
            auth_user.email,
            false, -- is_admin
            false, -- is_vip
            false, -- is_vip_plus
            false, -- is_beta
            'active',
            COALESCE(auth_user.created_at, NOW()),
            NOW()
        );
        
        profiles_created := profiles_created + 1;
        RAISE NOTICE 'Profil créé pour: % (email: %)', new_username, auth_user.email;
    END LOOP;
    
    RAISE NOTICE 'Total de profils créés: %', profiles_created;
END $$;

-- 7. Ajouter la colonne pour le contrôle parental si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'show_adult_content') THEN
        ALTER TABLE user_profiles ADD COLUMN show_adult_content BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne show_adult_content ajoutée à user_profiles';
    ELSE
        RAISE NOTICE 'Colonne show_adult_content existe déjà';
    END IF;
END $$;

-- 8. Diagnostic final
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC FINAL ===';
    RAISE NOTICE 'Nombre total d''utilisateurs dans auth.users: %', (SELECT COUNT(*) FROM auth.users);
    RAISE NOTICE 'Nombre total de profils dans user_profiles: %', (SELECT COUNT(*) FROM user_profiles);
    RAISE NOTICE 'Utilisateurs avec privilèges admin: %', (SELECT COUNT(*) FROM user_profiles WHERE is_admin = true);
    RAISE NOTICE 'Utilisateurs avec privilèges VIP: %', (SELECT COUNT(*) FROM user_profiles WHERE is_vip = true);
    RAISE NOTICE 'Utilisateurs avec privilèges VIP+: %', (SELECT COUNT(*) FROM user_profiles WHERE is_vip_plus = true);
    RAISE NOTICE 'Utilisateurs avec privilèges Beta: %', (SELECT COUNT(*) FROM user_profiles WHERE is_beta = true);
    RAISE NOTICE 'Utilisateurs avec contrôle parental activé: %', (SELECT COUNT(*) FROM user_profiles WHERE show_adult_content = true);
END $$;

-- 9. Afficher quelques exemples d'utilisateurs
DO $$
DECLARE
    user_example RECORD;
BEGIN
    RAISE NOTICE '=== EXEMPLES D''UTILISATEURS ===';
    
    FOR user_example IN 
        SELECT username, email, is_admin, is_vip, is_vip_plus, is_beta, show_adult_content, created_at
        FROM user_profiles 
        ORDER BY created_at DESC 
        LIMIT 5
    LOOP
        RAISE NOTICE 'User: % | Email: % | Admin: % | VIP: % | VIP+: % | Beta: % | Adult: %', 
            user_example.username, 
            user_example.email, 
            user_example.is_admin, 
            user_example.is_vip, 
            user_example.is_vip_plus, 
            user_example.is_beta,
            user_example.show_adult_content;
    END LOOP;
END $$;

-- 10. Fonctions utilitaires pour les tests
CREATE OR REPLACE FUNCTION get_user_privileges(user_email TEXT)
RETURNS TABLE(
    username TEXT,
    email TEXT,
    is_admin BOOLEAN,
    is_vip BOOLEAN,
    is_vip_plus BOOLEAN,
    is_beta BOOLEAN,
    show_adult_content BOOLEAN,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT up.username, up.email, up.is_admin, up.is_vip, up.is_vip_plus, up.is_beta, up.show_adult_content, up.status
    FROM user_profiles up
    WHERE up.email = user_email;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '=== SCRIPT TERMINÉ AVEC SUCCÈS ===';
RAISE NOTICE 'Vous pouvez maintenant tester l''activation admin avec le code 45684568';
RAISE NOTICE 'Utilisez SELECT * FROM get_user_privileges(''votre-email@example.com'') pour vérifier vos privilèges';

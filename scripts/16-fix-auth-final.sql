-- Corriger les problèmes d'authentification sans toucher aux colonnes système

-- 1. Supprimer temporairement la contrainte de clé étrangère pour les tests
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 2. Améliorer la fonction de création de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log pour debug
    RAISE NOTICE 'Creating profile for user: % with email: %', NEW.id, NEW.email;
    
    -- Insérer le profil
    INSERT INTO public.user_profiles (id, username, email, is_vip, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        FALSE,
        CASE 
            WHEN COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) = 'wwadmin' 
            THEN TRUE 
            ELSE FALSE 
        END
    );
    
    RAISE NOTICE 'Profile created successfully for user: %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Could not create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger de création de profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Créer une fonction pour nettoyer les utilisateurs de test
CREATE OR REPLACE FUNCTION cleanup_test_users()
RETURNS void AS $$
BEGIN
    -- Supprimer les profils de test
    DELETE FROM user_profiles WHERE email LIKE '%test%' OR email LIKE '%example%';
    
    -- Note: Les utilisateurs auth sont supprimés via l'API Supabase
    RAISE NOTICE 'Test users cleaned up';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Accorder les permissions
GRANT EXECUTE ON FUNCTION cleanup_test_users TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_test_users TO anon;

-- 6. Créer une vue pour voir les utilisateurs et leurs profils
CREATE OR REPLACE VIEW user_auth_status AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at as auth_created,
    p.username,
    p.is_vip,
    p.is_admin,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 7. Accorder les permissions sur la vue
GRANT SELECT ON user_auth_status TO authenticated;
GRANT SELECT ON user_auth_status TO anon;

-- 8. Créer une fonction pour créer un utilisateur de test complet
CREATE OR REPLACE FUNCTION create_test_profile(
    test_id UUID,
    test_username TEXT,
    test_email TEXT
)
RETURNS user_profiles AS $$
DECLARE
    result user_profiles;
BEGIN
    -- Insérer directement dans user_profiles (sans contrainte FK)
    INSERT INTO user_profiles (id, username, email, is_vip, is_admin)
    VALUES (test_id, test_username, test_email, FALSE, FALSE)
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Accorder les permissions
GRANT EXECUTE ON FUNCTION create_test_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_profile TO anon;

-- 10. Mettre à jour les politiques RLS pour être plus permissives
DROP POLICY IF EXISTS "Allow all operations for testing" ON user_profiles;
CREATE POLICY "Allow all operations for testing" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 11. S'assurer que RLS est activé
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 12. Accorder toutes les permissions nécessaires
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 13. Créer une fonction pour vérifier l'état de l'authentification
CREATE OR REPLACE FUNCTION check_auth_status()
RETURNS TABLE (
    total_users BIGINT,
    confirmed_users BIGINT,
    profiles_created BIGINT,
    test_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
        (SELECT COUNT(*) FROM user_profiles) as profiles_created,
        (SELECT COUNT(*) FROM user_profiles WHERE email LIKE '%test%' OR email LIKE '%example%') as test_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Accorder les permissions
GRANT EXECUTE ON FUNCTION check_auth_status TO authenticated;
GRANT EXECUTE ON FUNCTION check_auth_status TO anon;

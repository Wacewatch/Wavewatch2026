-- Script simplifié pour corriger l'authentification

-- 1. Supprimer toutes les fonctions existantes pour éviter les conflits
DROP FUNCTION IF EXISTS create_test_profile(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS cleanup_test_users();
DROP FUNCTION IF EXISTS check_auth_status();
DROP FUNCTION IF EXISTS auto_confirm_user();

-- 2. Supprimer les triggers existants
DROP TRIGGER IF EXISTS auto_confirm_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Supprimer temporairement la contrainte de clé étrangère
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 4. Créer la fonction de création de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Créer une fonction simple pour les tests
CREATE OR REPLACE FUNCTION create_simple_test_profile(
    p_id UUID,
    p_username TEXT,
    p_email TEXT
)
RETURNS user_profiles AS $$
DECLARE
    result user_profiles;
BEGIN
    INSERT INTO user_profiles (id, username, email, is_vip, is_admin)
    VALUES (p_id, p_username, p_email, FALSE, FALSE)
    RETURNING * INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer une fonction de nettoyage simple
CREATE OR REPLACE FUNCTION clean_test_data()
RETURNS void AS $$
BEGIN
    DELETE FROM user_profiles WHERE email LIKE '%test%' OR email LIKE '%example%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer une fonction de statut simple
CREATE OR REPLACE FUNCTION get_auth_stats()
RETURNS TABLE (
    users_count BIGINT,
    profiles_count BIGINT,
    confirmed_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users),
        (SELECT COUNT(*) FROM user_profiles),
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Accorder les permissions
GRANT EXECUTE ON FUNCTION create_simple_test_profile TO authenticated, anon;
GRANT EXECUTE ON FUNCTION clean_test_data TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_auth_stats TO authenticated, anon;

-- 10. Mettre à jour les politiques RLS
DROP POLICY IF EXISTS "Allow all operations for testing" ON user_profiles;
CREATE POLICY "Allow all operations for testing" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 11. S'assurer que RLS est activé
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 12. Accorder toutes les permissions
GRANT ALL ON user_profiles TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- 13. Créer une vue simple pour voir les utilisateurs
CREATE OR REPLACE VIEW simple_user_view AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    p.username,
    p.is_vip,
    p.is_admin
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 14. Accorder les permissions sur la vue
GRANT SELECT ON simple_user_view TO authenticated, anon;

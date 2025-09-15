-- Corriger les politiques RLS et les permissions

-- 1. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- 2. Désactiver temporairement RLS pour les tests
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Accorder toutes les permissions nécessaires
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO postgres;
GRANT ALL ON user_profiles TO service_role;

-- 4. Corriger la fonction de création de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log pour debug
    RAISE NOTICE 'Creating profile for user: %', NEW.id;
    
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

-- 5. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Réactiver RLS avec des politiques plus permissives
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Créer des politiques très permissives pour les tests
CREATE POLICY "Allow all operations for testing" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 8. Créer une fonction de test pour créer un profil manuellement
CREATE OR REPLACE FUNCTION create_test_profile(
    user_id UUID,
    user_username TEXT,
    user_email TEXT
)
RETURNS user_profiles AS $$
DECLARE
    result user_profiles;
BEGIN
    INSERT INTO user_profiles (id, username, email, is_vip, is_admin)
    VALUES (user_id, user_username, user_email, FALSE, FALSE)
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Accorder les permissions sur la fonction
GRANT EXECUTE ON FUNCTION create_test_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_profile TO anon;

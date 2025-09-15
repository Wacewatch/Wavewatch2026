-- Nettoyer et recréer complètement le système d'authentification

-- 1. Supprimer les anciennes politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- 2. Supprimer et recréer la table user_profiles
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_vip BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    vip_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer les index
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_is_vip ON user_profiles(is_vip);
CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);

-- 4. Activer RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS simples
CREATE POLICY "Enable read access for all users" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Créer la fonction de mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Créer le trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Créer la fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, email, is_vip, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        FALSE,
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) = 'wwadmin' THEN TRUE ELSE FALSE END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Créer l'utilisateur admin par défaut
DO $$
BEGIN
    -- Insérer l'admin seulement s'il n'existe pas déjà
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE username = 'wwadmin') THEN
        INSERT INTO user_profiles (id, username, email, is_vip, is_admin)
        VALUES (
            gen_random_uuid(),
            'wwadmin',
            'admin@wavewatch.com',
            TRUE,
            TRUE
        );
    END IF;
END $$;

-- 11. Accorder les permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;

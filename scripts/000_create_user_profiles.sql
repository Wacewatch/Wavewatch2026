-- SCRIPT PRINCIPAL - DOIT ÊTRE EXÉCUTÉ EN PREMIER
-- Création de la table user_profiles et trigger automatique

-- Créer la table user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  is_vip BOOLEAN DEFAULT false,
  is_vip_plus BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  is_beta BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  vip_expires_at TIMESTAMP WITH TIME ZONE,
  profile_image TEXT,
  bio TEXT,
  location TEXT,
  birth_date DATE,
  join_date DATE DEFAULT CURRENT_DATE,
  theme_preference TEXT DEFAULT 'dark',
  hide_adult_content BOOLEAN DEFAULT true,
  hide_spoilers BOOLEAN DEFAULT true,
  auto_mark_watched BOOLEAN DEFAULT false,
  allow_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_vip ON user_profiles(is_vip);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Activer RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can do everything on user_profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Fonction trigger pour créer automatiquement le profil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Extraire le username des metadata ou de l'email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Insérer le profil
  INSERT INTO user_profiles (
    id,
    username,
    email,
    is_admin,
    is_vip,
    is_vip_plus,
    is_beta,
    created_at,
    join_date
  ) VALUES (
    NEW.id,
    user_name,
    NEW.email,
    false, -- Admin status must be set manually
    false,
    false,
    false,
    NOW(),
    CURRENT_DATE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Créer la table user_profiles_extended (optionnelle, pour des données supplémentaires)
CREATE TABLE IF NOT EXISTS user_profiles_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_image TEXT,
  bio TEXT,
  location TEXT,
  birth_date DATE,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour user_profiles_extended
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);

-- RLS pour user_profiles_extended
ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own extended profile"
  ON user_profiles_extended FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extended profile"
  ON user_profiles_extended FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extended profile"
  ON user_profiles_extended FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extended profile"
  ON user_profiles_extended FOR DELETE
  USING (auth.uid() = user_id);

-- Script de migration pour synchroniser les utilisateurs existants
-- Créer les profils manquants pour les utilisateurs dans auth.users mais pas dans user_profiles
INSERT INTO user_profiles (id, username, email, is_admin, is_vip, is_vip_plus, is_beta, created_at, join_date)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)) as username,
  au.email,
  false as is_admin,
  false as is_vip,
  false as is_vip_plus,
  false as is_beta,
  au.created_at,
  CURRENT_DATE as join_date
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Afficher un rapport de synchronisation
DO $$
DECLARE
  auth_count INTEGER;
  profile_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  missing_count := auth_count - profile_count;
  
  RAISE NOTICE '===== RAPPORT DE SYNCHRONISATION =====';
  RAISE NOTICE 'Utilisateurs dans auth.users: %', auth_count;
  RAISE NOTICE 'Profils dans user_profiles: %', profile_count;
  RAISE NOTICE 'Profils créés: %', GREATEST(0, missing_count);
  RAISE NOTICE '======================================';
END $$;

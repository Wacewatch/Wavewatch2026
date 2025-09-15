-- FORCER LA DÉSACTIVATION COMPLÈTE DE LA CONFIRMATION D'EMAIL
-- Ce script règle définitivement le problème "Email not confirmed"

-- 1. Mettre à jour TOUS les utilisateurs existants pour les marquer comme confirmés
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmed_at = COALESCE(confirmed_at, now()),
  email_change_confirm_status = 0,
  email_change = NULL
WHERE true;

-- 2. Créer une fonction qui force la confirmation immédiate
CREATE OR REPLACE FUNCTION public.force_confirm_user()
RETURNS trigger AS $$
BEGIN
  -- Forcer la confirmation immédiatement lors de l'insertion
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  NEW.email_change_confirm_status := 0;
  NEW.email_change := NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Supprimer l'ancien trigger et créer le nouveau
DROP TRIGGER IF EXISTS force_confirm_user_trigger ON auth.users;
CREATE TRIGGER force_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.force_confirm_user();

-- 4. Fonction pour créer le profil utilisateur avec détection admin
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$
DECLARE
  username_val text;
  is_admin_val boolean := false;
BEGIN
  -- Récupérer le username depuis les métadonnées ou email
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Vérifier si c'est un admin (insensible à la casse)
  is_admin_val := LOWER(TRIM(username_val)) = 'wwadmin';
  
  -- Créer le profil utilisateur
  INSERT INTO public.user_profiles (
    id,
    username,
    email,
    is_vip,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    username_val,
    NEW.email,
    is_admin_val, -- Admin est automatiquement VIP
    is_admin_val,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    is_vip = EXCLUDED.is_vip OR user_profiles.is_vip,
    is_admin = EXCLUDED.is_admin OR user_profiles.is_admin,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Supprimer l'ancien trigger et créer le nouveau
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
CREATE TRIGGER handle_new_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- 6. Mettre à jour les politiques RLS pour être plus permissives
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;

-- Politique pour la lecture (plus permissive)
CREATE POLICY "Allow profile read" ON user_profiles
  FOR SELECT USING (true);

-- Politique pour la mise à jour
CREATE POLICY "Allow profile update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour l'insertion (via trigger)
CREATE POLICY "Allow profile insert" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 7. S'assurer que RLS est activé mais permissif
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Créer une vue pour faciliter l'accès aux profils
CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT 
  id,
  username,
  email,
  is_vip,
  is_admin,
  vip_expires_at,
  created_at,
  updated_at
FROM user_profiles;

-- 9. Fonction utilitaire pour vérifier un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  email text,
  is_vip boolean,
  is_admin boolean,
  vip_expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.username,
    up.email,
    up.is_vip,
    up.is_admin,
    up.vip_expires_at
  FROM user_profiles up
  WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Fonction pour forcer la confirmation d'un utilisateur spécifique
CREATE OR REPLACE FUNCTION public.force_confirm_specific_user(user_email text)
RETURNS boolean AS $$
DECLARE
  user_found boolean := false;
BEGIN
  UPDATE auth.users 
  SET 
    email_confirmed_at = now(),
    confirmed_at = now(),
    email_change_confirm_status = 0,
    email_change = NULL
  WHERE email = user_email;
  
  GET DIAGNOSTICS user_found = FOUND;
  RETURN user_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Vérification finale
DO $$
DECLARE
  confirmed_count integer;
  total_count integer;
BEGIN
  SELECT COUNT(*) INTO total_count FROM auth.users;
  SELECT COUNT(*) INTO confirmed_count FROM auth.users WHERE email_confirmed_at IS NOT NULL;
  
  RAISE NOTICE '=== CONFIGURATION EMAIL CONFIRMATION ===';
  RAISE NOTICE 'Total utilisateurs: %', total_count;
  RAISE NOTICE 'Utilisateurs confirmés: %', confirmed_count;
  RAISE NOTICE 'Triggers créés: force_confirm_user_trigger, handle_new_user_trigger';
  RAISE NOTICE 'Politiques RLS mises à jour';
  RAISE NOTICE 'Fonction de confirmation forcée créée';
  RAISE NOTICE '==========================================';
  
  IF confirmed_count = total_count THEN
    RAISE NOTICE 'SUCCESS: Tous les utilisateurs sont confirmés!';
  ELSE
    RAISE NOTICE 'WARNING: % utilisateurs non confirmés restants', (total_count - confirmed_count);
  END IF;
END $$;

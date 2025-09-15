-- Désactiver la confirmation d'email dans Supabase
-- Cette configuration permet aux utilisateurs de se connecter immédiatement après inscription

-- 1. Mettre à jour la configuration d'authentification
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE true;

-- 2. S'assurer que tous les utilisateurs existants sont confirmés
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- 3. Créer une fonction pour auto-confirmer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirmer l'utilisateur lors de l'inscription
  UPDATE auth.users 
  SET 
    email_confirmed_at = now(),
    confirmed_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger pour auto-confirmer
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- 5. Mettre à jour la fonction de création de profil pour gérer l'admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_val text;
  is_admin_val boolean := false;
BEGIN
  -- Récupérer le username depuis les métadonnées
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Vérifier si c'est un admin (insensible à la casse)
  is_admin_val := LOWER(username_val) = 'wwadmin';
  
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
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recréer le trigger pour la création de profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Politique pour permettre la lecture des profils
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 8. Politique pour permettre la mise à jour des profils
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 9. Politique pour permettre l'insertion (via trigger)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
CREATE POLICY "Enable insert for authenticated users only" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 10. Vérification de la configuration
DO $$
BEGIN
  RAISE NOTICE 'Configuration mise à jour :';
  RAISE NOTICE '- Confirmation d''email désactivée';
  RAISE NOTICE '- Auto-confirmation activée';
  RAISE NOTICE '- Trigger de création de profil mis à jour';
  RAISE NOTICE '- Détection admin automatique pour "wwadmin"';
END $$;

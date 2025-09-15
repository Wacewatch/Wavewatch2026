-- Script pour ajouter la colonne show_adult_content et les fonctions manquantes
-- Ce script est conçu pour être idempotent (peut être exécuté plusieurs fois sans problème)

-- 1. Ajouter la colonne show_adult_content si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'show_adult_content'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN show_adult_content BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column show_adult_content added to user_profiles';
    ELSE
        RAISE NOTICE 'Column show_adult_content already exists in user_profiles';
    END IF;
END $$;

-- 2. Ajouter les colonnes VIP étendues si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_vip_plus'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_vip_plus BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column is_vip_plus added to user_profiles';
    ELSE
        RAISE NOTICE 'Column is_vip_plus already exists in user_profiles';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_beta'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_beta BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column is_beta added to user_profiles';
    ELSE
        RAISE NOTICE 'Column is_beta already exists in user_profiles';
    END IF;
END $$;

-- 3. Créer la table user_profiles_extended si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    birth_date DATE,
    location VARCHAR(255),
    bio TEXT,
    profile_image TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Activer RLS sur user_profiles_extended
ALTER TABLE public.user_profiles_extended ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS pour user_profiles_extended
DROP POLICY IF EXISTS "Users can manage own extended profile" ON public.user_profiles_extended;
CREATE POLICY "Users can manage own extended profile" ON public.user_profiles_extended
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can do everything on user_profiles_extended" ON public.user_profiles_extended;
CREATE POLICY "Service role can do everything on user_profiles_extended" ON public.user_profiles_extended
    FOR ALL USING (auth.role() = 'service_role');

-- 6. Créer une fonction pour créer un profil utilisateur (contourne RLS)
CREATE OR REPLACE FUNCTION public.create_user_profile_secure(
    user_id_param UUID,
    username_param VARCHAR(50),
    email_param VARCHAR(255)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_data JSON;
    is_admin_user BOOLEAN := false;
BEGIN
    -- Vérifier si c'est un admin (username = wwadmin)
    IF LOWER(username_param) = 'wwadmin' THEN
        is_admin_user := true;
    END IF;

    -- Insérer ou mettre à jour le profil utilisateur
    INSERT INTO public.user_profiles (
        id,
        username,
        email,
        is_vip,
        is_admin,
        is_vip_plus,
        is_beta,
        show_adult_content,
        status,
        created_at,
        updated_at
    ) VALUES (
        user_id_param,
        username_param,
        email_param,
        is_admin_user, -- Les admins sont VIP par défaut
        is_admin_user,
        false,
        false,
        false,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        updated_at = NOW()
    RETURNING to_json(user_profiles.*) INTO result_data;

    RETURN result_data;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating user profile: %', SQLERRM;
END;
$$;

-- 7. Créer la fonction activate_admin_privileges
CREATE OR REPLACE FUNCTION public.activate_admin_privileges(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_data JSON;
BEGIN
    -- Mettre à jour le profil utilisateur pour activer les privilèges admin
    UPDATE public.user_profiles 
    SET 
        is_admin = true,
        is_vip = true,
        updated_at = NOW()
    WHERE id = user_id_param
    RETURNING to_json(user_profiles.*) INTO result_data;

    IF result_data IS NULL THEN
        RAISE EXCEPTION 'User profile not found for ID: %', user_id_param;
    END IF;

    RETURN result_data;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error activating admin privileges: %', SQLERRM;
END;
$$;

-- 8. Créer la fonction activate_vip_privileges
CREATE OR REPLACE FUNCTION public.activate_vip_privileges(
    user_id_param UUID,
    vip_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_data JSON;
    expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculer la date d'expiration (1 an à partir de maintenant)
    expiry_date := NOW() + INTERVAL '1 year';

    -- Mettre à jour selon le type VIP
    CASE vip_type
        WHEN 'vip' THEN
            UPDATE public.user_profiles 
            SET 
                is_vip = true,
                is_vip_plus = false,
                is_beta = false,
                vip_expires_at = expiry_date,
                updated_at = NOW()
            WHERE id = user_id_param
            RETURNING to_json(user_profiles.*) INTO result_data;

        WHEN 'vip_plus' THEN
            UPDATE public.user_profiles 
            SET 
                is_vip = true,
                is_vip_plus = true,
                is_beta = false,
                vip_expires_at = expiry_date,
                updated_at = NOW()
            WHERE id = user_id_param
            RETURNING to_json(user_profiles.*) INTO result_data;

        WHEN 'beta' THEN
            UPDATE public.user_profiles 
            SET 
                is_vip = false,
                is_vip_plus = false,
                is_beta = true,
                vip_expires_at = expiry_date,
                updated_at = NOW()
            WHERE id = user_id_param
            RETURNING to_json(user_profiles.*) INTO result_data;

        ELSE
            RAISE EXCEPTION 'Invalid VIP type: %. Valid types are: vip, vip_plus, beta', vip_type;
    END CASE;

    IF result_data IS NULL THEN
        RAISE EXCEPTION 'User profile not found for ID: %', user_id_param;
    END IF;

    RETURN result_data;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error activating VIP privileges: %', SQLERRM;
END;
$$;

-- 9. Créer la fonction force_confirm_specific_user
CREATE OR REPLACE FUNCTION public.force_confirm_specific_user(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
    result_data JSON;
BEGIN
    -- Forcer la confirmation de l'email
    UPDATE auth.users 
    SET 
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email
    AND email_confirmed_at IS NULL
    RETURNING json_build_object(
        'id', id,
        'email', email,
        'email_confirmed_at', email_confirmed_at
    ) INTO result_data;

    IF result_data IS NULL THEN
        -- L'utilisateur n'existe pas ou est déjà confirmé
        SELECT json_build_object(
            'message', 'User not found or already confirmed',
            'email', user_email
        ) INTO result_data;
    END IF;

    RETURN result_data;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error confirming user: %', SQLERRM;
END;
$$;

-- 10. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.create_user_profile_secure(UUID, VARCHAR, VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_admin_privileges(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_vip_privileges(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.force_confirm_specific_user(TEXT) TO anon, authenticated;

-- 11. Mettre à jour la fonction handle_new_user pour utiliser la nouvelle fonction sécurisée
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_value TEXT;
    result_json JSON;
BEGIN
    -- Extraire le nom d'utilisateur des métadonnées ou utiliser l'email
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );

    -- Utiliser la fonction sécurisée pour créer le profil
    SELECT public.create_user_profile_secure(
        NEW.id,
        username_value,
        NEW.email
    ) INTO result_json;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer la création de l'utilisateur
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Accorder les permissions sur les tables
GRANT ALL ON public.user_profiles_extended TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Message de succès
SELECT 'Script executed successfully! Added show_adult_content column and security functions.' as result;

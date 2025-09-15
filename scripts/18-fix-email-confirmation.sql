-- Script pour corriger la confirmation d'email et les profils manquants

-- 1. Confirmer tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Créer les profils manquants pour les utilisateurs existants
INSERT INTO user_profiles (id, username, email, is_vip, is_admin)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
    u.email,
    FALSE,
    CASE 
        WHEN COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)) = 'wwadmin' 
        THEN TRUE 
        ELSE FALSE 
    END
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Améliorer la fonction de trigger pour confirmer automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Confirmer automatiquement l'email
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;
    
    -- Créer le profil
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
        -- En cas d'erreur, au moins confirmer l'email
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE id = NEW.id AND email_confirmed_at IS NULL;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer une fonction pour confirmer manuellement un utilisateur
CREATE OR REPLACE FUNCTION confirm_user_email(user_email TEXT)
RETURNS boolean AS $$
DECLARE
    user_found boolean := false;
BEGIN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email = user_email AND email_confirmed_at IS NULL;
    
    GET DIAGNOSTICS user_found = FOUND;
    RETURN user_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Accorder les permissions
GRANT EXECUTE ON FUNCTION confirm_user_email TO authenticated, anon;

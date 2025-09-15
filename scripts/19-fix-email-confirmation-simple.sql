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

-- 4. Créer une fonction simplifiée pour confirmer manuellement un utilisateur
CREATE OR REPLACE FUNCTION confirm_user_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    result_message TEXT;
BEGIN
    -- Vérifier si l'utilisateur existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
        -- Confirmer l'email
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE email = user_email AND email_confirmed_at IS NULL;
        
        result_message := 'Email confirmed for: ' || user_email;
    ELSE
        result_message := 'User not found: ' || user_email;
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer une fonction pour confirmer tous les utilisateurs non confirmés
CREATE OR REPLACE FUNCTION confirm_all_users()
RETURNS TEXT AS $$
DECLARE
    confirmed_count INTEGER;
BEGIN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email_confirmed_at IS NULL;
    
    GET DIAGNOSTICS confirmed_count = ROW_COUNT;
    
    RETURN 'Confirmed ' || confirmed_count || ' users';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Accorder les permissions
GRANT EXECUTE ON FUNCTION confirm_user_email TO authenticated, anon;
GRANT EXECUTE ON FUNCTION confirm_all_users TO authenticated, anon;

-- 7. Afficher un résumé
DO $$
DECLARE
    total_users INTEGER;
    total_profiles INTEGER;
    confirmed_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM user_profiles;
    SELECT COUNT(*) INTO confirmed_users FROM auth.users WHERE email_confirmed_at IS NOT NULL;
    
    RAISE NOTICE 'Database Status:';
    RAISE NOTICE '- Total users: %', total_users;
    RAISE NOTICE '- Total profiles: %', total_profiles;
    RAISE NOTICE '- Confirmed users: %', confirmed_users;
END $$;

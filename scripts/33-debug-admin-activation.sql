-- Script de débogage pour l'activation admin
-- Vérifier l'état actuel des utilisateurs et corriger les problèmes

-- 1. Afficher tous les utilisateurs avec leurs privilèges
SELECT 
    id,
    username,
    email,
    is_admin,
    is_vip,
    is_vip_plus,
    is_beta,
    status,
    created_at,
    updated_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 2. Vérifier s'il y a des utilisateurs sans profil dans user_profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    up.id as profile_id,
    up.username,
    up.is_admin
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 3. Forcer la création d'un profil pour tous les utilisateurs auth sans profil
INSERT INTO user_profiles (
    id, 
    username, 
    email, 
    is_admin, 
    is_vip, 
    is_vip_plus, 
    is_beta, 
    status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
    au.email,
    CASE WHEN LOWER(COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1))) = 'wwadmin' THEN true ELSE false END as is_admin,
    false as is_vip,
    false as is_vip_plus,
    false as is_beta,
    'active' as status,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 4. Créer une fonction pour activer les privilèges admin
CREATE OR REPLACE FUNCTION activate_admin_privileges(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Mettre à jour ou créer le profil utilisateur avec les privilèges admin
    INSERT INTO user_profiles (
        id, 
        username, 
        email, 
        is_admin, 
        is_vip, 
        is_vip_plus, 
        is_beta, 
        status,
        created_at,
        updated_at
    )
    SELECT 
        au.id,
        COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
        au.email,
        true as is_admin,
        false as is_vip,
        false as is_vip_plus,
        false as is_beta,
        'active' as status,
        au.created_at,
        NOW()
    FROM auth.users au
    WHERE au.id = user_id_param
    ON CONFLICT (id) DO UPDATE SET
        is_admin = true,
        status = 'active',
        updated_at = NOW();
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer une fonction pour activer les privilèges VIP
CREATE OR REPLACE FUNCTION activate_vip_privileges(user_id_param UUID, vip_type TEXT DEFAULT 'vip')
RETURNS BOOLEAN AS $$
BEGIN
    -- Mettre à jour ou créer le profil utilisateur avec les privilèges VIP
    INSERT INTO user_profiles (
        id, 
        username, 
        email, 
        is_admin, 
        is_vip, 
        is_vip_plus, 
        is_beta, 
        status,
        created_at,
        updated_at
    )
    SELECT 
        au.id,
        COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
        au.email,
        false as is_admin,
        CASE WHEN vip_type IN ('vip', 'vip_plus') THEN true ELSE false END as is_vip,
        CASE WHEN vip_type = 'vip_plus' THEN true ELSE false END as is_vip_plus,
        CASE WHEN vip_type = 'beta' THEN true ELSE false END as is_beta,
        'active' as status,
        au.created_at,
        NOW()
    FROM auth.users au
    WHERE au.id = user_id_param
    ON CONFLICT (id) DO UPDATE SET
        is_vip = CASE WHEN vip_type IN ('vip', 'vip_plus') THEN true ELSE user_profiles.is_vip END,
        is_vip_plus = CASE WHEN vip_type = 'vip_plus' THEN true ELSE user_profiles.is_vip_plus END,
        is_beta = CASE WHEN vip_type = 'beta' THEN true ELSE user_profiles.is_beta END,
        status = 'active',
        updated_at = NOW();
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 6. Vérifier les utilisateurs récemment créés (dernières 24h)
SELECT 
    up.id,
    up.username,
    up.email,
    up.is_admin,
    up.is_vip,
    up.is_vip_plus,
    up.is_beta,
    up.status,
    up.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.created_at > NOW() - INTERVAL '24 hours'
ORDER BY up.created_at DESC;

-- 7. Afficher les statistiques des privilèges
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_admin = true) as admin_count,
    COUNT(*) FILTER (WHERE is_vip = true) as vip_count,
    COUNT(*) FILTER (WHERE is_vip_plus = true) as vip_plus_count,
    COUNT(*) FILTER (WHERE is_beta = true) as beta_count,
    COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM user_profiles;

-- 8. Exemple d'utilisation des fonctions (décommentez pour tester)
-- SELECT activate_admin_privileges('USER_ID_HERE');
-- SELECT activate_vip_privileges('USER_ID_HERE', 'vip');
-- SELECT activate_vip_privileges('USER_ID_HERE', 'vip_plus');
-- SELECT activate_vip_privileges('USER_ID_HERE', 'beta');

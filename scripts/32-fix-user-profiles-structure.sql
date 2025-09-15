-- Vérifier et corriger la structure de la table user_profiles
-- S'assurer que tous les champs nécessaires existent

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
    -- Vérifier et ajouter is_admin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;

    -- Vérifier et ajouter is_vip
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'is_vip') THEN
        ALTER TABLE user_profiles ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;
    END IF;

    -- Vérifier et ajouter is_vip_plus
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'is_vip_plus') THEN
        ALTER TABLE user_profiles ADD COLUMN is_vip_plus BOOLEAN DEFAULT FALSE;
    END IF;

    -- Vérifier et ajouter is_beta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'is_beta') THEN
        ALTER TABLE user_profiles ADD COLUMN is_beta BOOLEAN DEFAULT FALSE;
    END IF;

    -- Vérifier et ajouter status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
        ALTER TABLE user_profiles ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;

    -- Vérifier et ajouter updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Mettre à jour les valeurs par défaut pour les utilisateurs existants
UPDATE user_profiles 
SET 
    is_admin = COALESCE(is_admin, FALSE),
    is_vip = COALESCE(is_vip, FALSE),
    is_vip_plus = COALESCE(is_vip_plus, FALSE),
    is_beta = COALESCE(is_beta, FALSE),
    status = COALESCE(status, 'active'),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    is_admin IS NULL 
    OR is_vip IS NULL 
    OR is_vip_plus IS NULL 
    OR is_beta IS NULL 
    OR status IS NULL 
    OR updated_at IS NULL;

-- Créer un index sur les colonnes de privilèges pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_privileges 
ON user_profiles (is_admin, is_vip, is_vip_plus, is_beta, status);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Afficher la structure finale de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Afficher quelques statistiques
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_admin = true) as admin_users,
    COUNT(*) FILTER (WHERE is_vip = true) as vip_users,
    COUNT(*) FILTER (WHERE is_vip_plus = true) as vip_plus_users,
    COUNT(*) FILTER (WHERE is_beta = true) as beta_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'banned') as banned_users
FROM user_profiles;

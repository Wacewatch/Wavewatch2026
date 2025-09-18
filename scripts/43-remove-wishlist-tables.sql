-- Script pour supprimer complètement la fonctionnalité wishlist
-- Supprime les tables, politiques RLS et fonctions liées à la wishlist

-- Supprimer les politiques RLS pour user_wishlist
DROP POLICY IF EXISTS "Users can view their own wishlist" ON user_wishlist;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON user_wishlist;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON user_wishlist;
DROP POLICY IF EXISTS "Users can manage own wishlist items" ON user_wishlist;

-- Supprimer les politiques RLS pour wishlist_items
DROP POLICY IF EXISTS "Users can view own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can manage own wishlist items" ON wishlist_items;

-- Supprimer les index
DROP INDEX IF EXISTS idx_user_wishlist_user_id;
DROP INDEX IF EXISTS idx_user_wishlist_content;
DROP INDEX IF EXISTS idx_wishlist_items_user_id;
DROP INDEX IF EXISTS idx_wishlist_items_tmdb_id;

-- Supprimer les tables wishlist
DROP TABLE IF EXISTS user_wishlist CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;

-- Supprimer les fonctions liées à la wishlist
DROP FUNCTION IF EXISTS add_to_wishlist(UUID, INTEGER, VARCHAR, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS remove_from_wishlist(UUID, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS get_user_wishlist(UUID);

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Toutes les tables et fonctionnalités wishlist ont été supprimées';
    RAISE NOTICE '🗑️ Tables supprimées: user_wishlist, wishlist_items, wishlist';
    RAISE NOTICE '🔐 Politiques RLS supprimées';
    RAISE NOTICE '📊 Index supprimés';
    RAISE NOTICE '⚙️ Fonctions supprimées';
END $$;

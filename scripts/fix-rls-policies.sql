-- Fix RLS policies to allow anonymous (anon) users to read public data

-- 1. user_profiles: allow anon to read public profile fields
DROP POLICY IF EXISTS "Anyone can view public profile fields" ON user_profiles;
CREATE POLICY "Anyone can view public profile fields"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. playlist_likes: allow anon to read likes counts
DROP POLICY IF EXISTS "Users can view all playlist likes" ON playlist_likes;
CREATE POLICY "Users can view all playlist likes"
  ON playlist_likes FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. playlist_items: ensure anon can read items from public playlists
DROP POLICY IF EXISTS "Users can view items from accessible playlists" ON playlist_items;
CREATE POLICY "Users can view items from accessible playlists"
  ON playlist_items FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_items.playlist_id
        AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

-- 4. playlists: ensure anon can read public playlists
DROP POLICY IF EXISTS "Users can view public playlists" ON playlists;
CREATE POLICY "Users can view public playlists"
  ON playlists FOR SELECT
  TO anon, authenticated
  USING (is_public = true OR auth.uid() = user_id);

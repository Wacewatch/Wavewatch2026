-- Fix playlist favorites RLS policies and ensure proper permissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own playlist favorites" ON playlist_favorites;
DROP POLICY IF EXISTS "Users can manage their own playlist favorites" ON playlist_favorites;

-- Create more permissive policies for playlist favorites
CREATE POLICY "Users can view their own playlist favorites" ON playlist_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlist favorites" ON playlist_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlist favorites" ON playlist_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlist favorites" ON playlist_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure the table has proper indexes
CREATE INDEX IF NOT EXISTS idx_playlist_favorites_playlist_id ON playlist_favorites(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_favorites_user_playlist ON playlist_favorites(user_id, playlist_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON playlist_favorites TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE playlist_favorites ENABLE ROW LEVEL SECURITY;

-- Add a function to safely toggle playlist favorites
CREATE OR REPLACE FUNCTION toggle_playlist_favorite(p_playlist_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check if the favorite already exists
    SELECT EXISTS(
        SELECT 1 FROM playlist_favorites 
        WHERE playlist_id = p_playlist_id AND user_id = v_user_id
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove from favorites
        DELETE FROM playlist_favorites 
        WHERE playlist_id = p_playlist_id AND user_id = v_user_id;
        RETURN FALSE; -- Removed from favorites
    ELSE
        -- Add to favorites
        INSERT INTO playlist_favorites (playlist_id, user_id)
        VALUES (p_playlist_id, v_user_id)
        ON CONFLICT (playlist_id, user_id) DO NOTHING;
        RETURN TRUE; -- Added to favorites
    END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION toggle_playlist_favorite(UUID) TO authenticated;

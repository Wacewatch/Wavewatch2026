-- Add foreign key relationship between playlists and user_profiles
-- This allows Supabase to properly join these tables in queries

-- First, check if the foreign key already exists and drop it if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'playlists_user_id_fkey' 
        AND table_name = 'playlists'
    ) THEN
        ALTER TABLE playlists DROP CONSTRAINT playlists_user_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE playlists
ADD CONSTRAINT playlists_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);

-- Ensure is_public has an index for filtering public playlists
CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON playlists(is_public);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_playlists_public_updated ON playlists(is_public, updated_at DESC);

-- Fix wishlist display issues by ensuring proper data structure
-- Add missing columns if they don't exist

-- Check if tmdb_id column exists in wishlist table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'wishlist' AND column_name = 'tmdb_id') THEN
        ALTER TABLE wishlist ADD COLUMN tmdb_id INTEGER;
    END IF;
END $$;

-- Check if media_type column exists in wishlist table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'wishlist' AND column_name = 'media_type') THEN
        ALTER TABLE wishlist ADD COLUMN media_type VARCHAR(20) DEFAULT 'movie';
    END IF;
END $$;

-- Update existing wishlist entries to have proper tmdb_id and media_type
UPDATE wishlist 
SET tmdb_id = COALESCE(tmdb_id, content_id),
    media_type = COALESCE(media_type, 'movie')
WHERE tmdb_id IS NULL OR media_type IS NULL;

-- Ensure all wishlist entries have the required fields
UPDATE wishlist 
SET poster_path = COALESCE(poster_path, '/placeholder.svg?height=300&width=200')
WHERE poster_path IS NULL OR poster_path = '';

-- Add new media types to playlist_items table if constraint exists
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname LIKE '%media_type%' 
        AND conrelid = 'playlist_items'::regclass
    ) THEN
        ALTER TABLE playlist_items DROP CONSTRAINT IF EXISTS playlist_items_media_type_check;
    END IF;
    
    -- Add new constraint with all media types
    ALTER TABLE playlist_items 
    ADD CONSTRAINT playlist_items_media_type_check 
    CHECK (media_type IN ('movie', 'tv', 'tv-channel', 'radio', 'game', 'ebook', 'episode', 'music', 'software', 'retrogaming'));
END $$;

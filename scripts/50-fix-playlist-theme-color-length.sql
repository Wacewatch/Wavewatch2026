-- Fix theme_color column to support gradient strings for premium colors
ALTER TABLE playlists 
ALTER COLUMN theme_color TYPE TEXT;

-- Update the comment to reflect the new capability
COMMENT ON COLUMN playlists.theme_color IS 'Color value - can be hex code or CSS gradient string for premium users';

-- Add more detailed avatar customization options
ALTER TABLE interactive_profiles 
ALTER COLUMN avatar_style SET DEFAULT '{
  "hairStyle": "short",
  "hairColor": "#333333",
  "skinTone": "#FFDBAC",
  "topColor": "#4dabf7",
  "bottomColor": "#2c2c2c",
  "shoeColor": "#000000",
  "accessory": "none"
}'::jsonb;

-- Create table for available customization options
CREATE TABLE IF NOT EXISTS avatar_customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- hairStyle, hairColor, skinTone, etc.
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE avatar_customization_options ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read customization options
CREATE POLICY "Anyone can view customization options"
  ON avatar_customization_options
  FOR SELECT
  TO public
  USING (true);

-- Only admins can manage customization options
CREATE POLICY "Admins can manage customization options"
  ON avatar_customization_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Insert default customization options
INSERT INTO avatar_customization_options (category, value, label, is_premium) VALUES
  -- Hair Styles
  ('hairStyle', 'short', 'Cheveux Courts', false),
  ('hairStyle', 'long', 'Cheveux Longs', false),
  ('hairStyle', 'curly', 'Cheveux Bouclés', false),
  ('hairStyle', 'bald', 'Chauve', false),
  ('hairStyle', 'ponytail', 'Queue de Cheval', true),
  ('hairStyle', 'mohawk', 'Mohawk', true),
  
  -- Hair Colors
  ('hairColor', '#000000', 'Noir', false),
  ('hairColor', '#333333', 'Brun Foncé', false),
  ('hairColor', '#8B4513', 'Brun', false),
  ('hairColor', '#FFD700', 'Blond', false),
  ('hairColor', '#FF0000', 'Rouge', true),
  ('hairColor', '#00FF00', 'Vert', true),
  ('hairColor', '#0000FF', 'Bleu', true),
  ('hairColor', '#FF00FF', 'Rose', true),
  
  -- Skin Tones
  ('skinTone', '#FFDBAC', 'Clair', false),
  ('skinTone', '#F1C27D', 'Moyen Clair', false),
  ('skinTone', '#E0AC69', 'Moyen', false),
  ('skinTone', '#C68642', 'Moyen Foncé', false),
  ('skinTone', '#8D5524', 'Foncé', false),
  
  -- Top Colors
  ('topColor', '#FFFFFF', 'Blanc', false),
  ('topColor', '#000000', 'Noir', false),
  ('topColor', '#4dabf7', 'Bleu', false),
  ('topColor', '#FF6B6B', 'Rouge', false),
  ('topColor', '#51CF66', 'Vert', false),
  ('topColor', '#FFD43B', 'Jaune', true),
  ('topColor', '#9775FA', 'Violet', true),
  
  -- Bottom Colors
  ('bottomColor', '#2c2c2c', 'Noir', false),
  ('bottomColor', '#1c1c1c', 'Gris Foncé', false),
  ('bottomColor', '#4B4B4B', 'Gris', false),
  ('bottomColor', '#1E3A8A', 'Bleu Marine', false),
  ('bottomColor', '#064E3B', 'Vert Foncé', false),
  
  -- Shoe Colors
  ('shoeColor', '#000000', 'Noir', false),
  ('shoeColor', '#FFFFFF', 'Blanc', false),
  ('shoeColor', '#8B4513', 'Marron', false),
  ('shoeColor', '#FF0000', 'Rouge', true),
  
  -- Accessories
  ('accessory', 'none', 'Aucun', false),
  ('accessory', 'glasses', 'Lunettes', false),
  ('accessory', 'hat', 'Chapeau', true),
  ('accessory', 'headphones', 'Casque Audio', true);

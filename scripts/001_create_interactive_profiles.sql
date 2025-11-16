-- Create table for interactive user profiles
CREATE TABLE IF NOT EXISTS interactive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_style JSONB DEFAULT '{"skin": "default", "hair": "default", "outfit": "default"}'::jsonb,
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  position_z REAL DEFAULT 0,
  rotation REAL DEFAULT 0,
  current_room TEXT DEFAULT 'entrance',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE interactive_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for interactive_profiles
CREATE POLICY "Anyone can view online profiles"
  ON interactive_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON interactive_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON interactive_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON interactive_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for real-time chat messages
CREATE TABLE IF NOT EXISTS interactive_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT 'entrance',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for chat messages
ALTER TABLE interactive_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat messages
CREATE POLICY "Anyone can view chat messages"
  ON interactive_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON interactive_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create interactive profile
CREATE OR REPLACE FUNCTION handle_new_interactive_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Get username from user_profiles or use email
  SELECT username INTO user_name
  FROM user_profiles
  WHERE user_id = NEW.id
  LIMIT 1;
  
  -- If no username found, use email prefix
  IF user_name IS NULL THEN
    user_name := SPLIT_PART(NEW.email, '@', 1);
  END IF;

  -- Insert interactive profile
  INSERT INTO interactive_profiles (user_id, username)
  VALUES (NEW.id, user_name)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_interactive ON auth.users;
CREATE TRIGGER on_auth_user_created_interactive
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_interactive_user();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_interactive_profiles_user_id ON interactive_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_interactive_profiles_is_online ON interactive_profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_interactive_profiles_current_room ON interactive_profiles(current_room);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON interactive_chat_messages(room);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON interactive_chat_messages(created_at DESC);

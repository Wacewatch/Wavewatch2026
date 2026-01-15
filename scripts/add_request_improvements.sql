-- Add tmdb_id column to content_requests if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'content_requests' AND column_name = 'tmdb_id'
  ) THEN
    ALTER TABLE content_requests ADD COLUMN tmdb_id INTEGER;
  END IF;
END $$;

-- Create admin_request_messages table for admin-user messaging
CREATE TABLE IF NOT EXISTS admin_request_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES content_requests(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES user_profiles(user_id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Add RLS policies for admin_request_messages
ALTER TABLE admin_request_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all request messages" ON admin_request_messages;
DROP POLICY IF EXISTS "Users can view messages on their requests" ON admin_request_messages;

-- Admins can manage all messages
CREATE POLICY "Admins can manage all request messages"
  ON admin_request_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Users can view messages related to their requests
CREATE POLICY "Users can view messages on their requests"
  ON admin_request_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content_requests 
      WHERE content_requests.id = admin_request_messages.request_id 
      AND content_requests.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_request_messages_request_id ON admin_request_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_content_requests_tmdb_id ON content_requests(tmdb_id);

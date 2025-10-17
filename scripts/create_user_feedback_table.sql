-- Create user feedback table for ratings and guestbook
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 10),
  functionality_rating INTEGER CHECK (functionality_rating >= 1 AND functionality_rating <= 10),
  design_rating INTEGER CHECK (design_rating >= 1 AND design_rating <= 10),
  guestbook_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- Add RLS policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can read all feedback
CREATE POLICY "Users can read all feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
  ON user_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

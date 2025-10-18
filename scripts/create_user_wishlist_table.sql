-- Create user_wishlist table for watchlist functionality
CREATE TABLE IF NOT EXISTS public.user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id INTEGER NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_title VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON public.user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_content ON public.user_wishlist(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_created_at ON public.user_wishlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist"
  ON public.user_wishlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist"
  ON public.user_wishlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist items
CREATE POLICY "Users can update own wishlist"
  ON public.user_wishlist
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist"
  ON public.user_wishlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_wishlist TO authenticated;
GRANT SELECT ON public.user_wishlist TO anon;

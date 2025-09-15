-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.user_wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('movie', 'tv')),
    content_title VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON public.user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_content ON public.user_wishlist(content_id, content_type);

-- Enable RLS
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wishlist" ON public.user_wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON public.user_wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON public.user_wishlist
    FOR DELETE USING (auth.uid() = user_id);

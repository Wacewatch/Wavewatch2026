-- Create table for tracking VIP game plays
CREATE TABLE IF NOT EXISTS public.vip_game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize VARCHAR(50) NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for tracking VIP game winners
CREATE TABLE IF NOT EXISTS public.vip_game_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  prize VARCHAR(50) NOT NULL,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vip_game_plays_user_id ON public.vip_game_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_game_plays_played_at ON public.vip_game_plays(played_at);
CREATE INDEX IF NOT EXISTS idx_vip_game_winners_won_at ON public.vip_game_winners(won_at DESC);

-- Enable Row Level Security
ALTER TABLE public.vip_game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_game_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vip_game_plays
CREATE POLICY "Users can view their own plays"
  ON public.vip_game_plays
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plays"
  ON public.vip_game_plays
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vip_game_winners (public read, authenticated insert)
CREATE POLICY "Anyone can view winners"
  ON public.vip_game_winners
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert winners"
  ON public.vip_game_winners
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.vip_game_plays TO authenticated;
GRANT SELECT ON public.vip_game_winners TO authenticated, anon;
GRANT INSERT ON public.vip_game_winners TO authenticated;

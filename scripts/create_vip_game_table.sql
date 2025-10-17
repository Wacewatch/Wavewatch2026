-- Create table for VIP game system
CREATE TABLE IF NOT EXISTS vip_game_plays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prize VARCHAR(50) NOT NULL, -- 'vip_1_month', 'vip_1_week', 'vip_1_day', 'none'
    UNIQUE(user_id, DATE(played_at))
);

-- Create table for VIP game winners history
CREATE TABLE IF NOT EXISTS vip_game_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255),
    prize VARCHAR(50) NOT NULL,
    won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vip_game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_game_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own plays" ON vip_game_plays
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plays" ON vip_game_plays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view winners" ON vip_game_winners
    FOR SELECT USING (true);

CREATE POLICY "System can insert winners" ON vip_game_winners
    FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vip_game_plays_user ON vip_game_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_game_plays_date ON vip_game_plays(played_at);
CREATE INDEX IF NOT EXISTS idx_vip_game_winners_date ON vip_game_winners(won_at);

SELECT 'VIP game tables created successfully!' as status;

-- Table pour stocker les statistiques utilisateur personnelles
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_goal INTEGER DEFAULT 10,
    watching_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- RLS policies
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own statistics"
    ON user_statistics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics"
    ON user_statistics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics"
    ON user_statistics FOR UPDATE
    USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_user_statistics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_statistics_updated_at
    BEFORE UPDATE ON user_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_user_statistics_timestamp();

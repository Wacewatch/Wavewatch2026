-- Create messaging system for user-to-user communication

-- Create messages table
CREATE TABLE IF NOT EXISTS user_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Add messaging preferences to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_messages_sender ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient ON user_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Enable RLS
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON user_messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = recipient_id
    );

CREATE POLICY "Users can send messages" ON user_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        -- Check if recipient allows messages
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = recipient_id AND allow_messages = true
        ) AND
        -- Check if sender is not blocked by recipient
        NOT EXISTS (
            SELECT 1 FROM blocked_users 
            WHERE blocker_id = recipient_id AND blocked_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their received messages" ON user_messages
    FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for blocked users
CREATE POLICY "Users can manage their blocked list" ON blocked_users
    FOR ALL USING (auth.uid() = blocker_id);

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM user_messages
        WHERE recipient_id = user_uuid AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_messages TO authenticated;
GRANT ALL ON blocked_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count TO authenticated;

SELECT 'Messaging system created successfully!' as status;

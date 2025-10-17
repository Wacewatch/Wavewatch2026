-- Create table for staff messages (contact staff feature)
CREATE TABLE IF NOT EXISTS staff_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'replied', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own staff messages" ON staff_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create staff messages" ON staff_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all staff messages" ON staff_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update staff messages" ON staff_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete staff messages" ON staff_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_messages_user ON staff_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_status ON staff_messages(status);
CREATE INDEX IF NOT EXISTS idx_staff_messages_created ON staff_messages(created_at);

SELECT 'Staff messages table created successfully!' as status;

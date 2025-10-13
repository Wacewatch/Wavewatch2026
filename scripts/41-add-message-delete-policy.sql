-- Add DELETE policy for user_messages to allow recipients to delete their messages

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can delete their received messages" ON user_messages;

-- Create DELETE policy allowing recipients to delete messages they received
CREATE POLICY "Users can delete their received messages" ON user_messages
    FOR DELETE USING (auth.uid() = recipient_id);

SELECT 'Message delete policy added successfully!' as status;

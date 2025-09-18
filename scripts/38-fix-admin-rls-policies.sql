-- Fix RLS policies to allow admins to see all user data and activities

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own login history" ON user_login_history;
DROP POLICY IF EXISTS "Users can view own watch history" ON user_watch_history;
DROP POLICY IF EXISTS "Users can view own ratings" ON user_ratings;
DROP POLICY IF EXISTS "Users can view own wishlist" ON user_wishlist;

-- Create new policies that allow admins to see all data
CREATE POLICY "Users can view profiles" ON user_profiles
    FOR SELECT USING (
        auth.uid()::text = id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

CREATE POLICY "Users can update profiles" ON user_profiles
    FOR UPDATE USING (
        auth.uid()::text = id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

CREATE POLICY "Users can view login history" ON user_login_history
    FOR SELECT USING (
        user_id = auth.uid()::text OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

CREATE POLICY "Users can view watch history" ON user_watch_history
    FOR SELECT USING (
        user_id = auth.uid()::text OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

CREATE POLICY "Users can view ratings" ON user_ratings
    FOR SELECT USING (
        user_id = auth.uid()::text OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

CREATE POLICY "Users can view wishlist" ON user_wishlist
    FOR SELECT USING (
        user_id = auth.uid()::text OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

-- Allow admins to insert/update/delete user data
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid()::text AND is_admin = true
        )
    );

-- Remove all existing RLS policies that cause infinite recursion
-- and create simple, non-recursive policies

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can update all user profiles" ON user_profiles;

-- Drop problematic admin policies on other tables
DROP POLICY IF EXISTS "Admin can view all user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admin can view all user login history" ON user_login_history;
DROP POLICY IF EXISTS "Admin can view all user watch history" ON user_watch_history;
DROP POLICY IF EXISTS "Admin can view all user ratings" ON user_ratings;
DROP POLICY IF EXISTS "Admin can view all user wishlist" ON user_wishlist;
DROP POLICY IF EXISTS "Admin can view all user favorites" ON user_favorites;
DROP POLICY IF EXISTS "Admin can view all bug reports" ON bug_reports;

-- Create simple, non-recursive policies for user_profiles
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow inserts for new user registration
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Simple policies for other tables - users can only access their own data
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own login history" ON user_login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watch history" ON user_watch_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings" ON user_ratings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlist" ON user_wishlist
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bug reports" ON bug_reports
    FOR ALL USING (auth.uid() = user_id);

-- For admin functionality, we'll handle permissions in the application layer
-- rather than in RLS policies to avoid recursion

-- Ensure RLS is enabled on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Create a simple function to check if current user is admin
-- This will be used in application code, not in RLS policies
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()),
    false
  );
$$;

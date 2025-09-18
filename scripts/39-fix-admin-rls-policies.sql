-- Fix RLS policies for admin access to all data

-- Allow admins to read all user profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON user_profiles;
CREATE POLICY "admin_read_all_profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  )
);

-- Allow admins to update all user profiles
DROP POLICY IF EXISTS "admin_update_all_profiles" ON user_profiles;
CREATE POLICY "admin_update_all_profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  )
);

-- Allow admins to read all login history
DROP POLICY IF EXISTS "admin_read_all_login_history" ON user_login_history;
CREATE POLICY "admin_read_all_login_history" ON user_login_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  )
);

-- Allow admins to read all watch history
DROP POLICY IF EXISTS "admin_read_all_watch_history" ON user_watch_history;
CREATE POLICY "admin_read_all_watch_history" ON user_watch_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  )
);

-- Allow admins to read all ratings
DROP POLICY IF EXISTS "admin_read_all_ratings" ON user_ratings;
CREATE POLICY "admin_read_all_ratings" ON user_ratings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  )
);

-- Allow admins to read all wishlist items
DROP POLICY IF EXISTS "admin_read_all_wishlist" ON user_wishlist;
CREATE POLICY "admin_read_all_wishlist" ON user_wishlist
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  )
);

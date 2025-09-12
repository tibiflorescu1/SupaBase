/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Problem
    - Current policies cause infinite recursion when checking permissions
    - The has_permission function references user_profiles table which creates a loop

  2. Solution
    - Drop all existing policies
    - Create simple, non-recursive policies
    - Use auth.uid() directly instead of has_permission function
    - Remove problematic has_permission function
*/

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;

-- Drop the problematic has_permission function
DROP FUNCTION IF EXISTS has_permission(user_role);

-- Create simple, non-recursive policies
CREATE POLICY "Allow authenticated users to read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read own profile"
  ON user_profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow service role full access"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
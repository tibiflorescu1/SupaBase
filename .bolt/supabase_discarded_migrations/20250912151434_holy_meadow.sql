/*
  # Fix user profiles access

  1. Security Changes
    - Drop existing problematic policies
    - Create simple public read access policy
    - Ensure no RLS recursion issues

  2. Data Access
    - Allow public read access to user_profiles
    - Keep write operations restricted to authenticated users
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own data" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow public read access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can read user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Editors can insert user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Editors can update user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete user_profiles" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple public read policy (no recursion)
CREATE POLICY "Public can read user profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

-- Create authenticated write policies
CREATE POLICY "Authenticated can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (true);
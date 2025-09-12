/*
  # Fix user_profiles access policies

  1. Security Changes
    - Remove all existing RLS policies that cause recursion
    - Add simple public read access policy
    - Keep RLS enabled for security
    - Allow authenticated users to manage profiles

  2. Changes Made
    - DROP all existing policies
    - CREATE simple non-recursive policies
    - Enable public read access to eliminate auth loops
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow public read access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own data" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Public can read user_profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (true);
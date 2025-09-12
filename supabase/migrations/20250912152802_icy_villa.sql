/*
  # Fix user profiles access - Final version

  1. Security Changes
    - Drop all existing policies that might cause recursion
    - Create simple, non-recursive policies
    - Enable public read access for user_profiles table
    - Allow authenticated users to manage profiles

  2. Policy Structure
    - Public can read all user profiles (for admin interface)
    - Authenticated users can insert/update/delete profiles
    - No complex role checking to avoid recursion
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can read user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can read user_profiles" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for all users"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the table structure
DO $$
BEGIN
  -- Check if is_active column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;
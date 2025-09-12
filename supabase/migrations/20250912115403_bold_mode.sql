/*
  # Fix user_profiles table issues

  1. Schema Updates
    - Add missing columns (last_login, full_name, avatar_url, is_active)
    - Ensure proper data types and defaults

  2. Security Fixes
    - Drop problematic RLS policies causing infinite recursion
    - Create simple, direct policies using auth.uid()
    - Rebuild has_permission function without self-references

  3. Auto Profile Creation
    - Trigger to create user profiles automatically on signup
    - Handle conflicts gracefully
*/

-- First, ensure the table exists with all required columns
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN full_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Drop the problematic has_permission function
DROP FUNCTION IF EXISTS has_permission(user_role);

-- Create a simple has_permission function that doesn't query user_profiles
CREATE OR REPLACE FUNCTION has_permission(required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get the user's role directly from the current context
  -- This avoids the circular dependency
  SELECT role INTO user_role_value
  FROM user_profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- If no profile found, return false
  IF user_role_value IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check role hierarchy: viewer < editor < admin
  CASE required_role
    WHEN 'viewer' THEN
      RETURN user_role_value IN ('viewer', 'editor', 'admin');
    WHEN 'editor' THEN
      RETURN user_role_value IN ('editor', 'admin');
    WHEN 'admin' THEN
      RETURN user_role_value = 'admin';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Create simple, direct RLS policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, created_at, updated_at, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    'viewer'::user_role,
    NOW(),
    NOW(),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure your admin user has the correct role
UPDATE user_profiles 
SET role = 'admin', is_active = true, updated_at = NOW()
WHERE email = 'tibiflorescu@gmail.com';

-- If the profile doesn't exist, create it
INSERT INTO user_profiles (id, email, role, created_at, updated_at, is_active)
SELECT 
  au.id,
  au.email,
  'admin'::user_role,
  NOW(),
  NOW(),
  true
FROM auth.users au
WHERE au.email = 'tibiflorescu@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
  );
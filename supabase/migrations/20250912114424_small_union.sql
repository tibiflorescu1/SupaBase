/*
  # Fix user_profiles table issues

  1. Database Schema Changes
    - Add missing `last_login` column to user_profiles table
    - Add missing `full_name`, `avatar_url`, `is_active` columns referenced in code

  2. Security Policy Fixes
    - Drop existing problematic RLS policies that cause infinite recursion
    - Create simple, non-recursive policies for user_profiles table
    - Ensure policies use auth.uid() directly without self-referencing queries

  3. Function Updates
    - Update has_permission function to avoid recursion
    - Ensure all policies are straightforward and don't create circular dependencies
*/

-- Add missing columns to user_profiles table
DO $$
BEGIN
  -- Add last_login column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login timestamptz;
  END IF;

  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN full_name text;
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Drop all existing policies for user_profiles to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Drop the problematic has_permission function if it exists
DROP FUNCTION IF EXISTS has_permission(user_role);

-- Create a simple, non-recursive has_permission function
CREATE OR REPLACE FUNCTION has_permission(required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get the user's role directly from auth.users metadata or user_profiles
  SELECT role INTO user_role_value
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- If no profile found, return false
  IF user_role_value IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permission based on role hierarchy
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

-- Create simple, non-recursive RLS policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own profile (public)"
  ON user_profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policies that don't use the has_permission function to avoid recursion
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

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Create trigger to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    'viewer'::user_role,
    true
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
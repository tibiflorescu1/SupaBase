/*
  # Create user_profiles table and has_permission function

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, default 'viewer')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `has_permission(required_role)` - Check if current user has required permission level

  3. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to manage their own profiles
    - Add policies for admins to manage all profiles

  This resolves the "relation public.user_profiles does not exist" error
  that was preventing other tables from being queried due to RLS policy dependencies.
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create has_permission function
CREATE OR REPLACE FUNCTION has_permission(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- If no user is authenticated, return false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Get user role from user_profiles
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = auth.uid();

  -- If user not found in profiles, return false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check permission hierarchy: admin > editor > viewer
  CASE required_role
    WHEN 'viewer' THEN
      RETURN user_role IN ('admin', 'editor', 'viewer');
    WHEN 'editor' THEN
      RETURN user_role IN ('admin', 'editor');
    WHEN 'admin' THEN
      RETURN user_role = 'admin';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow new users to create their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (has_permission('admin'));

CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (has_permission('admin'));

CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Insert a default admin user (you can modify this email to match your needs)
-- This will only work if you have a user with this email in auth.users
-- You should update this email to match your actual admin user
INSERT INTO user_profiles (id, email, role)
SELECT 
  id, 
  email, 
  'admin'
FROM auth.users 
WHERE email = 'admin@example.com'  -- Change this to your admin email
ON CONFLICT (id) DO NOTHING;

-- Create trigger to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
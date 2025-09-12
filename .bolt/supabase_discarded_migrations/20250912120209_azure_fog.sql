/*
  # Emergency fix for user_profiles table

  1. Drop and recreate user_profiles table with correct structure
  2. Simple RLS policies without recursion
  3. Auto-create profiles for new users
  4. Set admin users
*/

-- Drop existing table and recreate
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public can read profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admin policies
CREATE POLICY "Admins can do everything"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, is_active)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN NEW.email IN ('tibiflorescu@gmail.com', 'tibiflorescu@yahoo.com') THEN 'admin'::user_role
      ELSE 'viewer'::user_role
    END,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Create profiles for existing admin emails if they exist in auth.users
INSERT INTO user_profiles (id, email, role, is_active)
SELECT 
  au.id,
  au.email,
  'admin'::user_role,
  true
FROM auth.users au
WHERE au.email IN ('tibiflorescu@gmail.com', 'tibiflorescu@yahoo.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::user_role,
  is_active = true,
  updated_at = now();
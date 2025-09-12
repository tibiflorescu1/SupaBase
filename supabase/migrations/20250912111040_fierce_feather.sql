/*
  # Create Authentication and Role Management System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (user_role enum: admin, editor, viewer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for role-based access
    - Create function to check user permissions

  3. Functions
    - `has_permission(required_role)` - Check if user has required role or higher
    - `get_user_role()` - Get current user's role
    - `create_user_profile()` - Auto-create profile on signup
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create function to check permissions
CREATE OR REPLACE FUNCTION has_permission(required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get current user's role
  SELECT role INTO user_role_value
  FROM user_profiles
  WHERE id = auth.uid();
  
  -- If no profile found, return false
  IF user_role_value IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permission hierarchy: admin > editor > viewer
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

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_value, 'viewer');
END;
$$;

-- Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating user profiles
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (has_permission('admin'));

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (has_permission('admin'))
  WITH CHECK (has_permission('admin'));

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Update existing table policies to use the new permission system
-- Update categorii policies
DROP POLICY IF EXISTS "Public can read categorii" ON categorii;
DROP POLICY IF EXISTS "Editors can insert categorii" ON categorii;
DROP POLICY IF EXISTS "Editors can update categorii" ON categorii;
DROP POLICY IF EXISTS "Admins can delete categorii" ON categorii;

CREATE POLICY "Anyone can read categorii"
  ON categorii
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert categorii"
  ON categorii
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update categorii"
  ON categorii
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete categorii"
  ON categorii
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Update vehicule policies
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicule;
DROP POLICY IF EXISTS "Authenticated users can read vehicule" ON vehicule;
DROP POLICY IF EXISTS "Editors can insert vehicule" ON vehicule;
DROP POLICY IF EXISTS "Editors can update vehicule" ON vehicule;
DROP POLICY IF EXISTS "Admins can delete vehicule" ON vehicule;

CREATE POLICY "Anyone can read vehicule"
  ON vehicule
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert vehicule"
  ON vehicule
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update vehicule"
  ON vehicule
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete vehicule"
  ON vehicule
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Update acoperiri policies
DROP POLICY IF EXISTS "Enable read access for all users" ON acoperiri;
DROP POLICY IF EXISTS "Authenticated users can read acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Editors can insert acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Editors can update acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Admins can delete acoperiri" ON acoperiri;

CREATE POLICY "Anyone can read acoperiri"
  ON acoperiri
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert acoperiri"
  ON acoperiri
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update acoperiri"
  ON acoperiri
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete acoperiri"
  ON acoperiri
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Update optiuni_extra policies
DROP POLICY IF EXISTS "Enable read access for all users" ON optiuni_extra;
DROP POLICY IF EXISTS "Authenticated users can read optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Editors can insert optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Editors can update optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Admins can delete optiuni_extra" ON optiuni_extra;

CREATE POLICY "Anyone can read optiuni_extra"
  ON optiuni_extra
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert optiuni_extra"
  ON optiuni_extra
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update optiuni_extra"
  ON optiuni_extra
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete optiuni_extra"
  ON optiuni_extra
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Update materiale_print policies
DROP POLICY IF EXISTS "Enable read access for all users" ON materiale_print;
DROP POLICY IF EXISTS "Authenticated users can read materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Editors can insert materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Editors can update materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Admins can delete materiale_print" ON materiale_print;

CREATE POLICY "Anyone can read materiale_print"
  ON materiale_print
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert materiale_print"
  ON materiale_print
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update materiale_print"
  ON materiale_print
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete materiale_print"
  ON materiale_print
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Update materiale_laminare policies
DROP POLICY IF EXISTS "Enable read access for all users" ON materiale_laminare;
DROP POLICY IF EXISTS "Authenticated users can read materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Editors can insert materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Editors can update materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Admins can delete materiale_laminare" ON materiale_laminare;

CREATE POLICY "Anyone can read materiale_laminare"
  ON materiale_laminare
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert materiale_laminare"
  ON materiale_laminare
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update materiale_laminare"
  ON materiale_laminare
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete materiale_laminare"
  ON materiale_laminare
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Update setari_print_alb policies
DROP POLICY IF EXISTS "Authenticated users can read setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Editors can insert setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Editors can update setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Admins can delete setari_print_alb" ON setari_print_alb;

CREATE POLICY "Anyone can read setari_print_alb"
  ON setari_print_alb
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Editors can insert setari_print_alb"
  ON setari_print_alb
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update setari_print_alb"
  ON setari_print_alb
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'))
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Admins can delete setari_print_alb"
  ON setari_print_alb
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'));

-- Create first admin user (you'll need to update this with your email)
-- This will be executed after you sign up with Google/Apple
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@gmail.com';
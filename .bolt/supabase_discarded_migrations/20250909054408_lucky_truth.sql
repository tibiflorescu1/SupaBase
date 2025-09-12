/*
  # Create user profiles table for role-based authentication

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, check constraint for valid roles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for authenticated users to read their own data
    - Add policies for admins to manage all user profiles

  3. Functions
    - `get_user_role()` - Returns the role of the current user
    - `has_permission()` - Checks if user has required permission level
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

-- Create policies
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
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert profile on signup"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create helper functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION has_permission(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE
    WHEN required_role = 'viewer' THEN 
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'viewer'))
    WHEN required_role = 'editor' THEN 
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    WHEN required_role = 'admin' THEN 
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    ELSE false
  END;
$$;

-- Update existing table policies to use role-based permissions
-- Update categorii policies
DROP POLICY IF EXISTS "Public can delete categorii" ON categorii;
DROP POLICY IF EXISTS "Public can insert categorii" ON categorii;
DROP POLICY IF EXISTS "Public can read categorii" ON categorii;
DROP POLICY IF EXISTS "Public can update categorii" ON categorii;

CREATE POLICY "Authenticated users can read categorii"
  ON categorii FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert categorii"
  ON categorii FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update categorii"
  ON categorii FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete categorii"
  ON categorii FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update vehicule policies
DROP POLICY IF EXISTS "Public can delete vehicule" ON vehicule;
DROP POLICY IF EXISTS "Public can insert vehicule" ON vehicule;
DROP POLICY IF EXISTS "Public can read vehicule" ON vehicule;
DROP POLICY IF EXISTS "Public can update vehicule" ON vehicule;

CREATE POLICY "Authenticated users can read vehicule"
  ON vehicule FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert vehicule"
  ON vehicule FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update vehicule"
  ON vehicule FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete vehicule"
  ON vehicule FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update acoperiri policies
DROP POLICY IF EXISTS "Public can delete acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Public can insert acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Public can read acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Public can update acoperiri" ON acoperiri;

CREATE POLICY "Authenticated users can read acoperiri"
  ON acoperiri FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert acoperiri"
  ON acoperiri FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update acoperiri"
  ON acoperiri FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete acoperiri"
  ON acoperiri FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update optiuni_extra policies
DROP POLICY IF EXISTS "Public can delete optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Public can insert optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Public can read optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Public can update optiuni_extra" ON optiuni_extra;

CREATE POLICY "Authenticated users can read optiuni_extra"
  ON optiuni_extra FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert optiuni_extra"
  ON optiuni_extra FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update optiuni_extra"
  ON optiuni_extra FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete optiuni_extra"
  ON optiuni_extra FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update materiale_print policies
DROP POLICY IF EXISTS "Public can delete materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Public can insert materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Public can read materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Public can update materiale_print" ON materiale_print;

CREATE POLICY "Authenticated users can read materiale_print"
  ON materiale_print FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert materiale_print"
  ON materiale_print FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update materiale_print"
  ON materiale_print FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete materiale_print"
  ON materiale_print FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update materiale_laminare policies
DROP POLICY IF EXISTS "Public can delete materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Public can insert materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Public can read materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Public can update materiale_laminare" ON materiale_laminare;

CREATE POLICY "Authenticated users can read materiale_laminare"
  ON materiale_laminare FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert materiale_laminare"
  ON materiale_laminare FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update materiale_laminare"
  ON materiale_laminare FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete materiale_laminare"
  ON materiale_laminare FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update setari_print_alb policies
DROP POLICY IF EXISTS "Public can delete setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Public can insert setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Public can read setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Public can update setari_print_alb" ON setari_print_alb;

CREATE POLICY "Authenticated users can read setari_print_alb"
  ON setari_print_alb FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert setari_print_alb"
  ON setari_print_alb FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update setari_print_alb"
  ON setari_print_alb FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete setari_print_alb"
  ON setari_print_alb FOR DELETE TO authenticated 
  USING (has_permission('admin'));

-- Update fisiere policies
DROP POLICY IF EXISTS "Public can delete fisiere" ON fisiere;
DROP POLICY IF EXISTS "Public can insert fisiere" ON fisiere;
DROP POLICY IF EXISTS "Public can read fisiere" ON fisiere;
DROP POLICY IF EXISTS "Public can update fisiere" ON fisiere;

CREATE POLICY "Authenticated users can read fisiere"
  ON fisiere FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert fisiere"
  ON fisiere FOR INSERT TO authenticated 
  WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update fisiere"
  ON fisiere FOR UPDATE TO authenticated 
  USING (has_permission('editor'));

CREATE POLICY "Admins can delete fisiere"
  ON fisiere FOR DELETE TO authenticated 
  USING (has_permission('admin'));
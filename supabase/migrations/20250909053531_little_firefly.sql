/*
  # Add user roles and permissions system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `role` (enum: admin, editor, viewer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for role-based access
    - Create function to get user role
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
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

CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(required_role user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN get_user_role() = 'admin' THEN true
    WHEN get_user_role() = 'editor' AND required_role IN ('editor', 'viewer') THEN true
    WHEN get_user_role() = 'viewer' AND required_role = 'viewer' THEN true
    ELSE false
  END;
$$;

-- Update existing table policies to use role-based permissions

-- Categories policies
DROP POLICY IF EXISTS "Public can delete categorii" ON categorii;
DROP POLICY IF EXISTS "Public can insert categorii" ON categorii;
DROP POLICY IF EXISTS "Public can read categorii" ON categorii;
DROP POLICY IF EXISTS "Public can update categorii" ON categorii;

CREATE POLICY "Authenticated users can read categorii"
  ON categorii FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert categorii"
  ON categorii FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update categorii"
  ON categorii FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete categorii"
  ON categorii FOR DELETE TO authenticated USING (has_permission('admin'));

-- Vehicles policies
DROP POLICY IF EXISTS "Public can delete vehicule" ON vehicule;
DROP POLICY IF EXISTS "Public can insert vehicule" ON vehicule;
DROP POLICY IF EXISTS "Public can read vehicule" ON vehicule;
DROP POLICY IF EXISTS "Public can update vehicule" ON vehicule;

CREATE POLICY "Authenticated users can read vehicule"
  ON vehicule FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert vehicule"
  ON vehicule FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update vehicule"
  ON vehicule FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete vehicule"
  ON vehicule FOR DELETE TO authenticated USING (has_permission('admin'));

-- Coverage policies
DROP POLICY IF EXISTS "Public can delete acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Public can insert acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Public can read acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Public can update acoperiri" ON acoperiri;

CREATE POLICY "Authenticated users can read acoperiri"
  ON acoperiri FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert acoperiri"
  ON acoperiri FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update acoperiri"
  ON acoperiri FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete acoperiri"
  ON acoperiri FOR DELETE TO authenticated USING (has_permission('admin'));

-- Extra options policies
DROP POLICY IF EXISTS "Public can delete optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Public can insert optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Public can read optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Public can update optiuni_extra" ON optiuni_extra;

CREATE POLICY "Authenticated users can read optiuni_extra"
  ON optiuni_extra FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert optiuni_extra"
  ON optiuni_extra FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update optiuni_extra"
  ON optiuni_extra FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete optiuni_extra"
  ON optiuni_extra FOR DELETE TO authenticated USING (has_permission('admin'));

-- Materials policies
DROP POLICY IF EXISTS "Public can delete materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Public can insert materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Public can read materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Public can update materiale_print" ON materiale_print;

CREATE POLICY "Authenticated users can read materiale_print"
  ON materiale_print FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert materiale_print"
  ON materiale_print FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update materiale_print"
  ON materiale_print FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete materiale_print"
  ON materiale_print FOR DELETE TO authenticated USING (has_permission('admin'));

DROP POLICY IF EXISTS "Public can delete materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Public can insert materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Public can read materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Public can update materiale_laminare" ON materiale_laminare;

CREATE POLICY "Authenticated users can read materiale_laminare"
  ON materiale_laminare FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert materiale_laminare"
  ON materiale_laminare FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update materiale_laminare"
  ON materiale_laminare FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete materiale_laminare"
  ON materiale_laminare FOR DELETE TO authenticated USING (has_permission('admin'));

-- White print settings policies
DROP POLICY IF EXISTS "Public can delete setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Public can insert setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Public can read setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Public can update setari_print_alb" ON setari_print_alb;

CREATE POLICY "Authenticated users can read setari_print_alb"
  ON setari_print_alb FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert setari_print_alb"
  ON setari_print_alb FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update setari_print_alb"
  ON setari_print_alb FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete setari_print_alb"
  ON setari_print_alb FOR DELETE TO authenticated USING (has_permission('admin'));

-- Files policies
DROP POLICY IF EXISTS "Public can delete fisiere" ON fisiere;
DROP POLICY IF EXISTS "Public can insert fisiere" ON fisiere;
DROP POLICY IF EXISTS "Public can read fisiere" ON fisiere;
DROP POLICY IF EXISTS "Public can update fisiere" ON fisiere;

CREATE POLICY "Authenticated users can read fisiere"
  ON fisiere FOR SELECT TO authenticated USING (has_permission('viewer'));

CREATE POLICY "Editors can insert fisiere"
  ON fisiere FOR INSERT TO authenticated WITH CHECK (has_permission('editor'));

CREATE POLICY "Editors can update fisiere"
  ON fisiere FOR UPDATE TO authenticated USING (has_permission('editor'));

CREATE POLICY "Admins can delete fisiere"
  ON fisiere FOR DELETE TO authenticated USING (has_permission('admin'));
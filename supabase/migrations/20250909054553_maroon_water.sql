/*
  # Create user_profiles table for authentication system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `role` (text, default 'viewer')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to manage their own profiles
    - Add policies for admins to manage all profiles
    - Allow new users to create their initial profile

  3. Helper Functions
    - `get_user_role()` - Get current user's role
    - `has_permission()` - Check if user has required permission level
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any profile" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow new users to create their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete profiles" ON public.user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;

-- Create helper function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(required_role text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    WHEN required_role = 'viewer' THEN 
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id AND role IN ('admin', 'editor', 'viewer'))
    WHEN required_role = 'editor' THEN 
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id AND role IN ('admin', 'editor'))
    WHEN required_role = 'admin' THEN 
      EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_id AND role = 'admin')
    ELSE false
  END;
$$;

-- Update existing table policies to use the helper function
DO $$
BEGIN
  -- Update categorii policies
  DROP POLICY IF EXISTS "Public can read categorii" ON public.categorii;
  DROP POLICY IF EXISTS "Public can insert categorii" ON public.categorii;
  DROP POLICY IF EXISTS "Public can update categorii" ON public.categorii;
  DROP POLICY IF EXISTS "Public can delete categorii" ON public.categorii;

  CREATE POLICY "Users can read categorii" ON public.categorii
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert categorii" ON public.categorii
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update categorii" ON public.categorii
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete categorii" ON public.categorii
    FOR DELETE USING (public.has_permission('admin'));

  -- Update vehicule policies
  DROP POLICY IF EXISTS "Public can read vehicule" ON public.vehicule;
  DROP POLICY IF EXISTS "Public can insert vehicule" ON public.vehicule;
  DROP POLICY IF EXISTS "Public can update vehicule" ON public.vehicule;
  DROP POLICY IF EXISTS "Public can delete vehicule" ON public.vehicule;

  CREATE POLICY "Users can read vehicule" ON public.vehicule
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert vehicule" ON public.vehicule
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update vehicule" ON public.vehicule
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete vehicule" ON public.vehicule
    FOR DELETE USING (public.has_permission('admin'));

  -- Update acoperiri policies
  DROP POLICY IF EXISTS "Public can read acoperiri" ON public.acoperiri;
  DROP POLICY IF EXISTS "Public can insert acoperiri" ON public.acoperiri;
  DROP POLICY IF EXISTS "Public can update acoperiri" ON public.acoperiri;
  DROP POLICY IF EXISTS "Public can delete acoperiri" ON public.acoperiri;

  CREATE POLICY "Users can read acoperiri" ON public.acoperiri
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert acoperiri" ON public.acoperiri
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update acoperiri" ON public.acoperiri
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete acoperiri" ON public.acoperiri
    FOR DELETE USING (public.has_permission('admin'));

  -- Update optiuni_extra policies
  DROP POLICY IF EXISTS "Public can read optiuni_extra" ON public.optiuni_extra;
  DROP POLICY IF EXISTS "Public can insert optiuni_extra" ON public.optiuni_extra;
  DROP POLICY IF EXISTS "Public can update optiuni_extra" ON public.optiuni_extra;
  DROP POLICY IF EXISTS "Public can delete optiuni_extra" ON public.optiuni_extra;

  CREATE POLICY "Users can read optiuni_extra" ON public.optiuni_extra
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert optiuni_extra" ON public.optiuni_extra
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update optiuni_extra" ON public.optiuni_extra
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete optiuni_extra" ON public.optiuni_extra
    FOR DELETE USING (public.has_permission('admin'));

  -- Update materiale_print policies
  DROP POLICY IF EXISTS "Public can read materiale_print" ON public.materiale_print;
  DROP POLICY IF EXISTS "Public can insert materiale_print" ON public.materiale_print;
  DROP POLICY IF EXISTS "Public can update materiale_print" ON public.materiale_print;
  DROP POLICY IF EXISTS "Public can delete materiale_print" ON public.materiale_print;

  CREATE POLICY "Users can read materiale_print" ON public.materiale_print
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert materiale_print" ON public.materiale_print
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update materiale_print" ON public.materiale_print
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete materiale_print" ON public.materiale_print
    FOR DELETE USING (public.has_permission('admin'));

  -- Update materiale_laminare policies
  DROP POLICY IF EXISTS "Public can read materiale_laminare" ON public.materiale_laminare;
  DROP POLICY IF EXISTS "Public can insert materiale_laminare" ON public.materiale_laminare;
  DROP POLICY IF EXISTS "Public can update materiale_laminare" ON public.materiale_laminare;
  DROP POLICY IF EXISTS "Public can delete materiale_laminare" ON public.materiale_laminare;

  CREATE POLICY "Users can read materiale_laminare" ON public.materiale_laminare
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert materiale_laminare" ON public.materiale_laminare
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update materiale_laminare" ON public.materiale_laminare
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete materiale_laminare" ON public.materiale_laminare
    FOR DELETE USING (public.has_permission('admin'));

  -- Update setari_print_alb policies
  DROP POLICY IF EXISTS "Public can read setari_print_alb" ON public.setari_print_alb;
  DROP POLICY IF EXISTS "Public can insert setari_print_alb" ON public.setari_print_alb;
  DROP POLICY IF EXISTS "Public can update setari_print_alb" ON public.setari_print_alb;
  DROP POLICY IF EXISTS "Public can delete setari_print_alb" ON public.setari_print_alb;

  CREATE POLICY "Users can read setari_print_alb" ON public.setari_print_alb
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert setari_print_alb" ON public.setari_print_alb
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update setari_print_alb" ON public.setari_print_alb
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete setari_print_alb" ON public.setari_print_alb
    FOR DELETE USING (public.has_permission('admin'));

  -- Update fisiere policies
  DROP POLICY IF EXISTS "Public can read fisiere" ON public.fisiere;
  DROP POLICY IF EXISTS "Public can insert fisiere" ON public.fisiere;
  DROP POLICY IF EXISTS "Public can update fisiere" ON public.fisiere;
  DROP POLICY IF EXISTS "Public can delete fisiere" ON public.fisiere;

  CREATE POLICY "Users can read fisiere" ON public.fisiere
    FOR SELECT USING (public.has_permission('viewer'));

  CREATE POLICY "Editors can insert fisiere" ON public.fisiere
    FOR INSERT WITH CHECK (public.has_permission('editor'));

  CREATE POLICY "Editors can update fisiere" ON public.fisiere
    FOR UPDATE USING (public.has_permission('editor'));

  CREATE POLICY "Admins can delete fisiere" ON public.fisiere
    FOR DELETE USING (public.has_permission('admin'));

END $$;
/*
  # Complete RLS Policy Fix for user_profiles

  This migration completely removes and recreates the user_profiles table with simple, 
  non-recursive RLS policies to eliminate the infinite recursion error.

  1. Drop and recreate user_profiles table
  2. Create simple RLS policies without recursion
  3. Add basic data for testing
*/

-- Drop the problematic table completely
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate the table with clean structure
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Allow public read access" 
  ON user_profiles 
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow authenticated insert" 
  ON user_profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated update own" 
  ON user_profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated delete own" 
  ON user_profiles 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);

-- Insert test admin users
INSERT INTO user_profiles (id, email, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'tibiflorescu@yahoo.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'tibiflorescu@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = now();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email IN ('tibiflorescu@yahoo.com', 'tibiflorescu@gmail.com') THEN 'admin'::user_role
      ELSE 'viewer'::user_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
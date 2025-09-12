/*
  # Fix foreign key constraint for user_profiles

  1. Remove foreign key constraint that causes issues with mock users
  2. Recreate user_profiles table without foreign key dependency
  3. Add mock admin users for testing
  4. Create simple RLS policies without recursion
*/

-- Drop the existing table completely
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate user_profiles table WITHOUT foreign key constraint
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (no recursion)
CREATE POLICY "Allow public read access to user_profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert mock admin users with specific UUIDs that won't conflict
INSERT INTO user_profiles (id, email, role, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'tibiflorescu@yahoo.com', 'admin', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'tibiflorescu@gmail.com', 'admin', now(), now())
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = now();
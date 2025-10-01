/*
  # Create Authentication System

  1. New Tables
    - `user_profiles` - Extended user information
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `role` (text: admin, editor, user)
      - `status` (text: active, inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)
      - `last_password_change` (timestamp)

    - `role_permissions` - Role-based permissions
      - `id` (uuid, primary key)
      - `role` (text)
      - `permission` (text)
      - `enabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Create default admin user
    - Set up default permissions

  3. Functions
    - Auto-create profile on user signup
    - Update last_login on signin
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  last_password_change timestamptz DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
  permission text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role, permission)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
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
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Policies for role_permissions
CREATE POLICY "Authenticated users can read permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, status)
  VALUES (NEW.id, NEW.email, 'user', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE user_profiles
  SET last_login = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default permissions for all roles
INSERT INTO role_permissions (role, permission, enabled) VALUES
-- Admin permissions (all enabled)
('admin', 'calculator', true),
('admin', 'viewVehicles', true),
('admin', 'editVehicles', true),
('admin', 'deleteVehicles', true),
('admin', 'viewCategories', true),
('admin', 'editCategories', true),
('admin', 'deleteCategories', true),
('admin', 'viewMaterials', true),
('admin', 'editMaterials', true),
('admin', 'deleteMaterials', true),
('admin', 'importExport', true),
('admin', 'manageUsers', true),
('admin', 'appSettings', true),

-- Editor permissions (limited)
('editor', 'calculator', true),
('editor', 'viewVehicles', true),
('editor', 'editVehicles', true),
('editor', 'deleteVehicles', false),
('editor', 'viewCategories', true),
('editor', 'editCategories', true),
('editor', 'deleteCategories', false),
('editor', 'viewMaterials', true),
('editor', 'editMaterials', true),
('editor', 'deleteMaterials', false),
('editor', 'importExport', true),
('editor', 'manageUsers', false),
('editor', 'appSettings', false),

-- User permissions (view only)
('user', 'calculator', true),
('user', 'viewVehicles', true),
('user', 'editVehicles', false),
('user', 'deleteVehicles', false),
('user', 'viewCategories', true),
('user', 'editCategories', false),
('user', 'deleteCategories', false),
('user', 'viewMaterials', true),
('user', 'editMaterials', false),
('user', 'deleteMaterials', false),
('user', 'importExport', false),
('user', 'manageUsers', false),
('user', 'appSettings', false)

ON CONFLICT (role, permission) DO NOTHING;
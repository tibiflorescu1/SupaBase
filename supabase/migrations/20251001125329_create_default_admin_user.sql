/*
  # Create Default Admin User
  
  1. Purpose
    - Creates a default admin user for the application
    - Email: admin@vehiclegraphics.com
    - Password: admin123
    
  2. Changes
    - Creates admin user in auth.users
    - Creates corresponding profile in user_profiles
    
  3. Notes
    - This is a development/production setup user
    - Password should be changed after first login
*/

-- Create the admin user directly in auth.users table
-- Note: In Supabase, we need to use the auth.users table properly
DO $$
DECLARE
  new_user_id uuid;
  hashed_password text;
BEGIN
  -- Generate a UUID for the new user
  new_user_id := gen_random_uuid();
  
  -- Create hashed password (this is a bcrypt hash of 'admin123')
  -- Using Supabase's crypt extension for proper password hashing
  hashed_password := crypt('admin123', gen_salt('bf'));
  
  -- Check if user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@vehiclegraphics.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@vehiclegraphics.com',
      hashed_password,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );
    
    -- Insert profile (the trigger should handle this, but we'll do it manually to be sure)
    INSERT INTO user_profiles (id, email, role, status, created_at, updated_at, last_password_change)
    VALUES (
      new_user_id,
      'admin@vehiclegraphics.com',
      'admin',
      'active',
      now(),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', status = 'active';
    
    RAISE NOTICE 'Default admin user created successfully';
  ELSE
    RAISE NOTICE 'Admin user already exists';
    
    -- Update existing user to be admin if not already
    UPDATE user_profiles
    SET role = 'admin', status = 'active'
    WHERE email = 'admin@vehiclegraphics.com';
  END IF;
END $$;
/*
  # Activare autentificare cu email

  1. Configurări
    - Activează autentificarea cu email/parolă
    - Dezactivează confirmarea email pentru dezvoltare
    - Configurează setările de securitate

  2. Politici
    - Permite înregistrarea utilizatorilor
    - Configurează accesul la profiluri
*/

-- Activează autentificarea cu email (se face din Dashboard)
-- Această migrație documentează setările necesare

-- Asigură-te că tabela user_profiles există și are politicile corecte
DO $$
BEGIN
  -- Verifică dacă tabela există
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Creează tabela dacă nu există
    CREATE TABLE user_profiles (
      id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email text NOT NULL,
      full_name text,
      avatar_url text,
      role user_role DEFAULT 'viewer'::user_role NOT NULL,
      is_active boolean DEFAULT true NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      last_login timestamptz
    );

    -- Activează RLS
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Șterge politicile existente pentru a le recrea
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users based on user_id" ON user_profiles;

-- Politici pentru user_profiles
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
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Funcție pentru crearea automată a profilului
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pentru crearea automată a profilului
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Funcție pentru verificarea permisiunilor
CREATE OR REPLACE FUNCTION public.has_permission(required_role user_role)
RETURNS boolean AS $$
DECLARE
  user_role_level integer;
  required_level integer;
BEGIN
  -- Verifică dacă utilizatorul este autentificat
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Obține nivelul rolului utilizatorului
  SELECT 
    CASE role
      WHEN 'viewer' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'admin' THEN 3
      ELSE 0
    END INTO user_role_level
  FROM user_profiles
  WHERE id = auth.uid() AND is_active = true;

  -- Obține nivelul necesar
  required_level := CASE required_role
    WHEN 'viewer' THEN 1
    WHEN 'editor' THEN 2
    WHEN 'admin' THEN 3
    ELSE 0
  END;

  -- Returnează true dacă utilizatorul are permisiunea necesară
  RETURN COALESCE(user_role_level, 0) >= required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
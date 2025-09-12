/*
  # Sistem de autentificare și administrare utilizatori

  1. Tabele noi
    - `user_profiles` - profiluri utilizatori cu roluri
  
  2. Tipuri
    - `user_role` - enum pentru roluri (admin, editor, viewer)
  
  3. Securitate
    - RLS activat pe toate tabelele
    - Politici pentru fiecare rol
    - Trigger pentru crearea automată a profilurilor
  
  4. Funcții
    - `has_permission()` - verifică permisiunile utilizatorului
    - `handle_new_user()` - creează profil automat la înregistrare
*/

-- Creează tipul enum pentru roluri
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Creează tabela user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Activează RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Funcție pentru verificarea permisiunilor
CREATE OR REPLACE FUNCTION has_permission(required_role user_role)
RETURNS boolean AS $$
BEGIN
  -- Verifică dacă utilizatorul este autentificat
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verifică rolul utilizatorului
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND is_active = true
    AND (
      (required_role = 'viewer' AND role IN ('viewer', 'editor', 'admin')) OR
      (required_role = 'editor' AND role IN ('editor', 'admin')) OR
      (required_role = 'admin' AND role = 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politici RLS pentru user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (has_permission('admin'::user_role));

CREATE POLICY "Admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('admin'::user_role));

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Funcție pentru crearea automată a profilurilor
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pentru crearea automată a profilurilor
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Actualizează politicile existente pentru a folosi funcția has_permission

-- Categorii
DROP POLICY IF EXISTS "Editors can insert categorii" ON categorii;
DROP POLICY IF EXISTS "Editors can update categorii" ON categorii;
DROP POLICY IF EXISTS "Admins can delete categorii" ON categorii;

CREATE POLICY "Editors can insert categorii"
  ON categorii
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update categorii"
  ON categorii
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete categorii"
  ON categorii
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Vehicule
DROP POLICY IF EXISTS "Editors can insert vehicule" ON vehicule;
DROP POLICY IF EXISTS "Editors can update vehicule" ON vehicule;
DROP POLICY IF EXISTS "Admins can delete vehicule" ON vehicule;

CREATE POLICY "Editors can insert vehicule"
  ON vehicule
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update vehicule"
  ON vehicule
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete vehicule"
  ON vehicule
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Acoperiri
DROP POLICY IF EXISTS "Editors can insert acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Editors can update acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Admins can delete acoperiri" ON acoperiri;

CREATE POLICY "Editors can insert acoperiri"
  ON acoperiri
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update acoperiri"
  ON acoperiri
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete acoperiri"
  ON acoperiri
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Optiuni Extra
DROP POLICY IF EXISTS "Editors can insert optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Editors can update optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Admins can delete optiuni_extra" ON optiuni_extra;

CREATE POLICY "Editors can insert optiuni_extra"
  ON optiuni_extra
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update optiuni_extra"
  ON optiuni_extra
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete optiuni_extra"
  ON optiuni_extra
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Materiale Print
DROP POLICY IF EXISTS "Editors can insert materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Editors can update materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Admins can delete materiale_print" ON materiale_print;

CREATE POLICY "Editors can insert materiale_print"
  ON materiale_print
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update materiale_print"
  ON materiale_print
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete materiale_print"
  ON materiale_print
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Materiale Laminare
DROP POLICY IF EXISTS "Editors can insert materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Editors can update materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Admins can delete materiale_laminare" ON materiale_laminare;

CREATE POLICY "Editors can insert materiale_laminare"
  ON materiale_laminare
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update materiale_laminare"
  ON materiale_laminare
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete materiale_laminare"
  ON materiale_laminare
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Setari Print Alb
DROP POLICY IF EXISTS "Editors can insert setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Editors can update setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Admins can delete setari_print_alb" ON setari_print_alb;

CREATE POLICY "Editors can insert setari_print_alb"
  ON setari_print_alb
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update setari_print_alb"
  ON setari_print_alb
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete setari_print_alb"
  ON setari_print_alb
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));

-- Fisiere
DROP POLICY IF EXISTS "Editors can insert fisiere" ON fisiere;
DROP POLICY IF EXISTS "Editors can update fisiere" ON fisiere;
DROP POLICY IF EXISTS "Admins can delete fisiere" ON fisiere;

CREATE POLICY "Editors can insert fisiere"
  ON fisiere
  FOR INSERT
  TO authenticated
  WITH CHECK (has_permission('editor'::user_role));

CREATE POLICY "Editors can update fisiere"
  ON fisiere
  FOR UPDATE
  TO authenticated
  USING (has_permission('editor'::user_role));

CREATE POLICY "Admins can delete fisiere"
  ON fisiere
  FOR DELETE
  TO authenticated
  USING (has_permission('admin'::user_role));
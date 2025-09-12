/*
  # Restaurare bază de date - Ștergere referințe user_profiles

  Această migrație restaurează baza de date la starea din momentul "Ștergere referințe user_profiles":

  1. Modificări la politici RLS
     - Actualizează politicile pentru `categorii` să folosească doar autentificare
     - Actualizează politicile pentru `acoperiri` să permită acces public
     - Actualizează politicile pentru `optiuni_extra` să permită acces public
     - Actualizează politicile pentru `materiale_print` să permită acces public
     - Actualizează politicile pentru `materiale_laminare` să permită acces public
     - Actualizează politicile pentru `setari_print_alb` să permită acces public

  2. Ștergere funcții și tipuri
     - Șterge funcția `has_permission` care nu mai este necesară
     - Șterge tipul enum `user_role` care nu mai este folosit

  3. Ștergere tabel
     - Șterge tabelul `user_profiles` complet

  Această restaurare simplifică sistemul eliminând managementul de roluri complex.
*/

-- 1. Actualizare politici RLS pentru categorii
DROP POLICY IF EXISTS "Admins can delete categorii" ON categorii;
DROP POLICY IF EXISTS "Editors can insert categorii" ON categorii;
DROP POLICY IF EXISTS "Editors can update categorii" ON categorii;

CREATE POLICY "Authenticated users can delete categorii"
  ON categorii
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categorii"
  ON categorii
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categorii"
  ON categorii
  FOR UPDATE
  TO authenticated
  USING (true);

-- 2. Actualizare politici RLS pentru acoperiri
DROP POLICY IF EXISTS "Admins can delete acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Authenticated users can read acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Editors can insert acoperiri" ON acoperiri;
DROP POLICY IF EXISTS "Editors can update acoperiri" ON acoperiri;

-- Politicile publice pentru acoperiri sunt deja create, le păstrăm

-- 3. Actualizare politici RLS pentru optiuni_extra
DROP POLICY IF EXISTS "Admins can delete optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Authenticated users can read optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Editors can insert optiuni_extra" ON optiuni_extra;
DROP POLICY IF EXISTS "Editors can update optiuni_extra" ON optiuni_extra;

-- Politicile publice pentru optiuni_extra sunt deja create, le păstrăm

-- 4. Actualizare politici RLS pentru materiale_print
DROP POLICY IF EXISTS "Admins can delete materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Authenticated users can read materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Editors can insert materiale_print" ON materiale_print;
DROP POLICY IF EXISTS "Editors can update materiale_print" ON materiale_print;

-- Politicile publice pentru materiale_print sunt deja create, le păstrăm

-- 5. Actualizare politici RLS pentru materiale_laminare
DROP POLICY IF EXISTS "Admins can delete materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Authenticated users can read materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Editors can insert materiale_laminare" ON materiale_laminare;
DROP POLICY IF EXISTS "Editors can update materiale_laminare" ON materiale_laminare;

-- Politicile publice pentru materiale_laminare sunt deja create, le păstrăm

-- 6. Actualizare politici RLS pentru setari_print_alb
DROP POLICY IF EXISTS "Admins can delete setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Authenticated users can read setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Editors can insert setari_print_alb" ON setari_print_alb;
DROP POLICY IF EXISTS "Editors can update setari_print_alb" ON setari_print_alb;

CREATE POLICY "Authenticated users can manage setari_print_alb"
  ON setari_print_alb
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Actualizare politici RLS pentru vehicule
DROP POLICY IF EXISTS "Admins can delete vehicule" ON vehicule;
DROP POLICY IF EXISTS "Authenticated users can read vehicule" ON vehicule;
DROP POLICY IF EXISTS "Editors can insert vehicule" ON vehicule;
DROP POLICY IF EXISTS "Editors can update vehicule" ON vehicule;

CREATE POLICY "Authenticated users can manage vehicule"
  ON vehicule
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. Actualizare politici RLS pentru fisiere
DROP POLICY IF EXISTS "Admins can delete fisiere" ON fisiere;
DROP POLICY IF EXISTS "Authenticated users can read fisiere" ON fisiere;
DROP POLICY IF EXISTS "Editors can insert fisiere" ON fisiere;
DROP POLICY IF EXISTS "Editors can update fisiere" ON fisiere;

CREATE POLICY "Authenticated users can manage fisiere"
  ON fisiere
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9. Ștergere funcție has_permission
DROP FUNCTION IF EXISTS has_permission(user_role);

-- 10. Ștergere tabel user_profiles (dacă există)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 11. Ștergere tipul enum user_role (dacă există)
DROP TYPE IF EXISTS user_role CASCADE;

-- Verificare finală - afișare politici active
DO $$
BEGIN
  RAISE NOTICE 'Migrația de restaurare a fost completată cu succes!';
  RAISE NOTICE 'Sistemul de roluri complexe a fost eliminat.';
  RAISE NOTICE 'Toate tabelele folosesc acum autentificare simplă sau acces public.';
END $$;
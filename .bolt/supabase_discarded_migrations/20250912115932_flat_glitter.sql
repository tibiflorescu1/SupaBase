/*
  # Adăugare user admin tibiflorescu@yahoo.com

  1. Actualizări
    - Setează rolul de admin pentru tibiflorescu@yahoo.com
    - Creează profilul dacă nu există
    - Activează contul

  2. Securitate
    - Folosește politicile RLS existente
    - Setează permisiuni complete de admin
*/

-- Actualizează utilizatorul existent sau creează unul nou
INSERT INTO user_profiles (id, email, role, is_active, created_at, updated_at)
SELECT 
  auth.users.id,
  'tibiflorescu@yahoo.com',
  'admin',
  true,
  now(),
  now()
FROM auth.users 
WHERE auth.users.email = 'tibiflorescu@yahoo.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  is_active = true,
  updated_at = now();

-- Dacă utilizatorul nu există în auth.users, creează doar înregistrarea pentru când se va înregistra
INSERT INTO user_profiles (id, email, role, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'tibiflorescu@yahoo.com',
  'admin',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'tibiflorescu@yahoo.com'
) AND NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE email = 'tibiflorescu@yahoo.com'
);

-- Actualizează și tibiflorescu@gmail.com să rămână admin
UPDATE user_profiles 
SET role = 'admin', is_active = true, updated_at = now()
WHERE email = 'tibiflorescu@gmail.com';
/*
  # Actualizare politică RLS pentru categorii - evitare duplicate

  1. Verificări și curățare
    - Verifică dacă politica există deja
    - Șterge duplicatele dacă există
    - Creează politica doar dacă nu există

  2. Securitate
    - Menține accesul public pentru citire
    - Evită erorile de duplicate policy
*/

-- Verifică și șterge toate politicile duplicate pentru SELECT pe categorii
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Numără câte politici SELECT există pentru categorii
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'categorii' 
    AND cmd = 'SELECT';
    
    -- Dacă există mai mult de o politică SELECT, șterge toate
    IF policy_count > 1 THEN
        RAISE NOTICE 'Găsite % politici SELECT duplicate pentru categorii. Se șterg toate...', policy_count;
        
        -- Șterge toate politicile SELECT existente
        DROP POLICY IF EXISTS "Public can read categorii" ON categorii;
        DROP POLICY IF EXISTS "Enable read access for all users" ON categorii;
        DROP POLICY IF EXISTS "Allow public read access" ON categorii;
        
        RAISE NOTICE 'Politici duplicate șterse cu succes.';
    END IF;
    
    -- Verifică din nou dacă mai există vreo politică SELECT
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'categorii' 
    AND cmd = 'SELECT';
    
    -- Creează politica doar dacă nu există niciuna
    IF policy_count = 0 THEN
        CREATE POLICY "Public can read categorii" ON categorii
        FOR SELECT USING (true);
        
        RAISE NOTICE 'Politică nouă "Public can read categorii" creată cu succes.';
    ELSE
        RAISE NOTICE 'Politică SELECT pentru categorii există deja. Nu se creează duplicate.';
    END IF;
END $$;
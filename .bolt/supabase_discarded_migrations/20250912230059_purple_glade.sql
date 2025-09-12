/*
  # Fix duplicate RLS policies

  1. Security Changes
    - Drop existing policies if they exist
    - Recreate clean public access policies
    - Ensure no conflicts with existing policies

  2. Tables Updated
    - categorii: Public read access
    - vehicule: Public read/write access  
    - acoperiri: Public read/write access
    - optiuni_extra: Public read/write access
    - materiale_print: Public read/write access
    - materiale_laminare: Public read/write access
    - setari_print_alb: Public read/write access
*/

-- Drop existing policies if they exist (no error if they don't exist)
DO $$ 
BEGIN
    -- Categorii policies
    DROP POLICY IF EXISTS "Public can read categorii" ON categorii;
    DROP POLICY IF EXISTS "Users can read categorii" ON categorii;
    DROP POLICY IF EXISTS "Editors can insert categorii" ON categorii;
    DROP POLICY IF EXISTS "Editors can update categorii" ON categorii;
    DROP POLICY IF EXISTS "Admins can delete categorii" ON categorii;
    DROP POLICY IF EXISTS "Authenticated users can insert categorii" ON categorii;
    DROP POLICY IF EXISTS "Authenticated users can update categorii" ON categorii;
    DROP POLICY IF EXISTS "Authenticated users can delete categorii" ON categorii;

    -- Vehicule policies
    DROP POLICY IF EXISTS "Public can read vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Enable read access for all users" ON vehicule;
    DROP POLICY IF EXISTS "Users can read vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Editors can insert vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Editors can update vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Admins can delete vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Authenticated users can manage vehicule" ON vehicule;

    -- Acoperiri policies
    DROP POLICY IF EXISTS "Public can read acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Enable read access for all users" ON acoperiri;
    DROP POLICY IF EXISTS "Users can read acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Editors can insert acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Editors can update acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Admins can delete acoperiri" ON acoperiri;

    -- Optiuni extra policies
    DROP POLICY IF EXISTS "Public can read optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Enable read access for all users" ON optiuni_extra;
    DROP POLICY IF EXISTS "Users can read optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Editors can insert optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Editors can update optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Admins can delete optiuni_extra" ON optiuni_extra;

    -- Materiale print policies
    DROP POLICY IF EXISTS "Public can read materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Enable read access for all users" ON materiale_print;
    DROP POLICY IF EXISTS "Users can read materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Editors can insert materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Editors can update materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Admins can delete materiale_print" ON materiale_print;

    -- Materiale laminare policies
    DROP POLICY IF EXISTS "Public can read materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Enable read access for all users" ON materiale_laminare;
    DROP POLICY IF EXISTS "Users can read materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Editors can insert materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Editors can update materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Admins can delete materiale_laminare" ON materiale_laminare;

    -- Setari print alb policies
    DROP POLICY IF EXISTS "Public can read setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Users can read setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Editors can insert setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Editors can update setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Admins can delete setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Authenticated users can manage setari_print_alb" ON setari_print_alb;

    -- Fisiere policies (if table exists)
    DROP POLICY IF EXISTS "Public can read fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Users can read fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Editors can insert fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Editors can update fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Admins can delete fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Authenticated users can manage fisiere" ON fisiere;

    -- Vehicle photos policies (if table exists)
    DROP POLICY IF EXISTS "Public can read vehicle_photos" ON vehicle_photos;
    DROP POLICY IF EXISTS "Public can insert vehicle_photos" ON vehicle_photos;
    DROP POLICY IF EXISTS "Public can update vehicle_photos" ON vehicle_photos;
    DROP POLICY IF EXISTS "Public can delete vehicle_photos" ON vehicle_photos;

END $$;

-- Create clean public policies for all tables
CREATE POLICY "Public access" ON categorii FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON vehicule FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON acoperiri FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON optiuni_extra FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON materiale_print FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON materiale_laminare FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON setari_print_alb FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for optional tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fisiere') THEN
        CREATE POLICY "Public access" ON fisiere FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vehicle_photos') THEN
        CREATE POLICY "Public access" ON vehicle_photos FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
END $$;
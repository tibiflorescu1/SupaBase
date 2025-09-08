/*
  # Complete Database Setup for Vehicle Graphics Pricing Application

  This migration creates all necessary tables, security policies, and sample data
  for the vehicle graphics pricing system.

  ## Tables Created:
  1. categorii - Vehicle categories
  2. vehicule - Vehicle models
  3. acoperiri - Coverage options for vehicles
  4. optiuni_extra - Extra options for vehicles
  5. materiale_print - Print materials with pricing
  6. materiale_laminare - Lamination materials
  7. setari_print_alb - White print settings
  8. fisiere - File storage

  ## Security:
  - RLS enabled on all tables
  - Public access policies (can be restricted later)
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop policies for categorii
    DROP POLICY IF EXISTS "Public can read categorii" ON categorii;
    DROP POLICY IF EXISTS "Public can insert categorii" ON categorii;
    DROP POLICY IF EXISTS "Public can update categorii" ON categorii;
    DROP POLICY IF EXISTS "Public can delete categorii" ON categorii;
    
    -- Drop policies for vehicule
    DROP POLICY IF EXISTS "Public can read vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Public can insert vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Public can update vehicule" ON vehicule;
    DROP POLICY IF EXISTS "Public can delete vehicule" ON vehicule;
    
    -- Drop policies for acoperiri
    DROP POLICY IF EXISTS "Public can read acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Public can insert acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Public can update acoperiri" ON acoperiri;
    DROP POLICY IF EXISTS "Public can delete acoperiri" ON acoperiri;
    
    -- Drop policies for optiuni_extra
    DROP POLICY IF EXISTS "Public can read optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Public can insert optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Public can update optiuni_extra" ON optiuni_extra;
    DROP POLICY IF EXISTS "Public can delete optiuni_extra" ON optiuni_extra;
    
    -- Drop policies for materiale_print
    DROP POLICY IF EXISTS "Public can read materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Public can insert materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Public can update materiale_print" ON materiale_print;
    DROP POLICY IF EXISTS "Public can delete materiale_print" ON materiale_print;
    
    -- Drop policies for materiale_laminare
    DROP POLICY IF EXISTS "Public can read materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Public can insert materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Public can update materiale_laminare" ON materiale_laminare;
    DROP POLICY IF EXISTS "Public can delete materiale_laminare" ON materiale_laminare;
    
    -- Drop policies for setari_print_alb
    DROP POLICY IF EXISTS "Public can read setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Public can insert setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Public can update setari_print_alb" ON setari_print_alb;
    DROP POLICY IF EXISTS "Public can delete setari_print_alb" ON setari_print_alb;
    
    -- Drop policies for fisiere
    DROP POLICY IF EXISTS "Public can read fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Public can insert fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Public can update fisiere" ON fisiere;
    DROP POLICY IF EXISTS "Public can delete fisiere" ON fisiere;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Ignore if tables don't exist yet
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS categorii (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producator text NOT NULL,
  model text NOT NULL,
  categorie_id uuid REFERENCES categorii(id) ON DELETE CASCADE,
  perioada_fabricatie text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS acoperiri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric DEFAULT 0,
  fisier_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS optiuni_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric DEFAULT 0,
  fisier_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materiale_print (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  permite_print_alb boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materiale_laminare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setari_print_alb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fisiere (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  data_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categorii ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoperiri ENABLE ROW LEVEL SECURITY;
ALTER TABLE optiuni_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiale_print ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiale_laminare ENABLE ROW LEVEL SECURITY;
ALTER TABLE setari_print_alb ENABLE ROW LEVEL SECURITY;
ALTER TABLE fisiere ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categorii
CREATE POLICY "Public can read categorii" ON categorii FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert categorii" ON categorii FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update categorii" ON categorii FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete categorii" ON categorii FOR DELETE TO public USING (true);

-- Create RLS policies for vehicule
CREATE POLICY "Public can read vehicule" ON vehicule FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert vehicule" ON vehicule FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update vehicule" ON vehicule FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete vehicule" ON vehicule FOR DELETE TO public USING (true);

-- Create RLS policies for acoperiri
CREATE POLICY "Public can read acoperiri" ON acoperiri FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert acoperiri" ON acoperiri FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update acoperiri" ON acoperiri FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete acoperiri" ON acoperiri FOR DELETE TO public USING (true);

-- Create RLS policies for optiuni_extra
CREATE POLICY "Public can read optiuni_extra" ON optiuni_extra FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert optiuni_extra" ON optiuni_extra FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update optiuni_extra" ON optiuni_extra FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete optiuni_extra" ON optiuni_extra FOR DELETE TO public USING (true);

-- Create RLS policies for materiale_print
CREATE POLICY "Public can read materiale_print" ON materiale_print FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert materiale_print" ON materiale_print FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update materiale_print" ON materiale_print FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete materiale_print" ON materiale_print FOR DELETE TO public USING (true);

-- Create RLS policies for materiale_laminare
CREATE POLICY "Public can read materiale_laminare" ON materiale_laminare FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert materiale_laminare" ON materiale_laminare FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update materiale_laminare" ON materiale_laminare FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete materiale_laminare" ON materiale_laminare FOR DELETE TO public USING (true);

-- Create RLS policies for setari_print_alb
CREATE POLICY "Public can read setari_print_alb" ON setari_print_alb FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert setari_print_alb" ON setari_print_alb FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update setari_print_alb" ON setari_print_alb FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete setari_print_alb" ON setari_print_alb FOR DELETE TO public USING (true);

-- Create RLS policies for fisiere
CREATE POLICY "Public can read fisiere" ON fisiere FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert fisiere" ON fisiere FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update fisiere" ON fisiere FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete fisiere" ON fisiere FOR DELETE TO public USING (true);

-- Insert sample data only if tables are empty
DO $$
BEGIN
    -- Insert sample categories if none exist
    IF NOT EXISTS (SELECT 1 FROM categorii LIMIT 1) THEN
        INSERT INTO categorii (nume) VALUES
        ('Autoturisme'),
        ('Motociclete'),
        ('Camioane'),
        ('Autobuze'),
        ('Vehicule Comerciale');
    END IF;

    -- Insert sample print materials if none exist
    IF NOT EXISTS (SELECT 1 FROM materiale_print LIMIT 1) THEN
        INSERT INTO materiale_print (nume, tip_calcul, valoare, permite_print_alb) VALUES
        ('Avery Dennison MPI 1105', 'procentual', 25.0, true),
        ('3M IJ180Cv3', 'procentual', 30.0, true),
        ('Oracal 3751RA', 'procentual', 20.0, false),
        ('Material Premium', 'suma_fixa', 150.0, true);
    END IF;

    -- Insert sample lamination materials if none exist
    IF NOT EXISTS (SELECT 1 FROM materiale_laminare LIMIT 1) THEN
        INSERT INTO materiale_laminare (nume, tip_calcul, valoare) VALUES
        ('Avery Dennison DOL 1460', 'procentual', 15.0),
        ('3M 8518', 'procentual', 18.0),
        ('Oracal 290', 'procentual', 12.0),
        ('Laminare Premium', 'suma_fixa', 100.0);
    END IF;

    -- Insert default white print settings if none exist
    IF NOT EXISTS (SELECT 1 FROM setari_print_alb LIMIT 1) THEN
        INSERT INTO setari_print_alb (tip_calcul, valoare) VALUES
        ('procentual', 35.0);
    END IF;
END $$;
/*
  # Complete Database Schema for Vehicle Graphics Pricing Application

  This migration creates the complete database structure for managing:
  1. Vehicle categories and models
  2. Coverage options and extra options for each vehicle
  3. Print and lamination materials with pricing
  4. White print settings
  5. File storage for images/documents

  ## Tables Created:
  - categorii: Vehicle categories
  - vehicule: Vehicle models
  - acoperiri: Coverage options for vehicles
  - optiuni_extra: Extra options for vehicles
  - materiale_print: Print materials with pricing calculations
  - materiale_laminare: Lamination materials
  - setari_print_alb: White print settings
  - fisiere: File storage

  ## Security:
  - RLS enabled on all tables
  - Public access policies (can be restricted later)
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categorii (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producator text NOT NULL,
  model text NOT NULL,
  categorie_id uuid REFERENCES categorii(id) ON DELETE CASCADE,
  perioada_fabricatie text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coverage options table
CREATE TABLE IF NOT EXISTS acoperiri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric DEFAULT 0,
  fisier_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create extra options table
CREATE TABLE IF NOT EXISTS optiuni_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric DEFAULT 0,
  fisier_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create print materials table
CREATE TABLE IF NOT EXISTS materiale_print (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  permite_print_alb boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lamination materials table
CREATE TABLE IF NOT EXISTS materiale_laminare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create white print settings table
CREATE TABLE IF NOT EXISTS setari_print_alb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS fisiere (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  data_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE categorii ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoperiri ENABLE ROW LEVEL SECURITY;
ALTER TABLE optiuni_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiale_print ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiale_laminare ENABLE ROW LEVEL SECURITY;
ALTER TABLE setari_print_alb ENABLE ROW LEVEL SECURITY;
ALTER TABLE fisiere ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (you can restrict these later)

-- Categories policies
CREATE POLICY "Public can read categorii" ON categorii FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert categorii" ON categorii FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update categorii" ON categorii FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete categorii" ON categorii FOR DELETE TO public USING (true);

-- Vehicles policies
CREATE POLICY "Public can read vehicule" ON vehicule FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert vehicule" ON vehicule FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update vehicule" ON vehicule FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete vehicule" ON vehicule FOR DELETE TO public USING (true);

-- Coverage policies
CREATE POLICY "Public can read acoperiri" ON acoperiri FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert acoperiri" ON acoperiri FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update acoperiri" ON acoperiri FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete acoperiri" ON acoperiri FOR DELETE TO public USING (true);

-- Extra options policies
CREATE POLICY "Public can read optiuni_extra" ON optiuni_extra FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert optiuni_extra" ON optiuni_extra FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update optiuni_extra" ON optiuni_extra FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete optiuni_extra" ON optiuni_extra FOR DELETE TO public USING (true);

-- Print materials policies
CREATE POLICY "Public can read materiale_print" ON materiale_print FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert materiale_print" ON materiale_print FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update materiale_print" ON materiale_print FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete materiale_print" ON materiale_print FOR DELETE TO public USING (true);

-- Lamination materials policies
CREATE POLICY "Public can read materiale_laminare" ON materiale_laminare FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert materiale_laminare" ON materiale_laminare FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update materiale_laminare" ON materiale_laminare FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete materiale_laminare" ON materiale_laminare FOR DELETE TO public USING (true);

-- White print settings policies
CREATE POLICY "Public can read setari_print_alb" ON setari_print_alb FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert setari_print_alb" ON setari_print_alb FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update setari_print_alb" ON setari_print_alb FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete setari_print_alb" ON setari_print_alb FOR DELETE TO public USING (true);

-- Files policies
CREATE POLICY "Public can read fisiere" ON fisiere FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert fisiere" ON fisiere FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update fisiere" ON fisiere FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete fisiere" ON fisiere FOR DELETE TO public USING (true);

-- Insert sample data

-- Sample categories
INSERT INTO categorii (nume) VALUES 
  ('Autoturisme'),
  ('Motociclete'),
  ('Camioane'),
  ('Autobuze'),
  ('Vehicule Comerciale')
ON CONFLICT DO NOTHING;

-- Sample print materials
INSERT INTO materiale_print (nume, tip_calcul, valoare, permite_print_alb) VALUES 
  ('Folie Standard', 'procentual', 25.0, true),
  ('Folie Premium', 'procentual', 35.0, true),
  ('Folie Reflectorizanta', 'suma_fixa', 150.0, false),
  ('Folie Magnetica', 'suma_fixa', 80.0, false)
ON CONFLICT DO NOTHING;

-- Sample lamination materials
INSERT INTO materiale_laminare (nume, tip_calcul, valoare) VALUES 
  ('Laminare Standard', 'procentual', 15.0),
  ('Laminare Premium', 'procentual', 25.0),
  ('Laminare Anti-UV', 'suma_fixa', 100.0),
  ('Laminare Texturata', 'suma_fixa', 120.0)
ON CONFLICT DO NOTHING;

-- Default white print settings
INSERT INTO setari_print_alb (tip_calcul, valoare) VALUES 
  ('procentual', 35.0)
ON CONFLICT DO NOTHING;
/*
  # Complete Vehicle Graphics Pricing Database Schema

  1. New Tables
    - `categorii` - Vehicle categories (Auto, Motocicletă, etc.)
    - `vehicule` - Vehicle models with manufacturer and category
    - `acoperiri` - Coverage options for each vehicle
    - `optiuni_extra` - Extra options for each vehicle
    - `materiale_print` - Print materials with pricing calculation
    - `materiale_laminare` - Lamination materials with pricing calculation
    - `setari_print_alb` - White print settings
    - `fisiere` - File storage for images/documents

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (can be restricted later)

  3. Features
    - UUID primary keys for all tables
    - Automatic timestamps
    - Foreign key relationships
    - Check constraints for data validation
    - Default values for better data consistency
*/

-- Create categorii table
CREATE TABLE IF NOT EXISTS categorii (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicule table
CREATE TABLE IF NOT EXISTS vehicule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producator text NOT NULL,
  model text NOT NULL,
  categorie_id uuid REFERENCES categorii(id) ON DELETE CASCADE,
  perioada_fabricatie text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create acoperiri table
CREATE TABLE IF NOT EXISTS acoperiri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric DEFAULT 0,
  fisier_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create optiuni_extra table
CREATE TABLE IF NOT EXISTS optiuni_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric DEFAULT 0,
  fisier_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create materiale_print table
CREATE TABLE IF NOT EXISTS materiale_print (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  permite_print_alb boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create materiale_laminare table
CREATE TABLE IF NOT EXISTS materiale_laminare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create setari_print_alb table
CREATE TABLE IF NOT EXISTS setari_print_alb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fisiere table
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

-- Create policies for public access (you can restrict these later)
CREATE POLICY "Public can read categorii" ON categorii FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert categorii" ON categorii FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update categorii" ON categorii FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete categorii" ON categorii FOR DELETE TO public USING (true);

CREATE POLICY "Public can read vehicule" ON vehicule FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert vehicule" ON vehicule FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update vehicule" ON vehicule FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete vehicule" ON vehicule FOR DELETE TO public USING (true);

CREATE POLICY "Public can read acoperiri" ON acoperiri FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert acoperiri" ON acoperiri FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update acoperiri" ON acoperiri FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete acoperiri" ON acoperiri FOR DELETE TO public USING (true);

CREATE POLICY "Public can read optiuni_extra" ON optiuni_extra FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert optiuni_extra" ON optiuni_extra FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update optiuni_extra" ON optiuni_extra FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete optiuni_extra" ON optiuni_extra FOR DELETE TO public USING (true);

CREATE POLICY "Public can read materiale_print" ON materiale_print FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert materiale_print" ON materiale_print FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update materiale_print" ON materiale_print FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete materiale_print" ON materiale_print FOR DELETE TO public USING (true);

CREATE POLICY "Public can read materiale_laminare" ON materiale_laminare FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert materiale_laminare" ON materiale_laminare FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update materiale_laminare" ON materiale_laminare FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete materiale_laminare" ON materiale_laminare FOR DELETE TO public USING (true);

CREATE POLICY "Public can read setari_print_alb" ON setari_print_alb FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert setari_print_alb" ON setari_print_alb FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update setari_print_alb" ON setari_print_alb FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete setari_print_alb" ON setari_print_alb FOR DELETE TO public USING (true);

CREATE POLICY "Public can read fisiere" ON fisiere FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert fisiere" ON fisiere FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can update fisiere" ON fisiere FOR UPDATE TO public USING (true);
CREATE POLICY "Public can delete fisiere" ON fisiere FOR DELETE TO public USING (true);

-- Insert some sample data to get started
INSERT INTO categorii (nume) VALUES 
  ('Autoturisme'),
  ('Motociclete'),
  ('Camioane'),
  ('Autobuze')
ON CONFLICT DO NOTHING;

INSERT INTO materiale_print (nume, tip_calcul, valoare, permite_print_alb) VALUES 
  ('Vinil Standard', 'procentual', 25, true),
  ('Vinil Premium', 'procentual', 35, true),
  ('Mesh', 'suma_fixa', 150, false)
ON CONFLICT DO NOTHING;

INSERT INTO materiale_laminare (nume, tip_calcul, valoare) VALUES 
  ('Laminare Standard', 'procentual', 15),
  ('Laminare Premium', 'procentual', 25),
  ('Fără Laminare', 'suma_fixa', 0)
ON CONFLICT DO NOTHING;

INSERT INTO setari_print_alb (tip_calcul, valoare) VALUES 
  ('procentual', 35)
ON CONFLICT DO NOTHING;
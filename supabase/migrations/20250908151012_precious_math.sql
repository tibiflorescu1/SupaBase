/*
  # Vehicle Graphics Database Schema

  1. New Tables
    - `categorii` - Vehicle categories (ATV, SSV, etc.)
    - `vehicule` - Vehicle models with manufacturer and model info
    - `acoperiri` - Coverage options for each vehicle
    - `optiuni_extra` - Extra options for each vehicle
    - `materiale_print` - Print materials with pricing
    - `materiale_laminare` - Lamination materials with pricing
    - `setari_print_alb` - White print settings
    - `fisiere` - File storage metadata

  2. Security
    - Enable RLS on all tables
    - Add public policies for demo purposes (in production, use authentication)

  3. Initial Data
    - Sample categories, materials, vehicles, and options
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categorii (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producator text NOT NULL,
  model text NOT NULL,
  categorie_id uuid REFERENCES categorii(id) ON DELETE CASCADE,
  perioada_fabricatie text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coverage options table
CREATE TABLE IF NOT EXISTS acoperiri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric NOT NULL DEFAULT 0,
  fisier_id uuid DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extra options table
CREATE TABLE IF NOT EXISTS optiuni_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid REFERENCES vehicule(id) ON DELETE CASCADE,
  nume text NOT NULL,
  pret numeric NOT NULL DEFAULT 0,
  fisier_id uuid DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Print materials table
CREATE TABLE IF NOT EXISTS materiale_print (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric NOT NULL DEFAULT 0,
  permite_print_alb boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lamination materials table
CREATE TABLE IF NOT EXISTS materiale_laminare (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- White print settings table
CREATE TABLE IF NOT EXISTS setari_print_alb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_calcul text NOT NULL CHECK (tip_calcul IN ('procentual', 'suma_fixa')),
  valoare numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Files table for storing file metadata
CREATE TABLE IF NOT EXISTS fisiere (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nume text NOT NULL,
  data_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categorii ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicule ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoperiri ENABLE ROW LEVEL SECURITY;
ALTER TABLE optiuni_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiale_print ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiale_laminare ENABLE ROW LEVEL SECURITY;
ALTER TABLE setari_print_alb ENABLE ROW LEVEL SECURITY;
ALTER TABLE fisiere ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read categorii"
  ON categorii FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read vehicule"
  ON vehicule FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read acoperiri"
  ON acoperiri FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read optiuni_extra"
  ON optiuni_extra FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read materiale_print"
  ON materiale_print FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read materiale_laminare"
  ON materiale_laminare FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read setari_print_alb"
  ON setari_print_alb FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read fisiere"
  ON fisiere FOR SELECT
  TO public
  USING (true);

-- Public write policies (for demo purposes - in production you'd want authentication)
CREATE POLICY "Public can insert categorii"
  ON categorii FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update categorii"
  ON categorii FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete categorii"
  ON categorii FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert vehicule"
  ON vehicule FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update vehicule"
  ON vehicule FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete vehicule"
  ON vehicule FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert acoperiri"
  ON acoperiri FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update acoperiri"
  ON acoperiri FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete acoperiri"
  ON acoperiri FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert optiuni_extra"
  ON optiuni_extra FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update optiuni_extra"
  ON optiuni_extra FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete optiuni_extra"
  ON optiuni_extra FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert materiale_print"
  ON materiale_print FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update materiale_print"
  ON materiale_print FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete materiale_print"
  ON materiale_print FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert materiale_laminare"
  ON materiale_laminare FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update materiale_laminare"
  ON materiale_laminare FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete materiale_laminare"
  ON materiale_laminare FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert setari_print_alb"
  ON setari_print_alb FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update setari_print_alb"
  ON setari_print_alb FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete setari_print_alb"
  ON setari_print_alb FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can insert fisiere"
  ON fisiere FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update fisiere"
  ON fisiere FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete fisiere"
  ON fisiere FOR DELETE
  TO public
  USING (true);

-- Insert initial data with proper UUIDs
DO $$
DECLARE
    cat1_id uuid := gen_random_uuid();
    cat2_id uuid := gen_random_uuid();
    cat3_id uuid := gen_random_uuid();
    cat4_id uuid := gen_random_uuid();
    cat5_id uuid := gen_random_uuid();
    
    veh1_id uuid := gen_random_uuid();
    veh2_id uuid := gen_random_uuid();
    veh3_id uuid := gen_random_uuid();
    veh4_id uuid := gen_random_uuid();
    veh5_id uuid := gen_random_uuid();
    veh6_id uuid := gen_random_uuid();
    veh7_id uuid := gen_random_uuid();
    veh8_id uuid := gen_random_uuid();
BEGIN
    -- Insert categories
    INSERT INTO categorii (id, nume) VALUES
        (cat1_id, 'ATV'),
        (cat2_id, 'SSV'),
        (cat3_id, 'Motocicletă'),
        (cat4_id, 'Quad'),
        (cat5_id, 'Enduro');

    -- Insert materials
    INSERT INTO materiale_print (nume, tip_calcul, valoare, permite_print_alb) VALUES
        ('Folie Cast Premium', 'procentual', 45, true),
        ('Folie Calendered', 'procentual', 25, false),
        ('Folie Carbon 3D', 'procentual', 65, true);

    INSERT INTO materiale_laminare (nume, tip_calcul, valoare) VALUES
        ('Laminare Standard', 'procentual', 15),
        ('Laminare Premium', 'procentual', 20),
        ('Laminare Anti-Scratch', 'procentual', 25);

    INSERT INTO setari_print_alb (tip_calcul, valoare) VALUES
        ('procentual', 35);

    -- Insert vehicles
    INSERT INTO vehicule (id, producator, model, categorie_id, perioada_fabricatie) VALUES
        (veh1_id, 'Honda', 'CRF450R', cat3_id, '2021-2024'),
        (veh2_id, 'Yamaha', 'YFZ450R', cat1_id, '2020-2023'),
        (veh3_id, 'Can-Am', 'Maverick X3', cat2_id, '2022-2024'),
        (veh4_id, 'Kawasaki', 'KFX450R', cat1_id, '2019-2022'),
        (veh5_id, 'Polaris', 'RZR XP 1000', cat2_id, '2021-2023'),
        (veh6_id, 'Arctic Cat', 'Wildcat XX', cat2_id, '2020-2024'),
        (veh7_id, 'KTM', 'EXC-F 450', cat3_id, '2023-2024'),
        (veh8_id, 'Suzuki', 'LTR450', cat1_id, '2018-2021');

    -- Insert coverage options
    INSERT INTO acoperiri (vehicul_id, nume, pret) VALUES
        (veh1_id, 'Grafică Completă', 800),
        (veh1_id, 'Kit Stickere', 350),
        (veh2_id, 'Grafică Completă', 1200),
        (veh3_id, 'Grafică Parțială', 1800),
        (veh3_id, 'Grafică Plafon & Uși', 950),
        (veh4_id, 'Kit Stickere', 1100),
        (veh5_id, 'Grafică Completă', 1500),
        (veh6_id, 'Grafică Personalizată', 1650),
        (veh7_id, 'Grafică Completă', 750),
        (veh8_id, 'Grafică Parțială', 950);

    -- Insert extra options
    INSERT INTO optiuni_extra (vehicul_id, nume, pret) VALUES
        (veh1_id, 'Grafica Aripa', 150),
        (veh1_id, 'Grafica Furca', 100),
        (veh2_id, 'Kit Stickere Jante', 250),
        (veh2_id, 'Protectii Maini', 200),
        (veh3_id, 'Grafica Plafon', 350),
        (veh3_id, 'Grafica Usi', 300),
        (veh4_id, 'Bumper Sticker', 120),
        (veh5_id, 'Stickere Suspensii', 280),
        (veh5_id, 'Grafica Capota', 220),
        (veh6_id, 'Kit Racing Numbers', 180),
        (veh7_id, 'Protectii Radiator', 130),
        (veh7_id, 'Husa Sa', 200),
        (veh8_id, 'Kit Numar Concurs', 100);
END $$;
/*
  # Add CFMOTO Models

  1. New Tables
    - Add ATV/UTV category if not exists
    - Add all CFMOTO models with production periods

  2. Models Added
    - ATV models: CForce series, ZForce series, UForce series
    - Side-by-side UTVs: ZForce, UForce series
    - Sport ATVs: TerraLander, CForce Sport series
    - Utility ATVs: CForce, UForce utility series

  3. Production periods included for accurate model identification
*/

-- Create ATV/UTV category if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM categorii WHERE nume = 'ATV/UTV'
  ) THEN
    INSERT INTO categorii (nume) VALUES ('ATV/UTV');
  END IF;
END $$;

-- Get the category ID for ATV/UTV
DO $$
DECLARE
  category_id uuid;
BEGIN
  SELECT id INTO category_id FROM categorii WHERE nume = 'ATV/UTV' LIMIT 1;
  
  -- Insert CFMOTO ATV models
  INSERT INTO vehicule (producator, model, categorie_id, perioada_fabricatie) VALUES
  
  -- CForce Series (Sport/Utility ATVs)
  ('CFMOTO', 'CForce 400', category_id, '2020-2024'),
  ('CFMOTO', 'CForce 500', category_id, '2019-2024'),
  ('CFMOTO', 'CForce 600', category_id, '2018-2024'),
  ('CFMOTO', 'CForce 800', category_id, '2019-2024'),
  ('CFMOTO', 'CForce 1000', category_id, '2020-2024'),
  ('CFMOTO', 'CForce 450', category_id, '2021-2024'),
  ('CFMOTO', 'CForce 520', category_id, '2022-2024'),
  ('CFMOTO', 'CForce 625', category_id, '2023-2024'),
  
  -- ZForce Series (Side-by-Side UTVs)
  ('CFMOTO', 'ZForce 500', category_id, '2018-2024'),
  ('CFMOTO', 'ZForce 800', category_id, '2019-2024'),
  ('CFMOTO', 'ZForce 950', category_id, '2020-2024'),
  ('CFMOTO', 'ZForce 1000', category_id, '2021-2024'),
  ('CFMOTO', 'ZForce 600', category_id, '2022-2024'),
  ('CFMOTO', 'ZForce 800 EX', category_id, '2023-2024'),
  ('CFMOTO', 'ZForce 950 Sport', category_id, '2023-2024'),
  
  -- UForce Series (Utility UTVs)
  ('CFMOTO', 'UForce 500', category_id, '2019-2024'),
  ('CFMOTO', 'UForce 600', category_id, '2020-2024'),
  ('CFMOTO', 'UForce 800', category_id, '2021-2024'),
  ('CFMOTO', 'UForce 1000', category_id, '2022-2024'),
  ('CFMOTO', 'UForce 450', category_id, '2023-2024'),
  
  -- TerraLander Series (Recreational ATVs)
  ('CFMOTO', 'TerraLander 400', category_id, '2018-2024'),
  ('CFMOTO', 'TerraLander 500', category_id, '2019-2024'),
  ('CFMOTO', 'TerraLander 600', category_id, '2020-2024'),
  ('CFMOTO', 'TerraLander 800', category_id, '2021-2024'),
  
  -- X Series (Performance ATVs)
  ('CFMOTO', 'X5 500', category_id, '2020-2024'),
  ('CFMOTO', 'X6 600', category_id, '2021-2024'),
  ('CFMOTO', 'X8 800', category_id, '2022-2024'),
  ('CFMOTO', 'X10 1000', category_id, '2023-2024'),
  
  -- Older Models (Still in production or recently discontinued)
  ('CFMOTO', 'CF400AU', category_id, '2016-2020'),
  ('CFMOTO', 'CF500AU', category_id, '2017-2021'),
  ('CFMOTO', 'CF600AU', category_id, '2018-2022'),
  ('CFMOTO', 'CF800AU', category_id, '2019-2023'),
  
  -- Special Editions and Variants
  ('CFMOTO', 'CForce 600 Touring', category_id, '2020-2024'),
  ('CFMOTO', 'CForce 800 XC', category_id, '2021-2024'),
  ('CFMOTO', 'ZForce 950 H.O.', category_id, '2022-2024'),
  ('CFMOTO', 'UForce 1000 XL', category_id, '2023-2024'),
  
  -- Youth Models
  ('CFMOTO', 'CForce 110', category_id, '2019-2024'),
  ('CFMOTO', 'CForce 125', category_id, '2020-2024'),
  ('CFMOTO', 'ZForce 110', category_id, '2021-2024');
  
END $$;
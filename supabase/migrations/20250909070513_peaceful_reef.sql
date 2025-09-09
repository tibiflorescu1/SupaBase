/*
  # Add link_fisier columns to acoperiri and optiuni_extra tables

  1. Changes
    - Add `link_fisier` column to `acoperiri` table (text, nullable)
    - Add `link_fisier` column to `optiuni_extra` table (text, nullable)
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add link_fisier column to acoperiri table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'acoperiri' AND column_name = 'link_fisier'
  ) THEN
    ALTER TABLE acoperiri ADD COLUMN link_fisier text;
  END IF;
END $$;

-- Add link_fisier column to optiuni_extra table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'optiuni_extra' AND column_name = 'link_fisier'
  ) THEN
    ALTER TABLE optiuni_extra ADD COLUMN link_fisier text;
  END IF;
END $$;
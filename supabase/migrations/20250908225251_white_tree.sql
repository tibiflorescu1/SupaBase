/*
  # Add vehicle images support

  1. Changes
    - Add `imagine` column to `vehicule` table to store image URLs
    - Column is optional (nullable) to maintain compatibility with existing data

  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicule' AND column_name = 'imagine'
  ) THEN
    ALTER TABLE vehicule ADD COLUMN imagine text;
  END IF;
END $$;
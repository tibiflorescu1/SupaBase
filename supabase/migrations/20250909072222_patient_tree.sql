/*
  # Add Google Drive Links Support

  1. New Columns
    - Add `link_fisier` column to `acoperiri` table
    - Add `link_fisier` column to `optiuni_extra` table
  
  2. Changes
    - Both columns are TEXT type to store Google Drive URLs
    - Columns are nullable (optional)
    - Safe migration with IF NOT EXISTS checks
*/

-- Add link_fisier column to acoperiri table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'acoperiri' AND column_name = 'link_fisier'
  ) THEN
    ALTER TABLE acoperiri ADD COLUMN link_fisier TEXT;
  END IF;
END $$;

-- Add link_fisier column to optiuni_extra table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'optiuni_extra' AND column_name = 'link_fisier'
  ) THEN
    ALTER TABLE optiuni_extra ADD COLUMN link_fisier TEXT;
  END IF;
END $$;
/*
  # Add link_fisier column to acoperiri and optiuni_extra tables

  1. Changes
    - Add `link_fisier` column to `acoperiri` table
    - Add `link_fisier` column to `optiuni_extra` table
    
  2. Purpose
    - Allow storing Google Drive links for coverage and extra options
    - Support both file uploads and external links
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
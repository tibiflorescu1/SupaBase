/*
  # Add link_fisier column to acoperiri and optiuni_extra tables

  1. Changes
    - Add `link_fisier` column to `acoperiri` table for storing Google Drive links
    - Add `link_fisier` column to `optiuni_extra` table for storing Google Drive links
    
  2. Security
    - Columns allow NULL values (optional links)
    - Text type for storing URLs
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
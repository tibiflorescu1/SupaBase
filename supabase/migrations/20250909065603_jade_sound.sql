/*
  # Add Google Drive links support

  1. New Columns
    - Add `link_fisier` column to `acoperiri` table
    - Add `link_fisier` column to `optiuni_extra` table
  
  2. Changes
    - Allow storing Google Drive links alongside or instead of uploaded files
    - Both `fisier_id` and `link_fisier` can be null (optional)
    - `link_fisier` stores the Google Drive sharing URL
*/

-- Add link_fisier column to acoperiri table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'acoperiri' AND column_name = 'link_fisier'
  ) THEN
    ALTER TABLE acoperiri ADD COLUMN link_fisier text;
  END IF;
END $$;

-- Add link_fisier column to optiuni_extra table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'optiuni_extra' AND column_name = 'link_fisier'
  ) THEN
    ALTER TABLE optiuni_extra ADD COLUMN link_fisier text;
  END IF;
END $$;
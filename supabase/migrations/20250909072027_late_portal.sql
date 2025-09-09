/*
  # Add Google Drive link support

  1. New Columns
    - `acoperiri.link_fisier` (text) - Google Drive link for coverage files
    - `optiuni_extra.link_fisier` (text) - Google Drive link for extra option files
  
  2. Changes
    - Add nullable text columns to store Google Drive sharing links
    - Allow users to attach Google Drive files to coverage and extra options
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
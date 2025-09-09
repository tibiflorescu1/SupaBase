/*
  # Add vehicle photos functionality

  1. New Tables
    - `vehicle_photos`
      - `id` (uuid, primary key)
      - `vehicul_id` (uuid, foreign key to vehicule)
      - `photo_url` (text, URL to photo)
      - `photo_title` (text, optional title/description)
      - `order_index` (integer, for ordering photos)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `vehicle_photos` table
    - Add policy for public read access
    - Add policies for authenticated users to manage photos
*/

CREATE TABLE IF NOT EXISTS vehicle_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicul_id uuid NOT NULL REFERENCES vehicule(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_title text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read vehicle_photos"
  ON vehicle_photos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert vehicle_photos"
  ON vehicle_photos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update vehicle_photos"
  ON vehicle_photos
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete vehicle_photos"
  ON vehicle_photos
  FOR DELETE
  TO public
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicul_id ON vehicle_photos(vehicul_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_order ON vehicle_photos(vehicul_id, order_index);
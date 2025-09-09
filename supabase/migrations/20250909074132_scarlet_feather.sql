/*
  # Update categorii read policy

  1. Security Changes
    - Drop existing "Public can read categorii" policy if it exists
    - Create new "Public can read categorii" policy with SELECT permissions
    - Ensures public read access to categories table

  2. Policy Details
    - Policy name: "Public can read categorii"
    - Operation: SELECT (read only)
    - Access: Public (using true condition)
*/

-- Sterge politica veche DOAR DACA EXISTA
DROP POLICY IF EXISTS "Public can read categorii" ON public.categorii;

-- Creeaza politica noua
CREATE POLICY "Public can read categorii"
ON public.categorii
FOR SELECT
USING (true);
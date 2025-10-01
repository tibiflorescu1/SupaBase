/*
  # Allow Anonymous Access (Temporary Fix)
  
  1. Purpose
    - Allow anonymous access to all tables temporarily
    - This bypasses authentication issues caused by expired JWT
    
  2. Changes
    - Add anon policies to all tables for read/write access
    
  3. Security Note
    - This is a temporary fix for development
    - Should be removed in production
*/

-- Allow anonymous read access to all tables
CREATE POLICY "Allow anon read categorii" ON categorii FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read vehicule" ON vehicule FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read acoperiri" ON acoperiri FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read optiuni_extra" ON optiuni_extra FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read materiale_print" ON materiale_print FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read materiale_laminare" ON materiale_laminare FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read setari_print_alb" ON setari_print_alb FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read fisiere" ON fisiere FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read user_profiles" ON user_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read role_permissions" ON role_permissions FOR SELECT TO anon USING (true);

-- Allow anonymous write access (insert, update, delete)
CREATE POLICY "Allow anon insert categorii" ON categorii FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update categorii" ON categorii FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete categorii" ON categorii FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert vehicule" ON vehicule FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update vehicule" ON vehicule FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete vehicule" ON vehicule FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert acoperiri" ON acoperiri FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update acoperiri" ON acoperiri FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete acoperiri" ON acoperiri FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert optiuni_extra" ON optiuni_extra FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update optiuni_extra" ON optiuni_extra FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete optiuni_extra" ON optiuni_extra FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert materiale_print" ON materiale_print FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update materiale_print" ON materiale_print FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete materiale_print" ON materiale_print FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert materiale_laminare" ON materiale_laminare FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update materiale_laminare" ON materiale_laminare FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete materiale_laminare" ON materiale_laminare FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert setari_print_alb" ON setari_print_alb FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update setari_print_alb" ON setari_print_alb FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete setari_print_alb" ON setari_print_alb FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert fisiere" ON fisiere FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update fisiere" ON fisiere FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete fisiere" ON fisiere FOR DELETE TO anon USING (true);
/*
  # Actualizare politică RLS pentru categorii

  1. Modificări
    - Șterge politica veche "Public can read categorii" (dacă există)
    - Creează politica nouă cu același nume
    
  2. Securitate
    - Menține accesul de citire pentru toți utilizatorii
    - Folosește DROP POLICY IF EXISTS pentru a evita erorile
*/

-- Sterge politica veche, dar nu da eroare daca nu exista
DROP POLICY IF EXISTS "Public can read categorii" ON categorii;

-- Acum creeaza politica. Aceasta comanda va rula mereu cu succes.
CREATE POLICY "Public can read categorii" ON categorii
FOR SELECT USING (true);
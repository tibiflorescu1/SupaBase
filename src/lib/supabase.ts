import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL environment variable');
}
if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

// Database types  
export interface DatabaseCategorie {
  id: string;
  nume: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseVehicul {
  id: string;
  producator: string;
  model: string;
  categorie_id: string;
  perioada_fabricatie: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseAcoperire {
  id: string;
  vehicul_id: string;
  nume: string;
  pret: number;
  fisier_id?: string;
  link_fisier?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseOptiuneExtra {
  id: string;
  vehicul_id: string;
  nume: string;
  pret: number;
  fisier_id?: string;
  link_fisier?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseMaterialPrint {
  id: string;
  nume: string;
  tip_calcul: 'procentual' | 'suma_fixa';
  valoare: number;
  permite_print_alb: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseMaterialLaminare {
  id: string;
  nume: string;
  tip_calcul: 'procentual' | 'suma_fixa';
  valoare: number;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSetariPrintAlb {
  id: string;
  tip_calcul: 'procentual' | 'suma_fixa';
  valoare: number;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseFisier {
  id: string;
  nume: string;
  data_url: string;
  created_at?: string;
}
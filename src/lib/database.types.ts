export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      acoperiri: {
        Row: {
          id: string
          vehicul_id: string | null
          nume: string
          pret: number
          fisier_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vehicul_id?: string | null
          nume: string
          pret?: number
          fisier_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vehicul_id?: string | null
          nume?: string
          pret?: number
          fisier_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      categorii: {
        Row: {
          id: string
          nume: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nume: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nume?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      fisiere: {
        Row: {
          id: string
          nume: string
          data_url: string
          created_at: string | null
        }
        Insert: {
          id?: string
          nume: string
          data_url: string
          created_at?: string | null
        }
        Update: {
          id?: string
          nume?: string
          data_url?: string
          created_at?: string | null
        }
      }
      materiale_laminare: {
        Row: {
          id: string
          nume: string
          tip_calcul: string
          valoare: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nume: string
          tip_calcul: string
          valoare?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nume?: string
          tip_calcul?: string
          valoare?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      materiale_print: {
        Row: {
          id: string
          nume: string
          tip_calcul: string
          valoare: number
          permite_print_alb: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nume: string
          tip_calcul: string
          valoare?: number
          permite_print_alb?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nume?: string
          tip_calcul?: string
          valoare?: number
          permite_print_alb?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      optiuni_extra: {
        Row: {
          id: string
          vehicul_id: string | null
          nume: string
          pret: number
          fisier_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vehicul_id?: string | null
          nume: string
          pret?: number
          fisier_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vehicul_id?: string | null
          nume?: string
          pret?: number
          fisier_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      setari_print_alb: {
        Row: {
          id: string
          tip_calcul: string
          valoare: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tip_calcul: string
          valoare?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tip_calcul?: string
          valoare?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vehicule: {
        Row: {
          id: string
          producator: string
          model: string
          categorie_id: string | null
          perioada_fabricatie: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          producator: string
          model: string
          categorie_id?: string | null
          perioada_fabricatie?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          producator?: string
          model?: string
          categorie_id?: string | null
          perioada_fabricatie?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
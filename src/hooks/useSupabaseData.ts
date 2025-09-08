import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  DatabaseCategorie, 
  DatabaseVehicul, 
  DatabaseAcoperire, 
  DatabaseOptiuneExtra,
  DatabaseMaterialPrint,
  DatabaseMaterialLaminare,
  DatabaseSetariPrintAlb,
  DatabaseFisier
} from '../lib/supabase';

// Transform database types to app types
export interface Fisier {
  nume: string;
  dataUrl: string;
}

export interface Categorie {
  id: string;
  nume: string;
}

export interface OptiuneExtra {
  id: string;
  nume: string;
  pret: number;
  fisier?: Fisier;
}

export interface Acoperire {
  id: string;
  nume: string;
  pret: number;
  fisier?: Fisier;
}

export interface Vehicul {
  id: string;
  producator: string;
  model: string;
  categorieId: string;
  perioadaFabricatie: string;
  acoperiri: Acoperire[];
  optiuniExtra: OptiuneExtra[];
}

export interface MaterialPrint {
  id: string;
  nume: string;
  tipCalcul: 'procentual' | 'suma_fixa';
  valoare: number;
  permitePrintAlb: boolean;
}

export interface MaterialLaminare {
  id: string;
  nume: string;
  tipCalcul: 'procentual' | 'suma_fixa';
  valoare: number;
}

export interface SetariPrintAlb {
  tipCalcul: 'procentual' | 'suma_fixa';
  valoare: number;
}

export interface AppData {
  vehicule: Vehicul[];
  categorii: Categorie[];
  materialePrint: MaterialPrint[];
  materialeLaminare: MaterialLaminare[];
  setariPrintAlb: SetariPrintAlb;
}

export function useSupabaseData() {
  const [data, setData] = useState<AppData>({
    vehicule: [],
    categorii: [],
    materialePrint: [],
    materialeLaminare: [],
    setariPrintAlb: { tipCalcul: 'procentual', valoare: 35 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform database data to app format
  const transformData = async (
    categorii: DatabaseCategorie[],
    vehicule: DatabaseVehicul[],
    acoperiri: DatabaseAcoperire[],
    optiuni: DatabaseOptiuneExtra[],
    materialePrint: DatabaseMaterialPrint[],
    materialeLaminare: DatabaseMaterialLaminare[],
    setariPrintAlb: DatabaseSetariPrintAlb[],
    fisiere: DatabaseFisier[]
  ): Promise<AppData> => {
    // Create file lookup
    const fileMap = new Map<string, Fisier>();
    fisiere.forEach(f => {
      fileMap.set(f.id, { nume: f.nume, dataUrl: f.data_url });
    });

    // Transform categories
    const transformedCategorii: Categorie[] = categorii.map(c => ({
      id: c.id,
      nume: c.nume
    }));

    // Transform vehicles with their coverage and extra options
    const transformedVehicule: Vehicul[] = vehicule.map(v => {
      const vehiculAcoperiri = acoperiri
        .filter(a => a.vehicul_id === v.id)
        .map(a => ({
          id: a.id,
          nume: a.nume,
          pret: Number(a.pret),
          fisier: a.fisier_id ? fileMap.get(a.fisier_id) : undefined
        }));

      const vehiculOptiuni = optiuni
        .filter(o => o.vehicul_id === v.id)
        .map(o => ({
          id: o.id,
          nume: o.nume,
          pret: Number(o.pret),
          fisier: o.fisier_id ? fileMap.get(o.fisier_id) : undefined
        }));

      return {
        id: v.id,
        producator: v.producator,
        model: v.model,
        categorieId: v.categorie_id,
        perioadaFabricatie: v.perioada_fabricatie,
        acoperiri: vehiculAcoperiri,
        optiuniExtra: vehiculOptiuni
      };
    });

    // Transform print materials
    const transformedMaterialePrint: MaterialPrint[] = materialePrint.map(m => ({
      id: m.id,
      nume: m.nume,
      tipCalcul: m.tip_calcul,
      valoare: Number(m.valoare),
      permitePrintAlb: m.permite_print_alb
    }));

    // Transform lamination materials
    const transformedMaterialeLaminare: MaterialLaminare[] = materialeLaminare.map(m => ({
      id: m.id,
      nume: m.nume,
      tipCalcul: m.tip_calcul,
      valoare: Number(m.valoare)
    }));

    // Transform white print settings
    const transformedSetariPrintAlb: SetariPrintAlb = setariPrintAlb.length > 0 
      ? {
          tipCalcul: setariPrintAlb[0].tip_calcul,
          valoare: Number(setariPrintAlb[0].valoare)
        }
      : { tipCalcul: 'procentual', valoare: 35 };

    return {
      vehicule: transformedVehicule,
      categorii: transformedCategorii,
      materialePrint: transformedMaterialePrint,
      materialeLaminare: transformedMaterialeLaminare,
      setariPrintAlb: transformedSetariPrintAlb
    };
  };

  // Load data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        { data: categorii, error: categoriiError },
        { data: vehicule, error: vehiculeError },
        { data: acoperiri, error: acopeririError },
        { data: optiuni, error: optiuniError },
        { data: materialePrint, error: materialePrintError },
        { data: materialeLaminare, error: materialeLaminareError },
        { data: setariPrintAlb, error: setariPrintAlbError },
        { data: fisiere, error: fisiereError }
      ] = await Promise.all([
        supabase.from('categorii').select('*'),
        supabase.from('vehicule').select('*'),
        supabase.from('acoperiri').select('*'),
        supabase.from('optiuni_extra').select('*'),
        supabase.from('materiale_print').select('*'),
        supabase.from('materiale_laminare').select('*'),
        supabase.from('setari_print_alb').select('*'),
        supabase.from('fisiere').select('*')
      ]);

      // Check for errors
      const errors = [
        categoriiError, vehiculeError, acopeririError, optiuniError,
        materialePrintError, materialeLaminareError, setariPrintAlbError, fisiereError
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e?.message).join(', ')}`);
      }

      // Transform and set data
      const transformedData = await transformData(
        categorii || [],
        vehicule || [],
        acoperiri || [],
        optiuni || [],
        materialePrint || [],
        materialeLaminare || [],
        setariPrintAlb || [],
        fisiere || []
      );

      setData(transformedData);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Save functions for updating data
  const saveCategorie = async (categorie: Omit<Categorie, 'id'> & { id?: string }) => {
    try {
      if (categorie.id) {
        // Update existing
        const { error } = await supabase
          .from('categorii')
          .update({ nume: categorie.nume, updated_at: new Date().toISOString() })
          .eq('id', categorie.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('categorii')
          .insert({ nume: categorie.nume });
        if (error) throw error;
      }
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error saving category:', err);
      throw err;
    }
  };

  const deleteCategorie = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorii')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const saveVehicul = async (vehicul: Omit<Vehicul, 'id' | 'acoperiri' | 'optiuniExtra'> & { id?: string }) => {
    try {
      const dbVehicul = {
        producator: vehicul.producator,
        model: vehicul.model,
        categorie_id: vehicul.categorieId,
        perioada_fabricatie: vehicul.perioadaFabricatie,
        updated_at: new Date().toISOString()
      };

      if (vehicul.id) {
        // Update existing
        const { error } = await supabase
          .from('vehicule')
          .update(dbVehicul)
          .eq('id', vehicul.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('vehicule')
          .insert(dbVehicul);
        if (error) throw error;
      }
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error saving vehicle:', err);
      throw err;
    }
  };

  const deleteVehicul = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicule')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      throw err;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: loadData,
    saveCategorie,
    deleteCategorie,
    saveVehicul,
    deleteVehicul
  };
}
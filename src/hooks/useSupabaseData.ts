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
  linkFisier?: string;
}

export interface Acoperire {
  id: string;
  nume: string;
  pret: number;
  fisier?: Fisier;
  linkFisier?: string;
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

    console.log('Files loaded:', fisiere.length);
    console.log('File map:', fileMap);
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
          fisier: a.fisier_id ? fileMap.get(a.fisier_id) : undefined,
          linkFisier: a.link_fisier || undefined
        }));

      console.log(`Vehicle ${v.producator} ${v.model} (${v.id.substring(0, 8)}) acoperiri:`, vehiculAcoperiri);
      const vehiculOptiuni = optiuni
        .filter(o => o.vehicul_id === v.id)
        .map(o => ({
          id: o.id,
          nume: o.nume,
          pret: Number(o.pret),
          fisier: o.fisier_id ? fileMap.get(o.fisier_id) : undefined,
          linkFisier: o.link_fisier || undefined
        }));

      console.log(`Vehicle ${v.producator} ${v.model} (${v.id.substring(0, 8)}) optiuni:`, vehiculOptiuni);
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
      // Check if Supabase is configured
      if (!supabase) {
        console.error('Supabase not configured - missing environment variables');
        setError('Configurare Supabase lipsește. Verifică variabilele de mediu.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading data from Supabase...');

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

      // Debug logging
      console.log('📊 Raw data from database:');
      console.log('- Categorii:', categorii?.length || 0);
      console.log('- Categorii data:', categorii);
      console.log('- Categorii error:', categoriiError);
      console.log('- Vehicule:', vehicule?.length || 0);
      console.log('- Acoperiri:', acoperiri?.length || 0);
      console.log('- Optiuni:', optiuni?.length || 0);
      console.log('- Materiale print:', materialePrint?.length || 0);
      console.log('- Materiale laminare:', materialeLaminare?.length || 0);
      console.log('- Setari print alb:', setariPrintAlb?.length || 0);
      console.log('- Fisiere:', fisiere?.length || 0);

      // Debug specific categories issues
      if (categoriiError) {
        console.error('❌ Categories error details:', categoriiError);
      }
      if (!categorii || categorii.length === 0) {
        console.warn('⚠️ No categories found - checking permissions');
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

      console.log('✅ Transformed data:');
      console.log('- Final vehicule count:', transformedData.vehicule.length);
      console.log('- Categorii count:', transformedData.categorii.length);
      
      // Check for duplicates
      const vehiculeMap = new Map();
      const duplicates = [];
      transformedData.vehicule.forEach(v => {
        const key = `${v.producator}_${v.model}`;
        if (vehiculeMap.has(key)) {
          duplicates.push({
            key,
            existing: vehiculeMap.get(key),
            duplicate: v
          });
        } else {
          vehiculeMap.set(key, v);
        }
      });
      
      if (duplicates.length > 0) {
        console.warn('⚠️ Found duplicate vehicles:', duplicates);
      }
      
      console.log('🎯 Unique vehicles by name:', vehiculeMap.size);
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
        categorie_id: vehicul.categorieId || null,
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
      // Nu mai facem loadData() automat - doar la cerere
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
      // Nu mai facem loadData() automat - doar la cerere
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      throw err;
    }
  };

  const saveAcoperire = async (acoperire: Omit<Acoperire, 'id'> & { id?: string, vehicul_id: string }, file?: File, shouldRefetch: boolean = true) => {
    try {
        let fisier_id = null;
        let dataUrl = '';
        
        // Handle file upload if present
        if (file || (acoperire as any).file) {
            const fileToUpload = file || (acoperire as any).file;
            const reader = new FileReader();
            dataUrl = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(fileToUpload);
            });
            
            const { data: fileData, error: fileError } = await supabase
                .from('fisiere')
                .insert({ nume: fileToUpload.name, data_url: dataUrl })
                .select()
                .single();
            
            if (fileError) throw fileError;
            fisier_id = fileData.id;
        }
        

        const dbAcoperire = {
            nume: acoperire.nume,
            pret: acoperire.pret,
            vehicul_id: acoperire.vehicul_id,
            fisier_id: fisier_id,
            updated_at: new Date().toISOString()
        };

        // Add link_fisier if it exists and the column is available
        if (acoperire.linkFisier) {
            (dbAcoperire as any).link_fisier = acoperire.linkFisier;
        } else if (acoperire.linkFisier === '') {
            // Explicitly set to null when empty string is provided
            (dbAcoperire as any).link_fisier = null;
        }

        let savedAcoperire;
        if (acoperire.id) {
            try {
                const { data, error } = await supabase.from('acoperiri').update(dbAcoperire).eq('id', acoperire.id).select().single();
                if (error) throw error;
                savedAcoperire = data;
            } catch (error: any) {
                // If link_fisier column doesn't exist, retry without it
                if (error.message?.includes('link_fisier')) {
                    const dbAcoperireWithoutLink = {
                        nume: acoperire.nume,
                        pret: acoperire.pret,
                        vehicul_id: acoperire.vehicul_id,
                        fisier_id: fisier_id,
                        updated_at: new Date().toISOString()
                    };
                    const { data, error: retryError } = await supabase.from('acoperiri').update(dbAcoperireWithoutLink).eq('id', acoperire.id).select().single();
                    if (retryError) throw retryError;
                    savedAcoperire = data;
                    console.warn('Saved without link_fisier - database column missing');
                } else {
                    throw error;
                }
            }
        } else {
            try {
                const { data, error } = await supabase.from('acoperiri').insert(dbAcoperire).select().single();
                if (error) throw error;
                savedAcoperire = data;
            } catch (error: any) {
                // If link_fisier column doesn't exist, retry without it
                if (error.message?.includes('link_fisier')) {
                    const dbAcoperireWithoutLink = {
                        nume: acoperire.nume,
                        pret: acoperire.pret,
                        vehicul_id: acoperire.vehicul_id,
                        fisier_id: fisier_id,
                        updated_at: new Date().toISOString()
                    };
                    const { data, error: retryError } = await supabase.from('acoperiri').insert(dbAcoperireWithoutLink).select().single();
                    if (retryError) throw retryError;
                    savedAcoperire = data;
                    console.warn('Saved without link_fisier - database column missing');
                } else {
                    throw error;
                }
            }
        }
        
        // Return the saved acoperire with real database ID
        return savedAcoperire;
    } catch (err) {
        console.error('Error saving coverage:', err);
        throw err;
    }
  };

  const deleteAcoperire = async (id: string) => {
      try {
          const { error } = await supabase.from('acoperiri').delete().eq('id', id);
          if (error) throw error;
      } catch (err) {
          console.error('Error deleting coverage:', err);
          throw err;
      }
  };

  const saveOptiuneExtra = async (optiune: Omit<OptiuneExtra, 'id'> & { id?: string, vehicul_id: string }, file?: File, shouldRefetch: boolean = true) => {
    try {
        let fisier_id = null;
        let dataUrl = '';
        
        // Handle file upload if present
        if (file || (optiune as any).file) {
            const fileToUpload = file || (optiune as any).file;
            const reader = new FileReader();
            dataUrl = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(fileToUpload);
            });
            
            const { data: fileData, error: fileError } = await supabase
                .from('fisiere')
                .insert({ nume: fileToUpload.name, data_url: dataUrl })
                .select()
                .single();
            
            if (fileError) throw fileError;
            fisier_id = fileData.id;
        }
        

        const dbOptiune = {
            nume: optiune.nume,
            pret: optiune.pret,
            vehicul_id: optiune.vehicul_id,
            fisier_id: fisier_id,
            updated_at: new Date().toISOString()
        };

        // Add link_fisier if it exists and the column is available
        if (optiune.linkFisier) {
            (dbOptiune as any).link_fisier = optiune.linkFisier;
        } else if (optiune.linkFisier === '') {
            // Explicitly set to null when empty string is provided
            (dbOptiune as any).link_fisier = null;
        }

        let savedOptiune;
        if (optiune.id) {
            try {
                const { data, error } = await supabase.from('optiuni_extra').update(dbOptiune).eq('id', optiune.id).select().single();
                if (error) throw error;
                savedOptiune = data;
            } catch (error: any) {
                // If link_fisier column doesn't exist, retry without it
                if (error.message?.includes('link_fisier')) {
                    const dbOptiuneWithoutLink = {
                        nume: optiune.nume,
                        pret: optiune.pret,
                        vehicul_id: optiune.vehicul_id,
                        fisier_id: fisier_id,
                        updated_at: new Date().toISOString()
                    };
                    const { data, error: retryError } = await supabase.from('optiuni_extra').update(dbOptiuneWithoutLink).eq('id', optiune.id).select().single();
                    if (retryError) throw retryError;
                    savedOptiune = data;
                    console.warn('Saved without link_fisier - database column missing');
                } else {
                    throw error;
                }
            }
        } else {
            try {
                const { data, error } = await supabase.from('optiuni_extra').insert(dbOptiune).select().single();
                if (error) throw error;
                savedOptiune = data;
            } catch (error: any) {
                // If link_fisier column doesn't exist, retry without it
                if (error.message?.includes('link_fisier')) {
                    const dbOptiuneWithoutLink = {
                        nume: optiune.nume,
                        pret: optiune.pret,
                        vehicul_id: optiune.vehicul_id,
                        fisier_id: fisier_id,
                        updated_at: new Date().toISOString()
                    };
                    const { data, error: retryError } = await supabase.from('optiuni_extra').insert(dbOptiuneWithoutLink).select().single();
                    if (retryError) throw retryError;
                    savedOptiune = data;
                    console.warn('Saved without link_fisier - database column missing');
                } else {
                    throw error;
                }
            }
        }
        
        // Return the saved optiune with real database ID
        return savedOptiune;
    } catch (err) {
        console.error('Error saving extra option:', err);
        throw err;
    }
  };

  const deleteOptiuneExtra = async (id: string) => {
      try {
          const { error } = await supabase.from('optiuni_extra').delete().eq('id', id);
          if (error) throw error;
      } catch (err) {
          console.error('Error deleting extra option:', err);
          throw err;
      }
  };

  const saveMaterialPrint = async (material: Omit<MaterialPrint, 'id'> & { id?: string }) => {
      try {
          const dbMaterial = {
              nume: material.nume,
              tip_calcul: material.tipCalcul,
              valoare: material.valoare,
              permite_print_alb: material.permitePrintAlb,
              updated_at: new Date().toISOString()
          };
          if (material.id) {
              const { error } = await supabase.from('materiale_print').update(dbMaterial).eq('id', material.id);
              if (error) throw error;
          } else {
              const { error } = await supabase.from('materiale_print').insert(dbMaterial);
              if (error) throw error;
          }
          await loadData();
      } catch (err) {
          console.error('Error saving print material:', err);
          throw err;
      }
  };

  const deleteMaterialPrint = async (id: string) => {
      try {
          const { error } = await supabase.from('materiale_print').delete().eq('id', id);
          if (error) throw error;
          await loadData();
      } catch (err) {
          console.error('Error deleting print material:', err);
          throw err;
      }
  };

  const saveMaterialLaminare = async (material: Omit<MaterialLaminare, 'id'> & { id?: string }) => {
      try {
          const dbMaterial = {
              nume: material.nume,
              tip_calcul: material.tipCalcul,
              valoare: material.valoare,
              updated_at: new Date().toISOString()
          };
          if (material.id) {
              const { error } = await supabase.from('materiale_laminare').update(dbMaterial).eq('id', material.id);
              if (error) throw error;
          } else {
              const { error } = await supabase.from('materiale_laminare').insert(dbMaterial);
              if (error) throw error;
          }
          await loadData();
      } catch (err) {
          console.error('Error saving lamination material:', err);
          throw err;
      }
  };

  const deleteMaterialLaminare = async (id: string) => {
      try {
          const { error } = await supabase.from('materiale_laminare').delete().eq('id', id);
          if (error) throw error;
          await loadData();
      } catch (err) {
          console.error('Error deleting lamination material:', err);
          throw err;
      }
  };

  const saveSetariPrintAlb = async (setari: SetariPrintAlb) => {
      try {
          const { data: existing, error: fetchError } = await supabase.from('setari_print_alb').select('id').limit(1);
          if (fetchError) throw fetchError;

          const dbSetari = {
              tip_calcul: setari.tipCalcul,
              valoare: setari.valoare,
              updated_at: new Date().toISOString()
          };

          if (existing && existing.length > 0) {
              const { error } = await supabase.from('setari_print_alb').update(dbSetari).eq('id', existing[0].id);
              if (error) throw error;
          } else {
              const { error } = await supabase.from('setari_print_alb').insert(dbSetari);
              if (error) throw error;
          }
          await loadData();
      } catch (err) {
          console.error('Error saving white print settings:', err);
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
    deleteVehicul,
    saveAcoperire,
    deleteAcoperire,
    saveOptiuneExtra,
    deleteOptiuneExtra,
    saveMaterialPrint,
    deleteMaterialPrint,
    saveMaterialLaminare,
    deleteMaterialLaminare,
    saveSetariPrintAlb
  };
}
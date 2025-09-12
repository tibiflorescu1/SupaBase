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
  const [lastFetch, setLastFetch] = useState(0);

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
    const transformStart = performance.now();
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

    // Create lookup maps for better performance
    const acopeririByVehicle = new Map<string, DatabaseAcoperire[]>();
    const optiuniByVehicle = new Map<string, DatabaseOptiuneExtra[]>();
    
    acoperiri.forEach(a => {
      if (!acopeririByVehicle.has(a.vehicul_id)) {
        acopeririByVehicle.set(a.vehicul_id, []);
      }
      acopeririByVehicle.get(a.vehicul_id)!.push(a);
    });
    
    optiuni.forEach(o => {
      if (!optiuniByVehicle.has(o.vehicul_id)) {
        optiuniByVehicle.set(o.vehicul_id, []);
      }
      optiuniByVehicle.get(o.vehicul_id)!.push(o);
    });

    // Transform vehicles with their coverage and extra options
    const transformedVehicule: Vehicul[] = vehicule.map(v => {
      const vehiculAcoperiri = (acopeririByVehicle.get(v.id) || [])
        .map(a => ({
          id: a.id,
          nume: a.nume,
          pret: Number(a.pret),
          fisier: a.fisier_id ? fileMap.get(a.fisier_id) : undefined,
          linkFisier: a.link_fisier || undefined
        }));

      const vehiculOptiuni = (optiuniByVehicle.get(v.id) || [])
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

    const transformTime = performance.now() - transformStart;
    console.log(`✅ Data transformed in ${transformTime.toFixed(2)}ms`);

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
    // Prevent multiple simultaneous requests
    const now = Date.now();
    if (now - lastFetch < 1000) {
      console.log('⏳ Skipping fetch - too recent');
      return;
    }
    setLastFetch(now);

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting data load from Supabase...');
      const startTime = performance.now();

      // Fetch data in optimized batches
      const [
        basicDataResults,
        vehicleDataResults
      ] = await Promise.all([
        // Basic data (fast)
        Promise.all([
          supabase.from('categorii').select('id, nume').order('nume'),
          supabase.from('materiale_print').select('id, nume, tip_calcul, valoare, permite_print_alb').order('nume'),
          supabase.from('materiale_laminare').select('id, nume, tip_calcul, valoare').order('nume'),
          supabase.from('setari_print_alb').select('id, tip_calcul, valoare').limit(1)
        ]),
        // Vehicle data (potentially slower)
        Promise.all([
          supabase.from('vehicule').select('id, producator, model, categorie_id, perioada_fabricatie').order('producator, model'),
          supabase.from('acoperiri').select('id, vehicul_id, nume, pret, fisier_id, link_fisier').order('vehicul_id, nume'),
          supabase.from('optiuni_extra').select('id, vehicul_id, nume, pret, fisier_id, link_fisier').order('vehicul_id, nume'),
          supabase.from('fisiere').select('id, nume, data_url').limit(500) // Reduced limit
        ])
      ]);

      const [
        { data: categorii, error: categoriiError },
        { data: materialePrint, error: materialePrintError },
        { data: materialeLaminare, error: materialeLaminareError },
        { data: setariPrintAlb, error: setariPrintAlbError }
      ] = basicDataResults;

      const [
        { data: vehicule, error: vehiculeError },
        { data: acoperiri, error: acopeririError },
        { data: optiuni, error: optiuniError },
        { data: fisiere, error: fisiereError }
      ] = vehicleDataResults;

      const loadTime = performance.now() - startTime;
      console.log(`⚡ All data loaded in ${loadTime.toFixed(2)}ms`);

      // Check for errors
      const errors = [
        categoriiError, vehiculeError, acopeririError, optiuniError,
        materialePrintError, materialeLaminareError, setariPrintAlbError, fisiereError
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('❌ Database errors:', errors);
        // Don't show partial errors to user unless critical
        console.warn('Some data may be incomplete due to errors');
      }

      // If we have no data at all, something is wrong
      if (!categorii && !vehicule && !acoperiri && !optiuni && !materialePrint && !materialeLaminare) {
        throw new Error('Nu s-au putut încărca datele din baza de date. Verifică conexiunea.');
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

      console.log(`📊 Loaded: ${transformedData.vehicule.length} vehicule, ${transformedData.categorii.length} categorii`);
      
      setData(transformedData);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      
      // Set minimal data to prevent infinite loading
      setData({
        vehicule: [],
        categorii: [],
        materialePrint: [],
        materialeLaminare: [],
        setariPrintAlb: { tipCalcul: 'procentual', valoare: 35 }
      });
    } finally {
      setLoading(false);
      console.log('✅ Data loading completed');
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
      // Optimistic update instead of full reload
      if (categorie.id) {
        setData(prev => ({
          ...prev,
          categorii: prev.categorii.map(c => 
            c.id === categorie.id ? { ...c, nume: categorie.nume } : c
          )
        }));
      } else {
        // For new categories, we need to reload to get the ID
        setTimeout(() => loadData(), 100);
      }
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
      // Optimistic update
      setData(prev => ({
        ...prev,
        categorii: prev.categorii.filter(c => c.id !== id)
      }));
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
      // Don't auto-reload - only on demand
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
      // Don't auto-reload - only on demand
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
          // Optimistic update
          if (material.id) {
            setData(prev => ({
              ...prev,
              materialePrint: prev.materialePrint.map(m => 
                m.id === material.id ? material as MaterialPrint : m
              )
            }));
          } else {
            setTimeout(() => loadData(), 100);
          }
      } catch (err) {
          console.error('Error saving print material:', err);
          throw err;
      }
  };

  const deleteMaterialPrint = async (id: string) => {
      try {
          const { error } = await supabase.from('materiale_print').delete().eq('id', id);
          if (error) throw error;
          // Optimistic update
          setData(prev => ({
            ...prev,
            materialePrint: prev.materialePrint.filter(m => m.id !== id)
          }));
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
          // Optimistic update
          if (material.id) {
            setData(prev => ({
              ...prev,
              materialeLaminare: prev.materialeLaminare.map(m => 
                m.id === material.id ? material as MaterialLaminare : m
              )
            }));
          } else {
            setTimeout(() => loadData(), 100);
          }
      } catch (err) {
          console.error('Error saving lamination material:', err);
          throw err;
      }
  };

  const deleteMaterialLaminare = async (id: string) => {
      try {
          const { error } = await supabase.from('materiale_laminare').delete().eq('id', id);
          if (error) throw error;
          // Optimistic update
          setData(prev => ({
            ...prev,
            materialeLaminare: prev.materialeLaminare.filter(m => m.id !== id)
          }));
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
          // Optimistic update
          setData(prev => ({
            ...prev,
            setariPrintAlb: setari
          }));
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
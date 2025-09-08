import React, { useState } from 'react';
import { Eye, Settings2, Edit3, Trash2, Plus, Download, Upload, X, FileDown, FileUp } from 'lucide-react';
import { AppData, Vehicul, Categorie, Acoperire, OptiuneExtra, Fisier } from '../hooks/useSupabaseData';
import Papa from 'papaparse';

interface ModelsTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Partial<Vehicul>) => Promise<void>;
  onDeleteVehicul: (id: string) => Promise<void>;
  onSaveAcoperire: (acoperire: Partial<Acoperire>, file?: File) => Promise<void>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Partial<OptiuneExtra>, file?: File) => Promise<void>;
  onDeleteOptiuneExtra: (id: string) => Promise<void>;
  onRefetch: () => void;
}

export default function ModelsTab({ 
  data, 
  onSaveVehicul, 
  onDeleteVehicul, 
  onSaveAcoperire, 
  onDeleteAcoperire, 
  onSaveOptiuneExtra, 
  onDeleteOptiuneExtra, 
  onRefetch 
}: ModelsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducer, setSelectedProducer] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicul | null>(null);
  const [editingDetails, setEditingDetails] = useState<Vehicul | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    producator: '',
    model: '',
    categorieId: '',
    perioadaFabricatie: ''
  });

  const [newAcoperire, setNewAcoperire] = useState({ nume: '', pret: 0 });
  const [newOptiune, setNewOptiune] = useState({ nume: '', pret: 0 });
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [importResults, setImportResults] = useState<{success: number, errors: string[]}>({success: 0, errors: []});
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
        // Auto-trigger import after file is loaded
        setTimeout(() => {
          handleImport(content);
        }, 100);
      };
      reader.readAsText(file);
    }
  };

  const filteredVehicles = data.vehicule.filter(vehicle =>
    vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(vehicle =>
    selectedCategory === '' || vehicle.categorieId === selectedCategory
  ).filter(vehicle =>
    selectedProducer === '' || vehicle.producator === selectedProducer
  );

  // Get unique producers for filter dropdown
  const uniqueProducers = [...new Set(data.vehicule.map(v => v.producator))].sort();

  const getCategoryName = (categoryId: string) => {
    const category = data.categorii.find(cat => cat.id === categoryId);
    return category ? category.nume : 'Necunoscută';
  };

  const downloadFile = (fisier: Fisier) => {
    const link = document.createElement('a');
    link.href = fisier.dataUrl;
    link.download = fisier.nume;
    link.click();
  };

  const handleAddVehicle = async () => {
    try {
      await onSaveVehicul({
        producator: newVehicle.producator,
        model: newVehicle.model,
        categorieId: newVehicle.categorieId,
        perioadaFabricatie: newVehicle.perioadaFabricatie
      });
      
      setNewVehicle({
        producator: '',
        model: '',
        categorieId: '',
        perioadaFabricatie: ''
      });
      setShowAddForm(false);
      onRefetch();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    
    try {
      await onSaveVehicul(editingVehicle);
      setEditingVehicle(null);
      onRefetch();
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest vehicul?')) return;
    
    try {
      await onDeleteVehicul(vehicleId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleAddAcoperire = async (vehicleId: string) => {
    try {
      const result = await onSaveAcoperire({
        ...newAcoperire,
        vehicul_id: vehicleId
      });
      
      // Update local editing state immediately
      if (editingDetails && editingDetails.id === vehicleId) {
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            acoperiri: [...prev.acoperiri, {
              id: result.id, // Use the returned ID from the save function
              nume: newAcoperire.nume,
              pret: newAcoperire.pret
            }]
          };
        });
      }
      
      setNewAcoperire({ nume: '', pret: 0 });
    } catch (error) {
      console.error('Error adding acoperire:', error);
    }
  };

  const handleAddOptiune = async (vehicleId: string) => {
    try {
      const result = await onSaveOptiuneExtra({
        ...newOptiune,
        vehicul_id: vehicleId
      });
      
      // Update local editing state immediately
      if (editingDetails && editingDetails.id === vehicleId) {
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            optiuniExtra: [...prev.optiuniExtra, {
              id: result.id, // Use the returned ID from the save function
              nume: newOptiune.nume,
              pret: newOptiune.pret
            }]
          };
        });
      }
      
      setNewOptiune({ nume: '', pret: 0 });
    } catch (error) {
      console.error('Error adding optiune:', error);
    }
  };

  const handleUpdateAcoperire = async (acoperire: Acoperire, file?: File) => {
    try {
      if (file) {
        // Upload file and update local state
        const result = await onSaveAcoperire({ ...acoperire, file } as any);
        
        // Update local editing state with file info
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            acoperiri: prev.acoperiri.map(ac => 
              ac.id === acoperire.id 
                ? { 
                    ...ac, 
                    fisier: { nume: file.name, dataUrl: URL.createObjectURL(file) }
                  }
                : ac
            )
          };
        });
      } else {
        // For text changes, update local state immediately
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            acoperiri: prev.acoperiri.map(ac => 
              ac.id === acoperire.id ? acoperire : ac
            )
          };
        });
        // Also save to database
        await onSaveAcoperire(acoperire);
      }
    } catch (error) {
      console.error('Error updating acoperire:', error);
    }
  };

  const handleUpdateOptiune = async (optiune: OptiuneExtra, file?: File) => {
    try {
      if (file) {
        // Upload file and update local state
        const result = await onSaveOptiuneExtra({ ...optiune, file } as any);
        
        // Update local editing state with file info
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            optiuniExtra: prev.optiuniExtra.map(opt => 
              opt.id === optiune.id 
                ? { 
                    ...opt, 
                    fisier: { nume: file.name, dataUrl: URL.createObjectURL(file) }
                  }
                : opt
            )
          };
        });
      } else {
        // For text changes, update local state immediately
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            optiuniExtra: prev.optiuniExtra.map(opt => 
              opt.id === optiune.id ? optiune : opt
            )
          };
        });
        // Also save to database
        await onSaveOptiuneExtra(optiune);
      }
    } catch (error) {
      console.error('Error updating optiune:', error);
    }
  };

  const handleDeleteAcoperire = async (acoperireId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această acoperire?')) return;
    
    try {
      await onDeleteAcoperire(acoperireId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting acoperire:', error);
    }
  };

  const handleDeleteOptiune = async (optiuneId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această opțiune?')) return;
    
    try {
      await onDeleteOptiuneExtra(optiuneId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting optiune:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = data.vehicule.map(vehicle => ({
      producator: vehicle.producator,
      model: vehicle.model,
      categorie: getCategoryName(vehicle.categorieId),
      perioada_fabricatie: vehicle.perioadaFabricatie || '',
      acoperiri: vehicle.acoperiri.map(a => `${a.nume}:${a.pret}`).join(';'),
      optiuni_extra: vehicle.optiuniExtra.map(o => `${o.nume}:${o.pret}`).join(';')
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vehicule_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (dataToImport?: string) => {
    const dataToUse = dataToImport || importData;
    if (!dataToUse.trim()) return;
    
    setIsImporting(true);
    setImportResults({success: 0, errors: []});
    
    try {
      const parsed = Papa.parse(dataToUse, { header: true, skipEmptyLines: true });
      const errors: string[] = [];
      let successCount = 0;
      
      for (let i = 0; i < parsed.data.length; i++) {
        const row = parsed.data[i] as any;
        const rowNum = i + 2; // +2 because of header and 0-based index
        
        try {
          // Validate required fields
          if (!row.producator || !row.model) {
            errors.push(`Rândul ${rowNum}: Producător și model sunt obligatorii`);
            continue;
          }
          
          // Find or create category
          let categorieId = '';
          if (row.categorie) {
            const existingCategory = data.categorii.find(c => c.nume.toLowerCase() === row.categorie.toLowerCase());
            if (existingCategory) {
              categorieId = existingCategory.id;
            } else {
              // Create new category
              await onSaveCategorie({ nume: row.categorie });
              // Refresh data to get new category ID
              await onRefetch();
              const newCategory = data.categorii.find(c => c.nume.toLowerCase() === row.categorie.toLowerCase());
              categorieId = newCategory?.id || '';
            }
          }
          
          // Create vehicle
          const vehiculData = {
            producator: row.producator.trim(),
            model: row.model.trim(),
            categorieId: categorieId,
            perioadaFabricatie: row.perioada_fabricatie || ''
          };
          
          await onSaveVehicul(vehiculData);
          successCount++;
          
        } catch (error) {
          errors.push(`Rândul ${rowNum}: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
        }
      }
      
      setImportResults({success: successCount, errors});
      
      if (successCount > 0) {
        onRefetch();
      }
      
    } catch (error) {
      setImportResults({success: 0, errors: ['Eroare la parsarea fișierului CSV']});
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        producator: 'BMW',
        model: 'X5',
        categorie: 'SUV',
        perioada_fabricatie: '2019-2024',
        acoperiri: 'Folie transparentă:1500;Folie colorată:2000',
        optiuni_extra: 'Decup
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
        optiuni_extra: 'Decupaj personalizat:500;Aplicare premium:300'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_vehicule.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Caută vehicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toate categoriile</option>
            {data.categorii.map(category => (
              <option key={category.id} value={category.id}>{category.nume}</option>
            ))}
          </select>

          <select
            value={selectedProducer}
            onChange={(e) => setSelectedProducer(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toți producătorii</option>
            {uniqueProducers.map(producer => (
              <option key={producer} value={producer}>{producer}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileUp className="w-4 h-4" />
            Import CSV
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adaugă vehicul
          </button>
        </div>
      </div>

      {/* Vehicles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {vehicle.producator} {vehicle.model}
                </h3>
                <p className="text-sm text-gray-600">{getCategoryName(vehicle.categorieId)}</p>
                {vehicle.perioadaFabricatie && (
                  <p className="text-sm text-gray-500">{vehicle.perioadaFabricatie}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingVehicle(vehicle)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Vezi detalii"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setEditingVehicle(vehicle)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editează vehicul"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setEditingDetails(vehicle)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Editează acoperiri și opțiuni"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Șterge vehicul"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick preview of acoperiri */}
            {vehicle.acoperiri.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Acoperiri ({vehicle.acoperiri.length})</h4>
                <div className="space-y-2">
                  {vehicle.acoperiri.map(acoperire => (
                    <div key={acoperire.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{acoperire.nume}</span>
                        {acoperire.fisier && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">Fișier</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{acoperire.pret} RON</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick preview of optiuni extra */}
            {vehicle.optiuniExtra.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Opțiuni extra ({vehicle.optiuniExtra.length})</h4>
                <div className="space-y-2">
                  {vehicle.optiuniExtra.map(optiune => (
                    <div key={optiune.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{optiune.nume}</span>
                        {optiune.fisier && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">Fișier</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{optiune.pret} RON</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Adaugă vehicul nou</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producător
                </label>
                <input
                  type="text"
                  value={newVehicle.producator}
                  onChange={(e) => setNewVehicle({ ...newVehicle, producator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: BMW"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: X5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={newVehicle.categorieId}
                  onChange={(e) => setNewVehicle({ ...newVehicle, categorieId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selectează categoria</option>
                  {data.categorii.map(category => (
                    <option key={category.id} value={category.id}>{category.nume}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perioada fabricație (opțional)
                </label>
                <input
                  type="text"
                  value={newVehicle.perioadaFabricatie}
                  onChange={(e) => setNewVehicle({ ...newVehicle, perioadaFabricatie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2019-2024"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddVehicle}
                disabled={!newVehicle.producator || !newVehicle.model}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Adaugă vehicul
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editează vehicul</h2>
              <button
                onClick={() => setEditingVehicle(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producător
                </label>
                <input
                  type="text"
                  value={editingVehicle.producator}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, producator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={editingVehicle.model}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={editingVehicle.categorieId}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, categorieId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selectează categoria</option>
                  {data.categorii.map(category => (
                    <option key={category.id} value={category.id}>{category.nume}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perioada fabricație
                </label>
                <input
                  type="text"
                  value={editingVehicle.perioadaFabricatie || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, perioadaFabricatie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2019-2024"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateVehicle}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Salvează modificările
              </button>
              <button
                onClick={() => setEditingVehicle(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {viewingVehicle.producator} {viewingVehicle.model}
              </h2>
              <button
                onClick={() => setViewingVehicle(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categorie</label>
                  <p className="text-gray-900">{getCategoryName(viewingVehicle.categorieId)}</p>
                </div>
                {viewingVehicle.perioadaFabricatie && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Perioada fabricație</label>
                    <p className="text-gray-900">{viewingVehicle.perioadaFabricatie}</p>
                  </div>
                )}
              </div>

              {/* Acoperiri */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Acoperiri ({viewingVehicle.acoperiri.length})
                </h3>
                {viewingVehicle.acoperiri.length > 0 ? (
                  <div className="space-y-2">
                    {viewingVehicle.acoperiri.map(acoperire => (
                      <div key={acoperire.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{acoperire.nume}</span>
                          {acoperire.fisier && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Fișier</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{acoperire.pret} RON</span>
                          {acoperire.fisier && (
                            <button
                              onClick={() => downloadFile(acoperire.fisier!)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Descarcă fișier"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Nu sunt definite acoperiri pentru acest vehicul.</p>
                )}
              </div>

              {/* Optiuni Extra */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Opțiuni extra ({viewingVehicle.optiuniExtra.length})
                </h3>
                {viewingVehicle.optiuniExtra.length > 0 ? (
                  <div className="space-y-2">
                    {viewingVehicle.optiuniExtra.map(optiune => (
                      <div key={optiune.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{optiune.nume}</span>
                          {optiune.fisier && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Fișier</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{optiune.pret} RON</span>
                          {optiune.fisier && (
                            <button
                              onClick={() => downloadFile(optiune.fisier!)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Descarcă fișier"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Nu sunt definite opțiuni extra pentru acest vehicul.</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingVehicle(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Editează acoperiri și opțiuni - {editingDetails.producator} {editingDetails.model}
              </h2>
              <button
                onClick={() => setEditingDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Acoperiri Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acoperiri</h3>
                
                {/* Add new acoperire */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Adaugă acoperire nouă</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newAcoperire.nume}
                      onChange={(e) => setNewAcoperire({ ...newAcoperire, nume: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nume acoperire"
                    />
                    <input
                      type="number"
                      value={newAcoperire.pret}
                      onChange={(e) => setNewAcoperire({ ...newAcoperire, pret: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Preț (RON)"
                    />
                    <button
                      onClick={() => handleAddAcoperire(editingDetails.id)}
                      disabled={!newAcoperire.nume || newAcoperire.pret <= 0}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Adaugă acoperire
                    </button>
                  </div>
                </div>

                {/* Existing acoperiri */}
                <div className="space-y-3">
                  {editingDetails.acoperiri.map((acoperire, index) => (
                    <div key={acoperire.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={acoperire.nume}
                            onChange={(e) => {
                              const updatedAcoperiri = [...editingDetails.acoperiri];
                              updatedAcoperiri[index] = { ...acoperire, nume: e.target.value };
                              setEditingDetails({ ...editingDetails, acoperiri: updatedAcoperiri });
                              handleUpdateAcoperire({ ...acoperire, nume: e.target.value });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nume acoperire"
                          />
                          {acoperire.fisier && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Fișier</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-32">
                        <input
                          type="number"
                          value={acoperire.pret}
                          onChange={(e) => {
                            const updatedAcoperiri = [...editingDetails.acoperiri];
                            updatedAcoperiri[index] = { ...acoperire, pret: Number(e.target.value) };
                            setEditingDetails({ ...editingDetails, acoperiri: updatedAcoperiri });
                            handleUpdateAcoperire({ ...acoperire, pret: Number(e.target.value) });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Preț"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingFile(acoperire.id);
                                handleUpdateAcoperire(acoperire, file).finally(() => {
                                  setUploadingFile(null);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <div className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                            {uploadingFile === acoperire.id ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                          </div>
                        </label>
                        
                        {acoperire.fisier && (
                          <button
                            onClick={() => downloadFile(acoperire.fisier!)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descarcă fișier"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteAcoperire(acoperire.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Șterge acoperire"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optiuni Extra Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Opțiuni extra</h3>
                
                {/* Add new optiune */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Adaugă opțiune nouă</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newOptiune.nume}
                      onChange={(e) => setNewOptiune({ ...newOptiune, nume: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nume opțiune"
                    />
                    <input
                      type="number"
                      value={newOptiune.pret}
                      onChange={(e) => setNewOptiune({ ...newOptiune, pret: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Preț (RON)"
                    />
                    <button
                      onClick={() => handleAddOptiune(editingDetails.id)}
                      disabled={!newOptiune.nume || newOptiune.pret <= 0}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Adaugă opțiune
                    </button>
                  </div>
                </div>

                {/* Existing optiuni */}
                <div className="space-y-3">
                  {editingDetails.optiuniExtra.map((optiune, index) => (
                    <div key={optiune.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={optiune.nume}
                            onChange={(e) => {
                              const updatedOptiuni = [...editingDetails.optiuniExtra];
                              updatedOptiuni[index] = { ...optiune, nume: e.target.value };
                              setEditingDetails({ ...editingDetails, optiuniExtra: updatedOptiuni });
                              handleUpdateOptiune({ ...optiune, nume: e.target.value });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nume opțiune"
                          />
                          {optiune.fisier && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Fișier</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-32">
                        <input
                          type="number"
                          value={optiune.pret}
                          onChange={(e) => {
                            const updatedOptiuni = [...editingDetails.optiuniExtra];
                            updatedOptiuni[index] = { ...optiune, pret: Number(e.target.value) };
                            setEditingDetails({ ...editingDetails, optiuniExtra: updatedOptiuni });
                            handleUpdateOptiune({ ...optiune, pret: Number(e.target.value) });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Preț"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingFile(optiune.id);
                                handleUpdateOptiune(optiune, file).finally(() => {
                                  setUploadingFile(null);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <div className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                            {uploadingFile === optiune.id ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                          </div>
                        </label>
                        
                        {optiune.fisier && (
                          <button
                            onClick={() => downloadFile(optiune.fisier!)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descarcă fișier"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteOptiune(optiune.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Șterge opțiune"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setEditingDetails(null)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Import vehicule din CSV</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-4">
                  Încarcă un fișier CSV cu vehicule. Fișierul trebuie să conțină coloanele: 
                  <code className="bg-gray-100 px-1 rounded">producator</code>, 
                  <code className="bg-gray-100 px-1 rounded">model</code>, 
                  <code className="bg-gray-100 px-1 rounded">categorie</code> (opțional), 
                  <code className="bg-gray-100 px-1 rounded">perioada_fabricatie</code> (opțional).
                </p>
                
                <div className="flex gap-4 mb-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <FileUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Selectează fișier CSV</p>
                    </div>
                  </label>
                  
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FileDown className="w-4 h-4 mx-auto mb-1" />
                    Template
                  </button>
                </div>
              </div>

              {/* Manual input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sau introdu datele CSV manual:
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="producator,model,categorie,perioada_fabricatie&#10;BMW,X5,SUV,2019-2024&#10;Audi,A4,Sedan,2020-2024"
                />
              </div>

              {/* Import results */}
              {(importResults.success > 0 || importResults.errors.length > 0) && (
                <div className="space-y-3">
                  {importResults.success > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">
                        ✓ {importResults.success} vehicule importate cu succes
                      </p>
                    </div>
                  )}
                  
                  {importResults.errors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium mb-2">Erori:</p>
                      <ul className="text-red-700 text-sm space-y-1">
                        {importResults.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleImport()}
                disabled={!importData.trim() || isImporting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? 'Se importă...' : 'Importă vehicule'}
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
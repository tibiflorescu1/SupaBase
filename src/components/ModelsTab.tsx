import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Settings2, Edit3, Trash2, Plus, Download, Upload, X, Save } from 'lucide-react';
import { AppData, Vehicul, Categorie, Acoperire, OptiuneExtra, Fisier } from '../hooks/useSupabaseData';

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
  const [saving, setSaving] = useState(false);
  
  // Stare temporară pentru pop-up - toate modificările rămân aici până la salvare
  const [tempVehicleData, setTempVehicleData] = useState<{
    vehicul: Vehicul;
    acoperiri: Acoperire[];
    optiuni: OptiuneExtra[];
    deletedAcoperiri: string[];
    deletedOptiuni: string[];
  } | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicul | null>(null);
  const [editingDetails, setEditingDetails] = useState<Vehicul | null>(null);
  const [newAcoperire, setNewAcoperire] = useState({ nume: '', pret: 0 });
  const [newOptiune, setNewOptiune] = useState({ nume: '', pret: 0 });
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    producator: '',
    model: '',
    categorieId: '',
    perioadaFabricatie: ''
  });
  const [fixingCategories, setFixingCategories] = useState(false);

  // Get unique producers for filter dropdown - filtered by selected category
  const uniqueProducers = useMemo(() => {
    const producers = selectedCategory === '' 
      ? data.vehicule.map(v => v.producator).filter(Boolean)
      : data.vehicule.filter(v => v.categorieId === selectedCategory).map(v => v.producator).filter(Boolean);
    return [...new Set(producers)].filter(p => p && p.trim() !== '').sort();
  }, [data.vehicule, selectedCategory]);

  // Reset producer filter when category changes
  useEffect(() => {
    if (selectedCategory && selectedProducer && !uniqueProducers.includes(selectedProducer)) {
      setSelectedProducer('');
    }
  }, [selectedCategory, selectedProducer, uniqueProducers]);

  const filteredVehicles = data.vehicule.filter(vehicle => {
    const searchMatch = searchTerm === '' || 
      (vehicle.producator && vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const categoryMatch = selectedCategory === '' || vehicle.categorieId === selectedCategory;
    const producerMatch = selectedProducer === '' || vehicle.producator === selectedProducer;
    
    return searchMatch && categoryMatch && producerMatch;
  });

  // Get category name helper
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

  const handleEditVehicle = (vehicul: Vehicul) => {
    // Inițializez sandbox-ul temporar cu datele curente
    setTempVehicleData({
      vehicul: { ...vehicul },
      acoperiri: [...vehicul.acoperiri],
      optiuni: [...vehicul.optiuniExtra],
      deletedAcoperiri: [],
      deletedOptiuni: []
    });
    setEditingVehicle(vehicul);
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
      // Doar după salvarea vehiculului facem refetch pentru a actualiza lista
      await onRefetch();
      setEditingVehicle(null);
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

  const handleAddAcoperire = (acoperire: Omit<Acoperire, 'id'>, file?: File) => {
    if (!tempVehicleData) return;
    
    // Adaug în sandbox-ul temporar cu ID temporar
    const newAcoperire: Acoperire = {
      ...acoperire,
      id: `temp_${Date.now()}_${Math.random()}`,
      fisier: file ? { nume: file.name, dataUrl: '' } : undefined
    };
    
    setTempVehicleData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        acoperiri: [...prev.acoperiri, newAcoperire]
      };
    });
  };

  const handleAddOptiune = (optiune: Omit<OptiuneExtra, 'id'>, file?: File) => {
    if (!tempVehicleData) return;
    
    // Adaug în sandbox-ul temporar cu ID temporar
    const newOptiune: OptiuneExtra = {
      ...optiune,
      id: `temp_${Date.now()}_${Math.random()}`,
      fisier: file ? { nume: file.name, dataUrl: '' } : undefined
    };
    
    setTempVehicleData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        optiuni: [...prev.optiuni, newOptiune]
      };
    });
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
      }
    } catch (error) {
      console.error('Error updating optiune:', error);
    }
  };

  const handleDeleteAcoperire = (id: string) => {
    if (!tempVehicleData) return;
    
    setTempVehicleData(prev => {
      if (!prev) return prev;
      
      // Dacă e ID temporar, doar îl scot din listă
      if (id.startsWith('temp_')) {
        return {
          ...prev,
          acoperiri: prev.acoperiri.filter(a => a.id !== id)
        };
      }
      
      // Dacă e ID real, îl marchez pentru ștergere și îl scot din listă
      return {
        ...prev,
        acoperiri: prev.acoperiri.filter(a => a.id !== id),
        deletedAcoperiri: [...prev.deletedAcoperiri, id]
      };
    });
  };

  const handleDeleteOptiune = (id: string) => {
    if (!tempVehicleData) return;
    
    setTempVehicleData(prev => {
      if (!prev) return prev;
      
      // Dacă e ID temporar, doar îl scot din listă
      if (id.startsWith('temp_')) {
        return {
          ...prev,
          optiuni: prev.optiuni.filter(o => o.id !== id)
        };
      }
      
      // Dacă e ID real, îl marchez pentru ștergere și îl scot din listă
      return {
        ...prev,
        optiuni: prev.optiuni.filter(o => o.id !== id),
        deletedOptiuni: [...prev.deletedOptiuni, id]
      };
    });
  };

  const handleUpdateAcoperire = (id: string, updates: Partial<Acoperire>) => {
    if (!tempVehicleData) return;
    
    setTempVehicleData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        acoperiri: prev.acoperiri.map(a => 
          a.id === id ? { ...a, ...updates } : a
        )
      };
    });
  };

  const handleUpdateOptiune = (id: string, updates: Partial<OptiuneExtra>) => {
    if (!tempVehicleData) return;
    
    setTempVehicleData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        optiuni: prev.optiuni.map(o => 
          o.id === id ? { ...o, ...updates } : o
        )
      };
    });
  };

  const handleSaveAllChanges = async () => {
    if (!tempVehicleData || !editingVehicle) return;
    
    try {
      setSaving(true);
      
      // 1. Șterg acoperirile marcate pentru ștergere
      for (const id of tempVehicleData.deletedAcoperiri) {
        await onDeleteAcoperire(id);
      }
      
      // 2. Șterg opțiunile marcate pentru ștergere
      for (const id of tempVehicleData.deletedOptiuni) {
        await onDeleteOptiuneExtra(id);
      }
      
      // 3. Salvez acoperirile noi (cele cu ID temporar)
      const newAcoperiri = tempVehicleData.acoperiri.filter(a => a.id.startsWith('temp_'));
      for (const acoperire of newAcoperiri) {
        await onSaveAcoperire({
          nume: acoperire.nume,
          pret: acoperire.pret,
          linkFisier: acoperire.linkFisier,
          vehicul_id: editingVehicle.id
        }, undefined, false);
      }
      
      // 4. Salvez opțiunile noi (cele cu ID temporar)
      const newOptiuni = tempVehicleData.optiuni.filter(o => o.id.startsWith('temp_'));
      for (const optiune of newOptiuni) {
        await onSaveOptiuneExtra({
          nume: optiune.nume,
          pret: optiune.pret,
          linkFisier: optiune.linkFisier,
          vehicul_id: editingVehicle.id
        }, undefined, false);
      }
      
      // 5. Actualizez acoperirile existente (cele cu ID real)
      const existingAcoperiri = tempVehicleData.acoperiri.filter(a => !a.id.startsWith('temp_'));
      for (const acoperire of existingAcoperiri) {
        await onSaveAcoperire({
          id: acoperire.id,
          nume: acoperire.nume,
          pret: acoperire.pret,
          linkFisier: acoperire.linkFisier,
          vehicul_id: editingVehicle.id
        }, undefined, false);
      }
      
      // 6. Actualizez opțiunile existente (cele cu ID real)
      const existingOptiuni = tempVehicleData.optiuni.filter(o => !o.id.startsWith('temp_'));
      for (const optiune of existingOptiuni) {
        await onSaveOptiuneExtra({
          id: optiune.id,
          nume: optiune.nume,
          pret: optiune.pret,
          linkFisier: optiune.linkFisier,
          vehicul_id: editingVehicle.id
        }, undefined, false);
      }
      
      // 7. Refetch final pentru a sincroniza datele
      await onRefetch();
      
      // 8. Închid pop-up-ul
      setEditingVehicle(null);
      setTempVehicleData(null);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Eroare la salvarea modificărilor');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Anulează toate modificările și închide pop-up-ul
    setEditingVehicle(null);
    setTempVehicleData(null);
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicul, 'id' | 'acoperiri' | 'optiuniExtra'>) => {
    try {
      setSaving(true);
      await onSaveVehicul(vehicleData);
      onRefetch();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setSaving(false);
    }
  };
  // Save all changes function
  const handleSaveAllChanges = async () => {
    if (!editingDetails) return;
    
    try {
      // Salvează modificările pentru acoperiri și opțiuni existente (fără refetch)
      for (const acoperire of editingDetails.acoperiri) {
        await onSaveAcoperire({
          id: acoperire.id,
          nume: acoperire.nume,
          pret: acoperire.pret,
          vehicul_id: editingDetails.id,
          linkFisier: acoperire.linkFisier
        });
      }
      
      // Save all optiuni changes
      for (const optiune of editingDetails.optiuniExtra) {
        await onSaveOptiuneExtra({
          id: optiune.id,
          nume: optiune.nume,
          pret: optiune.pret,
          vehicul_id: editingDetails.id,
          linkFisier: optiune.linkFisier
        });
      }
      
      // Doar la final facem refetch pentru a sincroniza totul
      await onRefetch();
      setEditingDetails(null);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Eroare la salvarea modificărilor');
    }
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Modele Vehicule</h2>
        <div className="text-sm text-gray-600">
          Total vehicule: {data.vehicule.length} | Afișate: {filteredVehicles.length}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adaugă Model
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Caută după producător sau model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toate categoriile</option>
          {data.categorii.map(category => (
            <option key={category.id} value={category.id}>
              {category.nume}
            </option>
          ))}
        </select>
        <select
          value={selectedProducer}
          onChange={(e) => setSelectedProducer(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toți producătorii</option>
          {uniqueProducers.map(producer => (
            <option key={producer} value={producer}>
              {producer}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producător
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perioada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acoperiri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opțiuni
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVehicles.map((vehicle) => {
              const acoperiri = vehicle.acoperiri || [];
              const optiuni = vehicle.optiuniExtra || [];
              
              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.producator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(vehicle.categorieId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.perioadaFabricatie || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {acoperiri.length} acoperiri
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {optiuni.length} opțiuni
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => setViewingVehicle(vehicle)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Vezi detalii"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Edit Details Button */}
                      <button
                        onClick={() => setEditingDetails(vehicle)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editează acoperiri și opțiuni"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      
                      {/* Edit Vehicle Button */}
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editează model"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Șterge model"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Adaugă Model Nou</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
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
                    <option key={category.id} value={category.id}>
                      {category.nume}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perioada fabricație
                </label>
                <input
                  type="text"
                  value={newVehicle.perioadaFabricatie}
                  onChange={(e) => setNewVehicle({ ...newVehicle, perioadaFabricatie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 2020-2024"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddVehicle}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Adaugă
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <VehicleEditModal
          vehicle={editingVehicle}
          tempData={tempVehicleData}
          onSave={handleSaveAllChanges}
          onCancel={handleCancelEdit}
          onAddAcoperire={handleAddAcoperire}
          onAddOptiune={handleAddOptiune}
          onDeleteAcoperire={handleDeleteAcoperire}
          onDeleteOptiune={handleDeleteOptiune}
          onUpdateAcoperire={handleUpdateAcoperire}
          onUpdateOptiune={handleUpdateOptiune}
          saving={saving}
        />
      )}

      {/* View Details Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {viewingVehicle.producator} {viewingVehicle.model}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Vizualizare (doar citire)
                </span>
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Informații vehicul</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="md:col-span-2">
                    <span className="text-gray-500">ID Vehicul:</span>
                    <span className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                      {viewingVehicle.producator.replace(/\s+/g, '')}_
                      {viewingVehicle.model.replace(/\s+/g, '')}_
                      {viewingVehicle.id.substring(0, 8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Categorie:</span>
                    <span className="ml-2 font-medium">{getCategoryName(viewingVehicle.categorieId)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Perioada:</span>
                    <span className="ml-2 font-medium">{viewingVehicle.perioadaFabricatie || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Acoperiri */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Acoperiri disponibile</h4>
                <div className="space-y-2">
                  {(viewingVehicle.acoperiri || []).map((acoperire) => (
                    <div key={acoperire.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{acoperire.nume}</span>
                        <span className="ml-3 text-green-600 font-semibold">{acoperire.pret} RON</span>
                      </div>
                      {acoperire.fisier && (
                        <button
                          onClick={() => downloadFile(acoperire.fisier!)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {acoperire.fisier.nume}
                        </button>
                      )}
                      {acoperire.linkFisier && (
                        <a
                          href={acoperire.linkFisier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          title="Deschide în Google Drive"
                        >
                          <Download className="w-4 h-4" />
                          Fișier Google Drive
                        </a>
                      )}
                    </div>
                  ))}
                  {(!viewingVehicle.acoperiri || viewingVehicle.acoperiri.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Nu există acoperiri definite</p>
                  )}
                </div>
              </div>

              {/* Opțiuni Extra */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Opțiuni extra disponibile</h4>
                <div className="space-y-2">
                  {(viewingVehicle.optiuniExtra || []).map((optiune) => (
                    <div key={optiune.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{optiune.nume}</span>
                        <span className="ml-3 text-green-600 font-semibold">{optiune.pret} RON</span>
                      </div>
                      {optiune.fisier && (
                        <button
                          onClick={() => downloadFile(optiune.fisier!)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {optiune.fisier.nume}
                        </button>
                      )}
                      {optiune.linkFisier && (
                        <a
                          href={optiune.linkFisier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          title="Deschide în Google Drive"
                        >
                          <Download className="w-4 h-4" />
                          Fișier Google Drive
                        </a>
                      )}
                    </div>
                  ))}
                  {(!viewingVehicle.optiuniExtra || viewingVehicle.optiuniExtra.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Nu există opțiuni extra definite</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Editează: {editingDetails.producator} {editingDetails.model}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Mod editare
                </span>
                <button
                  onClick={() => {
                    handleSaveAllChanges();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvează toate modificările
                </button>
                <button
                  onClick={() => setEditingDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Vehicle Info with ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Informații vehicul</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="md:col-span-2">
                    <span className="text-gray-500">ID Vehicul:</span>
                    <span className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                      {editingDetails.producator.replace(/\s+/g, '')}_
                      {editingDetails.model.replace(/\s+/g, '')}_
                      {editingDetails.id.substring(0, 8)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">(folosit în import/export)</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Categorie:</span>
                    <span className="ml-2 font-medium">{getCategoryName(editingDetails.categorieId)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Perioada:</span>
                    <span className="ml-2 font-medium">{editingDetails.perioadaFabricatie || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Acoperiri */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Acoperiri disponibile</h4>
                  <button
                    onClick={() => handleAddAcoperire(editingDetails.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă acoperire
                  </button>
                </div>
                
                {/* Add new acoperire form */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nume acoperire</label>
                      <input
                        type="text"
                        value={newAcoperire.nume}
                        onChange={(e) => setNewAcoperire({ ...newAcoperire, nume: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="ex: Folie transparentă"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Preț (RON)</label>
                      <input
                        type="number"
                        value={newAcoperire.pret}
                        onChange={(e) => setNewAcoperire({ ...newAcoperire, pret: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => handleAddAcoperire(editingDetails.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(editingDetails.acoperiri || []).map((acoperire) => (
                    <div key={acoperire.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={acoperire.nume}
                          onChange={(e) => {
                            // Update local state only
                            setEditingDetails(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                acoperiri: prev.acoperiri.map(ac => 
                                  ac.id === acoperire.id ? { ...ac, nume: e.target.value } : ac
                                )
                              };
                            });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded font-medium"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={acoperire.pret}
                          onChange={(e) => {
                            // Update local state only
                            setEditingDetails(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                acoperiri: prev.acoperiri.map(ac => 
                                  ac.id === acoperire.id ? { ...ac, pret: Number(e.target.value) } : ac
                                )
                              };
                            });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-green-600 font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {acoperire.fisier ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => downloadFile(acoperire.fisier!)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-500">{acoperire.fisier.nume}</span>
                          </div>
                        ) : acoperire.linkFisier ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={acoperire.linkFisier}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                              title="Deschide în Google Drive (necesită permisiuni)"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <span className="text-xs text-gray-500">Drive Link</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Fără fișier</span>
                        )}
                        
                        {/* Google Drive Link Input */}
                        <div className="flex items-center gap-1">
                          <input
                            type="url"
                            placeholder="Link Google Drive..."
                            className="text-xs px-2 py-1 border border-gray-300 rounded w-48"
                            value={acoperire.linkFisier || ''}
                            onChange={(e) => {
                              // Update local state only
                              setEditingDetails(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  acoperiri: prev.acoperiri.map(ac => 
                                    ac.id === acoperire.id ? { ...ac, linkFisier: e.target.value } : ac
                                  )
                                };
                              });
                            }}
                          />
                        </div>
                        
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpdateAcoperire(acoperire, file);
                          }}
                          className="hidden"
                          id={`file-acoperire-${acoperire.id}`}
                        />
                        <label
                          htmlFor={`file-acoperire-${acoperire.id}`}
                          className="cursor-pointer text-green-600 hover:text-green-800"
                        >
                          <Upload className="w-4 h-4" />
                        </label>
                        <button
                          onClick={() => handleDeleteAcoperire(acoperire.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editingDetails.acoperiri || editingDetails.acoperiri.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Nu există acoperiri definite</p>
                  )}
                </div>
              </div>

              {/* Opțiuni Extra */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Opțiuni extra disponibile</h4>
                  <button
                    onClick={() => handleAddOptiune(editingDetails.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă opțiune
                  </button>
                </div>
                
                {/* Add new optiune form */}
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nume opțiune</label>
                      <input
                        type="text"
                        value={newOptiune.nume}
                        onChange={(e) => setNewOptiune({ ...newOptiune, nume: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="ex: Protecție faruri"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Preț (RON)</label>
                      <input
                        type="number"
                        value={newOptiune.pret}
                        onChange={(e) => setNewOptiune({ ...newOptiune, pret: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => handleAddOptiune(editingDetails.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(editingDetails.optiuniExtra || []).map((optiune) => (
                    <div key={optiune.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={optiune.nume}
                          onChange={(e) => {
                            // Update local state only
                            setEditingDetails(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                optiuniExtra: prev.optiuniExtra.map(opt => 
                                  opt.id === optiune.id ? { ...opt, nume: e.target.value } : opt
                                )
                              };
                            });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded font-medium"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={optiune.pret}
                          onChange={(e) => {
                            // Update local state only
                            setEditingDetails(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                optiuniExtra: prev.optiuniExtra.map(opt => 
                                  opt.id === optiune.id ? { ...opt, pret: Number(e.target.value) } : opt
                                )
                              };
                            });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-green-600 font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {optiune.fisier ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => downloadFile(optiune.fisier!)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-500">{optiune.fisier.nume}</span>
                          </div>
                        ) : optiune.linkFisier ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={optiune.linkFisier}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                              title="Deschide în Google Drive (necesită permisiuni)"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <span className="text-xs text-gray-500">Drive Link</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Fără fișier</span>
                        )}
                        
                        {/* Google Drive Link Input */}
                        <div className="flex items-center gap-1">
                          <input
                            type="url"
                            placeholder="Link Google Drive..."
                            className="text-xs px-2 py-1 border border-gray-300 rounded w-48"
                            value={optiune.linkFisier || ''}
                            onChange={(e) => {
                              // Update local state only
                              setEditingDetails(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  optiuniExtra: prev.optiuniExtra.map(opt => 
                                    opt.id === optiune.id ? { ...opt, linkFisier: e.target.value } : opt
                                  )
                                };
                              });
                            }}
                          />
                        </div>
                        
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpdateOptiune(optiune, file);
                          }}
                          className="hidden"
                          id={`file-optiune-${optiune.id}`}
                        />
                        <label
                          htmlFor={`file-optiune-${optiune.id}`}
                          className="cursor-pointer text-green-600 hover:text-green-800"
                        >
                          <Upload className="w-4 h-4" />
                        </label>
                        <button
                          onClick={() => handleDeleteOptiune(optiune.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editingDetails.optiuniExtra || editingDetails.optiuniExtra.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Nu există opțiuni extra definite</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface VehicleEditModalProps {
  vehicle: Vehicul;
  tempData: {
    vehicul: Vehicul;
    acoperiri: Acoperire[];
    optiuni: OptiuneExtra[];
    deletedAcoperiri: string[];
    deletedOptiuni: string[];
  } | null;
  onSave: () => void;
  onCancel: () => void;
  onAddAcoperire: (acoperire: Omit<Acoperire, 'id'>, file?: File) => void;
  onAddOptiune: (optiune: Omit<OptiuneExtra, 'id'>, file?: File) => void;
  onDeleteAcoperire: (id: string) => void;
  onDeleteOptiune: (id: string) => void;
  onUpdateAcoperire: (id: string, updates: Partial<Acoperire>) => void;
  onUpdateOptiune: (id: string, updates: Partial<OptiuneExtra>) => void;
  saving: boolean;
}

function VehicleEditModal({
  vehicle,
  tempData,
  onSave,
  onCancel,
  onAddAcoperire,
  onAddOptiune,
  onDeleteAcoperire,
  onDeleteOptiune,
  onUpdateAcoperire,
  onUpdateOptiune,
  saving
}: VehicleEditModalProps) {
  const [activeTab, setActiveTab] = useState<'acoperiri' | 'optiuni'>('acoperiri');
  const [newAcoperire, setNewAcoperire] = useState({ nume: '', pret: 0 });
  const [newOptiune, setNewOptiune] = useState({ nume: '', pret: 0 });
  const [newAcoperireFile, setNewAcoperireFile] = useState<File | null>(null);
  const [newOptiuneFile, setNewOptiuneFile] = useState<File | null>(null);
  const [showAddAcoperire, setShowAddAcoperire] = useState(false);
  const [showAddOptiune, setShowAddOptiune] = useState(false);
  
  // Folosesc datele temporare pentru afișare
  const displayAcoperiri = tempData?.acoperiri || [];
  const displayOptiuni = tempData?.optiuni || [];

  const handleAddAcoperireSubmit = () => {
    if (newAcoperire.nume && newAcoperire.pret > 0) {
      onAddAcoperire(newAcoperire, newAcoperireFile || undefined);
      setNewAcoperire({ nume: '', pret: 0 });
      setNewAcoperireFile(null);
      setShowAddAcoperire(false);
    }
  };

  const handleAddOptiuneSubmit = () => {
    if (newOptiune.nume && newOptiune.pret > 0) {
      onAddOptiune(newOptiune, newOptiuneFile || undefined);
      setNewOptiune({ nume: '', pret: 0 });
      setNewOptiuneFile(null);
      setShowAddOptiune(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Editează: {vehicle.producator} {vehicle.model}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              disabled={saving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('acoperiri')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'acoperiri'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Acoperiri ({displayAcoperiri.length})
              </button>
              <button
                onClick={() => setActiveTab('optiuni')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'optiuni'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Opțiuni Extra ({displayOptiuni.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'acoperiri' && (
              <div className="space-y-4">
                {/* Add new acoperire button */}
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">Acoperiri</h4>
                  <button
                    onClick={() => setShowAddAcoperire(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    disabled={saving}
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă acoperire
                  </button>
                </div>

                {/* Add acoperire form */}
                {showAddAcoperire && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nume acoperire
                        </label>
                        <input
                          type="text"
                          value={newAcoperire.nume}
                          onChange={(e) => setNewAcoperire({ ...newAcoperire, nume: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="ex: Folie transparentă"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preț (RON)
                        </label>
                        <input
                          type="number"
                          value={newAcoperire.pret}
                          onChange={(e) => setNewAcoperire({ ...newAcoperire, pret: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fișier (opțional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setNewAcoperireFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddAcoperireSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        disabled={!newAcoperire.nume || newAcoperire.pret <= 0}
                      >
                        Adaugă
                      </button>
                      <button
                        onClick={() => {
                          setShowAddAcoperire(false);
                          setNewAcoperire({ nume: '', pret: 0 });
                          setNewAcoperireFile(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                )}

                {/* Acoperiri table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preț
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link fișier
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayAcoperiri.map((acoperire) => (
                        <tr key={acoperire.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={acoperire.nume}
                              onChange={(e) => onUpdateAcoperire(acoperire.id, { nume: e.target.value })}
                              className="text-sm font-medium text-gray-900 border-none bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={acoperire.pret}
                              onChange={(e) => onUpdateAcoperire(acoperire.id, { pret: parseFloat(e.target.value) || 0 })}
                              className="text-sm text-gray-900 border-none bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded px-2 py-1 w-20"
                            />
                            <span className="text-sm text-gray-500 ml-1">RON</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="url"
                              value={acoperire.linkFisier || ''}
                              onChange={(e) => onUpdateAcoperire(acoperire.id, { linkFisier: e.target.value })}
                              placeholder="https://drive.google.com/..."
                              className="text-sm text-gray-900 border-none bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => onDeleteAcoperire(acoperire.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={saving}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {displayAcoperiri.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nu există acoperiri definite
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'optiuni' && (
              <div className="space-y-4">
                {/* Add new optiune button */}
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">Opțiuni Extra</h4>
                  <button
                    onClick={() => setShowAddOptiune(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    disabled={saving}
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă opțiune
                  </button>
                </div>

                {/* Add optiune form */}
                {showAddOptiune && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nume opțiune
                        </label>
                        <input
                          type="text"
                          value={newOptiune.nume}
                          onChange={(e) => setNewOptiune({ ...newOptiune, nume: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="ex: Protecție faruri"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preț (RON)
                        </label>
                        <input
                          type="number"
                          value={newOptiune.pret}
                          onChange={(e) => setNewOptiune({ ...newOptiune, pret: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fișier (opțional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setNewOptiuneFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddOptiuneSubmit}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        disabled={!newOptiune.nume || newOptiune.pret <= 0}
                      >
                        Adaugă
                      </button>
                      <button
                        onClick={() => {
                          setShowAddOptiune(false);
                          setNewOptiune({ nume: '', pret: 0 });
                          setNewOptiuneFile(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                )}

                {/* Optiuni table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preț
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link fișier
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayOptiuni.map((optiune) => (
                        <tr key={optiune.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={optiune.nume}
                              onChange={(e) => onUpdateOptiune(optiune.id, { nume: e.target.value })}
                              className="text-sm font-medium text-gray-900 border-none bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={optiune.pret}
                              onChange={(e) => onUpdateOptiune(optiune.id, { pret: parseFloat(e.target.value) || 0 })}
                              className="text-sm text-gray-900 border-none bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded px-2 py-1 w-20"
                            />
                            <span className="text-sm text-gray-500 ml-1">RON</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="url"
                              value={optiune.linkFisier || ''}
                              onChange={(e) => onUpdateOptiune(optiune.id, { linkFisier: e.target.value })}
                              placeholder="https://drive.google.com/..."
                              className="text-sm text-gray-900 border-none bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => onDeleteOptiune(optiune.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={saving}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {displayOptiuni.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nu există opțiuni extra definite
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Anulează
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Se salvează...' : 'Salvează Toate Modificările'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
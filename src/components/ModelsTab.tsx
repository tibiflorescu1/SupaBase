import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, FileText, Image, Eye, Settings2 } from 'lucide-react';
import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';

interface ModelsTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Omit<Vehicul, 'id' | 'acoperiri' | 'optiuniExtra'> & { id?: string }) => Promise<void>;
  onDeleteVehicul: (id: string) => Promise<void>;
  onSaveAcoperire: (acoperire: Omit<Acoperire, 'id'> & { id?: string, vehicul_id: string }) => Promise<void>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Omit<OptiuneExtra, 'id'> & { id?: string, vehicul_id: string }) => Promise<void>;
  onDeleteOptiuneExtra: (id: string) => Promise<void>;
  onRefetch: () => Promise<void>;
}

interface NewAcoperire {
  nume: string;
  pret: number;
  file?: File;
}

interface NewOptiune {
  nume: string;
  pret: number;
  file?: File;
}

export default function ModelsTab({ 
  data, 
  onSaveVehicul, 
  onDeleteVehicul, 
  onSaveAcoperire, 
  onDeleteAcoperire, 
  onSaveOptiuneExtra, 
  onDeleteOptiuneExtra 
}: ModelsTabProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  
  // New states for inline editing
  const [newAcoperiri, setNewAcoperiri] = useState<NewAcoperire[]>([]);
  const [newOptiuni, setNewOptiuni] = useState<NewOptiune[]>([]);

  const downloadFile = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveVehicle = async () => {
    if (editingVehicle && editingVehicle.producator && editingVehicle.model && editingVehicle.categorieId) {
      try {
        setSaving(true);
        
        // First save the vehicle
        await onSaveVehicul({
          id: editingVehicle.id,
          producator: editingVehicle.producator,
          model: editingVehicle.model,
          categorieId: editingVehicle.categorieId,
          perioadaFabricatie: editingVehicle.perioadaFabricatie
        });

        // Get the vehicle ID - for new vehicles, we need to find it after creation
        let vehicleId = editingVehicle.id;
        if (isAdding) {
          // Refetch data to get the new vehicle ID
          await onRefetch();
          // Find the newly created vehicle by matching producer and model
          const updatedData = await new Promise(resolve => setTimeout(() => resolve(data), 100));
          const newVehicle = data.vehicule.find(v => 
            v.producator === editingVehicle.producator && 
            v.model === editingVehicle.model &&
            v.categorieId === editingVehicle.categorieId
          );
          vehicleId = newVehicle?.id || editingVehicle.id;
        }

        // Save new acoperiri if any
        for (const acoperire of newAcoperiri) {
          if (acoperire.nume && acoperire.pret) {
            await onSaveAcoperire({
              nume: acoperire.nume,
              pret: acoperire.pret,
              vehicul_id: vehicleId,
              file: acoperire.file
            });
          }
        }

        // Save new optiuni if any
        for (const optiune of newOptiuni) {
          if (optiune.nume && optiune.pret) {
            await onSaveOptiuneExtra({
              nume: optiune.nume,
              pret: optiune.pret,
              vehicul_id: vehicleId,
              file: optiune.file
            });
          }
        }

        // Reset states
        setEditingVehicle(null);
        setIsAdding(false);
        setNewAcoperiri([]);
        setNewOptiuni([]);
      } catch (error) {
        console.error('Error saving vehicle:', error);
        alert('Eroare la salvarea vehiculului');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest vehicul?')) {
      try {
        setSaving(true);
        await onDeleteVehicul(id);
        if (selectedVehicle === id) {
          setSelectedVehicle(null);
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Eroare la ștergerea vehiculului');
      } finally {
        setSaving(false);
      }
    }
  };

  const addNewAcoperire = () => {
    setNewAcoperiri([...newAcoperiri, { nume: '', pret: 0 }]);
  };

  const removeNewAcoperire = (index: number) => {
    setNewAcoperiri(newAcoperiri.filter((_, i) => i !== index));
  };

  const updateNewAcoperire = (index: number, field: keyof NewAcoperire, value: any) => {
    const updated = [...newAcoperiri];
    updated[index] = { ...updated[index], [field]: value };
    setNewAcoperiri(updated);
  };

  const addNewOptiune = () => {
    setNewOptiuni([...newOptiuni, { nume: '', pret: 0 }]);
  };

  const removeNewOptiune = (index: number) => {
    setNewOptiuni(newOptiuni.filter((_, i) => i !== index));
  };

  const updateNewOptiune = (index: number, field: keyof NewOptiune, value: any) => {
    const updated = [...newOptiuni];
    updated[index] = { ...updated[index], [field]: value };
    setNewOptiuni(updated);
  };

  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const filteredVehicles = data.vehicule.filter(vehicle =>
    vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Modele Vehicule</h2>
        <button
          onClick={() => {
            setEditingVehicle({
              id: '',
              producator: '',
              model: '',
              categorieId: '',
              perioadaFabricatie: '',
              acoperiri: [],
              optiuniExtra: []
            });
            setIsAdding(true);
            setNewAcoperiri([]);
            setNewOptiuni([]);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Model
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Caută modele..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {(editingVehicle || isAdding) && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Adaugă Model Nou' : 'Editează Model'}
          </h3>
          
          {/* Vehicle Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producător
              </label>
              <input
                type="text"
                value={editingVehicle?.producator || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, producator: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={editingVehicle?.model || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, model: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie
              </label>
              <select
                value={editingVehicle?.categorieId || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, categorieId: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selectează categoria</option>
                {data.categorii.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nume}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Perioada Fabricație
              </label>
              <input
                type="text"
                value={editingVehicle?.perioadaFabricatie || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, perioadaFabricatie: e.target.value } : null)}
                placeholder="ex: 2020-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Acoperiri Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-800">Acoperiri</h4>
              <button
                onClick={addNewAcoperire}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adaugă Acoperire
              </button>
            </div>
            
            {/* Existing acoperiri for edit mode */}
            {!isAdding && editingVehicle?.acoperiri.map((acoperire) => (
              <div key={acoperire.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{acoperire.nume}</span>
                    <span className="text-green-600">{acoperire.pret} RON</span>
                    {acoperire.fisier && (
                      <button
                        onClick={() => downloadFile(acoperire.fisier!.dataUrl, acoperire.fisier!.nume)}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-xs"
                        title={`Descarcă ${acoperire.fisier.nume}`}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {acoperire.fisier.nume}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* New acoperiri */}
            {newAcoperiri.map((acoperire, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-blue-50 rounded-lg mb-2">
                <div>
                  <input
                    type="text"
                    placeholder="Nume acoperire"
                    value={acoperire.nume}
                    onChange={(e) => updateNewAcoperire(index, 'nume', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Preț"
                    value={acoperire.pret || ''}
                    onChange={(e) => updateNewAcoperire(index, 'pret', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateNewAcoperire(index, 'file', file);
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <button
                    onClick={() => removeNewAcoperire(index)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Optiuni Extra Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-800">Opțiuni Extra</h4>
              <button
                onClick={addNewOptiune}
                className="flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adaugă Opțiune
              </button>
            </div>
            
            {/* Existing optiuni for edit mode */}
            {!isAdding && editingVehicle?.optiuniExtra.map((optiune) => (
              <div key={optiune.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{optiune.nume}</span>
                    <span className="text-green-600">{optiune.pret} RON</span>
                    {optiune.fisier && (
                      <button
                        onClick={() => downloadFile(optiune.fisier!.dataUrl, optiune.fisier!.nume)}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-xs"
                        title={`Descarcă ${optiune.fisier.nume}`}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {optiune.fisier.nume}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* New optiuni */}
            {newOptiuni.map((optiune, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-purple-50 rounded-lg mb-2">
                <div>
                  <input
                    type="text"
                    placeholder="Nume opțiune"
                    value={optiune.nume}
                    onChange={(e) => updateNewOptiune(index, 'nume', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Preț"
                    value={optiune.pret || ''}
                    onChange={(e) => updateNewOptiune(index, 'pret', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateNewOptiune(index, 'file', file);
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <button
                    onClick={() => removeNewOptiune(index)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              onClick={() => {
                setEditingVehicle(null);
                setIsAdding(false);
                setNewAcoperiri([]);
                setNewOptiuni([]);
              }}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Anulează
            </button>
            <button
              onClick={handleSaveVehicle}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isAdding ? 'Creează Model' : 'Salvează Modificări'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
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
                  Opțiuni Extra
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => {
                const category = data.categorii.find(c => c.id === vehicle.categorieId);
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.producator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.model}
                    </td>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {vehicle.acoperiri?.length || 0}
                        </span>
                        {vehicle.acoperiri?.some(a => a.fisier) && (
                          <div className="flex items-center text-green-600" title="Conține fișiere">
                            <FileText className="w-4 h-4" />
                          </div>
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {vehicle.producator} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                <Eye className="w-4 h-4 inline mr-1" />
                Vizualizare (doar citire)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('acoperiri')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'acoperiri'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Acoperiri ({vehicle.acoperiri.length})
            </button>
            <button
              onClick={() => setActiveTab('optiuni')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'optiuni'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Opțiuni Extra ({vehicle.optiuniExtra.length})
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'acoperiri' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Acoperiri Disponibile</h4>
              
              {vehicle.acoperiri.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nu există acoperiri definite pentru acest model</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {vehicle.acoperiri.map((coverage) => (
                    <div key={coverage.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900">{coverage.nume}</h6>
                          <p className="text-lg font-bold text-green-600 mt-1">{coverage.pret} RON</p>
                        </div>
                        {coverage.fisier && (
                          <button
                            onClick={() => downloadFile(coverage.fisier!.dataUrl, coverage.fisier!.nume)}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title={`Descarcă ${coverage.fisier.nume}`}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="text-sm">{coverage.fisier.nume}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {activeTab === 'optiuni' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Opțiuni Extra</h4>
              
              {vehicle.optiuniExtra.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nu există opțiuni extra definite pentru acest model</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {vehicle.optiuniExtra.map((option) => (
                    <div key={option.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900">{option.nume}</h6>
                          <p className="text-lg font-bold text-green-600 mt-1">{option.pret} RON</p>
                        </div>
                        {option.fisier && (
                          <button
                            onClick={() => downloadFile(option.fisier!.dataUrl, option.fisier!.nume)}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title={`Descarcă ${option.fisier.nume}`}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="text-sm">{option.fisier.nume}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

              <div className="space-y-2">
                {vehicle.optiuniExtra.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h6 className="font-medium">{option.nume}</h6>
                        {option.fisier && (
                          <button
                            onClick={() => downloadFile(option.fisier!.dataUrl, option.fisier!.nume)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            title={`Descarcă ${option.fisier.nume}`}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            <span className="text-xs">{option.fisier.nume}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-medium text-green-600">{option.pret} RON</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingOption(option)}
                        className="p-2 text-indigo-600 hover:text-indigo-800"
                        disabled={saving}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
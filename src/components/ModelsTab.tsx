import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, FileText } from 'lucide-react';
import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../types';

interface ModelsTabProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function ModelsTab({ data, setData }: ModelsTabProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveVehicle = () => {
    if (editingVehicle && editingVehicle.producator && editingVehicle.model && editingVehicle.categorieId) {
      if (editingVehicle.id) {
        // Update existing
        setData({
          ...data,
          vehicule: data.vehicule.map(v =>
            v.id === editingVehicle.id ? editingVehicle : v
          )
        });
      } else {
        // Add new
        const newVehicle = {
          ...editingVehicle,
          id: Date.now().toString(),
          acoperiri: [],
          optiuniExtra: []
        };
        setData({
          ...data,
          vehicule: [...data.vehicule, newVehicle]
        });
      }
      setEditingVehicle(null);
      setIsAdding(false);
    }
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest vehicul?')) {
      setData({
        ...data,
        vehicule: data.vehicule.filter(v => v.id !== id)
      });
      if (selectedVehicle === id) {
        setSelectedVehicle(null);
      }
    }
  };

  const handleAddCoverage = (vehicleId: string) => {
    const newCoverage: Acoperire = {
      id: Date.now().toString(),
      nume: 'Acoperire nouă',
      pret: 0,
      fisierUrl: ''
    };

    setData({
      ...data,
      vehicule: data.vehicule.map(v =>
        v.id === vehicleId
          ? { ...v, acoperiri: [...v.acoperiri, newCoverage] }
          : v
      )
    });
  };

  const handleAddExtraOption = (vehicleId: string) => {
    const newOption: OptiuneExtra = {
      id: Date.now().toString(),
      nume: 'Opțiune nouă',
      pret: 0,
      fisierUrl: ''
    };

    setData({
      ...data,
      vehicule: data.vehicule.map(v =>
        v.id === vehicleId
          ? { ...v, optiuniExtra: [...v.optiuniExtra, newOption] }
          : v
      )
    });
  };

  const filteredVehicles = data.vehicule.filter(vehicle =>
    vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVehicleData = data.vehicule.find(v => v.id === selectedVehicle);

  return (
    <div className="space-y-6">
      {/* Add/Edit Vehicle Form */}
      {(isAdding || editingVehicle) && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Adaugă Vehicul Nou' : 'Editează Vehicul'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producător
              </label>
              <input
                type="text"
                value={editingVehicle?.producator || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, producator: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: BMW"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={editingVehicle?.model || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, model: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: X5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>
              <select
                value={editingVehicle?.categorieId || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, categorieId: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selectează categoria</option>
                {data.categorii.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nume}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perioada Fabricație
              </label>
              <input
                type="text"
                value={editingVehicle?.perioadaFabricatie || ''}
                onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, perioadaFabricatie: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ex: 2019-2023"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSaveVehicle}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvează
            </button>
            <button
              onClick={() => {
                setEditingVehicle(null);
                setIsAdding(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Anulează
            </button>
          </div>
        </div>
      )}

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vehicule</h2>
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingVehicle({
                  id: '',
                  producator: '',
                  model: '',
                  categorieId: '',
                  perioadaFabricatie: '',
                  acoperiri: [],
                  optiuniExtra: []
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Vehicul
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Caută vehicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="divide-y divide-gray-200">
          {filteredVehicles.map((vehicle) => {
            const category = data.categorii.find(c => c.id === vehicle.categorieId);
            return (
              <div key={vehicle.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {vehicle.producator} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category?.nume} • {vehicle.perioadaFabricatie}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {vehicle.acoperiri.length} acoperiri • {vehicle.optiuniExtra.length} opțiuni extra
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {selectedVehicle === vehicle.id ? 'Ascunde' : 'Detalii'}
                    </button>
                    <button
                      onClick={() => setEditingVehicle(vehicle)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vehicle Details */}
                {selectedVehicle === vehicle.id && selectedVehicleData && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Acoperiri */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Acoperiri</h4>
                          <button
                            onClick={() => handleAddCoverage(vehicle.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adaugă
                          </button>
                        </div>
                        <div className="space-y-2">
                          {selectedVehicleData.acoperiri.map((acoperire) => (
                            <div key={acoperire.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm">{acoperire.nume}</span>
                              </div>
                              <span className="text-sm font-medium">{acoperire.pret} RON</span>
                            </div>
                          ))}
                          {selectedVehicleData.acoperiri.length === 0 && (
                            <p className="text-sm text-gray-500 italic">Nu există acoperiri</p>
                          )}
                        </div>
                      </div>

                      {/* Opțiuni Extra */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Opțiuni Extra</h4>
                          <button
                            onClick={() => handleAddExtraOption(vehicle.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adaugă
                          </button>
                        </div>
                        <div className="space-y-2">
                          {selectedVehicleData.optiuniExtra.map((optiune) => (
                            <div key={optiune.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <Upload className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm">{optiune.nume}</span>
                              </div>
                              <span className="text-sm font-medium">{optiune.pret} RON</span>
                            </div>
                          ))}
                          {selectedVehicleData.optiuniExtra.length === 0 && (
                            <p className="text-sm text-gray-500 italic">Nu există opțiuni extra</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredVehicles.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'Nu s-au găsit vehicule care să corespundă căutării.' : 'Nu există vehicule adăugate încă.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
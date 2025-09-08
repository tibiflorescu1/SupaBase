import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, FileText } from 'lucide-react';
import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';

interface ModelsTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Omit<Vehicul, 'id' | 'acoperiri' | 'optiuniExtra'> & { id?: string }) => Promise<void>;
  onDeleteVehicul: (id: string) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export default function ModelsTab({ data, onSaveVehicul, onDeleteVehicul }: ModelsTabProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveVehicle = async () => {
    if (editingVehicle && editingVehicle.producator && editingVehicle.model && editingVehicle.categorieId) {
      try {
        setSaving(true);
        await onSaveVehicul({
          id: editingVehicle.id,
          producator: editingVehicle.producator,
          model: editingVehicle.model,
          categorieId: editingVehicle.categorieId,
          perioadaFabricatie: editingVehicle.perioadaFabricatie
        });
        setEditingVehicle(null);
        setIsAdding(false);
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

  const filteredVehicles = data.vehicule.filter(vehicle =>
    vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVehicleData = data.vehicule.find(v => v.id === selectedVehicle);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Vehicle List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Modele Vehicule</h2>
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
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adaugă Model
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Caută după producător sau model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Vehicle Form */}
        {(editingVehicle || isAdding) && (
          <div className="bg-white p-6 rounded-lg shadow border-2 border-blue-200">
            <h3 className="text-lg font-medium mb-4">
              {editingVehicle?.id ? 'Editează Vehicul' : 'Vehicul Nou'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producător
                </label>
                <input
                  type="text"
                  value={editingVehicle?.producator || ''}
                  onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, producator: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={editingVehicle?.categorieId || ''}
                  onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, categorieId: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  placeholder="ex: 2020-2023"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveVehicle}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                      Salvează
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingVehicle(null);
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Anulează
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedVehicle === vehicle.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {vehicle.producator} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {data.categorii.find(c => c.id === vehicle.categorieId)?.nume}
                    </p>
                    {vehicle.perioadaFabricatie && (
                      <p className="text-xs text-gray-400">{vehicle.perioadaFabricatie}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVehicle(vehicle);
                        setIsAdding(false);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(vehicle.id);
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Vehicle Details */}
      <div className="space-y-4">
        {selectedVehicleData ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                {selectedVehicleData.producator} {selectedVehicleData.model}
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Categorie:</span> {data.categorii.find(c => c.id === selectedVehicleData.categorieId)?.nume}</p>
                {selectedVehicleData.perioadaFabricatie && (
                  <p><span className="font-medium">Perioada:</span> {selectedVehicleData.perioadaFabricatie}</p>
                )}
              </div>
            </div>

            {/* Acoperiri */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Acoperiri</h4>
                <button className="text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {selectedVehicleData.acoperiri.length > 0 ? (
                <div className="space-y-2">
                  {selectedVehicleData.acoperiri.map((acoperire) => (
                    <div key={acoperire.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{acoperire.nume}</span>
                      <span className="text-sm font-medium">{acoperire.pret} RON</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nu există acoperiri definite</p>
              )}
            </div>

            {/* Opțiuni Extra */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Opțiuni Extra</h4>
                <button className="text-blue-600 hover:text-blue-800">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {selectedVehicleData.optiuniExtra.length > 0 ? (
                <div className="space-y-2">
                  {selectedVehicleData.optiuniExtra.map((optiune) => (
                    <div key={optiune.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{optiune.nume}</span>
                      <span className="text-sm font-medium">{optiune.pret} RON</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nu există opțiuni extra definite</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Selectează un vehicul pentru a vedea detaliile</p>
          </div>
        )}
      </div>
    </div>
  );
}
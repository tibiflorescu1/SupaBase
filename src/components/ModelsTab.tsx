import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, FileText } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                setEditingVehicle(null);
                setIsAdding(false);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Anulează
            </button>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category?.nume || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.perioadaFabricatie || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.acoperiri?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.optiuniExtra?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedVehicle(vehicle.id)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingVehicle(vehicle)}
                          className="p-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="p-2 text-red-600 hover:text-red-800"
                          disabled={saving}
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
      </div>

      {selectedVehicle && (
        <VehicleDetailsModal
          vehicle={data.vehicule.find(v => v.id === selectedVehicle)!}
          onClose={() => setSelectedVehicle(null)}
          onSaveAcoperire={onSaveAcoperire}
          onDeleteAcoperire={onDeleteAcoperire}
          onSaveOptiuneExtra={onSaveOptiuneExtra}
          onDeleteOptiuneExtra={onDeleteOptiuneExtra}
        />
      )}
    </div>
  );
}

function VehicleDetailsModal({ 
  vehicle, 
  onClose, 
  onSaveAcoperire, 
  onDeleteAcoperire, 
  onSaveOptiuneExtra, 
  onDeleteOptiuneExtra 
}: {
  vehicle: Vehicul;
  onClose: () => void;
  onSaveAcoperire: (acoperire: Omit<Acoperire, 'id'> & { id?: string, vehicul_id: string }) => Promise<void>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Omit<OptiuneExtra, 'id'> & { id?: string, vehicul_id: string }) => Promise<void>;
  onDeleteOptiuneExtra: (id: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<'acoperiri' | 'optiuni'>('acoperiri');
  const [editingCoverage, setEditingCoverage] = useState<Acoperire | null>(null);
  const [editingOption, setEditingOption] = useState<OptiuneExtra | null>(null);
  const [isAddingCoverage, setIsAddingCoverage] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveCoverage = async () => {
    if (editingCoverage && editingCoverage.nume && editingCoverage.pret !== undefined) {
      try {
        setSaving(true);
        await onSaveAcoperire({
          id: editingCoverage.id || undefined,
          nume: editingCoverage.nume,
          pret: editingCoverage.pret,
          vehicul_id: vehicle.id
        });
        setEditingCoverage(null);
        setIsAddingCoverage(false);
      } catch (error) {
        console.error('Error saving coverage:', error);
        alert('Eroare la salvarea acoperirii');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveOption = async () => {
    if (editingOption && editingOption.nume && editingOption.pret !== undefined) {
      try {
        setSaving(true);
        await onSaveOptiuneExtra({
          id: editingOption.id || undefined,
          nume: editingOption.nume,
          pret: editingOption.pret,
          vehicul_id: vehicle.id
        });
        setEditingOption(null);
        setIsAddingOption(false);
      } catch (error) {
        console.error('Error saving option:', error);
        alert('Eroare la salvarea opțiunii');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteCoverage = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această acoperire?')) {
      try {
        setSaving(true);
        await onDeleteAcoperire(id);
      } catch (error) {
        console.error('Error deleting coverage:', error);
        alert('Eroare la ștergerea acoperirii');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această opțiune?')) {
      try {
        setSaving(true);
        await onDeleteOptiuneExtra(id);
      } catch (error) {
        console.error('Error deleting option:', error);
        alert('Eroare la ștergerea opțiunii');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {vehicle.producator} {vehicle.model}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('acoperiri')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'acoperiri'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Acoperiri ({vehicle.acoperiri.length})
            </button>
            <button
              onClick={() => setActiveTab('optiuni')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'optiuni'
                  ? 'bg-blue-600 text-white'
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
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Acoperiri Disponibile</h4>
                <button
                  onClick={() => {
                    setEditingCoverage({
                      id: '',
                      nume: '',
                      pret: 0,
                    });
                    setIsAddingCoverage(true);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Acoperire
                </button>
              </div>

              {(editingCoverage || isAddingCoverage) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3">
                    {isAddingCoverage ? 'Adaugă Acoperire Nouă' : 'Editează Acoperire'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nume
                      </label>
                      <input
                        type="text"
                        value={editingCoverage?.nume || ''}
                        onChange={(e) => setEditingCoverage(prev => prev ? { ...prev, nume: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preț (RON)
                      </label>
                      <input
                        type="number"
                        value={editingCoverage?.pret || ''}
                        onChange={(e) => setEditingCoverage(prev => prev ? { ...prev, pret: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingCoverage(null);
                        setIsAddingCoverage(false);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleSaveCoverage}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      disabled={saving}
                    >
                      {saving ? 'Se salvează...' : 'Salvează'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {vehicle.acoperiri.map((coverage) => (
                  <div key={coverage.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h6 className="font-medium">{coverage.nume}</h6>
                      </div>
                      <p className="text-sm font-medium text-green-600">{coverage.pret} RON</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingCoverage(coverage)}
                        className="p-2 text-indigo-600 hover:text-indigo-800"
                        disabled={saving}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoverage(coverage.id)}
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

          {activeTab === 'optiuni' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Opțiuni Extra</h4>
                <button
                  onClick={() => {
                    setEditingOption({
                      id: '',
                      nume: '',
                      pret: 0
                    });
                    setIsAddingOption(true);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Opțiune
                </button>
              </div>

              {(editingOption || isAddingOption) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-3">
                    {isAddingOption ? 'Adaugă Opțiune Nouă' : 'Editează Opțiune'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nume
                      </label>
                      <input
                        type="text"
                        value={editingOption?.nume || ''}
                        onChange={(e) => setEditingOption(prev => prev ? { ...prev, nume: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preț (RON)
                      </label>
                      <input
                        type="number"
                        value={editingOption?.pret || ''}
                        onChange={(e) => setEditingOption(prev => prev ? { ...prev, pret: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingOption(null);
                        setIsAddingOption(false);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleSaveOption}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      disabled={saving}
                    >
                      {saving ? 'Se salvează...' : 'Salvează'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {vehicle.optiuniExtra.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h6 className="font-medium">{option.nume}</h6>
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
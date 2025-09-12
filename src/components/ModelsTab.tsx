import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, ExternalLink } from 'lucide-react';
import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';

interface ModelsTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Partial<Vehicul>) => Promise<void>;
  onDeleteVehicul: (id: string) => Promise<void>;
  onSaveAcoperire: (acoperire: Partial<Acoperire>, file?: File) => Promise<void>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Partial<OptiuneExtra>, file?: File) => Promise<void>;
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
  onDeleteOptiuneExtra, 
  onRefetch 
}: ModelsTabProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicul> | null>(null);
  const [editingAcoperire, setEditingAcoperire] = useState<Partial<Acoperire> | null>(null);
  const [editingOptiune, setEditingOptiune] = useState<Partial<OptiuneExtra> | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingAcoperire, setIsAddingAcoperire] = useState(false);
  const [isAddingOptiune, setIsAddingOptiune] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedVehicle = data.vehicule.find(v => v.id === selectedVehicleId);

  const handleSaveVehicle = async () => {
    if (editingVehicle && editingVehicle.producator && editingVehicle.model) {
      try {
        setSaving(true);
        await onSaveVehicul(editingVehicle);
        setEditingVehicle(null);
        setIsAddingVehicle(false);
        await onRefetch();
      } catch (error) {
        console.error('Error saving vehicle:', error);
        alert('Eroare la salvarea vehiculului');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest vehicul? Toate acoperirile și opțiunile vor fi șterse.')) {
      try {
        setSaving(true);
        await onDeleteVehicul(id);
        if (selectedVehicleId === id) {
          setSelectedVehicleId('');
        }
        await onRefetch();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Eroare la ștergerea vehiculului');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveAcoperire = async () => {
    if (editingAcoperire && editingAcoperire.nume && editingAcoperire.pret !== undefined && selectedVehicleId) {
      try {
        setSaving(true);
        const acoperireData = {
          ...editingAcoperire,
          vehicul_id: selectedVehicleId
        };
        await onSaveAcoperire(acoperireData, selectedFile || undefined);
        setEditingAcoperire(null);
        setIsAddingAcoperire(false);
        setSelectedFile(null);
        await onRefetch();
      } catch (error) {
        console.error('Error saving coverage:', error);
        alert('Eroare la salvarea acoperirii');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteAcoperire = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această acoperire?')) {
      try {
        setSaving(true);
        await onDeleteAcoperire(id);
        await onRefetch();
      } catch (error) {
        console.error('Error deleting coverage:', error);
        alert('Eroare la ștergerea acoperirii');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveOptiune = async () => {
    if (editingOptiune && editingOptiune.nume && editingOptiune.pret !== undefined && selectedVehicleId) {
      try {
        setSaving(true);
        const optiuneData = {
          ...editingOptiune,
          vehicul_id: selectedVehicleId
        };
        await onSaveOptiuneExtra(optiuneData, selectedFile || undefined);
        setEditingOptiune(null);
        setIsAddingOptiune(false);
        setSelectedFile(null);
        await onRefetch();
      } catch (error) {
        console.error('Error saving extra option:', error);
        alert('Eroare la salvarea opțiunii extra');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteOptiune = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această opțiune extra?')) {
      try {
        setSaving(true);
        await onDeleteOptiuneExtra(id);
        await onRefetch();
      } catch (error) {
        console.error('Error deleting extra option:', error);
        alert('Eroare la ștergerea opțiunii extra');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Modele Vehicule</h2>
        <button
          onClick={() => {
            setEditingVehicle({
              producator: '',
              model: '',
              categorieId: '',
              perioadaFabricatie: ''
            });
            setIsAddingVehicle(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Vehicul
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Lista Vehicule ({data.vehicule.length})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data.vehicule.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedVehicleId === vehicle.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {vehicle.producator} {vehicle.model}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {vehicle.perioadaFabricatie}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{vehicle.acoperiri.length} acoperiri</span>
                        <span>{vehicle.optiuniExtra.length} opțiuni</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingVehicle(vehicle);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVehicle(vehicle.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
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

        {/* Vehicle Details */}
        <div className="lg:col-span-2">
          {selectedVehicle ? (
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {selectedVehicle.producator} {selectedVehicle.model}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Categorie:</span>
                    <p>{data.categorii.find(c => c.id === selectedVehicle.categorieId)?.nume || 'Necunoscută'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Perioada:</span>
                    <p>{selectedVehicle.perioadaFabricatie || 'Nespecificată'}</p>
                  </div>
                </div>
              </div>

              {/* Coverage Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Acoperiri ({selectedVehicle.acoperiri.length})</h4>
                  <button
                    onClick={() => {
                      setEditingAcoperire({
                        nume: '',
                        pret: 0,
                        linkFisier: ''
                      });
                      setIsAddingAcoperire(true);
                    }}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adaugă Acoperire
                  </button>
                </div>

                {selectedVehicle.acoperiri.map((acoperire) => (
                  <div key={acoperire.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg mb-2">
                    <div>
                      <h5 className="font-medium">{acoperire.nume}</h5>
                      <p className="text-sm text-gray-600">{acoperire.pret} RON</p>
                      {acoperire.linkFisier && (
                        <a
                          href={acoperire.linkFisier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Vezi fișier
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAcoperire(acoperire)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAcoperire(acoperire.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Options Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Opțiuni Extra ({selectedVehicle.optiuniExtra.length})</h4>
                  <button
                    onClick={() => {
                      setEditingOptiune({
                        nume: '',
                        pret: 0,
                        linkFisier: ''
                      });
                      setIsAddingOptiune(true);
                    }}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adaugă Opțiune
                  </button>
                </div>

                {selectedVehicle.optiuniExtra.map((optiune) => (
                  <div key={optiune.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg mb-2">
                    <div>
                      <h5 className="font-medium">{optiune.nume}</h5>
                      <p className="text-sm text-gray-600">{optiune.pret} RON</p>
                      {optiune.linkFisier && (
                        <a
                          href={optiune.linkFisier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Vezi fișier
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingOptiune(optiune)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOptiune(optiune.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Selectează un vehicul din lista din stânga pentru a vedea detaliile
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Edit Modal */}
      {(editingVehicle || isAddingVehicle) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isAddingVehicle ? 'Adaugă Vehicul Nou' : 'Editează Vehicul'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perioada Fabricație
                </label>
                <input
                  type="text"
                  value={editingVehicle?.perioadaFabricatie || ''}
                  onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, perioadaFabricatie: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 2020-2024"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setEditingVehicle(null);
                  setIsAddingVehicle(false);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coverage Edit Modal */}
      {(editingAcoperire || isAddingAcoperire) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isAddingAcoperire ? 'Adaugă Acoperire Nouă' : 'Editează Acoperire'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume Acoperire
                </label>
                <input
                  type="text"
                  value={editingAcoperire?.nume || ''}
                  onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, nume: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preț (RON)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingAcoperire?.pret || ''}
                  onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, pret: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Fișier (opțional)
                </label>
                <input
                  type="url"
                  value={editingAcoperire?.linkFisier || ''}
                  onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, linkFisier: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fișier (opțional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setEditingAcoperire(null);
                  setIsAddingAcoperire(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveAcoperire}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={saving}
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra Option Edit Modal */}
      {(editingOptiune || isAddingOptiune) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isAddingOptiune ? 'Adaugă Opțiune Nouă' : 'Editează Opțiune'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nume Opțiune
                </label>
                <input
                  type="text"
                  value={editingOptiune?.nume || ''}
                  onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, nume: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preț (RON)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingOptiune?.pret || ''}
                  onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, pret: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Fișier (opțional)
                </label>
                <input
                  type="url"
                  value={editingOptiune?.linkFisier || ''}
                  onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, linkFisier: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fișier (opțional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setEditingOptiune(null);
                  setIsAddingOptiune(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={handleSaveOptiune}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={saving}
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
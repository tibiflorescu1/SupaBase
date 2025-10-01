import React, { useState } from 'react';
import { Plus, Eye, Settings2, Edit2, Trash2, Download, Upload, X, Save, ExternalLink, Car } from 'lucide-react';
import { AppData, Vehicul, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';

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
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [editingAcoperire, setEditingAcoperire] = useState<Acoperire | null>(null);
  const [editingOptiune, setEditingOptiune] = useState<OptiuneExtra | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingAcoperire, setIsAddingAcoperire] = useState(false);
  const [isAddingOptiune, setIsAddingOptiune] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const selectedVehicle = data.vehicule.find(v => v.id === selectedVehicleId);

  // Filter vehicles
  const filteredVehicles = data.vehicule.filter(vehicle => {
    const searchMatch = searchTerm === '' || 
      vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === '' || vehicle.categorieId === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const handleSaveVehicle = async () => {
    if (!editingVehicle || !editingVehicle.producator || !editingVehicle.model) return;
    
    try {
      setSaving(true);
      await onSaveVehicul(editingVehicle);
      setEditingVehicle(null);
      setIsAddingVehicle(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Eroare la salvarea vehiculului');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest vehicul? Se vor șterge și toate acoperirile și opțiunile asociate.')) {
      try {
        setSaving(true);
        await onDeleteVehicul(id);
        if (selectedVehicleId === id) {
          setSelectedVehicleId('');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Eroare la ștergerea vehiculului');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveAcoperire = async () => {
    if (!editingAcoperire || !editingAcoperire.nume || !selectedVehicleId) return;
    
    try {
      setSaving(true);
      
      const acoperireData = {
        ...editingAcoperire,
        vehicul_id: selectedVehicleId,
        pret: Number(editingAcoperire.pret) || 0
      };

      await onSaveAcoperire(acoperireData, selectedFile || undefined);
      
      setEditingAcoperire(null);
      setIsAddingAcoperire(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving coverage:', error);
      alert('Eroare la salvarea acoperirii');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAcoperire = async (id: string) => {
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

  const handleSaveOptiune = async () => {
    if (!editingOptiune || !editingOptiune.nume || !selectedVehicleId) return;
    
    try {
      setSaving(true);
      
      const optiuneData = {
        ...editingOptiune,
        vehicul_id: selectedVehicleId,
        pret: Number(editingOptiune.pret) || 0
      };

      await onSaveOptiuneExtra(optiuneData, selectedFile || undefined);
      
      setEditingOptiune(null);
      setIsAddingOptiune(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving extra option:', error);
      alert('Eroare la salvarea opțiunii extra');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOptiune = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această opțiune extra?')) {
      try {
        setSaving(true);
        await onDeleteOptiuneExtra(id);
      } catch (error) {
        console.error('Error deleting extra option:', error);
        alert('Eroare la ștergerea opțiunii extra');
      } finally {
        setSaving(false);
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = data.categorii.find(cat => cat.id === categoryId);
    return category ? category.nume : 'Necunoscută';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestionare Vehicule</h2>
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
            setIsAddingVehicle(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Vehicul
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Caută după producător sau model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toate categoriile</option>
            {data.categorii.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nume}</option>
            ))}
          </select>
        </div>
        {(searchTerm || selectedCategory) && (
          <div className="mt-2 text-sm text-gray-600">
            Afișez {filteredVehicles.length} vehicule
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Lista Vehicule ({filteredVehicles.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedVehicleId === vehicle.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedVehicleId(vehicle.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {vehicle.producator} {vehicle.model}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Categorie: {getCategoryName(vehicle.categorieId)}
                    </p>
                    {vehicle.perioadaFabricatie && (
                      <p className="text-sm text-gray-600">
                        Perioada: {vehicle.perioadaFabricatie}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{vehicle.acoperiri.length} acoperiri</span>
                      <span>{vehicle.optiuniExtra.length} opțiuni</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVehicle(vehicle);
                      }}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      disabled={saving}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(vehicle.id);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
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

        {/* Vehicle Details */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {selectedVehicle ? `${selectedVehicle.producator} ${selectedVehicle.model}` : 'Selectează un vehicul'}
            </h3>
          </div>
          
          {selectedVehicle ? (
            <div className="p-4 space-y-6">
              {/* Coverage Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Acoperiri ({selectedVehicle.acoperiri.length})</h4>
                  <button
                    onClick={() => {
                      setEditingAcoperire({
                        id: '',
                        nume: '',
                        pret: 0
                      });
                      setIsAddingAcoperire(true);
                      setSelectedFile(null);
                    }}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    disabled={saving}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adaugă
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedVehicle.acoperiri.map((acoperire) => (
                    <div key={acoperire.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{acoperire.nume}</span>
                        <span className="text-green-600 ml-2">{acoperire.pret} RON</span>
                        {acoperire.linkFisier && (
                          <a
                            href={acoperire.linkFisier}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingAcoperire(acoperire);
                            setSelectedFile(null);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-800"
                          disabled={saving}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAcoperire(acoperire.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          disabled={saving}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Options Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Opțiuni Extra ({selectedVehicle.optiuniExtra.length})</h4>
                  <button
                    onClick={() => {
                      setEditingOptiune({
                        id: '',
                        nume: '',
                        pret: 0
                      });
                      setIsAddingOptiune(true);
                      setSelectedFile(null);
                    }}
                    className="flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    disabled={saving}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adaugă
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedVehicle.optiuniExtra.map((optiune) => (
                    <div key={optiune.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{optiune.nume}</span>
                        <span className="text-green-600 ml-2">{optiune.pret} RON</span>
                        {optiune.linkFisier && (
                          <a
                            href={optiune.linkFisier}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingOptiune(optiune);
                            setSelectedFile(null);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-800"
                          disabled={saving}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteOptiune(optiune.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          disabled={saving}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Selectează un vehicul din lista din stânga pentru a vedea detaliile</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Edit Modal */}
      {(editingVehicle || isAddingVehicle) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
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
                  disabled={saving}
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
        </div>
      )}

      {/* Coverage Edit Modal */}
      {(editingAcoperire || isAddingAcoperire) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
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
                    Link Fișier (Google Drive)
                  </label>
                  <input
                    type="url"
                    value={editingAcoperire?.linkFisier || ''}
                    onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, linkFisier: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sau încarcă fișier
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
                  disabled={saving}
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveAcoperire}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving || !editingAcoperire?.nume}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extra Option Edit Modal */}
      {(editingOptiune || isAddingOptiune) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {isAddingOptiune ? 'Adaugă Opțiune Extra Nouă' : 'Editează Opțiune Extra'}
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
                    Link Fișier (Google Drive)
                  </label>
                  <input
                    type="url"
                    value={editingOptiune?.linkFisier || ''}
                    onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, linkFisier: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sau încarcă fișier
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
                  disabled={saving}
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveOptiune}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={saving || !editingOptiune?.nume}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Vehicle Edit Modal */}
      {(editingVehicle || isAddingVehicle) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
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
                  disabled={saving}
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
        </div>
      )}

      {/* Coverage Edit Modal */}
      {(editingAcoperire || isAddingAcoperire) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
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
                    Link Fișier (Google Drive)
                  </label>
                  <input
                    type="url"
                    value={editingAcoperire?.linkFisier || ''}
                    onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, linkFisier: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sau încarcă fișier
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
                  disabled={saving}
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveAcoperire}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving || !editingAcoperire?.nume}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extra Option Edit Modal */}
      {(editingOptiune || isAddingOptiune) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {isAddingOptiune ? 'Adaugă Opțiune Extra Nouă' : 'Editează Opțiune Extra'}
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
                    Link Fișier (Google Drive)
                  </label>
                  <input
                    type="url"
                    value={editingOptiune?.linkFisier || ''}
                    onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, linkFisier: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sau încarcă fișier
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
                  disabled={saving}
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveOptiune}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={saving || !editingOptiune?.nume}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
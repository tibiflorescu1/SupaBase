import React, { useState } from 'react';
import { Plus, Eye, Settings2, CreditCard as Edit3, Trash2, Download, Upload, X, Save, ExternalLink } from 'lucide-react';
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
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [editingAcoperire, setEditingAcoperire] = useState<(Acoperire & { vehicul_id: string }) | null>(null);
  const [editingOptiune, setEditingOptiune] = useState<(OptiuneExtra & { vehicul_id: string }) | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingAcoperire, setIsAddingAcoperire] = useState(false);
  const [isAddingOptiune, setIsAddingOptiune] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducer, setSelectedProducer] = useState<string>('');

  // Filter vehicles
  const filteredVehicles = data.vehicule.filter(vehicle => {
    const searchMatch = searchTerm === '' || 
      vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === '' || vehicle.categorieId === selectedCategory;
    const producerMatch = selectedProducer === '' || vehicle.producator === selectedProducer;
    return searchMatch && categoryMatch && producerMatch;
  });

  // Get unique producers for filter dropdown
  const uniqueProducers = React.useMemo(() => {
    const producers = selectedCategory === '' 
      ? data.vehicule.map(v => v.producator).filter(Boolean)
      : data.vehicule.filter(v => v.categorieId === selectedCategory).map(v => v.producator).filter(Boolean);
    return [...new Set(producers)].filter(p => p && p.trim() !== '').sort();
  }, [data.vehicule, selectedCategory]);

  const handleSaveVehicle = async () => {
    if (!editingVehicle || !editingVehicle.producator || !editingVehicle.model) return;
    
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
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest vehicul? Se vor șterge și toate acoperirile și opțiunile asociate.')) {
      try {
        setSaving(true);
        await onDeleteVehicul(id);
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
    if (!editingAcoperire || !editingAcoperire.nume || !editingAcoperire.vehicul_id) return;
    
    try {
      setSaving(true);
      
      const acoperireData = {
        ...editingAcoperire,
        pret: Number(editingAcoperire.pret) || 0
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
    if (!editingOptiune || !editingOptiune.nume || !editingOptiune.vehicul_id) return;
    
    try {
      setSaving(true);
      
      const optiuneData = {
        ...editingOptiune,
        pret: Number(editingOptiune.pret) || 0
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Caută după producător sau model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedProducer(''); // Reset producer when category changes
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toate categoriile</option>
            {data.categorii.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nume}</option>
            ))}
          </select>
          <select
            value={selectedProducer}
            onChange={(e) => setSelectedProducer(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toți producătorii</option>
            {uniqueProducers.map(producer => (
              <option key={producer} value={producer}>{producer}</option>
            ))}
          </select>
        </div>
        {(searchTerm || selectedCategory || selectedProducer) && (
          <div className="mt-2 text-sm text-gray-600">
            Afișez {filteredVehicles.length} vehicule
          </div>
        )}
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categorie
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
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.producator} {vehicle.model}
                    </div>
                    {vehicle.perioadaFabricatie && (
                      <div className="text-sm text-gray-500">
                        {vehicle.perioadaFabricatie}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCategoryName(vehicle.categorieId)}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {vehicle.acoperiri.map((acoperire) => (
                      <div key={acoperire.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{acoperire.nume}</span>
                          <span className="text-green-600 font-medium">{acoperire.pret} RON</span>
                          {acoperire.linkFisier && (
                            <a
                              href={acoperire.linkFisier}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingAcoperire({
                                ...acoperire,
                                vehicul_id: vehicle.id
                              });
                              setSelectedFile(null);
                            }}
                            className="p-1 text-indigo-600 hover:text-indigo-800"
                            disabled={saving}
                          >
                            <Edit3 className="w-3 h-3" />
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
                    <button
                      onClick={() => {
                        setEditingAcoperire({
                          id: '',
                          nume: '',
                          pret: 0,
                          vehicul_id: vehicle.id
                        });
                        setIsAddingAcoperire(true);
                        setSelectedFile(null);
                      }}
                      className="flex items-center text-xs text-green-600 hover:text-green-800"
                      disabled={saving}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adaugă acoperire
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {vehicle.optiuniExtra.map((optiune) => (
                      <div key={optiune.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{optiune.nume}</span>
                          <span className="text-green-600 font-medium">{optiune.pret} RON</span>
                          {optiune.linkFisier && (
                            <a
                              href={optiune.linkFisier}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingOptiune({
                                ...optiune,
                                vehicul_id: vehicle.id
                              });
                              setSelectedFile(null);
                            }}
                            className="p-1 text-indigo-600 hover:text-indigo-800"
                            disabled={saving}
                          >
                            <Edit3 className="w-3 h-3" />
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
                    <button
                      onClick={() => {
                        setEditingOptiune({
                          id: '',
                          nume: '',
                          pret: 0,
                          vehicul_id: vehicle.id
                        });
                        setIsAddingOptiune(true);
                        setSelectedFile(null);
                      }}
                      className="flex items-center text-xs text-purple-600 hover:text-purple-800"
                      disabled={saving}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adaugă opțiune
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingVehicle(vehicle)}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                      disabled={saving}
                    >
                      <Edit3 className="w-4 h-4" />
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
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
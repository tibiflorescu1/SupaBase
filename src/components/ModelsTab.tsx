import React, { useState } from 'react';
import { Plus, Eye, Settings2, CreditCard as Edit3, Trash2, Download, Upload, X, Save, ExternalLink, CreditCard as Edit, FileText, Link } from 'lucide-react';
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
  const [managingVehicleId, setManagingVehicleId] = useState<string | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducer, setSelectedProducer] = useState<string>('');

  // Get the vehicle being managed
  const managingVehicle = managingVehicleId ? data.vehicule.find(v => v.id === managingVehicleId) : null;

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

  const getCategoryName = (categoryId: string) => {
    const category = data.categorii.find(cat => cat.id === categoryId);
    return category ? category.nume : 'Necunoscută';
  };

  // Helper function to get file indicators for a vehicle
  const getFileIndicators = (vehicle: Vehicul) => {
    const indicators = [];
    
    // Check acoperiri for files/links (green icons)
    vehicle.acoperiri.forEach(acoperire => {
      if (acoperire.linkFisier) {
        indicators.push({
          type: 'acoperire-link',
          color: 'text-green-600',
          icon: Link,
          tooltip: `Link acoperire: ${acoperire.nume}`,
          url: acoperire.linkFisier
        });
      }
      if (acoperire.fisier) {
        indicators.push({
          type: 'acoperire-file',
          color: 'text-green-600',
          icon: FileText,
          tooltip: `Fișier acoperire: ${acoperire.nume} - ${acoperire.fisier.nume}`,
          url: acoperire.fisier.dataUrl
        });
      }
    });
    
    // Check optiuni extra for files/links (magenta icons)
    vehicle.optiuniExtra.forEach(optiune => {
      if (optiune.linkFisier) {
        indicators.push({
          type: 'optiune-link',
          color: 'text-pink-600',
          icon: Link,
          tooltip: `Link opțiune: ${optiune.nume}`,
          url: optiune.linkFisier
        });
      }
      if (optiune.fisier) {
        indicators.push({
          type: 'optiune-file',
          color: 'text-pink-600',
          icon: FileText,
          tooltip: `Fișier opțiune: ${optiune.nume} - ${optiune.fisier.nume}`,
          url: optiune.fisier.dataUrl
        });
      }
    });
    
    return indicators;
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
                Perioada
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
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCategoryName(vehicle.categorieId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.perioadaFabricatie}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    {/* File indicators */}
                    {getFileIndicators(vehicle).map((indicator, index) => {
                      const IconComponent = indicator.icon;
                      return (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => {
                              if (indicator.url.startsWith('http')) {
                                window.open(indicator.url, '_blank');
                              } else {
                                // For base64 files, create download
                                const link = document.createElement('a');
                                link.href = indicator.url;
                                link.download = indicator.tooltip.split(' - ')[1] || 'file';
                                link.click();
                              }
                            }}
                            className={`p-1 ${indicator.color} hover:opacity-80 transition-opacity`}
                            title={indicator.tooltip}
                          >
                            <IconComponent className="w-4 h-4" />
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {indicator.tooltip}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setEditingVehicle(vehicle)}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                      title="Editează vehicul"
                      disabled={saving}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setManagingVehicleId(vehicle.id)}
                      className="p-2 text-green-600 hover:text-green-800"
                      title="Gestionează acoperiri și opțiuni"
                      disabled={saving}
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Șterge vehicul"
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

      {/* Vehicle Management Modal */}
      {managingVehicle && (
        <VehicleManagementModal
          vehicle={managingVehicle}
          onClose={() => setManagingVehicleId(null)}
          onSaveAcoperire={onSaveAcoperire}
          onDeleteAcoperire={onDeleteAcoperire}
          onSaveOptiuneExtra={onSaveOptiuneExtra}
          onDeleteOptiuneExtra={onDeleteOptiuneExtra}
          onRefetch={onRefetch}
          saving={saving}
          setSaving={setSaving}
        />
      )}
    </div>
  );
}

// Vehicle Management Modal Component
interface VehicleManagementModalProps {
  vehicle: Vehicul;
  onClose: () => void;
  onSaveAcoperire: (acoperire: Partial<Acoperire>, file?: File) => Promise<void>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Partial<OptiuneExtra>, file?: File) => Promise<void>;
  onDeleteOptiuneExtra: (id: string) => Promise<void>;
  onRefetch: () => Promise<void>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
}

function VehicleManagementModal({
  vehicle,
  onClose,
  onSaveAcoperire,
  onDeleteAcoperire,
  onSaveOptiuneExtra,
  onDeleteOptiuneExtra,
  onRefetch,
  saving,
  setSaving
}: VehicleManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'acoperiri' | 'optiuni'>('acoperiri');
  const [editingAcoperire, setEditingAcoperire] = useState<(Acoperire & { vehicul_id: string }) | null>(null);
  const [editingOptiune, setEditingOptiune] = useState<(OptiuneExtra & { vehicul_id: string }) | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
    if (!editingOptiune || !editingOptiune.nume || !editingOptiune.vehicul_id) return;
    
    try {
      setSaving(true);
      
      const optiuneData = {
        ...editingOptiune,
        pret: Number(editingOptiune.pret) || 0
      };

      await onSaveOptiuneExtra(optiuneData, selectedFile || undefined);
      
      setEditingOptiune(null);
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

  const handleSaveAndClose = async () => {
    // Actualizează datele finale înainte de închidere
    await onRefetch();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Gestionare: {vehicle.producator} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {vehicle.perioadaFabricatie && `Perioada: ${vehicle.perioadaFabricatie}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('acoperiri')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'acoperiri'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Acoperiri ({vehicle.acoperiri.length})
          </button>
          <button
            onClick={() => setActiveTab('optiuni')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'optiuni'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Opțiuni Extra ({vehicle.optiuniExtra.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'acoperiri' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Acoperiri</h4>
                <button
                  onClick={() => {
                    setEditingAcoperire({
                      id: '',
                      nume: '',
                      pret: 0,
                      vehicul_id: vehicle.id
                    });
                    setSelectedFile(null);
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Acoperire
                </button>
              </div>

              {/* Acoperiri List */}
              <div className="space-y-3">
                {vehicle.acoperiri.map((acoperire) => (
                  <div key={acoperire.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">{acoperire.nume}</h5>
                          <span className="text-green-600 font-semibold">{acoperire.pret} RON</span>
                          {acoperire.linkFisier && (
                            <a
                              href={acoperire.linkFisier}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="Deschide link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {acoperire.fisier && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              📎 {acoperire.fisier.nume}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingAcoperire({
                              ...acoperire,
                              vehicul_id: vehicle.id
                            });
                            setSelectedFile(null);
                          }}
                          className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50"
                          disabled={saving}
                          title="Editează"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAcoperire(acoperire.id)}
                          className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                          disabled={saving}
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {vehicle.acoperiri.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nu există acoperiri pentru acest vehicul</p>
                    <p className="text-sm">Folosește butonul "Adaugă Acoperire" pentru a începe</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'optiuni' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Opțiuni Extra</h4>
                <button
                  onClick={() => {
                    setEditingOptiune({
                      id: '',
                      nume: '',
                      pret: 0,
                      vehicul_id: vehicle.id
                    });
                    setSelectedFile(null);
                  }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Opțiune
                </button>
              </div>

              {/* Optiuni List */}
              <div className="space-y-3">
                {vehicle.optiuniExtra.map((optiune) => (
                  <div key={optiune.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">{optiune.nume}</h5>
                          <span className="text-green-600 font-semibold">{optiune.pret} RON</span>
                          {optiune.linkFisier && (
                            <a
                              href={optiune.linkFisier}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="Deschide link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {optiune.fisier && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              📎 {optiune.fisier.nume}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingOptiune({
                              ...optiune,
                              vehicul_id: vehicle.id
                            });
                            setSelectedFile(null);
                          }}
                          className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50"
                          disabled={saving}
                          title="Editează"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOptiune(optiune.id)}
                          className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                          disabled={saving}
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {vehicle.optiuniExtra.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nu există opțiuni extra pentru acest vehicul</p>
                    <p className="text-sm">Folosește butonul "Adaugă Opțiune" pentru a începe</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Anulează
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvează și Închide
                </>
              )}
            </button>
          </div>
        </div>

        {/* Edit Acoperire Modal */}
        {editingAcoperire && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">
                  {editingAcoperire.id ? 'Editează Acoperire' : 'Adaugă Acoperire Nouă'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nume Acoperire
                    </label>
                    <input
                      type="text"
                      value={editingAcoperire.nume || ''}
                      onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, nume: e.target.value } : null)}
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
                      step="0.01"
                      min="0"
                      value={editingAcoperire.pret || ''}
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
                      value={editingAcoperire.linkFisier || ''}
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
                    {selectedFile && (
                      <p className="text-xs text-gray-600 mt-1">
                        Fișier selectat: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setEditingAcoperire(null);
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
                    disabled={saving || !editingAcoperire.nume}
                  >
                    {saving ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Optiune Modal */}
        {editingOptiune && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">
                  {editingOptiune.id ? 'Editează Opțiune Extra' : 'Adaugă Opțiune Extra Nouă'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nume Opțiune
                    </label>
                    <input
                      type="text"
                      value={editingOptiune.nume || ''}
                      onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, nume: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ex: Decupare personalizată"
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
                      value={editingOptiune.pret || ''}
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
                      value={editingOptiune.linkFisier || ''}
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
                    {selectedFile && (
                      <p className="text-xs text-gray-600 mt-1">
                        Fișier selectat: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setEditingOptiune(null);
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
                    disabled={saving || !editingOptiune.nume}
                  >
                    {saving ? 'Se salvează...' : 'Salvează'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
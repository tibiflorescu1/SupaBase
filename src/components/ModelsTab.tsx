import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Car, Image, FileDown, FileUp } from 'lucide-react';
import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';
import * as Papa from 'papaparse';

interface ModelsTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Omit<Vehicul, 'id' | 'acoperiri' | 'optiuniExtra'> & { id?: string }) => Promise<void>;
  onDeleteVehicul: (id: string) => Promise<void>;
  onSaveAcoperire: (acoperire: Omit<Acoperire, 'id'> & { id?: string, vehicul_id: string }) => Promise<any>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Omit<OptiuneExtra, 'id'> & { id?: string, vehicul_id: string }) => Promise<any>;
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [editingAcoperire, setEditingAcoperire] = useState<Acoperire | null>(null);
  const [editingOptiune, setEditingOptiune] = useState<OptiuneExtra | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isAddingAcoperire, setIsAddingAcoperire] = useState(false);
  const [isAddingOptiune, setIsAddingOptiune] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [importResults, setImportResults] = useState<{success: number, errors: string[]}>({success: 0, errors: []});
  const [isImporting, setIsImporting] = useState(false);

  const selectedVehicle = data.vehicule.find(v => v.id === selectedVehicleId);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
        setTimeout(() => {
          handleImport(content);
        }, 100);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveVehicle = async () => {
    if (editingVehicle && editingVehicle.producator && editingVehicle.model) {
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
        setIsAddingVehicle(false);
      } catch (error) {
        console.error('Error saving vehicle:', error);
        alert('Eroare la salvarea vehiculului');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest vehicul? Toate acoperirile și opțiunile extra vor fi șterse.')) {
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

  const handleSaveAcoperire = async (file?: File) => {
    if (editingAcoperire && editingAcoperire.nume && selectedVehicleId) {
      try {
        setSaving(true);
        const acoperireData = {
          ...editingAcoperire,
          vehicul_id: selectedVehicleId,
          file: file
        };
        await onSaveAcoperire(acoperireData);
        setEditingAcoperire(null);
        setIsAddingAcoperire(false);
      } catch (error) {
        console.error('Error saving coverage:', error);
        alert('Eroare la salvarea acoperirii');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveOptiune = async (file?: File) => {
    if (editingOptiune && editingOptiune.nume && selectedVehicleId) {
      try {
        setSaving(true);
        const optiuneData = {
          ...editingOptiune,
          vehicul_id: selectedVehicleId,
          file: file
        };
        await onSaveOptiuneExtra(optiuneData);
        setEditingOptiune(null);
        setIsAddingOptiune(false);
      } catch (error) {
        console.error('Error saving extra option:', error);
        alert('Eroare la salvarea opțiunii extra');
      } finally {
        setSaving(false);
      }
    }
  };

  const exportToCSV = () => {
    const csvData = data.vehicule.map(vehicle => {
      const category = data.categorii.find(c => c.id === vehicle.categorieId);
      return {
        producator: vehicle.producator,
        model: vehicle.model,
        categorie: category?.nume || '',
        perioada_fabricatie: vehicle.perioadaFabricatie || ''
      };
    });

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
        const rowNum = i + 2;
        
        try {
          if (!row.producator || !row.producator.trim()) {
            errors.push(`Rândul ${rowNum}: Producătorul este obligatoriu`);
            continue;
          }
          
          if (!row.model || !row.model.trim()) {
            errors.push(`Rândul ${rowNum}: Modelul este obligatoriu`);
            continue;
          }
          
          let categorieId = '';
          if (row.categorie && row.categorie.trim()) {
            const category = data.categorii.find(c => 
              c.nume.toLowerCase() === row.categorie.trim().toLowerCase()
            );
            if (category) {
              categorieId = category.id;
            } else {
              errors.push(`Rândul ${rowNum}: Categoria "${row.categorie.trim()}" nu există`);
              continue;
            }
          }
          
          const existingVehicle = data.vehicule.find(v => 
            v.producator.toLowerCase() === row.producator.trim().toLowerCase() &&
            v.model.toLowerCase() === row.model.trim().toLowerCase()
          );
          
          if (existingVehicle) {
            errors.push(`Rândul ${rowNum}: Vehiculul "${row.producator.trim()} ${row.model.trim()}" există deja`);
            continue;
          }
          
          await onSaveVehicul({
            producator: row.producator.trim(),
            model: row.model.trim(),
            categorieId: categorieId,
            perioadaFabricatie: row.perioada_fabricatie?.trim() || ''
          });
          successCount++;
          
        } catch (error) {
          errors.push(`Rândul ${rowNum}: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
        }
      }
      
      setImportResults({success: successCount, errors});
      
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
        perioada_fabricatie: '2020-2023' 
      },
      { 
        producator: 'Audi', 
        model: 'A4', 
        categorie: 'Sedan', 
        perioada_fabricatie: '2019-2022' 
      }
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_vehicule.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Modele Vehicule</h2>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FileUp className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => {
              setEditingVehicle({
                id: '',
                producator: '',
                model: '',
                categorieId: data.categorii[0]?.id || '',
                perioadaFabricatie: '',
                acoperiri: [],
                optiuniExtra: []
              });
              setIsAddingVehicle(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Adaugă Vehicul
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Car className="w-5 h-5" />
              Lista Vehicule ({data.vehicule.length})
            </h3>
          </div>

          {(editingVehicle || isAddingVehicle) && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-medium mb-3">
                {isAddingVehicle ? 'Adaugă Vehicul Nou' : 'Editează Vehicul'}
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Producător"
                    value={editingVehicle?.producator || ''}
                    onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, producator: e.target.value } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Model"
                    value={editingVehicle?.model || ''}
                    onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, model: e.target.value } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={editingVehicle?.categorieId || ''}
                    onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, categorieId: e.target.value } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selectează categoria</option>
                    {data.categorii.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nume}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Perioada fabricație (ex: 2020-2023)"
                    value={editingVehicle?.perioadaFabricatie || ''}
                    onChange={(e) => setEditingVehicle(prev => prev ? { ...prev, perioadaFabricatie: e.target.value } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {data.vehicule.map((vehicle) => {
              const category = data.categorii.find(c => c.id === vehicle.categorieId);
              return (
                <div
                  key={vehicle.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
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
                        {category?.nume || 'Fără categorie'}
                        {vehicle.perioadaFabricatie && ` • ${vehicle.perioadaFabricatie}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {vehicle.acoperiri.length} acoperiri • {vehicle.optiuniExtra.length} opțiuni extra
                      </p>
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
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <h4 className="font-medium text-gray-900">Acoperiri ({selectedVehicle.acoperiri.length})</h4>
                  <button
                    onClick={() => {
                      setEditingAcoperire({
                        id: '',
                        nume: '',
                        pret: 0
                      });
                      setIsAddingAcoperire(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    Adaugă
                  </button>
                </div>

                {(editingAcoperire || isAddingAcoperire) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nume acoperire"
                        value={editingAcoperire?.nume || ''}
                        onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, nume: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Preț (RON)"
                        value={editingAcoperire?.pret || ''}
                        onChange={(e) => setEditingAcoperire(prev => prev ? { ...prev, pret: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSaveAcoperire(file);
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingAcoperire(null);
                          setIsAddingAcoperire(false);
                        }}
                        className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Anulează
                      </button>
                      <button
                        onClick={() => handleSaveAcoperire()}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        disabled={saving}
                      >
                        {saving ? 'Se salvează...' : 'Salvează'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedVehicle.acoperiri.map((acoperire) => (
                    <div key={acoperire.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {acoperire.fisier && (
                          <Image className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm">{acoperire.nume}</span>
                        <span className="text-sm font-medium text-green-600">{acoperire.pret} RON</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingAcoperire(acoperire)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteAcoperire(acoperire.id)}
                          className="p-1 text-red-600 hover:text-red-800"
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
                  <h4 className="font-medium text-gray-900">Opțiuni Extra ({selectedVehicle.optiuniExtra.length})</h4>
                  <button
                    onClick={() => {
                      setEditingOptiune({
                        id: '',
                        nume: '',
                        pret: 0
                      });
                      setIsAddingOptiune(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    Adaugă
                  </button>
                </div>

                {(editingOptiune || isAddingOptiune) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nume opțiune"
                        value={editingOptiune?.nume || ''}
                        onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, nume: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Preț (RON)"
                        value={editingOptiune?.pret || ''}
                        onChange={(e) => setEditingOptiune(prev => prev ? { ...prev, pret: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSaveOptiune(file);
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingOptiune(null);
                          setIsAddingOptiune(false);
                        }}
                        className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Anulează
                      </button>
                      <button
                        onClick={() => handleSaveOptiune()}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        disabled={saving}
                      >
                        {saving ? 'Se salvează...' : 'Salvează'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedVehicle.optiuniExtra.map((optiune) => (
                    <div key={optiune.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {optiune.fisier && (
                          <Image className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm">{optiune.nume}</span>
                        <span className="text-sm font-medium text-green-600">+{optiune.pret} RON</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingOptiune(optiune)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteOptiuneExtra(optiune.id)}
                          className="p-1 text-red-600 hover:text-red-800"
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
              <p>Selectează un vehicul din lista din stânga pentru a vedea și edita acoperirile și opțiunile extra.</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Import Vehicule din CSV</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setImportResults({success: 0, errors: []});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instrucțiuni pentru import:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Fișierul CSV trebuie să conțină coloanele: <code>producator</code>, <code>model</code></li>
                  <li>• Coloanele opționale: <code>categorie</code>, <code>perioada_fabricatie</code></li>
                  <li>• Categoria trebuie să existe deja în sistem</li>
                  <li>• Vehiculele duplicate vor fi ignorate</li>
                </ul>
                <div className="mt-3">
                  <button
                    onClick={downloadTemplate}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Descarcă template exemplu
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Încarcă fișier CSV sau introdu conținutul manual:
                </label>
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Selectează un fișier CSV pentru import automat</p>
                </div>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="producator,model,categorie,perioada_fabricatie&#10;BMW,X5,SUV,2020-2023&#10;Audi,A4,Sedan,2019-2022&#10;&#10;Sau încarcă un fișier CSV mai sus..."
                />
              </div>

              {(importResults.success > 0 || importResults.errors.length > 0) && (
                <div className="space-y-3">
                  {importResults.success > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        ✅ {importResults.success} vehicule importate cu succes!
                      </p>
                    </div>
                  )}
                  
                  {importResults.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium mb-2">❌ Erori la import:</p>
                      <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        {importResults.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setImportResults({success: 0, errors: []});
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Descarcă Template
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim() || isImporting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Se importă...' : 'Importă Vehicule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
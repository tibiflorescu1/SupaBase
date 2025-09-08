import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings } from 'lucide-react';
import type { AppData, MaterialPrint, MaterialLaminare, SetariPrintAlb } from '../hooks/useSupabaseData';

interface MaterialsTabProps {
  data: AppData;
  onSaveMaterialPrint: (material: Omit<MaterialPrint, 'id'> & { id?: string }) => Promise<void>;
  onDeleteMaterialPrint: (id: string) => Promise<void>;
  onSaveMaterialLaminare: (material: Omit<MaterialLaminare, 'id'> & { id?: string }) => Promise<void>;
  onDeleteMaterialLaminare: (id: string) => Promise<void>;
  onSaveSetariPrintAlb: (setari: SetariPrintAlb) => Promise<void>;
}

export default function MaterialsTab({ 
  data, 
  onSaveMaterialPrint, 
  onDeleteMaterialPrint, 
  onSaveMaterialLaminare, 
  onDeleteMaterialLaminare,
  onSaveSetariPrintAlb 
}: MaterialsTabProps) {
  const [activeTab, setActiveTab] = useState<'print' | 'laminare' | 'setari'>('print');
  const [editingPrint, setEditingPrint] = useState<MaterialPrint | null>(null);
  const [editingLaminare, setEditingLaminare] = useState<MaterialLaminare | null>(null);
  const [editingSetari, setEditingSetari] = useState<SetariPrintAlb | null>(null);
  const [isAddingPrint, setIsAddingPrint] = useState(false);
  const [isAddingLaminare, setIsAddingLaminare] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSavePrint = async () => {
    if (editingPrint && editingPrint.nume && editingPrint.valoare !== undefined && editingPrint.valoare >= 0) {
      try {
        setSaving(true);
        await onSaveMaterialPrint(editingPrint);
        setEditingPrint(null);
        setIsAddingPrint(false);
      } catch (error) {
        console.error('Error saving print material:', error);
        alert('Eroare la salvarea materialului de print');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveLaminare = async () => {
    if (editingLaminare && editingLaminare.nume && editingLaminare.valoare !== undefined && editingLaminare.valoare >= 0) {
      try {
        setSaving(true);
        await onSaveMaterialLaminare(editingLaminare);
        setEditingLaminare(null);
        setIsAddingLaminare(false);
      } catch (error) {
        console.error('Error saving lamination material:', error);
        alert('Eroare la salvarea materialului de laminare');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveSetari = async () => {
    if (editingSetari && editingSetari.valoare !== undefined && editingSetari.valoare >= 0) {
      try {
        setSaving(true);
        await onSaveSetariPrintAlb(editingSetari);
        setEditingSetari(null);
      } catch (error) {
        console.error('Error saving white print settings:', error);
        alert('Eroare la salvarea setărilor de print alb');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeletePrint = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest material de print?')) {
      try {
        setSaving(true);
        await onDeleteMaterialPrint(id);
      } catch (error) {
        console.error('Error deleting print material:', error);
        alert('Eroare la ștergerea materialului de print');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteLaminare = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest material de laminare?')) {
      try {
        setSaving(true);
        await onDeleteMaterialLaminare(id);
      } catch (error) {
        console.error('Error deleting lamination material:', error);
        alert('Eroare la ștergerea materialului de laminare');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Materiale și Setări</h2>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'print'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Materiale Print ({data.materialePrint.length})
        </button>
        <button
          onClick={() => setActiveTab('laminare')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'laminare'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Materiale Laminare ({data.materialeLaminare.length})
        </button>
        <button
          onClick={() => setActiveTab('setari')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'setari'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Setări Print Alb
        </button>
      </div>

      {activeTab === 'print' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Materiale de Print</h3>
            <button
              onClick={() => {
                setEditingPrint({
                  id: '',
                  nume: '',
                  tipCalcul: 'procentual',
                  valoare: 0,
                  permitePrintAlb: false
                });
                setIsAddingPrint(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Material Print
            </button>
          </div>

          {(editingPrint || isAddingPrint) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">
                {isAddingPrint ? 'Adaugă Material Print Nou' : 'Editează Material Print'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume Material
                  </label>
                  <input
                    type="text"
                    value={editingPrint?.nume || ''}
                    onChange={(e) => setEditingPrint(prev => prev ? { ...prev, nume: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip Calcul
                  </label>
                  <select
                    value={editingPrint?.tipCalcul || 'procentual'}
                    onChange={(e) => setEditingPrint(prev => prev ? { ...prev, tipCalcul: e.target.value as 'procentual' | 'suma_fixa' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="procentual">Procentual</option>
                    <option value="suma_fixa">Sumă Fixă</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valoare {editingPrint?.tipCalcul === 'procentual' ? '(%)' : '(RON)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPrint?.valoare || ''}
                    onChange={(e) => setEditingPrint(prev => prev ? { ...prev, valoare: parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="permite-print-alb"
                    checked={editingPrint?.permitePrintAlb || false}
                    onChange={(e) => setEditingPrint(prev => prev ? { ...prev, permitePrintAlb: e.target.checked } : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="permite-print-alb" className="ml-2 block text-sm text-gray-900">
                    Permite Print Alb
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingPrint(null);
                    setIsAddingPrint(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSavePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip Calcul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valoare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Print Alb
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.materialePrint.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {material.nume}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.tipCalcul === 'procentual' ? 'Procentual' : 'Sumă Fixă'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.valoare} {material.tipCalcul === 'procentual' ? '%' : 'RON'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.permitePrintAlb ? 'Da' : 'Nu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingPrint(material)}
                          className="p-2 text-indigo-600 hover:text-indigo-800"
                          disabled={saving}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrint(material.id)}
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
        </div>
      )}

      {activeTab === 'laminare' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Materiale de Laminare</h3>
            <button
              onClick={() => {
                setEditingLaminare({
                  id: '',
                  nume: '',
                  tipCalcul: 'procentual',
                  valoare: 0
                });
                setIsAddingLaminare(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Material Laminare
            </button>
          </div>

          {(editingLaminare || isAddingLaminare) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">
                {isAddingLaminare ? 'Adaugă Material Laminare Nou' : 'Editează Material Laminare'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume Material
                  </label>
                  <input
                    type="text"
                    value={editingLaminare?.nume || ''}
                    onChange={(e) => setEditingLaminare(prev => prev ? { ...prev, nume: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip Calcul
                  </label>
                  <select
                    value={editingLaminare?.tipCalcul || 'procentual'}
                    onChange={(e) => setEditingLaminare(prev => prev ? { ...prev, tipCalcul: e.target.value as 'procentual' | 'suma_fixa' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="procentual">Procentual</option>
                    <option value="suma_fixa">Sumă Fixă</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valoare {editingLaminare?.tipCalcul === 'procentual' ? '(%)' : '(RON)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingLaminare?.valoare || ''}
                    onChange={(e) => setEditingLaminare(prev => prev ? { ...prev, valoare: parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingLaminare(null);
                    setIsAddingLaminare(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveLaminare}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip Calcul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valoare
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.materialeLaminare.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {material.nume}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.tipCalcul === 'procentual' ? 'Procentual' : 'Sumă Fixă'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.valoare} {material.tipCalcul === 'procentual' ? '%' : 'RON'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingLaminare(material)}
                          className="p-2 text-indigo-600 hover:text-indigo-800"
                          disabled={saving}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLaminare(material.id)}
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
        </div>
      )}

      {activeTab === 'setari' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Setări Print Alb</h3>
            <button
              onClick={() => setEditingSetari(data.setariPrintAlb)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editează Setări
            </button>
          </div>

          {editingSetari && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Editează Setări Print Alb</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip Calcul
                  </label>
                  <select
                    value={editingSetari.tipCalcul}
                    onChange={(e) => setEditingSetari(prev => prev ? { ...prev, tipCalcul: e.target.value as 'procentual' | 'suma_fixa' } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="procentual">Procentual</option>
                    <option value="suma_fixa">Sumă Fixă</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valoare {editingSetari.tipCalcul === 'procentual' ? '(%)' : '(RON)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingSetari.valoare}
                    onChange={(e) => setEditingSetari(prev => prev ? { ...prev, valoare: parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingSetari(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveSetari}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-medium mb-4">Setări Curente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Tip Calcul:</span>
                <p className="text-lg">{data.setariPrintAlb.tipCalcul === 'procentual' ? 'Procentual' : 'Sumă Fixă'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Valoare:</span>
                <p className="text-lg font-semibold text-blue-600">
                  {data.setariPrintAlb.valoare} {data.setariPrintAlb.tipCalcul === 'procentual' ? '%' : 'RON'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
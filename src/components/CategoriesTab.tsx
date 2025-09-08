import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, FileDown, FileUp } from 'lucide-react';
import type { AppData, Categorie } from '../hooks/useSupabaseData';
import Papa from 'papaparse';

interface CategoriesTabProps {
  data: AppData;
  onSaveCategorie: (categorie: Omit<Categorie, 'id'> & { id?: string }) => Promise<void>;
  onDeleteCategorie: (id: string) => Promise<void>;
  onRefetch: () => Promise<void>;
}

export default function CategoriesTab({ data, onSaveCategorie, onDeleteCategorie }: CategoriesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [importResults, setImportResults] = useState<{success: number, errors: string[]}>({success: 0, errors: []});
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
        // Auto-trigger import after file is loaded
        setTimeout(() => {
          handleImport(content);
        }, 100);
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async (id: string, nume: string) => {
    if (!nume.trim()) return;
    
    try {
      setSaving(true);
      await onSaveCategorie({ id, nume: nume.trim() });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Eroare la salvarea categoriei');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această categorie?')) {
      try {
        setSaving(true);
        await onDeleteCategorie(id);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Eroare la ștergerea categoriei');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAdd = async () => {
    if (newCategory.trim()) {
      try {
        setSaving(true);
        await onSaveCategorie({ nume: newCategory.trim() });
        setNewCategory('');
        setIsAdding(false);
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Eroare la adăugarea categoriei');
      } finally {
        setSaving(false);
      }
    }
  };

  const exportToCSV = () => {
    const csvData = data.categorii.map(category => ({
      nume: category.nume
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categorii_export_${new Date().toISOString().split('T')[0]}.csv`);
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
        const rowNum = i + 2; // +2 because of header and 0-based index
        
        try {
          // Validate required fields
          if (!row.nume || !row.nume.trim()) {
            errors.push(`Rândul ${rowNum}: Numele categoriei este obligatoriu`);
            continue;
          }
          
          // Check if category already exists
          const existingCategory = data.categorii.find(c => 
            c.nume.toLowerCase() === row.nume.trim().toLowerCase()
          );
          
          if (existingCategory) {
            errors.push(`Rândul ${rowNum}: Categoria "${row.nume.trim()}" există deja`);
            continue;
          }
          
          // Create new category
          await onSaveCategorie({ nume: row.nume.trim() });
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
      { nume: 'SUV' },
      { nume: 'Sedan' },
      { nume: 'Hatchback' },
      { nume: 'Coupe' }
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_categorii.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Categorii Vehicule</h2>
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
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Adaugă Categorie
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nume Categorie
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isAdding && (
                <tr>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nume categorie nouă"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={handleAdd}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      disabled={saving}
                    >
                      {saving ? 'Se salvează...' : 'Adaugă'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewCategory('');
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      Anulează
                    </button>
                  </td>
                </tr>
              )}
              {data.categorii.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900">{category.nume}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === category.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSave(category.id, editingName)}
                          className="p-1 text-green-600 hover:text-green-800"
                          disabled={saving}
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.nume);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Import Categorii din CSV</h3>
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
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instrucțiuni pentru import:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Fișierul CSV trebuie să conțină coloana: <code>nume</code></li>
                  <li>• Numele categoriei este obligatoriu</li>
                  <li>• Categoriile duplicate vor fi ignorate</li>
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

              {/* CSV Input */}
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
                  placeholder="nume&#10;SUV&#10;Sedan&#10;Hatchback&#10;Coupe&#10;&#10;Sau încarcă un fișier CSV mai sus..."
                />
              </div>

              {/* Import Results */}
              {(importResults.success > 0 || importResults.errors.length > 0) && (
                <div className="space-y-3">
                  {importResults.success > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        ✅ {importResults.success} categorii importate cu succes!
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
            
            {/* Action buttons */}
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
                {isImporting ? 'Se importă...' : 'Importă Categorii'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
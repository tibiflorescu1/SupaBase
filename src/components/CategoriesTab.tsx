import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { AppData, Categorie } from '../hooks/useSupabaseData';

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categorii Vehicule</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Adaugă Categorie
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
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
            {data.categorii.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{category.nume}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === category.id ? (
                    <div className="flex justify-end gap-2">
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
                    <div className="flex justify-end gap-2">
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
            {isAdding && (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nume categorie nouă"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
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
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
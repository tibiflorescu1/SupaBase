import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Image, ExternalLink } from 'lucide-react';
import type { VehiclePhoto } from '../hooks/useSupabaseData';

interface VehiclePhotoManagerProps {
  vehicleId: string;
  vehicleName: string;
  photos: VehiclePhoto[];
  onSavePhoto: (photo: Omit<VehiclePhoto, 'id'> & { id?: string, vehicul_id: string }) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

export default function VehiclePhotoManager({ 
  vehicleId, 
  vehicleName, 
  photos, 
  onSavePhoto, 
  onDeletePhoto 
}: VehiclePhotoManagerProps) {
  const [editingPhoto, setEditingPhoto] = useState<VehiclePhoto | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    photoUrl: '',
    photoTitle: '',
    orderIndex: photos.length
  });

  const handleSave = async (photoData: any) => {
    if (!photoData.photoUrl.trim()) {
      alert('URL-ul pozei este obligatoriu');
      return;
    }

    try {
      setSaving(true);
      await onSavePhoto({
        ...photoData,
        vehicul_id: vehicleId,
        orderIndex: photoData.orderIndex || 0
      });
      
      if (isAdding) {
        setNewPhoto({
          photoUrl: '',
          photoTitle: '',
          orderIndex: photos.length + 1
        });
        setIsAdding(false);
      } else {
        setEditingPhoto(null);
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Eroare la salvarea pozei');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această poză?')) {
      try {
        setSaving(true);
        await onDeletePhoto(id);
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Eroare la ștergerea pozei');
      } finally {
        setSaving(false);
      }
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Galerie Poze - {vehicleName}
        </h4>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Adaugă Poză
        </button>
      </div>

      {/* Add new photo form */}
      {isAdding && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium mb-3">Adaugă Poză Nouă</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Poză *
              </label>
              <input
                type="url"
                value={newPhoto.photoUrl}
                onChange={(e) => setNewPhoto({ ...newPhoto, photoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {newPhoto.photoUrl && !validateUrl(newPhoto.photoUrl) && (
                <p className="text-red-600 text-xs mt-1">URL invalid</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titlu/Descriere (opțional)
              </label>
              <input
                type="text"
                value={newPhoto.photoTitle}
                onChange={(e) => setNewPhoto({ ...newPhoto, photoTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex: Vedere frontală, Detaliu capotă..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordine (0 = prima)
              </label>
              <input
                type="number"
                min="0"
                value={newPhoto.orderIndex}
                onChange={(e) => setNewPhoto({ ...newPhoto, orderIndex: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleSave(newPhoto)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              disabled={saving || !newPhoto.photoUrl.trim() || !validateUrl(newPhoto.photoUrl)}
            >
              {saving ? 'Se salvează...' : 'Adaugă'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewPhoto({
                  photoUrl: '',
                  photoTitle: '',
                  orderIndex: photos.length
                });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              Anulează
            </button>
          </div>
        </div>
      )}

      {/* Photos list */}
      <div className="space-y-2">
        {photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nu există poze adăugate</p>
            <p className="text-sm">Adaugă prima poză pentru acest vehicul</p>
          </div>
        ) : (
          photos.map((photo, index) => (
            <div key={photo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={photo.photoUrl}
                  alt={photo.photoTitle || `Poza ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/64x64/e5e7eb/6b7280?text=?';
                  }}
                />
              </div>

              {/* Photo info */}
              {editingPhoto?.id === photo.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={editingPhoto.photoUrl}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, photoUrl: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="URL poză"
                  />
                  <input
                    type="text"
                    value={editingPhoto.photoTitle}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, photoTitle: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Titlu/descriere"
                  />
                  <input
                    type="number"
                    min="0"
                    value={editingPhoto.orderIndex}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, orderIndex: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Ordine"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {photo.photoTitle || `Poza ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {photo.photoUrl}
                  </div>
                  <div className="text-xs text-gray-400">
                    Ordine: {photo.orderIndex}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1">
                <a
                  href={photo.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Deschide poza"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                
                {editingPhoto?.id === photo.id ? (
                  <>
                    <button
                      onClick={() => handleSave(editingPhoto)}
                      className="p-1 text-green-600 hover:text-green-800"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingPhoto(null)}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      disabled={saving}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Settings2, Edit3, Trash2, Plus, Download, Upload, X, Save, Image } from 'lucide-react';
import { AppData, Vehicul, Categorie, Acoperire, OptiuneExtra, Fisier } from '../hooks/useSupabaseData';
import PhotoGallery from './PhotoGallery';
import VehiclePhotoManager from './VehiclePhotoManager';
import { supabase } from '../lib/supabase';

interface ModelsTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Partial<Vehicul>) => Promise<void>;
  onDeleteVehicul: (id: string) => Promise<void>;
  onSaveAcoperire: (acoperire: Partial<Acoperire>, file?: File) => Promise<void>;
  onDeleteAcoperire: (id: string) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Partial<OptiuneExtra>, file?: File) => Promise<void>;
  onDeleteOptiuneExtra: (id: string) => Promise<void>;
  onRefetch: () => void;
}

export default function ModelsTab({ 
  data, 
  onSaveVehicul, 
  onDeleteVehicul, 
  onSaveAcoperire, 
  onDeleteAcoperire, 
  onSaveOptiuneExtra, 
  onDeleteOptiuneExtra, 
  onSaveVehiclePhoto,
  onDeleteVehiclePhoto,
  onRefetch 
}: ModelsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducer, setSelectedProducer] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [showPhotoManager, setShowPhotoManager] = useState<string | null>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState<string | null>(null);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [photoFeatureAvailable, setPhotoFeatureAvailable] = useState(true);

  const filteredVehicles = useMemo(() => {
    return data.vehicule.filter(vehicle => {
      const searchMatch = searchTerm === '' || 
        (vehicle.producator && vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const categoryMatch = selectedCategory === '' || vehicle.categorieId === selectedCategory;
      const producerMatch = selectedProducer === '' || vehicle.producator === selectedProducer;
      
      return searchMatch && categoryMatch && producerMatch;
    });
  }, [data.vehicule, searchTerm, selectedCategory, selectedProducer]);

  // Get unique producers for filter dropdown
  const uniqueProducers = [...new Set(data.vehicule.map(v => v.producator))].sort();

  // Get category name helper
  const getCategoryName = (categoryId: string) => {
    const category = data.categorii.find(cat => cat.id === categoryId);
    return category ? category.nume : 'Necunoscută';
  };

  const downloadFile = (fisier: Fisier) => {
    const link = document.createElement('a');
    link.href = fisier.dataUrl;
    link.download = fisier.nume;
    link.click();
  };

  const handleAddVehicle = async () => {
    try {
      await onSaveVehicul({
        producator: newVehicle.producator,
        model: newVehicle.model,
        categorieId: newVehicle.categorieId,
        perioadaFabricatie: newVehicle.perioadaFabricatie
      });
      
      setNewVehicle({
        producator: '',
        model: '',
        categorieId: '',
        perioadaFabricatie: ''
      });
      setShowAddForm(false);
      onRefetch();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    
    try {
      await onSaveVehicul(editingVehicle);
      setEditingVehicle(null);
      onRefetch();
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest vehicul?')) return;
    
    try {
      await onDeleteVehicul(vehicleId);
      onRefetch();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handlePhotoGalleryOpen = (vehicleId: string, startIndex: number = 0) => {
    setShowPhotoGallery(vehicleId);
    setGalleryStartIndex(startIndex);
  };

  const handlePhotoGalleryClose = () => {
    setShowPhotoGallery(null);
  };

  // Check if photo feature is available
  useEffect(() => {
    const checkPhotoFeature = async () => {
      try {
        const { error } = await supabase.from('vehicle_photos').select('id').limit(1);
        setPhotoFeatureAvailable(!error);
      } catch {
        setPhotoFeatureAvailable(false);
      }
    };
    checkPhotoFeature();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Modele Vehicule</h2>
        <div className="text-sm text-gray-600">
          Total vehicule: {data.vehicule.length} | Afișate: {filteredVehicles.length}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adaugă Model
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Caută după producător sau model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toate categoriile</option>
          {data.categorii.map(category => (
            <option key={category.id} value={category.id}>
              {category.nume}
            </option>
          ))}
        </select>
        <select
          value={selectedProducer}
          onChange={(e) => setSelectedProducer(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toți producătorii</option>
          {uniqueProducers.map(producer => (
            <option key={producer} value={producer}>
              {producer}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const acoperiri = vehicle.acoperiri || [];
          const optiuni = vehicle.optiuniExtra || [];
          
          return (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.producator} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getCategoryName(vehicle.categorieId)}
                    </p>
                    {vehicle.perioadaFabricatie && (
                      <p className="text-xs text-gray-500">
                        {vehicle.perioadaFabricatie}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingVehicle(vehicle)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Editează"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Șterge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acoperiri:</span>
                    <span className="font-medium">{acoperiri.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Opțiuni extra:</span>
                    <span className="font-medium">{optiuni.length}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingVehicle(vehicle)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Vezi detalii
                      </button>
                      <div className="flex-1">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowPhotoManager(vehicle.id)}
                            className="flex items-center px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            disabled={!photoFeatureAvailable}
                            title={!photoFeatureAvailable ? 'Funcția de poze nu este disponibilă încă' : 'Gestionează pozele vehiculului'}
                          >
                            <Image className="w-4 h-4 mr-1" />
                            {photoFeatureAvailable ? 'Gestionează poze' : 'Poze (indisponibil)'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Photos */}
                  {photoFeatureAvailable && vehicle.photos && vehicle.photos.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Poze ({vehicle.photos.length})
                      </h5>
                      <div className="grid grid-cols-3 gap-2">
                        {vehicle.photos.slice(0, 6).map((photo, index) => (
                          <div
                            key={photo.id}
                            className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handlePhotoGalleryOpen(vehicle.id, index)}
                          >
                            <img
                              src={photo.photoUrl}
                              alt={photo.photoTitle || `Poza ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/150x150/e5e7eb/6b7280?text=Eroare';
                              }}
                            />
                          </div>
                        ))}
                        {vehicle.photos.length > 6 && (
                          <div
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => handlePhotoGalleryOpen(vehicle.id, 6)}
                          >
                            <span className="text-sm text-gray-600">
                              +{vehicle.photos.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Manager Modal */}
      {showPhotoManager && photoFeatureAvailable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Gestionează Poze: {data.vehicule.find(v => v.id === showPhotoManager)?.producator} {data.vehicule.find(v => v.id === showPhotoManager)?.model}
              </h3>
              <button
                onClick={() => setShowPhotoManager(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <VehiclePhotoManager
              vehicleId={showPhotoManager}
              vehicleName={`${data.vehicule.find(v => v.id === showPhotoManager)?.producator} ${data.vehicule.find(v => v.id === showPhotoManager)?.model}`}
              photos={data.vehicule.find(v => v.id === showPhotoManager)?.photos || []}
              onSavePhoto={onSaveVehiclePhoto}
              onDeletePhoto={onDeleteVehiclePhoto}
            />
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {showPhotoGallery && photoFeatureAvailable && (
        <PhotoGallery
          photos={data.vehicule.find(v => v.id === showPhotoGallery)?.photos || []}
          isOpen={!!showPhotoGallery}
          onClose={handlePhotoGalleryClose}
          initialIndex={galleryStartIndex}
        />
      )}
    </div>
  );
}
import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Settings2, Edit3, Trash2, Plus, Download, Upload, X, Save, Search, Car, FileText, ExternalLink, Link, Globe, Image } from 'lucide-react';
import { AppData, Vehicul, Categorie, Acoperire, OptiuneExtra, Fisier } from '../hooks/useSupabaseData';

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
  onRefetch 
}: ModelsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducer, setSelectedProducer] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicul | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicul | null>(null);
  const [editingDetails, setEditingDetails] = useState<Vehicul | null>(null);
  const [newAcoperire, setNewAcoperire] = useState({ nume: '', pret: 0 });
  const [newOptiune, setNewOptiune] = useState({ nume: '', pret: 0 });
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    producator: '',
    model: '',
    categorieId: '',
    perioadaFabricatie: ''
  });
  const [tempVehicleData, setTempVehicleData] = useState<any>(null);
  const [fixingCategories, setFixingCategories] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [imageUploadMethod, setImageUploadMethod] = useState<'upload' | 'link' | 'search'>('link');
  const [imageLinks, setImageLinks] = useState<string[]>(['']);
  const [searchingImages, setSearchingImages] = useState(false);

  // Get unique producers for filter dropdown - filtered by selected category
  const uniqueProducers = useMemo(() => {
    const producers = selectedCategory === '' 
      ? data.vehicule.map(v => v.producator).filter(Boolean)
      : data.vehicule.filter(v => v.categorieId === selectedCategory).map(v => v.producator).filter(Boolean);
    return [...new Set(producers)].filter(p => p && p.trim() !== '').sort();
  }, [data.vehicule, selectedCategory]);

  // Reset producer filter when category changes
  useEffect(() => {
    if (selectedCategory && selectedProducer && !uniqueProducers.includes(selectedProducer)) {
      setSelectedProducer('');
    }
  }, [selectedCategory, selectedProducer, uniqueProducers]);

  const filteredVehicles = data.vehicule.filter(vehicle => {
    const searchMatch = searchTerm === '' || 
      (vehicle.producator && vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const categoryMatch = selectedCategory === '' || vehicle.categorieId === selectedCategory;
    const producerMatch = selectedProducer === '' || vehicle.producator === selectedProducer;
    
    return searchMatch && categoryMatch && producerMatch;
  });

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
      // Prepare vehicle data with images
      const vehiculData = {
        producator: newVehicle.producator,
        model: newVehicle.model,
        categorieId: newVehicle.categorieId,
        perioadaFabricatie: newVehicle.perioadaFabricatie,
        imagine: vehicleImages.length > 0 ? vehicleImages[0] : undefined // Use first image as main
      };
      
      await onSaveVehicul(vehiculData);
      
      setNewVehicle({
        producator: '',
        model: '',
        categorieId: '',
        perioadaFabricatie: ''
      });
      setShowAddForm(false);
      setVehicleImages([]);
      setImageLinks(['']);
      onRefetch();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    
    try {
      await onSaveVehicul(editingVehicle);
      // Doar după salvarea vehiculului facem refetch pentru a actualiza lista
      await onRefetch();
      setEditingVehicle(null);
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

  const handleAddAcoperire = async (vehicleId: string) => {
    try {
      const savedAcoperire = await onSaveAcoperire({
        nume: newAcoperire.nume,
        pret: newAcoperire.pret,
        vehicul_id: vehicleId
      });
      
      // Add to local state with real ID from database
      const realAcoperire: Acoperire = {
        id: savedAcoperire.id,
        nume: savedAcoperire.nume,
        pret: Number(savedAcoperire.pret),
        linkFisier: savedAcoperire.link_fisier || undefined,
        fisier: savedAcoperire.fisier_id ? { nume: newAcoperire.file?.name || 'File', dataUrl: '' } : undefined
      };
        const savedAcoperireData = await onSaveAcoperire({
          ...newAcoperire,
          vehicul_id: vehicleId
        });
        
        setTempVehicleData(prev => ({
          ...prev,
          acoperiri: [...prev.acoperiri, savedAcoperireData]
        }));
        
      
      setNewAcoperire({ nume: '', pret: 0 });
      
      // Refresh data to show the new item
      onRefetch();
    } catch (error) {
      console.error('Error adding acoperire:', error);
      alert('Eroare la adăugarea acoperirii');
    }
  };

  const handleAddOptiune = async (vehicleId: string) => {
    try {
      const savedOptiune = await onSaveOptiuneExtra({
        nume: newOptiune.nume,
        pret: newOptiune.pret,
        vehicul_id: vehicleId
      });
      
      // Add to local state with real ID from database
      const realOptiune: OptiuneExtra = {
        id: savedOptiune.id,
        nume: savedOptiune.nume,
        pret: Number(savedOptiune.pret),
        linkFisier: savedOptiune.link_fisier || undefined,
        fisier: savedOptiune.fisier_id ? { nume: newOptiune.file?.name || 'File', dataUrl: '' } : undefined
      };
      
      setEditingDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          optiuniExtra: [...prev.optiuniExtra, realOptiune]
        };
      });
      
      setNewOptiune({ nume: '', pret: 0 });
      
      // Refresh data to show the new item
      onRefetch();
    } catch (error) {
      console.error('Error adding optiune:', error);
      alert('Eroare la adăugarea opțiunii');
    }
  };

  const handleUpdateAcoperire = async (acoperire: Acoperire, file?: File) => {
    try {
      if (file) {
        // Upload file and update local state
        const result = await onSaveAcoperire({ ...acoperire, file } as any);
        
        // Update local editing state with file info
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            acoperiri: prev.acoperiri.map(ac => 
              ac.id === acoperire.id 
                ? { 
                    ...ac, 
                    fisier: { nume: file.name, dataUrl: URL.createObjectURL(file) }
                  }
                : ac
            )
          };
        });
      }
    } catch (error) {
      console.error('Error updating acoperire:', error);
    }
  };

  const handleUpdateOptiune = async (optiune: OptiuneExtra, file?: File) => {
    try {
      if (file) {
        // Upload file and update local state
        const result = await onSaveOptiuneExtra({ ...optiune, file } as any);
        
        // Update local editing state with file info
        setEditingDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            optiuniExtra: prev.optiuniExtra.map(opt => 
              opt.id === optiune.id 
                ? { 
                    ...opt, 
                    fisier: { nume: file.name, dataUrl: URL.createObjectURL(file) }
                  }
                : opt
            )
          };
        });
      }
    } catch (error) {
      console.error('Error updating optiune:', error);
    }
  };

  const handleDeleteAcoperire = async (acoperireId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această acoperire?')) return;
    
    try {
      await onDeleteAcoperire(acoperireId);
      // Update local state immediately
      setEditingDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          acoperiri: prev.acoperiri.filter(ac => ac.id !== acoperireId)
        };
      });
    } catch (error) {
      console.error('Error deleting acoperire:', error);
    }
  };

  const handleDeleteOptiune = async (optiuneId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această opțiune?')) return;
    
    try {
      await onDeleteOptiuneExtra(optiuneId);
      // Update local state immediately
      setEditingDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          optiuniExtra: prev.optiuniExtra.filter(opt => opt.id !== optiuneId)
        };
      });
    } catch (error) {
      console.error('Error deleting optiune:', error);
    }
  };
  // Save all changes function
  const handleSaveAllChanges = async () => {
    if (!editingDetails) return;
    
    try {
      // Salvează modificările pentru acoperiri și opțiuni existente (fără refetch)
      for (const acoperire of editingDetails.acoperiri) {
        await onSaveAcoperire({
          id: acoperire.id,
          nume: acoperire.nume,
          pret: acoperire.pret,
          vehicul_id: editingDetails.id,
          linkFisier: acoperire.linkFisier
        });
      }
      
      // Save all optiuni changes
      for (const optiune of editingDetails.optiuniExtra) {
        await onSaveOptiuneExtra({
          id: optiune.id,
          nume: optiune.nume,
          pret: optiune.pret,
          vehicul_id: editingDetails.id,
          linkFisier: optiune.linkFisier
        });
      }
      
      // Doar la final facem refetch pentru a sincroniza totul
      await onRefetch();
      setEditingDetails(null);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Eroare la salvarea modificărilor');
    }
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
  };

  // Auto-search images function
  const searchVehicleImages = async () => {
    if (!newVehicle?.producator || !newVehicle?.model) {
      alert('Completează producătorul și modelul pentru căutare automată');
      return;
    }

    setSearchingImages(true);
    try {
      // Simulate image search - in real implementation, you'd use an API like Unsplash, Pexels, or Google Images
      const searchQuery = `${newVehicle.producator} ${newVehicle.model}`;
      
      // Mock results - replace with actual API call
      const mockImages = [
        `https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop&q=80`,
        `https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop&q=80`,
        `https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop&q=80`
      ];
      
      setVehicleImages(mockImages);
      
      // In a real implementation, you might use:
      // const response = await fetch(`/api/search-images?q=${encodeURIComponent(searchQuery)}`);
      // const data = await response.json();
      // setVehicleImages(data.images);
      
    } catch (error) {
      console.error('Error searching images:', error);
      alert('Eroare la căutarea imaginilor');
    } finally {
      setSearchingImages(false);
    }
  };

  // Handle image link changes
  const handleImageLinkChange = (index: number, value: string) => {
    const newLinks = [...imageLinks];
    newLinks[index] = value;
    setImageLinks(newLinks);
    
    // Update vehicle images with valid URLs
    const validImages = newLinks.filter(link => link.trim() && link.startsWith('http'));
    setVehicleImages(validImages);
  };

  // Add new image link field
  const addImageLinkField = () => {
    if (imageLinks.length < 5) {
      setImageLinks([...imageLinks, '']);
    }
  };

  // Remove image link field
  const removeImageLinkField = (index: number) => {
    if (imageLinks.length > 1) {
      const newLinks = imageLinks.filter((_, i) => i !== index);
      setImageLinks(newLinks);
      const validImages = newLinks.filter(link => link.trim() && link.startsWith('http'));
      setVehicleImages(validImages);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producător
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perioada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acoperiri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opțiuni
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVehicles.map((vehicle) => {
              const acoperiri = vehicle.acoperiri || [];
              const optiuni = vehicle.optiuniExtra || [];
              
              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.producator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(vehicle.categorieId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.perioadaFabricatie || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {acoperiri.length} acoperiri
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {optiuni.length} opțiuni
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => setViewingVehicle(vehicle)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Vezi detalii"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Edit Details Button */}
                      <button
                        onClick={() => setEditingDetails(vehicle)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editează acoperiri și opțiuni"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      
                      {/* Edit Vehicle Button */}
                      <button
                        onClick={() => setEditingVehicle(vehicle)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editează model"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Șterge model"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Adaugă Model Nou</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producător
                </label>
                <input
                  type="text"
                  value={newVehicle.producator}
                  onChange={(e) => setNewVehicle({ ...newVehicle, producator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={newVehicle.categorieId}
                  onChange={(e) => setNewVehicle({ ...newVehicle, categorieId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selectează categoria</option>
                  {data.categorii.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nume}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perioada fabricație
                </label>
                <input
                  type="text"
                  value={newVehicle.perioadaFabricatie}
                  onChange={(e) => setNewVehicle({ ...newVehicle, perioadaFabricatie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 2020-2024"
                />
              </div>
              
              {/* Vehicle Images Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Imagini Vehicul</h4>
                
                {/* Image Upload Method Selection */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('link')}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                      imageUploadMethod === 'link'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Link-uri
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('search')}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                      imageUploadMethod === 'search'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Căutare Auto
                  </button>
                </div>

                {/* Link Method */}
                {imageUploadMethod === 'link' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Adaugă link-uri către imagini (Google Drive, Imgur, etc.)
                    </p>
                    {imageLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={link}
                          onChange={(e) => handleImageLinkChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500
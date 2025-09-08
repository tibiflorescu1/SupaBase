import React, { useState } from 'react';
import { Eye, Settings2, Edit3, Trash2, Plus, Download, Upload, X } from 'lucide-react';

interface Vehicle {
  id: string;
  producator: string;
  model: string;
  categorie_id: string;
  perioada_fabricatie: string;
}

interface Category {
  id: string;
  nume: string;
}

interface Acoperire {
  id: string;
  vehicul_id: string;
  nume: string;
  pret: number;
  fisier_id?: string;
}

interface OptiuneExtra {
  id: string;
  vehicul_id: string;
  nume: string;
  pret: number;
  fisier_id?: string;
}

interface Fisier {
  id: string;
  nume: string;
  data_url: string;
}

interface ModelsTabProps {
  data: {
    vehicule: Vehicle[];
    categorii: Category[];
    acoperiri: Acoperire[];
    optiuni_extra: OptiuneExtra[];
    fisiere: Fisier[];
  };
  onRefresh: () => void;
}

export default function ModelsTab({ data, onRefresh }: ModelsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [editingDetails, setEditingDetails] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    producator: '',
    model: '',
    categorie_id: '',
    perioada_fabricatie: ''
  });

  const [newAcoperire, setNewAcoperire] = useState({ nume: '', pret: 0 });
  const [newOptiune, setNewOptiune] = useState({ nume: '', pret: 0 });
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const filteredVehicles = data.vehicule.filter(vehicle =>
    vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(vehicle =>
    selectedCategory === '' || vehicle.categorie_id === selectedCategory
  );

  const getCategoryName = (categoryId: string) => {
    const category = data.categorii.find(cat => cat.id === categoryId);
    return category ? category.nume : 'Necunoscută';
  };

  const getVehicleAcoperiri = (vehicleId: string) => {
    return data.acoperiri.filter(ac => ac.vehicul_id === vehicleId);
  };

  const getVehicleOptiuni = (vehicleId: string) => {
    return data.optiuni_extra.filter(opt => opt.vehicul_id === vehicleId);
  };

  const getFileName = (fileId: string) => {
    const file = data.fisiere.find(f => f.id === fileId);
    return file ? file.nume : 'Fișier necunoscut';
  };

  const downloadFile = (fileId: string) => {
    const file = data.fisiere.find(f => f.id === fileId);
    if (file) {
      const link = document.createElement('a');
      link.href = file.data_url;
      link.download = file.nume;
      link.click();
    }
  };

  const handleFileUpload = async (file: File, type: 'acoperire' | 'optiune', itemId?: string) => {
    try {
      setUploadingFile(itemId || 'new');
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        // Simulate file upload to database
        const newFile = {
          id: crypto.randomUUID(),
          nume: file.name,
          data_url: dataUrl
        };
        
        // Here you would normally save to Supabase
        console.log('Uploading file:', newFile);
        
        setUploadingFile(null);
        onRefresh();
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingFile(null);
    }
  };

  const handleAddVehicle = async () => {
    try {
      // Here you would normally save to Supabase
      console.log('Adding vehicle:', newVehicle);
      
      setNewVehicle({
        producator: '',
        model: '',
        categorie_id: '',
        perioada_fabricatie: ''
      });
      setShowAddForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    
    try {
      // Here you would normally update in Supabase
      console.log('Updating vehicle:', editingVehicle);
      
      setEditingVehicle(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest vehicul?')) return;
    
    try {
      // Here you would normally delete from Supabase
      console.log('Deleting vehicle:', vehicleId);
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleAddAcoperire = async (vehicleId: string) => {
    try {
      // Here you would normally save to Supabase
      console.log('Adding acoperire:', { ...newAcoperire, vehicul_id: vehicleId });
      
      setNewAcoperire({ nume: '', pret: 0 });
      onRefresh();
    } catch (error) {
      console.error('Error adding acoperire:', error);
    }
  };

  const handleAddOptiune = async (vehicleId: string) => {
    try {
      // Here you would normally save to Supabase
      console.log('Adding optiune:', { ...newOptiune, vehicul_id: vehicleId });
      
      setNewOptiune({ nume: '', pret: 0 });
      onRefresh();
    } catch (error) {
      console.error('Error adding optiune:', error);
    }
  };

  const handleUpdateAcoperire = async (acoperire: Acoperire) => {
    try {
      // Here you would normally update in Supabase
      console.log('Updating acoperire:', acoperire);
      onRefresh();
    } catch (error) {
      console.error('Error updating acoperire:', error);
    }
  };

  const handleUpdateOptiune = async (optiune: OptiuneExtra) => {
    try {
      // Here you would normally update in Supabase
      console.log('Updating optiune:', optiune);
      onRefresh();
    } catch (error) {
      console.error('Error updating optiune:', error);
    }
  };

  const handleDeleteAcoperire = async (acoperireId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această acoperire?')) return;
    
    try {
      // Here you would normally delete from Supabase
      console.log('Deleting acoperire:', acoperireId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting acoperire:', error);
    }
  };

  const handleDeleteOptiune = async (optiuneId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această opțiune?')) return;
    
    try {
      // Here you would normally delete from Supabase
      console.log('Deleting optiune:', optiuneId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting optiune:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Modele Vehicule</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adaugă Model
        </button>
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
              const acoperiri = getVehicleAcoperiri(vehicle.id);
              const optiuni = getVehicleOptiuni(vehicle.id);
              
              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vehicle.producator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryName(vehicle.categorie_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.perioada_fabricatie || '-'}
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
                  value={newVehicle.categorie_id}
                  onChange={(e) => setNewVehicle({ ...newVehicle, categorie_id: e.target.value })}
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
                  value={newVehicle.perioada_fabricatie}
                  onChange={(e) => setNewVehicle({ ...newVehicle, perioada_fabricatie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 2020-2024"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddVehicle}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Adaugă
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editează Model</h3>
              <button
                onClick={() => setEditingVehicle(null)}
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
                  value={editingVehicle.producator}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, producator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={editingVehicle.model}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={editingVehicle.categorie_id}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, categorie_id: e.target.value })}
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
                  value={editingVehicle.perioada_fabricatie}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, perioada_fabricatie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 2020-2024"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateVehicle}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Salvează
              </button>
              <button
                onClick={() => setEditingVehicle(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {viewingVehicle.producator} {viewingVehicle.model}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Vizualizare (doar citire)
                </span>
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Informații vehicul</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Categorie:</span>
                    <span className="ml-2 font-medium">{getCategoryName(viewingVehicle.categorie_id)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Perioada:</span>
                    <span className="ml-2 font-medium">{viewingVehicle.perioada_fabricatie || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Acoperiri */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Acoperiri disponibile</h4>
                <div className="space-y-2">
                  {getVehicleAcoperiri(viewingVehicle.id).map((acoperire) => (
                    <div key={acoperire.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{acoperire.nume}</span>
                        <span className="ml-3 text-green-600 font-semibold">{acoperire.pret} RON</span>
                      </div>
                      {acoperire.fisier_id && (
                        <button
                          onClick={() => downloadFile(acoperire.fisier_id!)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {getFileName(acoperire.fisier_id)}
                        </button>
                      )}
                    </div>
                  ))}
                  {getVehicleAcoperiri(viewingVehicle.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nu există acoperiri definite</p>
                  )}
                </div>
              </div>

              {/* Opțiuni Extra */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Opțiuni extra disponibile</h4>
                <div className="space-y-2">
                  {getVehicleOptiuni(viewingVehicle.id).map((optiune) => (
                    <div key={optiune.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{optiune.nume}</span>
                        <span className="ml-3 text-green-600 font-semibold">{optiune.pret} RON</span>
                      </div>
                      {optiune.fisier_id && (
                        <button
                          onClick={() => downloadFile(optiune.fisier_id!)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {getFileName(optiune.fisier_id)}
                        </button>
                      )}
                    </div>
                  ))}
                  {getVehicleOptiuni(viewingVehicle.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nu există opțiuni extra definite</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Editează: {editingDetails.producator} {editingDetails.model}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Mod editare
                </span>
                <button
                  onClick={() => setEditingDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Acoperiri */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Acoperiri disponibile</h4>
                  <button
                    onClick={() => handleAddAcoperire(editingDetails.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă acoperire
                  </button>
                </div>
                
                {/* Add new acoperire form */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nume acoperire</label>
                      <input
                        type="text"
                        value={newAcoperire.nume}
                        onChange={(e) => setNewAcoperire({ ...newAcoperire, nume: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="ex: Folie transparentă"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Preț (RON)</label>
                      <input
                        type="number"
                        value={newAcoperire.pret}
                        onChange={(e) => setNewAcoperire({ ...newAcoperire, pret: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => handleAddAcoperire(editingDetails.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {getVehicleAcoperiri(editingDetails.id).map((acoperire) => (
                    <div key={acoperire.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={acoperire.nume}
                          onChange={(e) => handleUpdateAcoperire({ ...acoperire, nume: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded font-medium"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={acoperire.pret}
                          onChange={(e) => handleUpdateAcoperire({ ...acoperire, pret: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-green-600 font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {acoperire.fisier_id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => downloadFile(acoperire.fisier_id!)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-500">{getFileName(acoperire.fisier_id)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Fără fișier</span>
                        )}
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'acoperire', acoperire.id);
                          }}
                          className="hidden"
                          id={`file-acoperire-${acoperire.id}`}
                        />
                        <label
                          htmlFor={`file-acoperire-${acoperire.id}`}
                          className="cursor-pointer text-green-600 hover:text-green-800"
                        >
                          <Upload className="w-4 h-4" />
                        </label>
                        <button
                          onClick={() => handleDeleteAcoperire(acoperire.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {getVehicleAcoperiri(editingDetails.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nu există acoperiri definite</p>
                  )}
                </div>
              </div>

              {/* Opțiuni Extra */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Opțiuni extra disponibile</h4>
                  <button
                    onClick={() => handleAddOptiune(editingDetails.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă opțiune
                  </button>
                </div>
                
                {/* Add new optiune form */}
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nume opțiune</label>
                      <input
                        type="text"
                        value={newOptiune.nume}
                        onChange={(e) => setNewOptiune({ ...newOptiune, nume: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="ex: Decupare personalizată"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Preț (RON)</label>
                      <input
                        type="number"
                        value={newOptiune.pret}
                        onChange={(e) => setNewOptiune({ ...newOptiune, pret: Number(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => handleAddOptiune(editingDetails.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {getVehicleOptiuni(editingDetails.id).map((optiune) => (
                    <div key={optiune.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={optiune.nume}
                          onChange={(e) => handleUpdateOptiune({ ...optiune, nume: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded font-medium"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={optiune.pret}
                          onChange={(e) => handleUpdateOptiune({ ...optiune, pret: Number(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-green-600 font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {optiune.fisier_id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => downloadFile(optiune.fisier_id!)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-500">{getFileName(optiune.fisier_id)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Fără fișier</span>
                        )}
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'optiune', optiune.id);
                          }}
                          className="hidden"
                          id={`file-optiune-${optiune.id}`}
                        />
                        <label
                          htmlFor={`file-optiune-${optiune.id}`}
                          className="cursor-pointer text-green-600 hover:text-green-800"
                        >
                          <Upload className="w-4 h-4" />
                        </label>
                        <button
                          onClick={() => handleDeleteOptiune(optiune.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {getVehicleOptiuni(editingDetails.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nu există opțiuni extra definite</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
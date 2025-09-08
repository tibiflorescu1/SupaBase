import React, { useState } from 'react';
import { Car, Settings, Package, Palette, FileText, Loader2, AlertCircle } from 'lucide-react';
import CategoriesTab from './components/CategoriesTab';
import ModelsTab from './components/ModelsTab';
import { useSupabaseData } from './hooks/useSupabaseData';

type Tab = 'models' | 'categories' | 'materials' | 'settings' | 'pricing';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('models');
  const { data, loading, error, refetch, saveCategorie, deleteCategorie, saveVehicul, deleteVehicul } = useSupabaseData();

  const tabs = [
    { id: 'models' as Tab, label: 'Modele Vehicule', icon: Car },
    { id: 'categories' as Tab, label: 'Categorii', icon: Package },
    { id: 'materials' as Tab, label: 'Materiale', icon: Palette },
    { id: 'settings' as Tab, label: 'Setări', icon: Settings },
    { id: 'pricing' as Tab, label: 'Calculare Preț', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Se încarcă datele...</h2>
          <p className="text-gray-600">Conectare la baza de date Supabase</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Eroare de conexiune</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Vehicle Graphics Pricing
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Conectat la Supabase</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'categories' && (
            <CategoriesTab 
              data={data} 
              onSaveCategorie={saveCategorie}
              onDeleteCategorie={deleteCategorie}
              onRefetch={refetch}
            />
          )}
          {activeTab === 'models' && (
            <ModelsTab 
              data={data} 
              onSaveVehicul={saveVehicul}
              onDeleteVehicul={deleteVehicul}
              onRefetch={refetch}
            />
          )}
          {activeTab === 'materials' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Materiale Print și Laminare</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Materiale Print</h3>
                  <div className="space-y-2">
                    {data.materialePrint.map((material) => (
                      <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{material.nume}</span>
                          {material.permitePrintAlb && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Print alb disponibil
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {material.tipCalcul === 'procentual' ? `${material.valoare}%` : `${material.valoare} RON`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Materiale Laminare</h3>
                  <div className="space-y-2">
                    {data.materialeLaminare.map((material) => (
                      <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{material.nume}</span>
                        <span className="text-sm text-gray-600">
                          {material.tipCalcul === 'procentual' ? `${material.valoare}%` : `${material.valoare} RON`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Setări Print Alb</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Cost print alb</span>
                  <span className="text-sm text-gray-600">
                    {data.setariPrintAlb.tipCalcul === 'procentual' 
                      ? `${data.setariPrintAlb.valoare}%` 
                      : `${data.setariPrintAlb.valoare} RON`}
                  </span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'pricing' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Calculare Preț</h2>
              <p className="text-gray-600">Funcționalitatea de calculare preț va fi implementată aici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
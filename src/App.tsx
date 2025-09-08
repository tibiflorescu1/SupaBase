import React, { useState } from 'react';
import { Car, Package, Calculator, FolderOpen, Loader2, AlertCircle } from 'lucide-react';
import { useSupabaseData } from './hooks/useSupabaseData';
import CategoriesTab from './components/CategoriesTab';
import ModelsTab from './components/ModelsTab';
import MaterialsTab from './components/MaterialsTab';
import CalculatorTab from './components/CalculatorTab';

type TabType = 'categories' | 'models' | 'materials' | 'calculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const { 
    data, 
    loading, 
    error, 
    refetch,
    saveCategorie,
    deleteCategorie,
    saveVehicul,
    deleteVehicul,
    saveAcoperire,
    deleteAcoperire,
    saveOptiuneExtra,
    deleteOptiuneExtra,
    saveMaterialPrint,
    deleteMaterialPrint,
    saveMaterialLaminare,
    deleteMaterialLaminare,
    saveSetariPrintAlb
  } = useSupabaseData();

  const tabs = [
    { id: 'categories' as TabType, label: 'Categorii', icon: FolderOpen, count: data.categorii.length },
    { id: 'models' as TabType, label: 'Modele', icon: Car, count: data.vehicule.length },
    { id: 'materials' as TabType, label: 'Materiale', icon: Package, count: data.materialePrint.length + data.materialeLaminare.length },
    { id: 'calculator' as TabType, label: 'Calculator', icon: Calculator, count: null }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Se încarcă datele...</h2>
          <p className="text-gray-600">Conectare la Supabase și sincronizare date</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Eroare de conectare</h2>
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vehicle Graphics Pricing</h1>
                <p className="text-sm text-gray-600">Sistem de calculare prețuri pentru grafică auto</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Conectat la Supabase
                </span>
              </div>
              <button
                onClick={refetch}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Reîncarcă datele"
              >
                <Loader2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            onSaveAcoperire={saveAcoperire}
            onDeleteAcoperire={deleteAcoperire}
            onSaveOptiuneExtra={saveOptiuneExtra}
            onDeleteOptiuneExtra={deleteOptiuneExtra}
            onRefetch={refetch}
          />
        )}
        
        {activeTab === 'materials' && (
          <MaterialsTab
            data={data}
            onSaveMaterialPrint={saveMaterialPrint}
            onDeleteMaterialPrint={deleteMaterialPrint}
            onSaveMaterialLaminare={saveMaterialLaminare}
            onDeleteMaterialLaminare={deleteMaterialLaminare}
            onSaveSetariPrintAlb={saveSetariPrintAlb}
          />
        )}
        
        {activeTab === 'calculator' && (
          <CalculatorTab data={data} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>© 2024 Vehicle Graphics Pricing Application</p>
            <div className="flex items-center space-x-4">
              <span>Categorii: {data.categorii.length}</span>
              <span>Vehicule: {data.vehicule.length}</span>
              <span>Materiale: {data.materialePrint.length + data.materialeLaminare.length}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
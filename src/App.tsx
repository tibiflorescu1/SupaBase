import React, { useState } from 'react';
import { Calculator, Car, Settings, FolderOpen, Database, FileSpreadsheet, Users, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from './hooks/useSupabaseData';
import CategoriesTab from './components/CategoriesTab';
import ModelsTab from './components/ModelsTab';
import MaterialsTab from './components/MaterialsTab';
import CalculatorTab from './components/CalculatorTab';
import ImportExportTab from './components/ImportExportTab';
import DatabaseStatus from './components/DatabaseStatus';

type Tab = 'calculator' | 'models' | 'categories' | 'materials' | 'import-export' | 'users';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Eroare de conexiune!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'calculator' as Tab, name: 'Calculator', icon: Calculator },
    { id: 'models' as Tab, name: 'Modele', icon: Car },
    { id: 'categories' as Tab, name: 'Categorii', icon: FolderOpen },
    { id: 'materials' as Tab, name: 'Materiale', icon: Settings },
    { id: 'import-export' as Tab, name: 'Import/Export', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Vehicle Graphics Pricing
                </h1>
                <p className="text-sm text-gray-600">
                  Sistem de calculare prețuri pentru grafică vehicule
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Vehicule total: {data.vehicule.length}</span>
                <span>Unice (nume): {new Set(data.vehicule.map(v => `${v.producator}_${v.model}`)).size}</span>
                <span>Categorii: {data.categorii.length}</span>
                <span>Materiale: {data.materialePrint.length + data.materialeLaminare.length}</span>
              </div>
              <button
                onClick={() => setShowDatabaseStatus(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Verifică DB</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <TabButton key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' && <CalculatorTab data={data} />}
        
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
        
        {activeTab === 'import-export' && (
          <ImportExportTab
            data={data}
            onSaveVehicul={saveVehicul}
            onSaveCategorie={saveCategorie}
            onSaveAcoperire={saveAcoperire}
            onSaveOptiuneExtra={saveOptiuneExtra}
            onRefetch={refetch}
          />
        )}
      </main>

      {/* Database Status Modal */}
      {showDatabaseStatus && (
        <DatabaseStatus onClose={() => setShowDatabaseStatus(false)} />
      )}
    </div>
  );
}

// Helper component for tab buttons
function TabButton({ 
  tab, 
  activeTab, 
  setActiveTab 
}: { 
  tab: { id: Tab; name: string; icon: React.ComponentType<any> }; 
  activeTab: Tab; 
  setActiveTab: (tab: Tab) => void; 
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        activeTab === tab.id
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{tab.name}</span>
    </button>
  );
}
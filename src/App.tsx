import React, { useState } from 'react';
import { Calculator, Car, Settings, FolderOpen, Database, FileSpreadsheet, Users, AlertTriangle, Cog } from 'lucide-react';
import AuthProvider from './components/AuthProvider';
import LoginForm from './components/LoginForm';
import { useAuth } from './hooks/useAuth';
import { useSupabaseData } from './hooks/useSupabaseData';
import CategoriesTab from './components/CategoriesTab';
import ModelsTab from './components/ModelsTab';
import MaterialsTab from './components/MaterialsTab';
import CalculatorTab from './components/CalculatorTab';
import ImportExportTab from './components/ImportExportTab';
import DatabaseStatus from './components/DatabaseStatus';
import AppSettingsTab from './components/AppSettingsTab';

type Tab = 'calculator' | 'models' | 'categories' | 'materials' | 'import-export' | 'app-settings';

function AppContent() {
  const { user, profile, loading: authLoading, hasPermission, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [appSettings, setAppSettings] = useState({
    appName: localStorage.getItem('appName') || 'Vehicle Graphics Pricing',
    appSubtitle: localStorage.getItem('appSubtitle') || 'Sistem de calculare prețuri pentru grafică vehicule',
    logoUrl: localStorage.getItem('logoUrl') || '',
    logoSize: localStorage.getItem('logoSize') || 'h-8 w-8'
  });

  const updateAppSettings = (newSettings: typeof appSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem('appName', newSettings.appName);
    localStorage.setItem('appSubtitle', newSettings.appSubtitle);
    localStorage.setItem('logoUrl', newSettings.logoUrl);
    localStorage.setItem('logoSize', newSettings.logoSize);
  };

  // Skip auth checks and load data directly
  // This allows the app to work even with expired JWT tokens

  // If user is inactive, show message
  if (profile?.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Cont dezactivat!</strong>
            <div className="mt-2 text-sm">
              <p>Contul tău a fost dezactivat. Contactează administratorul pentru reactivare.</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Deconectează-te
          </button>
        </div>
      </div>
    );
  }

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
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Problemă de configurare!</strong>
            <div className="mt-2 text-sm">
              <p>{error}</p>
              <p className="mt-2">Verifică că variabilele de mediu sunt setate corect:</p>
              <ul className="list-disc list-inside mt-1">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Încearcă din nou
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'calculator' as Tab, name: 'Calculator', icon: Calculator, permission: 'calculator' },
    { id: 'models' as Tab, name: 'Modele', icon: Car, permission: 'viewVehicles' },
    { id: 'categories' as Tab, name: 'Categorii', icon: FolderOpen, permission: 'viewCategories' },
    { id: 'materials' as Tab, name: 'Materiale', icon: Settings, permission: 'viewMaterials' },
    { id: 'import-export' as Tab, name: 'Import/Export', icon: FileSpreadsheet, permission: 'importExport' },
    { id: 'app-settings' as Tab, name: 'Setări App', icon: Cog, permission: 'appSettings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              {appSettings.logoUrl ? (
                <img 
                  src={appSettings.logoUrl} 
                  alt="Logo" 
                  className={`object-contain ${appSettings.logoSize}`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Database className={`text-blue-600 ${appSettings.logoSize} ${appSettings.logoUrl ? 'hidden' : ''}`} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {appSettings.appName}
                </h1>
                <p className="text-sm text-gray-600">
                  {appSettings.appSubtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {profile?.email && <span>Utilizator: {profile.email}</span>}
                {profile?.role && <span>Rol: {profile.role}</span>}
                <span>Vehicule total: {data.vehicule.length}</span>
                <span>Unice (nume): {new Set(data.vehicule.map(v => `${v.producator}_${v.model}`)).size}</span>
                <span>Categorii: {data.categorii.length}</span>
                <span>Materiale: {data.materialePrint.length + data.materialeLaminare.length}</span>
              </div>
              {user && (
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <span>Deconectează-te</span>
                </button>
              )}
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
        
        {activeTab === 'app-settings' && (
          <AppSettingsTab
            key="app-settings"
            settings={appSettings}
            onUpdateSettings={updateAppSettings}
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
  tab: { id: Tab; name: string; icon: React.ComponentType<any>; permission: string }; 
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
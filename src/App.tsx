import React, { useState } from 'react';
import { Calculator, Car, Settings, FolderOpen, Database, FileSpreadsheet, Users, AlertTriangle, LogIn, LogOut, User } from 'lucide-react';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useAuth } from './hooks/useAuth';
import CategoriesTab from './components/CategoriesTab';
import ModelsTab from './components/ModelsTab';
import MaterialsTab from './components/MaterialsTab';
import CalculatorTab from './components/CalculatorTab';
import ImportExportTab from './components/ImportExportTab';
import UserManagementTab from './components/UserManagementTab';
import DatabaseStatus from './components/DatabaseStatus';
import AuthModal from './components/AuthModal';

type Tab = 'calculator' | 'models' | 'categories' | 'materials' | 'import-export' | 'users';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { 
    user, 
    profile, 
    loading: authLoading, 
    signOut, 
    hasPermission, 
    isAdmin, 
    canEdit 
  } = useAuth();
  
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
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

  // Filter tabs based on user permissions
  const tabs = [
    { id: 'calculator' as Tab, name: 'Calculator', icon: Calculator },
    ...(canEdit() ? [
      { id: 'models' as Tab, name: 'Modele', icon: Car },
      { id: 'categories' as Tab, name: 'Categorii', icon: FolderOpen },
      { id: 'materials' as Tab, name: 'Materiale', icon: Settings },
      { id: 'import-export' as Tab, name: 'Import/Export', icon: FileSpreadsheet },
    ] : []),
    ...(isAdmin() ? [
      { id: 'users' as Tab, name: 'Utilizatori', icon: Users },
    ] : [])
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setActiveTab('calculator');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
              {/* User Info */}
              {user && profile && (
                <div className="flex items-center space-x-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {profile.full_name || 'Utilizator'}
                    </div>
                    <div className="text-gray-500 capitalize">
                      {profile.role}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {profile && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {profile.role.toUpperCase()}
                  </span>
                )}
                <span>Vehicule total: {data.vehicule.length}</span>
                <span>Unice (nume): {new Set(data.vehicule.map(v => `${v.producator}_${v.model}`)).size}</span>
                <span>Categorii: {data.categorii.length}</span>
                <span>Materiale: {data.materialePrint.length + data.materialeLaminare.length}</span>
              </div>
              
              {/* Action Buttons */}
              <button
                onClick={() => setShowDatabaseStatus(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Verifică DB</span>
              </button>
              
              {/* Auth Button */}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Deconectare</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Conectare</span>
                </button>
              )}
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
        
        {activeTab === 'users' && <UserManagementTab />}
      </main>

      {/* Database Status Modal */}
      {showDatabaseStatus && (
        <DatabaseStatus onClose={() => setShowDatabaseStatus(false)} />
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
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
import React, { useState } from 'react';
import { Save, Upload, X, Eye, RotateCcw, Users, Shield, Plus, Trash2, CreditCard as Edit2 } from 'lucide-react';

interface AppSettingsTabProps {
  settings: {
    appName: string;
    appSubtitle: string;
    logoUrl: string;
    logoSize: string;
  };
  onUpdateSettings: (settings: { appName: string; appSubtitle: string; logoUrl: string; logoSize: string }) => void;
}

export default function AppSettingsTab({ settings, onUpdateSettings }: AppSettingsTabProps) {
  const [editingSettings, setEditingSettings] = useState(settings);
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'appearance' | 'users'>('appearance');
  const [users, setUsers] = useState([
    { id: '1', email: 'admin@example.com', role: 'admin', status: 'active', lastLogin: '2024-01-15', lastPasswordChange: '2024-01-10' },
    { id: '2', email: 'user@example.com', role: 'user', status: 'active', lastLogin: '2024-01-14', lastPasswordChange: '2024-01-12' }
  ]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [changingPasswordUser, setChangingPasswordUser] = useState<any>(null);
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState({
    admin: {
      calculator: true,
      viewVehicles: true,
      editVehicles: true,
      deleteVehicles: true,
      viewCategories: true,
      editCategories: true,
      deleteCategories: true,
      viewMaterials: true,
      editMaterials: true,
      deleteMaterials: true,
      importExport: true,
      manageUsers: true,
      appSettings: true
    },
    editor: {
      calculator: true,
      viewVehicles: true,
      editVehicles: true,
      deleteVehicles: false,
      viewCategories: true,
      editCategories: true,
      deleteCategories: false,
      viewMaterials: true,
      editMaterials: true,
      deleteMaterials: false,
      importExport: true,
      manageUsers: false,
      appSettings: false
    },
    user: {
      calculator: true,
      viewVehicles: true,
      editVehicles: false,
      deleteVehicles: false,
      viewCategories: true,
      editCategories: false,
      deleteCategories: false,
      viewMaterials: true,
      editMaterials: false,
      deleteMaterials: false,
      importExport: false,
      manageUsers: false,
      appSettings: false
    }
  });

  const permissionLabels = {
    calculator: 'Calculator Oferte',
    viewVehicles: 'Vizualizare Vehicule',
    editVehicles: 'Editare Vehicule',
    deleteVehicles: 'Ștergere Vehicule',
    viewCategories: 'Vizualizare Categorii',
    editCategories: 'Editare Categorii',
    deleteCategories: 'Ștergere Categorii',
    viewMaterials: 'Vizualizare Materiale',
    editMaterials: 'Editare Materiale',
    deleteMaterials: 'Ștergere Materiale',
    importExport: 'Import/Export Date',
    manageUsers: 'Gestionare Utilizatori',
    appSettings: 'Setări Aplicație'
  };

  const handleSave = () => {
    setSaving(true);
    onUpdateSettings(editingSettings);
    setTimeout(() => setSaving(false), 500);
  };

  const handleReset = () => {
    const defaultSettings = {
      appName: 'Vehicle Graphics Pricing',
      appSubtitle: 'Sistem de calculare prețuri pentru grafică vehicule',
      logoUrl: ''
    };
    setEditingSettings(defaultSettings);
    setPreviewLogo('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setEditingSettings(prev => ({ ...prev, logoUrl: dataUrl }));
        setPreviewLogo(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setEditingSettings(prev => ({ ...prev, logoUrl: url }));
    setPreviewLogo(url);
  };

  const handleSaveUser = () => {
    if (!editingUser || !editingUser.email) return;
    
    // Validate password for new users
    if (isAddingUser && (!editingUser.password || editingUser.password.length < 6)) {
      alert('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }
    
    if (editingUser.id) {
      // Update existing user
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    } else {
      // Add new user
      const newUser = {
        ...editingUser,
        id: Date.now().toString(),
        lastLogin: 'Niciodată',
        lastPasswordChange: 'La creare'
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    setEditingUser(null);
    setIsAddingUser(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.password || passwordData.password.length < 6) {
      setPasswordError('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }
    
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError('Parolele nu se potrivesc');
      return;
    }
    
    // Update user's password change date
    setUsers(prev => prev.map(u => 
      u.id === changingPasswordUser.id 
        ? { ...u, lastPasswordChange: new Date().toLocaleDateString('ro-RO') }
        : u
    ));
    
    // Reset and close
    setChangingPasswordUser(null);
    setPasswordData({ password: '', confirmPassword: '' });
    setPasswordError('');
    
    alert('Parola a fost schimbată cu succes!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  return (
    <>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Setări Aplicație</h2>
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSection('appearance')}
            className={`flex items-center px-6 py-3 font-medium text-sm ${
              activeSection === 'appearance'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Aspect
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`flex items-center px-6 py-3 font-medium text-sm ${
              activeSection === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Utilizatori & Roluri
          </button>
        </div>
      </div>

      {/* Appearance Section */}
      {activeSection === 'appearance' && (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Preview Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Previzualizare Header
          </h3>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
            {(previewLogo || editingSettings.logoUrl) ? (
              <img 
                src={previewLogo || editingSettings.logoUrl} 
                alt="Logo Preview" 
                className={`object-contain ${editingSettings.logoSize}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={`bg-blue-600 rounded flex items-center justify-center ${editingSettings.logoSize}`}>
                <span className="text-white text-xs font-bold">DB</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingSettings.appName || 'Vehicle Graphics Pricing'}
              </h1>
              <p className="text-sm text-gray-600">
                {editingSettings.appSubtitle || 'Sistem de calculare prețuri pentru grafică vehicule'}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Text Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Setări Text</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Aplicație
              </label>
              <input
                type="text"
                value={editingSettings.appName}
                onChange={(e) => setEditingSettings(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vehicle Graphics Pricing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitlu Aplicație
              </label>
              <textarea
                value={editingSettings.appSubtitle}
                onChange={(e) => setEditingSettings(prev => ({ ...prev, appSubtitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Sistem de calculare prețuri pentru grafică vehicule"
              />
            </div>
          </div>

          {/* Right Column - Logo Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Setări Logo</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiune Logo
              </label>
              <select
                value={editingSettings.logoSize}
                onChange={(e) => setEditingSettings(prev => ({ ...prev, logoSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="h-6 w-6">Foarte mic (24px)</option>
                <option value="h-8 w-8">Mic (32px)</option>
                <option value="h-10 w-10">Mediu (40px)</option>
                <option value="h-12 w-12">Mare (48px)</option>
                <option value="h-16 w-16">Foarte mare (64px)</option>
                <option value="h-20 w-20">Extra mare (80px)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Logo (link extern)
              </label>
              <input
                type="url"
                value={editingSettings.logoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-500">SAU</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Încarcă Logo (fișier local)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click pentru încărcare</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG (MAX. 2MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            {(previewLogo || editingSettings.logoUrl) && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setEditingSettings(prev => ({ ...prev, logoUrl: '' }));
                    setPreviewLogo('');
                  }}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center justify-center mx-auto"
                >
                  <X className="w-4 h-4 mr-1" />
                  Elimină Logo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logo Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Recomandări Logo:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Dimensiuni:</strong> Folosește imaginea cu rezoluție mare pentru claritate la toate dimensiunile</li>
            <li><strong>Aspect ratio:</strong> Pătrățel (1:1) funcționează cel mai bine</li>
            <li><strong>Format:</strong> PNG cu fundal transparent sau SVG pentru scalabilitate</li>
            <li><strong>Stil:</strong> Simplu și recognoscibil la dimensiuni mici</li>
            <li><strong>URL extern:</strong> Folosește servicii precum Imgur, Google Drive sau propriul server</li>
            <li><strong>Fișier local:</strong> Se salvează în browser (se pierde la ștergerea cache-ului)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetează la Default
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Se salvează...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvează Setări
              </>
            )}
          </button>
        </div>
      </div>
      )}

      {/* Users & Roles Section */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Gestionare Utilizatori</h3>
            <button 
              onClick={() => {
                setEditingUser({
                  id: '',
                  email: '',
                  role: 'user',
                  status: 'active'
                });
                setIsAddingUser(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Utilizator
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilizator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultima Conectare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultima Schimbare Parolă
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'editor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : user.role === 'editor' ? 'Editor' : 'Utilizator'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Activ' : 'Inactiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastPasswordChange || 'Necunoscută'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setEditingPermissions(user.role)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Configurează permisiuni"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editează utilizator"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setChangingPasswordUser(user);
                            setPasswordData({ password: '', confirmPassword: '' });
                            setPasswordError('');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Schimbă parola"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                          title={user.status === 'active' ? 'Dezactivează utilizator' : 'Activează utilizator'}
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Șterge utilizator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permissions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Permisiuni Roluri</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-purple-900 mb-2">Administrator</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(rolePermissions.admin).map(([key, value]) => (
                    <li key={key} className="flex items-center">
                      <span className={value ? 'text-green-600' : 'text-red-600'}>
                        {value ? '✅' : '❌'}
                      </span>
                      <span className="ml-2">{permissionLabels[key as keyof typeof permissionLabels]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-blue-900 mb-2">Editor</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(rolePermissions.editor).map(([key, value]) => (
                    <li key={key} className="flex items-center">
                      <span className={value ? 'text-green-600' : 'text-red-600'}>
                        {value ? '✅' : '❌'}
                      </span>
                      <span className="ml-2">{permissionLabels[key as keyof typeof permissionLabels]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-green-900 mb-2">Utilizator</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(rolePermissions.user).map(([key, value]) => (
                    <li key={key} className="flex items-center">
                      <span className={value ? 'text-green-600' : 'text-red-600'}>
                        {value ? '✅' : '❌'}
                      </span>
                      <span className="ml-2">{permissionLabels[key as keyof typeof permissionLabels]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Settings Info */}
      {activeSection === 'appearance' && (
        <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">ℹ️ Informații:</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Salvare:</strong> Setările se salvează în browser-ul local</p>
          <p><strong>Persistență:</strong> Setările rămân salvate între sesiuni</p>
          <p><strong>Reset:</strong> Ștergerea cache-ului browser-ului va reseta setările</p>
        </div>
      </div>
      )}
      </div>

      {/* User Edit Modal */}
      {(editingUser || isAddingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {isAddingUser ? 'Adaugă Utilizator Nou' : 'Editează Utilizator'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser?.email || ''}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="utilizator@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={editingUser?.role || 'user'}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">Utilizator</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser?.status || 'active'}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, status: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Activ</option>
                    <option value="inactive">Inactiv</option>
                  </select>
                </div>
                {isAddingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parolă
                    </label>
                    <input
                      type="password"
                      value={editingUser?.password || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minim 6 caractere"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsAddingUser(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!editingUser?.email}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Schimbă Parola pentru {changingPasswordUser.email}
              </h3>
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{passwordError}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parolă Nouă
                  </label>
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, password: e.target.value }));
                      setPasswordError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minim 6 caractere"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmă Parola
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setPasswordError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Repetă parola"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setChangingPasswordUser(null);
                    setPasswordData({ password: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!passwordData.password || !passwordData.confirmPassword}
                >
                  Schimbă Parola
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Configuration Modal */}
      {editingPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Configurează Permisiuni pentru Rolul: {editingPermissions.charAt(0).toUpperCase() + editingPermissions.slice(1)}
              </h3>
              
              <div className="space-y-6">
                {/* Calculator Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">📊 Calculator & Vizualizare</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].calculator}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            calculator: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Calculator Oferte</span>
                    </label>
                  </div>
                </div>

                {/* Vehicles Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">🚗 Vehicule</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].viewVehicles}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            viewVehicles: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Vizualizare Vehicule</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].editVehicles}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            editVehicles: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Editare Vehicule</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].deleteVehicles}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            deleteVehicles: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ștergere Vehicule</span>
                    </label>
                  </div>
                </div>

                {/* Categories Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">📁 Categorii</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].viewCategories}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            viewCategories: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Vizualizare Categorii</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].editCategories}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            editCategories: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Editare Categorii</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].deleteCategories}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            deleteCategories: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ștergere Categorii</span>
                    </label>
                  </div>
                </div>

                {/* Materials Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-3">⚙️ Materiale</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].viewMaterials}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            viewMaterials: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Vizualizare Materiale</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].editMaterials}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            editMaterials: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Editare Materiale</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].deleteMaterials}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            deleteMaterials: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ștergere Materiale</span>
                    </label>
                  </div>
                </div>

                {/* Advanced Features Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🔧 Funcții Avansate</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].importExport}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            importExport: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Import/Export Date</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].manageUsers}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            manageUsers: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Gestionare Utilizatori</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePermissions[editingPermissions as keyof typeof rolePermissions].appSettings}
                        onChange={(e) => setRolePermissions(prev => ({
                          ...prev,
                          [editingPermissions]: {
                            ...prev[editingPermissions as keyof typeof prev],
                            appSettings: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Setări Aplicație</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingPermissions(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
                <button
                  onClick={() => {
                    setEditingPermissions(null);
                    // Here you would save the permissions to your backend/localStorage
                    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvează Permisiuni
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
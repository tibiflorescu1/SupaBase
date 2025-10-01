import React, { useState } from 'react';
import { Save, Upload, X, Eye, RotateCcw, Users, Shield, Key, Webhook, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState<'appearance' | 'users' | 'api' | 'webhooks'>('appearance');
  const [users, setUsers] = useState([
    { id: '1', email: 'admin@example.com', role: 'admin', status: 'active', lastLogin: '2024-01-15' },
    { id: '2', email: 'user@example.com', role: 'user', status: 'active', lastLogin: '2024-01-14' }
  ]);
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API', key: 'vgp_live_1234567890abcdef', permissions: ['read', 'write'], created: '2024-01-10' },
    { id: '2', name: 'Development API', key: 'vgp_test_abcdef1234567890', permissions: ['read'], created: '2024-01-12' }
  ]);
  const [webhooks, setWebhooks] = useState([
    { id: '1', name: 'Order Updates', url: 'https://example.com/webhook/orders', events: ['order.created', 'order.updated'], status: 'active' },
    { id: '2', name: 'Price Changes', url: 'https://example.com/webhook/prices', events: ['price.updated'], status: 'inactive' }
  ]);
  const [copiedKey, setCopiedKey] = useState<string>('');

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

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `vgp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read'],
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
  };

  return (
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
          <button
            onClick={() => setActiveSection('api')}
            className={`flex items-center px-6 py-3 font-medium text-sm ${
              activeSection === 'api'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </button>
          <button
            onClick={() => setActiveSection('webhooks')}
            className={`flex items-center px-6 py-3 font-medium text-sm ${
              activeSection === 'webhooks'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
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
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Utilizator'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Shield className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-purple-900 mb-2">Administrator</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Acces complet la toate funcțiile</li>
                  <li>✅ Gestionare utilizatori și roluri</li>
                  <li>✅ Configurare API și webhook-uri</li>
                  <li>✅ Export/Import date</li>
                  <li>✅ Setări aplicație</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-green-900 mb-2">Utilizator</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Calculator oferte</li>
                  <li>✅ Vizualizare vehicule și prețuri</li>
                  <li>✅ Export date proprii</li>
                  <li>❌ Modificare prețuri</li>
                  <li>❌ Gestionare utilizatori</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Section */}
      {activeSection === 'api' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
            <button 
              onClick={generateApiKey}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generează API Key
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                    <p className="text-sm text-gray-500">Creat: {apiKey.created}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                      Editează
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Șterge
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-800">
                      {apiKey.key.substring(0, 20)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      {copiedKey === apiKey.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Copiat!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copiază
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {apiKey.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* API Documentation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📚 Documentație API</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Base URL:</strong> <code>https://api.vehiclegraphics.com/v1</code></p>
              <p><strong>Autentificare:</strong> <code>Authorization: Bearer YOUR_API_KEY</code></p>
              <div className="mt-3">
                <p><strong>Endpoint-uri disponibile:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code>GET /vehicles</code> - Lista vehicule</li>
                  <li><code>GET /vehicles/{id}/coverage</code> - Acoperiri vehicul</li>
                  <li><code>POST /calculate</code> - Calculator preț</li>
                  <li><code>GET /materials</code> - Lista materiale</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks Section */}
      {activeSection === 'webhooks' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Webhook
            </button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                    <p className="text-sm text-gray-500">{webhook.url}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      webhook.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {webhook.status === 'active' ? 'Activ' : 'Inactiv'}
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                        Testează
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                        Editează
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Șterge
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Webhook Events */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">🔔 Evenimente Disponibile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
              <div>
                <p><strong>Vehicule:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>vehicle.created</li>
                  <li>vehicle.updated</li>
                  <li>vehicle.deleted</li>
                </ul>
              </div>
              <div>
                <p><strong>Prețuri:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>price.updated</li>
                  <li>material.changed</li>
                  <li>coverage.modified</li>
                </ul>
              </div>
              <div>
                <p><strong>Comenzi:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>order.created</li>
                  <li>order.updated</li>
                  <li>quote.generated</li>
                </ul>
              </div>
              <div>
                <p><strong>Sistem:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>user.login</li>
                  <li>data.exported</li>
                  <li>backup.completed</li>
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
  );
}
import React, { useState } from 'react';
import { Save, Upload, X, Eye, RotateCcw } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Setări Aplicație</h2>
      </div>

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

      {/* Current Settings Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">ℹ️ Informații:</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Salvare:</strong> Setările se salvează în browser-ul local</p>
          <p><strong>Persistență:</strong> Setările rămân salvate între sesiuni</p>
          <p><strong>Reset:</strong> Ștergerea cache-ului browser-ului va reseta setările</p>
        </div>
      </div>
    </div>
  );
}
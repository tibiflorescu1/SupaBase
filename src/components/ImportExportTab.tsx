import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X, Trash2, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import type { AppData, Vehicul, Categorie, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';

interface ImportExportTabProps {
  data: AppData;
  onSaveVehicul: (vehicul: Partial<Vehicul>) => Promise<void>;
  onSaveCategorie: (categorie: Omit<Categorie, 'id'> & { id?: string }) => Promise<void>;
  onSaveAcoperire: (acoperire: Partial<Acoperire>, file?: File) => Promise<void>;
  onSaveOptiuneExtra: (optiune: Partial<OptiuneExtra>, file?: File) => Promise<void>;
  onRefetch: () => void;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

export default function ImportExportTab({ 
  data, 
  onSaveVehicul, 
  onSaveCategorie, 
  onSaveAcoperire, 
  onSaveOptiuneExtra, 
  onRefetch 
}: ImportExportTabProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<ImportResult | null>(null);

  // Export function - creates a single comprehensive CSV
  const exportCompleteData = () => {
    const csvData: any[] = [];
    
    data.vehicule.forEach(vehicul => {
      const categoria = data.categorii.find(c => c.id === vehicul.categorieId);
      const vehicleUniqueId = `${vehicul.producator.replace(/\s+/g, '')}_${vehicul.model.replace(/\s+/g, '')}_${vehicul.id.substring(0, 8)}`;
      
      // Add vehicle base row
      csvData.push({
        'Tip': 'VEHICUL',
        'ID Vehicul': vehicleUniqueId,
        'Producător': vehicul.producator,
        'Model': vehicul.model,
        'Categorie': categoria?.nume || '',
        'Perioada Fabricație': vehicul.perioadaFabricatie,
        'Nume Item': '',
        'Preț (RON)': '',
        'Link Fișier': '',
        'Fișier Atașat': '',
        'Observații': 'Vehicul de bază'
      });
      
      // Add coverage rows
      vehicul.acoperiri.forEach(acoperire => {
        csvData.push({
          'Tip': 'ACOPERIRE',
          'ID Vehicul': vehicleUniqueId,
          'Producător': vehicul.producator,
          'Model': vehicul.model,
          'Categorie': categoria?.nume || '',
          'Perioada Fabricație': vehicul.perioadaFabricatie,
          'Nume Item': acoperire.nume,
          'Preț (RON)': acoperire.pret,
          'Link Fișier': acoperire.linkFisier || '',
          'Fișier Atașat': acoperire.fisier ? `DA - ${acoperire.fisier.nume}` : 'NU',
          'Observații': 'Acoperire pentru ' + vehicul.producator + ' ' + vehicul.model
        });
      });
      
      // Add extra options rows
      vehicul.optiuniExtra.forEach(optiune => {
        csvData.push({
          'Tip': 'OPTIUNE_EXTRA',
          'ID Vehicul': vehicleUniqueId,
          'Producător': vehicul.producator,
          'Model': vehicul.model,
          'Categorie': categoria?.nume || '',
          'Perioada Fabricație': vehicul.perioadaFabricatie,
          'Nume Item': optiune.nume,
          'Preț (RON)': optiune.pret,
          'Link Fișier': optiune.linkFisier || '',
          'Fișier Atașat': optiune.fisier ? `DA - ${optiune.fisier.nume}` : 'NU',
          'Observații': 'Opțiune extra pentru ' + vehicul.producator + ' ' + vehicul.model
        });
      });
    });

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, 'date_complete_vehicule.csv');
  };

  // Export template for easy bulk editing
  const exportTemplate = () => {
    const templateData = [
      {
        'Tip': 'VEHICUL',
        'ID Vehicul': 'BMW_X5_a1b2c3d4',
        'Producător': 'BMW',
        'Model': 'X5',
        'Categorie': 'SUV',
        'Perioada Fabricație': '2020-2024',
        'Nume Item': '',
        'Preț (RON)': '',
        'Link Fișier': '',
        'Fișier Atașat': '',
        'Observații': 'Vehicul de bază - nu completați preț aici'
      },
      {
        'Tip': 'ACOPERIRE',
        'ID Vehicul': 'BMW_X5_a1b2c3d4',
        'Producător': 'BMW',
        'Model': 'X5',
        'Categorie': 'SUV',
        'Perioada Fabricație': '2020-2024',
        'Nume Item': 'Folie transparentă',
        'Preț (RON)': '1500',
        'Link Fișier': 'https://drive.google.com/file/d/1ABC123/view?usp=sharing',
        'Fișier Atașat': 'NU',
        'Observații': 'Acoperire completă'
      },
      {
        'Tip': 'ACOPERIRE',
        'ID Vehicul': 'BMW_X5_a1b2c3d4',
        'Producător': 'BMW',
        'Model': 'X5',
        'Categorie': 'SUV',
        'Perioada Fabricație': '2020-2024',
        'Nume Item': 'Folie colorată',
        'Preț (RON)': '2000',
        'Link Fișier': 'https://drive.google.com/file/d/1DEF456/view?usp=sharing',
        'Fișier Atașat': 'NU',
        'Observații': 'Acoperire cu culoare personalizată'
      },
      {
        'Tip': 'OPTIUNE_EXTRA',
        'ID Vehicul': 'BMW_X5_a1b2c3d4',
        'Producător': 'BMW',
        'Model': 'X5',
        'Categorie': 'SUV',
        'Perioada Fabricație': '2020-2024',
        'Nume Item': 'Decupare personalizată',
        'Preț (RON)': '300',
        'Link Fișier': 'https://drive.google.com/file/d/1GHI789/view?usp=sharing',
        'Fișier Atașat': 'NU',
        'Observații': 'Decupare după șablon client'
      },
      {
        'Tip': 'OPTIUNE_EXTRA',
        'ID Vehicul': 'BMW_X5_a1b2c3d4',
        'Producător': 'BMW',
        'Model': 'X5',
        'Categorie': 'SUV',
        'Perioada Fabricație': '2020-2024',
        'Nume Item': 'Montaj la domiciliu',
        'Preț (RON)': '500',
        'Link Fișier': '',
        'Fișier Atașat': 'NU',
        'Observații': 'Transport și montaj inclus'
      }
    ];

    const csv = Papa.unparse(templateData);
    downloadCSV(csv, 'template_vehicule.csv');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import function - processes the comprehensive CSV
  const processImport = async () => {
    if (!selectedFile) {
      alert('Selectează un fișier pentru import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    Papa.parse(selectedFile, {
      header: true,
      complete: async (results) => {
        const result: ImportResult = { success: 0, errors: [], warnings: [] };
        const vehicleMap = new Map<string, string>(); // vehicleUniqueId -> vehicleId
        const categoryMap = new Map<string, string>(); // categoryName -> categoryId

        try {
          // First pass: Create categories and vehicles
          for (const row of results.data as any[]) {
            const tip = row['Tip']?.toUpperCase();
            const idVehicul = row['ID Vehicul'];
            const producator = row['Producător'];
            const model = row['Model'];
            const categorie = row['Categorie'];
            const perioada = row['Perioada Fabricație'] || '';

            if (!producator || !model) {
              result.errors.push('Lipsesc datele obligatorii (Producător, Model)');
              continue;
            }

            // Use ID Vehicul if provided, otherwise create one
            const vehicleUniqueId = idVehicul || `${producator.replace(/\s+/g, '')}_${model.replace(/\s+/g, '')}_new`;

            // Create category if needed
            if (categorie && !categoryMap.has(categorie)) {
              const existingCategory = data.categorii.find(c => c.nume.toLowerCase() === categorie.toLowerCase());
              if (existingCategory) {
                categoryMap.set(categorie, existingCategory.id);
              } else {
                try {
                  await onSaveCategorie({ nume: categorie });
                  // We'll need to refetch to get the new category ID
                  result.warnings.push(`Categoria "${categorie}" a fost creată`);
                } catch (error) {
                  result.errors.push(`Eroare la crearea categoriei "${categorie}": ${error}`);
                }
              }
            }

            // Create vehicle if needed and this is a vehicle row or first occurrence
            if (!vehicleMap.has(vehicleUniqueId)) {
              let existingVehicle = null;
              
              // If we have an ID, try to find by ID first
              if (idVehicul && idVehicul.includes('_')) {
                const idParts = idVehicul.split('_');
                if (idParts.length >= 3) {
                  const shortId = idParts[idParts.length - 1];
                  existingVehicle = data.vehicule.find(v => v.id.startsWith(shortId));
                }
              }
              
              // Fallback to name matching
              if (!existingVehicle) {
                existingVehicle = data.vehicule.find(v => 
                  v.producator.toLowerCase() === producator.toLowerCase() && 
                  v.model.toLowerCase() === model.toLowerCase()
                );
              }

              if (existingVehicle) {
                vehicleMap.set(vehicleUniqueId, existingVehicle.id);
              } else {
                try {
                  // Find category ID
                  let categorieId = '';
                  if (categorie) {
                    const foundCategory = data.categorii.find(c => c.nume.toLowerCase() === categorie.toLowerCase());
                    if (foundCategory) {
                      categorieId = foundCategory.id;
                    }
                  }

                  await onSaveVehicul({
                    producator,
                    model,
                    categorieId,
                    perioadaFabricatie: perioada
                  });
                  
                  result.success++;
                  result.warnings.push(`Vehiculul "${producator} ${model}" a fost creat`);
                } catch (error) {
                  result.errors.push(`Eroare la crearea vehiculului "${producator} ${model}": ${error}`);
                }
              }
            }
          }

          // Refresh data to get new IDs
          onRefetch();
          
          // Wait a bit for the refresh to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Second pass: Create coverage and extra options
          for (const row of results.data as any[]) {
            const tip = row['Tip']?.toUpperCase();
            const idVehicul = row['ID Vehicul'];
            const producator = row['Producător'];
            const model = row['Model'];
            const numeItem = row['Nume Item'];
            const pret = parseFloat(row['Preț (RON)']) || 0;
            const linkFisier = row['Link Fișier']?.trim() || '';

            if (!producator || !model || tip === 'VEHICUL') continue;

            const vehicleUniqueId = idVehicul || `${producator.replace(/\s+/g, '')}_${model.replace(/\s+/g, '')}_new`;
            
            let vehicle = null;
            
            // Try to find by ID first
            if (idVehicul && idVehicul.includes('_')) {
              const idParts = idVehicul.split('_');
              if (idParts.length >= 3) {
                const shortId = idParts[idParts.length - 1];
                vehicle = data.vehicule.find(v => v.id.startsWith(shortId));
              }
            }
            
            // Fallback to name matching
            if (!vehicle) {
              vehicle = data.vehicule.find(v => 
                v.producator.toLowerCase() === producator.toLowerCase() && 
                v.model.toLowerCase() === model.toLowerCase()
              );
            }

            if (!vehicle) {
              result.errors.push(`Nu s-a găsit vehiculul "${producator} ${model}" cu ID "${vehicleUniqueId}"`);
              continue;
            }

            if (!numeItem || pret <= 0) {
              result.warnings.push(`Lipsesc datele pentru item-ul de la "${producator} ${model}"`);
              continue;
            }

            try {
              if (tip === 'ACOPERIRE') {
                // Check if acoperire already exists
                const existingAcoperire = vehicle.acoperiri.find(a => 
                  a.nume.toLowerCase().trim() === numeItem.toLowerCase().trim()
                );
                
                if (existingAcoperire) {
                  result.warnings.push(`Acoperirea "${numeItem}" există deja pentru "${producator} ${model}" - se actualizează`);
                  
                  // Update existing acoperire
                  const acoperireData: any = {
                    id: existingAcoperire.id,
                    nume: numeItem,
                    pret: pret,
                    vehicul_id: vehicle.id
                  };
                  
                  if (linkFisier && linkFisier.startsWith('http')) {
                    acoperireData.linkFisier = linkFisier;
                  }
                  
                  await onSaveAcoperire(acoperireData);
                  result.success++;
                } else {
                  // Create new acoperire
                const acoperireData: any = {
                  nume: numeItem,
                  pret: pret,
                  vehicul_id: vehicle.id
                };
                
                // Add link if provided
                if (linkFisier && linkFisier.startsWith('http')) {
                  acoperireData.linkFisier = linkFisier;
                  console.log('Adding Google Drive link to acoperire:', linkFisier);
                }
                
                await onSaveAcoperire(acoperireData);
                result.success++;
                }
              } else if (tip === 'OPTIUNE_EXTRA') {
                // Check if optiune already exists
                const existingOptiune = vehicle.optiuniExtra.find(o => 
                  o.nume.toLowerCase().trim() === numeItem.toLowerCase().trim()
                );
                
                if (existingOptiune) {
                  result.warnings.push(`Opțiunea "${numeItem}" există deja pentru "${producator} ${model}" - se actualizează`);
                  
                  // Update existing optiune
                  const optiuneData: any = {
                    id: existingOptiune.id,
                    nume: numeItem,
                    pret: pret,
                    vehicul_id: vehicle.id
                  };
                  
                  if (linkFisier && linkFisier.startsWith('http')) {
                    optiuneData.linkFisier = linkFisier;
                  }
                  
                  await onSaveOptiuneExtra(optiuneData);
                  result.success++;
                } else {
                  // Create new optiune
                const optiuneData: any = {
                  nume: numeItem,
                  pret: pret,
                  vehicul_id: vehicle.id
                };
                
                // Add link if provided
                if (linkFisier && linkFisier.startsWith('http')) {
                  optiuneData.linkFisier = linkFisier;
                  console.log('Adding Google Drive link to optiune:', linkFisier);
                }
                
                await onSaveOptiuneExtra(optiuneData);
                result.success++;
                }
              }
            } catch (error) {
              console.error('Error saving item:', error);
              result.errors.push(`Eroare la salvarea "${numeItem}" pentru "${producator} ${model}": ${error}`);
            }
          }

        } catch (error) {
          result.errors.push(`Eroare generală la procesare: ${error}`);
        }

        setImportResult(result);
        setImporting(false);
        onRefetch(); // Final refresh
      }
    });
  };

  // Function to find and remove duplicates
  const cleanupDuplicates = async () => {
    if (!confirm('Ești sigur că vrei să ștergi duplicatele? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setCleaningDuplicates(true);
    setCleanupResult(null);

    const result: ImportResult = { success: 0, errors: [], warnings: [] };

    try {
      // Process each vehicle
      for (const vehicle of data.vehicule) {
        // Find duplicate acoperiri
        const acopeririMap = new Map<string, Acoperire[]>();
        
        vehicle.acoperiri.forEach(acoperire => {
          const key = acoperire.nume.toLowerCase().trim();
          if (!acopeririMap.has(key)) {
            acopeririMap.set(key, []);
          }
          acopeririMap.get(key)!.push(acoperire);
        });

        // Remove duplicates (keep first, delete rest)
        for (const [name, duplicates] of acopeririMap) {
          if (duplicates.length > 1) {
            result.warnings.push(`Găsite ${duplicates.length} duplicate pentru acoperirea "${duplicates[0].nume}" la ${vehicle.producator} ${vehicle.model}`);
            
            // Keep the first one, delete the rest
            for (let i = 1; i < duplicates.length; i++) {
              try {
                await onDeleteAcoperire(duplicates[i].id);
                result.success++;
              } catch (error) {
                result.errors.push(`Eroare la ștergerea duplicatului "${duplicates[i].nume}": ${error}`);
              }
            }
          }
        }

        // Find duplicate optiuni extra
        const optiuniMap = new Map<string, OptiuneExtra[]>();
        
        vehicle.optiuniExtra.forEach(optiune => {
          const key = optiune.nume.toLowerCase().trim();
          if (!optiuniMap.has(key)) {
            optiuniMap.set(key, []);
          }
          optiuniMap.get(key)!.push(optiune);
        });

        // Remove duplicates (keep first, delete rest)
        for (const [name, duplicates] of optiuniMap) {
          if (duplicates.length > 1) {
            result.warnings.push(`Găsite ${duplicates.length} duplicate pentru opțiunea "${duplicates[0].nume}" la ${vehicle.producator} ${vehicle.model}`);
            
            // Keep the first one, delete the rest
            for (let i = 1; i < duplicates.length; i++) {
              try {
                await onDeleteOptiuneExtra(duplicates[i].id);
                result.success++;
              } catch (error) {
                result.errors.push(`Eroare la ștergerea duplicatului "${duplicates[i].nume}": ${error}`);
              }
            }
          }
        }
      }

      // Refresh data after cleanup
      onRefetch();
      
    } catch (error) {
      result.errors.push(`Eroare generală la curățarea duplicatelor: ${error}`);
    }

    setCleanupResult(result);
    setCleaningDuplicates(false);
  };

  // Function to find and remove duplicates
  const cleanupDuplicates = async () => {
    if (!confirm('Ești sigur că vrei să ștergi duplicatele? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setCleaningDuplicates(true);
    setCleanupResult(null);

    const result: ImportResult = { success: 0, errors: [], warnings: [] };

    try {
      // Process each vehicle
      for (const vehicle of data.vehicule) {
        // Find duplicate acoperiri
        const acopeririMap = new Map<string, Acoperire[]>();
        
        vehicle.acoperiri.forEach(acoperire => {
          const key = acoperire.nume.toLowerCase().trim();
          if (!acopeririMap.has(key)) {
            acopeririMap.set(key, []);
          }
          acopeririMap.get(key)!.push(acoperire);
        });

        // Remove duplicates (keep first, delete rest)
        for (const [name, duplicates] of acopeririMap) {
          if (duplicates.length > 1) {
            result.warnings.push(`Găsite ${duplicates.length} duplicate pentru acoperirea "${duplicates[0].nume}" la ${vehicle.producator} ${vehicle.model}`);
            
            // Keep the first one, delete the rest
            for (let i = 1; i < duplicates.length; i++) {
              try {
                await onDeleteAcoperire(duplicates[i].id);
                result.success++;
              } catch (error) {
                result.errors.push(`Eroare la ștergerea duplicatului "${duplicates[i].nume}": ${error}`);
              }
            }
          }
        }

        // Find duplicate optiuni extra
        const optiuniMap = new Map<string, OptiuneExtra[]>();
        
        vehicle.optiuniExtra.forEach(optiune => {
          const key = optiune.nume.toLowerCase().trim();
          if (!optiuniMap.has(key)) {
            optiuniMap.set(key, []);
          }
          optiuniMap.get(key)!.push(optiune);
        });

        // Remove duplicates (keep first, delete rest)
        for (const [name, duplicates] of optiuniMap) {
          if (duplicates.length > 1) {
            result.warnings.push(`Găsite ${duplicates.length} duplicate pentru opțiunea "${duplicates[0].nume}" la ${vehicle.producator} ${vehicle.model}`);
            
            // Keep the first one, delete the rest
            for (let i = 1; i < duplicates.length; i++) {
              try {
                await onDeleteOptiuneExtra(duplicates[i].id);
                result.success++;
              } catch (error) {
                result.errors.push(`Eroare la ștergerea duplicatului "${duplicates[i].nume}": ${error}`);
              }
            }
          }
        }
      }

      // Refresh data after cleanup
      onRefetch();
      
    } catch (error) {
      result.errors.push(`Eroare generală la curățarea duplicatelor: ${error}`);
    }

    setCleanupResult(result);
    setCleaningDuplicates(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Import/Export Date</h2>
        <button
          onClick={cleanupDuplicates}
          disabled={cleaningDuplicates}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {cleaningDuplicates ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Se curăță...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Curăță Duplicate
            </>
          )}
        </button>
        <button
          onClick={cleanupDuplicates}
          disabled={cleaningDuplicates}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {cleaningDuplicates ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Se curăță...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Curăță Duplicate
            </>
          )}
        </button>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📤 Export Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportCompleteData}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Download className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-blue-900">Export Date Complete</h4>
            <p className="text-sm text-gray-600 text-center mt-1">
              Toate vehiculele cu acoperiri și opțiuni<br/>
              <span className="font-medium">{data.vehicule.length} vehicule</span>
            </p>
          </button>

          <button
            onClick={exportTemplate}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-green-900">Download Template</h4>
            <p className="text-sm text-gray-600 text-center mt-1">
              Șablon pentru adăugare în bulk<br/>
              <span className="font-medium">Format standardizat</span>
            </p>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📥 Import Date</h3>
        
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Selectează fișierul CSV pentru import</p>
              <p className="text-sm text-gray-500">
                Folosește template-ul de mai sus pentru format corect
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mt-4"
            />
          </div>
        </div>

        {selectedFile && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">📁 Fișier selectat:</h4>
            <div className="flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          </div>
        )}

        {/* Format Instructions */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">📋 Format CSV:</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Coloane obligatorii:</strong> Tip, ID Vehicul, Producător, Model, Categorie, Nume Item, Preț (RON), Fișier Atașat</p>
            <p><strong>Tipuri valide:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>VEHICUL</code> - Definește vehiculul (nu completați preț)</li>
              <li><code>ACOPERIRE</code> - Acoperire pentru vehicul (completați preț)</li>
              <li><code>OPTIUNE_EXTRA</code> - Opțiune extra pentru vehicul (completați preț)</li>
            </ul>
            <p><strong>ID Vehicul:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>ID unic generat automat la export (ex: BMW_X5_a1b2c3d4)</li>
              <li>Asigură că modificările se aplică la vehiculul corect</li>
              <li>NU modificați acest câmp în Excel</li>
            </ul>
            <p><strong>Link Fișier:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>https://drive.google.com/file/d/ID/view</code> - link Google Drive</li>
              <li>Lasă gol dacă nu există fișier</li>
              <li><strong>IMPORTANT:</strong> Doar link-uri valide (http/https)</li>
              <li>Link-urile se pot edita direct în Excel</li>
            </ul>
          </div>
        </div>
        
        {/* Google Drive Instructions */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium mb-2 text-green-800">📁 Organizare Google Drive:</h4>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>Structură recomandată:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>📂 Vehicule/</strong></li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;<strong>📂 BMW/</strong></li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>📂 X5/</strong> - acoperiri_X5.pdf, optiuni_X5.pdf</li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>📂 X3/</strong> - acoperiri_X3.pdf, optiuni_X3.pdf</li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;<strong>📂 Audi/</strong></li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>📂 A4/</strong> - template_A4.pdf</li>
            </ul>
            <div className="mt-3 p-2 bg-green-100 rounded">
              <p className="font-medium">Workflow recomandat:</p>
              <p>1. Organizează fișierele în Google Drive</p>
              <p>2. Obține link-uri de partajare cu <strong>View access</strong></p>
              <p>3. Export CSV și adaugă link-urile în Excel</p>
              <p>4. Import CSV cu link-urile actualizate</p>
            </div>
            
            <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
              <p className="font-medium text-yellow-800">⚠️ Setări importante Google Drive:</p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-1 space-y-1">
                <li><strong>Anyone with the link</strong> → Viewer = Oricine cu link-ul poate vedea</li>
                <li><strong>Restricted</strong> → Doar persoanele cu acces la Drive-ul tău</li>
                <li>Pentru clienți: folosește <strong>"Anyone with the link"</strong></li>
                <li>Pentru echipă: folosește <strong>"Restricted"</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={processImport}
            disabled={!selectedFile || importing}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Se importă...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Importă Date
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📊 Rezultatul Importului</h3>
            <button
              onClick={() => setImportResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {importResult.success > 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">
                  ✅ {importResult.success} înregistrări procesate cu succes
                </span>
              </div>
            )}

            {importResult.warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">⚠️ Avertismente:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {importResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">❌ Erori:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Cleanup Results */}
      {cleanupResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🧹 Rezultatul Curățării Duplicatelor</h3>
            <button
              onClick={() => setCleanupResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {cleanupResult.success > 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">
                  ✅ {cleanupResult.success} duplicate șterse cu succes
                </span>
              </div>
            )}

            {cleanupResult.warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">🔍 Duplicate găsite și procesate:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {cleanupResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {cleanupResult.errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">❌ Erori:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {cleanupResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {cleanupResult.success === 0 && cleanupResult.warnings.length === 0 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  🎉 Nu s-au găsit duplicate! Datele sunt deja curate.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
      {/* Cleanup Results */}
      {cleanupResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🧹 Rezultatul Curățării Duplicatelor</h3>
            <button
              onClick={() => setCleanupResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {cleanupResult.success > 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">
                  ✅ {cleanupResult.success} duplicate șterse cu succes
                </span>
              </div>
            )}

            {cleanupResult.warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">🔍 Duplicate găsite și procesate:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {cleanupResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {cleanupResult.errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">❌ Erori:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {cleanupResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            {cleanupResult.success === 0 && cleanupResult.warnings.length === 0 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  🎉 Nu s-au găsit duplicate! Datele sunt deja curate.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
            )}
  );
}
import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Export functions
  const exportVehicles = () => {
    const csvData = data.vehicule.map(vehicul => {
      const categoria = data.categorii.find(c => c.id === vehicul.categorieId);
      return {
        'Producător': vehicul.producator,
        'Model': vehicul.model,
        'Categorie': categoria?.nume || '',
        'Perioada Fabricație': vehicul.perioadaFabricatie,
        'Număr Acoperiri': vehicul.acoperiri.length,
        'Număr Opțiuni Extra': vehicul.optiuniExtra.length
      };
    });

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, 'vehicule.csv');
  };

  const exportCategories = () => {
    const csvData = data.categorii.map(categorie => ({
      'Nume Categorie': categorie.nume,
      'Număr Vehicule': data.vehicule.filter(v => v.categorieId === categorie.id).length
    }));

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, 'categorii.csv');
  };

  const exportCoverageOptions = () => {
    const csvData: any[] = [];
    data.vehicule.forEach(vehicul => {
      vehicul.acoperiri.forEach(acoperire => {
        const categoria = data.categorii.find(c => c.id === vehicul.categorieId);
        csvData.push({
          'Producător': vehicul.producator,
          'Model': vehicul.model,
          'Categorie': categoria?.nume || '',
          'Nume Acoperire': acoperire.nume,
          'Preț (RON)': acoperire.pret,
          'Are Fișier': acoperire.fisier ? 'Da' : 'Nu',
          'Nume Fișier': acoperire.fisier?.nume || ''
        });
      });
    });

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, 'acoperiri.csv');
  };

  const exportExtraOptions = () => {
    const csvData: any[] = [];
    data.vehicule.forEach(vehicul => {
      vehicul.optiuniExtra.forEach(optiune => {
        const categoria = data.categorii.find(c => c.id === vehicul.categorieId);
        csvData.push({
          'Producător': vehicul.producator,
          'Model': vehicul.model,
          'Categorie': categoria?.nume || '',
          'Nume Opțiune': optiune.nume,
          'Preț (RON)': optiune.pret,
          'Are Fișier': optiune.fisier ? 'Da' : 'Nu',
          'Nume Fișier': optiune.fisier?.nume || ''
        });
      });
    });

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, 'optiuni_extra.csv');
  };

  const exportMaterials = () => {
    const printMaterials = data.materialePrint.map(m => ({
      'Tip Material': 'Print',
      'Nume': m.nume,
      'Tip Calcul': m.tipCalcul === 'procentual' ? 'Procentual' : 'Sumă Fixă',
      'Valoare': m.valoare,
      'Permite Print Alb': m.permitePrintAlb ? 'Da' : 'Nu'
    }));

    const laminationMaterials = data.materialeLaminare.map(m => ({
      'Tip Material': 'Laminare',
      'Nume': m.nume,
      'Tip Calcul': m.tipCalcul === 'procentual' ? 'Procentual' : 'Sumă Fixă',
      'Valoare': m.valoare,
      'Permite Print Alb': 'N/A'
    }));

    const allMaterials = [...printMaterials, ...laminationMaterials];
    const csv = Papa.unparse(allMaterials);
    downloadCSV(csv, 'materiale.csv');
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

  // Import functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const importCategories = async (file: File) => {
    return new Promise<ImportResult>((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const result: ImportResult = { success: 0, errors: [], warnings: [] };
          
          for (const row of results.data as any[]) {
            try {
              const nume = row['Nume Categorie'] || row['nume'] || row['Nume'];
              if (!nume) {
                result.errors.push('Lipsește numele categoriei');
                continue;
              }

              // Check if category already exists
              const existing = data.categorii.find(c => c.nume.toLowerCase() === nume.toLowerCase());
              if (existing) {
                result.warnings.push(`Categoria "${nume}" există deja`);
                continue;
              }

              await onSaveCategorie({ nume });
              result.success++;
            } catch (error) {
              result.errors.push(`Eroare la salvarea categoriei: ${error}`);
            }
          }
          
          resolve(result);
        }
      });
    });
  };

  const importVehicles = async (file: File) => {
    return new Promise<ImportResult>((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const result: ImportResult = { success: 0, errors: [], warnings: [] };
          
          for (const row of results.data as any[]) {
            try {
              const producator = row['Producător'] || row['producator'] || row['Producator'];
              const model = row['Model'] || row['model'];
              const categorie = row['Categorie'] || row['categorie'] || row['Categoria'];
              const perioada = row['Perioada Fabricație'] || row['perioada_fabricatie'] || row['Perioada'] || '';

              if (!producator || !model) {
                result.errors.push('Lipsesc datele obligatorii (Producător, Model)');
                continue;
              }

              // Find category ID
              let categorieId = '';
              if (categorie) {
                const foundCategory = data.categorii.find(c => c.nume.toLowerCase() === categorie.toLowerCase());
                if (foundCategory) {
                  categorieId = foundCategory.id;
                } else {
                  result.warnings.push(`Categoria "${categorie}" nu există, vehiculul va fi salvat fără categorie`);
                }
              }

              // Check if vehicle already exists
              const existing = data.vehicule.find(v => 
                v.producator.toLowerCase() === producator.toLowerCase() && 
                v.model.toLowerCase() === model.toLowerCase()
              );
              if (existing) {
                result.warnings.push(`Vehiculul "${producator} ${model}" există deja`);
                continue;
              }

              await onSaveVehicul({
                producator,
                model,
                categorieId,
                perioadaFabricatie: perioada
              });
              result.success++;
            } catch (error) {
              result.errors.push(`Eroare la salvarea vehiculului: ${error}`);
            }
          }
          
          resolve(result);
        }
      });
    });
  };

  const processImport = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Selectează cel puțin un fișier pentru import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    const totalResult: ImportResult = { success: 0, errors: [], warnings: [] };

    for (const file of Array.from(selectedFiles)) {
      try {
        let result: ImportResult;
        
        if (file.name.toLowerCase().includes('categor')) {
          result = await importCategories(file);
        } else if (file.name.toLowerCase().includes('vehicul')) {
          result = await importVehicles(file);
        } else {
          totalResult.warnings.push(`Tipul fișierului "${file.name}" nu este recunoscut`);
          continue;
        }

        totalResult.success += result.success;
        totalResult.errors.push(...result.errors);
        totalResult.warnings.push(...result.warnings);
      } catch (error) {
        totalResult.errors.push(`Eroare la procesarea fișierului ${file.name}: ${error}`);
      }
    }

    setImportResult(totalResult);
    setImporting(false);
    onRefetch(); // Refresh data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Import/Export Date</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'export'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Export Date
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'import'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Import Date
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Exportă Date în Format CSV</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={exportVehicles}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Vehicule</h4>
                  <p className="text-sm text-gray-500">{data.vehicule.length} înregistrări</p>
                </div>
              </button>

              <button
                onClick={exportCategories}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Categorii</h4>
                  <p className="text-sm text-gray-500">{data.categorii.length} înregistrări</p>
                </div>
              </button>

              <button
                onClick={exportCoverageOptions}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Acoperiri</h4>
                  <p className="text-sm text-gray-500">
                    {data.vehicule.reduce((sum, v) => sum + v.acoperiri.length, 0)} înregistrări
                  </p>
                </div>
              </button>

              <button
                onClick={exportExtraOptions}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Opțiuni Extra</h4>
                  <p className="text-sm text-gray-500">
                    {data.vehicule.reduce((sum, v) => sum + v.optiuniExtra.length, 0)} înregistrări
                  </p>
                </div>
              </button>

              <button
                onClick={exportMaterials}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Materiale</h4>
                  <p className="text-sm text-gray-500">
                    {data.materialePrint.length + data.materialeLaminare.length} înregistrări
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Importă Date din Fișiere CSV</h3>
            
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Selectează fișierele CSV pentru import</p>
                  <p className="text-sm text-gray-500">
                    Poți selecta multiple fișiere. Numele fișierului determină tipul de date importate.
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-4"
                />
              </div>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Fișiere selectate:</h4>
                <ul className="space-y-1">
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p><strong>Tipuri de fișiere suportate:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Fișiere cu "categor" în nume → Import categorii</li>
                  <li>Fișiere cu "vehicul" în nume → Import vehicule</li>
                </ul>
              </div>
              <button
                onClick={processImport}
                disabled={!selectedFiles || selectedFiles.length === 0 || importing}
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
                <h3 className="text-lg font-semibold">Rezultatul Importului</h3>
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
                      {importResult.success} înregistrări importate cu succes
                    </span>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Avertismente:</span>
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
                      <span className="font-medium text-red-800">Erori:</span>
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
        </div>
      )}
    </div>
  );
}
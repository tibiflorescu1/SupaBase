import React, { useState, useEffect } from 'react';
import { Calculator, Car, Layers, Palette, FileText, Download, Upload } from 'lucide-react';
import Papa from 'papaparse';
import type { AppData, Vehicul, Acoperire, OptiuneExtra, MaterialPrint, MaterialLaminare } from '../hooks/useSupabaseData';

interface CalculatorTabProps {
  data: AppData;
}

interface CalculationResult {
  vehicul: Vehicul;
  acoperire: Acoperire;
  materialPrint: MaterialPrint;
  materialLaminare?: MaterialLaminare;
  optiuniExtra: OptiuneExtra[];
  printAlb: boolean;
  pretAcoperire: number;
  pretMaterialPrint: number;
  pretMaterialLaminare: number;
  pretPrintAlb: number;
  pretOptiuniExtra: number;
  pretTotal: number;
}

export default function CalculatorTab({ data }: CalculatorTabProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedCoverageId, setSelectedCoverageId] = useState<string>('');
  const [selectedPrintMaterialId, setSelectedPrintMaterialId] = useState<string>('');
  const [selectedLaminationMaterialId, setSelectedLaminationMaterialId] = useState<string>('');
  const [selectedExtraOptions, setSelectedExtraOptions] = useState<string[]>([]);
  const [whitePrint, setWhitePrint] = useState(false);
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedVehicle = data.vehicule.find(v => v.id === selectedVehicleId);
  const selectedCoverage = selectedVehicle?.acoperiri.find(a => a.id === selectedCoverageId);
  const selectedPrintMaterial = data.materialePrint.find(m => m.id === selectedPrintMaterialId);
  const selectedLaminationMaterial = data.materialeLaminare.find(m => m.id === selectedLaminationMaterialId);

  // Reset dependent selections when vehicle changes
  useEffect(() => {
    setSelectedCoverageId('');
    setSelectedExtraOptions([]);
  }, [selectedVehicleId]);

  // Reset white print when print material changes
  useEffect(() => {
    if (selectedPrintMaterial && !selectedPrintMaterial.permitePrintAlb) {
      setWhitePrint(false);
    }
  }, [selectedPrintMaterialId]);

  const calculatePrice = () => {
    if (!selectedVehicle || !selectedCoverage || !selectedPrintMaterial) {
      alert('Te rog să selectezi vehiculul, acoperirea și materialul de print');
      return;
    }

    const vehiculExtraOptions = selectedExtraOptions
      .map(id => selectedVehicle.optiuniExtra.find(o => o.id === id))
      .filter(Boolean) as OptiuneExtra[];

    // Calculate base coverage price
    const pretAcoperire = selectedCoverage.pret;

    // Calculate print material cost
    let pretMaterialPrint = 0;
    if (selectedPrintMaterial.tipCalcul === 'procentual') {
      pretMaterialPrint = (pretAcoperire * selectedPrintMaterial.valoare) / 100;
    } else {
      pretMaterialPrint = selectedPrintMaterial.valoare;
    }

    // Calculate lamination material cost
    let pretMaterialLaminare = 0;
    if (selectedLaminationMaterial) {
      if (selectedLaminationMaterial.tipCalcul === 'procentual') {
        pretMaterialLaminare = ((pretAcoperire + pretMaterialPrint) * selectedLaminationMaterial.valoare) / 100;
      } else {
        pretMaterialLaminare = selectedLaminationMaterial.valoare;
      }
    }

    // Calculate white print cost
    let pretPrintAlb = 0;
    if (whitePrint && selectedPrintMaterial.permitePrintAlb) {
      if (data.setariPrintAlb.tipCalcul === 'procentual') {
        pretPrintAlb = ((pretAcoperire + pretMaterialPrint) * data.setariPrintAlb.valoare) / 100;
      } else {
        pretPrintAlb = data.setariPrintAlb.valoare;
      }
    }

    // Calculate extra options cost
    const pretOptiuniExtra = vehiculExtraOptions.reduce((sum, option) => sum + option.pret, 0);

    // Calculate total
    const pretTotal = pretAcoperire + pretMaterialPrint + pretMaterialLaminare + pretPrintAlb + pretOptiuniExtra;

    const result: CalculationResult = {
      vehicul: selectedVehicle,
      acoperire: selectedCoverage,
      materialPrint: selectedPrintMaterial,
      materialLaminare: selectedLaminationMaterial,
      optiuniExtra: vehiculExtraOptions,
      printAlb: whitePrint,
      pretAcoperire,
      pretMaterialPrint,
      pretMaterialLaminare,
      pretPrintAlb,
      pretOptiuniExtra,
      pretTotal
    };

    setCalculations(prev => [result, ...prev]);
  };

  const clearCalculations = () => {
    setCalculations([]);
  };

  const exportToCSV = () => {
    if (calculations.length === 0) {
      alert('Nu există calcule pentru export');
      return;
    }

    const csvData = calculations.map(calc => ({
      'Vehicul': `${calc.vehicul.producator} ${calc.vehicul.model}`,
      'Acoperire': calc.acoperire.nume,
      'Preț Acoperire (RON)': calc.pretAcoperire.toFixed(2),
      'Material Print': calc.materialPrint.nume,
      'Preț Material Print (RON)': calc.pretMaterialPrint.toFixed(2),
      'Material Laminare': calc.materialLaminare?.nume || 'N/A',
      'Preț Material Laminare (RON)': calc.pretMaterialLaminare.toFixed(2),
      'Print Alb': calc.printAlb ? 'Da' : 'Nu',
      'Preț Print Alb (RON)': calc.pretPrintAlb.toFixed(2),
      'Opțiuni Extra': calc.optiuniExtra.map(o => o.nume).join(', ') || 'N/A',
      'Preț Opțiuni Extra (RON)': calc.pretOptiuniExtra.toFixed(2),
      'TOTAL (RON)': calc.pretTotal.toFixed(2)
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `calcule_preturi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVehicles = data.vehicule.filter(vehicle =>
    vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="w-6 h-6 mr-2 text-blue-600" />
          Calculator Prețuri
        </h2>
        <div className="flex space-x-2">
          {calculations.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={clearCalculations}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Șterge Calcule
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            Configurare
          </h3>

          <div className="space-y-4">
            {/* Vehicle Search and Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caută și Selectează Vehicul
              </label>
              <input
                type="text"
                placeholder="Caută după producător sau model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selectează vehiculul</option>
                {filteredVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.producator} {vehicle.model} ({vehicle.perioadaFabricatie})
                  </option>
                ))}
              </select>
            </div>

            {/* Coverage Selection */}
            {selectedVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acoperire
                </label>
                <select
                  value={selectedCoverageId}
                  onChange={(e) => setSelectedCoverageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selectează acoperirea</option>
                  {selectedVehicle.acoperiri.map(coverage => (
                    <option key={coverage.id} value={coverage.id}>
                      {coverage.nume} - {coverage.pret} RON
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Print Material Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Print
              </label>
              <select
                value={selectedPrintMaterialId}
                onChange={(e) => setSelectedPrintMaterialId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selectează materialul de print</option>
                {data.materialePrint.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.nume} - {material.valoare} {material.tipCalcul === 'procentual' ? '%' : 'RON'}
                  </option>
                ))}
              </select>
            </div>

            {/* White Print Option */}
            {selectedPrintMaterial && selectedPrintMaterial.permitePrintAlb && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="white-print"
                  checked={whitePrint}
                  onChange={(e) => setWhitePrint(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="white-print" className="ml-2 block text-sm text-gray-900">
                  Print Alb (+{data.setariPrintAlb.valoare} {data.setariPrintAlb.tipCalcul === 'procentual' ? '%' : 'RON'})
                </label>
              </div>
            )}

            {/* Lamination Material Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Laminare (Opțional)
              </label>
              <select
                value={selectedLaminationMaterialId}
                onChange={(e) => setSelectedLaminationMaterialId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Fără laminare</option>
                {data.materialeLaminare.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.nume} - {material.valoare} {material.tipCalcul === 'procentual' ? '%' : 'RON'}
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Options */}
            {selectedVehicle && selectedVehicle.optiuniExtra.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opțiuni Extra
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedVehicle.optiuniExtra.map(option => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`option-${option.id}`}
                        checked={selectedExtraOptions.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExtraOptions(prev => [...prev, option.id]);
                          } else {
                            setSelectedExtraOptions(prev => prev.filter(id => id !== option.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`option-${option.id}`} className="ml-2 block text-sm text-gray-900">
                        {option.nume} - {option.pret} RON
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={calculatePrice}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculează Prețul
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Rezultate Calcule ({calculations.length})
          </h3>

          {calculations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nu există calcule încă</p>
              <p className="text-sm">Completează formularul și apasă "Calculează Prețul"</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {calculations.map((calc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {calc.vehicul.producator} {calc.vehicul.model}
                      </h4>
                      <p className="text-sm text-gray-600">{calc.acoperire.nume}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {calc.pretTotal.toFixed(2)} RON
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Acoperire:</span>
                      <span>{calc.pretAcoperire.toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material Print ({calc.materialPrint.nume}):</span>
                      <span>{calc.pretMaterialPrint.toFixed(2)} RON</span>
                    </div>
                    {calc.materialLaminare && (
                      <div className="flex justify-between">
                        <span>Laminare ({calc.materialLaminare.nume}):</span>
                        <span>{calc.pretMaterialLaminare.toFixed(2)} RON</span>
                      </div>
                    )}
                    {calc.printAlb && (
                      <div className="flex justify-between">
                        <span>Print Alb:</span>
                        <span>{calc.pretPrintAlb.toFixed(2)} RON</span>
                      </div>
                    )}
                    {calc.pretOptiuniExtra > 0 && (
                      <div className="flex justify-between">
                        <span>Opțiuni Extra:</span>
                        <span>{calc.pretOptiuniExtra.toFixed(2)} RON</span>
                      </div>
                    )}
                  </div>

                  {calc.optiuniExtra.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Opțiuni: {calc.optiuniExtra.map(o => o.nume).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
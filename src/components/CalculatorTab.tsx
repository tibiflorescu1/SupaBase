// src/components/CalculatorTab.tsx
import React, { useState, useMemo, useEffect } from 'react';
import type { AppData, Vehicul, Acoperire, MaterialPrint, MaterialLaminare } from '../hooks/useSupabaseData';

interface CalculatorTabProps {
  data: AppData;
}

export default function CalculatorTab({ data }: CalculatorTabProps) {
    const [selectedVehiculId, setSelectedVehiculId] = useState<string>('');
    const [selectedAcoperireId, setSelectedAcoperireId] = useState<string>('');
    const [selectedOptiuni, setSelectedOptiuni] = useState<string[]>([]);
    const [selectedPrintId, setSelectedPrintId] = useState<string>(data.materialePrint[0]?.id || '');
    const [selectedLaminareId, setSelectedLaminareId] = useState<string>(data.materialeLaminare[0]?.id || '');
    const [printCuAlb, setPrintCuAlb] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedProducer, setSelectedProducer] = useState<string>('');

    const vehicul = useMemo(() => data.vehicule.find(v => v.id === selectedVehiculId), [selectedVehiculId, data.vehicule]);
    const acoperire = useMemo(() => vehicul?.acoperiri.find(a => a.id === selectedAcoperireId), [selectedAcoperireId, vehicul]);
    const materialPrint = useMemo(() => data.materialePrint.find(m => m.id === selectedPrintId), [selectedPrintId, data.materialePrint]);
    const materialLaminare = useMemo(() => data.materialeLaminare.find(m => m.id === selectedLaminareId), [selectedLaminareId, data.materialeLaminare]);

    // Filter vehicles based on category and producer
    const filteredVehicles = useMemo(() => {
        return data.vehicule.filter(vehicle => {
            const searchMatch = searchTerm === '' || 
                (vehicle.producator && vehicle.producator.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (vehicle.model && vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()));
            const categoryMatch = selectedCategory === '' || vehicle.categorieId === selectedCategory;
            const producerMatch = selectedProducer === '' || vehicle.producator === selectedProducer;
            return searchMatch && categoryMatch && producerMatch;
        });
    }, [data.vehicule, searchTerm, selectedCategory, selectedProducer]);

    // Get unique producers for filter dropdown
    const uniqueProducers = useMemo(() => {
        const producers = selectedCategory === '' 
            ? data.vehicule.map(v => v.producator).filter(Boolean)
            : data.vehicule.filter(v => v.categorieId === selectedCategory).map(v => v.producator).filter(Boolean);
        return [...new Set(producers)].filter(p => p && p.trim() !== '').sort();
    }, [data.vehicule, selectedCategory]);

    // Get category name helper
    const getCategoryName = (categoryId: string) => {
        const category = data.categorii.find(cat => cat.id === categoryId);
        return category ? category.nume : 'Necunoscută';
    };
    useEffect(() => {
        if (!data.materialePrint.some(m => m.id === selectedPrintId)) {
            setSelectedPrintId(data.materialePrint[0]?.id || '');
        }
    }, [data.materialePrint, selectedPrintId]);

    useEffect(() => {
        if (!data.materialeLaminare.some(m => m.id === selectedLaminareId)) {
            setSelectedLaminareId(data.materialeLaminare[0]?.id || '');
        }
    }, [data.materialeLaminare, selectedLaminareId]);

    // Reset vehicle selection when filters change
    useEffect(() => {
        if (selectedVehiculId && !filteredVehicles.some(v => v.id === selectedVehiculId)) {
            setSelectedVehiculId('');
            setSelectedAcoperireId('');
            setSelectedOptiuni([]);
            setPrintCuAlb(false);
        }
    }, [filteredVehicles, selectedVehiculId]);

    // Reset producer filter when category changes
    useEffect(() => {
        if (selectedCategory && selectedProducer && !uniqueProducers.includes(selectedProducer)) {
            setSelectedProducer('');
        }
    }, [selectedCategory, selectedProducer, uniqueProducers]);
    const handleVehiculChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vehiculId = e.target.value;
        const vehiculSelectat = filteredVehicles.find(v => v.id === vehiculId);
        setSelectedVehiculId(vehiculId);
        setSelectedAcoperireId(vehiculSelectat?.acoperiri[0]?.id || '');
        setSelectedOptiuni([]);
        setPrintCuAlb(false);
    }

    const handleOptiuneToggle = (optiuneId: string) => {
        setSelectedOptiuni(prev =>
            prev.includes(optiuneId)
            ? prev.filter(id => id !== optiuneId)
            : [...prev, optiuneId]
        );
    }

    const calcul = useMemo(() => {
        if (!vehicul || !acoperire || !materialPrint || !materialLaminare) {
            return { total: 0, breakdown: [] };
        }

        let breakdown: {label: string, value: number}[] = [];
        const pretBazaAcoperire = acoperire.pret;
        breakdown.push({ label: `Preț bază (${acoperire.nume})`, value: pretBazaAcoperire });

        const sumaOptiuni = vehicul.optiuniExtra
            .filter(opt => selectedOptiuni.includes(opt.id))
            .reduce((sum, opt) => sum + opt.pret, 0);
        if(sumaOptiuni > 0) breakdown.push({ label: 'Opțiuni extra selectate', value: sumaOptiuni });

        const pretVehicul = pretBazaAcoperire + sumaOptiuni;

        const costPrint = materialPrint.tipCalcul === 'suma_fixa'
            ? materialPrint.valoare
            : pretVehicul * (materialPrint.valoare / 100);
        breakdown.push({ label: `Cost print (${materialPrint.nume})`, value: costPrint });

        const costLaminare = materialLaminare.tipCalcul === 'suma_fixa'
            ? materialLaminare.valoare
            : pretVehicul * (materialLaminare.valoare / 100);
        breakdown.push({ label: `Cost laminare (${materialLaminare.nume})`, value: costLaminare });

        let costPrintAlb = 0;
        const setariExtra = data.setariPrintAlb;
        if (printCuAlb && materialPrint.permitePrintAlb) {
            costPrintAlb = setariExtra.tipCalcul === 'suma_fixa'
                ? setariExtra.valoare
                : (pretVehicul + costPrint) * (setariExtra.valoare / 100);
             breakdown.push({ label: 'Cost extra - Print cu Alb', value: costPrintAlb });
        }

        const totalFinal = pretVehicul + costPrint + costLaminare + costPrintAlb;
        return { total: totalFinal, breakdown };
    }, [vehicul, acoperire, selectedOptiuni, materialPrint, materialLaminare, printCuAlb, data.setariPrintAlb]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
                 <h2 className="text-2xl font-bold text-gray-700 border-b pb-4">Calculator Ofertă</h2>
                
                {/* Filters */}
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">Căutare și filtrare vehicule</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Caută după producător sau model..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)} 
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Toate categoriile</option>
                            {data.categorii.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nume}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedProducer} 
                            onChange={(e) => setSelectedProducer(e.target.value)} 
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Toți producătorii</option>
                            {uniqueProducers.map(producer => (
                                <option key={producer} value={producer}>{producer}</option>
                            ))}
                        </select>
                    </div>
                    {(searchTerm || selectedCategory || selectedProducer) && (
                        <div className="mt-2 text-sm text-gray-600">
                            Afișez {filteredVehicles.length} vehicule
                            {searchTerm && ` care conțin "${searchTerm}"`}
                            {selectedCategory && ` din categoria "${getCategoryName(selectedCategory)}"`}
                            {selectedProducer && ` de la producătorul "${selectedProducer}"`}
                        </div>
                    )}
                </div>

                <div>
                    <label className="font-semibold text-gray-700 block mb-2">1. Selectează vehiculul și acoperirea</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select 
                            value={selectedVehiculId} 
                            onChange={handleVehiculChange} 
                            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="" disabled>Alege un vehicul...</option>
                            {filteredVehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.producator} {v.model}
                                    {v.perioadaFabricatie && ` (${v.perioadaFabricatie})`}
                                </option>
                            ))}
                        </select>
                        {vehicul && (
                             <select 
                                value={selectedAcoperireId} 
                                onChange={e => setSelectedAcoperireId(e.target.value)} 
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="" disabled>Alege o acoperire...</option>
                                {vehicul.acoperiri.map(a => <option key={a.id} value={a.id}>{a.nume} ({a.pret} RON)</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {vehicul && vehicul.optiuniExtra.length > 0 && (
                     <div>
                        <label className="font-semibold text-gray-700 block mb-2">2. Selectează opțiunile extra</label>
                        <div className="space-y-2">
                             {vehicul.optiuniExtra.map(opt => (
                                <label key={opt.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptiuni.includes(opt.id)}
                                        onChange={() => handleOptiuneToggle(opt.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{opt.nume} (+{opt.pret} RON)</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                 {vehicul && (
                     <div>
                        <label className="font-semibold text-gray-700 block mb-2">3. Selectează materialele</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select 
                                value={selectedPrintId} 
                                onChange={e => setSelectedPrintId(e.target.value)} 
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {data.materialePrint.map(m => <option key={m.id} value={m.id}>{m.nume}</option>)}
                            </select>
                            <select 
                                value={selectedLaminareId} 
                                onChange={e => setSelectedLaminareId(e.target.value)} 
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {data.materialeLaminare.map(m => <option key={m.id} value={m.id}>{m.nume}</option>)}
                            </select>
                        </div>
                        {materialPrint?.permitePrintAlb && (
                             <label className="flex items-center gap-3 p-3 mt-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={printCuAlb}
                                    onChange={(e) => setPrintCuAlb(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Adaugă Print cu Alb</span>
                            </label>
                        )}
                    </div>
                 )}

            </div>
            <div className="lg:col-span-1">
                 <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg sticky top-8">
                     <h3 className="text-2xl font-bold border-b border-gray-600 pb-3 mb-4">Rezumat Ofertă</h3>
                     {vehicul && acoperire ? (
                         <div className="space-y-2">
                             <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                                 <div className="text-sm text-gray-300 mb-1">Vehicul selectat:</div>
                                 <div className="font-medium text-blue-400 text-sm">{vehicul.producator} {vehicul.model}</div>
                                 <div className="text-sm text-gray-300 mt-2 mb-1">Acoperire selectată:</div>
                                 <div className="font-medium text-green-400 text-sm">{acoperire.nume}</div>
                                 {selectedOptiuni.length > 0 && (
                                     <>
                                         <div className="text-sm text-gray-300 mt-2 mb-1">Opțiuni selectate:</div>
                                         {vehicul.optiuniExtra
                                             .filter(opt => selectedOptiuni.includes(opt.id))
                                             .map(opt => (
                                                 <div key={opt.id} className="font-medium text-yellow-400 text-xs">
                                                     {opt.nume}
                                                 </div>
                                             ))
                                         }
                                     </>
                                 )}
                             </div>
                             {calcul.breakdown.map((item, index) => (
                                <div key={index} className="flex justify-between text-gray-300">
                                    <span>{item.label}</span>
                                    <span className="font-mono">{item.value.toFixed(2)}</span>
                                </div>
                             ))}
                             <div className="border-t border-gray-600 my-4"></div>
                             <div className="flex justify-between text-2xl font-bold mt-4">
                                <span>TOTAL</span>
                                <span>{calcul.total.toFixed(2)} RON</span>
                             </div>
                         </div>
                     ) : (
                        <p className="text-gray-400">Selectează un vehicul pentru a începe calculul.</p>
                     )}
                 </div>
            </div>
        </div>
    );
};
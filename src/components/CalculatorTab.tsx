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

    const vehicul = useMemo(() => data.vehicule.find(v => v.id === selectedVehiculId), [selectedVehiculId, data.vehicule]);
    const acoperire = useMemo(() => vehicul?.acoperiri.find(a => a.id === selectedAcoperireId), [selectedAcoperireId, vehicul]);
    const materialPrint = useMemo(() => data.materialePrint.find(m => m.id === selectedPrintId), [selectedPrintId, data.materialePrint]);
    const materialLaminare = useMemo(() => data.materialeLaminare.find(m => m.id === selectedLaminareId), [selectedLaminareId, data.materialeLaminare]);

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

    const handleVehiculChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vehiculId = e.target.value;
        const vehiculSelectat = data.vehicule.find(v => v.id === vehiculId);
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
                <div>
                    <label className="font-semibold text-gray-700 block mb-2">1. Selectează modelul și acoperirea</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={selectedVehiculId} onChange={handleVehiculChange} className="w-full p-3 border rounded-lg bg-gray-50">
                            <option value="" disabled>Alege un vehicul...</option>
                            {data.vehicule.map(v => <option key={v.id} value={v.id}>{v.producator} {v.model}</option>)}
                        </select>
                        {vehicul && (
                             <select value={selectedAcoperireId} onChange={e => setSelectedAcoperireId(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
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
                            <select value={selectedPrintId} onChange={e => setSelectedPrintId(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
                                {data.materialePrint.map(m => <option key={m.id} value={m.id}>{m.nume}</option>)}
                            </select>
                            <select value={selectedLaminareId} onChange={e => setSelectedLaminareId(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50">
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
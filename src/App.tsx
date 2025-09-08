import React, { useState, useEffect, useMemo } from 'react';

// --- ICONURI (LUCIDE-REACT) ---
const CarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L1 16v1c0 .6.4 1 1 1h2"/><path d="M7 17h10"/><circle cx="7" cy="17" r="2"/><path d="M17 17h2"/><circle cx="17" cy="17" r="2"/></svg>
);
const LayersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);
const CalculatorIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><line x1="16" x2="12" y1="10" y2="10" /><line x1="10" x2="8" y1="10" y2="10" /><line x1="14" x2="12" y1="14" y2="14" /><line x1="8" x2="8" y1="14" y2="18" /></svg>
);
const PlusCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="16" /><line x1="8" x2="16" y1="12" y2="12" /></svg>
);
const Trash2Icon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const EditIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const XIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const TagIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
);
const UploadCloudIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const DownloadIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const FileIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
const SettingsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const Loader2Icon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
const AlertCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);


// --- TIPURI DE DATE (TYPESCRIPT) ---
type TipCalcul = 'procentual' | 'suma_fixa';

interface Fisier {
    nume: string;
    dataUrl: string; // Base64 encoded file content
}

interface Categorie {
    id: string;
    nume: string;
}

interface OptiuneExtra {
    id: string;
    nume: string;
    pret: number;
    fisier?: Fisier;
}

interface Acoperire {
    id: string;
    nume: string;
    pret: number;
    fisier?: Fisier;
}

interface Vehicul {
    id: string;
    producator: string;
    model: string;
    categorieId: string;
    perioadaFabricatie: string;
    acoperiri: Acoperire[];
    optiuniExtra: OptiuneExtra[];
}

interface MaterialPrint {
    id: string;
    nume: string;
    tipCalcul: TipCalcul;
    valoare: number;
    permitePrintAlb: boolean;
}

interface MaterialLaminare {
    id: string;
    nume: string;
    tipCalcul: TipCalcul;
    valoare: number;
}

interface SetariPrintAlb {
    tipCalcul: TipCalcul;
    valoare: number;
}

interface AppData {
    vehicule: Vehicul[];
    categorii: Categorie[];
    materialePrint: MaterialPrint[];
    materialeLaminare: MaterialLaminare[];
    setariPrintAlb: SetariPrintAlb;
}

// --- DATE PRECONFIGURATE ---
const DATE_INITIALE: AppData = {
    categorii: [
        { id: 'cat1', nume: 'ATV' },
        { id: 'cat2', nume: 'SSV' },
        { id: 'cat3', nume: 'Motocicletă' },
        { id: 'cat4', nume: 'Quad' },
        { id: 'cat5', nume: 'Enduro' },
    ],
    vehicule: [
        { id: 'veh1', producator: 'Honda', model: 'CRF450R', categorieId: 'cat3', perioadaFabricatie: '2021-2024', acoperiri: [{id: 'ac1', nume: 'Grafică Completă', pret: 800}, {id: 'ac2', nume: 'Kit Stickere', pret: 350}], optiuniExtra: [{id: 'opt1', nume: 'Grafica Aripa', pret: 150}, {id: 'opt2', nume: 'Grafica Furca', pret: 100}] },
        { id: 'veh2', producator: 'Yamaha', model: 'YFZ450R', categorieId: 'cat1', perioadaFabricatie: '2020-2023', acoperiri: [{id: 'ac3', nume: 'Grafică Completă', pret: 1200}], optiuniExtra: [{id: 'opt3', nume: 'Kit Stickere Jante', pret: 250}, {id: 'opt4', nume: 'Protectii Maini', pret: 200}] },
        { id: 'veh3', producator: 'Can-Am', model: 'Maverick X3', categorieId: 'cat2', perioadaFabricatie: '2022-2024', acoperiri: [{id: 'ac4', nume: 'Grafică Parțială', pret: 1800}, {id: 'ac5', nume: 'Grafică Plafon & Uși', pret: 950}], optiuniExtra: [{id: 'opt5', nume: 'Grafica Plafon', pret: 350}, {id: 'opt6', nume: 'Grafica Usi', pret: 300}] },
        { id: 'veh4', producator: 'Kawasaki', model: 'KFX450R', categorieId: 'cat1', perioadaFabricatie: '2019-2022', acoperiri: [{id: 'ac6', nume: 'Kit Stickere', pret: 1100}], optiuniExtra: [{id: 'opt7', nume: 'Bumper Sticker', pret: 120}] },
        { id: 'veh5', producator: 'Polaris', model: 'RZR XP 1000', categorieId: 'cat2', perioadaFabricatie: '2021-2023', acoperiri: [{id: 'ac7', nume: 'Grafică Completă', pret: 1500}], optiuniExtra: [{id: 'opt8', nume: 'Stickere Suspensii', pret: 280}, {id: 'opt9', nume: 'Grafica Capota', pret: 220}] },
        { id: 'veh6', producator: 'Arctic Cat', model: 'Wildcat XX', categorieId: 'cat2', perioadaFabricatie: '2020-2024', acoperiri: [{id: 'ac8', nume: 'Grafică Personalizată', pret: 1650}], optiuniExtra: [{id: 'opt10', nume: 'Kit Racing Numbers', pret: 180}] },
        { id: 'veh7', producator: 'KTM', model: 'EXC-F 450', categorieId: 'cat3', perioadaFabricatie: '2023-2024', acoperiri: [{id: 'ac9', nume: 'Grafică Completă', pret: 750}], optiuniExtra: [{id: 'opt11', nume: 'Protectii Radiator', pret: 130}, {id: 'opt12', nume: 'Husa Sa', pret: 200}] },
        { id: 'veh8', producator: 'Suzuki', model: 'LTR450', categorieId: 'cat1', perioadaFabricatie: '2018-2021', acoperiri: [{id: 'ac10', nume: 'Grafică Parțială', pret: 950}], optiuniExtra: [{id: 'opt13', nume: 'Kit Numar Concurs', pret: 100}] },
    ],
    materialePrint: [
        { id: 'mp1', nume: 'Folie Cast Premium', tipCalcul: 'procentual', valoare: 45, permitePrintAlb: true },
        { id: 'mp2', nume: 'Folie Calendered', tipCalcul: 'procentual', valoare: 25, permitePrintAlb: false },
        { id: 'mp3', nume: 'Folie Carbon 3D', tipCalcul: 'procentual', valoare: 65, permitePrintAlb: true },
    ],
    materialeLaminare: [
        { id: 'ml1', nume: 'Laminare Standard', tipCalcul: 'procentual', valoare: 15 },
        { id: 'ml2', nume: 'Laminare Premium', tipCalcul: 'procentual', valoare: 20 },
        { id: 'ml3', nume: 'Laminare Anti-Scratch', tipCalcul: 'procentual', valoare: 25 },
    ],
    setariPrintAlb: {
        tipCalcul: 'procentual',
        valoare: 35
    }
};

// --- CUSTOM HOOK PENTRU LOCALSTORAGE ---
// Un hook reutilizabil pentru a sincroniza starea cu localStorage.
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}


// --- COMPONENTA MODAL GENERIC ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTA TAB MODELE ---
const ModeleTab: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }> = ({ data, setData }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [vehiculEditat, setVehiculEditat] = useState<Vehicul | null>(null);
    const [filtru, setFiltru] = useState(''); // Stare pentru filtrare

    // Memoizez lista filtrată pentru performanță
    const vehiculeFiltrate = useMemo(() => {
        if (!filtru) {
            return data.vehicule;
        }
        return data.vehicule.filter(v =>
            v.producator.toLowerCase().includes(filtru.toLowerCase()) ||
            v.model.toLowerCase().includes(filtru.toLowerCase())
        );
    }, [data.vehicule, filtru]);

    const handleAdauga = () => {
        setVehiculEditat(null);
        setModalOpen(true);
    };

    const handleEditeaza = (vehicul: Vehicul) => {
        setVehiculEditat(vehicul);
        setModalOpen(true);
    };

    const handleSterge = (id: string) => {
        if(window.confirm('Ești sigur că vrei să ștergi acest model?')){
             setData(prev => ({ ...prev, vehicule: prev.vehicule.filter(v => v.id !== id) }));
        }
    };
    
    const handleSave = (vehicul: Vehicul) => {
        if(vehiculEditat) {
            setData(prev => ({...prev, vehicule: prev.vehicule.map(v => v.id === vehicul.id ? vehicul : v)}));
        } else {
            setData(prev => ({...prev, vehicule: [...prev.vehicule, {...vehicul, id: `veh${Date.now()}`}]}));
        }
        setModalOpen(false);
    };

    const formatarePret = (acoperiri: Acoperire[]) => {
        if (!acoperiri || acoperiri.length === 0) return 'N/A';
        if (acoperiri.length === 1) return `${acoperiri[0].pret} RON`;
        
        const preturi = acoperiri.map(a => a.pret);
        const min = Math.min(...preturi);
        const max = Math.max(...preturi);
        return `${min} - ${max} RON`;
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-700">Gestiune Modele Vehicule</h2>
                <div className="flex items-center gap-4">
                     <input
                        type="text"
                        placeholder="Filtrează după producător/model..."
                        value={filtru}
                        onChange={(e) => setFiltru(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button onClick={handleAdauga} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
                        <PlusCircleIcon className="w-5 h-5" /> Adaugă Model
                    </button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Producător</th>
                            <th className="px-6 py-3">Model</th>
                            <th className="px-6 py-3">Categorie</th>
                            <th className="px-6 py-3">An Fabricație</th>
                            <th className="px-6 py-3">Preț Bază</th>
                            <th className="px-6 py-3 text-right">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehiculeFiltrate.map(v => {
                            const categorie = data.categorii.find(c => c.id === v.categorieId);
                            return (
                                <tr key={v.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{v.producator}</td>
                                    <td className="px-6 py-4">{v.model}</td>
                                    <td className="px-6 py-4">{categorie?.nume || 'N/A'}</td>
                                    <td className="px-6 py-4">{v.perioadaFabricatie}</td>
                                    <td className="px-6 py-4">{formatarePret(v.acoperiri)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEditeaza(v)} className="text-blue-600 hover:text-blue-800 mr-4"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleSterge(v.id)} className="text-red-600 hover:text-red-800"><Trash2Icon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
            </div>
            <ModalVehicul isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} vehicul={vehiculEditat} categorii={data.categorii}/>
        </div>
    );
};

// --- MODAL PENTRU ADĂUGARE/EDITARE VEHICUL ---
const ModalVehicul: React.FC<{isOpen: boolean, onClose: () => void, onSave: (v: Vehicul) => void, vehicul: Vehicul | null, categorii: Categorie[]}> = ({isOpen, onClose, onSave, vehicul, categorii}) => {
    
    const defaultVehiculState: Vehicul = {id: '', producator: '', model: '', categorieId: '', perioadaFabricatie: '', acoperiri: [], optiuniExtra: []};
    const [formData, setFormData] = useState<Vehicul>(vehicul || defaultVehiculState);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setFormData(vehicul || {...defaultVehiculState, categorieId: categorii[0]?.id || ''});
    }, [vehicul, categorii, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    }
    
    // --- Functie generica pentru a converti un fisier in Base64 ---
    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // --- LOGICA PENTRU FIȘIERE ACOPERIRI ---
    const handleAcoperireFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const dataUrl = await fileToDataUrl(file);
            const noiAcoperiri = [...formData.acoperiri];
            noiAcoperiri[index].fisier = { nume: file.name, dataUrl };
            setFormData(prev => ({ ...prev, acoperiri: noiAcoperiri }));
        } catch (error) {
            console.error("Eroare la încărcarea fișierului:", error);
            alert("Nu s-a putut încărca fișierul. Încearcă din nou.");
        } finally {
            setUploading(false);
        }
    };
    const stergeAcoperireFisier = (index: number) => {
        const noiAcoperiri = [...formData.acoperiri];
        noiAcoperiri[index].fisier = undefined;
        setFormData(prev => ({...prev, acoperiri: noiAcoperiri}));
    }

    // --- LOGICA PENTRU ACOPERIRI ---
    const handleAcoperireChange = (index: number, field: keyof Acoperire, value: string | number) => {
        const noiAcoperiri = [...formData.acoperiri];
        (noiAcoperiri[index] as any)[field] = field === 'pret' ? parseFloat(value as string) || 0 : value;
        setFormData(prev => ({...prev, acoperiri: noiAcoperiri}));
    };
    const adaugaAcoperire = () => {
        setFormData(prev => ({...prev, acoperiri: [...prev.acoperiri, {id: `ac${Date.now()}`, nume: '', pret: 0}]}));
    };
    const stergeAcoperire = (index: number) => {
        setFormData(prev => ({...prev, acoperiri: prev.acoperiri.filter((_, i) => i !== index)}));
    };
    
    // --- LOGICA PENTRU FIȘIERE OPȚIUNI EXTRA ---
    const handleOptiuneFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const dataUrl = await fileToDataUrl(file);
            const noiOptiuni = [...formData.optiuniExtra];
            noiOptiuni[index].fisier = { nume: file.name, dataUrl };
            setFormData(prev => ({ ...prev, optiuniExtra: noiOptiuni }));
        } catch (error) {
            console.error("Eroare la încărcarea fișierului:", error);
            alert("Nu s-a putut încărca fișierul. Încearcă din nou.");
        } finally {
            setUploading(false);
        }
    }
    const stergeOptiuneFisier = (index: number) => {
        const noiOptiuni = [...formData.optiuniExtra];
        noiOptiuni[index].fisier = undefined;
        setFormData(prev => ({...prev, optiuniExtra: noiOptiuni}));
    }

    // --- LOGICA PENTRU OPȚIUNI EXTRA ---
    const handleOptiuneChange = (index: number, field: keyof OptiuneExtra, value: string | number) => {
        const noiOptiuni = [...formData.optiuniExtra];
        (noiOptiuni[index] as any)[field] = field === 'pret' ? parseFloat(value as string) || 0 : value;
        setFormData(prev => ({...prev, optiuniExtra: noiOptiuni}));
    };
    const adaugaOptiune = () => {
        setFormData(prev => ({...prev, optiuniExtra: [...prev.optiuniExtra, {id: `opt${Date.now()}`, nume: '', pret: 0}]}));
    };
    const stergeOptiune = (index: number) => {
        setFormData(prev => ({...prev, optiuniExtra: prev.optiuniExtra.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(uploading) {
            alert("Se încarcă un fișier. Te rog așteaptă.");
            return;
        }
        if(!formData.producator || !formData.model || !formData.categorieId || formData.acoperiri.length === 0 || formData.acoperiri.some(a => !a.nume || a.pret <= 0)) {
            alert("Te rugăm să completezi câmpurile obligatorii și să adaugi cel puțin o variantă de acoperire cu preț valid.");
            return;
        }
        onSave(formData);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={vehicul ? 'Editează Vehicul' : 'Adaugă Vehicul Nou'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="producator" value={formData.producator} onChange={handleChange} placeholder="Producător (ex: Honda)" className="w-full p-2 border rounded" required/>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Model (ex: CRF450R)" className="w-full p-2 border rounded" required/>
                    <select name="categorieId" value={formData.categorieId} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="" disabled>Selectează Categoria</option>
                        {categorii.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                    </select>
                    <input type="text" name="perioadaFabricatie" value={formData.perioadaFabricatie} onChange={handleChange} placeholder="Perioada (ex: 2021-2024)" className="w-full p-2 border rounded"/>
                </div>

                <div className="pt-4 border-t">
                     <h4 className="font-semibold mb-2 text-gray-700">Variante de Acoperire (Prețuri de Bază)</h4>
                     {formData.acoperiri.map((ac, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 bg-gray-50 rounded-md items-center">
                            <input type="text" value={ac.nume} onChange={(e) => handleAcoperireChange(index, 'nume', e.target.value)} placeholder="Nume acoperire" className="w-full p-2 border rounded"/>
                            <input type="number" value={ac.pret} onChange={(e) => handleAcoperireChange(index, 'pret', e.target.value)} placeholder="Preț Bază" className="w-full p-2 border rounded"/>
                            <div className="flex items-center gap-1">
                                {ac.fisier ? (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-800 p-2 rounded-md text-sm w-full">
                                        <FileIcon className="w-4 h-4" />
                                        <span className="truncate flex-1">{ac.fisier.nume}</span>
                                        <a href={ac.fisier.dataUrl} download={ac.fisier.nume} className="text-blue-600 hover:text-blue-800"><DownloadIcon className="w-5 h-5"/></a>
                                        <button type="button" onClick={() => stergeAcoperireFisier(index)} className="text-red-500 hover:text-red-700"><Trash2Icon className="w-5 h-5"/></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 cursor-pointer bg-white border-2 border-dashed rounded-md p-2 text-sm text-gray-500 hover:bg-gray-100 w-full">
                                        <UploadCloudIcon className="w-5 h-5" /> Încarcă template
                                        <input type="file" className="hidden" onChange={(e) => handleAcoperireFileChange(index, e)} />
                                    </label>
                                )}
                                <button type="button" onClick={() => stergeAcoperire(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2Icon className="w-5 h-5"/></button>
                            </div>
                        </div>
                     ))}
                     <button type="button" onClick={adaugaAcoperire} className="text-sm text-blue-600 hover:underline mt-2 font-semibold">Adaugă variantă acoperire</button>
                </div>

                <div className="pt-4 border-t">
                     <h4 className="font-semibold mb-2 text-gray-700">Opțiuni Extra</h4>
                     {formData.optiuniExtra.map((opt, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 bg-gray-50 rounded-md items-center">
                            <input type="text" value={opt.nume} onChange={(e) => handleOptiuneChange(index, 'nume', e.target.value)} placeholder="Nume opțiune" className="w-full p-2 border rounded"/>
                            <input type="number" value={opt.pret} onChange={(e) => handleOptiuneChange(index, 'pret', e.target.value)} placeholder="Preț" className="w-full p-2 border rounded"/>
                            <div className="flex items-center gap-1">
                                {opt.fisier ? (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-800 p-2 rounded-md text-sm w-full">
                                        <FileIcon className="w-4 h-4" />
                                        <span className="truncate flex-1">{opt.fisier.nume}</span>
                                        <a href={opt.fisier.dataUrl} download={opt.fisier.nume} className="text-blue-600 hover:text-blue-800"><DownloadIcon className="w-5 h-5"/></a>
                                        <button type="button" onClick={() => stergeOptiuneFisier(index)} className="text-red-500 hover:text-red-700"><Trash2Icon className="w-5 h-5"/></button>
                                    </div>
                                ) : (
                                     <label className="flex items-center justify-center gap-2 cursor-pointer bg-white border-2 border-dashed rounded-md p-2 text-sm text-gray-500 hover:bg-gray-100 w-full">
                                        <UploadCloudIcon className="w-5 h-5" /> Încarcă template
                                        <input type="file" className="hidden" onChange={(e) => handleOptiuneFileChange(index, e)} />
                                    </label>
                                )}
                                <button type="button" onClick={() => stergeOptiune(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2Icon className="w-5 h-5"/></button>
                            </div>
                        </div>
                     ))}
                     <button type="button" onClick={adaugaOptiune} className="text-sm text-blue-600 hover:underline mt-2 font-semibold">Adaugă opțiune</button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Anulează</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300" disabled={uploading}>
                        {uploading ? 'Se încarcă...' : 'Salvează'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// --- COMPONENTA TAB CATEGORII ---
const CategoriiTab: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }> = ({ data, setData }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [categorieEditata, setCategorieEditata] = useState<Categorie | null>(null);

    const handleAdauga = () => {
        setCategorieEditata(null);
        setModalOpen(true);
    };

    const handleEditeaza = (categorie: Categorie) => {
        setCategorieEditata(categorie);
        setModalOpen(true);
    };

    const handleSterge = (id: string) => {
        const isUsed = data.vehicule.some(v => v.categorieId === id);
        if (isUsed) {
            alert('Această categorie este utilizată de unul sau mai multe vehicule și nu poate fi ștearsă.');
            return;
        }
        if (window.confirm('Ești sigur că vrei să ștergi această categorie?')) {
            setData(prev => ({ ...prev, categorii: prev.categorii.filter(c => c.id !== id) }));
        }
    };

    const handleSave = (categorie: Categorie) => {
        if (categorieEditata) {
            setData(prev => ({ ...prev, categorii: prev.categorii.map(c => c.id === categorie.id ? categorie : c) }));
        } else {
            setData(prev => ({ ...prev, categorii: [...prev.categorii, { ...categorie, id: `cat${Date.now()}` }] }));
        }
        setModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-700">Gestiune Categorii</h2>
                <button onClick={handleAdauga} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <PlusCircleIcon className="w-5 h-5" /> Adaugă Categorie
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Nume Categorie</th>
                            <th className="px-6 py-3 text-right">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.categorii.map(c => (
                            <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{c.nume}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEditeaza(c)} className="text-blue-600 hover:text-blue-800 mr-4"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleSterge(c.id)} className="text-red-600 hover:text-red-800"><Trash2Icon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ModalCategorie isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} categorie={categorieEditata} />
        </div>
    );
};

// --- MODAL PENTRU ADĂUGARE/EDITARE CATEGORIE ---
const ModalCategorie: React.FC<{isOpen: boolean, onClose: () => void, onSave: (c: Categorie) => void, categorie: Categorie | null}> = ({ isOpen, onClose, onSave, categorie }) => {
    const [nume, setNume] = useState('');

    useEffect(() => {
        setNume(categorie?.nume || '');
    }, [categorie, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nume.trim()) {
            alert("Numele categoriei nu poate fi gol.");
            return;
        }
        onSave({ id: categorie?.id || '', nume });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={categorie ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={nume}
                    onChange={(e) => setNume(e.target.value)}
                    placeholder="Nume categorie (ex: Scuter)"
                    className="w-full p-2 border rounded"
                    required
                />
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Anulează</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Salvează</button>
                </div>
            </form>
        </Modal>
    );
};

// --- MODAL PENTRU ADĂUGARE/EDITARE MATERIAL ---
interface ModalMaterialProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mat: MaterialPrint | MaterialLaminare) => void;
    material: MaterialPrint | MaterialLaminare | null;
    type: 'print' | 'laminare' | null;
}

const ModalMaterial: React.FC<ModalMaterialProps> = ({ isOpen, onClose, onSave, material, type }) => {
    const defaultState = type === 'print' 
        ? { id: '', nume: '', tipCalcul: 'procentual', valoare: 0, permitePrintAlb: false } as MaterialPrint
        : { id: '', nume: '', tipCalcul: 'procentual', valoare: 0 } as MaterialLaminare;

    const [formData, setFormData] = useState<MaterialPrint | MaterialLaminare>(material || defaultState);

    useEffect(() => {
        setFormData(material || defaultState);
    }, [material, isOpen, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type: inputType } = e.target;
        if(inputType === 'checkbox') {
             setFormData(prev => ({...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({...prev, [name]: name === 'valoare' ? parseFloat(value) : value }));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nume || formData.valoare < 0) {
            alert("Te rugăm să completezi numele și o valoare validă.");
            return;
        }
        onSave(formData);
    }

    if (!type) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={material ? 'Editează Material' : 'Adaugă Material Nou'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="nume" value={formData.nume} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Nume material" required />
                <div className="flex items-center gap-2">
                    <select name="tipCalcul" value={formData.tipCalcul} onChange={handleChange} className="p-2 border rounded">
                        <option value="procentual">Procentual (%)</option>
                        <option value="suma_fixa">Sumă Fixă (RON)</option>
                    </select>
                    <input type="number" step="0.01" name="valoare" value={formData.valoare} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Valoare" required/>
                </div>
                {type === 'print' && (
                     <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="permitePrintAlb" checked={(formData as MaterialPrint).permitePrintAlb} onChange={handleChange} /> Permite Print cu Alb
                    </label>
                )}
                <div className="flex justify-end gap-3 pt-4">
                     <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Anulează</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Salvează</button>
                </div>
            </form>
        </Modal>
    )
}

// --- COMPONENTA TAB MATERIALE ---
const MaterialeTab: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }> = ({ data, setData }) => {
    
    type ModalState = {
        isOpen: boolean;
        type: 'print' | 'laminare' | null;
        material: MaterialPrint | MaterialLaminare | null;
    }
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null, material: null });

    const handleSaveMaterial = (material: MaterialPrint | MaterialLaminare) => {
        const listName = modalState.type === 'print' ? 'materialePrint' : 'materialeLaminare';
        
        setData(prev => {
            const list = prev[listName] as (MaterialPrint[] | MaterialLaminare[]);
            // Verificăm existența prin ID-ul din obiectul primit
            const exists = material.id && list.some(m => m.id === material.id);
            if (exists) {
                // Editare
                return {...prev, [listName]: list.map(m => m.id === material.id ? material : m)};
            } else {
                // Adăugare
                return {...prev, [listName]: [...list, {...material, id: `mat${Date.now()}`}]};
            }
        });
        setModalState({ isOpen: false, type: null, material: null });
    };

    const handleDeleteMaterial = (id: string, type: 'print' | 'laminare') => {
        if (window.confirm("Ești sigur că vrei să ștergi acest material?")) {
            const listName = type === 'print' ? 'materialePrint' : 'materialeLaminare';
            setData(prev => ({
                ...prev,
                [listName]: (prev[listName] as any[]).filter(m => m.id !== id)
            }));
        }
    }

    const handleOpenModal = (material: MaterialPrint | MaterialLaminare | null, type: 'print' | 'laminare') => {
        setModalState({ isOpen: true, type, material });
    }
    
    const handleSetariPrintAlbChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setData(prev => ({
            ...prev,
            setariPrintAlb: {
                ...prev.setariPrintAlb,
                [name]: name === 'valoare' ? parseFloat(value) : value
            }
        }))
    }
    
    return (
         <div className="space-y-8">
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-700">Materiale Print</h2>
                    <button onClick={() => handleOpenModal(null, 'print')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors text-sm">
                        <PlusCircleIcon className="w-4 h-4" /> Adaugă Material
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.materialePrint.map(m => 
                        <CardMaterial 
                            key={m.id} 
                            material={m} 
                            onEdit={() => handleOpenModal(m, 'print')}
                            onDelete={() => handleDeleteMaterial(m.id, 'print')} 
                        />
                    )}
                </div>
            </div>
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-700">Materiale Laminare</h2>
                    <button onClick={() => handleOpenModal(null, 'laminare')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors text-sm">
                        <PlusCircleIcon className="w-4 h-4" /> Adaugă Material
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.materialeLaminare.map(m => 
                        <CardMaterial 
                            key={m.id} 
                            material={m} 
                            onEdit={() => handleOpenModal(m, 'laminare')}
                            onDelete={() => handleDeleteMaterial(m.id, 'laminare')}
                        />
                    )}
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Setări Print cu Alb</h2>
                <div className="flex items-center gap-4">
                    <select name="tipCalcul" value={data.setariPrintAlb.tipCalcul} onChange={handleSetariPrintAlbChange} className="p-2 border rounded">
                        <option value="procentual">Procentual (%)</option>
                        <option value="suma_fixa">Sumă Fixă (RON)</option>
                    </select>
                    <input type="number" name="valoare" value={data.setariPrintAlb.valoare} onChange={handleSetariPrintAlbChange} className="w-40 p-2 border rounded"/>
                </div>
                 <p className="text-sm text-gray-500 mt-2">Acest cost se adaugă doar dacă opțiunea "Print cu Alb" este selectată în calculator.</p>
            </div>
            <ModalMaterial 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, type: null, material: null })}
                onSave={handleSaveMaterial}
                material={modalState.material}
                type={modalState.type}
            />
        </div>
    );
};

// --- CARD PENTRU MATERIALE ---
const CardMaterial: React.FC<{
    material: MaterialPrint | MaterialLaminare, 
    onEdit: () => void,
    onDelete: () => void
}> = ({ material, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md relative group">
            <h3 className="text-lg font-bold text-gray-800">{material.nume}</h3>
            <p className="text-gray-600">
                Cost: {material.valoare} {material.tipCalcul === 'procentual' ? '%' : 'RON'}
            </p>
             {'permitePrintAlb' in material && material.permitePrintAlb && (
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full mt-2 inline-block">Permite Print Alb</span>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 p-1">
                    <EditIcon className="w-5 h-5"/>
                </button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800 p-1">
                    <Trash2Icon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    )
}

// --- COMPONENTA TAB CALCULATOR ---
const CalculatorTab: React.FC<{ data: AppData }> = ({ data }) => {
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
    
    // Resetarea selectoarelor de materiale dacă lista se schimbă (ex. un material este șters)
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
        // Resetare și setare valori default la schimbarea vehiculului
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

        // 1. Preț vehicul (bazat pe acoperirea selectată) + opțiuni
        const pretBazaAcoperire = acoperire.pret;
        breakdown.push({ label: `Preț bază (${acoperire.nume})`, value: pretBazaAcoperire });
        
        const sumaOptiuni = vehicul.optiuniExtra
            .filter(opt => selectedOptiuni.includes(opt.id))
            .reduce((sum, opt) => sum + opt.pret, 0);
        if(sumaOptiuni > 0) breakdown.push({ label: 'Opțiuni extra selectate', value: sumaOptiuni });
        
        const pretVehicul = pretBazaAcoperire + sumaOptiuni;

        // 2. Cost material print
        const costPrint = materialPrint.tipCalcul === 'suma_fixa'
            ? materialPrint.valoare
            : pretVehicul * (materialPrint.valoare / 100);
        breakdown.push({ label: `Cost print (${materialPrint.nume})`, value: costPrint });
        
        // 3. Cost material laminare
        const costLaminare = materialLaminare.tipCalcul === 'suma_fixa'
            ? materialLaminare.valoare
            : pretVehicul * (materialLaminare.valoare / 100);
        breakdown.push({ label: `Cost laminare (${materialLaminare.nume})`, value: costLaminare });
        
        // 4. Cost print cu alb
        let costPrintAlb = 0;
        const setariExtra = data.setariPrintAlb;
        if (printCuAlb && materialPrint.permitePrintAlb) {
            costPrintAlb = setariExtra.tipCalcul === 'suma_fixa'
                ? setariExtra.valoare
                : (pretVehicul + costPrint) * (setariExtra.valoare / 100);
             breakdown.push({ label: 'Cost extra - Print cu Alb', value: costPrintAlb });
        }
        
        // 5. Total final
        const totalFinal = pretVehicul + costPrint + costLaminare + costPrintAlb;

        return { total: totalFinal, breakdown };

    }, [vehicul, acoperire, selectedOptiuni, materialPrint, materialLaminare, printCuAlb, data.setariPrintAlb]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
                 <h2 className="text-2xl font-bold text-gray-700 border-b pb-4">Calculator Ofertă</h2>
                
                {/* Pasul 1: Selectare Vehicul & Acoperire */}
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

                {/* Pasul 2: Opțiuni Extra */}
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
                
                 {/* Pasul 3: Materiale */}
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


// --- COMPONENTA TAB SETĂRI (NOU) ---
const SetariTab: React.FC<{
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  data: AppData;
}> = ({ setData, data }) => {

    const handleExport = () => {
        try {
            const dataString = JSON.stringify(data, null, 2); 
            const blob = new Blob([dataString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const dataCurenta = new Date().toISOString().split('T')[0];
            link.download = `backup-grafica-vehicule-${dataCurenta}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Eroare la export:", error);
            alert("A apărut o eroare la exportarea datelor.");
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Fișierul nu a putut fi citit.");
                }
                const importedData = JSON.parse(text);

                if (
                    !importedData.vehicule || 
                    !importedData.categorii || 
                    !importedData.materialePrint || 
                    !importedData.materialeLaminare ||
                    !importedData.setariPrintAlb
                ) {
                     throw new Error("Fișierul de import are un format invalid sau este corupt.");
                }
                
                if (window.confirm("Ești sigur că vrei să suprascrii toate datele curente cu cele din fișier? Această acțiune nu poate fi anulată.")) {
                    setData(importedData);
                    alert("Datele au fost importate cu succes!");
                }

            } catch (error) {
                 console.error("Eroare la import:", error);
                 const errorMessage = error instanceof Error ? error.message : "O eroare necunoscută a apărut.";
                 alert(`A apărut o eroare la importarea datelor: ${errorMessage}`);
            } finally {
                 if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Import & Export Date</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Exportă Date</h3>
                    <p className="text-gray-600 mb-4 flex-grow">Salvează întreaga bază de date (modele, materiale, categorii etc.) într-un singur fișier .json. Poți folosi acest fișier ca backup sau pentru a transfera datele pe un alt calculator.</p>
                    <button 
                        onClick={handleExport} 
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" /> Exportă Baza de Date
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                     <h3 className="text-xl font-semibold text-gray-800 mb-2">Importă Date</h3>
                     <p className="text-gray-600 mb-4 flex-grow">Încarcă o bază de date dintr-un fișier .json. <strong className="text-red-600">ATENȚIE:</strong> Această acțiune va suprascrie complet toate datele existente în aplicație.</p>
                     <label className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors cursor-pointer">
                        <UploadCloudIcon className="w-5 h-5" /> Încarcă Fișier de Backup
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                     </label>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTA PRINCIPALĂ APP ---
function App() {
    const [activeTab, setActiveTab] = useState<'modele' | 'categorii' | 'materiale' | 'calculator' | 'setari'>('calculator');
    const [data, setData] = useLocalStorage<AppData>('app-data-grafica', DATE_INITIALE);
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);
    
    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2Icon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Se încarcă datele din baza de date...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Eroare la încărcarea datelor</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Încearcă din nou
                    </button>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                        <p className="text-sm text-yellow-800">
                            <strong>Notă:</strong> Pentru ca aplicația să funcționeze cu baza de date Supabase, 
                            trebuie să adaugi cheia anonimă în fișierul .env:
                        </p>
                        <code className="block mt-2 text-xs bg-yellow-100 p-2 rounded">
                            VITE_SUPABASE_ANON_KEY=your_anon_key_here
                        </code>
                    </div>
                </div>
            </div>
        );
    }
    
    const TabButton: React.FC<{tabName: typeof activeTab, label: string, icon: React.ReactNode}> = ({tabName, label, icon}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tabName
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 flex-wrap gap-4">
                         <h1 className="text-2xl font-bold text-gray-800">
                           Grafică Vehicule & Ofertare
                         </h1>
                         <nav className="flex space-x-2 bg-gray-200 p-1 rounded-lg flex-wrap">
                           <TabButton tabName="calculator" label="Calculator" icon={<CalculatorIcon className="w-5 h-5"/>}/>
                           <TabButton tabName="modele" label="Modele" icon={<CarIcon className="w-5 h-5"/>}/>
                           <TabButton tabName="categorii" label="Categorii" icon={<TagIcon className="w-5 h-5"/>}/>
                           <TabButton tabName="materiale" label="Materiale" icon={<LayersIcon className="w-5 h-5"/>}/>
                           <TabButton tabName="setari" label="Setări" icon={<SettingsIcon className="w-5 h-5"/>}/>
                         </nav>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {activeTab === 'modele' && <ModeleTab data={data} setData={setData} />}
                {activeTab === 'categorii' && <CategoriiTab data={data} setData={setData} />}
                {activeTab === 'materiale' && <MaterialeTab data={data} setData={setData} />}
                {activeTab === 'calculator' && <CalculatorTab data={data} />}
                {activeTab === 'setari' && <SetariTab data={data} setData={setData} />} 
            </main>
        </div>
    );
}

export default App;

export default App
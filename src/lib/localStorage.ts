import type { AppData } from '../types';

const STORAGE_KEY = 'vehicle-graphics-data';

const defaultData: AppData = {
  vehicule: [
    {
      id: '1',
      producator: 'BMW',
      model: 'X5',
      categorieId: '1',
      perioadaFabricatie: '2019-2023',
      acoperiri: [
        {
          id: '1',
          nume: 'Acoperire Completă',
          pret: 2500,
          fisier: {
            nume: 'bmw-x5-full.jpg',
            dataUrl: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        },
        {
          id: '2',
          nume: 'Acoperire Parțială',
          pret: 1500,
          fisier: {
            nume: 'bmw-x5-partial.jpg',
            dataUrl: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        }
      ],
      optiuniExtra: [
        {
          id: '1',
          nume: 'Protecție UV',
          pret: 300
        },
        {
          id: '2',
          nume: 'Finisaj Mat',
          pret: 200
        }
      ]
    },
    {
      id: '2',
      producator: 'Mercedes',
      model: 'Sprinter',
      categorieId: '2',
      perioadaFabricatie: '2018-2023',
      acoperiri: [
        {
          id: '3',
          nume: 'Acoperire Laterală',
          pret: 1800,
          fisier: {
            nume: 'sprinter-side.jpg',
            dataUrl: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        }
      ],
      optiuniExtra: [
        {
          id: '3',
          nume: 'Reflectorizant',
          pret: 150
        }
      ]
    }
  ],
  categorii: [
    { id: '1', nume: 'SUV' },
    { id: '2', nume: 'Utilitare' },
    { id: '3', nume: 'Sedan' },
    { id: '4', nume: 'Hatchback' }
  ],
  materialePrint: [
    {
      id: '1',
      nume: 'Vinil Standard',
      tipCalcul: 'procentual',
      valoare: 15,
      permitePrintAlb: false
    },
    {
      id: '2',
      nume: 'Vinil Premium',
      tipCalcul: 'procentual',
      valoare: 25,
      permitePrintAlb: true
    },
    {
      id: '3',
      nume: 'Mesh Perforat',
      tipCalcul: 'suma_fixa',
      valoare: 45,
      permitePrintAlb: false
    }
  ],
  materialeLaminare: [
    {
      id: '1',
      nume: 'Laminare Mat',
      tipCalcul: 'procentual',
      valoare: 20
    },
    {
      id: '2',
      nume: 'Laminare Glossy',
      tipCalcul: 'procentual',
      valoare: 18
    },
    {
      id: '3',
      nume: 'Laminare Anti-Graffiti',
      tipCalcul: 'suma_fixa',
      valoare: 35
    }
  ],
  setariPrintAlb: {
    tipCalcul: 'procentual',
    valoare: 35
  }
};

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure all required properties exist
      return {
        vehicule: data.vehicule || defaultData.vehicule,
        categorii: data.categorii || defaultData.categorii,
        materialePrint: data.materialePrint || defaultData.materialePrint,
        materialeLaminare: data.materialeLaminare || defaultData.materialeLaminare,
        setariPrintAlb: data.setariPrintAlb || defaultData.setariPrintAlb
      };
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  return defaultData;
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}
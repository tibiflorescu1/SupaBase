export interface Fisier {
  nume: string;
  dataUrl: string;
}

export interface Categorie {
  id: string;
  nume: string;
}

export interface OptiuneExtra {
  id: string;
  nume: string;
  pret: number;
  fisier?: Fisier;
}

export interface Acoperire {
  id: string;
  nume: string;
  pret: number;
  fisier?: Fisier;
}

export interface Vehicul {
  id: string;
  producator: string;
  model: string;
  categorieId: string;
  perioadaFabricatie: string;
  acoperiri: Acoperire[];
  optiuniExtra: OptiuneExtra[];
}

export interface MaterialPrint {
  id: string;
  nume: string;
  tipCalcul: 'procentual' | 'suma_fixa';
  valoare: number;
  permitePrintAlb: boolean;
}

export interface MaterialLaminare {
  id: string;
  nume: string;
  tipCalcul: 'procentual' | 'suma_fixa';
  valoare: number;
}

export interface SetariPrintAlb {
  tipCalcul: 'procentual' | 'suma_fixa';
  valoare: number;
}

export interface AppData {
  vehicule: Vehicul[];
  categorii: Categorie[];
  materialePrint: MaterialPrint[];
  materialeLaminare: MaterialLaminare[];
  setariPrintAlb: SetariPrintAlb;
}
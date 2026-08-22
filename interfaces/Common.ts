// Los documentos de Firestore guardan texto localizado como un objeto por locale
// (por ahora sólo se usa/muestra "es_mx", ver README).
export interface LocalizedText {
	es_mx: string;
}

export interface LocalizedTextList {
	es_mx: string[];
}

// Nivel cualitativo usado para preferencias (luz, humedad, extracción de nutrientes).
export type Level = 'H' | 'M' | 'L';

export interface Range {
	min: number;
	max: number;
}

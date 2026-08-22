import type { Level, LocalizedText, LocalizedTextList, Range } from './Common';

export interface Stratum {
	_id: string;
	name: LocalizedText;
}

export interface EcologicalZone {
	_id: string;
	name: LocalizedText;
}

export interface EcologicalFunction {
	_id: string;
	name: LocalizedText;
}

export interface AdditionalFunction {
	_id: string;
	name: LocalizedText;
}

export interface SpeciesDetails {
	isFrostResistant?: boolean;
	lightPreference?: Level;
	nutrientExtraction?: Level;
	humidityPreference?: Level;
}

export interface SpeciesType {
	// Id del documento de Firestore (asignado en el adapter, no viene en `.data()`).
	_id: string;
	taxonomy: {
		genus: string;
		species: string;
	};
	commonNames: LocalizedTextList;
	ecologicalZones: {
		mx: EcologicalZone[];
	};
	stratums: Stratum[];
	height: Range;
	crownWidth: Range;
	ecologicalFunctions: EcologicalFunction[];
	additionalFunctions: AdditionalFunction[];
	details?: SpeciesDetails;
}

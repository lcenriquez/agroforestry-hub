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

export type GrowthHabit = 'clumping' | 'invasive'; // Agrupa (A) / Salta (S)

export interface SpeciesTaxonomy {
	genus: string;
	species: string;
	subspecies?: string;
	family?: string;
	synonyms?: string;
}

// Nutrimento principal (excel: columnas Calorías/Proteínas/Vitaminas/Minerales/
// Compuestos medicinales) — más granular que `SpeciesDetails`, viene de la
// carga masiva desde excel (ver docs/tasks/carga-masiva-especies-excel.md).
export interface SpeciesNutrientContent {
	calories?: boolean;
	proteins?: boolean;
	vitamins?: boolean;
	minerals?: boolean;
	medicinalCompounds?: boolean;
}

// Usos comestibles granulares (excel: columnas Raíces y tubérculos/Tallos o
// brotes/Hojas/Flores/Nueces y semillas/Fruto o frutas/Condimentos) — más
// finos que el catálogo `additionalFunctions`, no tienen un match 1:1 ahí.
export interface SpeciesEdibleUses {
	rootsAndTubers?: boolean;
	stemsOrShoots?: boolean;
	leaves?: boolean;
	flowers?: boolean;
	nutsAndSeeds?: boolean;
	fruit?: boolean;
	condiments?: boolean;
}

export interface SpeciesObservations {
	nurserySource?: string; // Dónde conseguirla (viveros)
	coverageDensity?: string; // Densidad de cobertura
	toleratesPruning?: boolean; // Soporta corte y rebrote
	accumulatedNutrients?: string; // Nutrientes que acumula
	isMelliferous?: boolean; // Melífera
	beneficialInsects?: string; // Insectos benéficos
	overallScore?: string; // Puntuación general
}

export interface SpeciesDetails {
	isFrostResistant?: boolean;
	lightPreference?: Level;
	nutrientExtraction?: Level;
	humidityPreference?: Level;
	lifeCycle?: string; // Ciclo de vida
	lifeCycleDuration?: string; // Ciclo vida meses/años
	heightRangeDescription?: string; // Rango de altura (texto libre, complementa `height`)
	shape?: string; // Forma
	growthHabit?: GrowthHabit;
	nutrientContent?: SpeciesNutrientContent;
	edibleUses?: SpeciesEdibleUses;
	observations?: SpeciesObservations;
}

export interface SpeciesType {
	// Id del documento de Firestore (asignado en el adapter, no viene en `.data()`).
	_id: string;
	taxonomy: SpeciesTaxonomy;
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

// Campos editables de una especie, sin el id del documento — la forma que
// llenan tanto el admin (edición directa) como cualquier usuario (sugerencia).
export type SpeciesInput = Omit<SpeciesType, '_id'>;

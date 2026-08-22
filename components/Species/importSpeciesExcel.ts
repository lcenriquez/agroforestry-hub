import ExcelJS from 'exceljs';

import { normalize, taxonomyKey } from '../../lib/text';

import type { Level } from '../../interfaces/Common';
import type {
	AdditionalFunction,
	EcologicalFunction,
	EcologicalZone,
	GrowthHabit,
	SpeciesEdibleUses,
	SpeciesInput,
	SpeciesNutrientContent,
	SpeciesObservations,
	Stratum
} from '../../interfaces/Species';
import type { SpeciesFormCatalogs } from './SpeciesForm';

export interface ImportWarning {
	row: number;
	field: string;
	value: string;
}

export interface ParsedSpeciesRow {
	row: number;
	input: SpeciesInput;
	warnings: ImportWarning[];
}

export interface ParsedSpeciesWorkbook {
	rows: ParsedSpeciesRow[];
	// Presente cuando el archivo no tiene el formato esperado (ej. sin pestaña
	// ESPECIES) y no se pudo parsear nada.
	fileError: string | null;
}

const SHEET_NAME = 'ESPECIES';
const FIRST_DATA_ROW = 4; // filas 1-3 son encabezado (título, categoría, columna).

// Índices de columna (1-indexed, igual que las letras de la hoja) — ver
// docs/tasks/carga-masiva-especies-excel.md para el detalle de cada una.
const COL = {
	id: 1,
	commonName: 2,
	genus: 3,
	species: 4,
	subspecies: 5,
	family: 6,
	synonyms: 7,
	zoneRainforest: 8,
	zoneLowlandForest: 9,
	zoneCloudForest: 10,
	zonePineOakForest: 11,
	zoneSemiDesert: 12,
	zoneDesert: 13,
	stratum: 14,
	lifeCycle: 16,
	lifeCycleDuration: 17,
	heightRangeText: 18,
	shape: 19,
	heightMeters: 20,
	crownWidthMeters: 21,
	growthHabit: 22,
	nutrientExtraction: 23,
	lightPreference: 24,
	humidityPreference: 25,
	frostTolerance: 26,
	fnBiomass: 27,
	fnNitrogenFixing: 28,
	fnNutrientAccumulator: 29,
	fnLivingCover: 30,
	fnFlowersBeneficialInsects: 31,
	nutCalories: 32,
	nutProteins: 33,
	nutVitamins: 34,
	nutMinerals: 35,
	nutMedicinalCompounds: 36,
	edibleRoots: 37,
	edibleStems: 38,
	edibleLeaves: 39,
	edibleFlowers: 40,
	edibleNuts: 41,
	edibleFruit: 42,
	edibleCondiments: 43,
	useMedicinal: 44,
	useForage: 45,
	useWood: 46,
	nurserySource: 49,
	coverageDensity: 50,
	toleratesPruning: 51,
	accumulatedNutrients: 52,
	isMelliferous: 53,
	beneficialInsects: 54,
	overallScore: 55
} as const;

const ZONE_COLUMNS = [
	{ col: COL.zoneRainforest, label: 'Selva húmeda' },
	{ col: COL.zoneLowlandForest, label: 'Selva baja' },
	{ col: COL.zoneCloudForest, label: 'Bosque de niebla' },
	{ col: COL.zonePineOakForest, label: 'Bosque de pino y encino' },
	{ col: COL.zoneSemiDesert, label: 'Semi-desierto' },
	{ col: COL.zoneDesert, label: 'Desierto' }
];

const ECO_FUNCTION_COLUMNS = [
	{ col: COL.fnBiomass, label: 'Producción biomasa' },
	{ col: COL.fnNitrogenFixing, label: 'Fija nitrógeno' },
	{ col: COL.fnNutrientAccumulator, label: 'Acumulador de nutrientes' },
	{ col: COL.fnLivingCover, label: 'Cobertura viva' },
	{ col: COL.fnFlowersBeneficialInsects, label: 'Flores' }
];

const ADD_FUNCTION_COLUMNS = [
	{ col: COL.useMedicinal, label: 'Medicinal' },
	{ col: COL.useForage, label: 'Forraje' },
	{ col: COL.useWood, label: 'Madera' }
];

function cellText(row: ExcelJS.Row, col: number): string {
	const value = row.getCell(col).value;
	if (value === null || value === undefined) return '';
	if (typeof value === 'object') {
		const obj = value as { text?: string; richText?: { text: string }[]; result?: unknown };
		if (obj.richText)
			return obj.richText
				.map(part => part.text)
				.join('')
				.trim();
		if (typeof obj.text === 'string') return obj.text.trim();
		if (obj.result !== undefined) return String(obj.result).trim();
		return '';
	}
	return String(value).trim();
}

function isBlank(text: string): boolean {
	return text === '' || text === '-';
}

function nonBlank(text: string): string | undefined {
	return isBlank(text) ? undefined : text;
}

// Las columnas booleanas del excel real no siempre usan "x": muchas veces
// traen una palabra describiendo el detalle (ej. "raíz", "Sí", "gallinas") en
// vez de una simple marca — eso también cuenta como "sí". Solo se toma como
// "no" una celda vacía/"-", o un "no"/"n" explícito.
function isMarked(text: string): boolean {
	if (isBlank(text)) return false;
	const value = normalize(text);
	return value !== 'no' && value !== 'n';
}

// "Altura (metros)"/"Ancho de copa (metros)" no siempre traen un número limpio:
// buena parte del excel real trae texto como "2 a 4", "hasta 15" o "3 mts." en
// vez de un solo valor. Se extraen los números que aparezcan: uno solo se usa
// como min y max; dos o más, los primeros dos como min/max. Sin números
// (ej. "Varios metros", "Indefinido"), el rango queda en {min:0, max:0}.
function parseNumberRange(text: string): { min: number; max: number } | undefined {
	const matches = text.match(/\d+(?:[.,]\d+)?/g);
	if (!matches || matches.length === 0) return undefined;
	const numbers = matches.map(match => Number(match.replace(',', '.')));
	return numbers.length === 1 ? { min: numbers[0], max: numbers[0] } : { min: numbers[0], max: numbers[1] };
}

// El excel real no siempre usa el código de una sola letra documentado en la
// pestaña Abreviaturas: hay celdas con varios códigos separados por coma (ej.
// "Sol, Ms") — se toma el primero — y con la palabra completa en vez del
// código (ej. "Sí"/"No" en vez de "S"/"N"). Códigos que no coinciden con nada
// conocido (ej. "C" en Agrupa o salta) se dejan sin mapear, sin advertencia:
// no son referencias a un catálogo, son enums cerrados que documentamos por
// código y para los que no vale la pena hacer un mismatch bloqueante.
function firstToken(text: string): string {
	return normalize(text).split(',')[0]?.trim() ?? '';
}

function levelFromNutrientExtraction(text: string): Level | undefined {
	const value = firstToken(text);
	if (value === 'a') return 'H';
	if (value === 'm') return 'M';
	if (value === 'b') return 'L';
	return undefined;
}

function levelFromLight(text: string): Level | undefined {
	const value = firstToken(text);
	if (value === 'sol') return 'H';
	if (value === 'ms') return 'M';
	if (value === 's' || value === 'ss') return 'L';
	return undefined;
}

function levelFromHumidity(text: string): Level | undefined {
	const value = firstToken(text);
	if (value === 'ha') return 'H';
	if (value === 'hm') return 'M';
	if (value === 's') return 'L';
	return undefined;
}

function frostResistanceFromCode(text: string): boolean | undefined {
	const value = firstToken(text);
	if (value === 's' || value === 'si' || value === 'sr' || value === 'sc') return true;
	if (value === 'n' || value === 'no') return false;
	return undefined;
}

function growthHabitFromCode(text: string): GrowthHabit | undefined {
	const value = normalize(text);
	if (value === 'a') return 'clumping';
	if (value === 's') return 'invasive';
	return undefined;
}

function findCatalogMatch<T extends { name: { es_mx: string } }>(label: string, options: T[]): T | undefined {
	const needle = normalize(label);
	if (!needle) return undefined;
	return (
		options.find(option => normalize(option.name.es_mx) === needle) ??
		options.find(option => normalize(option.name.es_mx).includes(needle) || needle.includes(normalize(option.name.es_mx)))
	);
}

// Quita del objeto las claves con valor `undefined`; si no queda ninguna,
// regresa `undefined` (para no guardar objetos vacíos en Firestore).
function pruneOrUndefined<T extends object>(obj: T): T | undefined {
	const pruned = {} as T;
	let hasValue = false;
	for (const key of Object.keys(obj) as (keyof T)[]) {
		if (obj[key] === undefined) continue;
		pruned[key] = obj[key];
		hasValue = true;
	}
	return hasValue ? pruned : undefined;
}

function mapRow(row: ExcelJS.Row, rowNumber: number, catalogs: SpeciesFormCatalogs): ParsedSpeciesRow {
	const warnings: ImportWarning[] = [];
	function warn(field: string, value: string) {
		warnings.push({ row: rowNumber, field, value });
	}

	function matchCatalogColumns<T extends { name: { es_mx: string } }>(
		columns: { col: number; label: string }[],
		options: T[],
		fieldLabel: string
	): T[] {
		const matches: T[] = [];
		for (const { col, label } of columns) {
			if (!isMarked(cellText(row, col))) continue;
			const match = findCatalogMatch(label, options);
			if (match) matches.push(match);
			else warn(fieldLabel, label);
		}
		return matches;
	}

	const zones = matchCatalogColumns<EcologicalZone>(ZONE_COLUMNS, catalogs.zones, 'Zona ecológica');
	const ecologicalFunctions = matchCatalogColumns<EcologicalFunction>(ECO_FUNCTION_COLUMNS, catalogs.ecoFunctions, 'Función ecológica');
	const additionalFunctions = matchCatalogColumns<AdditionalFunction>(ADD_FUNCTION_COLUMNS, catalogs.addFunctions, 'Otra función');

	// El estrato a veces trae más de un valor en la misma celda (ej. "medio / alto").
	const stratums: Stratum[] = [];
	const stratumText = cellText(row, COL.stratum);
	if (!isBlank(stratumText)) {
		const tokens = stratumText
			.split(/[/,]/)
			.map(token => token.trim())
			.filter(Boolean);
		for (const token of tokens) {
			const match = findCatalogMatch(token, catalogs.stratums);
			if (match) stratums.push(match);
			else warn('Estrato', token);
		}
	}

	const heightRange = parseNumberRange(cellText(row, COL.heightMeters));
	const crownWidthRange = parseNumberRange(cellText(row, COL.crownWidthMeters));

	const nutrientContent = pruneOrUndefined<SpeciesNutrientContent>({
		calories: isMarked(cellText(row, COL.nutCalories)) || undefined,
		proteins: isMarked(cellText(row, COL.nutProteins)) || undefined,
		vitamins: isMarked(cellText(row, COL.nutVitamins)) || undefined,
		minerals: isMarked(cellText(row, COL.nutMinerals)) || undefined,
		medicinalCompounds: isMarked(cellText(row, COL.nutMedicinalCompounds)) || undefined
	});

	const edibleUses = pruneOrUndefined<SpeciesEdibleUses>({
		rootsAndTubers: isMarked(cellText(row, COL.edibleRoots)) || undefined,
		stemsOrShoots: isMarked(cellText(row, COL.edibleStems)) || undefined,
		leaves: isMarked(cellText(row, COL.edibleLeaves)) || undefined,
		flowers: isMarked(cellText(row, COL.edibleFlowers)) || undefined,
		nutsAndSeeds: isMarked(cellText(row, COL.edibleNuts)) || undefined,
		fruit: isMarked(cellText(row, COL.edibleFruit)) || undefined,
		condiments: isMarked(cellText(row, COL.edibleCondiments)) || undefined
	});

	const observations = pruneOrUndefined<SpeciesObservations>({
		nurserySource: nonBlank(cellText(row, COL.nurserySource)),
		coverageDensity: nonBlank(cellText(row, COL.coverageDensity)),
		toleratesPruning: isMarked(cellText(row, COL.toleratesPruning)) || undefined,
		accumulatedNutrients: nonBlank(cellText(row, COL.accumulatedNutrients)),
		isMelliferous: isMarked(cellText(row, COL.isMelliferous)) || undefined,
		beneficialInsects: nonBlank(cellText(row, COL.beneficialInsects)),
		overallScore: nonBlank(cellText(row, COL.overallScore))
	});

	const details = pruneOrUndefined({
		isFrostResistant: frostResistanceFromCode(cellText(row, COL.frostTolerance)),
		lightPreference: levelFromLight(cellText(row, COL.lightPreference)),
		nutrientExtraction: levelFromNutrientExtraction(cellText(row, COL.nutrientExtraction)),
		humidityPreference: levelFromHumidity(cellText(row, COL.humidityPreference)),
		lifeCycle: nonBlank(cellText(row, COL.lifeCycle)),
		lifeCycleDuration: nonBlank(cellText(row, COL.lifeCycleDuration)),
		heightRangeDescription: nonBlank(cellText(row, COL.heightRangeText)),
		shape: nonBlank(cellText(row, COL.shape)),
		growthHabit: growthHabitFromCode(cellText(row, COL.growthHabit)),
		nutrientContent,
		edibleUses,
		observations
	});

	const genus = cellText(row, COL.genus);
	const species = cellText(row, COL.species);
	const commonName = cellText(row, COL.commonName);

	const input: SpeciesInput = {
		taxonomy: {
			genus,
			species,
			...pruneOrUndefined({
				subspecies: nonBlank(cellText(row, COL.subspecies)),
				family: nonBlank(cellText(row, COL.family)),
				synonyms: nonBlank(cellText(row, COL.synonyms))
			})
		},
		commonNames: { es_mx: commonName ? [commonName] : [] },
		ecologicalZones: { mx: zones },
		stratums,
		height: heightRange ?? { min: 0, max: 0 },
		crownWidth: crownWidthRange ?? { min: 0, max: 0 },
		ecologicalFunctions,
		additionalFunctions,
		...(details ? { details } : {})
	};

	return { row: rowNumber, input, warnings };
}

export async function parseSpeciesWorkbook(file: File, catalogs: SpeciesFormCatalogs): Promise<ParsedSpeciesWorkbook> {
	const buffer = await file.arrayBuffer();
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(buffer);

	const sheet = workbook.getWorksheet(SHEET_NAME);
	if (!sheet) return { rows: [], fileError: `El archivo no tiene una pestaña "${SHEET_NAME}".` };

	const rows: ParsedSpeciesRow[] = [];
	for (let rowNumber = FIRST_DATA_ROW; rowNumber <= sheet.rowCount; rowNumber++) {
		const row = sheet.getRow(rowNumber);
		if (isBlank(cellText(row, COL.id))) continue;
		rows.push(mapRow(row, rowNumber, catalogs));
	}

	return { rows, fileError: null };
}

export { taxonomyKey };

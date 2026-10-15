import { normalize } from '../../lib/text';
import { plantSpec } from './managedSize';
import { UNKNOWN_STRATUM_ID } from './strata';

import type { DesignPlant, DesignPlot } from '../../interfaces/Design';
import type { SpeciesType } from '../../interfaces/Species';
import type { PlantSpec, StratumInfo } from './strata';

// Funciones pure de análisis del diseño (sin React), para poder memoizarlas y probarlas.

export interface FunctionInfo {
	id: string; // `eco:<id>` o `add:<id>`
	name: string;
	group: 'ecological' | 'additional';
	sourceId: string;
	key: boolean; // función clave para un SAF (fijación de N, biomasa, alimento, polinizadores)
}

export interface StratumCoverage {
	stratum: StratumInfo;
	percent: number;
	plantCount: number;
}

export interface OverlapIssue {
	a: string;
	b: string;
	stratum: StratumInfo;
	fraction: number; // fracción de la copa más chica que queda encimada
}

export interface ShadeIssue {
	plantId: string;
	coveredBy: string;
}

export interface SpeciesCount {
	spec: PlantSpec;
	count: number;
}

export interface DesignAnalysis {
	plantCount: number;
	speciesCount: number;
	plotArea: number;
	density: number; // plantas por hectárea
	coverage: StratumCoverage[];
	totalCoverage: number;
	missingStrata: StratumInfo[];
	overlaps: OverlapIssue[];
	outside: string[];
	missingSpeciesPlants: string[];
	shade: ShadeIssue[];
	coveredFunctions: FunctionInfo[];
	missingFunctions: FunctionInfo[];
	speciesCounts: SpeciesCount[];
	sampleCell: number; // tamaño de celda usado para estimar la cobertura (m)
}

// Fracción mínima de encimamiento (respecto de la copa más chica) para avisar.
export const OVERLAP_THRESHOLD = 0.3;
// Celdas máximas del muestreo de cobertura (equilibrio precisión/velocidad).
const MAX_SAMPLES = 40000;

const KEY_FUNCTION_PATTERNS = ['nitrog', 'biomasa', 'aliment', 'poliniz'];

export function buildFunctionCatalog(species: SpeciesType[]): FunctionInfo[] {
	const map = new Map<string, FunctionInfo>();
	for (const sp of species) {
		for (const f of sp.ecologicalFunctions ?? []) {
			const id = `eco:${f._id}`;
			if (!map.has(id)) map.set(id, makeFunction(id, f._id, f.name?.es_mx, 'ecological'));
		}
		for (const f of sp.additionalFunctions ?? []) {
			const id = `add:${f._id}`;
			if (!map.has(id)) map.set(id, makeFunction(id, f._id, f.name?.es_mx, 'additional'));
		}
	}
	return [...map.values()].sort((a, b) => Number(b.key) - Number(a.key) || a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

function makeFunction(id: string, sourceId: string, name: string | undefined, group: FunctionInfo['group']): FunctionInfo {
	const label = name?.trim() || `Función ${sourceId}`;
	const text = normalize(label);
	return { id, name: label, group, sourceId, key: KEY_FUNCTION_PATTERNS.some(pattern => text.includes(pattern)) };
}

export function circleOverlapArea(r1: number, r2: number, d: number): number {
	if (r1 <= 0 || r2 <= 0 || d >= r1 + r2) return 0;
	if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
	const a1 = r1 * r1 * Math.acos(clamp((d * d + r1 * r1 - r2 * r2) / (2 * d * r1), -1, 1));
	const a2 = r2 * r2 * Math.acos(clamp((d * d + r2 * r2 - r1 * r1) / (2 * d * r2), -1, 1));
	const a3 = 0.5 * Math.sqrt(Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)));
	return a1 + a2 - a3;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function isOutside(plant: { x: number; y: number }, plot: DesignPlot): boolean {
	return plant.x < 0 || plant.y < 0 || plant.x > plot.width || plant.y > plot.length;
}

interface Placed {
	plant: DesignPlant;
	spec: PlantSpec; // con el tamaño con manejo de la planta, si lo tiene
	r: number;
}

// Cobertura de copa por estrato: se muestrea el terreno en una cuadrícula y se
// cuenta qué celdas caen dentro de al menos una copa (aproxima la unión de
// círculos, así las copas encimadas no cuentan doble).
function computeCoverage(placed: Placed[], plot: DesignPlot, strataIds: string[]) {
	const area = plot.width * plot.length;
	const cell = Math.max(0.05, Math.sqrt(area / MAX_SAMPLES));
	const nx = Math.max(1, Math.ceil(plot.width / cell));
	const ny = Math.max(1, Math.ceil(plot.length / cell));
	const cw = plot.width / nx;
	const ch = plot.length / ny;
	const total = nx * ny;

	const layers = new Map<string, Uint8Array>();
	const all = new Uint8Array(total);
	for (const id of strataIds) layers.set(id, new Uint8Array(total));

	for (const { plant, spec, r } of placed) {
		let layer = layers.get(spec.stratum._id);
		if (!layer) {
			layer = new Uint8Array(total);
			layers.set(spec.stratum._id, layer);
		}
		const i0 = Math.max(0, Math.floor((plant.x - r) / cw));
		const i1 = Math.min(nx - 1, Math.floor((plant.x + r) / cw));
		const j0 = Math.max(0, Math.floor((plant.y - r) / ch));
		const j1 = Math.min(ny - 1, Math.floor((plant.y + r) / ch));
		const r2 = r * r;
		for (let j = j0; j <= j1; j++) {
			const dy = (j + 0.5) * ch - plant.y;
			const dy2 = dy * dy;
			if (dy2 > r2) continue;
			const row = j * nx;
			for (let i = i0; i <= i1; i++) {
				const dx = (i + 0.5) * cw - plant.x;
				if (dx * dx + dy2 <= r2) {
					layer[row + i] = 1;
					all[row + i] = 1;
				}
			}
		}
	}

	const percentOf = (layer: Uint8Array) => {
		let count = 0;
		for (let k = 0; k < total; k++) count += layer[k];
		return (count / total) * 100;
	};

	const percents = new Map<string, number>();
	for (const [id, layer] of layers) percents.set(id, percentOf(layer));
	return { percents, total: percentOf(all), cell: Math.max(cw, ch) };
}

function findOverlaps(placed: Placed[]): OverlapIssue[] {
	const byStratum = new Map<string, Placed[]>();
	for (const item of placed) {
		if (item.spec.missing) continue;
		const list = byStratum.get(item.spec.stratum._id) ?? [];
		list.push(item);
		byStratum.set(item.spec.stratum._id, list);
	}

	const issues: OverlapIssue[] = [];
	for (const list of byStratum.values()) {
		list.sort((a, b) => a.plant.x - b.plant.x);
		const maxR = list.reduce((max, item) => Math.max(max, item.r), 0);
		for (let i = 0; i < list.length; i++) {
			const a = list[i];
			for (let j = i + 1; j < list.length; j++) {
				const b = list[j];
				if (b.plant.x - a.plant.x > a.r + maxR) break;
				const d = Math.hypot(a.plant.x - b.plant.x, a.plant.y - b.plant.y);
				if (d >= a.r + b.r) continue;
				const smaller = Math.min(a.r, b.r);
				const fraction = circleOverlapArea(a.r, b.r, d) / (Math.PI * smaller * smaller);
				if (fraction >= OVERLAP_THRESHOLD) issues.push({ a: a.plant.id, b: b.plant.id, stratum: a.spec.stratum, fraction });
			}
		}
	}
	return issues.sort((x, y) => y.fraction - x.fraction);
}

// Plantas que prefieren sol pleno con el centro bajo la copa de una planta
// claramente más alta (aviso orientativo: en sintropía, la sombra se maneja con poda).
function findShade(placed: Placed[]): ShadeIssue[] {
	const issues: ShadeIssue[] = [];
	const sunLovers = placed.filter(item => item.spec.lightPreference === 'H' && !item.spec.missing);
	if (!sunLovers.length) return issues;
	const tall = [...placed].filter(item => !item.spec.missing).sort((a, b) => b.spec.height - a.spec.height);
	for (const item of sunLovers) {
		for (const other of tall) {
			if (other.spec.height <= item.spec.height * 1.5) break;
			const d = Math.hypot(other.plant.x - item.plant.x, other.plant.y - item.plant.y);
			if (d < other.r * 0.8) {
				issues.push({ plantId: item.plant.id, coveredBy: other.plant.id });
				break;
			}
		}
	}
	return issues;
}

export function analyzeDesign(
	plot: DesignPlot,
	plants: DesignPlant[],
	specFor: (speciesId: string) => PlantSpec,
	strata: StratumInfo[],
	functionCatalog: FunctionInfo[]
): DesignAnalysis {
	const placed: Placed[] = plants.map(plant => {
		const spec = plantSpec(specFor(plant.speciesId), plant);
		return { plant, spec, r: spec.crown / 2 };
	});

	const coverageData = computeCoverage(
		placed.filter(item => !item.spec.missing),
		plot,
		strata.map(s => s._id)
	);

	const countsByStratum = new Map<string, number>();
	const countsBySpecies = new Map<string, SpeciesCount>();
	const usedFunctions = new Set<string>();
	const outside: string[] = [];
	const missingSpeciesPlants: string[] = [];
	let unknownStratum: StratumInfo | null = null;

	for (const { plant, spec } of placed) {
		if (spec.missing) missingSpeciesPlants.push(plant.id);
		else {
			countsByStratum.set(spec.stratum._id, (countsByStratum.get(spec.stratum._id) ?? 0) + 1);
			if (spec.stratum._id === UNKNOWN_STRATUM_ID) unknownStratum = spec.stratum;
			for (const id of spec.functionIds) usedFunctions.add(id);
		}
		if (isOutside(plant, plot)) outside.push(plant.id);
		const entry = countsBySpecies.get(plant.speciesId);
		if (entry) entry.count++;
		// El conteo por especie muestra los datos del catálogo, no los de una planta podada.
		else countsBySpecies.set(plant.speciesId, { spec: specFor(plant.speciesId), count: 1 });
	}

	const coverageStrata = unknownStratum ? [...strata, unknownStratum] : strata;
	const coverage = coverageStrata.map(stratum => ({
		stratum,
		percent: coverageData.percents.get(stratum._id) ?? 0,
		plantCount: countsByStratum.get(stratum._id) ?? 0
	}));

	const plotArea = plot.width * plot.length;
	const missingStrata = plants.length ? strata.filter(s => s.target !== null && !countsByStratum.get(s._id)) : [];

	return {
		plantCount: plants.length,
		speciesCount: [...countsBySpecies.values()].filter(entry => !entry.spec.missing).length,
		plotArea,
		density: plotArea > 0 ? (plants.length / plotArea) * 10000 : 0,
		coverage,
		totalCoverage: coverageData.total,
		missingStrata,
		overlaps: findOverlaps(placed),
		outside,
		missingSpeciesPlants,
		shade: findShade(placed),
		coveredFunctions: functionCatalog.filter(f => usedFunctions.has(f.id)),
		missingFunctions: functionCatalog.filter(f => !usedFunctions.has(f.id)),
		speciesCounts: [...countsBySpecies.values()].sort((a, b) => b.count - a.count || a.spec.name.localeCompare(b.spec.name)),
		sampleCell: coverageData.cell
	};
}

export interface Suggestion {
	reason: string;
	species: PlantSpec[];
}

// Especies del catálogo que llenarían un estrato vacío o una función clave
// faltante. Se priorizan las que cubren más funciones faltantes y tienen datos
// completos de altura y copa.
export function buildSuggestions(analysis: DesignAnalysis, catalog: PlantSpec[], perGroup = 3): Suggestion[] {
	if (!analysis.plantCount) return [];
	const missing = new Set(analysis.missingFunctions.map(f => f.id));
	const missingStrata = new Set(analysis.missingStrata.map(s => s._id));
	const used = new Set(analysis.speciesCounts.map(entry => entry.spec.speciesId));

	const score = (spec: PlantSpec) =>
		spec.functionIds.filter(id => missing.has(id)).length * 2 +
		(spec.heightMissing ? 0 : 1) +
		(spec.crownMissing ? 0 : 1) +
		(missingStrata.has(spec.stratum._id) ? 1 : 0);

	const ranked = catalog
		.filter(spec => !used.has(spec.speciesId))
		.map(spec => ({ spec, score: score(spec) }))
		.sort((a, b) => b.score - a.score || a.spec.name.localeCompare(b.spec.name));

	const suggestions: Suggestion[] = [];
	for (const stratum of analysis.missingStrata) {
		const species = ranked.filter(item => item.spec.stratum._id === stratum._id).slice(0, perGroup);
		if (species.length) suggestions.push({ reason: `Para el estrato ${stratum.name.toLowerCase()}`, species: species.map(item => item.spec) });
	}
	for (const fn of analysis.missingFunctions.filter(f => f.key)) {
		const species = ranked.filter(item => item.spec.functionIds.includes(fn.id)).slice(0, perGroup);
		if (species.length) suggestions.push({ reason: `Para ${fn.name.toLowerCase()}`, species: species.map(item => item.spec) });
	}
	return suggestions;
}

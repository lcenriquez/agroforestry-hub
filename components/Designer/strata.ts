import { normalize } from '../../lib/text';

import type { Range } from '../../interfaces/Common';
import type { SpeciesType, Stratum } from '../../interfaces/Species';

// Tipo de estrato según la agricultura sintrópica. Los `_id` de los estratos
// vienen de Firestore y no se asume su valor: el tipo se deduce del nombre
// (emergente/alto/medio/bajo) o, si el nombre no coincide, de la altura típica
// de las especies de ese estrato.
export type StratumKind = 'emergente' | 'alto' | 'medio' | 'bajo' | 'otro';

export const UNKNOWN_STRATUM_ID = '__sin_estrato__';

export interface StratumInfo {
	_id: string;
	name: string;
	kind: StratumKind;
	// Menor = más alto (0 = emergente). Sirve para ordenar de arriba a abajo.
	rank: number;
	color: string;
	// Cobertura de copa orientativa (% del terreno), sólo para los 4 estratos clásicos.
	target: number | null;
}

// Guía orientativa de la agricultura sintrópica: porcentaje de suelo que cubre
// cada estrato cuando el sistema está maduro. No son reglas fijas.
export const STRATUM_TARGETS: Record<Exclude<StratumKind, 'otro'>, number> = {
	emergente: 20,
	alto: 40,
	medio: 60,
	bajo: 80
};

const KIND_RANK: Record<StratumKind, number> = { emergente: 0, alto: 1, medio: 2, bajo: 3, otro: 4 };

// Colores con contraste suficiente sobre fondo claro y oscuro (se dibujan con opacidad).
const KIND_COLORS: Record<StratumKind, string> = {
	emergente: '#00796b',
	alto: '#388e3c',
	medio: '#9e9d24',
	bajo: '#ef6c00',
	otro: '#7b1fa2'
};
const EXTRA_COLORS = ['#7b1fa2', '#5d4037', '#3949ab', '#c2185b', '#0097a7'];
export const UNKNOWN_COLOR = '#90a4ae';
export const MISSING_SPECIES_COLOR = '#9e9e9e';

// Altura y copa de respaldo (metros) cuando la especie no tiene el dato.
const FALLBACK_SIZES: Record<StratumKind, { height: number; crown: number }> = {
	emergente: { height: 20, crown: 10 },
	alto: { height: 12, crown: 6 },
	medio: { height: 5, crown: 3 },
	bajo: { height: 1.2, crown: 1 },
	otro: { height: 3, crown: 2 }
};

function kindFromName(name: string): StratumKind | null {
	const text = normalize(name);
	if (text.includes('emergent')) return 'emergente';
	if (text.includes('alto') || text.includes('alta')) return 'alto';
	if (text.includes('medi')) return 'medio';
	if (text.includes('bajo') || text.includes('baja') || text.includes('rastrer')) return 'bajo';
	return null;
}

function kindFromHeight(height: number): StratumKind {
	if (height >= 18) return 'emergente';
	if (height >= 8) return 'alto';
	if (height >= 2.5) return 'medio';
	return 'bajo';
}

// Valor representativo de un rango: el promedio de min y max cuando ambos
// tienen dato (> 0); si sólo uno lo tiene, ese; si ninguno, null.
export function rangeValue(range: Range | undefined | null): number | null {
	const min = Number(range?.min);
	const max = Number(range?.max);
	const validMin = Number.isFinite(min) && min > 0;
	const validMax = Number.isFinite(max) && max > 0;
	if (validMin && validMax) return (min + max) / 2;
	if (validMax) return max;
	if (validMin) return min;
	return null;
}

export function formatRange(range: Range | undefined | null): string | null {
	const min = Number(range?.min);
	const max = Number(range?.max);
	const validMin = Number.isFinite(min) && min > 0;
	const validMax = Number.isFinite(max) && max > 0;
	if (validMin && validMax) return min === max ? formatMeters(min) : `${formatNumber(min)}–${formatNumber(max)} m`;
	if (validMax) return formatMeters(max);
	if (validMin) return formatMeters(min);
	return null;
}

export function formatNumber(value: number, digits = 2): string {
	return value.toLocaleString('es-MX', { maximumFractionDigits: digits });
}

export function formatMeters(value: number): string {
	return `${formatNumber(value)} m`;
}

// Construye la información de todos los estratos usados en el catálogo,
// ordenados de más alto a más bajo, con color y meta de cobertura.
export function buildStrata(species: SpeciesType[]): StratumInfo[] {
	const byId = new Map<string, Stratum>();
	const heights = new Map<string, number[]>();
	for (const sp of species) {
		const h = rangeValue(sp.height);
		for (const stratum of sp.stratums ?? []) {
			if (!byId.has(stratum._id)) byId.set(stratum._id, stratum);
			if (h !== null) {
				const list = heights.get(stratum._id) ?? [];
				list.push(h);
				heights.set(stratum._id, list);
			}
		}
	}

	const infos = [...byId.values()].map(stratum => {
		const name = stratum.name?.es_mx || `Estrato ${stratum._id}`;
		const named = kindFromName(name);
		const list = (heights.get(stratum._id) ?? []).sort((a, b) => a - b);
		const median = list.length ? list[Math.floor(list.length / 2)] : 3;
		const kind = named ?? 'otro';
		// Los estratos con nombre conocido van en su posición; los demás se
		// intercalan según la altura mediana de sus especies.
		const rank = named ? KIND_RANK[named] : KIND_RANK[kindFromHeight(median)] + 0.5;
		return { _id: stratum._id, name, kind, rank, median };
	});

	infos.sort((a, b) => a.rank - b.rank || b.median - a.median || a.name.localeCompare(b.name));

	const usedKinds = new Set<StratumKind>();
	let extra = 0;
	return infos.map(info => {
		let color: string;
		let target: number | null = null;
		if (info.kind !== 'otro' && !usedKinds.has(info.kind)) {
			usedKinds.add(info.kind);
			color = KIND_COLORS[info.kind];
			target = STRATUM_TARGETS[info.kind];
		} else {
			color = EXTRA_COLORS[extra++ % EXTRA_COLORS.length];
		}
		return { _id: info._id, name: info.name, kind: info.kind, rank: info.rank, color, target };
	});
}

export const UNKNOWN_STRATUM: StratumInfo = {
	_id: UNKNOWN_STRATUM_ID,
	name: 'Sin estrato',
	kind: 'otro',
	rank: 10,
	color: UNKNOWN_COLOR,
	target: null
};

// Datos derivados de una especie que usa el diseñador (dibujo y análisis).
export interface PlantSpec {
	speciesId: string;
	missing: boolean; // la especie ya no existe en el catálogo
	name: string; // nombre común corto
	scientificName: string;
	stratum: StratumInfo;
	allStrata: StratumInfo[];
	height: number; // metros (promedio del rango, o respaldo)
	crown: number; // diámetro de copa en metros (promedio del rango, o respaldo)
	heightMissing: boolean;
	crownMissing: boolean;
	heightLabel: string; // rango legible ("2–5 m" o "sin dato")
	crownLabel: string;
	functionIds: string[]; // `eco:<id>` y `add:<id>`
	lightPreference?: 'H' | 'M' | 'L';
}

export function scientificName(species: SpeciesType): string {
	return [species.taxonomy?.genus, species.taxonomy?.species].filter(Boolean).join(' ') || 'Especie sin nombre';
}

export function commonName(species: SpeciesType): string {
	const first = species.commonNames?.es_mx?.find(name => name && name.trim());
	return first?.trim() || scientificName(species);
}

export function buildPlantSpec(species: SpeciesType, strataById: Map<string, StratumInfo>): PlantSpec {
	const allStrata = (species.stratums ?? [])
		.map(s => strataById.get(s._id))
		.filter((s): s is StratumInfo => Boolean(s))
		.sort((a, b) => a.rank - b.rank);
	const heightValue = rangeValue(species.height);
	// Si la especie está en varios estratos, se usa el que mejor corresponde a
	// su altura; sin altura, el más alto de los que declara.
	let stratum = allStrata[0] ?? UNKNOWN_STRATUM;
	if (allStrata.length > 1 && heightValue !== null) {
		const kind = kindFromHeight(heightValue);
		stratum = allStrata.find(s => s.kind === kind) ?? stratum;
	}
	const fallback = FALLBACK_SIZES[stratum.kind];
	const crownValue = rangeValue(species.crownWidth);
	const ecological = (species.ecologicalFunctions ?? []).map(f => `eco:${f._id}`);
	const additional = (species.additionalFunctions ?? []).map(f => `add:${f._id}`);

	return {
		speciesId: species._id,
		missing: false,
		name: commonName(species),
		scientificName: scientificName(species),
		stratum,
		allStrata: allStrata.length ? allStrata : [UNKNOWN_STRATUM],
		height: heightValue ?? fallback.height,
		crown: crownValue ?? fallback.crown,
		heightMissing: heightValue === null,
		crownMissing: crownValue === null,
		heightLabel: formatRange(species.height) ?? 'sin dato',
		crownLabel: formatRange(species.crownWidth) ?? 'sin dato',
		functionIds: [...ecological, ...additional],
		lightPreference: species.details?.lightPreference
	};
}

// Especie que ya no está en el catálogo (borrada): se conserva la planta para
// no perder el diseño, pero se dibuja en gris y se avisa en el análisis.
// Se cachea por id para devolver siempre el mismo objeto (evita redibujos).
const missingSpecs = new Map<string, PlantSpec>();

export function missingPlantSpec(speciesId: string): PlantSpec {
	const cached = missingSpecs.get(speciesId);
	if (cached) return cached;
	const spec: PlantSpec = {
		speciesId,
		missing: true,
		name: 'Especie no disponible',
		scientificName: 'Ya no está en el catálogo',
		stratum: UNKNOWN_STRATUM,
		allStrata: [UNKNOWN_STRATUM],
		height: 2,
		crown: 1,
		heightMissing: true,
		crownMissing: true,
		heightLabel: 'sin dato',
		crownLabel: 'sin dato',
		functionIds: []
	};
	missingSpecs.set(speciesId, spec);
	return spec;
}

export function shortLabel(name: string, max = 14): string {
	return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

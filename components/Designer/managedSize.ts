import { formatMeters } from './strata';

import type { DesignPlant } from '../../interfaces/Design';
import type { PlantSpec } from './strata';

// Tamaño con manejo (poda): altura y copa con las que se mantiene una planta,
// en lugar de las de adulta sin podar del catálogo. En un SAF podado (p. ej.
// una línea de árboles a 1.5–2 m) las copas del catálogo inflan la cobertura y
// generan alertas falsas de encimamiento y sombra.

// Tope de altura o copa con manejo (m). El árbol más alto del mundo ronda 116 m.
export const MAX_MANAGED_SIZE = 100;
export const MIN_MANAGED_SIZE = 0.05;

export interface ManagedSize {
	height?: number;
	crown?: number;
}

// Valor válido (número > 0 y con tope) redondeado a cm, o undefined.
export function cleanManagedSize(value: unknown): number | undefined {
	const num = typeof value === 'string' && value.trim() ? Number(value) : value;
	if (typeof num !== 'number' || !Number.isFinite(num) || num < MIN_MANAGED_SIZE || num > MAX_MANAGED_SIZE) return undefined;
	return Math.round(num * 100) / 100;
}

// Campos de tamaño con manejo de una planta ya validados, para copiarlos a otra
// planta. Nunca deja claves con `undefined` (Firestore las rechaza dentro de
// las plantas: `stripUndefined` sólo limpia el primer nivel).
export function managedFields(source: { pruneHeight?: unknown; pruneCrown?: unknown }): Pick<DesignPlant, 'pruneHeight' | 'pruneCrown'> {
	const fields: Pick<DesignPlant, 'pruneHeight' | 'pruneCrown'> = {};
	const height = cleanManagedSize(source.pruneHeight);
	const crown = cleanManagedSize(source.pruneCrown);
	if (height !== undefined) fields.pruneHeight = height;
	if (crown !== undefined) fields.pruneCrown = crown;
	return fields;
}

// Planta con el tamaño con manejo cambiado. Sólo se tocan las claves presentes
// en `size` (`undefined` quita ese dato); las ausentes se conservan.
export function withManagedSize(plant: DesignPlant, size: ManagedSize): DesignPlant {
	const { pruneHeight, pruneCrown, ...rest } = plant;
	return {
		...rest,
		...managedFields({ pruneHeight: 'height' in size ? size.height : pruneHeight, pruneCrown: 'crown' in size ? size.crown : pruneCrown })
	};
}

export function hasManagedSize(plant: DesignPlant): boolean {
	return plant.pruneHeight !== undefined || plant.pruneCrown !== undefined;
}

// Datos con los que se dibuja y analiza una planta: los de su especie con la
// altura y la copa con manejo, si las tiene. Se cachea por especie y tamaño
// para devolver siempre el mismo objeto (evita redibujos).
const managedSpecs = new WeakMap<PlantSpec, Map<string, PlantSpec>>();

export function plantSpec(spec: PlantSpec, plant: DesignPlant): PlantSpec {
	const height = plant.pruneHeight;
	const crown = plant.pruneCrown;
	if (height === undefined && crown === undefined) return spec;
	let byKey = managedSpecs.get(spec);
	if (!byKey) {
		byKey = new Map();
		managedSpecs.set(spec, byKey);
	}
	const key = `${height ?? ''}|${crown ?? ''}`;
	const cached = byKey.get(key);
	if (cached) return cached;
	const managed: PlantSpec = {
		...spec,
		height: height ?? spec.height,
		crown: crown ?? spec.crown,
		heightMissing: height === undefined && spec.heightMissing,
		crownMissing: crown === undefined && spec.crownMissing,
		heightLabel: height === undefined ? spec.heightLabel : `${formatMeters(height)} con manejo`,
		crownLabel: crown === undefined ? spec.crownLabel : `${formatMeters(crown)} con manejo`,
		managed: true
	};
	byKey.set(key, managed);
	return managed;
}

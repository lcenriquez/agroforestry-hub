import { normalize } from '../../lib/text';

import type { SpeciesType } from '../../interfaces/Species';

export interface SpeciesFilterState {
	stratumIds: Set<string>;
	zoneIds: Set<string>;
	ecoFunctionIds: Set<string>;
	addFunctionIds: Set<string>;
}

export function emptyFilterState(): SpeciesFilterState {
	return { stratumIds: new Set(), zoneIds: new Set(), ecoFunctionIds: new Set(), addFunctionIds: new Set() };
}

export function hasActiveFilters(filters: SpeciesFilterState): boolean {
	return filters.stratumIds.size > 0 || filters.zoneIds.size > 0 || filters.ecoFunctionIds.size > 0 || filters.addFunctionIds.size > 0;
}

export function speciesMatchesSearch(species: SpeciesType, search: string): boolean {
	if (!search.trim()) return true;
	const needle = normalize(search);
	const haystack = normalize([species.taxonomy.genus, species.taxonomy.species, ...(species.commonNames.es_mx ?? [])].join(' '));
	return haystack.includes(needle);
}

export function speciesMatchesFilters(species: SpeciesType, filters: SpeciesFilterState): boolean {
	if (filters.stratumIds.size > 0 && !species.stratums.some(s => filters.stratumIds.has(s._id))) return false;
	if (filters.zoneIds.size > 0 && !species.ecologicalZones.mx.some(z => filters.zoneIds.has(z._id))) return false;
	if (filters.ecoFunctionIds.size > 0 && !species.ecologicalFunctions.some(f => filters.ecoFunctionIds.has(f._id))) return false;
	if (filters.addFunctionIds.size > 0 && !species.additionalFunctions.some(f => filters.addFunctionIds.has(f._id))) return false;
	return true;
}

export function filterSpeciesList(species: SpeciesType[], search: string, filters: SpeciesFilterState): SpeciesType[] {
	return species.filter(sp => speciesMatchesSearch(sp, search) && speciesMatchesFilters(sp, filters));
}

export function uniqueById<T extends { _id: string }>(items: T[]): T[] {
	const seen = new Map<string, T>();
	for (const item of items) if (!seen.has(item._id)) seen.set(item._id, item);
	return [...seen.values()].sort((a, b) => a._id.localeCompare(b._id));
}

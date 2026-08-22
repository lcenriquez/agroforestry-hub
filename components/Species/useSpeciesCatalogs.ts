import { useEffect, useState } from 'react';

import { getAdditionalFunctions, getEcologicalFunctions, getSpecies, getStratums } from '../../adapters/firestore';
import { uniqueById } from '../Tables/filterSpecies';

import type { SpeciesType } from '../../interfaces/Species';
import type { SpeciesFormCatalogs } from './SpeciesForm';

const emptyCatalogs: SpeciesFormCatalogs = { stratums: [], zones: [], ecoFunctions: [], addFunctions: [] };

interface SpeciesCatalogsState {
	catalogs: SpeciesFormCatalogs;
	species: SpeciesType[];
}

// Estrato, funciones ecológicas y otras funciones viven en colecciones propias
// de Firestore; las zonas ecológicas no (ver interfaces/Species.ts), así que
// se derivan de las especies ya cargadas, igual que en los filtros de la home.
// También expone la lista de especies ya cargadas (útil para hacer upsert por
// género+especie en la carga masiva).
export function useSpeciesCatalogs(enabled: boolean) {
	const [state, setState] = useState<SpeciesCatalogsState | null>(null);

	useEffect(() => {
		if (!enabled || state) return;

		let cancelled = false;
		Promise.all([getStratums(), getEcologicalFunctions(), getAdditionalFunctions(), getSpecies()]).then(
			([stratums, ecoFunctions, addFunctions, species]) => {
				if (cancelled) return;
				setState({ catalogs: { stratums, ecoFunctions, addFunctions, zones: uniqueById(species.flatMap(sp => sp.ecologicalZones.mx)) }, species });
			}
		);

		return () => {
			cancelled = true;
		};
	}, [enabled, state]);

	return { catalogs: state?.catalogs ?? emptyCatalogs, species: state?.species ?? [], loading: enabled && !state };
}

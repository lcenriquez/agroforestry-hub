import { useEffect, useState } from 'react';

import { getAdditionalFunctions, getEcologicalFunctions, getSpecies, getStratums } from '../../adapters/firestore';
import { uniqueById } from '../Tables/filterSpecies';

import type { SpeciesFormCatalogs } from './SpeciesForm';

const emptyCatalogs: SpeciesFormCatalogs = { stratums: [], zones: [], ecoFunctions: [], addFunctions: [] };

// Estrato, funciones ecológicas y otras funciones viven en colecciones propias
// de Firestore; las zonas ecológicas no (ver interfaces/Species.ts), así que
// se derivan de las especies ya cargadas, igual que en los filtros de la home.
export function useSpeciesCatalogs(enabled: boolean) {
	const [catalogs, setCatalogs] = useState<SpeciesFormCatalogs | null>(null);

	useEffect(() => {
		if (!enabled || catalogs) return;

		let cancelled = false;
		Promise.all([getStratums(), getEcologicalFunctions(), getAdditionalFunctions(), getSpecies()]).then(
			([stratums, ecoFunctions, addFunctions, species]) => {
				if (cancelled) return;
				setCatalogs({ stratums, ecoFunctions, addFunctions, zones: uniqueById(species.flatMap(sp => sp.ecologicalZones.mx)) });
			}
		);

		return () => {
			cancelled = true;
		};
	}, [enabled, catalogs]);

	return { catalogs: catalogs ?? emptyCatalogs, loading: enabled && !catalogs };
}

import { useEffect, useState } from 'react';

import { Button, Spinner, Stack, Text } from '@chakra-ui/react';

import { getSpecies } from '../adapters/firestore';
import DesignerWorkspace from '../components/Designer/DesignerWorkspace';
import { withPublicLayout } from '../hocs/withLayout';

import type { SpeciesType } from '../interfaces/Species';

// Diseñador de SAF: arma un sistema agroforestal sobre un terreno a escala,
// con vista en planta, vista de perfil y análisis de estratos/funciones en
// vivo. El catálogo se carga en el cliente; el espacio de trabajo se monta
// sólo después (nunca durante el prerender del export estático), por eso
// puede leer localStorage al inicializarse.
function Disenador() {
	const [species, setSpecies] = useState<SpeciesType[] | null>(null);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let cancelled = false;
		getSpecies().then(list => {
			if (!cancelled) setSpecies(list);
		});
		return () => {
			cancelled = true;
		};
	}, [attempt]);

	if (!species) {
		return (
			<Stack align="center" py={16} gap={3}>
				<Spinner size="lg" color="green.solid" />
				<Text color="fg.muted">Cargando el catálogo de especies…</Text>
			</Stack>
		);
	}

	if (species.length === 0) {
		return (
			<Stack align="center" py={16} gap={3}>
				<Text>No se pudo cargar el catálogo de especies.</Text>
				<Button
					size="sm"
					colorPalette="green"
					onClick={() => {
						setSpecies(null);
						setAttempt(value => value + 1);
					}}
				>
					Reintentar
				</Button>
			</Stack>
		);
	}

	return <DesignerWorkspace species={species} />;
}

export default withPublicLayout(Disenador, 'Diseñador de SAF', 'Diseña tu SAF');

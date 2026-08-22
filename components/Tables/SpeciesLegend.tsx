import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';

import { DETAIL_FIELD_LABELS, getAdditionalFunctionIcon, getDetailFieldIcon, getEcologicalFunctionIcon } from '../Helpers/VisualRepresentations';

import type { AdditionalFunction, EcologicalFunction, EcologicalZone, Stratum } from '../../interfaces/Species';

interface SpeciesLegendProps {
	stratums: Stratum[];
	zones: EcologicalZone[];
	ecoFunctions: EcologicalFunction[];
	addFunctions: AdditionalFunction[];
}

function LegendEntry({ icon, label }: { icon: React.ReactNode; label: string }) {
	return (
		<Box display="flex" alignItems="center" gap={2}>
			<Box flexShrink={0} display="inline-flex">
				{icon}
			</Box>
			<Text fontSize="sm">{label}</Text>
		</Box>
	);
}

// Explica los íconos de la tabla fuera del tooltip (que depende de hover y no
// funciona en pantallas táctiles), para que sigan siendo útiles en móvil.
export default function SpeciesLegend({ stratums, zones, ecoFunctions, addFunctions }: SpeciesLegendProps) {
	return (
		<Box borderWidth="1px" borderRadius="md" p={4} mb={4} display={{ base: 'none', md: 'block' }}>
			<Heading size="sm" mb={3}>
				¿Qué significan los íconos?
			</Heading>
			<SimpleGrid columns={{ base: 2, lg: 4 }} gap={2}>
				{stratums.map(s => (
					<LegendEntry key={s._id} icon={s._id} label={`Estrato ${s._id}: ${s.name.es_mx}`} />
				))}
				{zones.map(z => (
					<LegendEntry key={z._id} icon={z._id} label={`Zona ${z._id}: ${z.name.es_mx}`} />
				))}
				{ecoFunctions.map(f => (
					<LegendEntry key={f._id} icon={getEcologicalFunctionIcon(f._id)} label={f.name.es_mx} />
				))}
				{addFunctions.map(f => (
					<LegendEntry key={f._id} icon={getAdditionalFunctionIcon(f._id)} label={f.name.es_mx} />
				))}
				{Object.entries(DETAIL_FIELD_LABELS).map(([idKey, label]) => (
					<LegendEntry key={idKey} icon={getDetailFieldIcon(idKey)} label={label} />
				))}
			</SimpleGrid>
		</Box>
	);
}

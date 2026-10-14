import { Box, Heading, SimpleGrid, Stack, Text, Wrap } from '@chakra-ui/react';

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

function LegendSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Box>
			<Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="fg.muted" mb={1.5}>
				{title}
			</Text>
			{children}
		</Box>
	);
}

// Los estratos y zonas se muestran en la tabla como un número; aquí se agrupan
// en una sola línea por categoría para que el número no se confunda entre ambas.
function NumberedRow({ items }: { items: { id: number | string; label: string }[] }) {
	return (
		<Wrap gapX={4} gapY={1}>
			{items.map(item => (
				<Box key={item.id} display="flex" alignItems="baseline" gap={1.5}>
					<Text fontSize="sm" fontWeight="bold">
						{item.id}
					</Text>
					<Text fontSize="sm">{item.label}</Text>
				</Box>
			))}
		</Wrap>
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
			<Stack gap={4}>
				<SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
					<LegendSection title="Estratos">
						<NumberedRow items={stratums.map(s => ({ id: s._id, label: s.name.es_mx }))} />
					</LegendSection>
					<LegendSection title="Zonas ecológicas">
						<NumberedRow items={zones.map(z => ({ id: z._id, label: z.name.es_mx }))} />
					</LegendSection>
				</SimpleGrid>
				<LegendSection title="Funciones">
					<SimpleGrid columns={{ base: 2, lg: 4 }} gap={2}>
						{ecoFunctions.map(f => (
							<LegendEntry key={f._id} icon={getEcologicalFunctionIcon(f._id)} label={f.name.es_mx} />
						))}
						{addFunctions.map(f => (
							<LegendEntry key={f._id} icon={getAdditionalFunctionIcon(f._id)} label={f.name.es_mx} />
						))}
					</SimpleGrid>
				</LegendSection>
				<LegendSection title="Características">
					<SimpleGrid columns={{ base: 2, lg: 4 }} gap={2}>
						{Object.entries(DETAIL_FIELD_LABELS).map(([idKey, label]) => (
							<LegendEntry key={idKey} icon={getDetailFieldIcon(idKey)} label={label} />
						))}
					</SimpleGrid>
				</LegendSection>
			</Stack>
		</Box>
	);
}

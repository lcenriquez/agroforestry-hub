import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { CopyIcon, PlantIcon, TrashIcon } from '@phosphor-icons/react';

import { MeterInput } from './PlotSettings';
import { MissingDataBadge, StratumDot } from './SpeciesPalette';

import type { DesignPlant } from '../../interfaces/Design';
import type { PlantSpec } from './strata';

interface PlantInspectorProps {
	plant: DesignPlant;
	spec: PlantSpec;
	onMove: (x: number, y: number) => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onUseSpecies: () => void;
}

// Detalle de la planta seleccionada: datos de la especie, posición editable y acciones.
export default function PlantInspector({ plant, spec, onMove, onDuplicate, onDelete, onUseSpecies }: PlantInspectorProps) {
	return (
		<Box borderWidth="1px" borderRadius="md" p={3}>
			<Stack gap={3} direction={{ base: 'column', md: 'row' }} justify="space-between">
				<Stack gap={0.5} minW={0}>
					<HStack gap={2}>
						<StratumDot color={spec.stratum.color} />
						<Text fontWeight="semibold" truncate>
							{spec.name}
						</Text>
					</HStack>
					<Text fontSize="xs" fontStyle="italic" color="fg.muted">
						{spec.scientificName}
					</Text>
					<HStack fontSize="xs" gap={1} flexWrap="wrap">
						<Text>{spec.allStrata.map(s => s.name).join(' / ')}</Text>
						<Text>· alt {spec.heightLabel}</Text>
						<Text>· copa {spec.crownLabel}</Text>
						{(spec.heightMissing || spec.crownMissing) && <MissingDataBadge />}
					</HStack>
				</Stack>
				<SimpleGrid columns={2} gap={2} minW={{ md: '200px' }}>
					<MeterInput label="X (m)" value={plant.x} min={-1000} max={2000} step={0.5} onCommit={x => onMove(x, plant.y)} />
					<MeterInput label="Y (m)" value={plant.y} min={-1000} max={2000} step={0.5} onCommit={y => onMove(plant.x, y)} />
				</SimpleGrid>
			</Stack>
			<HStack gap={2} mt={3} flexWrap="wrap">
				<Button size="xs" variant="outline" onClick={onDuplicate} title="Duplicar (Ctrl+D)">
					<CopyIcon /> Duplicar
				</Button>
				<Button size="xs" variant="outline" colorPalette="red" onClick={onDelete} title="Eliminar (Supr)">
					<TrashIcon /> Eliminar
				</Button>
				{!spec.missing && (
					<Button size="xs" variant="ghost" onClick={onUseSpecies}>
						<PlantIcon /> Plantar más de esta especie
					</Button>
				)}
			</HStack>
		</Box>
	);
}

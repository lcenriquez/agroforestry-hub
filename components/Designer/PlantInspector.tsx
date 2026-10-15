import { useState } from 'react';

import { Box, Button, Field, HStack, Input, SimpleGrid, Stack, Switch, Text } from '@chakra-ui/react';
import { CopyIcon, PlantIcon, ScissorsIcon, TrashIcon } from '@phosphor-icons/react';

import { cleanManagedSize, hasManagedSize, MAX_MANAGED_SIZE } from './managedSize';
import { MeterInput } from './PlotSettings';
import { MissingDataBadge, StratumDot } from './SpeciesPalette';
import { formatNumber } from './strata';

import type { DesignPlant } from '../../interfaces/Design';
import type { ManagedSize } from './managedSize';
import type { PlantSpec } from './strata';

interface PlantInspectorProps {
	plant: DesignPlant;
	spec: PlantSpec;
	sameSpeciesCount: number;
	onMove: (x: number, y: number) => void;
	onManagedSize: (size: ManagedSize, allOfSpecies: boolean) => void;
	onDuplicate: () => void;
	onDelete: () => void;
	onUseSpecies: () => void;
}

// Campo opcional en metros: vacío = sin dato. Avisa (onCommit) al salir del
// campo o con Enter; un valor inválido vuelve al anterior.
function OptionalMeterInput({
	label,
	value,
	placeholder,
	onCommit
}: {
	label: string;
	value: number | undefined;
	placeholder: string;
	onCommit: (value: number | undefined) => void;
}) {
	const [text, setText] = useState(value === undefined ? '' : String(value));
	const [previous, setPrevious] = useState(value);
	if (previous !== value) {
		setPrevious(value);
		setText(value === undefined ? '' : String(value));
	}
	const parsed = text.trim() ? cleanManagedSize(text.replace(',', '.')) : undefined;
	const invalid = Boolean(text.trim()) && parsed === undefined;

	const commit = () => {
		if (invalid) {
			setText(value === undefined ? '' : String(value));
			return;
		}
		if (parsed !== value) onCommit(parsed);
	};

	return (
		<Field.Root invalid={invalid}>
			<Field.Label fontSize="xs">{label}</Field.Label>
			<Input
				size="sm"
				inputMode="decimal"
				value={text}
				placeholder={placeholder}
				onChange={event => setText(event.target.value)}
				onBlur={commit}
				onKeyDown={event => {
					if (event.key === 'Enter') commit();
				}}
			/>
			{invalid && <Field.ErrorText fontSize="2xs">Entre 0.05 y {MAX_MANAGED_SIZE} m</Field.ErrorText>}
		</Field.Root>
	);
}

// Detalle de la planta seleccionada: datos de la especie, posición y tamaño con
// manejo editables, y acciones.
export default function PlantInspector({
	plant,
	spec,
	sameSpeciesCount,
	onMove,
	onManagedSize,
	onDuplicate,
	onDelete,
	onUseSpecies
}: PlantInspectorProps) {
	const [allOfSpecies, setAllOfSpecies] = useState(false);
	const applyToAll = allOfSpecies && sameSpeciesCount > 1;

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
			<Stack gap={2} mt={3} pt={3} borderTopWidth="1px">
				<HStack gap={1}>
					<ScissorsIcon />
					<Text fontSize="sm" fontWeight="semibold">
						Tamaño con manejo (poda)
					</Text>
				</HStack>
				<Text fontSize="xs" color="fg.muted">
					Si la planta se mantiene podada, indica su altura y copa: el plano, el perfil y el análisis las usan en lugar de las de adulta sin podar.
					Vacío = tamaño del catálogo.
				</Text>
				<SimpleGrid columns={2} gap={2} maxW={{ md: '320px' }}>
					<OptionalMeterInput
						label="Altura (m)"
						value={plant.pruneHeight}
						placeholder={formatNumber(spec.height, 1)}
						onCommit={height => onManagedSize({ height }, applyToAll)}
					/>
					<OptionalMeterInput
						label="Copa (m)"
						value={plant.pruneCrown}
						placeholder={formatNumber(spec.crown, 1)}
						onCommit={crown => onManagedSize({ crown }, applyToAll)}
					/>
				</SimpleGrid>
				<HStack gap={3} flexWrap="wrap">
					{sameSpeciesCount > 1 && (
						<Switch.Root size="sm" checked={allOfSpecies} onCheckedChange={event => setAllOfSpecies(event.checked)} colorPalette="green">
							<Switch.HiddenInput />
							<Switch.Control />
							<Switch.Label fontSize="xs">Aplicar a las {sameSpeciesCount} plantas de esta especie</Switch.Label>
						</Switch.Root>
					)}
					{applyToAll && (
						<Button
							size="2xs"
							variant="outline"
							onClick={() => onManagedSize({ height: plant.pruneHeight, crown: plant.pruneCrown }, true)}
							title="Copia la altura y copa con manejo de esta planta a todas las de su especie"
						>
							Igualar todas a esta
						</Button>
					)}
					{hasManagedSize(plant) && (
						<Button size="2xs" variant="ghost" onClick={() => onManagedSize({ height: undefined, crown: undefined }, applyToAll)}>
							Quitar manejo{applyToAll ? ' a todas' : ''}
						</Button>
					)}
				</HStack>
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

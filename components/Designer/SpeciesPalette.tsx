import { memo, useDeferredValue, useMemo, useState } from 'react';

import { Badge, Box, Button, HStack, Input, InputGroup, Stack, Text, Wrap } from '@chakra-ui/react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import { speciesMatchesSearch } from '../Tables/filterSpecies';

import type { SpeciesType } from '../../interfaces/Species';
import type { PlantSpec, StratumInfo } from './strata';

const MAX_RESULTS = 80;

export function StratumDot({ color, size = '10px' }: { color: string; size?: string }) {
	return (
		<Box
			as="span"
			display="inline-block"
			flexShrink={0}
			w={size}
			h={size}
			borderRadius="full"
			bg={color}
			borderWidth="1px"
			borderColor="blackAlpha.300"
		/>
	);
}

export function MissingDataBadge() {
	return (
		<Badge size="xs" colorPalette="orange" variant="subtle">
			sin dato
		</Badge>
	);
}

const SpeciesItem = memo(function SpeciesItem({ spec, active, onPick }: { spec: PlantSpec; active: boolean; onPick: (id: string) => void }) {
	return (
		<Box
			as="button"
			textAlign="left"
			w="100%"
			px={2}
			py={1.5}
			borderRadius="md"
			borderWidth="1px"
			borderColor={active ? 'green.solid' : 'transparent'}
			bg={active ? 'green.subtle' : undefined}
			_hover={{ bg: active ? 'green.subtle' : 'bg.muted' }}
			onClick={() => onPick(spec.speciesId)}
			aria-pressed={active}
		>
			<HStack gap={2} align="start">
				<Box pt="5px">
					<StratumDot color={spec.stratum.color} />
				</Box>
				<Stack gap={0} minW={0} flex={1}>
					<Text fontSize="sm" fontWeight="medium" truncate>
						{spec.name}
					</Text>
					<Text fontSize="xs" fontStyle="italic" color="fg.muted" truncate>
						{spec.scientificName}
					</Text>
					<HStack gap={1} fontSize="xs" color="fg.muted" flexWrap="wrap">
						<Text>{spec.stratum.name}</Text>
						<Text>· alt {spec.heightLabel}</Text>
						<Text>· copa {spec.crownLabel}</Text>
						{(spec.heightMissing || spec.crownMissing) && <MissingDataBadge />}
					</HStack>
				</Stack>
			</HStack>
		</Box>
	);
});

interface SpeciesPaletteProps {
	species: SpeciesType[];
	specs: Map<string, PlantSpec>;
	strata: StratumInfo[];
	activeSpeciesId: string | null;
	onPick: (speciesId: string) => void;
}

function SpeciesPalette({ species, specs, strata, activeSpeciesId, onPick }: SpeciesPaletteProps) {
	const [search, setSearch] = useState('');
	const [stratumId, setStratumId] = useState<string | null>(null);
	const deferredSearch = useDeferredValue(search);

	const results = useMemo(() => {
		const list: PlantSpec[] = [];
		for (const sp of species) {
			const spec = specs.get(sp._id);
			if (!spec) continue;
			if (stratumId && !spec.allStrata.some(s => s._id === stratumId)) continue;
			if (!speciesMatchesSearch(sp, deferredSearch)) continue;
			list.push(spec);
		}
		return list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
	}, [species, specs, stratumId, deferredSearch]);

	const active = activeSpeciesId ? specs.get(activeSpeciesId) : undefined;

	return (
		<Stack gap={3}>
			<InputGroup startElement={<MagnifyingGlassIcon />}>
				<Input
					size="sm"
					placeholder="Buscar especie..."
					value={search}
					onChange={event => setSearch(event.target.value)}
					aria-label="Buscar especie"
				/>
			</InputGroup>
			<Wrap gap={1}>
				<Button size="2xs" variant={stratumId === null ? 'solid' : 'outline'} colorPalette="green" onClick={() => setStratumId(null)}>
					Todos
				</Button>
				{strata.map(stratum => (
					<Button
						key={stratum._id}
						size="2xs"
						variant={stratumId === stratum._id ? 'solid' : 'outline'}
						colorPalette="green"
						onClick={() => setStratumId(stratumId === stratum._id ? null : stratum._id)}
					>
						<StratumDot color={stratum.color} size="8px" />
						{stratum.name}
					</Button>
				))}
			</Wrap>

			{active && (
				<Box borderWidth="1px" borderColor="green.solid" borderRadius="md" p={2} bg="green.subtle">
					<Text fontSize="xs" color="fg.muted">
						Especie seleccionada
					</Text>
					<Text fontSize="sm" fontWeight="semibold">
						{active.name}
					</Text>
					<Text fontSize="xs">
						{active.stratum.name} · alt {active.heightLabel} · copa {active.crownLabel}
					</Text>
					{(active.heightMissing || active.crownMissing) && (
						<Text fontSize="xs" color="orange.fg" mt={1}>
							Sin dato de {[active.heightMissing && 'altura', active.crownMissing && 'copa'].filter(Boolean).join(' ni de ')}: se usa un tamaño típico
							de su estrato (borde punteado).
						</Text>
					)}
				</Box>
			)}

			<Stack gap={0.5} maxH={{ base: '50vh', lg: '420px' }} overflowY="auto" pr={1}>
				{results.slice(0, MAX_RESULTS).map(spec => (
					<SpeciesItem key={spec.speciesId} spec={spec} active={spec.speciesId === activeSpeciesId} onPick={onPick} />
				))}
				{results.length === 0 && (
					<Text fontSize="sm" color="fg.muted" p={2}>
						No hay especies que coincidan.
					</Text>
				)}
			</Stack>
			{results.length > MAX_RESULTS && (
				<Text fontSize="xs" color="fg.muted">
					Mostrando {MAX_RESULTS} de {results.length}. Escribe para afinar la búsqueda.
				</Text>
			)}
		</Stack>
	);
}

// Memoizado: el diseñador se re-renderiza en cada cuadro de un arrastre.
export default memo(SpeciesPalette);

import { Box, Button, Input, InputGroup, Stack, Text, Wrap } from '@chakra-ui/react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

import { hasActiveFilters } from './filterSpecies';

import type { AdditionalFunction, EcologicalFunction, EcologicalZone, Stratum } from '../../interfaces/Species';
import type { SpeciesFilterState } from './filterSpecies';

interface SpeciesFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	filters: SpeciesFilterState;
	onFiltersChange: (filters: SpeciesFilterState) => void;
	stratums: Stratum[];
	zones: EcologicalZone[];
	ecoFunctions: EcologicalFunction[];
	addFunctions: AdditionalFunction[];
}

function toggleId(ids: Set<string>, id: string): Set<string> {
	const next = new Set(ids);
	if (next.has(id)) next.delete(id);
	else next.add(id);
	return next;
}

function FilterGroup({
	label,
	options,
	selected,
	onToggle
}: {
	label: string;
	options: { _id: string; name: { es_mx: string } }[];
	selected: Set<string>;
	onToggle: (id: string) => void;
}) {
	if (options.length === 0) return null;

	return (
		<Box>
			<Text fontSize="sm" fontWeight="medium" mb={1}>
				{label}
			</Text>
			<Wrap gap={2}>
				{options.map(option => (
					<Button
						key={option._id}
						size="xs"
						variant={selected.has(option._id) ? 'solid' : 'outline'}
						colorPalette="green"
						onClick={() => onToggle(option._id)}
					>
						{option.name.es_mx}
					</Button>
				))}
			</Wrap>
		</Box>
	);
}

export default function SpeciesFilters({
	search,
	onSearchChange,
	filters,
	onFiltersChange,
	stratums,
	zones,
	ecoFunctions,
	addFunctions
}: SpeciesFiltersProps) {
	return (
		<Stack gap={4} mb={4}>
			<InputGroup startElement={<MagnifyingGlass />}>
				<Input placeholder="Buscar por nombre científico o común..." value={search} onChange={e => onSearchChange(e.target.value)} />
			</InputGroup>

			<Stack gap={3}>
				<FilterGroup
					label="Estrato"
					options={stratums}
					selected={filters.stratumIds}
					onToggle={id => onFiltersChange({ ...filters, stratumIds: toggleId(filters.stratumIds, id) })}
				/>
				<FilterGroup
					label="Zona ecológica"
					options={zones}
					selected={filters.zoneIds}
					onToggle={id => onFiltersChange({ ...filters, zoneIds: toggleId(filters.zoneIds, id) })}
				/>
				<FilterGroup
					label="Funciones ecológicas"
					options={ecoFunctions}
					selected={filters.ecoFunctionIds}
					onToggle={id => onFiltersChange({ ...filters, ecoFunctionIds: toggleId(filters.ecoFunctionIds, id) })}
				/>
				<FilterGroup
					label="Otras funciones"
					options={addFunctions}
					selected={filters.addFunctionIds}
					onToggle={id => onFiltersChange({ ...filters, addFunctionIds: toggleId(filters.addFunctionIds, id) })}
				/>
			</Stack>

			{(search || hasActiveFilters(filters)) && (
				<Button
					size="xs"
					variant="ghost"
					alignSelf="start"
					onClick={() => {
						onSearchChange('');
						onFiltersChange({ stratumIds: new Set(), zoneIds: new Set(), ecoFunctionIds: new Set(), addFunctionIds: new Set() });
					}}
				>
					<X /> Limpiar filtros
				</Button>
			)}
		</Stack>
	);
}

import { useState } from 'react';

import { Alert, Box, Button, Checkbox, Field, Heading, Input, NativeSelect, Stack, Text, Wrap } from '@chakra-ui/react';

import type { Level } from '../../interfaces/Common';
import type { AdditionalFunction, EcologicalFunction, EcologicalZone, SpeciesInput, Stratum } from '../../interfaces/Species';

export interface SpeciesFormCatalogs {
	stratums: Stratum[];
	zones: EcologicalZone[];
	ecoFunctions: EcologicalFunction[];
	addFunctions: AdditionalFunction[];
}

interface SpeciesFormProps {
	initialValue?: SpeciesInput;
	catalogs: SpeciesFormCatalogs;
	onSubmit: (data: SpeciesInput) => Promise<void>;
	submitLabel: string;
}

type LevelField = Level | '';

interface FormState {
	genus: string;
	species: string;
	commonNames: string;
	heightMin: string;
	heightMax: string;
	crownWidthMin: string;
	crownWidthMax: string;
	stratumIds: Set<string>;
	zoneIds: Set<string>;
	ecoFunctionIds: Set<string>;
	addFunctionIds: Set<string>;
	isFrostResistant: boolean;
	lightPreference: LevelField;
	humidityPreference: LevelField;
	nutrientExtraction: LevelField;
}

function toId<T extends { _id: string }>(items: T[]): Set<string> {
	return new Set(items.map(item => item._id));
}

function initialState(value?: SpeciesInput): FormState {
	return {
		genus: value?.taxonomy.genus ?? '',
		species: value?.taxonomy.species ?? '',
		commonNames: value?.commonNames.es_mx.join(', ') ?? '',
		heightMin: value ? String(value.height.min) : '',
		heightMax: value ? String(value.height.max) : '',
		crownWidthMin: value ? String(value.crownWidth.min) : '',
		crownWidthMax: value ? String(value.crownWidth.max) : '',
		stratumIds: toId(value?.stratums ?? []),
		zoneIds: toId(value?.ecologicalZones.mx ?? []),
		ecoFunctionIds: toId(value?.ecologicalFunctions ?? []),
		addFunctionIds: toId(value?.additionalFunctions ?? []),
		isFrostResistant: value?.details?.isFrostResistant ?? false,
		lightPreference: value?.details?.lightPreference ?? '',
		humidityPreference: value?.details?.humidityPreference ?? '',
		nutrientExtraction: value?.details?.nutrientExtraction ?? ''
	};
}

function buildOutput(state: FormState, catalogs: SpeciesFormCatalogs): SpeciesInput {
	const details = {
		...(state.isFrostResistant ? { isFrostResistant: true } : {}),
		...(state.lightPreference ? { lightPreference: state.lightPreference } : {}),
		...(state.humidityPreference ? { humidityPreference: state.humidityPreference } : {}),
		...(state.nutrientExtraction ? { nutrientExtraction: state.nutrientExtraction } : {})
	};

	return {
		taxonomy: { genus: state.genus.trim(), species: state.species.trim() },
		commonNames: {
			es_mx: state.commonNames
				.split(',')
				.map(name => name.trim())
				.filter(Boolean)
		},
		ecologicalZones: { mx: catalogs.zones.filter(zone => state.zoneIds.has(zone._id)) },
		stratums: catalogs.stratums.filter(stratum => state.stratumIds.has(stratum._id)),
		height: { min: Number(state.heightMin) || 0, max: Number(state.heightMax) || 0 },
		crownWidth: { min: Number(state.crownWidthMin) || 0, max: Number(state.crownWidthMax) || 0 },
		ecologicalFunctions: catalogs.ecoFunctions.filter(fn => state.ecoFunctionIds.has(fn._id)),
		additionalFunctions: catalogs.addFunctions.filter(fn => state.addFunctionIds.has(fn._id)),
		...(Object.keys(details).length > 0 ? { details } : {})
	};
}

function CheckboxGroup({
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
		<Field.Root>
			<Field.Label>{label}</Field.Label>
			<Wrap gap={3}>
				{options.map(option => (
					<Checkbox.Root key={option._id} checked={selected.has(option._id)} onCheckedChange={() => onToggle(option._id)}>
						<Checkbox.HiddenInput />
						<Checkbox.Control>
							<Checkbox.Indicator />
						</Checkbox.Control>
						<Checkbox.Label>{option.name.es_mx}</Checkbox.Label>
					</Checkbox.Root>
				))}
			</Wrap>
		</Field.Root>
	);
}

function toggleId(ids: Set<string>, id: string): Set<string> {
	const next = new Set(ids);
	if (next.has(id)) next.delete(id);
	else next.add(id);
	return next;
}

function LevelSelect({ label, value, onChange }: { label: string; value: LevelField; onChange: (value: LevelField) => void }) {
	return (
		<Field.Root>
			<Field.Label>{label}</Field.Label>
			<NativeSelect.Root>
				<NativeSelect.Field value={value} onChange={event => onChange(event.target.value as LevelField)}>
					<option value="">Sin especificar</option>
					<option value="H">Alta</option>
					<option value="M">Media</option>
					<option value="L">Baja</option>
				</NativeSelect.Field>
				<NativeSelect.Indicator />
			</NativeSelect.Root>
		</Field.Root>
	);
}

export default function SpeciesForm({ initialValue, catalogs, onSubmit, submitLabel }: SpeciesFormProps) {
	const [state, setState] = useState<FormState>(() => initialState(initialValue));
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function update<K extends keyof FormState>(key: K, value: FormState[K]) {
		setState(current => ({ ...current, [key]: value }));
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await onSubmit(buildOutput(state, catalogs));
		} catch {
			setError('No se pudo guardar, intenta de nuevo');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<Stack gap={5}>
				<Stack gap={4} direction={{ base: 'column', md: 'row' }}>
					<Field.Root required>
						<Field.Label>Género</Field.Label>
						<Input value={state.genus} onChange={event => update('genus', event.target.value)} required />
					</Field.Root>
					<Field.Root required>
						<Field.Label>Especie</Field.Label>
						<Input value={state.species} onChange={event => update('species', event.target.value)} required />
					</Field.Root>
				</Stack>

				<Field.Root>
					<Field.Label>Nombres comunes</Field.Label>
					<Input placeholder="Separados por coma" value={state.commonNames} onChange={event => update('commonNames', event.target.value)} />
				</Field.Root>

				<Box>
					<Heading size="sm" mb={2}>
						Altura y ancho de copa (metros)
					</Heading>
					<Stack gap={4} direction={{ base: 'column', md: 'row' }}>
						<Field.Root>
							<Field.Label>Altura mínima</Field.Label>
							<Input type="number" value={state.heightMin} onChange={event => update('heightMin', event.target.value)} />
						</Field.Root>
						<Field.Root>
							<Field.Label>Altura máxima</Field.Label>
							<Input type="number" value={state.heightMax} onChange={event => update('heightMax', event.target.value)} />
						</Field.Root>
						<Field.Root>
							<Field.Label>Ancho de copa mínimo</Field.Label>
							<Input type="number" value={state.crownWidthMin} onChange={event => update('crownWidthMin', event.target.value)} />
						</Field.Root>
						<Field.Root>
							<Field.Label>Ancho de copa máximo</Field.Label>
							<Input type="number" value={state.crownWidthMax} onChange={event => update('crownWidthMax', event.target.value)} />
						</Field.Root>
					</Stack>
				</Box>

				<CheckboxGroup
					label="Estrato"
					options={catalogs.stratums}
					selected={state.stratumIds}
					onToggle={id => update('stratumIds', toggleId(state.stratumIds, id))}
				/>
				<CheckboxGroup
					label="Zona ecológica"
					options={catalogs.zones}
					selected={state.zoneIds}
					onToggle={id => update('zoneIds', toggleId(state.zoneIds, id))}
				/>
				<CheckboxGroup
					label="Funciones ecológicas"
					options={catalogs.ecoFunctions}
					selected={state.ecoFunctionIds}
					onToggle={id => update('ecoFunctionIds', toggleId(state.ecoFunctionIds, id))}
				/>
				<CheckboxGroup
					label="Otras funciones"
					options={catalogs.addFunctions}
					selected={state.addFunctionIds}
					onToggle={id => update('addFunctionIds', toggleId(state.addFunctionIds, id))}
				/>

				<Box>
					<Heading size="sm" mb={2}>
						Detalles
					</Heading>
					<Stack gap={4}>
						<Checkbox.Root checked={state.isFrostResistant} onCheckedChange={() => update('isFrostResistant', !state.isFrostResistant)}>
							<Checkbox.HiddenInput />
							<Checkbox.Control>
								<Checkbox.Indicator />
							</Checkbox.Control>
							<Checkbox.Label>Resiste heladas</Checkbox.Label>
						</Checkbox.Root>
						<Stack gap={4} direction={{ base: 'column', md: 'row' }}>
							<LevelSelect label="Preferencia de luz" value={state.lightPreference} onChange={value => update('lightPreference', value)} />
							<LevelSelect label="Preferencia de humedad" value={state.humidityPreference} onChange={value => update('humidityPreference', value)} />
							<LevelSelect
								label="Extracción de nutrientes"
								value={state.nutrientExtraction}
								onChange={value => update('nutrientExtraction', value)}
							/>
						</Stack>
					</Stack>
				</Box>

				{error && (
					<Alert.Root status="error">
						<Alert.Indicator />
						<Alert.Title>{error}</Alert.Title>
					</Alert.Root>
				)}

				<Button type="submit" alignSelf="start" colorPalette="blue" loading={submitting} loadingText="Guardando">
					{submitLabel}
				</Button>
				{catalogs.zones.length === 0 && (
					<Text fontSize="sm" color="fg.muted">
						No hay zonas ecológicas disponibles todavía en el catálogo para seleccionar.
					</Text>
				)}
			</Stack>
		</form>
	);
}

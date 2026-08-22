import { Box, Portal, Tooltip } from '@chakra-ui/react';
import {
	Atom,
	Butterfly,
	DropHalfBottom,
	ForkKnife,
	Graph,
	Heartbeat,
	Horse,
	Leaf,
	Mountains,
	Question,
	Snowflake,
	Sun,
	Tree
} from '@phosphor-icons/react';

import type { Level } from '../../interfaces/Common';
import type { AdditionalFunction, EcologicalFunction, EcologicalZone, Stratum } from '../../interfaces/Species';

function IconTooltip({ label, icon }: { label: string; icon: React.ReactNode }) {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<Box cursor="default" display="inline-flex" mx="1px">
					{icon}
				</Box>
			</Tooltip.Trigger>
			<Portal>
				<Tooltip.Positioner>
					<Tooltip.Content>{label}</Tooltip.Content>
				</Tooltip.Positioner>
			</Portal>
		</Tooltip.Root>
	);
}

export function getEcologicalFunctionIcon(id: string): React.ReactNode {
	switch (+id) {
		case 0:
			return <Leaf />; // Biomass
		case 1:
			return <Graph />; // Nitrogen fixation
		case 2:
			return <Atom />; // Nutrient accumulation
		case 3:
			return <Mountains />; // Erosion control
		case 4:
			return <Butterfly />; // Pollinators
		default:
			return <Question />;
	}
}

export function EcologicalFunctionIconRepresentation({ value }: { value: EcologicalFunction }) {
	return <IconTooltip label={value.name.es_mx} icon={getEcologicalFunctionIcon(value._id)} />;
}

export function getAdditionalFunctionIcon(id: string): React.ReactNode {
	switch (+id) {
		case 0:
			return <ForkKnife />; // Food
		case 1:
			return <Horse />; // Forage
		case 2:
			return <Tree />; // Wood
		case 3:
			return <Heartbeat />; // Medicinal
		default:
			return <Question />;
	}
}

export function AdditionalFunctionIconRepresentation({ value }: { value: AdditionalFunction }) {
	return <IconTooltip label={value.name.es_mx} icon={getAdditionalFunctionIcon(value._id)} />;
}

export function SingleCharRepresentation({ value, name }: { value: Stratum | EcologicalZone; name?: React.ReactNode }) {
	return <IconTooltip label={value.name.es_mx} icon={name || value._id} />;
}

// Únicos campos de `SpeciesDetails` con representación de ícono/texto corto
// (los demás — nutrientes, usos comestibles, observaciones, etc. — son texto
// libre u objetos y no encajan en este renderer genérico).
export const DISPLAYABLE_DETAIL_KEYS = ['isFrostResistant', 'lightPreference', 'nutrientExtraction', 'humidityPreference'] as const;

export const DETAIL_FIELD_LABELS: Record<string, string> = {
	isFrostResistant: 'Resistencia a heladas',
	lightPreference: 'Preferencia de luz',
	nutrientExtraction: 'Extracción de nutrientes',
	humidityPreference: 'Preferencia de humedad'
};

export function formatSpeciesDetail(idKey: string, value: boolean | Level): string {
	if (idKey === 'isFrostResistant') return 'resiste heladas';
	const levels: Record<Level, string> = { H: 'alta', M: 'media', L: 'baja' };
	const level = levels[value as Level] ?? '';
	if (idKey === 'lightPreference') return `luz ${level}`;
	if (idKey === 'nutrientExtraction') return `extracción de nutrientes ${level}`;
	if (idKey === 'humidityPreference') return `humedad ${level}`;
	return '';
}

export function getDetailFieldIcon(idKey: string): React.ReactNode {
	switch (idKey) {
		case 'isFrostResistant':
			return <Snowflake />;
		case 'lightPreference':
			return <Sun />;
		case 'nutrientExtraction':
			return <Atom />;
		case 'humidityPreference':
			return <DropHalfBottom />;
		default:
			return <Question />;
	}
}

function levelCaption(value: Level, labels: { high: string; medium: string; low: string }) {
	if (value === 'H') return labels.high;
	if (value === 'M') return labels.medium;
	return labels.low;
}

export function DetailIconRepresentation({ idKey, value }: { idKey: string; value: boolean | Level }) {
	let caption: string;
	switch (idKey) {
		case 'isFrostResistant':
			caption = 'Resiste heladas';
			break;
		case 'lightPreference':
			caption = levelCaption(value as Level, { high: 'Prefiere sol', medium: 'Prefiere media sombra', low: 'Prefiere sombra' });
			break;
		case 'nutrientExtraction':
			caption = levelCaption(value as Level, {
				high: 'Alta extracción de nutrientes',
				medium: 'Extracción media de nutrientes',
				low: 'Baja extracción de nutrientes'
			});
			break;
		case 'humidityPreference':
			caption = levelCaption(value as Level, { high: 'Prefiere humedad alta', medium: 'Prefiere humedad media', low: 'Prefiere clima seco' });
			break;
		default:
			caption = '';
			break;
	}

	return <IconTooltip label={caption} icon={getDetailFieldIcon(idKey)} />;
}

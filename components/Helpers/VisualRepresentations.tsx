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

export function EcologicalFunctionIconRepresentation({ value }: { value: EcologicalFunction }) {
	let icon;
	switch (+value._id) {
		case 0:
			icon = <Leaf />; // Biomass
			break;
		case 1:
			icon = <Graph />; // Nitrogen fixation
			break;
		case 2:
			icon = <Atom />; // Nutrient accumulation
			break;
		case 3:
			icon = <Mountains />; // Erosion control
			break;
		case 4:
			icon = <Butterfly />; // Pollinators
			break;
		default:
			icon = <Question />;
			break;
	}

	return <IconTooltip label={value.name.es_mx} icon={icon} />;
}

export function AdditionalFunctionIconRepresentation({ value }: { value: AdditionalFunction }) {
	let icon;
	switch (+value._id) {
		case 0:
			icon = <ForkKnife />; // Food
			break;
		case 1:
			icon = <Horse />; // Forage
			break;
		case 2:
			icon = <Tree />; // Wood
			break;
		case 3:
			icon = <Heartbeat />; // Medicinal
			break;
		default:
			icon = <Question />;
			break;
	}

	return <IconTooltip label={value.name.es_mx} icon={icon} />;
}

export function SingleCharRepresentation({ value, name }: { value: Stratum | EcologicalZone; name?: React.ReactNode }) {
	return <IconTooltip label={value.name.es_mx} icon={name || value._id} />;
}

function levelCaption(value: Level, labels: { high: string; medium: string; low: string }) {
	if (value === 'H') return labels.high;
	if (value === 'M') return labels.medium;
	return labels.low;
}

export function DetailIconRepresentation({ idKey, value }: { idKey: string; value: boolean | Level }) {
	let icon;
	let caption: string;
	switch (idKey) {
		case 'isFrostResistant':
			icon = <Snowflake />;
			caption = 'Resiste heladas';
			break;
		case 'lightPreference':
			icon = <Sun />;
			caption = levelCaption(value as Level, { high: 'Prefiere sol', medium: 'Prefiere media sombra', low: 'Prefiere sombra' });
			break;
		case 'nutrientExtraction':
			icon = <Atom />;
			caption = levelCaption(value as Level, {
				high: 'Alta extracción de nutrientes',
				medium: 'Extracción media de nutrientes',
				low: 'Baja extracción de nutrientes'
			});
			break;
		case 'humidityPreference':
			icon = <DropHalfBottom />;
			caption = levelCaption(value as Level, { high: 'Prefiere humedad alta', medium: 'Prefiere humedad media', low: 'Prefiere clima seco' });
			break;
		default:
			icon = <Question />;
			caption = '';
			break;
	}

	return <IconTooltip label={caption} icon={icon} />;
}

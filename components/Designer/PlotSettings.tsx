import { useState } from 'react';

import { Field, HStack, NumberInput, SimpleGrid, Stack, Switch, Text } from '@chakra-ui/react';

import { PLOT_MAX, PLOT_MIN } from './useDesignState';

import type { DesignPlot } from '../../interfaces/Design';

// Campo numérico en metros: guarda el texto mientras se escribe y sólo avisa
// (onCommit) cuando el valor es válido y está dentro del rango.
export function MeterInput({
	label,
	value,
	min,
	max,
	step = 1,
	onCommit
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onCommit: (value: number) => void;
}) {
	const [text, setText] = useState(String(value));
	const [previous, setPrevious] = useState(value);
	if (previous !== value) {
		setPrevious(value);
		setText(String(value));
	}

	return (
		<Field.Root>
			<Field.Label fontSize="xs">{label}</Field.Label>
			<NumberInput.Root
				size="sm"
				w="100%"
				value={text}
				min={min}
				max={max}
				step={step}
				onValueChange={details => {
					setText(details.value);
					const number = details.valueAsNumber;
					if (Number.isFinite(number) && number >= min && number <= max && number !== value) onCommit(number);
				}}
			>
				<NumberInput.Control />
				<NumberInput.Input />
			</NumberInput.Root>
		</Field.Root>
	);
}

interface PlotSettingsProps {
	plot: DesignPlot;
	onPlotChange: (plot: DesignPlot) => void;
	showGrid: boolean;
	onShowGridChange: (value: boolean) => void;
	gridSpacing: number;
	onGridSpacingChange: (value: number) => void;
	snap: boolean;
	onSnapChange: (value: boolean) => void;
}

export default function PlotSettings({
	plot,
	onPlotChange,
	showGrid,
	onShowGridChange,
	gridSpacing,
	onGridSpacingChange,
	snap,
	onSnapChange
}: PlotSettingsProps) {
	return (
		<Stack gap={3}>
			<SimpleGrid columns={2} gap={2}>
				<MeterInput label="Ancho (m)" value={plot.width} min={PLOT_MIN} max={PLOT_MAX} onCommit={width => onPlotChange({ ...plot, width })} />
				<MeterInput label="Largo (m)" value={plot.length} min={PLOT_MIN} max={PLOT_MAX} onCommit={length => onPlotChange({ ...plot, length })} />
			</SimpleGrid>
			<Text fontSize="xs" color="fg.muted">
				Área: {(plot.width * plot.length).toLocaleString('es-MX', { maximumFractionDigits: 1 })} m²
			</Text>
			<HStack gap={4} flexWrap="wrap">
				<Switch.Root size="sm" checked={showGrid} onCheckedChange={event => onShowGridChange(event.checked)} colorPalette="green">
					<Switch.HiddenInput />
					<Switch.Control />
					<Switch.Label>Cuadrícula</Switch.Label>
				</Switch.Root>
				<Switch.Root size="sm" checked={snap} onCheckedChange={event => onSnapChange(event.checked)} colorPalette="green">
					<Switch.HiddenInput />
					<Switch.Control />
					<Switch.Label>Ajustar a la cuadrícula</Switch.Label>
				</Switch.Root>
			</HStack>
			<MeterInput label="Separación de la cuadrícula (m)" value={gridSpacing} min={0.1} max={50} step={0.5} onCommit={onGridSpacingChange} />
		</Stack>
	);
}

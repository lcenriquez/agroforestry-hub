import { Box, Button, Group, HStack, IconButton } from '@chakra-ui/react';
import { ArrowClockwiseIcon, ArrowCounterClockwiseIcon, CursorIcon, LineSegmentIcon, PlantIcon } from '@phosphor-icons/react';

import { MeterInput } from './PlotSettings';

import type { DesignerTool } from './PlanView';

const TOOLS: { id: DesignerTool; label: string; title: string; icon: React.ReactNode }[] = [
	{ id: 'select', label: 'Seleccionar', title: 'Seleccionar y mover plantas (arrastra el fondo para desplazarte)', icon: <CursorIcon /> },
	{ id: 'plant', label: 'Plantar', title: 'Haz clic en el terreno para plantar la especie elegida', icon: <PlantIcon /> },
	{ id: 'line', label: 'En línea', title: 'Planta una fila: clic en el inicio y en el final', icon: <LineSegmentIcon /> }
];

interface DesignToolbarProps {
	tool: DesignerTool;
	onToolChange: (tool: DesignerTool) => void;
	lineSpacing: number;
	onLineSpacingChange: (value: number) => void;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
}

export default function DesignToolbar({
	tool,
	onToolChange,
	lineSpacing,
	onLineSpacingChange,
	canUndo,
	canRedo,
	onUndo,
	onRedo
}: DesignToolbarProps) {
	return (
		<HStack gap={2} flexWrap="wrap" align="end">
			<Group attached>
				{TOOLS.map(item => (
					<Button
						key={item.id}
						size="sm"
						variant={tool === item.id ? 'solid' : 'outline'}
						colorPalette="green"
						onClick={() => onToolChange(item.id)}
						title={item.title}
						aria-pressed={tool === item.id}
					>
						{item.icon}
						<Box as="span" display={{ base: 'none', sm: 'inline' }}>
							{item.label}
						</Box>
					</Button>
				))}
			</Group>
			<Group attached>
				<IconButton size="sm" variant="outline" aria-label="Deshacer" title="Deshacer (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
					<ArrowCounterClockwiseIcon />
				</IconButton>
				<IconButton size="sm" variant="outline" aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" onClick={onRedo} disabled={!canRedo}>
					<ArrowClockwiseIcon />
				</IconButton>
			</Group>
			{tool === 'line' && (
				<Box w="150px">
					<MeterInput label="Cada (m)" value={lineSpacing} min={0.1} max={100} step={0.5} onCommit={onLineSpacingChange} />
				</Box>
			)}
		</HStack>
	);
}

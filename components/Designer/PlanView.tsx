import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, IconButton, Stack, Text } from '@chakra-ui/react';
import { CornersOutIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@phosphor-icons/react';

import { clamp } from './analysis';
import { backgroundSize } from './background';
import { niceStep } from './exporters';
import { plantSpec } from './managedSize';
import { formatNumber, shortLabel } from './strata';

import type { DesignBackground, DesignLayers, DesignPlant, DesignPlot } from '../../interfaces/Design';
import type { PlantSpec } from './strata';

// Vista en planta (de arriba, a escala) del terreno. Todo se dibuja en metros
// dentro de un <svg> cuyo viewBox define el zoom y el desplazamiento; los
// trazos usan `non-scaling-stroke` para verse igual a cualquier zoom.

export type DesignerTool = 'select' | 'plant' | 'line' | 'calibrate' | 'moveBackground';

type Point = { x: number; y: number };

// Colores del lienzo vía variables CSS de Chakra: cambian solos con el modo
// claro/oscuro (clase `.dark` en <html>), sin depender de un re-render.
export const CANVAS_COLORS = {
	background: 'var(--chakra-colors-bg-emphasized)',
	plotFill: 'var(--chakra-colors-bg-panel)',
	plotStroke: 'var(--chakra-colors-green-solid)',
	grid: 'var(--chakra-colors-border)',
	text: 'var(--chakra-colors-fg)',
	textMuted: 'var(--chakra-colors-fg-muted)',
	halo: 'var(--chakra-colors-bg-panel)',
	selection: 'var(--chakra-colors-blue-500)',
	warning: 'var(--chakra-colors-red-500)'
};

const MIN_PPM = 0.2;
const MAX_PPM = 400;
const CLICK_TOLERANCE = 6; // px antes de considerar que el puntero se arrastró
const MAX_LINE_POINTS = 500;

interface View {
	cx: number;
	cy: number;
	ppm: number; // píxeles por metro
	key: string;
}

interface Size {
	w: number;
	h: number;
}

type Gesture =
	| { kind: 'bgdrag'; pointerId: number; offX: number; offY: number; startX: number; startY: number; started: boolean }
	| { kind: 'drag'; pointerId: number; plantId: string; offX: number; offY: number; startX: number; startY: number; started: boolean }
	| { kind: 'press'; pointerId: number; startX: number; startY: number; lastX: number; lastY: number; panning: boolean }
	| { kind: 'pinch'; startDist: number; startView: View; worldMid: { x: number; y: number } };

function fitView(size: Size, plot: DesignPlot, key: string): View {
	const pad = 40;
	const w = Math.max(1, size.w - pad * 2);
	const h = Math.max(1, size.h - pad * 2);
	const ppm = size.w > 0 ? clamp(Math.min(w / plot.width, h / plot.length), MIN_PPM, MAX_PPM) : 10;
	return { cx: plot.width / 2, cy: plot.length / 2, ppm, key };
}

function zoomView(base: View, factor: number, sx: number, sy: number, size: Size): View {
	const ppm = clamp(base.ppm * factor, MIN_PPM, MAX_PPM);
	const wx = base.cx + (sx - size.w / 2) / base.ppm;
	const wy = base.cy + (sy - size.h / 2) / base.ppm;
	return { ...base, ppm, cx: wx - (sx - size.w / 2) / ppm, cy: wy - (sy - size.h / 2) / ppm };
}

export function linePoints(a: { x: number; y: number }, b: { x: number; y: number }, spacing: number) {
	const d = Math.hypot(b.x - a.x, b.y - a.y);
	if (d < 1e-6 || !(spacing > 0)) return [a];
	const n = Math.min(MAX_LINE_POINTS - 1, Math.floor(d / spacing + 1e-6));
	const points = [];
	for (let i = 0; i <= n; i++) {
		const t = (i * spacing) / d;
		points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
	}
	return points;
}

function visualRadius(spec: PlantSpec, ppm: number) {
	return Math.max(spec.crown / 2, 3 / ppm);
}

interface PlantShapeProps {
	plant: DesignPlant;
	spec: PlantSpec;
	selected: boolean;
	flagged: boolean;
	interactive: boolean;
	ppm: number;
}

const PlantShape = memo(function PlantShape({ plant, spec, selected, flagged, interactive, ppm }: PlantShapeProps) {
	const r = visualRadius(spec, ppm);
	const color = spec.stratum.color;
	return (
		<g data-plant-id={plant.id} pointerEvents={interactive ? 'all' : 'none'} style={{ cursor: interactive ? 'grab' : undefined }}>
			<circle
				cx={plant.x}
				cy={plant.y}
				r={r}
				fill={color}
				fillOpacity={selected ? 0.6 : 0.38}
				stroke={color}
				strokeWidth={1.5}
				strokeDasharray={spec.missing || spec.crownMissing ? '5 3' : undefined}
				vectorEffect="non-scaling-stroke"
			/>
			<circle cx={plant.x} cy={plant.y} r={2.5 / ppm} fill={color} />
			{flagged && (
				<circle
					cx={plant.x}
					cy={plant.y}
					r={r + 3 / ppm}
					fill="none"
					stroke={CANVAS_COLORS.warning}
					strokeWidth={1.5}
					strokeDasharray="3 3"
					vectorEffect="non-scaling-stroke"
				/>
			)}
			{selected && (
				<circle
					cx={plant.x}
					cy={plant.y}
					r={r + 6 / ppm}
					fill="none"
					stroke={CANVAS_COLORS.selection}
					strokeWidth={2.5}
					vectorEffect="non-scaling-stroke"
				/>
			)}
		</g>
	);
});

const PlantLabel = memo(function PlantLabel({ plant, spec, ppm }: { plant: DesignPlant; spec: PlantSpec; ppm: number }) {
	if (spec.crown * ppm < 48) return null;
	// El texto se dibuja en px de pantalla y se escala con `transform`: un
	// font-size en metros (<1) lo agranda Chromium al tamaño mínimo de fuente
	// y el viewBox lo vuelve gigante.
	return (
		<text
			transform={`translate(${plant.x} ${plant.y}) scale(${1 / ppm})`}
			y={11 * 1.4}
			fontSize={11}
			textAnchor="middle"
			fill={CANVAS_COLORS.text}
			stroke={CANVAS_COLORS.halo}
			strokeWidth={3}
			paintOrder="stroke"
		>
			{shortLabel(spec.name)}
		</text>
	);
});

interface PlanViewProps {
	plot: DesignPlot;
	plants: DesignPlant[];
	specFor: (speciesId: string) => PlantSpec;
	selectedId: string | null;
	flaggedIds: Set<string>;
	tool: DesignerTool;
	activeSpec: PlantSpec | null;
	showGrid: boolean;
	gridSpacing: number;
	snap: boolean;
	lineSpacing: number;
	fitKey: string;
	onSelect: (id: string | null) => void;
	onPlace: (points: { x: number; y: number }[]) => void;
	onDragStart: () => void;
	onDragMove: (id: string, x: number, y: number) => void;
	onDragEnd: () => void;
	background: DesignBackground | null;
	layers: DesignLayers;
	calibrationPoints: Point[];
	onCalibrationPoint: (point: Point) => void;
	onBackgroundDragStart: () => void;
	onBackgroundMove: (x: number, y: number) => void;
	onBackgroundDragEnd: () => void;
}

export default function PlanView({
	plot,
	plants,
	specFor,
	selectedId,
	flaggedIds,
	tool,
	activeSpec,
	showGrid,
	gridSpacing,
	snap,
	lineSpacing,
	fitKey,
	onSelect,
	onPlace,
	onDragStart,
	onDragMove,
	onDragEnd,
	background,
	layers,
	calibrationPoints,
	onCalibrationPoint,
	onBackgroundDragStart,
	onBackgroundMove,
	onBackgroundDragEnd
}: PlanViewProps) {
	const showBackground = Boolean(background && layers.background.visible);
	const backgroundEditable = showBackground && !layers.background.locked;
	const plantsEditable = layers.plants.visible && !layers.plants.locked;
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const pointers = useRef(new Map<number, { x: number; y: number }>());
	const gesture = useRef<Gesture | null>(null);
	const pendingMove = useRef<{ id: string; x: number; y: number } | null>(null);
	const frame = useRef<number | null>(null);

	const [size, setSize] = useState<Size>({ w: 0, h: 0 });
	const [userView, setUserView] = useState<View | null>(null);
	const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
	const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
	const [panning, setPanning] = useState(false);
	const [prevTool, setPrevTool] = useState(tool);
	if (prevTool !== tool) {
		setPrevTool(tool);
		setLineStart(null);
		setHover(null);
	}

	const fitted = useMemo(() => fitView(size, plot, fitKey), [size, plot, fitKey]);
	const view = userView && userView.key === fitKey ? userView : fitted;
	const { ppm } = view;
	const vw = size.w / ppm;
	const vh = size.h / ppm;
	const vx = view.cx - vw / 2;
	const vy = view.cy - vh / 2;

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;
		const observer = new ResizeObserver(entries => {
			const rect = entries[0].contentRect;
			setSize(prev => (prev.w === rect.width && prev.h === rect.height ? prev : { w: rect.width, h: rect.height }));
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const updateView = useCallback(
		(change: (base: View) => View) => {
			setUserView(prev => change(prev && prev.key === fitKey ? prev : fitted));
		},
		[fitKey, fitted]
	);

	// Zoom con la rueda / gesto de pellizco del trackpad (listener no pasivo
	// para poder evitar el scroll de la página).
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const handleWheel = (event: WheelEvent) => {
			event.preventDefault();
			const rect = svg.getBoundingClientRect();
			const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
			const factor = Math.exp(-clamp(delta, -100, 100) * (event.ctrlKey ? 0.01 : 0.0025));
			updateView(base => zoomView(base, factor, event.clientX - rect.left, event.clientY - rect.top, { w: rect.width, h: rect.height }));
		};
		svg.addEventListener('wheel', handleWheel, { passive: false });
		return () => svg.removeEventListener('wheel', handleWheel);
	}, [updateView]);

	useEffect(() => {
		if (!lineStart) return;
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setLineStart(null);
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [lineStart]);

	useEffect(
		() => () => {
			if (frame.current !== null) cancelAnimationFrame(frame.current);
		},
		[]
	);

	const snapValue = (value: number) => (snap && gridSpacing > 0 ? Math.round(value / gridSpacing) * gridSpacing : value);

	function toWorld(clientX: number, clientY: number) {
		const rect = svgRef.current!.getBoundingClientRect();
		return { x: vx + (clientX - rect.left) / ppm, y: vy + (clientY - rect.top) / ppm };
	}

	function flushMove() {
		if (frame.current !== null) {
			cancelAnimationFrame(frame.current);
			frame.current = null;
		}
		const move = pendingMove.current;
		pendingMove.current = null;
		if (move) onDragMove(move.id, move.x, move.y);
	}

	function scheduleMove(move: { id: string; x: number; y: number }) {
		pendingMove.current = move;
		if (frame.current === null) {
			frame.current = requestAnimationFrame(() => {
				frame.current = null;
				const pending = pendingMove.current;
				pendingMove.current = null;
				if (pending) onDragMove(pending.id, pending.x, pending.y);
			});
		}
	}

	function startPinch() {
		const current = gesture.current;
		if (current?.kind === 'drag' && current.started) {
			flushMove();
			onDragEnd();
		}
		const [a, b] = [...pointers.current.values()];
		const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
		gesture.current = { kind: 'pinch', startDist: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), startView: view, worldMid: toWorld(mid.x, mid.y) };
	}

	function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
		if (event.pointerType === 'mouse' && event.button !== 0 && event.button !== 1) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (pointers.current.size === 2) {
			startPinch();
			return;
		}
		if (pointers.current.size > 2) return;

		if (tool === 'moveBackground' && background && backgroundEditable && event.button === 0) {
			const world = toWorld(event.clientX, event.clientY);
			gesture.current = {
				kind: 'bgdrag',
				pointerId: event.pointerId,
				offX: background.x - world.x,
				offY: background.y - world.y,
				startX: event.clientX,
				startY: event.clientY,
				started: false
			};
			return;
		}

		const target = event.target as Element;
		const plantElement = tool === 'select' && plantsEditable && event.button === 0 ? target.closest('[data-plant-id]') : null;
		const plantId = plantElement?.getAttribute('data-plant-id');
		const plant = plantId ? plants.find(p => p.id === plantId) : undefined;
		if (plant) {
			onSelect(plant.id);
			const world = toWorld(event.clientX, event.clientY);
			gesture.current = {
				kind: 'drag',
				pointerId: event.pointerId,
				plantId: plant.id,
				offX: plant.x - world.x,
				offY: plant.y - world.y,
				startX: event.clientX,
				startY: event.clientY,
				started: false
			};
			return;
		}
		gesture.current = {
			kind: 'press',
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			lastX: event.clientX,
			lastY: event.clientY,
			panning: event.button === 1
		};
		if (event.button === 1) setPanning(true);
	}

	function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
		if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
		const current = gesture.current;

		if (event.pointerType === 'mouse' && tool !== 'select' && tool !== 'moveBackground' && (!current || current.kind === 'press')) {
			const world = toWorld(event.clientX, event.clientY);
			setHover({ x: snapValue(world.x), y: snapValue(world.y) });
		}
		if (!current) return;

		if (current.kind === 'pinch') {
			if (pointers.current.size < 2) return;
			const [a, b] = [...pointers.current.values()];
			const rect = svgRef.current!.getBoundingClientRect();
			const dist = Math.max(10, Math.hypot(a.x - b.x, a.y - b.y));
			const ppmNext = clamp((current.startView.ppm * dist) / current.startDist, MIN_PPM, MAX_PPM);
			const sx = (a.x + b.x) / 2 - rect.left;
			const sy = (a.y + b.y) / 2 - rect.top;
			setUserView({
				...current.startView,
				key: fitKey,
				ppm: ppmNext,
				cx: current.worldMid.x - (sx - rect.width / 2) / ppmNext,
				cy: current.worldMid.y - (sy - rect.height / 2) / ppmNext
			});
			return;
		}
		if (current.pointerId !== event.pointerId) return;

		if (current.kind === 'bgdrag') {
			if (!current.started) {
				if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 4) return;
				current.started = true;
				onBackgroundDragStart();
			}
			const world = toWorld(event.clientX, event.clientY);
			onBackgroundMove(world.x + current.offX, world.y + current.offY);
			return;
		}

		if (current.kind === 'drag') {
			if (!current.started) {
				if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 4) return;
				current.started = true;
				onDragStart();
			}
			const world = toWorld(event.clientX, event.clientY);
			scheduleMove({ id: current.plantId, x: snapValue(world.x + current.offX), y: snapValue(world.y + current.offY) });
			return;
		}

		if (!current.panning && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > CLICK_TOLERANCE) {
			current.panning = true;
			setPanning(true);
		}
		if (current.panning) {
			const dx = event.clientX - current.lastX;
			const dy = event.clientY - current.lastY;
			updateView(base => ({ ...base, cx: base.cx - dx / base.ppm, cy: base.cy - dy / base.ppm }));
		}
		current.lastX = event.clientX;
		current.lastY = event.clientY;
	}

	function finishPointer(event: React.PointerEvent<SVGSVGElement>, cancelled: boolean) {
		pointers.current.delete(event.pointerId);
		const current = gesture.current;
		if (!current) return;
		if (current.kind === 'pinch') {
			if (pointers.current.size < 2) gesture.current = null;
			return;
		}
		if (current.pointerId !== event.pointerId) return;
		gesture.current = null;
		setPanning(false);

		if (current.kind === 'bgdrag') {
			if (current.started) onBackgroundDragEnd();
			return;
		}
		if (current.kind === 'drag') {
			if (current.started) {
				flushMove();
				onDragEnd();
			}
			return;
		}
		if (cancelled || current.panning) return;
		if (tool === 'moveBackground') return;

		const world = toWorld(event.clientX, event.clientY);
		const point = { x: snapValue(world.x), y: snapValue(world.y) };
		if (tool === 'calibrate') {
			// Sin ajuste a la cuadrícula: se marcan puntos de la foto, no del terreno.
			onCalibrationPoint(world);
			return;
		}
		if (tool === 'select') onSelect(null);
		else if (!activeSpec) return;
		else if (tool === 'plant') onPlace([point]);
		else if (!lineStart) setLineStart(point);
		else {
			onPlace(linePoints(lineStart, point, lineSpacing));
			setLineStart(null);
		}
	}

	const gridPath = useMemo(() => {
		if (!(gridSpacing > 0)) return '';
		const count = plot.width / gridSpacing + plot.length / gridSpacing;
		if (count > 4000) return '';
		let d = '';
		for (let x = gridSpacing; x < plot.width - 1e-6; x += gridSpacing) d += `M${x} 0V${plot.length}`;
		for (let y = gridSpacing; y < plot.length - 1e-6; y += gridSpacing) d += `M0 ${y}H${plot.width}`;
		return d;
	}, [plot.width, plot.length, gridSpacing]);

	const ticks = useMemo(() => {
		const step = niceStep(70 / ppm);
		const xs: number[] = [];
		const ys: number[] = [];
		for (let x = 0; x <= plot.width + 1e-6; x += step) xs.push(x);
		for (let y = 0; y <= plot.length + 1e-6; y += step) ys.push(y);
		return { xs, ys };
	}, [ppm, plot.width, plot.length]);

	// Las plantas altas se dibujan primero para que las bajas queden encima y se puedan tocar.
	const ordered = useMemo(
		() => plants.map(plant => ({ plant, spec: plantSpec(specFor(plant.speciesId), plant) })).sort((a, b) => b.spec.height - a.spec.height),
		[plants, specFor]
	);

	const preview = useMemo(() => {
		if (!activeSpec || (tool !== 'plant' && tool !== 'line')) return [];
		if (tool === 'line' && lineStart) return hover ? linePoints(lineStart, hover, lineSpacing).slice(0, 200) : [lineStart];
		return hover ? [hover] : [];
	}, [activeSpec, tool, lineStart, hover, lineSpacing]);

	const scaleStep = niceStep(100 / ppm);
	const interactive = tool === 'select' && plantsEditable;
	const cursor = panning
		? 'grabbing'
		: tool === 'select'
			? 'default'
			: tool === 'calibrate'
				? 'crosshair'
				: tool === 'moveBackground'
					? backgroundEditable
						? 'move'
						: 'not-allowed'
					: activeSpec
						? 'crosshair'
						: 'not-allowed';
	const bgSize = background ? backgroundSize(background) : null;

	return (
		<Box
			ref={containerRef}
			position="relative"
			h={{ base: '58vh', md: '480px', xl: '540px' }}
			minH="280px"
			borderRadius="md"
			overflow="hidden"
			borderWidth="1px"
		>
			<svg
				ref={svgRef}
				width={size.w}
				height={size.h}
				viewBox={size.w > 0 ? `${vx} ${vy} ${vw} ${vh}` : undefined}
				role="application"
				aria-label="Vista en planta del terreno"
				style={{ display: 'block', touchAction: 'none', userSelect: 'none', cursor, background: CANVAS_COLORS.background }}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={event => finishPointer(event, false)}
				onPointerCancel={event => finishPointer(event, true)}
				onPointerLeave={event => {
					if (event.pointerType === 'mouse') setHover(null);
				}}
				onContextMenu={event => event.preventDefault()}
			>
				{size.w > 0 && (
					<>
						{background && bgSize && showBackground && (
							<image
								href={background.src}
								x={background.x}
								y={background.y}
								width={bgSize.width}
								height={bgSize.height}
								opacity={layers.background.opacity}
								preserveAspectRatio="none"
								pointerEvents="none"
							/>
						)}
						<rect
							x={0}
							y={0}
							width={plot.width}
							height={plot.length}
							fill={showBackground ? 'none' : CANVAS_COLORS.plotFill}
							stroke={CANVAS_COLORS.plotStroke}
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
						/>
						{showGrid && gridPath && gridSpacing * ppm >= 5 && (
							<path d={gridPath} stroke={CANVAS_COLORS.grid} strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" pointerEvents="none" />
						)}
						<g pointerEvents="none" fill={CANVAS_COLORS.textMuted} fontSize={11}>
							{ticks.xs.map(x => (
								<text key={`x${x}`} transform={`translate(${x} 0) scale(${1 / ppm})`} y={-6} textAnchor="middle">
									{formatNumber(x, 1)}
								</text>
							))}
							{ticks.ys.map(y => (
								<text key={`y${y}`} transform={`translate(0 ${y}) scale(${1 / ppm})`} x={-6} y={11 / 3} textAnchor="end">
									{formatNumber(y, 1)}
								</text>
							))}
						</g>
						<g opacity={layers.plants.opacity} display={layers.plants.visible ? undefined : 'none'}>
							{ordered.map(({ plant, spec }) => (
								<PlantShape
									key={plant.id}
									plant={plant}
									spec={spec}
									selected={plant.id === selectedId}
									flagged={flaggedIds.has(plant.id)}
									interactive={interactive}
									ppm={ppm}
								/>
							))}
						</g>
						<g pointerEvents="none" display={layers.plants.visible ? undefined : 'none'}>
							{ordered.map(({ plant, spec }) => (
								<PlantLabel key={plant.id} plant={plant} spec={spec} ppm={ppm} />
							))}
						</g>
						{calibrationPoints.length > 0 && (
							<g pointerEvents="none">
								{calibrationPoints.length === 2 && (
									<line
										x1={calibrationPoints[0].x}
										y1={calibrationPoints[0].y}
										x2={calibrationPoints[1].x}
										y2={calibrationPoints[1].y}
										stroke={CANVAS_COLORS.warning}
										strokeWidth={2}
										strokeDasharray="6 4"
										vectorEffect="non-scaling-stroke"
									/>
								)}
								{calibrationPoints.map((point, index) => (
									<circle
										key={index}
										cx={point.x}
										cy={point.y}
										r={5 / ppm}
										fill={CANVAS_COLORS.warning}
										stroke={CANVAS_COLORS.halo}
										strokeWidth={2}
										vectorEffect="non-scaling-stroke"
									/>
								))}
							</g>
						)}
						{activeSpec && preview.length > 0 && (
							<g pointerEvents="none">
								{tool === 'line' && lineStart && hover && (
									<line
										x1={lineStart.x}
										y1={lineStart.y}
										x2={hover.x}
										y2={hover.y}
										stroke={CANVAS_COLORS.selection}
										strokeWidth={1.5}
										strokeDasharray="6 4"
										vectorEffect="non-scaling-stroke"
									/>
								)}
								{preview.map((point, index) => (
									<circle
										key={index}
										cx={point.x}
										cy={point.y}
										r={visualRadius(activeSpec, ppm)}
										fill={activeSpec.stratum.color}
										fillOpacity={0.2}
										stroke={activeSpec.stratum.color}
										strokeDasharray="4 3"
										strokeWidth={1.5}
										vectorEffect="non-scaling-stroke"
									/>
								))}
							</g>
						)}
					</>
				)}
			</svg>

			<Stack position="absolute" top={2} right={2} gap={1}>
				<IconButton
					aria-label="Acercar"
					title="Acercar"
					size="xs"
					variant="surface"
					onClick={() => updateView(base => zoomView(base, 1.4, size.w / 2, size.h / 2, size))}
				>
					<MagnifyingGlassPlusIcon />
				</IconButton>
				<IconButton
					aria-label="Alejar"
					title="Alejar"
					size="xs"
					variant="surface"
					onClick={() => updateView(base => zoomView(base, 1 / 1.4, size.w / 2, size.h / 2, size))}
				>
					<MagnifyingGlassMinusIcon />
				</IconButton>
				<IconButton aria-label="Ajustar a pantalla" title="Ajustar a pantalla" size="xs" variant="surface" onClick={() => setUserView(null)}>
					<CornersOutIcon />
				</IconButton>
			</Stack>

			{size.w > 0 && (
				<Box position="absolute" bottom={2} left={2} pointerEvents="none" bg="bg.panel/80" px={2} py={1} borderRadius="sm">
					<Box h="6px" w={`${scaleStep * ppm}px`} bg="fg" borderRadius="1px" />
					<Text fontSize="xs" color="fg">
						{formatNumber(scaleStep)} m
					</Text>
				</Box>
			)}

			{hover && tool !== 'select' && tool !== 'moveBackground' && (
				<Text position="absolute" bottom={2} right={2} fontSize="xs" bg="bg.panel/80" px={2} py={1} borderRadius="sm" pointerEvents="none">
					x {formatNumber(hover.x, 1)} m · y {formatNumber(hover.y, 1)} m
				</Text>
			)}

			{(tool === 'plant' || tool === 'line') && !activeSpec && (
				<Text position="absolute" top={2} left={2} right={12} fontSize="sm" bg="bg.panel/90" px={2} py={1} borderRadius="sm" pointerEvents="none">
					Elige una especie en la paleta para empezar a plantar.
				</Text>
			)}
			{tool === 'calibrate' && (
				<Text position="absolute" top={2} left={2} right={12} fontSize="sm" bg="bg.panel/90" px={2} py={1} borderRadius="sm" pointerEvents="none">
					{calibrationPoints.length < 2
						? `Toca ${calibrationPoints.length ? 'el segundo' : 'el primer'} punto de una distancia que conozcas en la imagen.`
						: 'Escribe la distancia real entre los dos puntos en el panel de capas.'}
				</Text>
			)}
			{tool === 'moveBackground' && (
				<Text position="absolute" top={2} left={2} right={12} fontSize="sm" bg="bg.panel/90" px={2} py={1} borderRadius="sm" pointerEvents="none">
					{backgroundEditable ? 'Arrastra para mover la imagen de fondo.' : 'La capa de imagen está oculta o bloqueada.'}
				</Text>
			)}
			{tool === 'line' && activeSpec && (
				<Text position="absolute" top={2} left={2} right={12} fontSize="sm" bg="bg.panel/90" px={2} py={1} borderRadius="sm" pointerEvents="none">
					{lineStart ? 'Toca el punto final de la línea (Esc para cancelar).' : 'Toca el punto inicial de la línea.'}
				</Text>
			)}
		</Box>
	);
}

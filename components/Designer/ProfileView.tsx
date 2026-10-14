import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { Box } from '@chakra-ui/react';

import { niceStep } from './exporters';
import { CANVAS_COLORS } from './PlanView';
import { formatNumber } from './strata';

import type { DesignPlant, DesignPlot } from '../../interfaces/Design';
import type { PlantSpec } from './strata';

// Vista de perfil (corte lateral): proyecta cada planta sobre el eje X del
// terreno y dibuja su silueta con altura y copa reales, a la misma escala en
// ambos ejes. Se ve el terreno "desde abajo" del plano: las plantas más altas
// quedan atrás y las más bajas al frente.

const MARGIN = { left: 40, right: 14, top: 14, bottom: 26 };
const MIN_HEIGHT = 170;
const MAX_HEIGHT = 340;

interface Scale {
	ppm: number;
	ox: number; // px de x = 0
	groundY: number; // px del suelo
}

const Silhouette = memo(function Silhouette({
	plant,
	spec,
	selected,
	scale,
	onSelect
}: {
	plant: DesignPlant;
	spec: PlantSpec;
	selected: boolean;
	scale: Scale;
	onSelect: (id: string) => void;
}) {
	const { ppm, ox, groundY } = scale;
	const x = ox + plant.x * ppm;
	const height = Math.max(0.1, spec.height) * ppm;
	const crown = Math.max(0.1, spec.crown) * ppm;
	const color = spec.stratum.color;
	const dashed = spec.missing || spec.heightMissing || spec.crownMissing ? '5 3' : undefined;
	const stroke = selected ? CANVAS_COLORS.selection : color;
	const strokeWidth = selected ? 2.5 : 1.2;

	let shape: React.ReactNode;
	if (spec.height >= 2.5) {
		// Árbol/arbusto alto: tronco y copa elíptica en la parte superior.
		const crownHeight = Math.min(height * 0.65, Math.max(crown * 0.8, height * 0.35));
		const trunkWidth = Math.max(2, Math.min(crown * 0.08, 0.6 * ppm));
		shape = (
			<>
				<rect
					x={x - trunkWidth / 2}
					y={groundY - height + crownHeight / 2}
					width={trunkWidth}
					height={height - crownHeight / 2}
					fill="#795548"
					fillOpacity={0.8}
				/>
				<ellipse
					cx={x}
					cy={groundY - height + crownHeight / 2}
					rx={crown / 2}
					ry={crownHeight / 2}
					fill={color}
					fillOpacity={0.55}
					stroke={stroke}
					strokeWidth={strokeWidth}
					strokeDasharray={dashed}
				/>
			</>
		);
	} else {
		// Plantas bajas: una mata desde el suelo.
		shape = (
			<path
				d={`M${x - crown / 2} ${groundY} Q${x - crown / 2} ${groundY - height * 1.3} ${x} ${groundY - height} Q${x + crown / 2} ${groundY - height * 1.3} ${x + crown / 2} ${groundY} Z`}
				fill={color}
				fillOpacity={0.6}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeDasharray={dashed}
			/>
		);
	}

	return (
		<g style={{ cursor: 'pointer' }} onClick={() => onSelect(plant.id)}>
			<title>{`${spec.name} · ${formatNumber(spec.height, 1)} m de alto · copa ${formatNumber(spec.crown, 1)} m`}</title>
			{shape}
		</g>
	);
});

interface ProfileViewProps {
	plot: DesignPlot;
	plants: DesignPlant[];
	specFor: (speciesId: string) => PlantSpec;
	selectedId: string | null;
	onSelect: (id: string) => void;
}

export default function ProfileView({ plot, plants, specFor, selectedId, onSelect }: ProfileViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;
		const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const ordered = useMemo(
		() =>
			plants
				.map(plant => ({ plant, spec: specFor(plant.speciesId) }))
				// Más altas atrás; a igual altura, las más lejanas (y menor) atrás.
				.sort((a, b) => b.spec.height - a.spec.height || a.plant.y - b.plant.y),
		[plants, specFor]
	);

	const layout = useMemo(() => {
		let minX = 0;
		let maxX = plot.width;
		let maxH = 4;
		for (const { plant, spec } of ordered) {
			minX = Math.min(minX, plant.x - spec.crown / 2);
			maxX = Math.max(maxX, plant.x + spec.crown / 2);
			maxH = Math.max(maxH, spec.height);
		}
		maxH *= 1.08;
		const innerW = Math.max(1, width - MARGIN.left - MARGIN.right);
		let ppm = innerW / (maxX - minX);
		let svgHeight = maxH * ppm + MARGIN.top + MARGIN.bottom;
		if (svgHeight > MAX_HEIGHT) {
			ppm = (MAX_HEIGHT - MARGIN.top - MARGIN.bottom) / maxH;
			svgHeight = MAX_HEIGHT;
		}
		svgHeight = Math.max(MIN_HEIGHT, svgHeight);
		const usedW = (maxX - minX) * ppm;
		const ox = MARGIN.left + (innerW - usedW) / 2 - minX * ppm;
		const groundY = svgHeight - MARGIN.bottom;
		const step = niceStep(32 / ppm);
		const ticks: number[] = [];
		for (let h = 0; h * ppm <= groundY - MARGIN.top + 1e-6; h += step) ticks.push(h);
		return { scale: { ppm, ox, groundY }, svgHeight, ticks };
	}, [ordered, plot.width, width]);

	const { scale, svgHeight, ticks } = layout;
	const { ppm, ox, groundY } = scale;
	// Objeto estable mientras no cambie la escala, para no redibujar todas las siluetas.
	const stableScale = useMemo(() => ({ ppm, ox, groundY }), [ppm, ox, groundY]);

	return (
		<Box ref={containerRef} w="100%" borderWidth="1px" borderRadius="md" overflow="hidden" bg="bg.panel">
			{width > 0 && (
				<svg width={width} height={svgHeight} role="img" aria-label="Vista de perfil del diseño" style={{ display: 'block' }}>
					<g fontSize={10} fill={CANVAS_COLORS.textMuted}>
						{ticks.map(h => (
							<g key={h}>
								<line
									x1={MARGIN.left}
									x2={width - MARGIN.right}
									y1={scale.groundY - h * scale.ppm}
									y2={scale.groundY - h * scale.ppm}
									stroke={CANVAS_COLORS.grid}
									strokeDasharray={h === 0 ? undefined : '3 4'}
								/>
								<text x={MARGIN.left - 6} y={scale.groundY - h * scale.ppm + 3} textAnchor="end">
									{formatNumber(h, 1)} m
								</text>
							</g>
						))}
					</g>
					<rect x={MARGIN.left} y={scale.groundY} width={width - MARGIN.left - MARGIN.right} height={5} fill="#8d6e63" fillOpacity={0.7} />
					<line
						x1={scale.ox}
						x2={scale.ox + plot.width * scale.ppm}
						y1={scale.groundY + 12}
						y2={scale.groundY + 12}
						stroke={CANVAS_COLORS.plotStroke}
						strokeWidth={2}
					/>
					<text x={scale.ox} y={scale.groundY + 23} fontSize={10} fill={CANVAS_COLORS.textMuted}>
						0
					</text>
					<text x={scale.ox + plot.width * scale.ppm} y={scale.groundY + 23} fontSize={10} fill={CANVAS_COLORS.textMuted} textAnchor="end">
						{formatNumber(plot.width)} m
					</text>
					{ordered.map(({ plant, spec }) => (
						<Silhouette key={plant.id} plant={plant} spec={spec} selected={plant.id === selectedId} scale={stableScale} onSelect={onSelect} />
					))}
				</svg>
			)}
		</Box>
	);
}

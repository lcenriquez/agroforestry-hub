import { useRef, useState } from 'react';

import { Box, Button, HStack, IconButton, Input, Slider, Stack, Text } from '@chakra-ui/react';
import {
	ArrowsOutCardinalIcon,
	EyeIcon,
	EyeSlashIcon,
	ImageIcon,
	LockSimpleIcon,
	LockSimpleOpenIcon,
	PlantIcon,
	RulerIcon,
	TrashIcon
} from '@phosphor-icons/react';

import { backgroundSize } from './background';
import { formatNumber } from './strata';

import type { DesignBackground, DesignLayerId, DesignLayers, DesignLayerState } from '../../interfaces/Design';
import type { DesignerTool } from './PlanView';

// Panel de capas del plano: imagen de fondo (foto aérea/plano calibrado) y
// plantas. Cada capa se puede ocultar, bloquear y hacer más o menos opaca.

interface LayersPanelProps {
	layers: DesignLayers;
	onLayerChange: (id: DesignLayerId, change: Partial<DesignLayerState>) => void;
	background: DesignBackground | null;
	onPickImage: (file: File) => void;
	onRemoveBackground: () => void;
	onFitPlotToImage: () => void;
	loadingImage: boolean;
	tool: DesignerTool;
	onToolChange: (tool: DesignerTool) => void;
	calibrationCount: number;
	onCalibrate: (meters: number) => void;
	onCancelCalibration: () => void;
}

function LayerRow({
	icon,
	label,
	state,
	onChange,
	children
}: {
	icon: React.ReactNode;
	label: string;
	state: DesignLayerState;
	onChange: (change: Partial<DesignLayerState>) => void;
	children?: React.ReactNode;
}) {
	return (
		<Box borderWidth="1px" borderRadius="md" p={2}>
			<HStack gap={2}>
				<Box display="inline-flex" color="fg.muted">
					{icon}
				</Box>
				<Text fontSize="sm" fontWeight="medium" flex={1} opacity={state.visible ? 1 : 0.5}>
					{label}
				</Text>
				<IconButton
					size="2xs"
					variant="ghost"
					aria-label={state.visible ? `Ocultar ${label}` : `Mostrar ${label}`}
					title={state.visible ? 'Ocultar capa' : 'Mostrar capa'}
					onClick={() => onChange({ visible: !state.visible })}
				>
					{state.visible ? <EyeIcon /> : <EyeSlashIcon />}
				</IconButton>
				<IconButton
					size="2xs"
					variant="ghost"
					aria-label={state.locked ? `Desbloquear ${label}` : `Bloquear ${label}`}
					title={state.locked ? 'Desbloquear capa' : 'Bloquear capa (evita moverla por accidente)'}
					onClick={() => onChange({ locked: !state.locked })}
				>
					{state.locked ? <LockSimpleIcon /> : <LockSimpleOpenIcon />}
				</IconButton>
			</HStack>
			<HStack gap={2} mt={1}>
				<Text fontSize="xs" color="fg.muted" w="64px">
					Opacidad
				</Text>
				<Slider.Root
					flex={1}
					size="sm"
					min={5}
					max={100}
					step={5}
					value={[Math.round(state.opacity * 100)]}
					onValueChange={details => onChange({ opacity: details.value[0] / 100 })}
					// Chakra/Ark espera una etiqueta por cada thumb.
					// eslint-disable-next-line jsx-a11y/aria-proptypes
					aria-label={[`Opacidad de ${label}`]}
				>
					<Slider.Control>
						<Slider.Track>
							<Slider.Range />
						</Slider.Track>
						<Slider.Thumbs />
					</Slider.Control>
				</Slider.Root>
				<Text fontSize="xs" w="34px" textAlign="right">
					{Math.round(state.opacity * 100)}%
				</Text>
			</HStack>
			{children}
		</Box>
	);
}

export default function LayersPanel({
	layers,
	onLayerChange,
	background,
	onPickImage,
	onRemoveBackground,
	onFitPlotToImage,
	loadingImage,
	tool,
	onToolChange,
	calibrationCount,
	onCalibrate,
	onCancelCalibration
}: LayersPanelProps) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [distance, setDistance] = useState('');
	const size = background ? backgroundSize(background) : null;
	const editable = Boolean(background && layers.background.visible && !layers.background.locked);
	const meters = Number(distance.replace(',', '.'));

	return (
		<Stack gap={2}>
			<input
				ref={fileRef}
				type="file"
				accept="image/*"
				hidden
				onChange={event => {
					const file = event.target.files?.[0];
					event.target.value = '';
					if (file) onPickImage(file);
				}}
			/>

			<LayerRow icon={<PlantIcon />} label="Plantas" state={layers.plants} onChange={change => onLayerChange('plants', change)} />

			<LayerRow icon={<ImageIcon />} label="Imagen de fondo" state={layers.background} onChange={change => onLayerChange('background', change)}>
				{background && size ? (
					<Stack gap={2} mt={2}>
						<Text fontSize="xs" color="fg.muted">
							{formatNumber(size.width, 1)} × {formatNumber(size.height, 1)} m · {formatNumber(background.metersPerPixel * 100, 2)} cm por píxel
							{background.src.startsWith('data:') ? ' · se subirá al guardar en la nube' : ''}
						</Text>
						<HStack gap={1} flexWrap="wrap">
							<Button
								size="2xs"
								variant={tool === 'calibrate' ? 'solid' : 'outline'}
								colorPalette="green"
								disabled={!editable}
								onClick={() => onToolChange(tool === 'calibrate' ? 'select' : 'calibrate')}
							>
								<RulerIcon /> Calibrar escala
							</Button>
							<Button
								size="2xs"
								variant={tool === 'moveBackground' ? 'solid' : 'outline'}
								colorPalette="green"
								disabled={!editable}
								onClick={() => onToolChange(tool === 'moveBackground' ? 'select' : 'moveBackground')}
							>
								<ArrowsOutCardinalIcon /> Mover
							</Button>
							<Button size="2xs" variant="outline" onClick={onFitPlotToImage} title="Usa las medidas de la imagen como medidas del terreno">
								Terreno = imagen
							</Button>
							<Button size="2xs" variant="outline" disabled={loadingImage} onClick={() => fileRef.current?.click()}>
								Cambiar
							</Button>
							<IconButton size="2xs" variant="ghost" colorPalette="red" aria-label="Quitar imagen de fondo" onClick={onRemoveBackground}>
								<TrashIcon />
							</IconButton>
						</HStack>
						{tool === 'calibrate' && (
							<Box bg="bg.subtle" borderRadius="sm" p={2}>
								{calibrationCount < 2 ? (
									<Text fontSize="xs">
										Toca en el plano dos puntos de la imagen cuya distancia real conozcas (p. ej. dos postes o las esquinas de la casa).
										{calibrationCount === 1 ? ' Falta el segundo punto.' : ''}
									</Text>
								) : (
									<Stack gap={2}>
										<Text fontSize="xs">Distancia real entre los dos puntos:</Text>
										<HStack gap={1}>
											<Input
												size="xs"
												inputMode="decimal"
												placeholder="p. ej. 12.5"
												value={distance}
												onChange={event => setDistance(event.target.value)}
												aria-label="Distancia real en metros"
											/>
											<Text fontSize="xs">m</Text>
											<Button
												size="xs"
												colorPalette="green"
												disabled={!(meters > 0)}
												onClick={() => {
													onCalibrate(meters);
													setDistance('');
												}}
											>
												Aplicar
											</Button>
										</HStack>
									</Stack>
								)}
								<Button size="2xs" variant="plain" px={0} mt={1} onClick={onCancelCalibration}>
									{calibrationCount ? 'Volver a marcar' : 'Cancelar'}
								</Button>
							</Box>
						)}
					</Stack>
				) : (
					<Stack gap={2} mt={2}>
						<Text fontSize="xs" color="fg.muted">
							Sube una foto aérea (dron, Google Earth) o un plano de tu terreno para diseñar encima. Después calíbrala con una distancia conocida.
						</Text>
						<Button size="xs" variant="outline" loading={loadingImage} onClick={() => fileRef.current?.click()}>
							<ImageIcon /> Subir imagen
						</Button>
					</Stack>
				)}
			</LayerRow>
		</Stack>
	);
}

import NextLink from 'next/link';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import {
	Alert,
	Badge,
	Box,
	Button,
	CloseButton,
	Grid,
	Group,
	Heading,
	HStack,
	Input,
	Link,
	Menu,
	Portal,
	Stack,
	Text,
	Textarea
} from '@chakra-ui/react';
import { CloudArrowUpIcon, DownloadSimpleIcon, FilePlusIcon, FolderOpenIcon, UploadSimpleIcon } from '@phosphor-icons/react';

import { createDesign, updateDesign } from '../../adapters/designs';
import { uploadDesignBackground } from '../../adapters/storage';
import { useAuth } from '../../contexts/AuthContext';
import { MAX_DESIGN_NAME_LENGTH, MAX_DESIGN_PLANTS } from '../../interfaces/Design';
import { analyzeDesign, buildFunctionCatalog, buildSuggestions } from './analysis';
import AnalysisPanel from './AnalysisPanel';
import { calibrateBackground, dataUrlToBlob, initialBackground, normalizeBackground, normalizeLayers, readBackgroundFile } from './background';
import DesignToolbar from './DesignToolbar';
import { loadDraft, loadPrefs, saveDraft, savePrefs } from './draftStorage';
import { buildPlanSvg, designToJson, downloadBlob, parseDesignJson, slugify, svgToPngBlob } from './exporters';
import LayersPanel from './LayersPanel';
import PlantInspector from './PlantInspector';
import PlanView from './PlanView';
import PlotSettings from './PlotSettings';
import ProfileView from './ProfileView';
import SavedDesignsDialog from './SavedDesignsDialog';
import SpeciesPalette, { StratumDot } from './SpeciesPalette';
import { buildPlantSpec, buildStrata, missingPlantSpec } from './strata';
import { DEFAULT_PLOT, emptyContent, newPlantId, PLOT_MAX, PLOT_MIN, useDesignState } from './useDesignState';

import type { Design, DesignContent, DesignLayerId, DesignLayers, DesignLayerState, DesignPlant } from '../../interfaces/Design';
import type { SpeciesType } from '../../interfaces/Species';
import type { DesignerTool } from './PlanView';
import type { PlantSpec } from './strata';

const DEFAULT_NAME = 'Mi diseño de SAF';

type MobilePanel = 'catalogo' | 'diseno' | 'analisis';
type StatusMessage = { type: 'success' | 'error' | 'info' | 'warning'; text: string };

function snapshotOf(name: string, description: string, content: DesignContent): string {
	return JSON.stringify({ name: name.trim(), description: description.trim(), content });
}

// Normaliza un diseño leído de Firestore (datos que pudieron editarse a mano).
function contentFromDesign(design: Design): DesignContent {
	const width = Number(design.plot?.width);
	const length = Number(design.plot?.length);
	const plants: DesignPlant[] = (Array.isArray(design.plants) ? design.plants : [])
		.filter(p => p && typeof p.speciesId === 'string' && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)))
		.slice(0, MAX_DESIGN_PLANTS)
		.map(p => ({ id: typeof p.id === 'string' && p.id ? p.id : newPlantId(), speciesId: p.speciesId, x: Number(p.x), y: Number(p.y) }));
	return {
		plot: {
			width: Number.isFinite(width) ? Math.min(PLOT_MAX, Math.max(PLOT_MIN, width)) : DEFAULT_PLOT.width,
			length: Number.isFinite(length) ? Math.min(PLOT_MAX, Math.max(PLOT_MIN, length)) : DEFAULT_PLOT.length
		},
		plants,
		background: normalizeBackground(design.background)
	};
}

function Panel({ title, children, ...rest }: { title: string; children: React.ReactNode } & React.ComponentProps<typeof Box>) {
	return (
		<Box borderWidth="1px" borderRadius="md" p={3} {...rest}>
			<Heading size="sm" mb={3}>
				{title}
			</Heading>
			{children}
		</Box>
	);
}

export default function DesignerWorkspace({ species }: { species: SpeciesType[] }) {
	const { authUser, loading: authLoading } = useAuth();

	// Este componente sólo se monta en el cliente (después de cargar el
	// catálogo), así que leer localStorage en los inicializadores es seguro.
	const [initial] = useState(() => ({ draft: loadDraft(), prefs: loadPrefs() }));
	const { content, dispatch, undo, redo, canUndo, canRedo } = useDesignState(initial.draft?.content);
	const { plot, plants } = content;

	const [name, setName] = useState(initial.draft?.name || DEFAULT_NAME);
	const [description, setDescription] = useState(initial.draft?.description ?? '');
	const [cloud, setCloud] = useState<{ id: string; owner: string } | null>(
		initial.draft?.cloudId && initial.draft.cloudOwner ? { id: initial.draft.cloudId, owner: initial.draft.cloudOwner } : null
	);
	const [cloudSnapshot, setCloudSnapshot] = useState<string | null>(initial.draft?.cloudSnapshot ?? null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [tool, setTool] = useState<DesignerTool>('select');
	const [activeSpeciesId, setActiveSpeciesId] = useState<string | null>(null);
	const [showGrid, setShowGrid] = useState(initial.prefs.showGrid ?? true);
	const [snap, setSnap] = useState(initial.prefs.snap ?? false);
	const [gridSpacing, setGridSpacing] = useState(initial.prefs.gridSpacing ?? 1);
	const [lineSpacing, setLineSpacing] = useState(3);
	const [loadCount, setLoadCount] = useState(0);
	const [mobilePanel, setMobilePanel] = useState<MobilePanel>('diseno');
	const [showOnboarding, setShowOnboarding] = useState(!initial.prefs.hideOnboarding);
	const [status, setStatus] = useState<StatusMessage | null>(null);
	const [localSaved, setLocalSaved] = useState<boolean | null>(null);
	const [saving, setSaving] = useState(false);
	const [savedOpen, setSavedOpen] = useState(false);
	const [layers, setLayers] = useState<DesignLayers>(() => normalizeLayers(initial.draft?.layers));
	const [calibrationPoints, setCalibrationPoints] = useState<{ x: number; y: number }[]>([]);
	const [loadingImage, setLoadingImage] = useState(false);
	const background = content.background ?? null;
	const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);

	// --- Catálogo -----------------------------------------------------------
	const strata = useMemo(() => buildStrata(species), [species]);
	const specs = useMemo(() => {
		const strataById = new Map(strata.map(s => [s._id, s]));
		return new Map(species.map(sp => [sp._id, buildPlantSpec(sp, strataById)]));
	}, [species, strata]);
	const specFor = useCallback((speciesId: string): PlantSpec => specs.get(speciesId) ?? missingPlantSpec(speciesId), [specs]);
	const functionCatalog = useMemo(() => buildFunctionCatalog(species), [species]);
	const catalogSpecs = useMemo(() => [...specs.values()], [specs]);
	const activeSpec = activeSpeciesId ? (specs.get(activeSpeciesId) ?? null) : null;

	// --- Análisis (diferido para no frenar el arrastre) ----------------------
	const deferredContent = useDeferredValue(content);
	const analysis = useMemo(
		() => analyzeDesign(deferredContent.plot, deferredContent.plants, specFor, strata, functionCatalog),
		[deferredContent, specFor, strata, functionCatalog]
	);
	const suggestions = useMemo(() => buildSuggestions(analysis, catalogSpecs), [analysis, catalogSpecs]);
	const flaggedIds = useMemo(() => {
		const ids = new Set<string>(analysis.outside);
		for (const issue of analysis.overlaps) {
			ids.add(issue.a);
			ids.add(issue.b);
		}
		return ids;
	}, [analysis]);
	const alertCount = analysis.missingStrata.length + analysis.overlaps.length + analysis.outside.length + analysis.missingSpeciesPlants.length;

	const plantsById = useMemo(() => new Map(plants.map(p => [p.id, p])), [plants]);
	const selectedPlant = selectedId ? (plantsById.get(selectedId) ?? null) : null;
	// Para el análisis (diferido) basta con el índice diferido: no cambia en cada cuadro de un arrastre.
	const deferredPlantsById = useMemo(() => new Map(deferredContent.plants.map(p => [p.id, p])), [deferredContent]);
	const nameOfPlant = useCallback(
		(plantId: string) => {
			const plant = deferredPlantsById.get(plantId);
			return plant ? specFor(plant.speciesId).name : 'Planta';
		},
		[deferredPlantsById, specFor]
	);

	// --- Guardado -----------------------------------------------------------
	const snapshot = useMemo(() => snapshotOf(name, description, deferredContent), [name, description, deferredContent]);
	const cloudOwnedByUser = Boolean(cloud && authUser && cloud.owner === authUser.uid);
	const cloudDirty = cloudOwnedByUser ? snapshot !== cloudSnapshot : plants.length > 0;

	useEffect(() => {
		const timer = setTimeout(() => {
			const draft = {
				name,
				description: description || undefined,
				content,
				layers,
				cloudId: cloud?.id ?? null,
				cloudOwner: cloud?.owner ?? null,
				cloudSnapshot,
				savedAt: Date.now()
			};
			let ok = saveDraft(draft);
			// Una foto aún no subida (data URL) puede no caber en localStorage:
			// se guarda el resto del borrador sin ella.
			if (!ok && content.background?.src.startsWith('data:')) ok = saveDraft({ ...draft, content: { ...content, background: null } });
			setLocalSaved(ok);
		}, 400);
		return () => clearTimeout(timer);
	}, [name, description, content, layers, cloud, cloudSnapshot]);

	useEffect(() => {
		savePrefs({ hideOnboarding: !showOnboarding, showGrid, snap, gridSpacing });
	}, [showOnboarding, showGrid, snap, gridSpacing]);

	useEffect(
		() => () => {
			if (statusTimer.current) clearTimeout(statusTimer.current);
		},
		[]
	);

	const showStatus = useCallback((message: StatusMessage) => {
		setStatus(message);
		if (statusTimer.current) clearTimeout(statusTimer.current);
		statusTimer.current = setTimeout(() => setStatus(null), 5000);
	}, []);

	// --- Acciones sobre el diseño -------------------------------------------
	const pickSpecies = useCallback((speciesId: string) => {
		setActiveSpeciesId(speciesId);
		setTool(current => (current === 'line' ? 'line' : 'plant'));
		setSelectedId(null);
		setMobilePanel('diseno');
	}, []);

	const placePlants = useCallback(
		(points: { x: number; y: number }[]) => {
			if (!activeSpeciesId || !points.length) return;
			const room = MAX_DESIGN_PLANTS - plants.length;
			if (room <= 0) {
				showStatus({ type: 'warning', text: `Llegaste al máximo de ${MAX_DESIGN_PLANTS} plantas por diseño.` });
				return;
			}
			if (points.length > room)
				showStatus({ type: 'warning', text: `Sólo se plantaron ${room}: el máximo es ${MAX_DESIGN_PLANTS} plantas por diseño.` });
			dispatch({
				type: 'addPlants',
				plants: points.slice(0, room).map(point => ({ id: newPlantId(), speciesId: activeSpeciesId, x: point.x, y: point.y }))
			});
		},
		[activeSpeciesId, plants.length, dispatch, showStatus]
	);

	const removeMissing = useCallback(
		() => dispatch({ type: 'removePlants', ids: analysis.missingSpeciesPlants }),
		[analysis.missingSpeciesPlants, dispatch]
	);
	const handleDragStart = useCallback(() => dispatch({ type: 'beginDrag' }), [dispatch]);
	const handleDragMove = useCallback((id: string, x: number, y: number) => dispatch({ type: 'movePlants', moves: [{ id, x, y }] }), [dispatch]);
	const handleDragEnd = useCallback(() => dispatch({ type: 'endDrag' }), [dispatch]);
	const handleBackgroundMove = useCallback((x: number, y: number) => dispatch({ type: 'moveBackground', x, y }), [dispatch]);

	// --- Capas e imagen de fondo -------------------------------------------
	const changeTool = useCallback((next: DesignerTool) => {
		setTool(next);
		setCalibrationPoints([]);
	}, []);

	function handleLayerChange(id: DesignLayerId, change: Partial<DesignLayerState>) {
		setLayers(current => ({ ...current, [id]: { ...current[id], ...change } }));
		if ((change.visible === false || change.locked === true) && id === 'background' && (tool === 'calibrate' || tool === 'moveBackground'))
			changeTool('select');
		if ((change.visible === false || change.locked === true) && id === 'plants') setSelectedId(null);
	}

	async function handlePickImage(file: File) {
		setLoadingImage(true);
		try {
			const image = await readBackgroundFile(file);
			const next = background
				? { ...background, ...image, metersPerPixel: (background.metersPerPixel * background.naturalWidth) / image.naturalWidth }
				: initialBackground(image, plot);
			dispatch({ type: 'setBackground', background: { ...next, storagePath: undefined } });
			setLayers(current => ({ ...current, background: { ...current.background, visible: true } }));
			changeTool('calibrate');
			showStatus({ type: 'info', text: 'Imagen cargada. Calíbrala: marca dos puntos con una distancia conocida.' });
		} catch (error) {
			showStatus({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo cargar la imagen.' });
		} finally {
			setLoadingImage(false);
		}
	}

	function handleCalibrationPoint(point: { x: number; y: number }) {
		setCalibrationPoints(current => (current.length >= 2 ? [point] : [...current, point]));
	}

	function handleCalibrate(meters: number) {
		if (!background || calibrationPoints.length < 2) return;
		dispatch({ type: 'setBackground', background: calibrateBackground(background, calibrationPoints[0], calibrationPoints[1], meters) });
		changeTool('select');
		showStatus({ type: 'success', text: 'Escala calibrada. Ahora las copas se ven a tamaño real sobre la imagen.' });
	}

	function handleFitPlotToImage() {
		if (!background) return;
		const width = Math.min(PLOT_MAX, Math.max(PLOT_MIN, Math.round(background.naturalWidth * background.metersPerPixel * 10) / 10));
		const length = Math.min(PLOT_MAX, Math.max(PLOT_MIN, Math.round(background.naturalHeight * background.metersPerPixel * 10) / 10));
		dispatch({ type: 'setBackground', background: { ...background, x: 0, y: 0 } });
		dispatch({ type: 'setPlot', plot: { width, length } });
	}
	const selectPlant = useCallback((id: string | null) => setSelectedId(id), []);
	const focusPlant = useCallback((id: string) => {
		setSelectedId(id);
		setTool('select');
		setMobilePanel('diseno');
	}, []);

	const deleteSelected = useCallback(() => {
		if (!selectedId) return;
		dispatch({ type: 'removePlants', ids: [selectedId] });
		setSelectedId(null);
	}, [selectedId, dispatch]);

	const duplicateSelected = useCallback(() => {
		if (!selectedPlant) return;
		if (plants.length >= MAX_DESIGN_PLANTS) {
			showStatus({ type: 'warning', text: `Llegaste al máximo de ${MAX_DESIGN_PLANTS} plantas por diseño.` });
			return;
		}
		const offset = Math.max(0.5, specFor(selectedPlant.speciesId).crown / 2);
		const copy = { id: newPlantId(), speciesId: selectedPlant.speciesId, x: selectedPlant.x + offset, y: selectedPlant.y + offset };
		dispatch({ type: 'addPlants', plants: [copy] });
		setSelectedId(copy.id);
	}, [selectedPlant, plants.length, specFor, dispatch, showStatus]);

	function loadContent(
		next: DesignContent,
		meta: { name: string; description?: string; cloud: { id: string; owner: string } | null; snapshot: string | null; layers?: unknown }
	) {
		dispatch({ type: 'load', content: next });
		setLayers(normalizeLayers(meta.layers));
		setCalibrationPoints([]);
		setName(meta.name);
		setDescription(meta.description ?? '');
		setCloud(meta.cloud);
		setCloudSnapshot(meta.snapshot);
		setSelectedId(null);
		setLoadCount(count => count + 1);
	}

	function handleNew() {
		if (plants.length > 0 && cloudDirty && !window.confirm('¿Empezar un diseño nuevo? Los cambios que no guardaste se perderán.')) return;
		loadContent(emptyContent(), { name: DEFAULT_NAME, cloud: null, snapshot: null });
		setTool('select');
		showStatus({ type: 'info', text: 'Nuevo diseño listo.' });
	}

	function handleOpenDesign(design: Design) {
		if (!authUser) return;
		if (
			plants.length > 0 &&
			cloudDirty &&
			cloud?.id !== design._id &&
			!window.confirm('Tienes cambios sin guardar en la nube. ¿Abrir otro diseño de todos modos?')
		)
			return;
		const next = contentFromDesign(design);
		const designName = design.name || DEFAULT_NAME;
		const designDescription = design.description ?? '';
		loadContent(next, {
			name: designName,
			description: designDescription,
			cloud: { id: design._id, owner: authUser.uid },
			snapshot: snapshotOf(designName, designDescription, next),
			layers: design.layers
		});
		setSavedOpen(false);
		const missing = next.plants.filter(p => !specs.has(p.speciesId)).length;
		showStatus(
			missing
				? { type: 'warning', text: `Abriste "${designName}". ${missing} planta(s) son de especies que ya no están en el catálogo.` }
				: { type: 'success', text: `Abriste "${designName}".` }
		);
	}

	function handleRenamed(id: string, newName: string) {
		if (cloud?.id !== id) return;
		const wasClean = !cloudDirty;
		setName(newName);
		if (wasClean) setCloudSnapshot(snapshotOf(newName, description, content));
	}

	function handleDeleted(id: string) {
		if (cloud?.id !== id) return;
		setCloud(null);
		setCloudSnapshot(null);
		showStatus({ type: 'info', text: 'Borraste el diseño abierto de la nube; sigue aquí como borrador local.' });
	}

	async function handleSaveCloud() {
		if (!authUser) return;
		const trimmedName = name.trim().slice(0, MAX_DESIGN_NAME_LENGTH) || DEFAULT_NAME;
		const trimmedDescription = description.trim().slice(0, 2000);
		const now = Date.now();
		setSaving(true);
		try {
			let savedContent = content;
			if (background?.src.startsWith('data:')) {
				const uploaded = await uploadDesignBackground(authUser.uid, dataUrlToBlob(background.src));
				dispatch({ type: 'replaceBackgroundSrc', from: background.src, src: uploaded.url, storagePath: uploaded.path });
				savedContent = { ...content, background: { ...background, src: uploaded.url, storagePath: uploaded.path } };
			}
			const data = {
				name: trimmedName,
				description: trimmedDescription || undefined,
				plot,
				plants,
				background: savedContent.background ?? null,
				layers,
				updatedAt: now
			};
			let id = cloudOwnedByUser ? cloud!.id : null;
			if (id) {
				try {
					await updateDesign(id, data);
				} catch (error) {
					// Si se borró desde otro lado, se vuelve a crear.
					if ((error as { code?: string }).code !== 'not-found') throw error;
					id = null;
				}
			}
			if (!id) id = await createDesign({ ...data, authorId: authUser.uid, createdAt: now });
			setName(trimmedName);
			setDescription(trimmedDescription);
			setCloud({ id, owner: authUser.uid });
			setCloudSnapshot(snapshotOf(trimmedName, trimmedDescription, savedContent));
			showStatus({ type: 'success', text: 'Diseño guardado en la nube.' });
		} catch (error) {
			console.log(error);
			showStatus({ type: 'error', text: 'No se pudo guardar en la nube. Revisa tu conexión e inténtalo de nuevo.' });
		} finally {
			setSaving(false);
		}
	}

	// --- Exportar / importar ------------------------------------------------
	async function handleExport(kind: string) {
		const fileBase = slugify(name);
		try {
			if (kind === 'json') {
				downloadBlob(new Blob([designToJson(name, description, content, specFor, layers)], { type: 'application/json' }), `${fileBase}.json`);
				return;
			}
			const { svg, width, height } = buildPlanSvg({ name, plot, plants, specFor, strata, gridSpacing: showGrid ? gridSpacing : null });
			if (kind === 'svg') downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${fileBase}.svg`);
			else downloadBlob(await svgToPngBlob(svg, width, height), `${fileBase}.png`);
		} catch (error) {
			showStatus({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo exportar el diseño.' });
		}
	}

	async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		try {
			if (file.size > 20_000_000) throw new Error('El archivo es demasiado grande.');
			const imported = parseDesignJson(await file.text());
			if (
				plants.length > 0 &&
				cloudDirty &&
				!window.confirm('¿Reemplazar el diseño actual por el importado? Los cambios que no guardaste se perderán.')
			)
				return;
			loadContent(imported.content, { name: imported.name, description: imported.description, cloud: null, snapshot: null, layers: imported.layers });
			const missing = imported.content.plants.filter(p => !specs.has(p.speciesId)).length;
			showStatus({
				type: missing ? 'warning' : 'success',
				text: `Importaste "${imported.name}" (${imported.content.plants.length} plantas)${missing ? `; ${missing} son de especies que no están en el catálogo` : ''}.`
			});
		} catch (error) {
			showStatus({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo importar el archivo.' });
		}
	}

	// --- Atajos de teclado --------------------------------------------------
	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null;
			if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
			if (document.querySelector('[role="dialog"][data-state="open"], [role="menu"][data-state="open"]')) return;
			const mod = event.ctrlKey || event.metaKey;
			const key = event.key.toLowerCase();
			if (mod && key === 'z') {
				event.preventDefault();
				if (event.shiftKey) redo();
				else undo();
			} else if (mod && key === 'y') {
				event.preventDefault();
				redo();
			} else if (mod && key === 'd') {
				if (!selectedId) return;
				event.preventDefault();
				duplicateSelected();
			} else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
				event.preventDefault();
				deleteSelected();
			} else if (event.key === 'Escape') {
				setSelectedId(null);
			} else if (!mod && !event.altKey) {
				if (key === 'v') setTool('select');
				else if (key === 'p') setTool('plant');
				else if (key === 'l') setTool('line');
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [undo, redo, selectedId, deleteSelected, duplicateSelected]);

	const fitKey = `${plot.width}x${plot.length}#${loadCount}`;
	const panelDisplay = (panel: MobilePanel, display: string) => ({ base: mobilePanel === panel ? display : 'none', lg: display });

	return (
		<Stack gap={4}>
			{showOnboarding && (
				<Alert.Root status="info" variant="subtle">
					<Alert.Indicator />
					<Alert.Content>
						<Alert.Title>Cómo empezar</Alert.Title>
						<Alert.Description>
							<Text>
								1. Define tu terreno · 2. Elige una especie · 3. Haz clic (o toca) en el terreno para plantar. Arrastra para mover, usa la rueda o
								pellizca para hacer zoom. El análisis se actualiza en vivo.{' '}
								<Link asChild color="green.fg" fontWeight="medium">
									<NextLink href="/saf">Aprende sobre los estratos de un SAF</NextLink>
								</Link>
							</Text>
						</Alert.Description>
					</Alert.Content>
					<CloseButton size="sm" alignSelf="start" onClick={() => setShowOnboarding(false)} aria-label="Cerrar ayuda" />
				</Alert.Root>
			)}

			<Stack direction={{ base: 'column', md: 'row' }} gap={2} justify="space-between" align={{ base: 'stretch', md: 'center' }}>
				<Input
					value={name}
					maxLength={MAX_DESIGN_NAME_LENGTH}
					onChange={event => setName(event.target.value)}
					aria-label="Nombre del diseño"
					placeholder="Nombre del diseño"
					fontWeight="semibold"
					maxW={{ md: '360px' }}
				/>
				<HStack gap={2} flexWrap="wrap">
					{authUser && (
						<>
							<Button size="sm" colorPalette="green" onClick={handleSaveCloud} loading={saving}>
								<CloudArrowUpIcon /> Guardar
							</Button>
							<Button size="sm" variant="outline" onClick={() => setSavedOpen(true)}>
								<FolderOpenIcon /> Mis diseños
							</Button>
						</>
					)}
					<Button size="sm" variant="outline" onClick={handleNew}>
						<FilePlusIcon /> Nuevo
					</Button>
					<Menu.Root onSelect={details => handleExport(details.value)}>
						<Menu.Trigger asChild>
							<Button size="sm" variant="outline">
								<DownloadSimpleIcon /> Exportar
							</Button>
						</Menu.Trigger>
						<Portal>
							<Menu.Positioner>
								<Menu.Content>
									<Menu.Item value="png">Imagen PNG (vista en planta)</Menu.Item>
									<Menu.Item value="svg">Imagen SVG (vista en planta)</Menu.Item>
									<Menu.Item value="json">Archivo JSON (respaldo)</Menu.Item>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
					<Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
						<UploadSimpleIcon /> Importar
					</Button>
					<input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
				</HStack>
			</Stack>

			<Text fontSize="sm" color="fg.muted" mt={-2}>
				{authLoading ? null : authUser ? (
					cloudOwnedByUser ? (
						cloudDirty ? (
							<>Hay cambios sin guardar en la nube.</>
						) : (
							<>Guardado en la nube.</>
						)
					) : (
						<>Aún no guardas este diseño en la nube.</>
					)
				) : (
					<>
						Tu diseño se guarda automáticamente en este navegador.{' '}
						<Link asChild color="green.fg" fontWeight="medium">
							<NextLink href="/signin">Inicia sesión</NextLink>
						</Link>{' '}
						para guardarlo en la nube y abrirlo desde cualquier dispositivo.
					</>
				)}{' '}
				{localSaved === false && 'No se pudo guardar el borrador en este navegador (almacenamiento no disponible).'}
			</Text>

			{status && (
				<Alert.Root status={status.type} variant="subtle" py={2}>
					<Alert.Indicator />
					<Alert.Title fontWeight="normal">{status.text}</Alert.Title>
				</Alert.Root>
			)}

			<Group attached w="100%" display={{ base: 'flex', lg: 'none' }}>
				{(
					[
						['catalogo', 'Terreno y especies'],
						['diseno', 'Diseño'],
						['analisis', 'Análisis']
					] as [MobilePanel, string][]
				).map(([panel, label]) => (
					<Button
						key={panel}
						flex={1}
						size="sm"
						variant={mobilePanel === panel ? 'solid' : 'outline'}
						colorPalette="green"
						onClick={() => setMobilePanel(panel)}
						px={1}
					>
						{label}
						{panel === 'analisis' && alertCount > 0 && (
							<Badge size="xs" colorPalette="orange" variant="solid">
								{alertCount}
							</Badge>
						)}
					</Button>
				))}
			</Group>

			<Grid
				templateColumns={{ base: 'minmax(0, 1fr)', lg: '250px minmax(0, 1fr) 290px', xl: '280px minmax(0, 1fr) 320px' }}
				gap={4}
				alignItems="start"
			>
				<Stack gap={4} display={panelDisplay('catalogo', 'flex')} minW={0}>
					<Panel title="Terreno">
						<PlotSettings
							plot={plot}
							onPlotChange={next => dispatch({ type: 'setPlot', plot: next })}
							showGrid={showGrid}
							onShowGridChange={setShowGrid}
							gridSpacing={gridSpacing}
							onGridSpacingChange={setGridSpacing}
							snap={snap}
							onSnapChange={setSnap}
						/>
						<Textarea
							mt={3}
							size="sm"
							rows={2}
							value={description}
							maxLength={2000}
							onChange={event => setDescription(event.target.value)}
							placeholder="Notas del diseño (opcional)"
							aria-label="Notas del diseño"
						/>
					</Panel>
					<Panel title="Capas">
						<LayersPanel
							layers={layers}
							onLayerChange={handleLayerChange}
							background={background}
							onPickImage={handlePickImage}
							onRemoveBackground={() => {
								dispatch({ type: 'setBackground', background: null });
								if (tool === 'calibrate' || tool === 'moveBackground') changeTool('select');
							}}
							onFitPlotToImage={handleFitPlotToImage}
							loadingImage={loadingImage}
							tool={tool}
							onToolChange={changeTool}
							calibrationCount={calibrationPoints.length}
							onCalibrate={handleCalibrate}
							onCancelCalibration={() => setCalibrationPoints([])}
						/>
					</Panel>
					<Panel title="Especies">
						<SpeciesPalette species={species} specs={specs} strata={strata} activeSpeciesId={activeSpeciesId} onPick={pickSpecies} />
					</Panel>
				</Stack>

				<Stack gap={3} display={panelDisplay('diseno', 'flex')} minW={0}>
					<DesignToolbar
						tool={tool}
						onToolChange={changeTool}
						lineSpacing={lineSpacing}
						onLineSpacingChange={setLineSpacing}
						canUndo={canUndo}
						canRedo={canRedo}
						onUndo={undo}
						onRedo={redo}
					/>
					{tool !== 'select' && (
						<HStack fontSize="sm" gap={2} flexWrap="wrap">
							{activeSpec ? (
								<>
									<Text color="fg.muted">Plantando:</Text>
									<StratumDot color={activeSpec.stratum.color} />
									<Text fontWeight="medium">{activeSpec.name}</Text>
								</>
							) : (
								<Text color="fg.muted">Ninguna especie elegida.</Text>
							)}
							<Button size="2xs" variant="outline" display={{ lg: 'none' }} onClick={() => setMobilePanel('catalogo')}>
								{activeSpec ? 'Cambiar especie' : 'Elegir especie'}
							</Button>
						</HStack>
					)}
					<PlanView
						plot={plot}
						plants={plants}
						specFor={specFor}
						selectedId={selectedId}
						flaggedIds={flaggedIds}
						tool={tool}
						activeSpec={activeSpec}
						showGrid={showGrid}
						gridSpacing={gridSpacing}
						snap={snap}
						lineSpacing={lineSpacing}
						fitKey={fitKey}
						onSelect={selectPlant}
						onPlace={placePlants}
						onDragStart={handleDragStart}
						onDragMove={handleDragMove}
						onDragEnd={handleDragEnd}
						background={background}
						layers={layers}
						calibrationPoints={tool === 'calibrate' ? calibrationPoints : []}
						onCalibrationPoint={handleCalibrationPoint}
						onBackgroundDragStart={handleDragStart}
						onBackgroundMove={handleBackgroundMove}
						onBackgroundDragEnd={handleDragEnd}
					/>
					{selectedPlant ? (
						<PlantInspector
							plant={selectedPlant}
							spec={specFor(selectedPlant.speciesId)}
							onMove={(x, y) => dispatch({ type: 'movePlants', moves: [{ id: selectedPlant.id, x, y }] })}
							onDuplicate={duplicateSelected}
							onDelete={deleteSelected}
							onUseSpecies={() => pickSpecies(selectedPlant.speciesId)}
						/>
					) : (
						<Text fontSize="xs" color="fg.muted">
							{plants.length === 0
								? 'Elige una especie en la paleta y haz clic en el terreno para plantarla.'
								: 'Con «Seleccionar» toca una planta para ver sus datos, moverla, duplicarla o eliminarla. Arrastra el fondo para desplazarte.'}
						</Text>
					)}
					<Stack gap={1}>
						<Heading size="sm">Vista de perfil</Heading>
						<ProfileView plot={plot} plants={plants} specFor={specFor} selectedId={selectedId} onSelect={focusPlant} />
						<Text fontSize="xs" color="fg.muted">
							Corte lateral a escala, visto desde el borde inferior del plano: las plantas más altas quedan atrás. Altura y copa usan el promedio del
							rango del catálogo; el borde punteado indica que falta el dato y se usa un tamaño típico de su estrato.
						</Text>
					</Stack>
				</Stack>

				<Box display={panelDisplay('analisis', 'block')} minW={0} position={{ lg: 'sticky' }} top={{ lg: 4 }}>
					<Panel title="Análisis en vivo" maxH={{ lg: 'calc(100vh - 2rem)' }} overflowY={{ lg: 'auto' }}>
						<AnalysisPanel
							analysis={analysis}
							suggestions={suggestions}
							nameOfPlant={nameOfPlant}
							onSelectPlant={focusPlant}
							onPickSpecies={pickSpecies}
							onRemoveMissing={removeMissing}
						/>
					</Panel>
				</Box>
			</Grid>

			{authUser && (
				<SavedDesignsDialog
					open={savedOpen}
					onOpenChange={setSavedOpen}
					authorId={authUser.uid}
					currentId={cloudOwnedByUser ? cloud!.id : null}
					onOpenDesign={handleOpenDesign}
					onRenamed={handleRenamed}
					onDeleted={handleDeleted}
				/>
			)}
		</Stack>
	);
}

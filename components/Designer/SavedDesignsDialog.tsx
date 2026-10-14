import { useEffect, useState } from 'react';

import { Badge, Box, Button, CloseButton, Dialog, HStack, IconButton, Input, Portal, Spinner, Stack, Text } from '@chakra-ui/react';
import { CheckIcon, FolderOpenIcon, PencilSimpleIcon, TrashIcon, XIcon } from '@phosphor-icons/react';

import { deleteDesign, getDesignsForUser, renameDesign } from '../../adapters/designs';
import { MAX_DESIGN_NAME_LENGTH } from '../../interfaces/Design';

import type { Design } from '../../interfaces/Design';

function formatDate(epochMs: number) {
	return new Date(epochMs).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DesignRow({
	design,
	current,
	onOpen,
	onRenamed,
	onDeleted
}: {
	design: Design;
	current: boolean;
	onOpen: (design: Design) => void;
	onRenamed: (id: string, name: string) => void;
	onDeleted: (id: string) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(design.name);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleRename() {
		const trimmed = name.trim().slice(0, MAX_DESIGN_NAME_LENGTH);
		if (!trimmed) return;
		setBusy(true);
		setError(null);
		try {
			await renameDesign(design._id, trimmed);
			onRenamed(design._id, trimmed);
			setEditing(false);
		} catch {
			setError('No se pudo renombrar.');
		} finally {
			setBusy(false);
		}
	}

	async function handleDelete() {
		if (!window.confirm(`¿Borrar el diseño "${design.name}"? Esta acción no se puede deshacer.`)) return;
		setBusy(true);
		setError(null);
		try {
			await deleteDesign(design._id);
			onDeleted(design._id);
		} catch {
			setError('No se pudo borrar.');
			setBusy(false);
		}
	}

	return (
		<Box borderWidth="1px" borderRadius="md" p={3} borderColor={current ? 'green.solid' : undefined}>
			{editing ? (
				<HStack gap={1}>
					<Input
						size="sm"
						value={name}
						maxLength={MAX_DESIGN_NAME_LENGTH}
						onChange={event => setName(event.target.value)}
						onKeyDown={event => {
							if (event.key === 'Enter') handleRename();
							if (event.key === 'Escape') setEditing(false);
						}}
						autoFocus
						aria-label="Nuevo nombre"
					/>
					<IconButton size="sm" aria-label="Guardar nombre" onClick={handleRename} loading={busy} disabled={!name.trim()}>
						<CheckIcon />
					</IconButton>
					<IconButton size="sm" variant="ghost" aria-label="Cancelar" onClick={() => setEditing(false)}>
						<XIcon />
					</IconButton>
				</HStack>
			) : (
				<Stack gap={2}>
					<HStack justify="space-between" align="start" gap={2}>
						<Stack gap={0} minW={0}>
							<Text fontWeight="semibold" truncate>
								{design.name}
							</Text>
							<Text fontSize="xs" color="fg.muted">
								{design.plot?.width} × {design.plot?.length} m · {design.plants?.length ?? 0} plantas · {formatDate(design.updatedAt)}
							</Text>
						</Stack>
						{current && (
							<Badge colorPalette="green" flexShrink={0}>
								Abierto
							</Badge>
						)}
					</HStack>
					<HStack gap={1} flexWrap="wrap">
						<Button size="xs" colorPalette="green" onClick={() => onOpen(design)} disabled={busy}>
							<FolderOpenIcon /> Abrir
						</Button>
						<Button
							size="xs"
							variant="outline"
							onClick={() => {
								setName(design.name);
								setEditing(true);
							}}
							disabled={busy}
						>
							<PencilSimpleIcon /> Renombrar
						</Button>
						<Button size="xs" variant="outline" colorPalette="red" onClick={handleDelete} loading={busy}>
							<TrashIcon /> Borrar
						</Button>
					</HStack>
				</Stack>
			)}
			{error && (
				<Text fontSize="xs" color="fg.error" mt={1}>
					{error}
				</Text>
			)}
		</Box>
	);
}

function DesignList({
	authorId,
	currentId,
	onOpen,
	onRenamed,
	onDeleted
}: {
	authorId: string;
	currentId: string | null;
	onOpen: (design: Design) => void;
	onRenamed: (id: string, name: string) => void;
	onDeleted: (id: string) => void;
}) {
	const [designs, setDesigns] = useState<Design[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		getDesignsForUser(authorId)
			.then(list => {
				if (!cancelled) setDesigns(list);
			})
			.catch(() => {
				if (!cancelled) setError('No se pudieron cargar tus diseños. Revisa tu conexión e inténtalo de nuevo.');
			});
		return () => {
			cancelled = true;
		};
	}, [authorId]);

	if (error) return <Text color="fg.error">{error}</Text>;
	if (!designs) return <Spinner />;
	if (designs.length === 0) return <Text color="fg.muted">Todavía no tienes diseños guardados en la nube.</Text>;

	return (
		<Stack gap={2}>
			{designs.map(design => (
				<DesignRow
					key={design._id}
					design={design}
					current={design._id === currentId}
					onOpen={onOpen}
					onRenamed={(id, name) => {
						setDesigns(list => list?.map(item => (item._id === id ? { ...item, name, updatedAt: Date.now() } : item)) ?? null);
						onRenamed(id, name);
					}}
					onDeleted={id => {
						setDesigns(list => list?.filter(item => item._id !== id) ?? null);
						onDeleted(id);
					}}
				/>
			))}
		</Stack>
	);
}

interface SavedDesignsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	authorId: string;
	currentId: string | null;
	onOpenDesign: (design: Design) => void;
	onRenamed: (id: string, name: string) => void;
	onDeleted: (id: string) => void;
}

export default function SavedDesignsDialog({ open, onOpenChange, authorId, currentId, onOpenDesign, onRenamed, onDeleted }: SavedDesignsDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={event => onOpenChange(event.open)} size="md" scrollBehavior="inside" lazyMount unmountOnExit>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Mis diseños</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<DesignList authorId={authorId} currentId={currentId} onOpen={onOpenDesign} onRenamed={onRenamed} onDeleted={onDeleted} />
						</Dialog.Body>
						<Dialog.CloseTrigger asChild>
							<CloseButton size="sm" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

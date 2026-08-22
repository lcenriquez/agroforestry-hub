import { useState } from 'react';

import { Button, CloseButton, Dialog, Portal, Spinner, Text } from '@chakra-ui/react';

import { createSpeciesSuggestion, updateSpecies } from '../../adapters/firestore';
import { useAuth } from '../../contexts/AuthContext';
import SpeciesForm from './SpeciesForm';
import { useSpeciesCatalogs } from './useSpeciesCatalogs';

import type { SpeciesInput, SpeciesType } from '../../interfaces/Species';

interface SpeciesEditDialogProps {
	species: SpeciesType;
	onUpdated: (species: SpeciesType) => void;
}

function toSpeciesInput(species: SpeciesType): SpeciesInput {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { _id, ...input } = species;
	return input;
}

export default function SpeciesEditDialog({ species, onUpdated }: SpeciesEditDialogProps) {
	const { authUser, isAdmin } = useAuth();
	const [open, setOpen] = useState(false);
	const [sent, setSent] = useState(false);
	const { catalogs, loading } = useSpeciesCatalogs(open);

	if (!authUser) return null;

	async function handleSubmit(data: SpeciesInput) {
		if (isAdmin) {
			await updateSpecies(species._id, data);
			onUpdated({ _id: species._id, ...data });
			setOpen(false);
			return;
		}

		await createSpeciesSuggestion({
			type: 'edit',
			speciesId: species._id,
			proposedData: data,
			authorId: authUser!.uid,
			authorEmail: authUser!.email,
			createdAt: Date.now(),
			status: 'pending'
		});
		setSent(true);
	}

	return (
		<Dialog.Root
			open={open}
			onOpenChange={event => {
				setOpen(event.open);
				if (!event.open) setSent(false);
			}}
			size="lg"
			scrollBehavior="inside"
		>
			<Dialog.Trigger asChild>
				<Button size="sm" variant="outline">
					{isAdmin ? 'Editar especie' : 'Sugerir edición'}
				</Button>
			</Dialog.Trigger>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>{isAdmin ? 'Editar especie' : 'Sugerir edición'}</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							{sent ? (
								<Text>Tu sugerencia fue enviada, quedará pendiente de revisión.</Text>
							) : loading ? (
								<Spinner />
							) : (
								<SpeciesForm
									initialValue={toSpeciesInput(species)}
									catalogs={catalogs}
									onSubmit={handleSubmit}
									submitLabel={isAdmin ? 'Guardar cambios' : 'Enviar sugerencia'}
								/>
							)}
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

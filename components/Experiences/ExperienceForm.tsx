import { useState } from 'react';

import { Alert, Button, Field, Input, NativeSelect, Stack, Textarea } from '@chakra-ui/react';

import { addExperience } from '../../adapters/firestore';
import { PhotoValidationError, uploadExperiencePhotos } from '../../adapters/storage';
import { useAuth } from '../../contexts/AuthContext';
import { MAX_EXPERIENCE_PHOTOS } from '../../interfaces/Experience';
import PhotoUploader from './PhotoUploader';

import type { Level } from '../../interfaces/Common';
import type { Experience } from '../../interfaces/Experience';

interface ExperienceFormProps {
	speciesId: string;
	onCreated: (experience: Experience) => void;
}

const emptyInput = { location: '', climate: '', lightExposure: 'M' as Level, soilType: '', notes: '' };

export default function ExperienceForm({ speciesId, onCreated }: ExperienceFormProps) {
	const { authUser } = useAuth();
	const [input, setInput] = useState(emptyInput);
	const [photos, setPhotos] = useState<File[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
		setInput({ ...input, [event.target.name]: event.target.value });
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!authUser) return;

		setSubmitting(true);
		setError(null);
		try {
			const photoUrls = photos.length > 0 ? await uploadExperiencePhotos(speciesId, authUser.uid, photos) : [];
			const experience = {
				speciesId,
				authorId: authUser.uid,
				authorEmail: authUser.email,
				createdAt: Date.now(),
				location: input.location,
				climate: input.climate,
				lightExposure: input.lightExposure,
				soilType: input.soilType,
				notes: input.notes || undefined,
				photoUrls
			};
			const id = await addExperience(experience);
			onCreated({ _id: id, ...experience });
			setInput(emptyInput);
			setPhotos([]);
		} catch (err) {
			setError(err instanceof PhotoValidationError ? err.message : 'No se pudo guardar tu experiencia, intenta de nuevo');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<Stack gap={4} maxW="lg">
				<Field.Root required>
					<Field.Label>Ubicación</Field.Label>
					<Input name="location" placeholder="Ej. Oaxaca, México" value={input.location} onChange={handleChange} required />
				</Field.Root>
				<Field.Root required>
					<Field.Label>Clima</Field.Label>
					<Input name="climate" placeholder="Ej. Templado subhúmedo" value={input.climate} onChange={handleChange} required />
				</Field.Root>
				<Field.Root required>
					<Field.Label>Luz que recibe</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field name="lightExposure" value={input.lightExposure} onChange={handleChange}>
							<option value="H">Sol directo</option>
							<option value="M">Media sombra</option>
							<option value="L">Sombra</option>
						</NativeSelect.Field>
						<NativeSelect.Indicator />
					</NativeSelect.Root>
				</Field.Root>
				<Field.Root required>
					<Field.Label>Tipo de suelo</Field.Label>
					<Input name="soilType" placeholder="Ej. Arcilloso, arenoso, franco..." value={input.soilType} onChange={handleChange} required />
				</Field.Root>
				<Field.Root>
					<Field.Label>Notas adicionales</Field.Label>
					<Textarea name="notes" placeholder="Cuidados, rendimiento, plagas..." value={input.notes} onChange={handleChange} />
				</Field.Root>
				<Field.Root>
					<Field.Label>Fotos</Field.Label>
					<PhotoUploader files={photos} onChange={setPhotos} maxFiles={MAX_EXPERIENCE_PHOTOS} />
				</Field.Root>
				{error && (
					<Alert.Root status="error">
						<Alert.Indicator />
						<Alert.Title>{error}</Alert.Title>
					</Alert.Root>
				)}
				<Button type="submit" alignSelf="start" colorPalette="blue" loading={submitting} loadingText="Guardando">
					Compartir experiencia
				</Button>
			</Stack>
		</form>
	);
}

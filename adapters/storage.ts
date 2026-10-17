import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../firebase-config';
import { MAX_BACKGROUND_BYTES } from '../interfaces/Design';
import { MAX_EXPERIENCE_PHOTOS } from '../interfaces/Experience';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class PhotoValidationError extends Error {}

function assertValidPhotos(files: File[]) {
	if (files.length > MAX_EXPERIENCE_PHOTOS) throw new PhotoValidationError(`Puedes compartir máximo ${MAX_EXPERIENCE_PHOTOS} fotos`);
	for (const file of files) {
		if (!file.type.startsWith('image/')) throw new PhotoValidationError(`"${file.name}" no es una imagen válida`);
		if (file.size > MAX_PHOTO_SIZE_BYTES) throw new PhotoValidationError(`"${file.name}" pesa más de 5MB`);
	}
}

export async function uploadExperiencePhotos(speciesId: string, authorId: string, files: File[]): Promise<string[]> {
	assertValidPhotos(files);

	const urls = await Promise.all(
		files.map(async file => {
			const path = `experiences/${speciesId}/${authorId}/${Date.now()}-${file.name}`;
			const fileRef = ref(storage, path);
			await uploadBytes(fileRef, file);
			return getDownloadURL(fileRef);
		})
	);

	return urls;
}

// Imagen de fondo de un diseño del Diseñador de SAF. Va en la carpeta del
// autor (designs/{uid}/...), que sólo él puede leer y escribir (storage.rules).
// `fileName` fijo lo usan los scripts de importación para no duplicar archivos.
export async function uploadDesignBackground(authorId: string, blob: Blob, fileName?: string): Promise<{ url: string; path: string }> {
	if (!blob.type.startsWith('image/')) throw new PhotoValidationError('La imagen de fondo no es válida');
	if (blob.size > MAX_BACKGROUND_BYTES) throw new PhotoValidationError('La imagen de fondo pesa más de 10MB');
	const path = `designs/${authorId}/${fileName ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`}`;
	const fileRef = ref(storage, path);
	await uploadBytes(fileRef, blob, { contentType: blob.type });
	return { url: await getDownloadURL(fileRef), path };
}

export async function deleteDesignBackground(path: string): Promise<void> {
	await deleteObject(ref(storage, path));
}

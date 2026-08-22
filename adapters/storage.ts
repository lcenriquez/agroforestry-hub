import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../firebase-config';
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

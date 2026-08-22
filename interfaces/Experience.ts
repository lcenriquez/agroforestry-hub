import type { Level } from './Common';

export const MAX_EXPERIENCE_PHOTOS = 5;

// Experiencia de un usuario cultivando/observando una especie, compartida
// libremente para que otros puedan aprender de condiciones reales (no del
// catálogo de referencia). Vive en la colección top-level `experiences`.
export interface Experience {
	// Id del documento de Firestore (asignado en el adapter, no viene en `.data()`).
	_id: string;
	speciesId: string;
	authorId: string;
	authorEmail: string;
	// Epoch ms (Date.now() al momento de guardar).
	createdAt: number;
	location: string;
	climate: string;
	lightExposure: Level;
	soilType: string;
	notes?: string;
	// URLs de descarga en Firebase Storage, máximo MAX_EXPERIENCE_PHOTOS.
	photoUrls: string[];
}

export type NewExperience = Omit<Experience, '_id'>;

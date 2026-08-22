import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';

import { database } from '../firebase-config';
import { taxonomyKey } from '../lib/text';

import type { Experience, NewExperience } from '../interfaces/Experience';
import type { AdditionalFunction, EcologicalFunction, EcologicalZone, SpeciesInput, SpeciesType, Stratum } from '../interfaces/Species';
import type { NewSpeciesSuggestion, SpeciesSuggestion } from '../interfaces/SpeciesSuggestion';

// Firestore stores the `_id` of these catalog entries (stratum, ecological
// zone/function, additional function) as numbers, not strings, even though
// every other id in the app (Firestore document ids) is a string. Coercing
// them here keeps that inconsistency from leaking into the rest of the app,
// which treats every `_id` as a string (Set/Map keys, sorting, React keys...).
function normalizeCode<T extends { _id: unknown }>(item: T): T & { _id: string } {
	return { ...item, _id: String(item._id) };
}

function normalizeSpecies(docId: string, data: Record<string, unknown>): SpeciesType {
	const raw = data as Omit<SpeciesType, '_id' | 'stratums' | 'ecologicalZones' | 'ecologicalFunctions' | 'additionalFunctions'> & {
		stratums?: Stratum[];
		ecologicalZones?: { mx?: EcologicalZone[] };
		ecologicalFunctions?: EcologicalFunction[];
		additionalFunctions?: AdditionalFunction[];
	};

	return {
		...raw,
		_id: docId,
		stratums: (raw.stratums ?? []).map(normalizeCode),
		ecologicalZones: { mx: (raw.ecologicalZones?.mx ?? []).map(normalizeCode) },
		ecologicalFunctions: (raw.ecologicalFunctions ?? []).map(normalizeCode),
		additionalFunctions: (raw.additionalFunctions ?? []).map(normalizeCode)
	} as SpeciesType;
}

export async function getSpecies(): Promise<SpeciesType[]> {
	let docs: SpeciesType[] = [];

	try {
		const instance = collection(database, 'species');
		const q = query(instance, orderBy('taxonomy.genus', 'asc'), orderBy('taxonomy.species', 'asc'));
		const data = await getDocs(q);
		docs = data.docs.map(item => normalizeSpecies(item.id, item.data()));
	} catch (error) {
		console.log(error);
	}
	return docs;
}

export async function getSpeciesById(id: string): Promise<SpeciesType | null> {
	try {
		const snapshot = await getDoc(doc(database, 'species', id));
		if (!snapshot.exists()) return null;
		return normalizeSpecies(snapshot.id, snapshot.data());
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function getStratums(): Promise<Stratum[]> {
	let docs: Stratum[] = [];
	try {
		const instance = collection(database, 'stratums');
		const data = await getDocs(query(instance));
		docs = data.docs.map(item => ({ _id: item.id, ...item.data() }) as Stratum);
	} catch (error) {
		console.log(error);
	}
	return docs;
}

export async function getAdditionalFunctions(): Promise<AdditionalFunction[]> {
	let docs: AdditionalFunction[] = [];
	try {
		const instance = collection(database, 'additionalFunctions');
		const data = await getDocs(query(instance));
		docs = data.docs.map(item => ({ _id: item.id, ...item.data() }) as AdditionalFunction);
	} catch (error) {
		console.log(error);
	}
	return docs;
}

export async function getEcologicalFunctions(): Promise<EcologicalFunction[]> {
	let docs: EcologicalFunction[] = [];
	try {
		const instance = collection(database, 'ecologicalFunctions');
		const data = await getDocs(query(instance));
		docs = data.docs.map(item => ({ _id: item.id, ...item.data() }) as EcologicalFunction);
	} catch (error) {
		console.log(error);
	}
	return docs;
}

export async function createSpecies(data: SpeciesInput): Promise<string> {
	const instance = collection(database, 'species');
	const created = await addDoc(instance, data);
	return created.id;
}

export async function updateSpecies(id: string, data: SpeciesInput): Promise<void> {
	await setDoc(doc(database, 'species', id), data);
}

export interface ImportSpeciesResult {
	created: number;
	updated: number;
}

// Upsert masivo por género+especie (ver docs/tasks/carga-masiva-especies-excel.md):
// actualiza el documento existente si ya hay una especie con ese género+especie,
// si no crea uno nuevo. `existing` es la lista de especies ya cargadas (evita
// un getSpecies() adicional cuando el llamador ya la tiene).
export async function importSpecies(rows: SpeciesInput[], existing: SpeciesType[]): Promise<ImportSpeciesResult> {
	const existingIdByKey = new Map(existing.map(species => [taxonomyKey(species.taxonomy), species._id]));
	const result: ImportSpeciesResult = { created: 0, updated: 0 };

	const BATCH_SIZE = 400; // por debajo del límite de 500 escrituras por batch de Firestore.
	for (let i = 0; i < rows.length; i += BATCH_SIZE) {
		const batch = writeBatch(database);
		for (const input of rows.slice(i, i + BATCH_SIZE)) {
			const existingId = existingIdByKey.get(taxonomyKey(input.taxonomy));
			if (existingId) {
				batch.set(doc(database, 'species', existingId), input);
				result.updated++;
			} else {
				batch.set(doc(collection(database, 'species')), input);
				result.created++;
			}
		}
		await batch.commit();
	}

	return result;
}

export async function createSpeciesSuggestion(input: NewSpeciesSuggestion): Promise<string> {
	const instance = collection(database, 'speciesSuggestions');
	const created = await addDoc(instance, input);
	return created.id;
}

export async function getPendingSuggestions(): Promise<SpeciesSuggestion[]> {
	let docs: SpeciesSuggestion[] = [];
	try {
		const instance = collection(database, 'speciesSuggestions');
		const q = query(instance, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
		const data = await getDocs(q);
		docs = data.docs.map(item => ({ _id: item.id, ...item.data() }) as SpeciesSuggestion);
	} catch (error) {
		console.log(error);
	}
	return docs;
}

// Aplica `proposedData` a `species` (update si es una sugerencia de edición,
// create si es una especie nueva) y marca la sugerencia como aprobada, en un
// solo batch para que ambas escrituras sean atómicas.
export async function approveSuggestion(suggestion: SpeciesSuggestion): Promise<void> {
	const batch = writeBatch(database);

	if (suggestion.type === 'edit' && suggestion.speciesId) {
		batch.set(doc(database, 'species', suggestion.speciesId), suggestion.proposedData);
	} else {
		batch.set(doc(collection(database, 'species')), suggestion.proposedData);
	}
	batch.update(doc(database, 'speciesSuggestions', suggestion._id), { status: 'approved', reviewedAt: Date.now() });

	await batch.commit();
}

export async function rejectSuggestion(id: string): Promise<void> {
	await updateDoc(doc(database, 'speciesSuggestions', id), { status: 'rejected', reviewedAt: Date.now() });
}

export async function getExperiencesForSpecies(speciesId: string): Promise<Experience[]> {
	let docs: Experience[] = [];
	try {
		const instance = collection(database, 'experiences');
		const q = query(instance, where('speciesId', '==', speciesId), orderBy('createdAt', 'desc'));
		const data = await getDocs(q);
		docs = data.docs.map(item => ({ _id: item.id, ...item.data() }) as Experience);
	} catch (error) {
		console.log(error);
	}
	return docs;
}

export async function addExperience(experience: NewExperience): Promise<string> {
	const instance = collection(database, 'experiences');
	const created = await addDoc(instance, experience);
	return created.id;
}

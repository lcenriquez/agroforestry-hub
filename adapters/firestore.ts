import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';

import { database } from '../firebase-config';

import type { Experience, NewExperience } from '../interfaces/Experience';
import type { AdditionalFunction, EcologicalFunction, EcologicalZone, SpeciesType, Stratum } from '../interfaces/Species';

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

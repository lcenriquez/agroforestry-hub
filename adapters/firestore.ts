import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';

import { database } from '../firebase-config';

import type { Experience, NewExperience } from '../interfaces/Experience';
import type { AdditionalFunction, EcologicalFunction, SpeciesType, Stratum } from '../interfaces/Species';

export async function getSpecies(): Promise<SpeciesType[]> {
	let docs: SpeciesType[] = [];

	try {
		const instance = collection(database, 'species');
		const q = query(instance, orderBy('taxonomy.genus', 'asc'), orderBy('taxonomy.species', 'asc'));
		const data = await getDocs(q);
		docs = data.docs.map(item => ({ _id: item.id, ...item.data() }) as SpeciesType);
	} catch (error) {
		console.log(error);
	}
	return docs;
}

export async function getSpeciesById(id: string): Promise<SpeciesType | null> {
	try {
		const snapshot = await getDoc(doc(database, 'species', id));
		if (!snapshot.exists()) return null;
		return { _id: snapshot.id, ...snapshot.data() } as SpeciesType;
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

import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

import { database } from '../firebase-config';

import type { Design, DesignUpdate, NewDesign } from '../interfaces/Design';

// Diseños del Diseñador de SAF (/disenador). Son privados: las reglas de
// Firestore sólo dejan leer/escribir los del propio autor, por eso la consulta
// siempre filtra por `authorId`. El orden se hace en el cliente para no
// requerir un índice compuesto (authorId + updatedAt).
export async function getDesignsForUser(authorId: string): Promise<Design[]> {
	const instance = collection(database, 'designs');
	const data = await getDocs(query(instance, where('authorId', '==', authorId)));
	return data.docs.map(item => ({ ...(item.data() as NewDesign), _id: item.id })).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function createDesign(design: NewDesign): Promise<string> {
	const instance = collection(database, 'designs');
	const created = await addDoc(instance, stripUndefined(design));
	return created.id;
}

export async function updateDesign(id: string, data: DesignUpdate): Promise<void> {
	await updateDoc(doc(database, 'designs', id), stripUndefined(data));
}

export async function renameDesign(id: string, name: string): Promise<void> {
	await updateDoc(doc(database, 'designs', id), { name, updatedAt: Date.now() });
}

export async function deleteDesign(id: string): Promise<void> {
	await deleteDoc(doc(database, 'designs', id));
}

// Firestore rechaza campos con valor `undefined` (p. ej. `description` vacía).
function stripUndefined<T extends object>(data: T): T {
	return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as T;
}

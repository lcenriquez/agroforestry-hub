import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { database } from '../firebase-config';
// import type { SpeciesType } from '../interfaces/Species';

// Internationalization components
const country = 'mx';
const lang = 'es-mx';

export async function getDocsFromCollection(collectionName: string) {
  let docs: {}[] = [];
  try {
    const instance = await collection(database, collectionName);
    const data = await getDocs(instance);
    docs = data.docs.map(item => {
      return { id: item.id, ...item.data() }
    });
  } catch (error) {
    console.log(error);
  }
  return docs;
}

export async function getSpecies() {
  let docs: {}[] = [];
  
  try {
    const instance = await collection(database, 'species');
    const q = query(instance, orderBy('taxonomy.genus', 'asc'), orderBy('taxonomy.species', 'asc'));
    const data = await getDocs(q);
    docs = data.docs.map(item => {
      const speciesObject: any = { id: item.id, ...item.data() }
      return speciesObject;
    });
    console.log(docs);
  } catch (error) {
    console.log(error);
  }
  return docs;
}

export async function getStratums() {
  let docs: {}[] = [];
  try {
    const instance = await collection(database, 'stratums');
    const q = query(instance);
    const data = await getDocs(q);
    docs = data.docs.map(item => {
      return { id: item.id, ...item.data() };
    });
  } catch (error) {
    console.log(error);
  }
  return docs;
}

export async function getAdditionalFunctions() {
  let docs: {}[] = [];
  try {
    const instance = await collection(database, 'additionalFunctions');
    const q = query(instance);
    const data = await getDocs(q);
    docs = data.docs.map(item => {
      return { id: item.id, ...item.data() };
    });
  } catch (error) {
    console.log(error);
  }
  return docs;
}

export async function getEcologicalFunctions() {
  let docs: {}[] = [];
  try {
    const instance = await collection(database, 'ecologicalFunctions');
    const q = query(instance);
    const data = await getDocs(q);
    docs = data.docs.map(item => {
      return { id: item.id, ...item.data() };
    });
  } catch (error) {
    console.log(error);
  }
  return docs;
}
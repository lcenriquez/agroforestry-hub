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
  const stratums = await getStratums();
  const ecologicalFunctions = await getEcologicalFunctions();
  const docRef = doc(database, 'ecologicalZones', country);
  const ecologicalZonesInCountry = (await getDoc(docRef)).data();

  let docs: {}[] = [];
  try {
    const instance = await collection(database, 'species');
    const q = query(instance, orderBy('taxonomy.genus', 'asc'), orderBy('taxonomy.species', 'asc'));
    const data = await getDocs(q);
    docs = data.docs.map(item => {
      const speciesObject: any = { id: item.id, ...item.data() }
      // Map stratums
      speciesObject.stratums = speciesObject.stratums.map((st: any) => {
        if (stratums) return { id: st, ...stratums[st]}
        return { id: st };
      });
      // Map ecological zones
      speciesObject.ecologicalZones.mx = speciesObject.ecologicalZones.mx.map((ez: any) => {
        if (ecologicalZonesInCountry) return { id: ez, ...ecologicalZonesInCountry[ez]}
        return { id: ez };
      });
      // Map ecological functions
      speciesObject.ecologicalFunctions = speciesObject.ecologicalFunctions.map((ef: any) => {
        if (ecologicalFunctions) return { id: ef, ...ecologicalFunctions[ef]}
        return { id: ef };
      });
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
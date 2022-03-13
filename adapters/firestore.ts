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
  const docRef = doc(database, 'ecologicalZones', country);
  const ecologicalZonesInCountry = (await getDoc(docRef)).data();

  let docs: {}[] = [];
  try {
    const instance = await collection(database, 'species');
    const q = query(instance, orderBy('taxonomy.genus', 'asc'), orderBy('taxonomy.species', 'asc'));
    const data = await getDocs(q);
    docs = data.docs.map(item => {
      const speciesObject: any = { id: item.id, ...item.data() }
      speciesObject.ecologicalZones.mx = speciesObject.ecologicalZones.mx.map((ez: any) => {
        if (ecologicalZonesInCountry) return { id: ez, ...ecologicalZonesInCountry[ez]}
        return { id: ez };
      });
      return speciesObject;
    });
    console.log(docs);
  } catch (error) {
    console.log(error);
  }
  return docs;
}
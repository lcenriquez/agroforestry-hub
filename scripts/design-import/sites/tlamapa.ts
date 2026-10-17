// Configuración de los diseños de SAF de San Martín Tlamapa, Puebla
// (`saf-design-export` v1): qué archivo va a qué diseño, cómo se resuelve cada
// `nombre_cientifico` contra el catálogo y el tamaño con manejo acordado.
// Las coordenadas y demás datos del terreno viven sólo en los JSON de entrada
// (scripts/design-import/input/, fuera de git).
import type { SiteConfig, SourcePlant } from '../import-saf-designs';

// [altura, copa] con manejo (poda), en metros. Lo demás usa el tamaño de adulta del catálogo.
const LINE: [number, number] = [2, 1.2]; // línea central: «poda a 1.5–2 m»

export const tlamapa: SiteConfig = {
	key: 'tlamapa',
	title: 'Plano del sitio · Tlamapa',
	designs: [
		{ file: '1_barrera_rompevientos.json', docId: 'tlamapa-1-barrera-rompevientos', name: 'Tlamapa 1 · Barrera rompevientos' },
		{ file: '2_colinita.json', docId: 'tlamapa-2-colinita', name: 'Tlamapa 2 · Colinita: frutales y alfalfa' },
		{ file: '3_saf_principal.json', docId: 'tlamapa-3-saf-principal', name: 'Tlamapa 3 · SAF principal: hortalizas + biointensivo' }
	],
	// `id`: documento de `species` (ids existentes, revisados el 2026-10-17).
	// `taxonomy`: se busca por género+especie al importar (especies dadas de alta
	// con scripts/species-add); si todavía no existe, la planta se omite.
	species: {
		'Agave spp.': { id: 'BQeItwmcjZns8ZZNTkIP' },
		'Barkleyanthus salicifolius': { taxonomy: { genus: 'Barkleyanthus', species: 'salicifolius' } },
		'Cupressus lusitanica': { taxonomy: { genus: 'Cupressus', species: 'lusitanica' } },
		'Buddleja cordata': { taxonomy: { genus: 'Buddleja', species: 'cordata' } },
		'Laurus nobilis': { id: 'dKYsAAzZNP0vACCANesi' },
		'Crataegus mexicana': { id: 'bNKuiUz7LSVMj3hFfYNu' },
		'Eriobotrya japonica': { id: 'usFtWagZ197fV3YGt787' },
		'Cydonia oblonga': { id: 'oqIU9Sy02jE9pFtFquLs' },
		'Psidium guajava': { id: '4sojBTcz0WpORVPr0vGT' },
		'Pyrus communis': { id: 'W9CKabFkPEgQg8oEtvGS' },
		// Sinónimo de S. canadensis (S. nigra subsp. canadensis).
		'Sambucus mexicana': { id: 'YzxJ36uAFj6krJDtn54f' },
		'Ricinus communis': { id: 'cpgJP2dMIo9FldW3mrf2' },
		'Salvia rosmarinus': { id: '258WeIbhNRmytPvT1qDq' },
		'Salvia officinalis': { id: '7KW67LMWm7EKgEFBJPuQ' },
		'Origanum vulgare': { id: 'ByLcAbYHu4veqtSLUyBo' },
		'Thymus vulgaris': { id: 'RAqyaT70pi6n4ndSBBJS' },
		'Ruta graveolens': { id: '4tVoRuDcW1ZOWkKZT0F1' },
		'Medicago sativa': { id: 'yTTy7d4qu1PIncxHNdoL' },
		'Ficus carica': { id: 'tNbrPlVNPxxogAnouV7W' },
		'Erythrina americana': { id: 'w7YCGhrpdRMz65COilsK' },
		'Musa spp. (local adaptado)': { id: 'VmefiKW4VYs3fXAsMhDj' },
		'Citrus × aurantiifolia': { taxonomy: { genus: 'Citrus', species: '× aurantiifolia' } },
		// El catálogo ya la llama Jinicuil.
		'Inga jinicuil': { id: 'gYDptckll60zyO5OWGB0' },
		'Punica granatum': { id: 'wZqBD1O80vFKXQ7pA88o' },
		'Moringa oleifera': { taxonomy: { genus: 'Moringa', species: 'oleifera' } },
		'Leucaena esculenta': { taxonomy: { genus: 'Leucaena', species: 'esculenta' } },
		'Prunus persica': { id: 'iJfEYRTtvnpnO538fAa2' },
		'Cnidoscolus aconitifolius': { id: 'gumz085oT0LnAX8xZie7' },
		'Leucaena sp.': { id: 'VSRFPwLYZMcNJx6Q2e0V' },
		'Selenicereus undatus': { id: 'CBkTZsc1TfDvc4ksLW1G' },
		'Tithonia diversifolia': { id: '9mv66lks0Ez49fluzGPi' },
		'Morus alba': { id: '56AQL5tS9PoKKi8oKTON' },
		'Symphytum officinale': { id: 'V48ZgDmdc1d9BFE4Lgcq' }
	},
	managed: {
		// Base del seto, a 1 m entre plantas: no la copa de adulta de 3 m del catálogo.
		'Agave spp.': [1.2, 1],
		'Barkleyanthus salicifolius': [1.5, 0.8],
		'Cupressus lusitanica': [3, 1.5],
		'Buddleja cordata': [3, 1.5],
		'Ricinus communis': [2, 1.2],
		// El plátano no se poda en altura.
		'Musa spp. (local adaptado)': [3, 2],
		'Ficus carica': LINE,
		'Citrus × aurantiifolia': LINE,
		'Punica granatum': LINE,
		'Moringa oleifera': LINE,
		'Prunus persica': LINE,
		'Cnidoscolus aconitifolius': LINE,
		'Tithonia diversifolia': LINE,
		'Morus alba': LINE,
		'Erythrina americana': LINE,
		'Leucaena esculenta': LINE,
		'Inga jinicuil': [3, 1.5],
		// Guaje existente: desmoche a 1.5 m.
		'Leucaena sp.': [1.5, 1]
	},
	// Hueco al sureste del polígono del SAF principal.
	panel: { x: 10.3, y: 4.5, width: 13 },
	notes: {
		'Selenicereus undatus': 'trepadora (sin ese estrato en el catálogo: se ve como Alto); va 0.15 m al sur del colorín'
	},
	adjustPlants(file, design) {
		const plants = design.plantas.map(plant =>
			// Misma posición que el colorín: se separa para poder seleccionarla en el plano.
			file === '3_saf_principal.json' && plant.nombre_cientifico === 'Selenicereus undatus' ? { ...plant, y: plant.y + 0.15 } : plant
		);
		if (file !== '2_colinita.json') return plants;

		// Franja de alfalfa: una planta en el punto medio entre cada par de aromáticas.
		const zone = design.zonas?.find(item => item.id === 'alfalfa');
		if (!zone?.cultivo || !zone.poligono) return plants;
		const ys = zone.poligono.map(([, y]) => y);
		const inBand = plants.filter(plant => plant.y >= Math.min(...ys) && plant.y <= Math.max(...ys)).sort((a, b) => a.x - b.x);
		const alfalfa: SourcePlant[] = inBand.slice(1).map((plant, index) => ({
			...zone.cultivo!,
			x: (inBand[index].x + plant.x) / 2,
			y: plant.y,
			fase: 1,
			existente: false
		}));
		return [...plants, ...alfalfa];
	}
};

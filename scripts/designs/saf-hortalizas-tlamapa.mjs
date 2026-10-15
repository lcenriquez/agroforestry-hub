#!/usr/bin/env node
// Genera el diseño "SAF hortalizas · Tlamapa" como archivos JSON en el formato
// de exportación del Diseñador (`saf-hub-design`, ver
// components/Designer/exporters.ts). No escribe en Firestore: el archivo se
// importa desde /disenador (botón Importar) con la sesión del usuario y se
// guarda con "Guardar", así pasa por la capa de datos de la app
// (adapters/designs.ts) y las reglas de Firestore/Storage.
//
// Uso:
//   node scripts/designs/saf-hortalizas-tlamapa.mjs              # sin imagen de fondo
//   node scripts/designs/saf-hortalizas-tlamapa.mjs --con-fondo  # con las franjas como fondo
//
// Por defecto va sin fondo: el fondo se sube a Storage al guardar y, si esa
// subida falla, el diseño entero no se guarda en la nube.
//
// Es determinista (sin fechas ni ids aleatorios): correrlo de nuevo produce
// los mismos archivos. Genera una variante por temporada, porque el diseñador
// guarda posiciones fijas y no tiene temporadas ni consorcios en el tiempo:
//   - saf-hortalizas-tlamapa.secas-frias.json  (oct–feb)
//   - saf-hortalizas-tlamapa.lluvias.json      (jun–sep)
//
// Cómo se representa lo que el diseñador no tiene:
//   - Rompevientos fuera del módulo: el terreno se amplía 1.3 m al norte para
//     incluirlo (si no, el análisis marca esas plantas como "fuera"). Por eso
//     y_diseño = y_módulo + 1.3 y el módulo de 15 × 4 m ocupa y = 1.3–5.3.
//   - Franjas (camas, pasillos, línea de árboles): sus rangos de y van en la
//     descripción; con --con-fondo, además, como imagen de fondo SVG a escala
//     (1 px = 1 cm) en la capa "Imagen", que se sube a Storage al guardar.
//   - Manejo con poda: cada planta lleva su tamaño con manejo (`pruneHeight`,
//     `pruneCrown`, ver MANAGED), así el plano y el análisis no usan la copa de
//     adulta sin podar del catálogo.
//   - Planta existente (guaje), clima y calendario: en la descripción y
//     rotulados en el fondo.
//   - Especies que no están en el catálogo: se omiten (no se inventan ids) y
//     se listan en la descripción. Al darlas de alta, poner su id en SPECIES
//     y volver a correr el script.
//
// Los ids de especie salen del catálogo `species` tal como quedó tras las
// pasadas de limpieza de scripts/species-cleanup (2026-10-14).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const withBackground = process.argv.includes('--con-fondo');

const MAX_DESIGN_PLANTS = 1000;
const MAX_DESCRIPTION = 2000;

// Desplazamiento norte: el rompevientos (y = -1.3 a 0 del módulo) queda dentro del terreno.
const OFFSET_Y = 1.3;
const PLOT = { width: 15, length: 4 + OFFSET_Y };

// id: documento de `species`; null = no existe en el catálogo.
const SPECIES = {
	nopal: { id: 'plB49IMLaw1gBhNqGKVy', label: 'Nopal (Opuntia ficus-indica)' },
	higuera: { id: 'tNbrPlVNPxxogAnouV7W', label: 'Higuera (Ficus carica)' },
	platano: { id: 'VmefiKW4VYs3fXAsMhDj', label: 'Plátano (Musa paradisiaca)' },
	guaje: { id: 'VSRFPwLYZMcNJx6Q2e0V', label: 'Guaje (Leucaena leucocephala)' },
	durazno: { id: 'iJfEYRTtvnpnO538fAa2', label: 'Durazno (Prunus persica)' },
	giganton: { id: '9mv66lks0Ez49fluzGPi', label: 'Gigantón (Tithonia diversifolia)' },
	morera: { id: '56AQL5tS9PoKKi8oKTON', label: 'Morera (Morus alba)' },
	consuelda: { id: 'V48ZgDmdc1d9BFE4Lgcq', label: 'Consuelda (Symphytum officinale)' },
	tagasaste: { id: 'g1fGwLW03TJqP3hbCldG', label: 'Tagasaste (Chamaecytisus palmensis)' },
	timbre: { id: 'zrCIzxeu6GHfMpLSYiMP', label: 'Timbre (Acaciella angustissima)' },
	// Sambucus mexicana es sinónimo de S. canadensis (S. nigra subsp. canadensis).
	sauco: { id: 'YzxJ36uAFj6krJDtn54f', label: 'Saúco (Sambucus canadensis)' },
	maguey: { id: 'BQeItwmcjZns8ZZNTkIP', label: 'Maguey (Agave sp.)' },
	romero: { id: '258WeIbhNRmytPvT1qDq', label: 'Romero (Salvia rosmarinus)' },
	maiz: { id: 'biFOWDCqpKGPPyHlT8kV', label: 'Maíz criollo (Zea mays)' },
	ayocote: { id: 'OBHgCOlrpNlYxEISVDeV', label: 'Frijol ayocote (Phaseolus coccineus)' },
	amaranto: { id: 'YkCzdfaDq4YNq5c5CU6b', label: 'Amaranto (Amaranthus hypochondriacus)' },
	epazote: { id: 'npmixKBBhzPFXGdb3QJa', label: 'Epazote (Dysphania ambrosioides)' },
	// El catálogo sólo tiene "Calabaza" genérica (Cucurbita sp.), no la de mata.
	calabaza: { id: 'wwuQEuSKiFZFX5xYRf4H', label: 'Calabaza (Cucurbita sp.)' },
	lechuga: { id: 'JK8YycpLWDQQPSpXELxV', label: 'Lechuga (Lactuca sativa)' },
	girasol: { id: null, label: 'Girasol (Helianthus annuus)' },
	chile: { id: null, label: 'Chile (Capsicum annuum)' },
	jitomate: { id: null, label: 'Jitomate (Solanum lycopersicum)' },
	brocoli: { id: null, label: 'Brócoli (Brassica oleracea var. italica)' },
	col: { id: null, label: 'Col (Brassica oleracea var. capitata)' },
	coliflor: { id: null, label: 'Coliflor (Brassica oleracea var. botrytis)' },
	chicharo: { id: null, label: 'Chícharo (Pisum sativum)' },
	rabano: { id: null, label: 'Rábano (Raphanus sativus)' },
	zanahoria: { id: null, label: 'Zanahoria (Daucus carota)' },
	acelga: { id: null, label: 'Acelga (Beta vulgaris var. cicla)' },
	betabel: { id: null, label: 'Betabel (Beta vulgaris)' },
	cilantro: { id: null, label: 'Cilantro (Coriandrum sativum)' },
	arugula: { id: null, label: 'Arúgula (Eruca vesicaria)' }
};

const round = value => Math.round(value * 100) / 100;

// Posiciones en coordenadas del módulo (x de poniente a oriente, y de norte a sur).
function* range(start, end, step) {
	for (let v = start; v <= end + 1e-9; v += step) yield round(v);
}

// Tamaño con manejo (poda) en metros: [altura, copa]. El diseñador dibuja y
// analiza estas plantas con él en lugar del tamaño de adulta sin podar del
// catálogo (la morera llega a 10 m de alto y 6 m de copa; aquí se mantiene a
// 1.5 m). Las demás plantas usan el del catálogo.
const MANAGED = {
	// Línea central: poda a 1.5–2 m; lo podado va picado sobre las camas.
	nopal: [1.5, 1],
	higuera: [2, 1.2],
	// El plátano no se despunta: se mantiene bajo con deshoje y un solo hijo.
	platano: [2, 1.5],
	// Guaje existente: desmoche a 1.5 m.
	guaje: [1.5, 1],
	durazno: [1.8, 1.2],
	giganton: [1.5, 0.8],
	morera: [1.5, 0.8],
	// Consuelda: corte frecuente para mulch.
	consuelda: [0.5, 0.4],
	// Rompevientos: seto poroso (~50%) recortado a ~0.6 m de ancho.
	tagasaste: [2.5, 0.6],
	timbre: [2, 0.6],
	sauco: [2.5, 0.6],
	maguey: [1.2, 0.8],
	romero: [0.6, 0.4],
	// Calabaza de mata (no de guía).
	calabaza: [0.5, 1.2]
};
// En el seto el nopal va más angosto que en la línea central.
const HEDGE_NOPAL = [1.5, 0.6];

function plant(key, x, y, size = MANAGED[key]) {
	const p = { key, x: round(x), y: round(y) };
	if (size) [p.pruneHeight, p.pruneCrown] = size;
	return p;
}

// --- Elementos permanentes ---------------------------------------------------

const CENTER_Y = 1.9;
const MAIN_TREES = [
	['nopal', 0.5],
	['higuera', 2.5],
	['platano', 5.0],
	['guaje', 7.5],
	['platano', 10.0],
	['durazno', 12.5]
];

function permanent() {
	const list = [];
	for (const [key, x] of MAIN_TREES) {
		list.push(plant(key, x, CENTER_Y));
		// Consuelda: 4 plantas a ~25 cm alrededor de cada planta principal.
		for (const [dx, dy] of [
			[-0.25, 0],
			[0.25, 0],
			[0, -0.25],
			[0, 0.25]
		])
			list.push(plant('consuelda', x + dx, CENTER_Y + dy));
	}
	for (const x of [1.5, 4.0, 6.5, 9.0, 11.5, 14.0]) list.push(plant('giganton', x, CENTER_Y));
	for (const x of [3.5, 6.0, 8.5, 11.0, 13.5, 14.5]) list.push(plant('morera', x, CENTER_Y));

	// Rompevientos: tagasaste → saúco → timbre → maguey/nopal (alternados por ciclo), cada 0.48 m.
	[...range(0.25, 14.65, 0.48)].forEach((x, i) => {
		const slot = i % 4;
		const cycle = Math.floor(i / 4);
		const key = slot === 0 ? 'tagasaste' : slot === 1 ? 'sauco' : slot === 2 ? 'timbre' : cycle % 2 === 0 ? 'maguey' : 'nopal';
		list.push(plant(key, x, -0.6, key === 'nopal' ? HEDGE_NOPAL : undefined));
	});
	// Fila frontal de romero: 38 plantas repartidas de x = 0.2 a 14.8.
	for (let i = 0; i < 38; i++) list.push(plant('romero', 0.2 + (i * 14.6) / 37, -0.1));
	return list;
}

// Cama NORTE (y 0.4–1.6), todo el año: dos hileras de lechuga; la hilera
// central (y = 1.0) queda para acelga, betabel, cilantro y arúgula.
function northBed() {
	const list = [];
	for (const y of [0.65, 1.35]) for (const x of range(0.3, 14.7, 0.35)) list.push(plant('lechuga', x, y));
	for (const [i, x] of [...range(0.5, 14.5, 0.5)].entries()) list.push(plant(['acelga', 'betabel', 'cilantro', 'arugula'][i % 4], x, 1.0));
	return list;
}

// Cama SUR (y 2.2–3.4), lluvias: hileras por estrato.
function southBedRains() {
	const list = [];
	[...range(0.4, 14.8, 0.6)].forEach((x, i) => {
		list.push(plant(i % 2 === 0 ? 'maiz' : 'girasol', x, 2.45));
		// Ayocote al pie de cada maíz, para que trepe en él.
		if (i % 2 === 0) list.push(plant('ayocote', x + 0.12, 2.55));
	});
	[...range(0.6, 14.6, 0.5)].forEach((x, i) => list.push(plant(i % 2 === 0 ? 'chile' : 'jitomate', x, 2.75)));
	[...range(0.4, 14.65, 0.75)].forEach((x, i) => list.push(plant(i % 2 === 0 ? 'amaranto' : 'epazote', x, 3.0)));
	for (const x of range(1.25, 13.75, 2.5)) list.push(plant('calabaza', x, 3.25));
	return list;
}

// Cama SUR, secas frías: alto brócoli/col/coliflor/chícharo, bajo rábano/zanahoria.
function southBedCold() {
	const list = [];
	[...range(0.4, 14.6, 0.45)].forEach((x, i) => list.push(plant(['brocoli', 'col', 'coliflor', 'chicharo'][i % 4], x, 2.6)));
	for (const y of [3.0, 3.25]) [...range(0.3, 14.7, 0.15)].forEach((x, i) => list.push(plant(i % 2 === 0 ? 'rabano' : 'zanahoria', x, y)));
	return list;
}

// --- Fondo con las franjas ----------------------------------------------------

function backgroundSvg(seasonLabel) {
	const cm = m => Math.round(m * 100);
	const Y = y => cm(y + OFFSET_Y);
	const strips = [
		{ y0: -1.3, y1: 0, fill: '#c8b88a', label: 'Rompevientos en colina (fuera del módulo) · viento del norte' },
		{ y0: 0, y1: 0.4, fill: '#e8e0d0', label: 'Pasillo 0.4 m' },
		{ y0: 0.4, y1: 1.6, fill: '#cfe8c4', label: 'Cama NORTE · hojas, media sombra invernal' },
		{ y0: 1.6, y1: 2.2, fill: '#a9cf9a', label: 'Línea central de árboles (y = 1.9) · poda a 1.5–2 m' },
		{ y0: 2.2, y1: 3.4, fill: '#f3e7a8', label: `Cama SUR · sol pleno · ${seasonLabel}` },
		{ y0: 3.4, y1: 4.0, fill: '#e8e0d0', label: 'Pasillo 0.6 m' }
	];
	const parts = strips.map(
		s =>
			`<rect x="0" y="${Y(s.y0)}" width="1500" height="${cm(s.y1 - s.y0)}" fill="${s.fill}"/>` +
			`<text x="8" y="${Y(s.y0) + 13}" font-size="11" fill="#33402a">${s.label}</text>`
	);
	parts.push(
		`<rect x="0" y="${Y(0)}" width="1500" height="400" fill="none" stroke="#558b2f" stroke-width="2"/>`,
		`<text x="1492" y="16" font-size="13" font-weight="700" text-anchor="end" fill="#33402a">N ↑</text>`,
		`<text x="${cm(7.5)}" y="${Y(1.6) + 11}" font-size="10" text-anchor="middle" fill="#33402a">Guaje EXISTENTE</text>`
	);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="530" viewBox="0 0 1500 530" font-family="system-ui, sans-serif">${parts.join('')}</svg>`;
	return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

// --- Descripción --------------------------------------------------------------

function description(season, missing) {
	const lines = [
		'San Martín Tlamapa, Puebla · 18.970935, -98.406331.',
		'Templado subhúmedo: lluvias jun–sep, secas oct–may, heladas dic–feb, viento fuerte del norte. Agua sólo de lluvia (tanque de 100,000 L); goteo + mulch.',
		`Módulo 15 × 4 m (eje largo oriente-poniente). El terreno incluye 1.3 m extra al norte para el rompevientos: el módulo va de y = 1.3 a 5.3. ${season}`,
		'Franjas (y del diseño, de norte a sur): rompevientos 0–1.3 · pasillo 1.3–1.7 · cama norte 1.7–2.9 · línea de árboles 2.9–3.5 (eje 3.2) · cama sur 3.5–4.7 · pasillo 4.7–5.3.',
		'Guaje: planta EXISTENTE (3 m), desmoche a 1.5 m. Línea central: poda a 1.5–2 m, lo podado va picado sobre las camas.',
		'Rompevientos: seto poroso (~50%), abierto abajo para que drene el aire frío.',
		'Calendario: oct 2026 formar camas (15–20 cm de zacate + composta), estacas de gigantón y morera con goteo, poda ligera del guaje, consorcio de secas frías, plátanos con mulch y protección antiheladas · dic–feb proteger plátanos y brotes · feb–mar 2027 desmoche fuerte del guaje a 1.5 m · jun 2027 rompevientos, frutales y consorcio de lluvias · en lluvias, cada 2–3 meses podar la línea y picar sobre las camas.'
	];
	if (missing.length) lines.push(`Faltan en el catálogo (no se incluyeron): ${missing.join(', ')}.`);
	return lines.join('\n');
}

// --- Salida -------------------------------------------------------------------

function build({ suffix, name, seasonText, seasonLabel, beds }) {
	const all = [...permanent(), ...beds];
	const missing = [...new Set(all.filter(p => !SPECIES[p.key].id).map(p => SPECIES[p.key].label))];
	const plants = all
		.filter(p => SPECIES[p.key].id)
		.map(p => ({
			speciesId: SPECIES[p.key].id,
			x: p.x,
			y: round(p.y + OFFSET_Y),
			...(p.pruneHeight !== undefined && { pruneHeight: p.pruneHeight }),
			...(p.pruneCrown !== undefined && { pruneCrown: p.pruneCrown }),
			species: SPECIES[p.key].label
		}));
	for (const p of plants) {
		if (p.x < 0 || p.y < 0 || p.x > PLOT.width || p.y > PLOT.length) throw new Error(`Planta fuera del terreno: ${JSON.stringify(p)}`);
	}
	if (plants.length > MAX_DESIGN_PLANTS) throw new Error(`Demasiadas plantas (${plants.length})`);
	const text = description(seasonText, missing);
	if (text.length > MAX_DESCRIPTION) throw new Error(`Descripción demasiado larga (${text.length})`);

	const design = {
		format: 'saf-hub-design',
		version: 1,
		name,
		description: text,
		plot: PLOT,
		plants,
		background: withBackground
			? { src: backgroundSvg(seasonLabel), naturalWidth: 1500, naturalHeight: 530, x: 0, y: 0, metersPerPixel: 0.01 }
			: undefined,
		layers: {
			background: { visible: true, locked: true, opacity: 0.6 },
			plants: { visible: true, locked: false, opacity: 1 }
		}
	};
	const file = join(here, `saf-hortalizas-tlamapa.${suffix}.json`);
	writeFileSync(file, `${JSON.stringify(design, null, '\t')}\n`);

	const counts = {};
	for (const p of plants) counts[p.species] = (counts[p.species] ?? 0) + 1;
	console.log(`\n${name} → ${file}\n  ${plants.length} plantas, descripción ${text.length}/${MAX_DESCRIPTION} caracteres`);
	for (const [label, count] of Object.entries(counts)) console.log(`  ${String(count).padStart(3)}  ${label}`);
	if (missing.length) console.log(`  Omitidas (no están en el catálogo): ${missing.join(', ')}`);
}

build({
	suffix: 'secas-frias',
	name: 'SAF hortalizas · Tlamapa · secas frías',
	seasonText:
		'Temporada: secas frías (oct–feb). Cama sur: alto brócoli, col, coliflor, chícharo; bajo rábano, zanahoria. Cama norte todo el año: lechuga, acelga, betabel, cilantro, arúgula. Secas cálidas (mar–may): descanso con mulch grueso.',
	seasonLabel: 'secas frías (oct–feb)',
	beds: [...northBed(), ...southBedCold()]
});

build({
	suffix: 'lluvias',
	name: 'SAF hortalizas · Tlamapa · lluvias',
	seasonText:
		'Temporada: lluvias (jun–sep). Cama sur: emergente maíz criollo y girasol; alto chile y jitomate; medio frijol ayocote (trepa en el maíz), amaranto, epazote; bajo calabaza de mata. Cama norte todo el año: lechuga, acelga, betabel, cilantro, arúgula.',
	seasonLabel: 'lluvias (jun–sep)',
	beds: [...northBed(), ...southBedRains()]
});

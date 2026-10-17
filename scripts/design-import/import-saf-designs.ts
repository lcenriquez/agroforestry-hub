// Importa diseños de SAF en formato neutro (`saf-design-export` v1) a la
// colección `designs`, un diseño por archivo, con la capa de datos de la app
// (adapters/designs.ts y adapters/storage.ts).
//
// Uso:
//   npx tsx scripts/design-import/import-saf-designs.ts --site=<config.ts>          # simulación + vista previa
//   IMPORT_EMAIL=... IMPORT_PASSWORD=... npx tsx scripts/design-import/import-saf-designs.ts --site=<config.ts> --apply [--project=<id>]
//   --site=<ruta>      módulo con la configuración del sitio (`export default` de un SiteConfig):
//                      archivos, ids de documento, especies y tamaños con manejo. Va en
//                      scripts/design-import/sites/, fuera de git, como los datos del terreno.
//   --sin-fondo        no sube el plano del sitio (p. ej. si Storage no está disponible);
//                      el fondo que ya tenga cada diseño se conserva. Volver a correrlo
//                      sin esta opción lo agrega.
//   --input=<carpeta>  dónde están los JSON (por defecto scripts/design-import/input/, fuera de git)
//
// - Idempotente: cada diseño tiene un id de documento fijo (en la configuración del sitio).
//   Volver a correrlo actualiza el mismo documento, conserva `createdAt` y no
//   escribe nada si no cambió. El plano del sitio se sube con un nombre que
//   depende de su contenido y las versiones anteriores se borran.
// - La simulación escribe en scripts/design-import/out/ (fuera de git) cada
//   diseño como JSON del Diseñador (`saf-hub-design`, se puede abrir con el
//   botón Importar de /disenador) y el plano del sitio en SVG.
// - Con FIRESTORE_EMULATOR_HOST etc. escribe en el emulador; si no, exige
//   --project=<id> (ver scripts/lib/firebase-node.ts).
//
// Cómo se representa lo que el Diseñador no tiene:
// - Sistema de coordenadas común: cada diseño usa como terreno el rectángulo
//   que contiene su `limite` y como origen su esquina noroeste; el origen va
//   en la descripción. Los tres llevan de fondo el mismo plano del sitio
//   (límites, zonas, elementos lineales) colocado en su posición, así cada
//   diseño muestra a sus vecinos alineados.
// - Polígonos, zonas (`rango_y`/`poligono`) y `elementos_lineales`: dibujados
//   en el plano del sitio (escala 1 px = 1 cm).
// - Funciones, manejo, plantas existentes, fase 2, planes de siembra, tareas y
//   notas: en la descripción (máx. 2000 caracteres). Si no cabe, se quitan
//   secciones en este orden: notas, zonas, planes de siembra, tareas, fase 2
//   (zonas y planes de siembra también están rotulados en el plano del sitio).
// - Especies sin documento en el catálogo: se omiten (no se inventan ids) y
//   se listan en la descripción.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { assertWriteTarget, connectFirebase, signIn } from '../lib/firebase-node';

import type { DesignBackground, DesignPlant, NewDesign } from '../../interfaces/Design';
import type { SpeciesType } from '../../interfaces/Species';

// --- Formato de entrada (saf-design-export v1) -------------------------------

type Point = [number, number];

export interface SourceCrop {
	nombre_comun: string;
	nombre_cientifico: string;
	estrato?: string;
	funcion?: string;
	manejo?: string;
}

export interface SourcePlant extends SourceCrop {
	x: number;
	y: number;
	fase?: number;
	existente?: boolean;
	notas?: string;
	reemplazo_fase2?: string;
}

interface SourceZone {
	id: string;
	nombre: string;
	tipo?: string;
	rango_y?: [number, number];
	poligono?: Point[];
	eje_y?: number;
	manejo?: string;
	cultivo?: SourceCrop;
}

interface SourceLine {
	tipo: string;
	nombre: string;
	trazo: Point[];
	altura_m?: number;
	notas?: string;
}

interface SourcePlan {
	zona: string;
	temporada: string;
	meses?: string;
	cultivos: SourceCrop[];
	notas?: string;
}

export interface SourceDesign {
	nombre: string;
	ubicacion?: { lugar?: string; lat?: number; lng?: number };
	clima?: string;
	sistema_coordenadas?: { rotacion_vs_oriente_poniente_grados?: number };
	descripcion?: string;
	limite: Point[];
	area_m2?: number;
	zonas?: SourceZone[];
	elementos_lineales?: SourceLine[];
	plantas: SourcePlant[];
	plantas_fase2?: SourcePlant[];
	planes_de_siembra?: SourcePlan[];
	tareas?: { cuando: string; accion: string }[];
	notas?: string[];
}

// --- Configuración por sitio (ver sites/*.ts) --------------------------------

export interface SiteConfig {
	key: string;
	title: string;
	designs: { file: string; docId: string; name: string }[];
	species: Record<string, { id: string } | { taxonomy: { genus: string; species: string } }>;
	managed: Record<string, [number, number]>;
	notes?: Record<string, string>;
	// Recuadro (coordenadas comunes, m) del plano del sitio donde se escriben tareas y notas.
	panel?: { x: number; y: number; width: number };
	adjustPlants?: (file: string, design: SourceDesign) => SourcePlant[];
}

const MAX_DESCRIPTION = 2000;
// Espacio que se deja para la línea «No cupo aquí…».
const DROPPED_NOTE_RESERVE = 120;
const METERS_PER_PIXEL = 0.01;
const SITE_MARGIN = 0.5;

const round = (value: number) => Math.round(value * 100) / 100;
const fmt = (value: number) => String(round(value));

// --- Geometría ---------------------------------------------------------------

function bounds(points: Point[]) {
	const xs = points.map(([x]) => x);
	const ys = points.map(([, y]) => y);
	return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

function isRectangle(points: Point[]): boolean {
	const b = bounds(points);
	return points.length === 4 && points.every(([x, y]) => (x === b.minX || x === b.maxX) && (y === b.minY || y === b.maxY));
}

// Tramo [min, max] de x que ocupa el polígono a la altura y (para rotular zonas).
function xRangeAtY(points: Point[], y: number): [number, number] | null {
	const xs: number[] = [];
	points.forEach(([x1, y1], index) => {
		const [x2, y2] = points[(index + 1) % points.length];
		if (y >= Math.min(y1, y2) && y <= Math.max(y1, y2) && y1 !== y2) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
	});
	return xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
}

// --- Plano del sitio (SVG en metros, 1 px = 1 cm) -----------------------------

const ZONE_FILL: Record<string, string> = {
	pasillo: '#e0e0e0',
	cama: '#d7ccc8',
	cama_biointensiva: '#bcaaa4',
	linea_arboles: '#c8e6c9'
};

function escapeXml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const pointsAttr = (points: Point[]) => points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');

function cropList(crops: SourceCrop[]) {
	return crops.map(crop => crop.nombre_comun.toLowerCase()).join(', ');
}

function buildSiteSvg(site: SiteConfig, designs: { name: string; source: SourceDesign }[]) {
	const all: Point[] = designs.flatMap(({ source }) => [
		...source.limite,
		...(source.elementos_lineales ?? []).flatMap(line => line.trazo),
		...(source.zonas ?? []).flatMap(zone => zone.poligono ?? [])
	]);
	const b = bounds(all);
	const minX = Math.floor((b.minX - SITE_MARGIN) * 10) / 10;
	const minY = Math.floor((b.minY - SITE_MARGIN) * 10) / 10;
	const width = round(Math.ceil((b.maxX + SITE_MARGIN) * 10) / 10 - minX);
	const height = round(Math.ceil((b.maxY + SITE_MARGIN) * 10) / 10 - minY);
	const text = (x: number, y: number, content: string, size: number, extra = '') =>
		`<text x="${fmt(x)}" y="${fmt(y)}" font-size="${size}" ${extra}>${escapeXml(content)}</text>`;

	const parts: string[] = [];
	designs.forEach(({ name, source }, index) => {
		const clipId = `limite${index + 1}`;
		const lb = bounds(source.limite);
		parts.push(`<clipPath id="${clipId}"><polygon points="${pointsAttr(source.limite)}"/></clipPath>`);
		parts.push(`<polygon points="${pointsAttr(source.limite)}" fill="#fafafa"/>`);
		const plans = source.planes_de_siembra ?? [];
		const labels: string[] = [];
		for (const zone of source.zonas ?? []) {
			let shape: string;
			let labelY: number;
			if (zone.poligono) {
				shape = `<polygon points="${pointsAttr(zone.poligono)}" fill="#dcedc8"/>`;
				labelY = (bounds(zone.poligono).minY + bounds(zone.poligono).maxY) / 2;
			} else if (zone.rango_y) {
				const [y0, y1] = zone.rango_y;
				const fill = ZONE_FILL[zone.tipo ?? ''] ?? '#a5d6a7';
				shape = `<rect x="${fmt(lb.minX)}" y="${fmt(y0)}" width="${fmt(lb.maxX - lb.minX)}" height="${fmt(y1 - y0)}" fill="${fill}"/>`;
				labelY = (y0 + y1) / 2;
			} else continue;
			parts.push(`<g clip-path="url(#${clipId})">${shape}</g>`);
			const range = xRangeAtY(source.limite, labelY) ?? [lb.minX, lb.maxX];
			const zonePlans = plans.filter(plan => plan.zona === zone.id && plan.cultivos.length);
			const crop = zone.cultivo ? ` · ${zone.cultivo.nombre_comun.toLowerCase()}` : '';
			labels.push(text(range[0] + 0.15, labelY + (zonePlans.length ? -0.04 : 0.07), `${zone.nombre}${crop}`, 0.2, 'font-weight="bold"'));
			if (zonePlans.length) {
				const line = zonePlans.map(plan => `${plan.temporada}${plan.meses ? ` (${plan.meses})` : ''}: ${cropList(plan.cultivos)}`).join(' · ');
				labels.push(text(range[0] + 0.15, labelY + 0.18, line, 0.15));
			}
		}
		parts.push(`<g clip-path="url(#${clipId})" fill="#37474f">${labels.join('')}</g>`);
		parts.push(`<polygon points="${pointsAttr(source.limite)}" fill="none" stroke="#37474f" stroke-width="0.05"/>`);
		for (const line of source.elementos_lineales ?? []) {
			const dash = line.tipo === 'opcional' ? '0.1 0.15' : '0.35 0.15';
			parts.push(
				`<polyline points="${pointsAttr(line.trazo)}" fill="none" stroke="#6d4c41" stroke-width="0.06" stroke-dasharray="${dash}"/>`,
				text(line.trazo[0][0] + 0.1, line.trazo[0][1] - 0.1, line.nombre, 0.15, 'fill="#6d4c41"')
			);
		}
		for (const plant of source.plantas.filter(item => item.existente)) {
			parts.push(
				`<circle cx="${fmt(plant.x)}" cy="${fmt(plant.y)}" r="0.35" fill="none" stroke="#b71c1c" stroke-width="0.04" stroke-dasharray="0.1 0.06"/>`,
				text(plant.x, plant.y + 0.55, `${plant.nombre_comun.toLowerCase()} existente`, 0.15, 'fill="#b71c1c" text-anchor="middle"')
			);
		}
		// Título: arriba del límite si hay margen (el más al norte), si no a su derecha.
		const title = `${name}`;
		if (lb.minY - minY >= 0.3) parts.push(text(lb.minX, lb.minY - 0.12, title, 0.25, 'font-weight="bold" fill="#263238"'));
		else parts.push(text(lb.maxX + 0.15, (lb.minY + lb.maxY) / 2, title, 0.22, 'font-weight="bold" fill="#263238"'));
	});

	// Calendario y notas de cada diseño, en un hueco del plano.
	if (site.panel) {
		const size = 0.14;
		const lineHeight = 0.19;
		const maxChars = Math.floor(site.panel.width / (size * 0.52));
		const wrap = (line: string) => {
			const out: string[] = [];
			let current = '';
			for (const word of line.split(' ')) {
				if ((current + ' ' + word).trim().length > maxChars) {
					out.push(current);
					current = `   ${word}`;
				} else current = (current + ' ' + word).trim() === '' ? word : `${current} ${word}`.replace(/^ /, '');
			}
			return [...out, current];
		};
		let y = site.panel.y;
		const lines: string[] = [text(site.panel.x, y, 'Calendario y notas', 0.2, 'font-weight="bold"')];
		for (const { name, source } of designs) {
			const items = [...(source.tareas ?? []).map(task => `• ${task.cuando}: ${task.accion}`), ...(source.notas ?? []).map(note => `• ${note}`)];
			if (!items.length) continue;
			y += lineHeight * 1.3;
			lines.push(text(site.panel.x, y, name, size, 'font-weight="bold"'));
			for (const line of items.flatMap(wrap)) {
				y += lineHeight;
				lines.push(text(site.panel.x, y, line, size, 'xml:space="preserve"'));
			}
		}
		parts.push(`<g fill="#37474f">${lines.join('')}</g>`);
	}

	// Escala de 5 m y norte.
	const sx = minX + 0.4;
	const sy = minY + height - 0.25;
	parts.push(
		`<path d="M${fmt(sx)} ${fmt(sy)} h5 M${fmt(sx)} ${fmt(sy - 0.08)} v0.16 M${fmt(sx + 5)} ${fmt(sy - 0.08)} v0.16" stroke="#263238" stroke-width="0.03" fill="none"/>`,
		text(sx + 2.5, sy - 0.08, '5 m', 0.16, 'text-anchor="middle" fill="#263238"'),
		text(minX + width - 0.3, minY + 0.35, 'N ↑', 0.25, 'text-anchor="end" font-weight="bold" fill="#263238"'),
		text(minX + width - 0.3, sy, `${site.title} · m; x poniente→oriente, y norte→sur`, 0.15, 'text-anchor="end" fill="#546e7a"')
	);

	const pxW = Math.round(width / METERS_PER_PIXEL);
	const pxH = Math.round(height / METERS_PER_PIXEL);
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${fmt(minX)} ${fmt(minY)} ${fmt(width)} ${fmt(height)}" font-family="sans-serif">` +
		`<rect x="${fmt(minX)}" y="${fmt(minY)}" width="${fmt(width)}" height="${fmt(height)}" fill="#ffffff"/>` +
		parts.join('') +
		'</svg>\n';
	return { svg, minX, minY, pxW, pxH };
}

// --- Descripción ---------------------------------------------------------------

interface Section {
	title: string;
	text: string;
	// Menor = más importante; al recortar se quitan primero las de número mayor.
	priority: number;
}

function unique(values: (string | undefined)[]) {
	return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

// Como `unique`, pero además quita los textos ya contenidos en otro («Desmochar a 2–3 m» en «Desmochar a 2–3 m; tutorar 2 años»).
function uniqueText(values: (string | undefined)[]) {
	const list = unique(values);
	return list.filter(value => !list.some(other => other !== value && other.toLowerCase().includes(value.toLowerCase())));
}

const plus = (value: number) => (value < 0 ? `− ${fmt(-value)}` : `+ ${fmt(value)}`);

// Mete las secciones por orden de importancia mientras quepan; las que no
// caben se reportan. Se muestran en el orden original.
function buildDescription(sections: Section[]) {
	const render = (list: Section[]) => list.map(section => (section.title ? `${section.title}: ${section.text}` : section.text)).join('\n');
	const kept = new Set<Section>();
	const dropped: string[] = [];
	for (const section of [...sections].sort((a, b) => a.priority - b.priority)) {
		const candidate = sections.filter(item => kept.has(item) || item === section);
		if (section.priority === 0 || render(candidate).length <= MAX_DESCRIPTION - DROPPED_NOTE_RESERVE) kept.add(section);
		else dropped.push(section.title);
	}
	const shown = sections.filter(item => kept.has(item));
	if (dropped.length) shown.push({ title: 'No cupo aquí (ver plano del sitio)', text: dropped.join(', '), priority: 0 });
	let text = render(shown);
	if (text.length > MAX_DESCRIPTION) text = `${text.slice(0, MAX_DESCRIPTION - 1)}…`;
	return { text, dropped };
}

// --- Conversión -----------------------------------------------------------------

interface Converted {
	docId: string;
	file: string;
	name: string;
	description: string;
	dropped: string[];
	plot: { width: number; length: number };
	origin: Point;
	plants: DesignPlant[];
	labels: string[];
	omitted: Map<string, number>;
	outside: string[];
}

function resolveSpecies(site: SiteConfig, catalog: SpeciesType[], taxonomyKey: (t: { genus: string; species: string }) => string) {
	const byId = new Map(catalog.map(item => [item._id, item]));
	const byTaxonomy = new Map(catalog.map(item => [taxonomyKey(item.taxonomy), item]));
	const resolved = new Map<string, SpeciesType | null>();
	for (const [name, target] of Object.entries(site.species)) {
		if ('id' in target) {
			const species = byId.get(target.id);
			if (!species) throw new Error(`La especie ${target.id} (${name}) ya no está en el catálogo: revisa sites/${site.key}.ts.`);
			resolved.set(name, species);
		} else resolved.set(name, byTaxonomy.get(taxonomyKey(target.taxonomy)) ?? null);
	}
	return resolved;
}

function convert(
	site: SiteConfig,
	entry: SiteConfig['designs'][number],
	source: SourceDesign,
	species: Map<string, SpeciesType | null>,
	withBackground: boolean
): Omit<Converted, 'description' | 'dropped'> & { sections: Section[] } {
	const b = bounds(source.limite);
	const origin: Point = [b.minX, b.minY];
	const plot = { width: round(b.maxX - b.minX), length: round(b.maxY - b.minY) };
	const sourcePlants = site.adjustPlants ? site.adjustPlants(entry.file, source) : source.plantas;

	const plants: DesignPlant[] = [];
	const labels: string[] = [];
	const omitted = new Map<string, number>();
	const outside: string[] = [];
	for (const plant of sourcePlants) {
		const name = plant.nombre_cientifico;
		if (!species.has(name)) throw new Error(`${entry.file}: «${name}» no está en sites/${site.key}.ts.`);
		const match = species.get(name);
		const label = `${plant.nombre_comun} (${name})`;
		if (!match) {
			omitted.set(label, (omitted.get(label) ?? 0) + 1);
			continue;
		}
		const x = round(plant.x - origin[0]);
		const y = round(plant.y - origin[1]);
		if (x < 0 || y < 0 || x > plot.width || y > plot.length) outside.push(`${label} en (${plant.x}, ${plant.y})`);
		const managed = site.managed[name];
		plants.push({
			id: `imp${String(plants.length + 1).padStart(3, '0')}`,
			speciesId: match._id,
			x,
			y,
			...(managed ? { pruneHeight: managed[0], pruneCrown: managed[1] } : {})
		});
		labels.push(label);
	}

	const sections: Section[] = [];
	if (source.descripcion) sections.push({ title: '', text: source.descripcion, priority: 0 });
	const place = source.ubicacion;
	const site_ = [place?.lugar, place?.lat !== undefined && place?.lng !== undefined ? `${place.lat}, ${place.lng}` : undefined]
		.filter(Boolean)
		.join(' · ');
	sections.push({ title: 'Sitio', text: [site_, source.clima].filter(Boolean).join('. '), priority: 0 });
	const rotation = source.sistema_coordenadas?.rotacion_vs_oriente_poniente_grados;
	sections.push({
		title: 'Coordenadas',
		text:
			`comunes del sitio en m (x poniente→oriente, y norte→sur, y < 0 = colinita${rotation ? `; ejes a ${rotation}° de E–O` : ''}). ` +
			`Origen local = (${fmt(origin[0])}, ${fmt(origin[1])}): x_común = x ${plus(origin[0])}, y_común = y ${plus(origin[1])}. ${withBackground ? 'Fondo: plano del sitio compartido, alineado.' : 'El plano del sitio se agrega de fondo al reimportar.'}`,
		priority: 0
	});
	if (!isRectangle(source.limite)) {
		sections.push({
			title: 'Límite',
			text: `polígono (común) ${source.limite.map(([x, y]) => `(${x}, ${y})`).join(' ')}${source.area_m2 ? `, ${source.area_m2} m²` : ''}; el terreno es su rectángulo (${fmt(plot.width * plot.length)} m²).`,
			priority: 0
		});
	}
	if (omitted.size) {
		sections.push({
			title: 'Faltan en el catálogo (no incluidas)',
			text: [...omitted].map(([label, count]) => `${label} ×${count}`).join(', '),
			priority: 0
		});
	}
	if (source.zonas?.length) {
		const zoneText = source.zonas
			.map(zone => {
				const where = zone.rango_y
					? ` y ${zone.rango_y[0]}…${zone.rango_y[1]}`
					: zone.poligono
						? ` y ${bounds(zone.poligono).minY}…${bounds(zone.poligono).maxY}`
						: '';
				return `${zone.nombre}${where}${zone.manejo ? ` (${zone.manejo})` : ''}`;
			})
			.join(' · ');
		sections.push({ title: 'Zonas (y común, en el fondo)', text: zoneText, priority: 5 });
	}
	if (source.elementos_lineales?.length) {
		sections.push({
			title: 'Elementos lineales (en el fondo)',
			text: source.elementos_lineales
				.map(line => `${line.nombre}${line.altura_m ? `, ${line.altura_m} m de alto` : ''}${line.notas ? `: ${line.notas}` : ''}`)
				.join(' · '),
			priority: 1
		});
	}

	// Notas por especie: función, manejo y notas del JSON (sin repetir).
	const byName = new Map<string, SourcePlant[]>();
	for (const plant of sourcePlants) byName.set(plant.nombre_cientifico, [...(byName.get(plant.nombre_cientifico) ?? []), plant]);
	// Las especies con las mismas notas se agrupan («Laurel, Tejocote: frutal»).
	const byDetails = new Map<string, string[]>();
	for (const [name, group] of byName) {
		const details = uniqueText([
			group.some(plant => plant.existente) ? 'EXISTENTE' : undefined,
			...group.map(plant => plant.funcion),
			...group.map(plant => plant.manejo),
			...group.map(plant => plant.notas),
			site.notes?.[name]
		]).join('; ');
		byDetails.set(details, [...(byDetails.get(details) ?? []), group[0].nombre_comun]);
	}
	const plantNotes = [...byDetails].map(([details, names]) => `${names.join(', ')}${details ? `: ${details}` : ''}`);
	sections.push({ title: 'Plantas', text: plantNotes.join(' · '), priority: 1 });

	const replacements = source.plantas.filter(plant => plant.reemplazo_fase2);
	if (replacements.length || source.plantas_fase2?.length) {
		const text = replacements.length
			? replacements.map(plant => `${plant.nombre_comun} x = ${plant.x} → ${plant.reemplazo_fase2}`).join(', ')
			: (source.plantas_fase2 ?? []).map(plant => `${plant.nombre_comun} en (${plant.x}, ${plant.y})`).join(', ');
		sections.push({ title: 'Fase 2', text: `${text} (sólo aquí, no en el plano).`, priority: 0 });
	}
	if (source.tareas?.length) {
		sections.push({
			title: 'Tareas (también en el plano)',
			text: source.tareas.map(task => `${task.cuando}: ${task.accion}`).join(' · '),
			priority: 3
		});
	}
	if (source.planes_de_siembra?.length) {
		const zoneName = (id: string) => source.zonas?.find(zone => zone.id === id)?.nombre.split(' (')[0] ?? id;
		sections.push({
			title: 'Planes de siembra (también en el fondo)',
			text: source.planes_de_siembra
				.map(
					plan =>
						`${zoneName(plan.zona)} · ${plan.temporada}${plan.meses ? ` ${plan.meses}` : ''}: ${plan.cultivos.length ? cropList(plan.cultivos) : (plan.notas ?? '—')}`
				)
				.join(' · '),
			priority: 4
		});
	}
	if (source.notas?.length) sections.push({ title: 'Notas (también en el plano)', text: source.notas.join(' · '), priority: 6 });

	return { docId: entry.docId, file: entry.file, name: entry.name, plot, origin, plants, labels, omitted, outside, sections };
}

// --- Main -----------------------------------------------------------------------

function findInput(dir: string, file: string): string {
	const match = existsSync(dir) ? readdirSync(dir).find(name => name === file || name.endsWith(`-${file}`)) : undefined;
	if (!match) throw new Error(`No encuentro ${file} en ${dir}.`);
	return join(dir, match);
}

// Firestore no conserva el orden de las claves de los mapas: se comparan ordenadas.
function stableStringify(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
	if (value && typeof value === 'object')
		return `{${Object.keys(value)
			.sort()
			.map(key => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
			.join(',')}}`;
	return JSON.stringify(value ?? null);
}

function sameContent(a: Partial<NewDesign>, b: Partial<NewDesign>) {
	const pick = (design: Partial<NewDesign>) =>
		stableStringify([design.name, design.description, design.plot, design.plants, design.background, design.authorId]);
	return pick(a) === pick(b);
}

async function main() {
	const args = process.argv.slice(2);
	const apply = args.includes('--apply');
	const withBackground = !args.includes('--sin-fondo');
	const inputArg = args.find(arg => arg.startsWith('--input='));
	const inputDir = inputArg ? inputArg.slice('--input='.length) : join(__dirname, 'input');
	const outDir = join(__dirname, 'out');
	const siteArg = args.find(arg => arg.startsWith('--site='))?.slice('--site='.length);
	if (!siteArg) throw new Error('Falta --site=<ruta a la configuración del sitio> (ver SiteConfig).');
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const site: SiteConfig = require(resolve(siteArg)).default;

	const sources = site.designs.map(entry => {
		const data = JSON.parse(readFileSync(findInput(inputDir, entry.file), 'utf8'));
		if (data.formato !== 'saf-design-export' || data.version !== 1) throw new Error(`${entry.file} no es saf-design-export v1.`);
		return { entry, source: data.diseno as SourceDesign };
	});

	await connectFirebase();
	const target = apply ? assertWriteTarget(args) : null;
	const { getSpecies } = await import('../../adapters/firestore');
	const { taxonomyKey } = await import('../../lib/text');
	const catalog = await getSpecies();
	if (!catalog.length) throw new Error('El catálogo `species` vino vacío: revisa la conexión.');
	const species = resolveSpecies(site, catalog, taxonomyKey);

	const site_ = buildSiteSvg(
		site,
		sources.map(({ entry, source }) => ({ name: entry.name, source }))
	);
	const svgHash = createHash('sha256').update(site_.svg).digest('hex').slice(0, 10);
	const svgFile = `import-${site.key}-sitio-${svgHash}.svg`;

	const designs: Converted[] = sources.map(({ entry, source }) => {
		const { sections, ...rest } = convert(site, entry, source, species, withBackground);
		const { text, dropped } = buildDescription(sections);
		return { ...rest, description: text, dropped };
	});

	console.log(`${apply ? `APLICANDO en ${target}` : 'SIMULACIÓN (usa --apply para escribir)'} — ${designs.length} diseños de ${inputDir}\n`);
	for (const design of designs) {
		console.log(`■ ${design.docId} — «${design.name}»`);
		console.log(
			`  terreno ${design.plot.width} × ${design.plot.length} m, origen común (${design.origin.join(', ')}), ${design.plants.length} plantas`
		);
		console.log(
			`  descripción: ${design.description.length}/${MAX_DESCRIPTION} caracteres${design.dropped.length ? `; no cupo: ${design.dropped.join(', ')}` : ''}`
		);
		for (const [label, count] of design.omitted) console.log(`  ⚠ omitida (no está en el catálogo): ${label} ×${count}`);
		for (const item of design.outside) console.log(`  ⚠ fuera del terreno: ${item}`);
	}
	console.log(`\nPlano del sitio: ${site_.pxW} × ${site_.pxH} px (${svgFile})`);

	// Vista previa local (fuera de git): JSON importables desde /disenador y el SVG.
	mkdirSync(outDir, { recursive: true });
	writeFileSync(join(outDir, `${site.key}-sitio.svg`), site_.svg);
	const dataUrl = `data:image/svg+xml;base64,${Buffer.from(site_.svg).toString('base64')}`;
	for (const design of designs) {
		const preview = {
			format: 'saf-hub-design',
			version: 1,
			name: design.name,
			description: design.description,
			plot: design.plot,
			plants: design.plants.map(({ speciesId, x, y, pruneHeight, pruneCrown }, index) => ({
				speciesId,
				x,
				y,
				pruneHeight,
				pruneCrown,
				species: design.labels[index]
			})),
			background: backgroundFor(design, site_, dataUrl)
		};
		writeFileSync(join(outDir, `${design.docId}.json`), `${JSON.stringify(preview, null, 2)}\n`);
	}
	console.log(`Vista previa en ${outDir}`);
	if (!apply) return;

	const uid = await signIn('IMPORT_EMAIL', 'IMPORT_PASSWORD');
	const { getDesignById, saveDesignWithId } = await import('../../adapters/designs');
	const { deleteDesignBackground, uploadDesignBackground } = await import('../../adapters/storage');

	const existing = new Map<string, Awaited<ReturnType<typeof getDesignById>>>();
	for (const design of designs) existing.set(design.docId, await getDesignById(design.docId));

	const storagePath = `designs/${uid}/${svgFile}`;
	const reuse = [...existing.values()].find(item => item?.background?.storagePath === storagePath)?.background;
	let src = reuse?.src;
	if (withBackground && !src) {
		const uploaded = await uploadDesignBackground(uid, new Blob([site_.svg], { type: 'image/svg+xml' }), svgFile);
		src = uploaded.url;
		console.log(`\n↑ plano del sitio subido a ${uploaded.path}`);
	}

	const now = Date.now();
	for (const design of designs) {
		const current = existing.get(design.docId);
		const background: DesignBackground | null =
			withBackground && src ? { ...backgroundFor(design, site_, src), storagePath } : (current?.background ?? null);
		const next: NewDesign = {
			name: design.name,
			description: design.description,
			plot: design.plot,
			plants: design.plants,
			background,
			// Las capas que el autor haya ajustado en la app se conservan.
			...(current?.layers ? { layers: current.layers } : {}),
			authorId: uid,
			createdAt: current?.createdAt ?? now,
			updatedAt: now
		};
		if (current && sameContent(current, next)) {
			console.log(`= ${design.docId}: sin cambios`);
			continue;
		}
		await saveDesignWithId(design.docId, next);
		console.log(`✓ ${design.docId}: ${current ? 'actualizado' : 'creado'}`);
	}

	// Versiones anteriores del plano del sitio que ya no usa ningún diseño.
	const prefix = `designs/${uid}/import-${site.key}-sitio-`;
	const stale = unique([...existing.values()].map(item => item?.background?.storagePath)).filter(
		path => withBackground && path.startsWith(prefix) && path !== storagePath
	);
	for (const path of stale) {
		await deleteDesignBackground(path).catch(error => console.warn(`⚠ no se pudo borrar ${path}: ${error.code ?? error}`));
		console.log(`- plano anterior borrado: ${path}`);
	}
}

function backgroundFor(design: Converted, svg: { minX: number; minY: number; pxW: number; pxH: number }, src: string): DesignBackground {
	return {
		src,
		naturalWidth: svg.pxW,
		naturalHeight: svg.pxH,
		x: round(svg.minX - design.origin[0]),
		y: round(svg.minY - design.origin[1]),
		metersPerPixel: METERS_PER_PIXEL
	};
}

main().then(
	() => process.exit(0),
	error => {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
);

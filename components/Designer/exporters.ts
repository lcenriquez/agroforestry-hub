import { MAX_DESIGN_NAME_LENGTH, MAX_DESIGN_PLANTS } from '../../interfaces/Design';
import { normalizeBackground } from './background';
import { formatNumber, shortLabel } from './strata';
import { newPlantId, PLOT_MAX, PLOT_MIN, roundCoord } from './useDesignState';

import type { DesignContent, DesignLayers, DesignPlant, DesignPlot } from '../../interfaces/Design';
import type { PlantSpec, StratumInfo } from './strata';

// Exportación del diseño: SVG/PNG de la vista en planta (generado desde los
// datos, independiente del zoom en pantalla) y JSON para respaldar/compartir.

export const JSON_FORMAT = 'saf-hub-design';

function escapeXml(text: string): string {
	return text.replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] as string);
}

export function niceStep(raw: number): number {
	if (!(raw > 0)) return 1;
	const power = Math.pow(10, Math.floor(Math.log10(raw)));
	const fraction = raw / power;
	const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
	return nice * power;
}

interface PlanSvgOptions {
	name: string;
	plot: DesignPlot;
	plants: DesignPlant[];
	specFor: (speciesId: string) => PlantSpec;
	strata: StratumInfo[];
	gridSpacing: number | null;
}

export function buildPlanSvg({ name, plot, plants, specFor, strata, gridSpacing }: PlanSvgOptions): { svg: string; width: number; height: number } {
	// Límites: el terreno más cualquier copa que se salga de él.
	let minX = 0;
	let minY = 0;
	let maxX = plot.width;
	let maxY = plot.length;
	for (const plant of plants) {
		const r = specFor(plant.speciesId).crown / 2;
		minX = Math.min(minX, plant.x - r);
		minY = Math.min(minY, plant.y - r);
		maxX = Math.max(maxX, plant.x + r);
		maxY = Math.max(maxY, plant.y + r);
	}
	const spanX = maxX - minX;
	const spanY = maxY - minY;
	const ppm = Math.max(2, Math.min(1100 / spanX, 1400 / spanY, 200));
	const margin = 32;
	const header = 56;
	const usedStrata = strata.filter(s => plants.some(p => specFor(p.speciesId).stratum._id === s._id));
	const legendRows = Math.ceil(usedStrata.length / 3);
	const footer = 48 + legendRows * 22;
	const width = Math.round(Math.max(480, spanX * ppm + margin * 2));
	const height = Math.round(spanY * ppm + margin * 2 + header + footer);
	const ox = margin - minX * ppm + (width - margin * 2 - spanX * ppm) / 2;
	const oy = margin + header - minY * ppm;
	const X = (x: number) => (ox + x * ppm).toFixed(1);
	const Y = (y: number) => (oy + y * ppm).toFixed(1);

	const parts: string[] = [];
	parts.push(`<rect width="${width}" height="${height}" fill="#ffffff"/>`);
	parts.push(
		`<text x="${margin}" y="${margin + 4}" font-size="20" font-weight="700" fill="#1a202c">${escapeXml(name || 'Diseño de SAF')}</text>`,
		`<text x="${margin}" y="${margin + 26}" font-size="13" fill="#4a5568">${escapeXml(
			`Terreno ${formatNumber(plot.width)} × ${formatNumber(plot.length)} m · ${plants.length} plantas · SAF Hub`
		)}</text>`
	);
	parts.push(
		`<rect x="${X(0)}" y="${Y(0)}" width="${(plot.width * ppm).toFixed(1)}" height="${(plot.length * ppm).toFixed(1)}" fill="#f1f8e9" stroke="#558b2f" stroke-width="2"/>`
	);
	if (gridSpacing && gridSpacing * ppm >= 6) {
		let d = '';
		for (let x = gridSpacing; x < plot.width - 1e-6; x += gridSpacing) d += `M${X(x)} ${Y(0)}V${Y(plot.length)}`;
		for (let y = gridSpacing; y < plot.length - 1e-6; y += gridSpacing) d += `M${X(0)} ${Y(y)}H${X(plot.width)}`;
		if (d) parts.push(`<path d="${d}" stroke="#c5d6b5" stroke-width="1" fill="none"/>`);
	}

	const sorted = [...plants].sort((a, b) => specFor(b.speciesId).height - specFor(a.speciesId).height);
	for (const plant of sorted) {
		const spec = specFor(plant.speciesId);
		const r = Math.max(0.05, spec.crown / 2) * ppm;
		parts.push(
			`<circle cx="${X(plant.x)}" cy="${Y(plant.y)}" r="${r.toFixed(1)}" fill="${spec.stratum.color}" fill-opacity="0.45" stroke="${spec.stratum.color}" stroke-width="1.5"${
				spec.missing ? ' stroke-dasharray="4 3"' : ''
			}/>`,
			`<circle cx="${X(plant.x)}" cy="${Y(plant.y)}" r="2" fill="${spec.stratum.color}"/>`
		);
	}
	for (const plant of sorted) {
		const spec = specFor(plant.speciesId);
		if (spec.crown * ppm < 44) continue;
		parts.push(
			`<text x="${X(plant.x)}" y="${(oy + plant.y * ppm + 14).toFixed(1)}" font-size="11" text-anchor="middle" fill="#1a202c" stroke="#ffffff" stroke-width="3" paint-order="stroke">${escapeXml(
				shortLabel(spec.name)
			)}</text>`
		);
	}

	// Barra de escala.
	const step = niceStep(110 / ppm);
	const barY = oy + maxY * ppm + 30;
	parts.push(
		`<rect x="${margin}" y="${barY.toFixed(1)}" width="${(step * ppm).toFixed(1)}" height="6" fill="#2d3748"/>`,
		`<text x="${margin}" y="${(barY + 20).toFixed(1)}" font-size="12" fill="#2d3748">${formatNumber(step)} m</text>`
	);
	usedStrata.forEach((stratum, index) => {
		const col = index % 3;
		const row = Math.floor(index / 3);
		const lx = margin + 160 + col * 170;
		const ly = barY + row * 22;
		parts.push(
			`<rect x="${lx}" y="${ly.toFixed(1)}" width="14" height="14" rx="7" fill="${stratum.color}" fill-opacity="0.6" stroke="${stratum.color}"/>`,
			`<text x="${lx + 20}" y="${(ly + 11).toFixed(1)}" font-size="12" fill="#2d3748">${escapeXml(shortLabel(stratum.name, 22))}</text>`
		);
	});

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">${parts.join(
		''
	)}</svg>`;
	return { svg, width, height };
}

export function slugify(name: string): string {
	const slug = name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
	return slug || 'diseno-saf';
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function svgToPngBlob(svg: string, width: number, height: number, scale = 2): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			const canvas = document.createElement('canvas');
			const factor = Math.min(scale, 8000 / Math.max(width, height));
			canvas.width = Math.round(width * factor);
			canvas.height = Math.round(height * factor);
			const context = canvas.getContext('2d');
			if (!context) {
				reject(new Error('Tu navegador no permite generar la imagen.'));
				return;
			}
			context.scale(factor, factor);
			context.drawImage(image, 0, 0, width, height);
			canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))), 'image/png');
		};
		image.onerror = () => reject(new Error('No se pudo generar la imagen.'));
		image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	});
}

export interface ImportedDesign {
	name: string;
	description?: string;
	content: DesignContent;
	layers?: unknown;
}

export function designToJson(
	name: string,
	description: string | undefined,
	content: DesignContent,
	specFor: (id: string) => PlantSpec,
	layers?: DesignLayers
): string {
	return JSON.stringify(
		{
			format: JSON_FORMAT,
			version: 1,
			exportedAt: new Date().toISOString(),
			name,
			description: description || undefined,
			plot: content.plot,
			plants: content.plants.map(plant => {
				const spec = specFor(plant.speciesId);
				return { speciesId: plant.speciesId, x: plant.x, y: plant.y, species: spec.missing ? undefined : `${spec.name} (${spec.scientificName})` };
			}),
			background: content.background ? { ...content.background, storagePath: undefined } : undefined,
			layers
		},
		null,
		2
	);
}

function toNumber(value: unknown): number | null {
	const num = typeof value === 'string' ? Number(value) : value;
	return typeof num === 'number' && Number.isFinite(num) ? num : null;
}

// Valida un JSON importado (de este mismo formato) y genera ids nuevos para las plantas.
export function parseDesignJson(text: string): ImportedDesign {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		throw new Error('El archivo no es un JSON válido.');
	}
	if (!data || typeof data !== 'object') throw new Error('El archivo no contiene un diseño.');
	const raw = data as Record<string, unknown>;
	if (raw.format !== undefined && raw.format !== JSON_FORMAT) throw new Error('El archivo no es un diseño de SAF Hub.');

	const plotRaw = (raw.plot ?? {}) as Record<string, unknown>;
	const width = toNumber(plotRaw.width);
	const length = toNumber(plotRaw.length);
	if (width === null || length === null || width <= 0 || length <= 0) throw new Error('El diseño no tiene medidas de terreno válidas.');
	if (!Array.isArray(raw.plants)) throw new Error('El diseño no tiene una lista de plantas.');

	const plants: DesignPlant[] = [];
	for (const item of raw.plants.slice(0, MAX_DESIGN_PLANTS)) {
		if (!item || typeof item !== 'object') continue;
		const entry = item as Record<string, unknown>;
		const x = toNumber(entry.x);
		const y = toNumber(entry.y);
		if (typeof entry.speciesId !== 'string' || !entry.speciesId || x === null || y === null) continue;
		plants.push({ id: newPlantId(), speciesId: entry.speciesId, x: roundCoord(x), y: roundCoord(y) });
	}

	const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, MAX_DESIGN_NAME_LENGTH) : 'Diseño importado';
	const description = typeof raw.description === 'string' ? raw.description.slice(0, 2000) : undefined;
	return {
		name,
		description,
		content: {
			plot: { width: Math.min(PLOT_MAX, Math.max(PLOT_MIN, width)), length: Math.min(PLOT_MAX, Math.max(PLOT_MIN, length)) },
			plants,
			background: normalizeBackground(raw.background)
		},
		layers: raw.layers
	};
}

import { MAX_BACKGROUND_SIDE } from '../../interfaces/Design';

import type { DesignBackground, DesignLayers, DesignLayerState, DesignPlot } from '../../interfaces/Design';

// Imagen de fondo y capas del plano: lectura/reducción de la imagen,
// calibración a escala y normalización de datos guardados (Firestore,
// borrador local o JSON importado, que pudieron editarse a mano).

export const DEFAULT_LAYERS: DesignLayers = {
	background: { visible: true, locked: false, opacity: 0.85 },
	plants: { visible: true, locked: false, opacity: 1 }
};

function toFinite(value: unknown): number | null {
	const num = typeof value === 'string' ? Number(value) : value;
	return typeof num === 'number' && Number.isFinite(num) ? num : null;
}

function normalizeLayer(value: unknown, fallback: DesignLayerState): DesignLayerState {
	if (!value || typeof value !== 'object') return { ...fallback };
	const raw = value as Record<string, unknown>;
	const opacity = toFinite(raw.opacity);
	return {
		visible: typeof raw.visible === 'boolean' ? raw.visible : fallback.visible,
		locked: typeof raw.locked === 'boolean' ? raw.locked : fallback.locked,
		opacity: opacity === null ? fallback.opacity : Math.min(1, Math.max(0.05, opacity))
	};
}

export function normalizeLayers(value: unknown): DesignLayers {
	const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
	return {
		background: normalizeLayer(raw.background, DEFAULT_LAYERS.background),
		plants: normalizeLayer(raw.plants, DEFAULT_LAYERS.plants)
	};
}

// Sólo se aceptan URLs https (Storage) o data URLs de imagen.
function isImageSrc(src: unknown): src is string {
	return typeof src === 'string' && (src.startsWith('https://') || src.startsWith('data:image/'));
}

export function normalizeBackground(value: unknown): DesignBackground | null {
	if (!value || typeof value !== 'object') return null;
	const raw = value as Record<string, unknown>;
	const naturalWidth = toFinite(raw.naturalWidth);
	const naturalHeight = toFinite(raw.naturalHeight);
	const x = toFinite(raw.x);
	const y = toFinite(raw.y);
	const metersPerPixel = toFinite(raw.metersPerPixel);
	if (!isImageSrc(raw.src) || !naturalWidth || !naturalHeight || naturalWidth <= 0 || naturalHeight <= 0) return null;
	if (x === null || y === null || !metersPerPixel || metersPerPixel <= 0) return null;
	return {
		src: raw.src,
		storagePath: typeof raw.storagePath === 'string' ? raw.storagePath : undefined,
		naturalWidth,
		naturalHeight,
		x,
		y,
		metersPerPixel
	};
}

export function backgroundSize(bg: DesignBackground) {
	return { width: bg.naturalWidth * bg.metersPerPixel, height: bg.naturalHeight * bg.metersPerPixel };
}

// Lee un archivo de imagen y lo reduce (lado mayor ≤ MAX_BACKGROUND_SIDE) a
// JPEG, para que el borrador y la subida a Storage no pesen de más.
export async function readBackgroundFile(file: File): Promise<{ src: string; naturalWidth: number; naturalHeight: number }> {
	if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen.');
	const url = URL.createObjectURL(file);
	try {
		const image = await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
			img.src = url;
		});
		const scale = Math.min(1, MAX_BACKGROUND_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
		const width = Math.max(1, Math.round(image.naturalWidth * scale));
		const height = Math.max(1, Math.round(image.naturalHeight * scale));
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Tu navegador no permite procesar la imagen.');
		context.drawImage(image, 0, 0, width, height);
		return { src: canvas.toDataURL('image/jpeg', 0.85), naturalWidth: width, naturalHeight: height };
	} finally {
		URL.revokeObjectURL(url);
	}
}

// Fondo nuevo: ocupa el ancho del terreno, empezando en la esquina (0, 0).
// Es sólo un punto de partida; la escala real se fija con «Calibrar».
export function initialBackground(image: { src: string; naturalWidth: number; naturalHeight: number }, plot: DesignPlot): DesignBackground {
	return { ...image, x: 0, y: 0, metersPerPixel: plot.width / image.naturalWidth };
}

// Calibración con dos puntos marcados sobre la imagen (en metros del plano
// actual) y la distancia real entre ellos: se reescala la imagen dejando fijo
// el primer punto.
export function calibrateBackground(
	bg: DesignBackground,
	a: { x: number; y: number },
	b: { x: number; y: number },
	realDistance: number
): DesignBackground {
	const current = Math.hypot(b.x - a.x, b.y - a.y);
	if (!(current > 0) || !(realDistance > 0)) return bg;
	const metersPerPixel = (bg.metersPerPixel * realDistance) / current;
	const px = (a.x - bg.x) / bg.metersPerPixel;
	const py = (a.y - bg.y) / bg.metersPerPixel;
	return { ...bg, metersPerPixel, x: a.x - px * metersPerPixel, y: a.y - py * metersPerPixel };
}

export function dataUrlToBlob(dataUrl: string): Blob {
	const [header, data] = dataUrl.split(',');
	const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
	const bytes = atob(data);
	const buffer = new Uint8Array(bytes.length);
	for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
	return new Blob([buffer], { type: mime });
}

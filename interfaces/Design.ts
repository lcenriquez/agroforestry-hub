// Diseño de un SAF hecho en el Diseñador (/disenador). Sólo se guarda la
// especie (por id), la posición y, si se maneja con poda, el tamaño con manejo
// de cada planta: altura y copa de adulta, estrato y
// funciones se resuelven contra el catálogo `species` al abrir el diseño, así
// el diseño refleja las correcciones que se hagan al catálogo.

// Medidas del terreno en metros. `width` corre sobre el eje X (izquierda a
// derecha en la vista en planta) y `length` sobre el eje Y (arriba a abajo).
export interface DesignPlot {
	width: number;
	length: number;
}

// Posición en metros desde la esquina superior izquierda del terreno.
// `pruneHeight` y `pruneCrown` (opcionales, en metros) son el tamaño con
// manejo (poda): si están, se dibuja y analiza la planta con ellos en lugar de
// la altura y copa de adulta sin podar del catálogo. Si no se usan, se omiten
// (nunca `undefined`: Firestore lo rechaza dentro de la lista de plantas).
export interface DesignPlant {
	id: string;
	speciesId: string;
	x: number;
	y: number;
	pruneHeight?: number;
	pruneCrown?: number;
}

// Imagen de fondo (foto aérea, plano) calibrada a escala. Se dibuja con su
// esquina superior izquierda en (x, y) metros y cada píxel mide
// `metersPerPixel`. `src` es la URL de Firebase Storage, o un data URL
// mientras el diseño sólo vive como borrador local.
export interface DesignBackground {
	src: string;
	storagePath?: string;
	naturalWidth: number;
	naturalHeight: number;
	x: number;
	y: number;
	metersPerPixel: number;
}

// Contenido editable de un diseño (lo que entra al historial de deshacer).
export interface DesignContent {
	plot: DesignPlot;
	plants: DesignPlant[];
	background?: DesignBackground | null;
}

// Estado de cada capa del plano. No entra al historial de deshacer (mostrar u
// ocultar una capa no es un cambio del diseño), pero sí se guarda con él.
export interface DesignLayerState {
	visible: boolean;
	locked: boolean;
	opacity: number; // 0..1
}

export type DesignLayerId = 'background' | 'plants';

export type DesignLayers = Record<DesignLayerId, DesignLayerState>;

export interface Design extends DesignContent {
	// Id del documento de Firestore (asignado en el adapter, no viene en `.data()`).
	_id: string;
	name: string;
	description?: string;
	layers?: DesignLayers;
	authorId: string;
	// Epoch ms (Date.now()).
	createdAt: number;
	updatedAt: number;
}

export type NewDesign = Omit<Design, '_id'>;

export type DesignUpdate = Pick<Design, 'name' | 'plot' | 'plants' | 'updatedAt'> & {
	description?: string;
	background?: DesignBackground | null;
	layers?: DesignLayers;
};

export const MAX_DESIGN_PLANTS = 1000;
export const MAX_DESIGN_NAME_LENGTH = 120;

// Lado mayor (px) al que se reduce la imagen de fondo antes de guardarla.
export const MAX_BACKGROUND_SIDE = 3000;
export const MAX_BACKGROUND_BYTES = 10 * 1024 * 1024;

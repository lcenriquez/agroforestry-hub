// Diseño de un SAF hecho en el Diseñador (/disenador). Sólo se guarda la
// especie (por id) y la posición de cada planta: altura, copa, estrato y
// funciones se resuelven contra el catálogo `species` al abrir el diseño, así
// el diseño refleja las correcciones que se hagan al catálogo.

// Medidas del terreno en metros. `width` corre sobre el eje X (izquierda a
// derecha en la vista en planta) y `length` sobre el eje Y (arriba a abajo).
export interface DesignPlot {
	width: number;
	length: number;
}

// Posición en metros desde la esquina superior izquierda del terreno.
export interface DesignPlant {
	id: string;
	speciesId: string;
	x: number;
	y: number;
}

// Contenido editable de un diseño (lo que entra al historial de deshacer).
export interface DesignContent {
	plot: DesignPlot;
	plants: DesignPlant[];
}

export interface Design extends DesignContent {
	// Id del documento de Firestore (asignado en el adapter, no viene en `.data()`).
	_id: string;
	name: string;
	description?: string;
	authorId: string;
	// Epoch ms (Date.now()).
	createdAt: number;
	updatedAt: number;
}

export type NewDesign = Omit<Design, '_id'>;

export type DesignUpdate = Pick<Design, 'name' | 'plot' | 'plants' | 'updatedAt'> & { description?: string };

export const MAX_DESIGN_PLANTS = 1000;
export const MAX_DESIGN_NAME_LENGTH = 120;

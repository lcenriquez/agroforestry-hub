import { MAX_DESIGN_NAME_LENGTH, MAX_DESIGN_PLANTS } from '../../interfaces/Design';
import { normalizeBackground } from './background';
import { PLOT_MAX, PLOT_MIN } from './useDesignState';

import type { DesignContent, DesignLayers } from '../../interfaces/Design';

// Borrador local del diseño (localStorage): se guarda solo en cada cambio para
// no perder el trabajo al recargar, con o sin sesión. Todo acceso va en
// try/catch (modo privado, almacenamiento bloqueado o lleno) y nunca durante
// el render del servidor.

const DRAFT_KEY = 'saf-hub:designer:draft:v1';
const PREFS_KEY = 'saf-hub:designer:prefs:v1';

export interface DesignDraft {
	name: string;
	description?: string;
	content: DesignContent;
	layers?: DesignLayers;
	// Diseño de la nube que se está editando (y de quién es), si aplica.
	cloudId: string | null;
	cloudOwner: string | null;
	// Contenido tal como quedó la última vez que se guardó en la nube (para
	// saber si hay cambios sin guardar después de recargar).
	cloudSnapshot: string | null;
	savedAt: number;
}

export interface DesignerPrefs {
	hideOnboarding?: boolean;
	showGrid?: boolean;
	snap?: boolean;
	gridSpacing?: number;
	hiddenStrata?: string[];
}

function storage(): Storage | null {
	try {
		return typeof window !== 'undefined' ? window.localStorage : null;
	} catch {
		return null;
	}
}

function isValidContent(value: unknown): value is DesignContent {
	if (!value || typeof value !== 'object') return false;
	const content = value as DesignContent;
	const { plot, plants } = content;
	if (!plot || !(plot.width >= PLOT_MIN && plot.width <= PLOT_MAX) || !(plot.length >= PLOT_MIN && plot.length <= PLOT_MAX)) return false;
	if (!Array.isArray(plants) || plants.length > MAX_DESIGN_PLANTS) return false;
	return plants.every(p => p && typeof p.id === 'string' && typeof p.speciesId === 'string' && Number.isFinite(p.x) && Number.isFinite(p.y));
}

export function loadDraft(): DesignDraft | null {
	try {
		const raw = storage()?.getItem(DRAFT_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw) as Partial<DesignDraft>;
		if (!isValidContent(data.content)) return null;
		return {
			name: typeof data.name === 'string' ? data.name.slice(0, MAX_DESIGN_NAME_LENGTH) : '',
			description: typeof data.description === 'string' ? data.description : undefined,
			content: { ...data.content, background: normalizeBackground(data.content.background) },
			layers: data.layers,
			cloudId: typeof data.cloudId === 'string' ? data.cloudId : null,
			cloudOwner: typeof data.cloudOwner === 'string' ? data.cloudOwner : null,
			cloudSnapshot: typeof data.cloudSnapshot === 'string' ? data.cloudSnapshot : null,
			savedAt: typeof data.savedAt === 'number' ? data.savedAt : 0
		};
	} catch {
		return null;
	}
}

export function saveDraft(draft: DesignDraft): boolean {
	try {
		const store = storage();
		if (!store) return false;
		store.setItem(DRAFT_KEY, JSON.stringify(draft));
		return true;
	} catch {
		return false;
	}
}

export function loadPrefs(): DesignerPrefs {
	try {
		const raw = storage()?.getItem(PREFS_KEY);
		const data = raw ? (JSON.parse(raw) as DesignerPrefs) : {};
		return data && typeof data === 'object' ? data : {};
	} catch {
		return {};
	}
}

export function savePrefs(prefs: DesignerPrefs) {
	try {
		storage()?.setItem(PREFS_KEY, JSON.stringify(prefs));
	} catch {
		// Sin almacenamiento disponible: las preferencias sólo duran la sesión.
	}
}

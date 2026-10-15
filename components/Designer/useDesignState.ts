import { useCallback, useMemo, useReducer } from 'react';

import { MAX_DESIGN_PLANTS } from '../../interfaces/Design';
import { withManagedSize } from './managedSize';

import type { DesignBackground, DesignContent, DesignPlant, DesignPlot } from '../../interfaces/Design';
import type { ManagedSize } from './managedSize';

// Estado del diseño con historial para deshacer/rehacer. Sólo el contenido
// (terreno + plantas) entra al historial; nombre, selección y vista no.

export const DEFAULT_PLOT: DesignPlot = { width: 20, length: 10 };
const HISTORY_LIMIT = 100;

export const PLOT_MIN = 1;
export const PLOT_MAX = 1000;

interface HistoryState {
	past: DesignContent[];
	present: DesignContent;
	future: DesignContent[];
	// Contenido al empezar a arrastrar: los movimientos intermedios no entran
	// al historial, sólo el resultado final al soltar.
	dragOrigin: DesignContent | null;
}

export type DesignAction =
	| { type: 'setPlot'; plot: DesignPlot }
	| { type: 'addPlants'; plants: DesignPlant[] }
	| { type: 'removePlants'; ids: string[] }
	| { type: 'movePlants'; moves: { id: string; x: number; y: number }[] }
	| { type: 'setManagedSize'; ids: string[]; size: ManagedSize }
	| { type: 'setBackground'; background: DesignBackground | null }
	| { type: 'moveBackground'; x: number; y: number }
	| { type: 'replaceBackgroundSrc'; from: string; src: string; storagePath?: string }
	| { type: 'beginDrag' }
	| { type: 'endDrag' }
	| { type: 'load'; content: DesignContent }
	| { type: 'undo' }
	| { type: 'redo' };

export function emptyContent(): DesignContent {
	return { plot: { ...DEFAULT_PLOT }, plants: [] };
}

export function roundCoord(value: number): number {
	return Math.round(value * 100) / 100;
}

let idCounter = 0;
export function newPlantId(): string {
	idCounter = (idCounter + 1) % 1e6;
	return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}${idCounter.toString(36)}`;
}

function commit(state: HistoryState, present: DesignContent): HistoryState {
	if (present === state.present) return state;
	const base = state.dragOrigin ?? state.present;
	return { past: [...state.past, base].slice(-HISTORY_LIMIT), present, future: [], dragOrigin: null };
}

function reducer(state: HistoryState, action: DesignAction): HistoryState {
	const { present } = state;
	switch (action.type) {
		case 'setPlot': {
			const width = Math.min(PLOT_MAX, Math.max(PLOT_MIN, action.plot.width));
			const length = Math.min(PLOT_MAX, Math.max(PLOT_MIN, action.plot.length));
			if (width === present.plot.width && length === present.plot.length) return state;
			return commit(state, { ...present, plot: { width, length } });
		}
		case 'addPlants': {
			const room = MAX_DESIGN_PLANTS - present.plants.length;
			if (room <= 0 || !action.plants.length) return state;
			const added = action.plants.slice(0, room).map(p => ({ ...p, x: roundCoord(p.x), y: roundCoord(p.y) }));
			return commit(state, { ...present, plants: [...present.plants, ...added] });
		}
		case 'removePlants': {
			const ids = new Set(action.ids);
			const plants = present.plants.filter(p => !ids.has(p.id));
			if (plants.length === present.plants.length) return state;
			return commit(state, { ...present, plants });
		}
		case 'movePlants': {
			const moves = new Map(action.moves.map(m => [m.id, m]));
			let changed = false;
			const plants = present.plants.map(p => {
				const move = moves.get(p.id);
				if (!move) return p;
				const x = roundCoord(move.x);
				const y = roundCoord(move.y);
				if (x === p.x && y === p.y) return p;
				changed = true;
				return { ...p, x, y };
			});
			if (!changed) return state;
			const next = { ...present, plants };
			// Durante un arrastre se actualiza en vivo sin tocar el historial.
			if (state.dragOrigin) return { ...state, present: next };
			return commit(state, next);
		}
		case 'setManagedSize': {
			const ids = new Set(action.ids);
			let changed = false;
			const plants = present.plants.map(p => {
				if (!ids.has(p.id)) return p;
				const next = withManagedSize(p, action.size);
				if (next.pruneHeight === p.pruneHeight && next.pruneCrown === p.pruneCrown) return p;
				changed = true;
				return next;
			});
			if (!changed) return state;
			return commit(state, { ...present, plants });
		}
		case 'setBackground':
			return commit(state, { ...present, background: action.background });
		case 'moveBackground': {
			const bg = present.background;
			if (!bg) return state;
			const x = roundCoord(action.x);
			const y = roundCoord(action.y);
			if (x === bg.x && y === bg.y) return state;
			const next = { ...present, background: { ...bg, x, y } };
			if (state.dragOrigin) return { ...state, present: next };
			return commit(state, next);
		}
		case 'replaceBackgroundSrc': {
			// Al subir el data URL a Storage se reemplaza en todo el historial,
			// para que deshacer no vuelva a meter la imagen pesada en el diseño.
			const swap = (content: DesignContent): DesignContent =>
				content.background?.src === action.from
					? { ...content, background: { ...content.background, src: action.src, storagePath: action.storagePath } }
					: content;
			return {
				past: state.past.map(swap),
				present: swap(present),
				future: state.future.map(swap),
				dragOrigin: state.dragOrigin ? swap(state.dragOrigin) : null
			};
		}
		case 'beginDrag':
			return state.dragOrigin ? state : { ...state, dragOrigin: present };
		case 'endDrag': {
			if (!state.dragOrigin) return state;
			if (state.dragOrigin === present) return { ...state, dragOrigin: null };
			return { past: [...state.past, state.dragOrigin].slice(-HISTORY_LIMIT), present, future: [], dragOrigin: null };
		}
		case 'load':
			return { past: [], present: action.content, future: [], dragOrigin: null };
		case 'undo': {
			if (state.dragOrigin || !state.past.length) return state;
			const previous = state.past[state.past.length - 1];
			return { past: state.past.slice(0, -1), present: previous, future: [present, ...state.future], dragOrigin: null };
		}
		case 'redo': {
			if (state.dragOrigin || !state.future.length) return state;
			const [next, ...rest] = state.future;
			return { past: [...state.past, present], present: next, future: rest, dragOrigin: null };
		}
		default:
			return state;
	}
}

export function useDesignState(initialContent?: DesignContent | null) {
	const [state, dispatch] = useReducer(reducer, initialContent, initial => ({
		past: [],
		present: initial ?? emptyContent(),
		future: [],
		dragOrigin: null
	}));

	const undo = useCallback(() => dispatch({ type: 'undo' }), []);
	const redo = useCallback(() => dispatch({ type: 'redo' }), []);

	return useMemo(
		() => ({
			content: state.present,
			canUndo: state.past.length > 0 && !state.dragOrigin,
			canRedo: state.future.length > 0 && !state.dragOrigin,
			dispatch,
			undo,
			redo
		}),
		[state, undo, redo]
	);
}

// Exportado para pruebas.
export const designReducer = reducer;

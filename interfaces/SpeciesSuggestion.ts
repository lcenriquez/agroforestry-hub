import type { SpeciesInput } from './Species';

export type SuggestionType = 'edit' | 'new';
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

// Sugerencia de un usuario para editar una especie existente (`type: 'edit'`,
// `speciesId` presente) o agregar una especie nueva (`type: 'new'`). En ambos
// casos `proposedData` es el registro completo propuesto, no un diff — ver
// docs/features/admin-y-sugerencias.md.
export interface SpeciesSuggestion {
	_id: string;
	type: SuggestionType;
	speciesId?: string;
	proposedData: SpeciesInput;
	authorId: string;
	authorEmail: string;
	createdAt: number;
	status: SuggestionStatus;
	reviewedAt?: number;
}

export type NewSpeciesSuggestion = Omit<SpeciesSuggestion, '_id'>;

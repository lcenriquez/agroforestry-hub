// Normaliza texto para comparaciones tolerantes a mayusculas/acentos: busqueda
// y filtros del catalogo, y el match de catalogos en la carga masiva de
// especies desde excel (ver docs/tasks/carga-masiva-especies-excel.md).
export function normalize(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

// Clave para hacer upsert de una especie por genero+especie (no por id de
// documento), tolerante a mayusculas/acentos/espacios.
export function taxonomyKey(taxonomy: { genus: string; species: string }): string {
	return `${normalize(taxonomy.genus)}|${normalize(taxonomy.species)}`;
}

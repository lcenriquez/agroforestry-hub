// Da de alta en el catálogo `species` las especies de un archivo JSON
// (`{ description, species: SpeciesInput[] }`, p. ej. tlamapa-2026-10.json).
// Usa la capa de datos de la app (adapters/firestore.ts).
//
// Uso:
//   npx tsx scripts/species-add/add-species.ts                            # simulación
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/species-add/add-species.ts --apply [--project=<id>]
//   --file=<ruta>   otro archivo de especies (por defecto tlamapa-2026-10.json)
//   --update        reemplaza también las que ya existen (por defecto se omiten)
//
// - Idempotente: busca cada especie por género+especie (`taxonomyKey`, igual
//   que la carga masiva). Si ya existe no la toca; sólo crea las que faltan.
// - Escribir requiere una cuenta de la colección `admins` (firestore.rules).
// - Con FIRESTORE_EMULATOR_HOST etc. escribe en el emulador; si no, exige
//   --project=<id> (ver scripts/lib/firebase-node.ts).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { assertWriteTarget, connectFirebase, signIn } from '../lib/firebase-node';

import type { SpeciesInput } from '../../interfaces/Species';

async function main() {
	const args = process.argv.slice(2);
	const apply = args.includes('--apply');
	const update = args.includes('--update');
	const fileArg = args.find(arg => arg.startsWith('--file='));
	const path = fileArg ? fileArg.slice('--file='.length) : join(__dirname, 'tlamapa-2026-10.json');
	const { species: rows } = JSON.parse(readFileSync(path, 'utf8')) as { species: SpeciesInput[] };

	await connectFirebase();
	const target = apply ? assertWriteTarget(args) : null;
	const { createSpecies, getSpecies, updateSpecies } = await import('../../adapters/firestore');
	const { taxonomyKey } = await import('../../lib/text');

	const catalog = await getSpecies();
	if (!catalog.length) throw new Error('El catálogo `species` vino vacío: revisa la conexión antes de dar de alta nada.');
	const existing = new Map(catalog.map(item => [taxonomyKey(item.taxonomy), item]));

	console.log(`${apply ? `APLICANDO en ${target}` : 'SIMULACIÓN (usa --apply para escribir)'} — ${rows.length} especies de ${path}\n`);
	const plan = rows.map(row => ({ row, current: existing.get(taxonomyKey(row.taxonomy)) }));
	for (const { row, current } of plan) {
		const label = `${row.taxonomy.genus} ${row.taxonomy.species} (${row.commonNames.es_mx[0]})`;
		if (!current) console.log(`+ ${label}: nueva`);
		else console.log(`${update ? '~' : '='} ${label}: ya existe como ${current._id}${update ? ', se reemplaza' : ', se omite'}`);
	}
	if (!apply) return;

	await signIn('ADMIN_EMAIL', 'ADMIN_PASSWORD');
	for (const { row, current } of plan) {
		const label = `${row.taxonomy.genus} ${row.taxonomy.species}`;
		if (!current) console.log(`✓ ${label} → ${await createSpecies(row)}`);
		else if (update) {
			await updateSpecies(current._id, row);
			console.log(`✓ ${label} → ${current._id} (reemplazada)`);
		}
	}
}

main().then(
	() => process.exit(0),
	error => {
		console.error(error);
		process.exit(1);
	}
);

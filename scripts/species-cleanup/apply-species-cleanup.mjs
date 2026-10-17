#!/usr/bin/env node
// Aplica a Firestore los cambios de limpieza/enriquecimiento del catálogo de
// especies generados en `changes.json` (ver
// docs/tasks/limpieza-y-enriquecimiento-especies.md).
//
// Uso:
//   node scripts/species-cleanup/apply-species-cleanup.mjs            # simulación (no escribe nada)
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/species-cleanup/apply-species-cleanup.mjs --apply
//
// - Lee NEXT_PUBLIC_FIREBASE_API_KEY y NEXT_PUBLIC_FIREBASE_PROJECT_ID del
//   entorno o de `.env.local`.
// - Para escribir inicia sesión con una cuenta que esté en la colección
//   `admins` (las reglas sólo permiten escribir `species` al admin).
// - Antes de escribir guarda un respaldo de cada documento que va a tocar en
//   `scripts/species-cleanup/backup-<fecha>.json`.
// - Cada escritura lleva la precondición `updateTime` del momento en que se
//   generaron los cambios: si alguien editó la especie después, ese cambio se
//   omite (y se reporta) en vez de pisar la edición.
// - Requiere Node 18+ (usa fetch nativo). Sin dependencias.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const fileArg = args.find(a => a.startsWith('--file='));
const changesPath = fileArg ? fileArg.slice('--file='.length) : join(here, 'changes.json');

function loadEnvLocal() {
	const path = join(here, '..', '..', '.env.local');
	if (!existsSync(path)) return;
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
	}
}

loadEnvLocal();
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!apiKey || !projectId) {
	console.error('Faltan NEXT_PUBLIC_FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_PROJECT_ID (entorno o .env.local).');
	process.exit(1);
}

// Con FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST escribe en los
// emuladores (firebase.emulators.json) en lugar de producción.
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const base = firestoreHost
	? `http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents`
	: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const identityBase = authHost ? `http://${authHost}/identitytoolkit.googleapis.com/v1` : 'https://identitytoolkit.googleapis.com/v1';

// --- Conversión JSON <-> valores de Firestore -------------------------------

function toValue(value) {
	if (value === null || value === undefined) return { nullValue: null };
	if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
	if (typeof value === 'boolean') return { booleanValue: value };
	if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
	if (typeof value === 'string') return { stringValue: value };
	if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toValue(v)])) } };
	throw new Error(`Tipo no soportado: ${typeof value}`);
}

// --- HTTP --------------------------------------------------------------------

async function request(url, options = {}, token) {
	const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
	const response = await fetch(url, { ...options, headers });
	const text = await response.text();
	const body = text ? JSON.parse(text) : {};
	return { ok: response.ok, status: response.status, body };
}

async function signIn() {
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;
	if (!email || !password) {
		console.error('Para --apply define ADMIN_EMAIL y ADMIN_PASSWORD (una cuenta registrada en la colección `admins`).');
		process.exit(1);
	}
	const res = await request(`${identityBase}/accounts:signInWithPassword?key=${apiKey}`, {
		method: 'POST',
		body: JSON.stringify({ email, password, returnSecureToken: true })
	});
	if (!res.ok) {
		console.error('No se pudo iniciar sesión:', res.body?.error?.message ?? res.status);
		process.exit(1);
	}
	return res.body.idToken;
}

async function getDoc(id, token) {
	const res = await request(`${base}/species/${id}${token ? '' : `?key=${apiKey}`}`, {}, token);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`GET ${id}: ${res.status} ${JSON.stringify(res.body)}`);
	return res.body;
}

// --- Main --------------------------------------------------------------------

const changes = JSON.parse(readFileSync(changesPath, 'utf8'));
const { updates = [], deletes = [] } = changes;
console.log(
	`${apply ? `APLICANDO en ${firestoreHost ? `emulador (${projectId})` : projectId}` : 'SIMULACIÓN (usa --apply para escribir)'} — ${updates.length} actualizaciones, ${deletes.length} borrados`
);
console.log(`Archivo: ${changesPath} (generado ${changes.generatedAt ?? 'sin fecha'})\n`);

const token = apply ? await signIn() : null;

// Verifica que nada haya cambiado desde que se generaron los cambios.
const current = new Map();
const stale = new Set();
const missing = new Set();
for (const item of [...updates, ...deletes]) {
	const doc = await getDoc(item.id, token);
	if (!doc) {
		missing.add(item.id);
		continue;
	}
	current.set(item.id, doc);
	if (item.updateTime && doc.updateTime !== item.updateTime) stale.add(item.id);
}

if (missing.size) console.log(`⚠ ${missing.size} especies ya no existen y se omiten: ${[...missing].join(', ')}`);
if (stale.size) console.log(`⚠ ${stale.size} especies cambiaron desde que se generaron los cambios y se omiten: ${[...stale].join(', ')}`);

const runnableUpdates = updates.filter(u => !missing.has(u.id) && !stale.has(u.id));
const runnableDeletes = deletes.filter(d => !missing.has(d.id) && !stale.has(d.id));

for (const u of runnableUpdates) console.log(`~ ${u.id} ${u.name}: ${Object.keys(u.fields).join(', ')}`);
for (const d of runnableDeletes) console.log(`- ${d.id} ${d.name} (fusionada en ${d.mergedInto})`);

if (!apply) {
	console.log(`\nSimulación terminada: se escribirían ${runnableUpdates.length} especies y se borrarían ${runnableDeletes.length}.`);
	process.exit(0);
}

const backupPath = join(here, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
writeFileSync(backupPath, JSON.stringify([...current.values()], null, 1));
console.log(`\nRespaldo guardado en ${backupPath}`);

let ok = 0;
let failed = 0;
for (const u of runnableUpdates) {
	const mask = Object.keys(u.fields)
		.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
		.join('&');
	const precondition = u.updateTime ? `&currentDocument.updateTime=${encodeURIComponent(u.updateTime)}` : '';
	const fields = Object.fromEntries(Object.entries(u.fields).map(([k, v]) => [k, toValue(v)]));
	const res = await request(`${base}/species/${u.id}?${mask}${precondition}`, { method: 'PATCH', body: JSON.stringify({ fields }) }, token);
	if (res.ok) ok++;
	else {
		failed++;
		console.error(`✗ ${u.id} ${u.name}: ${res.status} ${res.body?.error?.message ?? ''}`);
	}
}
for (const d of runnableDeletes) {
	const precondition = d.updateTime ? `?currentDocument.updateTime=${encodeURIComponent(d.updateTime)}` : '';
	const res = await request(`${base}/species/${d.id}${precondition}`, { method: 'DELETE' }, token);
	if (res.ok) ok++;
	else {
		failed++;
		console.error(`✗ borrar ${d.id} ${d.name}: ${res.status} ${res.body?.error?.message ?? ''}`);
	}
}

console.log(`\nListo: ${ok} escrituras correctas, ${failed} con error.`);
process.exit(failed ? 1 : 0);

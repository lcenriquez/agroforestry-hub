#!/usr/bin/env node
// Prepara los emuladores (firebase.emulators.json) para probar los scripts de
// scripts/species-add y scripts/design-import sin tocar producción:
//   - copia el catálogo público (`species`, `stratums`, `ecologicalFunctions`,
//     `additionalFunctions`) de producción al emulador (sólo lee producción);
//   - crea en el emulador de Auth un admin y un usuario normal, y el
//     documento `admins/{uid}` del admin.
//
// Uso (con los emuladores corriendo):
//   npx firebase-tools emulators:start --config firebase.emulators.json --project demo-agroforestry-hub
//   SEED_ADMIN_EMAIL=... SEED_USER_EMAIL=... SEED_PASSWORD=... node scripts/lib/seed-emulator.mjs
//
// Lee NEXT_PUBLIC_FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_PROJECT_ID (producción) del entorno o de
// `.env.local`; EMULATOR_PROJECT_ID (por defecto demo-agroforestry-hub) es el del emulador.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, '..', '..', '.env.local');
if (existsSync(envPath)) {
	for (const line of readFileSync(envPath, 'utf8').split('\n')) {
		const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
	}
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const prodProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const emuProject = process.env.EMULATOR_PROJECT_ID ?? 'demo-agroforestry-hub';
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
const { SEED_ADMIN_EMAIL: adminEmail, SEED_USER_EMAIL: userEmail, SEED_PASSWORD: password } = process.env;
if (!apiKey || !prodProject || !adminEmail || !userEmail || !password) {
	console.error('Faltan NEXT_PUBLIC_FIREBASE_API_KEY/PROJECT_ID o SEED_ADMIN_EMAIL, SEED_USER_EMAIL, SEED_PASSWORD.');
	process.exit(1);
}

const prodBase = `https://firestore.googleapis.com/v1/projects/${prodProject}/databases/(default)/documents`;
const emuDocs = `projects/${emuProject}/databases/(default)/documents`;
const emuBase = `http://${firestoreHost}/v1/${emuDocs}`;
// El emulador acepta `Bearer owner` como administrador (se salta las reglas).
const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };

async function json(url, options) {
	const response = await fetch(url, options);
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(`${options?.method ?? 'GET'} ${url}: ${response.status} ${JSON.stringify(body.error ?? body)}`);
	return body;
}

async function copyCollection(name) {
	const docs = [];
	let pageToken = '';
	do {
		const page = await json(`${prodBase}/${name}?pageSize=300&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`);
		docs.push(...(page.documents ?? []));
		pageToken = page.nextPageToken ?? '';
	} while (pageToken);
	for (let i = 0; i < docs.length; i += 400) {
		const writes = docs
			.slice(i, i + 400)
			.map(doc => ({ update: { name: `${emuDocs}/${name}/${doc.name.split('/').pop()}`, fields: doc.fields ?? {} } }));
		await json(`${emuBase}:commit`, { method: 'POST', headers: owner, body: JSON.stringify({ writes }) });
	}
	console.log(`✓ ${name}: ${docs.length} documentos`);
}

async function ensureUser(email) {
	const auth = `http://${authHost}/identitytoolkit.googleapis.com/v1`;
	const body = JSON.stringify({ email, password, returnSecureToken: true });
	const headers = { 'Content-Type': 'application/json' };
	const signIn = await fetch(`${auth}/accounts:signInWithPassword?key=fake`, { method: 'POST', headers, body });
	const result = signIn.ok ? await signIn.json() : await json(`${auth}/accounts:signUp?key=fake`, { method: 'POST', headers, body });
	console.log(`✓ usuario ${email} (${result.localId})`);
	return result.localId;
}

for (const name of ['species', 'stratums', 'ecologicalFunctions', 'additionalFunctions']) await copyCollection(name);
const adminUid = await ensureUser(adminEmail);
await ensureUser(userEmail);
await json(`${emuBase}/admins/${adminUid}`, {
	method: 'PATCH',
	headers: owner,
	body: JSON.stringify({ fields: { email: { stringValue: adminEmail } } })
});
console.log(`✓ admins/${adminUid}`);

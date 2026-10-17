// Arranque de Firebase para los scripts de Node (scripts/species-add,
// scripts/design-import). Usan los mismos adapters que la web, así que pasan
// por la misma capa de datos y las mismas reglas de Firestore/Storage.
//
// - Lee NEXT_PUBLIC_FIREBASE_* del entorno o de `.env.local`.
// - Si están definidos FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST y
//   FIREBASE_STORAGE_EMULATOR_HOST (p. ej. `127.0.0.1:8080`), se conecta a los
//   emuladores (ver firebase.emulators.json) en lugar de producción.
// - Para escribir fuera del emulador hay que pasar `--project=<id>` igual al
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID: evita escribir en producción por error.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Estáticos (no `await import`) para usar la misma copia del SDK que firebase-config y los adapters.
import { connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

const root = join(__dirname, '..', '..');

function loadEnvLocal() {
	const path = join(root, '.env.local');
	if (!existsSync(path)) return;
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
	}
}

export function usingEmulators(): boolean {
	return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

function splitHost(value: string): [string, number] {
	const [host, port] = value.split(':');
	return [host, Number(port)];
}

// Comprueba que una escritura va al destino que se pidió y devuelve su nombre para el log.
export function assertWriteTarget(args: string[]): string {
	const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
	if (usingEmulators()) return `emulador (${projectId})`;
	const requested = args.find(arg => arg.startsWith('--project='))?.slice('--project='.length);
	if (requested !== projectId) {
		console.error(`Para escribir en ${projectId} (no emulador) pasa --project=${projectId}.`);
		process.exit(1);
	}
	return `PRODUCCIÓN (${projectId})`;
}

// Carga el entorno, inicializa firebase-config y, si aplica, lo conecta a los emuladores.
// Se importa dinámicamente porque firebase-config lee el entorno al importarse.
export async function connectFirebase() {
	loadEnvLocal();
	const env = process.env as Record<string, string | undefined>;
	env.NODE_ENV ??= 'development';
	if (!env.NEXT_PUBLIC_FIREBASE_API_KEY || !env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
		console.error('Faltan NEXT_PUBLIC_FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_PROJECT_ID (entorno o .env.local).');
		process.exit(1);
	}

	const config = await import('../../firebase-config');
	if (usingEmulators()) {
		connectFirestoreEmulator(config.database, ...splitHost(env.FIRESTORE_EMULATOR_HOST!));
		if (env.FIREBASE_AUTH_EMULATOR_HOST) connectAuthEmulator(config.auth, `http://${env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
		if (env.FIREBASE_STORAGE_EMULATOR_HOST) connectStorageEmulator(config.storage, ...splitHost(env.FIREBASE_STORAGE_EMULATOR_HOST));
	}
	return config;
}

// Inicia sesión con las credenciales de las variables `emailVar` / `passwordVar`; devuelve el uid.
export async function signIn(emailVar: string, passwordVar: string): Promise<string> {
	const email = process.env[emailVar];
	const password = process.env[passwordVar];
	if (!email || !password) {
		console.error(`Define ${emailVar} y ${passwordVar} para escribir.`);
		process.exit(1);
	}
	const { auth } = await import('../../firebase-config');
	try {
		const credential = await signInWithEmailAndPassword(auth, email, password);
		return credential.user.uid;
	} catch (error) {
		console.error('No se pudo iniciar sesión:', (error as { code?: string }).code ?? error);
		process.exit(1);
	}
}

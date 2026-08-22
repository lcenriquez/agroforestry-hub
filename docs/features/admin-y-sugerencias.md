# Edición de especies, sugerencias de la comunidad y panel de admin

## Objetivo

- El admin puede editar cualquier especie del catálogo directamente, y agregar especies nuevas.
- Cualquier usuario con sesión iniciada puede **sugerir** una edición a una especie existente, o **sugerir** una especie nueva que no esté en el catálogo.
- Esas sugerencias le llegan al admin en un panel donde puede revisarlas y aprobarlas o rechazarlas. Al aprobar, el cambio se aplica al catálogo.

## Decisiones de diseño (revisar antes de implementar)

1. **Quién es admin:** un documento por uid en una colección `admins` de Firestore (no un email hardcodeado en el código). Un usuario es admin si existe `admins/{su uid}`; el propio `firestore.rules` lo verifica con `exists()`, así que el permiso real nunca depende solo del cliente. En el cliente, `AuthContext` expone `isAdmin` (se resuelve de forma asíncrona junto con el estado de auth, con un `getDoc` a `admins/{uid}`). Agregar o quitar un admin es crear/borrar ese documento a mano desde la consola de Firebase — sin redeploy y sin Firebase Admin SDK/custom claims. Sigue sin haber una UI para gestionar admins en esta primera versión.
2. **Qué manda una sugerencia:** el registro **completo** de la especie (taxonomía, nombres comunes, altura, ancho de copa, estrato, zona ecológica, funciones, detalles), no un diff campo por campo. Es decir, tanto para "sugerir edición" como para "sugerir especie nueva" se llena el mismo formulario completo. Es más simple de construir y de revisar (el admin ve el registro propuesto completo) que un sistema de diffs; la desventaja es que si el catálogo real cambió entre que el usuario abrió el formulario y lo mandó, la sugerencia podría pisar esos cambios al aprobarse — aceptable dado el volumen esperado de sugerencias.
3. **Un solo formulario reutilizado en tres lugares:** editar directo (admin), sugerir edición (usuario, precargado con los datos actuales), sugerir especie nueva (usuario o admin, vacío). Mismo componente, distinto modo de guardado.
4. **Catálogo cerrado:** estrato, zona ecológica, funciones ecológicas y otras funciones siguen siendo catálogos cerrados (checkboxes sobre las opciones existentes), no campos de texto libre — igual que ya funciona en los filtros de la home. Si alguien necesita un valor de catálogo que no existe todavía (una función ecológica nueva, por ejemplo), queda fuera de alcance de esta iteración: se maneja a mano en Firestore.
5. **Sin notificación por correo:** las sugerencias le "llegan" al admin en el sentido de que aparecen en su panel al iniciar sesión, no por email ni push. Notificaciones quedan fuera de alcance por ahora.
6. **Sin historial/auditoría:** al aprobar o rechazar no se guarda un log de quién aprobó qué ni versiones anteriores del registro. Se guarda únicamente el estado final de la sugerencia (`pending` → `approved`/`rejected`) y quién la propuso.

Si alguno de estos supuestos no es el que quieres, dímelo y ajusto el documento antes de implementar.

## Modelo de datos

### `interfaces/Species.ts` (ajuste)

```ts
// Campos editables de una especie, sin el id del documento — la forma que
// llenan tanto el admin (edición directa) como cualquier usuario (sugerencia).
export type SpeciesInput = Omit<SpeciesType, '_id'>;
```

### `interfaces/SpeciesSuggestion.ts` (nuevo)

```ts
export type SuggestionType = 'edit' | 'new';
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface SpeciesSuggestion {
	_id: string;
	type: SuggestionType;
	// Solo presente si type === 'edit': a qué especie existente aplica.
	speciesId?: string;
	// Registro completo propuesto (nuevo o con los cambios ya aplicados).
	proposedData: SpeciesInput;
	authorId: string;
	authorEmail: string;
	createdAt: number;
	status: SuggestionStatus;
	reviewedAt?: number;
}

export type NewSpeciesSuggestion = Omit<SpeciesSuggestion, '_id'>;
```

### Colección de Firestore

- `species` (ya existe): ahora editable directamente por el admin (antes de esto era de solo lectura para el cliente).
- `speciesSuggestions` (nueva): una sugerencia por documento, con el shape de arriba.
- `admins` (nueva): un documento por uid de usuario admin (contenido irrelevante, solo importa que exista); se crea/borra a mano desde la consola de Firebase.

### `adapters/auth.ts` (ajuste)

- `useFirebaseAuth()` ahora también resuelve `isAdmin: boolean`: al cambiar el estado de auth, hace `getDoc(doc(database, 'admins', uid))` y expone `isAdmin = snapshot.exists()` (falso mientras no hay sesión). `AuthContext`/`useAuth()` expone este campo junto a `authUser`.

## Reglas de Firestore (`firestore.rules`)

- Agregar `function isAdmin() { return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }`.
- `admins/{uid}`: `allow read: if request.auth != null && request.auth.uid == uid;` (cada quien puede leer si es admin), `allow write: if false;` (se gestiona desde la consola).
- `species`: cambiar `allow write: if false;` por `allow write: if isAdmin();` (lectura sigue pública).
- `speciesSuggestions` (nueva):
  - `allow read: if isAdmin() || (request.auth != null && resource.data.authorId == request.auth.uid);` (el admin ve todas; el autor puede ver el estado de las suyas).
  - `allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid && request.resource.data.authorEmail == request.auth.token.email && request.resource.data.status == 'pending';` (con validaciones de forma similares a las que ya existen para `experiences`: campos requeridos presentes, tamaños razonables).
  - `allow update: if isAdmin();` (solo el admin cambia el status al aprobar/rechazar).
  - Sin `delete`.

## Pasos de implementación

1. **Modelo de datos** — `interfaces/Species.ts` (agregar `SpeciesInput`), `interfaces/SpeciesSuggestion.ts` (nuevo), `adapters/auth.ts`/`contexts/AuthContext.tsx` (agregar `isAdmin`).
2. **Adapters** (`adapters/firestore.ts`) — agregar:
   - `createSpecies(data: SpeciesInput): Promise<string>` — admin, crea directo en `species`.
   - `updateSpecies(id: string, data: SpeciesInput): Promise<void>` — admin, sobreescribe una especie existente.
   - `createSpeciesSuggestion(input: NewSpeciesSuggestion): Promise<string>` — cualquier usuario autenticado.
   - `getPendingSuggestions(): Promise<SpeciesSuggestion[]>` — para el panel de admin.
   - `approveSuggestion(suggestion: SpeciesSuggestion): Promise<void>` — aplica `proposedData` a `species` (update si `type === 'edit'`, create si `type === 'new'`) y marca la sugerencia `approved`, en un `writeBatch` para que ambas escrituras sean atómicas.
   - `rejectSuggestion(id: string): Promise<void>` — solo marca `rejected`.
3. **Reglas de Firestore** — cambios descritos arriba en `firestore.rules`.
4. **`components/Species/SpeciesForm.tsx`** — formulario completo y reutilizable:
   - Taxonomía (género, especie), nombres comunes (texto separado por comas).
   - Altura y ancho de copa (min/max).
   - Estrato, zona ecológica, funciones ecológicas, otras funciones: grupos de checkboxes sobre las opciones existentes (estrato/funciones desde `getStratums`/`getEcologicalFunctions`/`getAdditionalFunctions`, que ya existen pero no se usaban; zonas derivadas de las especies ya cargadas, como en los filtros de la home).
   - Detalles: resistencia a heladas (checkbox), preferencia de luz/humedad/extracción de nutrientes (selects H/M/L, opcionales).
   - Props: `initialValue?: SpeciesInput`, `onSubmit(data: SpeciesInput)`, `submitLabel: string`.
5. **`pages/species.tsx`** — botón junto al nombre de la especie:
   - Admin → "Editar especie": abre `SpeciesForm` en un `Dialog` precargado, guarda con `updateSpecies` directo.
   - Usuario autenticado no-admin → "Sugerir edición": mismo diálogo/formulario, pero `onSubmit` llama `createSpeciesSuggestion` con `type: 'edit'` y muestra una confirmación ("tu sugerencia fue enviada, quedará pendiente de revisión").
   - Sin sesión → sin botón (ya existe el mensaje de "inicia sesión" para experiencias; se reutiliza el patrón).
6. **`pages/suggest-species.tsx`** (nueva) — mismo `SpeciesForm` vacío:
   - Admin → guarda directo con `createSpecies`.
   - Usuario autenticado no-admin → crea sugerencia `type: 'new'`.
   - Sin sesión → invitación a iniciar sesión.
   - Enlace desde la home ("¿No encuentras una especie? Sugiérela").
7. **`pages/admin.tsx`** (nueva):
   - Redirige a `/` si `authUser` no es admin (mismo patrón de redirect que `withAuthedLayout` ya usa para no autenticados).
   - Lista las sugerencias `pending` (`getPendingSuggestions`), mostrando tipo, autor, fecha y una vista previa de `proposedData` (reusar `DataList` como en la ficha de especie).
   - Para `type: 'edit'`, mostrar también el registro actual de la especie al lado, para comparar.
   - Botones "Aprobar" / "Rechazar" por sugerencia, llaman `approveSuggestion`/`rejectSuggestion` y quitan la tarjeta de la lista.
   - Enlace a este panel en el menú de usuario (`components/Nav/AuthDetails.tsx`), visible solo si `isAdmin` (de `useAuth()`).
8. **Validación** — `tsc`/`eslint`/`prettier`/build, y prueba visual con Playwright usando datos simulados (Firestore real no es alcanzable desde este sandbox) cubriendo: sugerir edición, sugerir especie nueva, aprobar, rechazar, edición directa de admin — en desktop y móvil, claro y oscuro.

## Fuera de alcance (por ahora)

- Múltiples admins gestionables desde la UI (hoy: se agregan/quitan a mano en Firestore).
- Notificaciones por correo al admin cuando llega una sugerencia.
- Historial de cambios / auditoría de quién aprobó qué.
- Sugerencias como diff campo por campo en vez de registro completo.
- Agregar nuevos valores de catálogo (zonas, funciones) desde la UI.

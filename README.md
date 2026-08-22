# SAF Hub

**SAF Hub** es una aplicación web para consultar información sobre especies usadas en **Sistemas Agroforestales (SAF)**: estrato, zona ecológica, altura, ancho de copa, funciones ecológicas y otras funciones (alimento, forraje, madera, medicinal), además de preferencias de luz, humedad y resistencia a heladas. Los datos se muestran en español (variante `es_mx`) y se sirven desde Firestore.

El proyecto es desarrollado en colaboración con [Un granito de Tierra, A.C.](https://ungranitodetierra.org)

## Stack técnico

- **[Next.js 16](https://nextjs.org/)** (Pages Router, exportado como sitio estático)
- **React 19**
- **TypeScript**
- **[Chakra UI v3](https://chakra-ui.com/)** para la interfaz, con **next-themes** para el modo claro/oscuro
- **[Firebase](https://firebase.google.com/)** (Authentication + Firestore + Storage) como backend
- **[Phosphor Icons](https://phosphoricons.com/)** y **[Lucide](https://lucide.dev/)** para iconografía
- **ESLint (flat config) + Prettier** para calidad y formato de código
- **Firebase Hosting** para el despliegue del sitio estático

## Primeros pasos

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

La app necesita un proyecto de Firebase (Authentication con correo/contraseña y Firestore). Crea un archivo `.env.local` en la raíz con:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Opcional: se muestra entre corchetes en el <title> de cada página
# (por ejemplo "staging" o "dev") para distinguir entornos no productivos.
NEXT_PUBLIC_ENVIRONMENT_NAME=
```

Estos valores se toman del panel de tu proyecto en [Firebase Console](https://console.firebase.google.com/) → Configuración del proyecto → tus apps → SDK setup.

> Estas variables son obligatorias: la app inicializa Firebase en cuanto se carga (`firebase-config.ts`), así que **incluso `npm run build` falla sin ellas** (falla con `auth/invalid-api-key`).

### 3. Levantar el entorno de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Script          | Descripción                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`   | Levanta el servidor de desarrollo de Next.js                                                       |
| `npm run build` | Genera el sitio estático en `out/` (`next build` con `output: 'export'`)                           |
| `npm run start` | Sirve el build de producción (modo servidor; no se usa para el despliegue actual, que es estático) |
| `npm run lint`  | Corre ESLint sobre todo el proyecto                                                                |

Para verificar tipos: `npx tsc --noEmit`.
Para formatear: `npx prettier --write .`.

## Estructura del proyecto

```
adapters/          Acceso a Firebase: auth.ts, firestore.ts (Firestore) y storage.ts (Storage)
components/
  Elements/         Piezas pequeñas de UI (LoadingScreen, ThemeSwitch)
  Experiences/       Compartir experiencias por especie (ExperienceForm, ExperienceList, PhotoUploader)
  Footer/            Pie de página
  Helpers/           Representaciones visuales (iconos con tooltip) de las especies
  Nav/               Barra de navegación y menú de usuario
  Tables/            Tabla de especies
  ui/                Utilidades de Chakra UI v3 (color-mode: ColorModeProvider/useColorMode/useColorModeValue)
contexts/           AuthContext: contexto de React para el usuario autenticado
hocs/               withLayout.tsx: HOCs de layout (público / autenticado / vacío)
interfaces/         Tipos compartidos: Common.ts, Species.ts, Experience.ts
pages/              Rutas de Next.js (Pages Router): /, /signin, /signup, /account/action, /species
public/             Assets estáticos (favicon, etc.)
styles/             Configuración del sistema de diseño de Chakra UI (theme.tsx)
firebase-config.ts  Inicialización del SDK de Firebase (app, auth, database, storage)
next-env-config.ts  Selección de configuración de Firebase según NODE_ENV
firebase.json       Configuración de Firebase Hosting/Firestore/Storage
firestore.rules     Reglas de seguridad de Firestore
storage.rules       Reglas de seguridad de Storage
```

## Autenticación

El flujo de autenticación (`/signin`, `/signup`) usa Firebase Authentication (correo/contraseña). `contexts/AuthContext.tsx` expone `authUser`, `loading`, `error`, `signIn`, `signUp` y `signOut` a través de un `React.Context`, respaldado por el hook `useFirebaseAuth` en `adapters/auth.ts`.

`hocs/withLayout.tsx` ofrece tres envoltorios de página:

- `withPublicLayout`: layout con navegación y pie de página, sin requerir sesión (usado en la página de inicio).
- `withAuthedLayout`: exige sesión iniciada (redirige a `/signin` si no la hay) y muestra un aviso si el correo no está verificado.
- `withEmptyLayout`: solo agrega el `<head>` de la página, sin navegación ni pie de página.

## Datos de especies

`adapters/firestore.ts` expone funciones tipadas para leer las colecciones `species`, `stratums`, `additionalFunctions` y `ecologicalFunctions` (y `getSpeciesById` para una sola especie). La página de inicio (`pages/index.tsx`) consulta `getSpecies()` y renderiza el resultado con `components/Tables/SpeciesTable.tsx`. Los tipos de estas colecciones viven en `interfaces/Species.ts` y `interfaces/Common.ts` (`LocalizedText`, `Level`, etc.); ya no se usa `any` en el camino de datos de Firestore.

## Experiencias de la comunidad

Cualquier persona con sesión iniciada puede compartir, por especie (`/species?id=<id>`), su experiencia real cultivándola: ubicación, clima, tipo de luz que recibe, tipo de suelo, notas y hasta 5 fotos. La lectura es pública (sin necesidad de cuenta) para que el conocimiento circule libremente; sólo compartir requiere sesión.

- `interfaces/Experience.ts` define el tipo `Experience` (colección `experiences`) y `MAX_EXPERIENCE_PHOTOS` (5).
- `adapters/firestore.ts` agrega `getExperiencesForSpecies(speciesId)` y `addExperience(...)`.
- `adapters/storage.ts` sube las fotos a Firebase Storage (`uploadExperiencePhotos`), validando en el cliente cantidad (máx. 5), tipo (imagen) y tamaño (máx. 5MB) antes de subir.
- `components/Experiences/` contiene el formulario (`ExperienceForm`), el listado (`ExperienceList`) y el selector de fotos con previsualización (`PhotoUploader`).
- `pages/species.tsx` muestra el detalle de una especie, las experiencias existentes y el formulario para compartir la propia (o una invitación a iniciar sesión si no hay usuario autenticado). Se navega a esta página desde la columna "Experiencias" de `SpeciesTable`.
- `firestore.rules` y `storage.rules` son la validación real (del lado del servidor): cualquiera puede leer, pero sólo un usuario autenticado puede crear una experiencia propia (y sólo puede editar/borrar la suya), con los mismos límites de tamaño/cantidad/tipo de fotos.

## Despliegue

El sitio se construye como export estático (`next build` con `output: 'export'` en `next.config.js`) y se publica en **Firebase Hosting**, que sirve la carpeta `out/` (ver `firebase.json`):

```bash
npm run build
firebase deploy --only hosting
```

Al agregar reglas de Firestore/Storage (necesarias para "Experiencias de la comunidad"), despliégalas también:

```bash
firebase deploy --only firestore:rules,storage:rules
```

Un workflow de GitHub Actions (`.github/workflows/firebase-deploy.yml`) hace ambas cosas automáticamente en cada push a `main`; ver la sección siguiente para configurarlo.

## Despliegue automático (GitHub Actions)

`.github/workflows/firebase-deploy.yml` compila el sitio y despliega hosting + reglas de Firestore/Storage a Firebase en cada push a `main` (y también puede lanzarse manualmente desde la pestaña Actions). Necesita estos secrets en **Settings → Secrets and variables → Actions** del repositorio:

- `FIREBASE_SERVICE_ACCOUNT`: contenido completo del JSON de una service account de Google Cloud con permisos sobre el proyecto de Firebase (ver más abajo cómo generarla).
- Uno por cada variable de `.env.local` (mismos valores del paso "Configurar variables de entorno"): `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_DATABASE_URL`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`.

### Generar la service account

1. En [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) (con el mismo proyecto que tu app de Firebase), crea una service account nueva.
2. Asígnale los roles **Firebase Hosting Admin** (`roles/firebasehosting.admin`), **Firebase Rules Admin** (`roles/firebaserules.admin`) y **Service Usage Viewer** (`roles/serviceusage.serviceUsageViewer`, necesario para que `firebase-tools` pueda verificar que las APIs de Firestore/Storage están habilitadas antes de desplegar las reglas) — o simplemente **Firebase Admin** (`roles/firebase.admin`) si prefieres un solo rol más amplio.
3. Genera una clave JSON para esa service account (pestaña "Keys" → "Add key" → "Create new key" → JSON) y descárgala.
4. Pega el contenido completo de ese JSON como el secret `FIREBASE_SERVICE_ACCOUNT` en GitHub.

## Contribuir

Los mensajes de commit deben escribirse en inglés y seguir [Conventional Commits](https://www.conventionalcommits.org/) (`feat: ...`, `fix: ...`, `docs: ...`, etc.). Ver [`CONTRIBUTING.md`](./CONTRIBUTING.md) para el detalle y ejemplos.

## Cambios recientes (actualización de dependencias y correcciones)

Este proyecto se actualizó de Next.js 12 / React 17 / Chakra UI v1 (de 2022) a las versiones estables más recientes de todo el stack: **Next.js 16, React 19, Chakra UI v3, Firebase 12, TypeScript 6, ESLint 9 (flat config) y Prettier 3**. Además de la migración de dependencias, se corrigieron los siguientes problemas:

- **`npm install` fallaba** por un conflicto de peer dependencies entre Chakra UI y React; se resolvió con la actualización de versiones.
- **`next export` fue eliminado** en versiones recientes de Next.js; el build ahora usa `output: 'export'` en `next.config.js`.
- **Bug de tipos:** `AuthUserContext.authUser.isEmailVerified` estaba tipado como `string` pero en realidad es un `boolean`.
- **Menú de navegación con contenido de ejemplo:** la barra de navegación tenía enlaces ficticios ("Inspiration", "Find Work", "Hire Designers", copiados de una plantilla de Chakra UI) que no correspondían a ninguna página real del sitio; se eliminaron junto con el menú hamburguesa que los mostraba.
- **Dependencias sin usar:** se quitaron `formik`, `yup` y `formik-chakra-ui` (instaladas pero nunca importadas) y `framer-motion` (ya no la usa Chakra UI v3).
- **Imports/variables sin usar:** `AddIcon` en `AuthDetails`, `Container`/`Heading` en la página de inicio, `country`/`lang` en `adapters/firestore.ts`.
- **`console.log` de depuración** olvidados en `adapters/auth.ts`, `adapters/firestore.ts` y `SpeciesTable`.
- **Enlaces `target="_blank"` sin `rel="noreferrer"`** en el pie de página (riesgo de reverse tabnabbing).
- **Enlaces internos con `<a>` en vez de `next/link`** en el menú de usuario.
- **`setState` síncrono dentro de un `useEffect`** en `pages/account/action.tsx` (causaba renders en cascada innecesarios); se reemplazó por un valor derivado directamente del query string.
- Correcciones menores: `var` → `const`, tipado de eventos de formulario (`signin`/`signup`) en vez de `any`, error tipográfico en un comentario ("Erotion" → "Erosion"), typo `handleSumbit` → `handleSubmit`.
- Se removió `pages/api/hello.ts` (endpoint de ejemplo de `create-next-app`, no usado y no funcional bajo exportación estática) y `public/vercel.svg` (asset sin usar).

## Limitaciones conocidas / roadmap

- El menú de usuario autenticado (`components/Nav/AuthDetails.tsx`) tiene las opciones "Mi perfil" y "Configuración" sin funcionalidad todavía (no están implementadas las páginas correspondientes).
- No hay pruebas automatizadas (unitarias ni end-to-end).
- La recuperación de contraseña ("¿Olvidaste tu contraseña?" en `/signin`) es un enlace sin funcionalidad todavía.
- Las experiencias compartidas no tienen moderación ni reporte de contenido inapropiado todavía; las reglas de Firestore/Storage limitan cantidad/tamaño/tipo de archivo pero no revisan el contenido en sí.

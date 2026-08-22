# SAF Hub

**SAF Hub** es una aplicación web para consultar información sobre especies usadas en **Sistemas Agroforestales (SAF)**: estrato, zona ecológica, altura, ancho de copa, funciones ecológicas y otras funciones (alimento, forraje, madera, medicinal), además de preferencias de luz, humedad y resistencia a heladas. Los datos se muestran en español (variante `es_mx`) y se sirven desde Firestore.

El proyecto es desarrollado en colaboración con [Un granito de Tierra, A.C.](https://ungranitodetierra.org)

## Stack técnico

- **[Next.js 16](https://nextjs.org/)** (Pages Router, exportado como sitio estático)
- **React 19**
- **TypeScript**
- **[Chakra UI v3](https://chakra-ui.com/)** para la interfaz, con **next-themes** para el modo claro/oscuro
- **[Firebase](https://firebase.google.com/)** (Authentication + Firestore) como backend
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

| Script          | Descripción                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `npm run dev`   | Levanta el servidor de desarrollo de Next.js                                 |
| `npm run build` | Genera el sitio estático en `out/` (`next build` con `output: 'export'`)     |
| `npm run start` | Sirve el build de producción (modo servidor; no se usa para el despliegue actual, que es estático) |
| `npm run lint`  | Corre ESLint sobre todo el proyecto                                          |

Para verificar tipos: `npx tsc --noEmit`.
Para formatear: `npx prettier --write .`.

## Estructura del proyecto

```
adapters/          Acceso a Firebase (auth.ts) y Firestore (firestore.ts)
components/
  Elements/         Piezas pequeñas de UI (LoadingScreen, ThemeSwitch)
  Footer/            Pie de página
  Helpers/           Representaciones visuales (iconos con tooltip) de las especies
  Nav/               Barra de navegación y menú de usuario
  Tables/            Tabla de especies
  ui/                Utilidades de Chakra UI v3 (color-mode: ColorModeProvider/useColorMode/useColorModeValue)
contexts/           AuthContext: contexto de React para el usuario autenticado
hocs/               withLayout.tsx: HOCs de layout (público / autenticado / vacío)
interfaces/         Tipos compartidos (p. ej. SpeciesType)
pages/              Rutas de Next.js (Pages Router): /, /signin, /signup, /account/action
public/             Assets estáticos (favicon, etc.)
styles/             Configuración del sistema de diseño de Chakra UI (theme.tsx)
firebase-config.ts  Inicialización del SDK de Firebase
next-env-config.ts  Selección de configuración de Firebase según NODE_ENV
firebase.json       Configuración de Firebase Hosting (sirve la carpeta out/)
```

## Autenticación

El flujo de autenticación (`/signin`, `/signup`) usa Firebase Authentication (correo/contraseña). `contexts/AuthContext.tsx` expone `authUser`, `loading`, `error`, `signIn`, `signUp` y `signOut` a través de un `React.Context`, respaldado por el hook `useFirebaseAuth` en `adapters/auth.ts`.

`hocs/withLayout.tsx` ofrece tres envoltorios de página:

- `withPublicLayout`: layout con navegación y pie de página, sin requerir sesión (usado en la página de inicio).
- `withAuthedLayout`: exige sesión iniciada (redirige a `/signin` si no la hay) y muestra un aviso si el correo no está verificado.
- `withEmptyLayout`: solo agrega el `<head>` de la página, sin navegación ni pie de página.

## Datos de especies

`adapters/firestore.ts` expone funciones para leer las colecciones `species`, `stratums`, `additionalFunctions` y `ecologicalFunctions`. La página de inicio (`pages/index.tsx`) consulta `getSpecies()` y renderiza el resultado con `components/Tables/SpeciesTable.tsx`.

## Despliegue

El sitio se construye como export estático (`next build` con `output: 'export'` en `next.config.js`) y se publica en **Firebase Hosting**, que sirve la carpeta `out/` (ver `firebase.json`):

```bash
npm run build
firebase deploy --only hosting
```

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

- **Tipado de datos de Firestore:** los datos que vienen de Firestore (`species`, `stratums`, funciones ecológicas/adicionales) se manejan con tipos laxos (`any`) en `adapters/firestore.ts`, `SpeciesTable` y `VisualRepresentations`. `interfaces/Species.ts` sólo define un subconjunto mínimo (`id`, `taxonomy`). Definir un esquema completo de tipos para estas colecciones es la mejora pendiente más importante.
- El menú de usuario autenticado (`components/Nav/AuthDetails.tsx`) tiene las opciones "Mi perfil" y "Configuración" sin funcionalidad todavía (no están implementadas las páginas correspondientes).
- No hay pruebas automatizadas (unitarias ni end-to-end).
- La recuperación de contraseña ("¿Olvidaste tu contraseña?" en `/signin`) es un enlace sin funcionalidad todavía.

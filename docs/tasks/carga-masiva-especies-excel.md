# Carga masiva de especies desde Excel (BASE DE DATOS ESPECIES SAF)

## Objetivo

Agregar al panel de admin una función para cargar al catálogo (`species` en Firestore, y los
catálogos relacionados `stratums`, `ecologicalZones`, `ecologicalFunctions`,
`additionalFunctions`) las especies y sus detalles contenidos en un archivo Excel con el mismo
formato que `BASEDATOSESPECIESSAF.xlsx`, tomando **únicamente** las filas de la pestaña
`ESPECIES`. El resto de las pestañas del archivo (`Portada`, `Abreviaturas`,
`Especies de servicio`, `Platanos`, `Funciones`, `Respaldo4`) quedan fuera de alcance de
esta carga.

## Fuente de datos

- Pestaña `ESPECIES`: **465 especies** (id 1 a 465, filas 4 a 468 de la hoja) en el archivo de
  referencia usado para diseñar esta tarea.
- 3 filas de encabezado antes de los datos:
  1. Fila 1: título (`Base de datos especies (LAS CAÑADAS)`).
  2. Fila 2: agrupación por categoría (ej. `Taxonomía`, `Zonas ecológicas`, `Forma y tamaño`, `Funciones`, `Nutrimento principal`, `Usos (comestible)`, `Otros usos`, `Observaciones`).
  3. Fila 3: nombre de columna.
- La pestaña `Abreviaturas` documenta los códigos usados en varias columnas (`A`/`M`/`B` para extracción de nutrientes, `Sol`/`Ms`/`S` para luz, `Ha`/`Hm`/`S` para humedad, `S`/`Sr`/`Sc`/`N` para tolerancia a heladas, etc.) y debe usarse como referencia al normalizar valores.
- Convención de celdas en los datos: `'-'` = no aplica / sin dato, `'x'` = verdadero (columnas booleanas), celda vacía = sin dato.
- El archivo `.xlsx` en sí **no** se agrega al repo ni se guarda en Firebase Storage: cada
  importación es un archivo que el admin selecciona desde su equipo en el momento, se procesa
  en memoria en el navegador, y no se persiste en ningún lado más allá de las escrituras a
  Firestore que resultan de la importación.

### Columnas de la pestaña `ESPECIES`

| Col | Grupo | Encabezado |
|---|---|---|
| A | — | Id |
| B | — | Nombre común |
| C | Taxonomía | Genero |
| D | Taxonomía | Especie |
| E | Taxonomía | Subespecie |
| F | Taxonomía | Familia |
| G | Taxonomía | Sinonimías |
| H–M | Zonas ecológicas | 1 Selva húmeda / 2 Selva baja / 3 Bosque de niebla / 4 Bosque de pino y encino / 5 Semi-desierto / 6 Desierto (booleanas) |
| N | Zonas ecológicas | Estrato (emergente, alto, medio, bajo) |
| O | Zonas ecológicas | Fuente de info de ESTRATO |
| P | Zonas ecológicas | Ciclo de vida |
| Q | Zonas ecológicas | Ciclo vida meses/años |
| R | Zonas ecológicas | Rango de altura (texto libre) |
| S | Forma y tamaño | Forma |
| T | Forma y tamaño | Altura (metros) |
| U | Forma y tamaño | Ancho de copa (metros) |
| V | Forma y tamaño | Agrupa o salta (A/S) |
| W | Forma y tamaño | Extracción de nutrientes (A/M/B) |
| X | Forma y tamaño | Sol o sombra (Sol/Ms/S) |
| Y | Forma y tamaño | Humedad preferida (Ha/Hm/S) |
| Z | Forma y tamaño | Tolera heladas (S/Sr/Sc/N) |
| AA–AE | Funciones | Producción biomasa / Fija nitrógeno / Acumulador de nutrientes / Cobertura viva / Flores (insectos benéficos) — booleanas |
| AF–AJ | Nutrimento principal | Calorías / Proteínas / Vitaminas / Minerales / Compuestos medicinales — booleanas |
| AK–AT | Usos (comestible) | Raíces y tubérculos / Tallos o brotes / Hojas / Flores / Nueces y semillas / Fruto o frutas / Condimentos / Medicinales y suplementos / Forraje / Maderable — booleanas |
| AW | Observaciones | Dónde conseguirla (viveros) |
| AX | Observaciones | Densidad de cobertura |
| AY | Observaciones | Soporta corte y rebrote |
| AZ | Observaciones | Nutrientes que acumula |
| BA | Observaciones | Melífera |
| BB | Observaciones | Insectos benéficos |
| BC | Observaciones | Puntuación general |

## Decisiones de diseño (ya resueltas)

1. **Columnas sin campo equivalente hoy en el modelo**: se extiende `interfaces/Species.ts`
   (`SpeciesType.taxonomy` y `SpeciesDetails`) para conservarlas todas — ver "Modelo de datos"
   abajo.
2. **Catálogos referenciados sin coincidencia** (`stratums`, `ecologicalZones`,
   `ecologicalFunctions`, `additionalFunctions`): si el valor de una celda no matchea ningún
   documento existente del catálogo por nombre, **no se crea el catálogo al vuelo ni se aborta
   la importación**: se documenta como advertencia (fila, columna, valor) en el resumen que ve
   el admin antes de confirmar, y esa referencia particular se omite para esa especie.
3. **Especies con género/especie u otros datos incompletos**: se cargan igual, con los campos
   faltantes vacíos/`undefined`. No se excluyen filas por datos incompletos.
4. **Idempotencia**: la importación hace upsert por `genus` + `species` (normalizados:
   trim + minúsculas). Si ya existe una especie con ese género y especie, se actualiza el
   documento existente en vez de crear uno duplicado; si no existe, se crea. Correr la misma
   importación varias veces no debe generar duplicados.
5. **Dónde vive**: es una **feature de la UI del panel de admin**, no un script de línea de
   comandos. El admin sube el `.xlsx` desde el navegador y la importación corre ahí mismo
   (parseo del archivo y escritura a Firestore vía el SDK cliente, igual que el resto del panel
   de admin).
6. **Archivo fuente**: no se agrega al repo (ver "Fuente de datos" arriba).

## Modelo de datos (extensión de `interfaces/Species.ts`)

```ts
export type GrowthHabit = 'clumping' | 'invasive'; // Agrupa (A) / Salta (S)

export interface SpeciesTaxonomy {
	genus: string;
	species: string;
	subspecies?: string; // Subespecie
	family?: string; // Familia
	synonyms?: string; // Sinonimías
}

export interface SpeciesNutrientContent {
	calories?: boolean;
	proteins?: boolean;
	vitamins?: boolean;
	minerals?: boolean;
	medicinalCompounds?: boolean;
}

export interface SpeciesEdibleUses {
	rootsAndTubers?: boolean;
	stemsOrShoots?: boolean;
	leaves?: boolean;
	flowers?: boolean;
	nutsAndSeeds?: boolean;
	fruit?: boolean;
	condiments?: boolean;
}

export interface SpeciesObservations {
	nurserySource?: string; // Dónde conseguirla (viveros)
	coverageDensity?: string; // Densidad de cobertura
	toleratesPruning?: boolean; // Soporta corte y rebrote
	accumulatedNutrients?: string; // Nutrientes que acumula
	isMelliferous?: boolean; // Melífera
	beneficialInsects?: string; // Insectos benéficos
	overallScore?: string; // Puntuación general
}

export interface SpeciesDetails {
	isFrostResistant?: boolean;
	lightPreference?: Level;
	nutrientExtraction?: Level;
	humidityPreference?: Level;
	lifeCycle?: string; // Ciclo de vida
	lifeCycleDuration?: string; // Ciclo vida meses/años
	heightRangeDescription?: string; // Rango de altura (texto libre, complementa `height`)
	shape?: string; // Forma
	growthHabit?: GrowthHabit;
	nutrientContent?: SpeciesNutrientContent;
	edibleUses?: SpeciesEdibleUses;
	observations?: SpeciesObservations;
}

export interface SpeciesType {
	_id: string;
	taxonomy: SpeciesTaxonomy; // antes: { genus: string; species: string }
	commonNames: LocalizedTextList;
	ecologicalZones: { mx: EcologicalZone[] };
	stratums: Stratum[];
	height: Range;
	crownWidth: Range;
	ecologicalFunctions: EcologicalFunction[];
	additionalFunctions: AdditionalFunction[];
	details?: SpeciesDetails;
}
```

### Mapeo columna → campo

- `taxonomy.genus` / `taxonomy.species` / `taxonomy.subspecies` / `taxonomy.family` / `taxonomy.synonyms` ← `Genero` / `Especie` / `Subespecie` / `Familia` / `Sinonimías`.
- `commonNames.mx` ← `Nombre común`.
- `ecologicalZones.mx` ← columnas H–M: una entrada por cada columna marcada con `x`, resuelta contra el catálogo `ecologicalZones` por nombre (ver regla de catálogos sin match arriba).
- `stratums` ← `Estrato (emergente, alto, medio, bajo)` (N), resuelto contra `stratums` (`getStratums`).
- `height` (`Range`) ← `Altura (metros)` (T). `details.heightRangeDescription` ← `Rango de altura` (R, texto libre, se guarda tal cual como complemento).
- `crownWidth` (`Range`) ← `Ancho de copa (metros)` (U).
- `ecologicalFunctions` ← columnas AA–AE (Producción biomasa, Fija nitrógeno, Acumulador de nutrientes, Cobertura viva, Flores/insectos benéficos), resueltas contra `ecologicalFunctions`.
- `additionalFunctions` ← de las columnas AK–AT, específicamente Medicinales y suplementos, Forraje y Maderable, resueltas contra `additionalFunctions` (alimento/forraje/madera/medicinal, ver README).
- `details.edibleUses` ← el resto de columnas AK–AQ (Raíces y tubérculos, Tallos o brotes, Hojas, Flores, Nueces y semillas, Fruto o frutas, Condimentos) — son más granulares que el catálogo `additionalFunctions` y no tienen un match 1:1, por eso se guardan como booleanos propios en vez de forzarlas dentro del catálogo.
- `details.nutrientContent` ← columnas AF–AJ (Calorías, Proteínas, Vitaminas, Minerales, Compuestos medicinales).
- `details.isFrostResistant` ← `Tolera heladas` (Z): `S`/`Sr`/`Sc` → `true`, `N` → `false`.
- `details.lightPreference` ← `Sol o sombra` (X): `Sol`/`Ms`/`S` → niveles de `Level`.
- `details.humidityPreference` ← `Humedad preferida` (Y): `Ha`/`Hm`/`S`.
- `details.nutrientExtraction` ← `Extracción de nutrientes` (W): `A`/`M`/`B`.
- `details.lifeCycle` / `details.lifeCycleDuration` ← `Ciclo de vida` (P) / `Ciclo vida meses/años` (Q).
- `details.shape` ← `Forma` (S).
- `details.growthHabit` ← `Agrupa o salta` (V): `A` → `'clumping'`, `S` → `'invasive'`.
- `details.observations.*` ← columnas AW–BC (Dónde conseguirla, Densidad de cobertura, Soporta corte y rebrote, Nutrientes que acumula, Melífera, Insectos benéficos, Puntuación general).
- `O` (Fuente de info de ESTRATO) no se carga: es metadata sobre la fuente del dato de estrato de quien armó el excel original, no un atributo de la especie.

## Cómo se resuelven los catálogos

Antes de escribir especies, la importación carga en memoria los catálogos existentes
(`getStratums`, `getEcologicalZones`-equivalente, `getEcologicalFunctions`,
`getAdditionalFunctions`) e indexa cada uno por nombre normalizado (trim + minúsculas, sin
acentos) para hacer el match contra el texto de cada columna del excel. Si una celda no
matchea ningún nombre del catálogo correspondiente, esa referencia se omite para esa especie y
se agrega una fila a la lista de advertencias que ve el admin (especie, columna, valor sin
match) — la importación **continúa** con el resto de especies y catálogos.

## Pasos sugeridos

1. Extender `interfaces/Species.ts` con los tipos de la sección "Modelo de datos".
2. Agregar una dependencia para leer `.xlsx` en el navegador (ej. `xlsx`/SheetJS).
3. Nueva sección/página en el panel de admin (ej. `pages/admin/import-species.tsx`, enlazada
   desde `pages/admin.tsx`), visible solo si `isAdminEmail(authUser.email)`.
4. Input de archivo → leer el `.xlsx` seleccionado (`FileReader`/`ArrayBuffer`) en el cliente,
   tomar la pestaña `ESPECIES`, saltar las 3 filas de encabezado y cualquier fila sin `Id`.
5. Mapear cada fila según la tabla de arriba, resolviendo catálogos como se describe en la
   sección anterior y acumulando advertencias de valores sin match.
6. Mostrar al admin un resumen antes de escribir: cuántas especies se crearán, cuántas se
   actualizarán (match existente por género+especie), y la lista completa de advertencias.
7. Al confirmar, escribir a Firestore en un `writeBatch` (create si no existe, update si ya hay
   una especie con el mismo género+especie normalizado) — nuevas funciones en
   `adapters/firestore.ts` (ej. `importSpecies(rows: SpeciesInput[]): Promise<ImportResult>`)
   que reutilicen la lógica de `createSpecies`/`updateSpecies` donde aplique.
8. Firestore rules: sin cambios adicionales — `species` ya es `allow write: if isAdmin();`.
9. Validar corriendo la importación dos veces seguidas con el mismo archivo y confirmando que
   la segunda corrida actualiza en vez de duplicar, además de revisar visualmente una muestra
   de especies importadas en `/species`.

## Fuera de alcance (por ahora)

- Cargar las pestañas `Especies de servicio`, `Platanos`, `Funciones`, `Respaldo4`.
- Un mapeo columna-por-columna configurable desde la UI: el mapeo queda fijo en código, definido
  por este documento.
- Sincronización continua entre el excel y Firestore (esta es una importación bajo demanda, no
  un pipeline recurrente).
- Guardar el `.xlsx` subido (en Storage o en el repo) para referencia futura.

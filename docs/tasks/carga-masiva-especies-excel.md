# Carga masiva de especies desde Excel (BASE DE DATOS ESPECIES SAF)

## Objetivo

Cargar al catálogo (`species` en Firestore, y los catálogos relacionados `stratums`,
`ecologicalFunctions`, `additionalFunctions`) las especies y sus detalles contenidos en el
archivo `BASEDATOSESPECIESSAF.xlsx`, tomando **únicamente** las filas de la pestaña
`ESPECIES`. El resto de las pestañas del archivo (`Portada`, `Abreviaturas`,
`Especies de servicio`, `Platanos`, `Funciones`, `Respaldo4`) quedan fuera de alcance de
esta carga.

## Fuente de datos

- Pestaña `ESPECIES`: **465 especies** (id 1 a 465, filas 4 a 468 de la hoja).
- 3 filas de encabezado antes de los datos:
  1. Fila 1: título (`Base de datos especies (LAS CAÑADAS)`).
  2. Fila 2: agrupación por categoría (ej. `Taxonomía`, `Zonas ecológicas`, `Forma y tamaño`, `Funciones`, `Nutrimento principal`, `Usos (comestible)`, `Otros usos`, `Observaciones`).
  3. Fila 3: nombre de columna.
- La pestaña `Abreviaturas` documenta los códigos usados en varias columnas (`A`/`M`/`B` para extracción de nutrientes, `Sol`/`Ms`/`S` para luz, `Ha`/`Hm`/`S` para humedad, `S`/`Sr`/`Sc`/`N` para tolerancia a heladas, etc.) y debe usarse como referencia al normalizar valores.
- Convención de celdas en los datos: `'-'` = no aplica / sin dato, `'x'` = verdadero (columnas booleanas), celda vacía = sin dato.

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

## Mapeo propuesto a `interfaces/Species.ts` (a revisar antes de implementar)

- `taxonomy.genus` / `taxonomy.species` ← `Genero` / `Especie`.
- `commonNames.mx` ← `Nombre común` (el excel trae un solo nombre por fila; revisar si hay que partir por comas si en el futuro se agregan varios).
- `ecologicalZones.mx` ← columnas H–M: una entrada por cada columna marcada con `x`, resuelta contra (o creando en) el catálogo `ecologicalZones` por nombre.
- `stratums` ← columna `Estrato (emergente, alto, medio, bajo)` (N), resuelta contra el catálogo `stratums` existente (`getStratums`).
- `height` (`Range`) ← `Altura (metros)` (T); ver decisión pendiente sobre si usar también `Rango de altura` (R, texto libre) como respaldo cuando T esté vacío.
- `crownWidth` (`Range`) ← `Ancho de copa (metros)` (U).
- `ecologicalFunctions` ← columnas AA–AE (Producción biomasa, Fija nitrógeno, Acumulador de nutrientes, Cobertura viva, Flores/insectos benéficos), resueltas contra el catálogo `ecologicalFunctions`.
- `additionalFunctions` ← subconjunto de columnas AK–AT que corresponden a los usos ya soportados por el catálogo `additionalFunctions` (alimento, forraje, madera, medicinal — ver README). Falta decidir cómo colapsar las columnas granulares de "Usos (comestible)" (raíces, tallos, hojas, flores, nueces, frutos, condimentos) en la categoría única "alimento".
- `details.isFrostResistant` ← `Tolera heladas` (Z): mapear `S`/`Sr`/`Sc` a `true`, `N` a `false`.
- `details.lightPreference` ← `Sol o sombra` (X): mapear `Sol`/`Ms`/`S` a los niveles de `Level`.
- `details.humidityPreference` ← `Humedad preferida` (Y): mapear `Ha`/`Hm`/`S`.
- `details.nutrientExtraction` ← `Extracción de nutrientes` (W): mapear `A`/`M`/`B`.

## Columnas del excel sin equivalente actual en el modelo

No tienen un campo correspondiente hoy en `SpeciesType`/`SpeciesDetails` y hay que decidir si se
descartan en esta carga o si ameritan extender el modelo:

- Subespecie, Familia, Sinonimías.
- Fuente de info de ESTRATO, Ciclo de vida, Ciclo vida meses/años, Rango de altura (texto), Forma, Agrupa o salta.
- Detalle por nutrimento principal (Calorías, Proteínas, Vitaminas, Minerales, Compuestos medicinales).
- Detalle granular de usos comestibles (raíces y tubérculos, tallos o brotes, hojas, flores, nueces y semillas, fruto, condimentos).
- Dónde conseguirla (viveros), Densidad de cobertura, Soporta corte y rebrote, Nutrientes que acumula, Melífera, Insectos benéficos, Puntuación general.

## Decisiones a tomar antes de implementar

1. **Qué hacer con las columnas sin equivalente**: ¿se descartan en esta primera carga, o se
   extiende `SpeciesType`/`SpeciesDetails` para conservarlas? Impacta el modelo de datos y las
   reglas de Firestore.
2. **Catálogos referenciados** (`stratums`, `ecologicalZones`, `ecologicalFunctions`,
   `additionalFunctions`): la carga debe resolver cada valor de texto del excel contra el
   catálogo existente por nombre, y decidir qué hacer si un valor no tiene coincidencia (¿crear
   el catálogo al vuelo, o fallar y reportar la fila?).
3. **Especies sin género/especie o con datos incompletos**: definir si se cargan igual (con
   campos vacíos) o se excluyen y se reportan aparte.
4. **Reejecución del script**: debe ser idempotente (upsert por género+especie, no duplicar si
   se corre dos veces), no solo insertar.
5. **Dónde vive el script y cómo se ejecuta**: un script puntual (ej. `scripts/import-species.ts`
   corrido con `ts-node`/`tsx` localmente contra Firestore, usando el Admin SDK o las
   credenciales del proyecto), no una feature de la UI. No se ejecuta en CI.
6. **Archivo fuente**: el `.xlsx` no forma parte del repo (se compartió por separado); decidir si
   se agrega a `docs/` o `scripts/data/` para que el script lo lea, o si el script recibe la ruta
   por parámetro.

## Pasos sugeridos

1. Resolver las decisiones de la sección anterior.
2. Escribir un script (`scripts/import-species.ts` o similar) que:
   - Lea la pestaña `ESPECIES` con una librería de xlsx (ej. `xlsx`/`exceljs`).
   - Ignore las 3 filas de encabezado y cualquier fila sin `Id`.
   - Normalice cada fila según el mapeo acordado (incluyendo las abreviaturas de la pestaña `Abreviaturas`).
   - Resuelva/upsert los catálogos (`stratums`, `ecologicalZones`, `ecologicalFunctions`, `additionalFunctions`) antes de escribir las especies.
   - Escriba las 465 especies en la colección `species` (batched writes), de forma idempotente.
3. Correr el script contra un proyecto/emulador de prueba primero, revisar una muestra de especies cargadas en la UI (`/species`), y luego correrlo contra el proyecto real.
4. Documentar en este archivo (o en un README del script) cómo volver a correr la carga si se actualiza el excel.

## Fuera de alcance

- Cargar las pestañas `Especies de servicio`, `Platanos`, `Funciones`, `Respaldo4`.
- Construir una UI de importación (esto es un script de un solo uso / re-ejecutable, no una feature para el admin).
- Sincronización continua entre el excel y Firestore (esta es una carga puntual, no un pipeline recurrente).

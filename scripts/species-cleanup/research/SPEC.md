# Species enrichment spec (SAF Hub)

SAF Hub is a catalog of species used in agroforestry systems (Sistemas Agroforestales, SAF) in **Mexico**,
with a syntropic-agriculture (Ernst Götsch) design approach. Data is shown in Spanish (es_mx).

You receive species in a slim JSON format (`batches/batch_N.json`). Every species has an `id` (Firestore doc id).
Your job: **validate** each record and **complete missing information** using reliable online sources
(WebSearch; WebFetch often fails because many hosts are blocked — rely on search result snippets when needed).
Good sources: POWO (Kew, Plants of the World Online), Tropicos, GBIF, CONABIO/Enciclovida, World Agroforestry
(ICRAF) Agroforestree Database, Useful Tropical Plants (tropical.theferns.info), PFAF, Feedipedia, FAO Ecocrop,
CABI Compendium, USDA PLANTS, university/extension guides, Wikipedia (as last resort, prefer cross-checking).

If you cannot find reliable info for a species, leave it unchanged and mark it `not_found`. **Never invent.**
Ranges may be approximate but must be grounded in a source.

## Catalog ids (use ONLY these ids)
- stratumIds: `0` Rastrero (creeping/ground cover), `1` Bajo, `2` Medio, `3` Alto, `4` Emergente.
  In syntropic design strata are relative positions in the consortium by light needs and mature height.
  Rough guidance consistent with the existing data: Rastrero = ground cover/creepers (squash, sweet potato,
  peanut, purslane); Bajo ≈ up to ~2 m herbs/crops (maize, beans, chili, pineapple, many herbs); Medio ≈ shrubs and
  small trees ~2–8 m (coffee, cacao, banana, citrus, papaya, guava, gliricidia); Alto ≈ trees ~8–25 m
  (avocado, mango, inga, many timber trees); Emergente ≈ tallest trees topping the canopy (ceiba, mahogany,
  cedro, parota, some palms). Look at how similar species in the dataset are classified (see
  `all_species_slim.json`) and stay consistent with it. A species may have 2 adjacent strata.
- ecologicalZoneIds (Mexico): `1` Selva húmeda, `3` Bosque de niebla, `4` Bosque de pino y encino, `6` Desierto.
  (Other zones like "Selva baja"/"Semi-desierto" may exist but their ids are unknown — do NOT use them; mention
  in `notes` if relevant.) Assign zones where the species is native OR commonly cultivated in that environment in Mexico.
- ecologicalFunctionIds: `0` Producción de biomasa (fast growth, tolerates heavy pruning, lots of organic matter),
  `1` Fijación de nitrógeno (ONLY for species with documented symbiotic N fixation: most Fabaceae with nodulation,
  actinorhizal plants like Alnus/Casuarina, Azolla...), `2` Acumulación de nutrientes (documented dynamic
  accumulator / deep roots mining nutrients, e.g. comfrey, Tithonia), `3` Control de erosión (ground covers, dense
  roots, used in contour hedges/slope stabilization, vetiver), `4` Atracción de polinizadores (melliferous / notably
  visited by bees, butterflies, hummingbirds). NOTE: currently NO species has ecological functions, so please fill
  them for every species you can justify.
- additionalFunctionIds: `0` Alimento (human food), `1` Forraje (animal fodder), `2` Maderable (timber/wood),
  `3` Medicinal (documented traditional/medicinal use).

## Field conventions (keep existing style)
- `height` and `crownWidth`: `{ "min": number, "max": number }` in **meters**, typical mature size in cultivation.
  `{min:0,max:0}` means missing. crownWidth = crown/canopy diameter (for herbs, plant spread).
- `details.lightPreference`, `details.humidityPreference`, `details.nutrientExtraction`: `"H" | "M" | "L"`
  (light: H = full sun, M = partial shade, L = shade; humidity: H = high water needs/humid, M = medium, L = drought
  tolerant/dry; nutrientExtraction: H = heavy feeder/demanding, M, L = low demand).
- `details.isFrostResistant`: boolean.
- `details.shape`: one of `árbol`, `arbusto`, `hierba`, `guía` (vine), `palma`, `bambú`, `pasto`, `falsa trepadora`, `epífita`.
- `details.lifeCycle` (successional stage, syntropic): one of `Pioneras`, `Secundarias 1`, `Secundarias 2`,
  `Secundarias 3`, `Primarias` (check how the existing data classifies comparable species in `all_species_slim.json`
  and stay consistent; only fill if you are reasonably confident).
- `details.lifeCycleDuration`: one of `Varios meses`, `Hasta 2 años`, `Hasta 15 años`, `Hasta 80 años`, `Mayor a 80 años`.
- `details.heightRangeDescription`: one of `coberturas y rastreras`, `hasta 2 mts`, `hasta 5 mts`, `de 5 a 10 mts`,
  `más de 10 mts`, `enredaderas y trepadoras` (fill only if missing; keep consistent with height).
- `taxonomy`: `genus`, `species` (epithet only), optional `subspecies` (use it also for variety/cultivar, e.g.
  `"var. Gros Michel"` or `"cv. Enano gigante"`), `family` (APG IV family name, e.g. `Fabaceae`).
  Hybrids keep the `×` in species, e.g. genus `Citrus`, species `× limon` — that's valid, do not "fix" it.
- `commonNames`: Spanish common names used in Mexico; you may ADD missing well-known Mexican names (don't remove).

## What to correct (only with clear evidence)
Correct an existing value only when a source clearly shows it is wrong (e.g. typo `Sesamum+C13` → `Sesamum`;
outdated synonym → accepted name per POWO (put the old name in `taxonomy.synonyms`); scientific name that does not match
the common name; impossible height/stratum). Every correction goes in `corrections` with old value, new value, reason and source.
Records with missing/placeholder taxonomy (`-` or empty): identify the species from its common name(s) if it is
unambiguous in the Mexican context (e.g. "gliridia" → Gliricidia sepium, "Chia" → Salvia hispanica) and record it as a correction.

## Output format
Write `results/batch_N.json`: a JSON array with one object per input species (same order, include all of them):

```json
{
  "id": "Firestore doc id",
  "name": "Genus species (Common name) — for humans",
  "status": "updated" | "no_changes" | "not_found",
  "confidence": "high" | "medium" | "low",
  "set": {
    "taxonomy.family": "Fabaceae",
    "height": { "min": 4, "max": 8 },
    "crownWidth": { "min": 3, "max": 5 },
    "stratumIds": ["2"],
    "ecologicalZoneIds": ["1", "3"],
    "ecologicalFunctionIds": ["0", "1", "4"],
    "additionalFunctionIds": ["1", "2"],
    "commonNames": ["existing names...", "added name"],
    "details.lightPreference": "H",
    "details.humidityPreference": "M",
    "details.isFrostResistant": false,
    "details.shape": "árbol",
    "details.lifeCycle": "Secundarias 2",
    "details.lifeCycleDuration": "Hasta 80 años"
  },
  "corrections": [
    { "field": "taxonomy.genus", "old": "Sesamum+C13", "new": "Sesamum", "reason": "typo", "source": "https://..." }
  ],
  "sources": ["https://..."],
  "notes": "short Spanish note: what was filled/why; or why not found"
}
```
Rules for `set`:
- Keys are dotted field paths; only include fields you change. Array fields (`stratumIds`, `ecologicalZoneIds`,
  `ecologicalFunctionIds`, `additionalFunctionIds`, `commonNames`) must contain the **full final list** (existing values + additions).
- Fill-only for non-empty existing values, unless the change is also listed in `corrections`.
- `status`: `updated` if `set` is non-empty; `no_changes` if the record was already complete and correct;
  `not_found` if you could not find reliable info (then `set` must be `{}`).
- `notes` in Spanish (they go into a report for the project owners).

Write the file incrementally (e.g. save every ~10 species) so work is not lost; validate it's valid JSON at the end
(`python3 -c "import json;json.load(open('...'))"`).

## Resuming / saving (IMPORTANT)
A previous run was interrupted by a usage limit and lost all work. So:
- **Save after every 5 species** (rewrite the whole output file as a valid JSON array).
- At start, if your output file already exists, load it and **skip ids already present** (resume).
- Keep your own reasoning short; prefer batching several WebSearch calls in one turn.

## Search budget (IMPORTANT, second pass)
WebSearch is capped at ~200 calls per turn shared by 8 agents (~25 each). Spend at most ONE search per species
(a single well-built query such as `"<Genus species>" height crown uses nitrogen agroforestry` usually returns enough),
and skip searching for trivially well-known facts that the first result already confirms. If you run out of searches,
STOP and leave the remaining ids out of the file (do not fill from memory, do not mark them not_found).

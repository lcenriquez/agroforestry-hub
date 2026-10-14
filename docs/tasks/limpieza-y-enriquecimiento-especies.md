# Limpieza y enriquecimiento del catálogo de especies

Generado: 2026-10-14T12:24:30+00:00 · Catálogo analizado: **465 especies** (colección `species` de Firestore).

> **Estado: parcial.** La investigación en línea tiene un límite de búsquedas por turno; en esta pasada se verificaron **206 de 465** especies. Las **259** restantes quedan como *pendientes de investigar* (listadas abajo) y se completarán en una siguiente pasada. La primera pasada ya se aplicó en Firestore; la segunda está descrita al final.

## Resumen

| Concepto | Cantidad |
| --- | --- |
| Especies con cambios a aplicar | 210 |
| Registros duplicados a eliminar (fusionados) | 22 |
| Especies investigadas sin información confiable (sin cambios) | 6 |
| Especies pendientes de investigar | 259 |
| Grupos que parecen duplicados pero son variedades/especies distintas | 22 |
| Grupos dudosos que requieren revisión humana | 14 |

## Cómo aplicar los cambios

Los cambios están en `scripts/species-cleanup/changes.json`. Para aplicarlos (requiere una cuenta registrada en la colección `admins`):

```bash
# 1. Simulación: muestra qué se cambiaría, no escribe nada
node scripts/species-cleanup/apply-species-cleanup.mjs
# 2. Aplicar (guarda un respaldo de cada documento antes de escribir)
ADMIN_EMAIL=tu@correo ADMIN_PASSWORD=... node scripts/species-cleanup/apply-species-cleanup.mjs --apply
```

El script omite cualquier especie que haya sido editada después de generar este archivo (precondición `updateTime`), para no pisar cambios hechos desde el panel de admin.

Criterios usados: sólo se llenan campos vacíos; un valor existente sólo se cambia si hay una corrección documentada con fuente (listadas abajo). Los estratos, zonas y funciones usan exclusivamente los ids de los catálogos existentes. Los rangos de altura y copa son tamaños típicos de la planta adulta en cultivo.

## Duplicados fusionados

El registro que se conserva hereda los datos que le faltaban del registro eliminado (nombres comunes, zonas, funciones, estrato, medidas y detalles).

| Se conserva | Se elimina | Motivo |
| --- | --- | --- |
| Gliricidia sepium (Cocoite, cacahuananche, Palo de sol, cocohite, cocuite, gliricedia) | (sin nombre científico) (gliridia) | 'gliridia' es una variante ortográfica de gliricidia (Gliricidia sepium); el registro sin taxonomía es la misma planta y está casi vacío. |
| Gleditsia triacanthos (Acacia Negra (Honey locust)) | Gleditsia triacanthos (Honey locust) | Misma especie y mismo nombre común (honey locust); sin variedad indicada. Se conserva el de más detalles. |
| Hymenaea courbaril (Guapinol, curbaril, copinol, cuapinol, guapinol, jatoba o jatobá, jatayva en guaraní, Paquió (Bolivia), o Algarrobo  (Puerto Rico, Panamá, Venezuela y Colombia), jatobá) | Hymenaea courbaril (Cuapinol, Guapinoli, Paquío) | Misma especie y nombres comunes coincidentes (cuapinol/guapinol, paquió). Fusionar; conviene copiar el estrato '3' del registro eliminado. |
| Lablab purpureus (Dolichos lab-lab) | Lablab purpureus (Frijol lab lab,zarandaja, judía de Egipto, fríjol de Egipto, chaucha japonesa) | Misma especie (frijol lablab), sin cultivar indicado. Conservar el más completo y unir los nombres comunes. |
| Psophocarpus tetragonolobus (Frijol alado) | Psophocarpus tetragonolobus (Ejote alado) | Misma especie (frijol alado / ejote alado son el mismo cultivo). Unir nombres comunes y detalles. |
| Acca sellowiana (Feijoa) | Acca sellowiana (Guayabo del país, guayavo de brasil, goiba serrana); Feijoa (Feijoa) | Feijoa sellowiana es sinónimo de Acca sellowiana (nombre aceptado en POWO); los tres registros son la feijoa. Al conservar, actualizar la taxonomía a Acca sellowiana y unir nombres comunes. |
| Carissa macrocarpa (Carisa) | Carissa macrocarpa (Carisa, ciruela natal) | Carissa grandiflora es sinónimo de Carissa macrocarpa (ciruela de Natal, nombre aceptado). Mismo nombre común. Conservar el más completo y actualizar la taxonomía a C. macrocarpa. |
| Carludovica palmata (Iraca) | Carludovica palmata (Jipijapa) | 'Cardulobica' es error de escritura de Carludovica; iraca y jipijapa son nombres de la misma palma (Carludovica palmata). Corregir el género en el registro conservado y copiar estrato/zona del eliminado. |
| Cinnamomum verum (Canela) | Cinnamomum verum (Canela, cinnamon) | Cinnamomum zeylanicum es sinónimo de Cinnamomum verum (canela de Ceilán). Conservar el más completo y actualizar la taxonomía a C. verum. |
| Citrus × latifolia (Limon persa, lima da persia) | Citrus × latifolia (Limon sin semilla, limao thaiti) | Mismo taxón (Citrus × latifolia, lima persa = lima Tahití, sin semilla); solo difiere el signo de híbrido. Unir nombres comunes y estratos. |
| Citrus × limonia (Limon mandarina, limao cravo) | Citrus sp. (lemon carnation) | 'Lemon carnation' es traducción literal de 'limão cravo' (lima Rangpur, Citrus × limonia). Misma planta. Corregir familia a Rutaceae en el conservado. |
| Cydonia oblonga (Membrillo) | Cydonia oblonga (Membrillo, marmelo portugues) | Cydonia vulgaris es sinónimo de Cydonia oblonga (membrillo). Conservar el más completo y actualizar la taxonomía a C. oblonga. |
| Syzygium cumini (Jambolan, Aceituna tropical) | Syzygium cumini (Jambul, jambolao, jamelao) | Eugenia jambolana es sinónimo de Syzygium cumini (jambolán). Conservar el más completo y actualizar la taxonomía a S. cumini. |
| Euterpe oleracea (Asai brasilero) | Euterpe oleracea (Huasai, palma murrapo, naidí, acaí) | Error de escritura del epíteto: ambos son Euterpe oleracea (açaí). Corregir a 'oleracea' y unir nombres comunes. |
| Hevea brasiliensis (Arbol del caucho, Goma) | Havea brasiliensis (Arbol de caucho, jacio del Orinoco, shiringa, seringueira, rubber tree) | 'Havea' es error de escritura de Hevea; misma especie (árbol del caucho). Unir nombres comunes. |
| Pouteria sapota (Zapote mamey) | Pouteria sapota (Zapote rey, mamey zapote) | Ambos son Pouteria sapota (mamey/zapote mamey); 'Pouteri zapota' es error de escritura. Corregir la taxonomía en el conservado y unir nombres. |
| Syzygium malaccense (Pomarosa, Manzana brasilera) | Syzygium malaccense (Manzana de agua, manzana malaya, jambo) | 'Zyzxgium' es error de escritura de Syzygium; misma especie (manzana malaya / pomarrosa malaya). Corregir género/familia (Myrtaceae) en el conservado. Ojo: 'Pomarrosa' a secas suele referirse a S. jambos (registro aparte kFpleP…), revisar nombres comunes. |
| Theobroma grandiflorum (Copoazu, Cacao blanco, Cupuazú, cupuacu) | Theobroma grandiflora (Cacao copuazu) | Misma especie (copoazú, Theobroma grandiflorum); 'grandiflora' es error de terminación. Conservar el de nombre correcto y copiar los detalles del otro (que tiene más 'details'). |
| Eugenia involucrata (Cerella, cherry of rio grande) | Eugenia aggregata (Cereza del rio grande, cereja do rio grande) | Eugenia aggregata es sinónimo (nombre ilegítimo) de Eugenia involucrata, la cereza del río Grande. Ambos registros son la misma planta y están casi vacíos; conservar el de nombre aceptado y unir nombres comunes. |
| Diospyros kaki (Persimo, caqui) | Diospyros sp. (Palo santo, caqui) | 'Caqui' y 'palo santo' (nombre usado en España/Argentina) designan al caqui, Diospyros kaki. El registro 'Diospyros sp.' está casi vacío y no indica otra variedad. |
| Tagetes lucida (Pericon) | Tagetes lucida (Tarete) | Misma especie, sin variedad, y datos idénticos (misma zona, mismos detalles). Se conserva 'Pericón' (nombre más difundido) y se añade 'Tarete' como nombre común (no se encontró fuente que confirme 'tarete' como nombre regional; verificar). |

### Parecen duplicados pero no lo son (se conservan separados)

- **Musa: Plátano enano gigante, Plátano enano enano, Banana da terra, Plátano postre (M. balbisiana), Plátano (M. paradisiaca), Plátano manzano, banana gold, banana São Tomé, Guineo, Plátano plateado**: Distintos cultivares de plátano/banano (Cavendish gigante y enano, Terra, Manzano/Silk, Ouro/Gold, São Tomé, Prata/plateado). Por regla del propietario no se fusionan; guardar el cultivar en taxonomy.subspecies. 'Plátano' (M. paradisiaca), 'Guineo' y 'Plátano postre' son genéricos y no tienen cultivar claro. Variedad registrada en taxonomía: Musa acuminata (Platano enano gigante) → *cv. Enano gigante*, Musa acuminata (Platano enano enano) → *cv. Enano*, Musa acuminata (Banana, banana da terra) → *cv. Da Terra*, Musa sp. (Platano manzano, banana apple) → *cv. Manzano*, Musa sp. (banana gold) → *cv. Gold*, Musa sp. (Platano, banana s. tomé) → *cv. São Tomé*, Musa sp. (Platano plateado, silver banana) → *cv. Plateado (Prata)*.
- **Citrus reticulata 'Tangerina ponkan' / Citrus reticulata 'Mandarina'**: Ponkan es un cultivar específico de mandarina; el otro registro es la mandarina genérica. Variedad registrada en taxonomía: Citrus reticulata (Tangerina ponkan, pokan) → *cv. Ponkan*.
- **Citrus aurantium 'Limón canario, limón criollo' / Citrus aurantium 'Naranja agria'**: Plantas distintas: la naranja agria es C. aurantium; 'limón criollo/canario' probablemente es otra especie (p. ej. Citrus × aurantiifolia o C. limon). Revisar la taxonomía de 15TiBL…, no fusionar.
- **Annona atemoya 'Chirimoya Gefner' / Annona cherimola 'Chirimoya'**: La atemoya es un híbrido (A. cherimola × A. squamosa) y 'Gefner' es un cultivar de atemoya; distinto de la chirimoya. Variedad registrada en taxonomía: Annona atemoya (Chirimoya Gerfner Annona cherimola Atemoya?) → *cv. Gefner*.
- **Rosmarinus officinalis 'Romero' / Rosmarinus sp. 'Romero rastrero'**: El romero rastrero es una forma/cultivar postrado distinto del romero erguido. (Nota: Rosmarinus officinalis hoy se acepta como Salvia rosmarinus en POWO.) Variedad registrada en taxonomía: Rosmarinus sp. (Romero rastrero) → *Grupo Prostratus (romero rastrero)*.
- **Phaseolus ssp 'Frijol de mata' / Phaseolus ssp 'Frijol trepador'**: Hábitos de crecimiento distintos (arbustivo vs. guía); tipos varietales diferentes. Variedad registrada en taxonomía: Phaseolus ssp (Frijol de mata) → *frijol de mata (hábito arbustivo)*, Phaseolus ssp (Frijol trepador) → *frijol trepador (hábito de guía)*.
- **Agave americana / Agave mapisaga / Agave salmiana (todos 'Maguey')**: Especies distintas que comparten el nombre común 'maguey'.
- **Leucaena leucocephala 'Guaje' / Leucaena pulverulenta 'Guaje'**: Especies distintas con el mismo nombre común.
- **Inga edulis / Inga vera (jinicuil) / Inga oerstediana (chalahuite)**: Especies distintas del género Inga con nombres comunes compartidos.
- **Prosopis glandulosa / P. juliflora / P. laevigata (todos 'Mezquite')**: Especies distintas de mezquite.
- **Handroanthus heptaphyllus / H. impetiginosus ('lapacho rosado')**: Especies distintas que comparten nombre común.
- **Coffea arabica / Coffea robusta (ambos 'Café')**: Especies distintas (arábica vs. robusta = C. canephora). Corregir S7apKE… a Coffea canephora.
- **Canavalia ensiformis / Canavalia brasiliensis**: Especies distintas.
- **Acacia melanoxylon 'Acacia negra' / Gleditsia triacanthos 'Acacia Negra (Honey locust)'**: Solo comparten el nombre común; son especies distintas.
- **Theobroma bicolor 'Pataxte, pataste' / Sechium edule 'Chayote, pataste'**: Solo comparten el nombre regional 'pataste'; plantas distintas.
- **Spondias mombin / Spondias purpurea ('ciruela tropical')**: Especies distintas.
- **Ribes hirtellum 'Uva espina' / Ribes rubrum 'Grosella espinosa europea'**: Especies distintas (grosella espinosa americana vs. europea). Nota: 'grosella espinosa europea' es Ribes uva-crispa, no R. rubrum (grosella roja); revisar taxonomía de SnN6KJ….
- **Lactuca indica 'Lechuga tropical' / (sin taxonomía) 'Lechuga'**: Especies distintas (lechuga común = Lactuca sativa).
- **Mentha sp. 'Menta' / Mentha spicata 'Hierbabuena' / (sin taxonomía) 'Menta de matón'**: Plantas distintas del género Mentha (o afines); sin evidencia de duplicado.
- **Cucurbita sp. 'Calabaza' / Cucurbita moschata 'Calabaza melona'**: Registro genérico vs. especie concreta; no hay coincidencia de variedad.
- **Árnica sp. / Verbesina crocata 'Árnica capitaneja'**: Plantas distintas.
- **Registros con taxonomía vacía o '-': Chile habanero, Lechuga, Chía, Amaranto, guabiroba, gliridia, Caferana, Huevo de chivo, babosa, Menta de matón, Cosamalu, Plátano morado**: Entre sí son plantas distintas (se identifican por el nombre común). 'gliridia' se fusiona con Gliricidia sepium (ver merges); 'babosa', 'Amaranto' y 'Plátano morado' tienen posibles duplicados en 'uncertain'. Sugerencia de taxonomía: Capsicum chinense, Lactuca sativa, Salvia hispanica, Campomanesia xanthocarpa (guabiroba).

### Dudosos: requieren revisión humana (no se tocaron)

- **Musa sp. 'bananas silver, bread, tropical apple' / 'Plátano plateado, silver banana' / 'banana bread' / 'Plátano manzano, banana apple'**: mejS8L… mezcla tres nombres (silver = Prata/plateado, bread, tropical apple = manzano) que coinciden con otros registros. Probablemente sea duplicado de 'Plátano plateado' (o de 'banana bread'); el propietario debe decidir a cuál cultivar corresponde y eliminarlo o asignarle uno solo. Todos están casi vacíos.
- **Musa acuminata 'plátano malayo, plátano rojo, banana nanica' / (sin taxonomía) 'Plátano morado' / Musa acuminata 'Plátano enano enano'**: HB1pUC… mezcla cultivares distintos: 'plátano rojo' coincide con 'Plátano morado' (Red Dacca) y 'banana nanica' es el Cavendish enano (coincide con 'Plátano enano enano'). Revisar y separar/renombrar; posible fusión de 'Plátano morado' con la parte 'plátano rojo'.
- **Persea schiedeana 'Anayo, aguacate criollo' / Persea schiedeana 'Chinene'**: Misma especie y sin variedad, pero los nombres comunes no coinciden y no se encontró fuente que confirme 'anayo' como nombre de P. schiedeana; 'aguacate criollo' suele referirse a P. americana var. drymifolia. Si ambos son chinene, fusionar conservando f2Ln2v….
- **Phaseolus lunatus 'Frijol ibes' / Phaseolus lunatus 'Frijol lima, frijol mantequilla'**: Ibes es el nombre maya/yucateco del frijol lima; puede ser la misma planta o una variedad criolla (grano pequeño). Decidir si se fusiona o se guarda 'var. criolla ibes' en subspecies.
- **Malpighia emarginata 'Acerola, cerecita…' / Malpighia glabra 'Acerola'**: Ambos registros describen la acerola. La acerola cultivada es M. emarginata; M. glabra es otra especie, aunque con frecuencia el nombre se aplica erróneamente a la acerola. Si NHUAev… es acerola, fusionar conservando NHUAev… (más completo) con taxonomía corregida a M. emarginata.
- **Garcinia gardneriana 'Bacupari' / Garcinia sp. 'Bacupari, bacupari miúdo' / Garcinia sp. 'Mangostán amarillo'**: 'Bacupari-miúdo' y 'mangostão-amarelo' se aplican a G. gardneriana y a G. brasiliensis según la fuente (Embrapa vs. EPAMIG). Podrían ser duplicados de G. gardneriana o corresponder a G. brasiliensis; además 'mangostán amarillo' también se usa para G. xanthochymus. Identificar la especie antes de fusionar.
- **Opuntia indica 'Nopal' / Opuntia ficus-indica 'Tuna' / Opuntia sp. 'Nopal de tuna' / Opuntia cochinea 'Nopal'**: 'Opuntia indica' no es un nombre aceptado (probablemente O. ficus-indica). Nopal verdura, nopal tunero y nopal de cochinilla (O. cochenillifera) suelen ser cultivares/especies distintos. Revisar si 6fKS5v y KFqo6v son cultivares de O. ficus-indica (p. ej. 'cv. Milpa Alta' para verdura) o duplicados.
- **Agave sp 'Maguey' / Agave sp. 'Agave'**: Dos registros genéricos de Agave con detalles casi idénticos; probablemente duplicados, pero sin especie no se puede confirmar. Decidir qué agave representa cada uno.
- **Vaccinium corymbosum 'Mora azul' / Vaccinium sp. 'Arándano'**: 'Mora azul' y 'arándano' designan al arándano azul; el registro genérico probablemente es el mismo cultivo (fusión hacia ulviLK…), salvo que se refiera a arándano rojo (V. macrocarpon).
- **(sin taxonomía) 'Amaranto' / Amaranthus sp. 'Quelites'**: Ambos son Amaranthus, pero 'amaranto' (grano, A. hypochondriacus/cruentus) y 'quelites' (verdura de hoja) pueden ser especies o usos distintos. Revisar.
- **(sin taxonomía) 'babosa' / Aloe vera 'Sábila'**: 'Babosa' es el nombre portugués/brasileño de Aloe vera, pero también se usa para otras plantas. Si es aloe, fusionar conservando jCwJrF….
- **Selaginella martensii 'Selaginela, doradilla' / Selaginella sp. 'Doradilla'**: Ambos 'doradilla'; en México la doradilla suele ser S. lepidophylla, distinta de S. martensii. Revisar si son la misma planta.
- **Pyrus communis 'Perón' / Pirus sp. 'Pera'**: Ambos perales; 'perón' puede ser un cultivar de P. communis. Posible duplicado (fusionar hacia W9CKab…) o distinto cultivar ('cv. Perón').
- **Morus sp 'Morera' / Morus alba / Morus nigra**: Morus sp. es genérico; podría duplicar M. alba o M. nigra. Identificar la especie.

## Especies actualizadas

| Especie | Campos completados/corregidos | Confianza | Notas |
| --- | --- | --- | --- |
| Acacia melanoxylon (Acacia negra) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato | high | Árbol australiano de 6–30(45) m, copa densa ~10 m, fijador de N, madera fina muy apreciada; adultos tolerantes a heladas (plántulas sensibles). Introducida, potencialmente invasora fuera de su área nativa. |
| Acaciella angustissima (Timbre) | funciones adicionales, detalles, funciones ecológicas, zonas, taxonomía | high | Arbusto o árbol pequeño de 2–7 m (Winrock), crecimiento rápido, fijador de N (nodula con Sinorhizobium), usado como forraje en agroforestería; especie medicinal importante para tzotziles y tzeltales (ICRAF). Se actualizó el género al nombre aceptado y se quitó el id de zona repetido. |
| Acanthocereus tetragonus (Cruceta) | funciones adicionales, nombres comunes, detalles, altura, estrato | medium | Cactus de tallos 3–5 angulados, arbustivo o semitrepador, 2–7 m; tallos tiernos comestibles (rico en calcio), frutos rojos comestibles; POWO registra usos alimento, forraje y medicinal; usado como cerca viva. Habita selva baja/zonas tropicales secas (zona sin id), por eso no se asignó zona. |
| Acca sellowiana (Feijoa) | funciones adicionales, nombres comunes, funciones ecológicas, zonas, estrato, taxonomía | medium | Datos existentes (4 m, copa 5 m, resistente a heladas, pleno sol) coherentes con las fuentes. Se actualiza el género y se asigna estrato Medio (como Acca sellowiana del dataset). DUPLICADO de Acca sellowiana (1aFH61QEXYgFa7vog29H) y de 'Feijoa -' (nU4HHPP1IsMmxQ8wY39X). |
| Achillea millefolium (Milenrama) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, estrato | high | Hierba perenne rizomatosa 0.5–1 m, se extiende formando tapetes (control de erosión, usada en mezclas de revegetación según USDA); muy visitada por polinizadores (RHS: >100 especies de insectos); uso medicinal histórico (heridas). Tolerante a sequía y heladas. A menudo citada en permacultura como acumuladora dinámica, pero no se encontró fuente sólida, no se asignó. |
| Acrocomia aculeata (Palma de coyol, corozo, cocoyol) | funciones adicionales, detalles, zonas, estrato, taxonomía | high | Palma espinosa de 15–20 m, nativa de las tierras bajas tropicales de México (incl. selvas y vegetación secundaria). Frutos comestibles, vino de coyol y aceite; frutos usados como alimento para ganado. commonNames está en una sola cadena separada por comas. |
| Actinidia deliciosa (Kiwi) | funciones adicionales, detalles, estrato | medium | Liana caducifolia de 4.5–9 m; en reposo resiste ~-12 °C pero las heladas tardías/tempranas dañan la planta; requiere 300–900 horas frío (en México se cultiva poco, en tierras altas ~1800 m). Se agregó Alimento (0). El Forraje (1) existente es dudoso, se dejó sin cambios. Estrato alto como otras guías del catálogo. |
| Adansonia sp. (Baobab) | funciones adicionales, detalles, altura, estrato | low | Especie no definida; datos tomados de Adansonia digitata (el baobab más cultivado): árbol de 5–25 m, muy longevo (cientos de años), de trópico seco, intolerante a heladas; hojas, frutos y semillas comestibles y amplio uso medicinal (ICRAF). Confirmar la especie. |
| Agave americana (Maguey) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, zonas, altura, estrato, taxonomía | medium | Roseta de 0.9–2 m de alto y 1.8–3 m de ancho; monocárpica: florece a los 10–25 años con un escapo de 5–10 m (flores visitadas por murciélagos, colibríes y abejas) y muere; resiste ~-5 a -10 °C. Usado en bordos/metepantles contra la erosión. Aguamiel/pulque, usos medicinales tradicionales. |
| Agave mapisaga (Maguey) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, estrato, taxonomía | medium | Maguey pulquero cultivado en el altiplano (1800–2400 m) junto con A. salmiana; aguamiel/pulque. No se encontró altura confiable específica, no se llenó. Funciones ecológicas por analogía con los magueyes pulqueros (conservación de suelo, flores para murciélagos/abejas). Hay 5 registros 'Maguey/Agave' en el catálogo: revisar posible duplicación con 'Agave sp.'. |
| Agave salmiana (Maguey) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, zonas, altura, estrato, taxonomía | high | Roseta de ~1.8 m de alto y hasta 3.6 m de diámetro; el agave más usado como forraje en SLP/Zacatecas, también en conservación de suelos, cercos vivos, combustible y construcción; aguamiel/pulque. |
| Agave sp (Maguey) | funciones adicionales, detalles, taxonomía | low | Especie no definida; solo se corrigió la familia y rasgos comunes al género (heliófilo, tolerante a sequía). POSIBLE DUPLICADO de los otros registros de Maguey (A. americana, A. mapisaga, A. salmiana) y 'Agave sp.'. |
| Agave sp. (Agave) | funciones adicionales, detalles, taxonomía | low | Especie no definida; solo se corrigió la familia y rasgos comunes al género. POSIBLE DUPLICADO de 'Agave sp (Maguey)'. |
| Alibertia patinoi (Borojo) | funciones adicionales, detalles, zonas, estrato, taxonomía | medium | Nombre actualizado según POWO. Árbol de la selva húmeda del Chocó (Costa Rica–Ecuador), no nativo de México; zona 1 por equivalencia. Fruto comestible. Alturas reportadas muy variables (3–20 m), no se rellenó altura. |
| Amaranthus hypochondriacus (Amaranto) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, zonas, altura, taxonomía | medium | Se asignó A. hypochondriacus (principal amaranto de grano en México); confirmar si se trata de A. cruentus. Planta anual de hasta ~3 m, tolerante a sequía, gran producción de biomasa; grano y hojas comestibles, rastrojo usado como forraje. Hay un registro separado 'Amaranthus sp. (Quelites)'. |
| Annona atemoya (Chirimoya Gerfner Annona cherimola Atemoya?) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Annona mucosa (Biriba, biriba) | funciones adicionales, detalles, zonas, altura, taxonomía | medium | Árbol tropical de 4-15 m, fruto comestible, sensible al frío, de clima húmedo. Se actualizó el género a Annona (sinónimo Rollinia mucosa). |
| Attalea speciosa (Coco de macaco, coco de palmera, babucu) | funciones adicionales, detalles, zonas, altura, taxonomía | medium | Palma amazónica (no nativa de México); zona 1 asignada por equivalencia climática (selva húmeda). Usos: aceite y harina del mesocarpio (alimento), torta de semilla como forraje, medicinal. Altura 10–20 m. No se asignaron funciones ecológicas por falta de evidencia. |
| Averrhoa carambola (Carambolo, starfruit) | funciones adicionales, nombres comunes, detalles, funciones ecológicas | high | Datos de altura/copa coherentes (7–10 m, copa 6–7.6 m). Floración abundante atractiva para abejas (polinizadores). Fruta comestible y usos medicinales tradicionales. Se añadieron nombres 'carambola' y 'fruta estrella'. |
| Azadirachta indica (Neem) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato | high | Árbol de 15 (hasta 30) m, copa hasta 10–20 m; tolera sequía y suelos pobres, no tolera heladas ni encharcamiento. Rebrota y tolera poda/desmoche (biomasa), melífero. Forraje (hojas para cabras), madera, medicinal/insecticida. En México se cultiva en zonas cálidas secas (selva baja, sin id disponible). |
| Bactris gasipaes (Pejibaye, chontaduro, pupuña, pipire, pijuayo, pixbae, chontaduro, cachipay, pifá, piba, chima, tembe, pupunha) | funciones adicionales, detalles | high | Corregida resistencia a heladas. Fruto y palmito comestibles; madera del tronco usada localmente. Altura registrada (10 m) es baja respecto a 15–20 m reportados, pero se dejó por ser valor existente. |
| Bambusa oldhamii (Bambu oldhami) | funciones adicionales, funciones ecológicas, taxonomía | high | Bambú amacollado de 12–18 m, culmos 7–10 cm, tolera hasta ~-7 °C. Gran producción de biomasa y control de erosión; brotes comestibles y culmos para construcción. |
| Basella alba (Espinaca de Malabar) | funciones adicionales, nombres comunes, detalles, zonas, estrato, taxonomía | high | Enredadera perenne de vida corta, crecimiento rápido (2–10 m), sensible a heladas. Se corrigió 'Maderable' por Alimento/Medicinal. 'B. rubra' se movió a sinónimos. 'espinaca trepadora' es nombre de uso común (verificar). |
| Bauhinia variegata (Falsa caoba, uña de vaca, arbol de las orquideas, o arbol orquidea, pata de vaca) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura | medium | Árbol de 6–10 m (hasta 15 m), copa 5–8 m. Hojas excelente forraje; botones florales comestibles; usos medicinales; forraje apícola. No se asignó fijación de N: Bauhinia (Cercidoideae) en general no nodula. Zonas sin asignar: ornamental cultivado ampliamente en México pero sin datos claros por zona. |
| Bertholletia excelsa (Castaña de brasil) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura | high | Árbol emergente amazónico de 30–50 m (hasta 60 m), copa 10–20 m. Nuez comestible; polinizado por abejas grandes (Euglossini, Xylocopa, Bombus). No nativo de México (zona 1 por equivalencia). |
| Bixa orellana (Achiote, urucu) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | high | Arbusto/árbol de 2–8 m. Flores polinizadas por abejas. Semillas como condimento/colorante (alimento) y usos medicinales tradicionales. Corregidos género y resistencia a heladas. |
| Borago officinalis (Borraja) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato, taxonomía | high | Hierba anual de 60–90 cm, muy melífera. Citada en permacultura como acumuladora dinámica (K, sílice) — evidencia hortícola, no peer-reviewed. Hojas y flores comestibles; uso medicinal tradicional. |
| Bromelia pinguin (Piñuela, cardon) | funciones adicionales, nombres comunes, detalles, zonas, altura, estrato, taxonomía | medium | Bromelia terrestre nativa de México a Sudamérica; roseta de hasta ~1 m (hojas 1–2 m). Fruto comestible; usada como cerca viva (Enciclovida); uso medicinal citado por Kew. Común en selva baja/costas (zona sin id). |
| Brosimum alicastrum (Ojoche o Ramon) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura | high | Árbol de 20–40 m nativo de selvas de México. Se desmocha para forraje (rebrota bien: biomasa); semilla comestible; madera. Resistente a sequía. |
| Brugmansia arborea (Floripondio) | funciones adicionales, taxonomía | medium | Arbusto andino hasta 7 m, tolera heladas ligeras. Polinizado por polillas (no se asignó función de polinizadores). Uso medicinal/ritual tradicional; planta muy tóxica. En México 'floripondio' suele referirse también a B. candida/B. suaveolens. |
| Bursera simaruba (Palo mulato, chaca) | funciones adicionales, nombres comunes, detalles, zonas, altura, estrato | high | Árbol nativo (Yucatán y costa del Pacífico, 0–1000 m), muy usado como cerca viva por estacas. Madera ligera; resina; corteza de uso medicinal tradicional. Tolerante a sequía, caducifolio; también típico de selva baja (sin id). |
| Byrsonima crassifolia (Nanche, nancite, murici) | funciones adicionales, funciones ecológicas, taxonomía | high | ICRAF: mejora el suelo bajo su copa acumulando materia orgánica y K (acumulación de nutrientes). Flores con aceite visitadas por abejas Centris y meliponinos. Fruto comestible; corteza medicinal (mixes de México). |
| Cajanus cajan (Chicharo de arbol, gandul) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | high | Arbusto perenne de vida corta, 1–4 m. Fija N (Bradyrhizobium), aporta 40–60 kg N/ha; raíz profunda que moviliza P; mucha biomasa/mantillo; visitado por abejas. Grano comestible y forraje. |
| Calendula officinalis (Calendula) | funciones adicionales, detalles, funciones ecológicas, estrato, taxonomía | high | Hierba anual de 30–70 cm, polinizada por abejas, tolera heladas ligeras. Uso medicinal (antiinflamatorio tópico) y pétalos comestibles. |
| Calliandra houstoniana (Caliandra) | funciones adicionales, detalles, funciones ecológicas | medium | Se asume la var. calothyrsus (= C. calothyrsus), leguminosa nativa del Pacífico de México y Centroamérica: fija N, rebrota tras poda (biomasa), usada en control de erosión, muy visitada por colibríes/abejas; forraje y leña. Altura media 5–6 m (hasta 12 m); el valor registrado 2–4 m es bajo pero se dejó. |
| Camellia sinensis (Te verde) | funciones adicionales, nombres comunes, detalles, taxonomía | high | Arbusto que sin poda alcanza 6–8 m, en cultivo se mantiene <2 m. Crece naturalmente bajo dosel (tolera semisombra) y tolera heladas ligeras. Hojas para bebida (alimento) y uso medicinal. Plantas de té viven más de un siglo. |
| Campomanesia phaea (Cambucí, cambuci) | funciones adicionales, detalles, altura | medium | Árbol semicaducifolio de 4–9 m endémico de la Mata Atlántica (Brasil), no presente en México; no se asignaron zonas. Fruto comestible (jugos, mermeladas). El dato existente 'raíces/tubérculos comestibles' parece erróneo (lo comestible es el fruto). |
| Campomanesia xanthocarpa (guabioroba) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, taxonomía | medium | Frutal nativo del sur de Brasil/Paraguay/Argentina, no nativo de México, por eso no se asignaron zonas ecológicas (clima subtropical húmedo con heladas; podría adaptarse a bosque de niebla/pino-encino). Árbol heliófilo, 7–13(15) m, copa 7–10 m; fruta comestible, madera y uso medicinal (hojas), flores melíferas (Embrapa). |
| Canavalia brasiliensis (Frijol espada) | funciones adicionales, detalles, funciones ecológicas, zonas, estrato | high | Leguminosa rastrera/trepadora usada como abono verde y cobertura, tolerante a sequía (5–6 meses), fija ~69% de su N del aire; forraje de época seca. Nativa de México a Sudamérica. |
| Canavalia ensiformis (Canavalia) | funciones adicionales, nombres comunes, detalles, funciones ecológicas | high | Abono verde: fija N y produce 20–25 t/ha de biomasa verde. Vainas tiernas y semillas comestibles solo cocidas (canavanina y lectinas tóxicas); forraje limitado. Nombres 'frijol de machete' y 'haba de caballo' usados en México. |
| Canna indica (Achira) | funciones adicionales, nombres comunes, detalles, estrato, taxonomía | medium | Taxonomía de la achira no resuelta (C. indica vs. C. discolor); se usa C. indica según tratamiento más común. Rizoma comestible rico en almidón. Hierba de 0.4–2.5 m. |
| Capsicum chinense (Chile habanero) | funciones adicionales, ancho de copa, detalles, zonas, altura, taxonomía | high | Identificado como Capsicum chinense. CICY: 0.4–1.0 m a cielo abierto, hasta >1.5 m en agricultura protegida; ~80% de la producción nacional en la península de Yucatán (selva). Es semiperenne; se dejó 'Varios meses' como estaba. Se conserva el estrato existente (relativo al consorcio). |
| Carissa macrocarpa (Carisa) | nombres comunes, zonas, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Carludovica palmata (Iraca) | nombres comunes, detalles, zonas, estrato, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Cenchrus purpureus (Pasto elefate) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, taxonomía | high | Pasto perenne amacollado de 2-4 m (hasta 7 m). Forraje de corte muy productivo; gran producción de biomasa para acolchado en sintrópica; usado en barreras vivas contra erosión. edibleUses.fruit existente no aplica. |
| Cenostigma pluviosum (Momoqui) | detalles, taxonomía | medium | Taxonomía actualizada. Árbol sudamericano (Bolivia/Brasil), altura muy variable según variedad (3–10 m en ejemplares; grandes hasta >20 m), no se rellenó altura. No se asignó fijación de N (el grupo Caesalpinia s.l. generalmente no nodula). El dato existente de 'fruto comestible' parece dudoso. |
| Cinnamomum verum (Canela) | funciones adicionales, nombres comunes, detalles, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Citrus reticulata (Tangerina ponkan, pokan) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Citrus × floridana (Limon Kumquat Meiva Hibrido, Limequat (x Citrofortunella)) | funciones adicionales, detalles, funciones ecológicas, taxonomía | medium | Nombre corregido a Citrus × floridana. RHS indica altura de 1.5–2.5 m (el registro tiene 4 m; no se cambió, revisar). Uso comestible del fruto (edibleUses marca 'nutsAndSeeds', probablemente debería ser 'fruit'). |
| Citrus × latifolia (Limon persa, lima da persia) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, estrato, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Citrus × limetta (Lima) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura | medium | Monografía SIAP: rara vez supera 5 m; TopTropicals 3–6 m. Flores visitadas por abejas como otros cítricos. |
| Citrus × limon (Limon americano) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura | high | UF/IFAS: árbol de 3–6 m; abejas visitan las flores con frecuencia. Sensible a heladas. Uso medicinal tradicional documentado. |
| Citrus × limonia (Limon mandarina, limao cravo) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, taxonomía | high | Familia corregida. Altura 3–5 m. POSIBLE DUPLICADO de X51MIOJHbwt9EB4gXcBh ('lemon carnation' = limão cravo). edibleUses marca hojas y raíces, lo cual parece erróneo (el uso es el fruto). |
| Citrus × paradisi (Toronja) | funciones adicionales, detalles, funciones ecológicas, taxonomía | high | Epíteto corregido. Se agregó Alimento. Las funciones existentes Forraje y Maderable parecen dudosas para toronja (revisar). La altura registrada (3.5–4 m) es baja: la toronja suele alcanzar 5–6 m o más; no se cambió. |
| Clitoria fairchildiana (mexican sombreiro) | detalles, funciones ecológicas, altura, taxonomía | medium | Identificado como Clitoria fairchildiana (sombreiro), nativo de Brasil (no de México pese al nombre 'mexican'); árbol de 8–15 m (hasta 20), nodula con Bradyrhizobium, recomendado para SAF y recuperación de áreas degradadas. Verificar identificación con los responsables. No se asignaron zonas mexicanas. |
| Cnidoscolus aconitifolius (Chaya) | funciones adicionales, funciones ecológicas, taxonomía | medium | Arbusto perenne de rápido crecimiento (≈3 m, hasta 6 m), tolera poda fuerte; usos alimenticio (hojas cocidas), forrajero y medicinal maya (Ebel et al.). Flores visitadas por abejas y mariposas (fuente de vivero). El estrato 'Emergente' parece inconsistente con 2.5 m de altura; no se cambió por ser posición relativa en el consorcio — revisar. isFrostResistant=true parece dudoso (especie tropical). |
| Cocos nucifera (Cocotero) | funciones adicionales, nombres comunes, ancho de copa, funciones ecológicas, altura | high | Agroforestree: variedades altas 24–30 m (existen enanas), madera de estípite usada en construcción, flores melíferas. Copa 4.6–10 m según fuentes. Se agregaron Alimento y Maderable. |
| Coffea arabica (Cafe) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, estrato, taxonomía | high | UF/IFAS: 3–4.5 m (10–15 ft), semisombra; dañado por helada a 0 °C. Silvestre puede alcanzar 9–12 m, en cultivo se poda. Se añadió estrato Medio (el SPEC lo ubica ahí) conservando Bajo. Flores visitadas por abejas. |
| Coffea canephora (Cafe) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, altura, estrato, taxonomía | high | Nombre actualizado a C. canephora. Arbusto o arbolito de 2–9 m (EcoCrop), 4–8 m (RHS); se cultiva en tierras bajas cálido-húmedas (Chiapas, Veracruz). Sin tolerancia a heladas. |
| Colocasia esculenta (Malanga, Taro) | funciones adicionales, detalles, taxonomía | high | Familia Araceae agregada; resistencia a heladas corregida a false. Altura 1–2 m consistente con RHS (1–2.5 m). Con 1–2 m quizá el estrato correcto sea Bajo en vez de Medio (no se cambió). |
| Commelina erecta (Matlali) | funciones adicionales, nombres comunes, taxonomía | medium | Nombre actualizado a C. erecta. Uso medicinal documentado por TRAMIL; hojas tiernas consumidas como quelite. Nota: en el centro de México 'matlali/matlalín' también designa a Commelina coelestis/C. tuberosa; verificar qué planta se refiere. |
| Copaifera officinalis (Palo de aceite, copaíba) | funciones adicionales, detalles | medium | Árbol nativo de Venezuela al NE de Brasil y Bolivia (200–500 m s.n.m., bioma tropical estacionalmente seco); no nativo de México, por lo que no se asignaron zonas. Oleorresina (aceite de copaíba) de uso medicinal. No se encontró fuente fiable de altura/copa específica; no se asignó fijación de N (el género Copaifera, Detarioideae, generalmente no nodula). |
| Cordia alliodora (Xochicuahuitl, Picana negra, laurel) | funciones adicionales, detalles, funciones ecológicas, altura, estrato | high | Árbol maderable de hasta 40 m, fuste limpio, copa compacta; muy usado como sombra de café y cacao. Flores fuente importante de néctar para apicultores (PROSEA). Se añadió estrato Emergente. |
| Cordia dodecandra (Ciricote) | funciones adicionales, detalles, funciones ecológicas, zonas, altura, estrato | high | Árbol caducifolio de hasta 30 m de la Península de Yucatán; fruto comestible (dulce de ciricote), madera dura muy apreciada, corteza medicinal (tos, diarrea); documentado como recurso para polinizadores. Especie vulnerable. Crece en selvas medianas/bajas sobre suelo calcáreo (zona 'Selva baja' no disponible; se asignó Selva húmeda). |
| Cordiera sessilis (Marmelo de campo, marmelada de cachorro) | funciones adicionales, detalles, taxonomía | medium | Arbusto ramificado de copa baja del Cerrado brasileño; fruto comestible fresco y en dulces; madera para leña. No nativo de México (sin zonas). No se encontró altura fiable. |
| Corylus avellana (Avellano) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato | high | Arbusto multitallo de 3–6 m (hasta 8–10), tradicionalmente manejado en tallar (coppice) para varas; polen temprano valioso para abejas melíferas. Especie templada, resistente a heladas; poco cultivada en México. |
| Crataegus mexicana (Tejocote) | funciones adicionales, funciones ecológicas, estrato, taxonomía | high | Epíteto corregido. Árbol pequeño de 4–7 m (ocasionalmente 10), nativo de México a Guatemala. Fruto comestible; uso medicinal tradicional (tos, vías respiratorias). Flores de rosácea visitadas por abejas. |
| Crescentia cujete (Jicaro, totumo, güira, coité) | funciones adicionales, detalles, funciones ecológicas, altura | high | Árbol de 6–10 m (hasta 12). Frutos maduros consumidos por ganado bovino y caballos; amplio uso medicinal tradicional (revisión PMC). Polinizado por murciélagos (se asignó atracción de polinizadores). No confundir con C. alata (morro). |
| Cydonia oblonga (Membrillo) | funciones adicionales, nombres comunes, detalles, estrato, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Diospyros kaki (Persimo, caqui) | nombres comunes | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Eucalyptus cinerea (Dolar) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, estrato | medium | Árbol de 8-15 m (copa 5-8 m), tolerante a sequía y heladas, rebrota tras poda. Usos: ornamental/follaje de floristería y aceite esencial (cineol, medicinal). Los edibleUses existentes (semillas, raíces) no tienen sustento; se recomienda revisarlos. |
| Eucalyptus sp. (Eucalipto, eucalyptus) | funciones adicionales, detalles, funciones ecológicas, zonas | medium | Registro a nivel de género: no se fijan alturas por la gran variación entre especies. Eucaliptos plantados en México (E. camaldulensis, E. tereticornis, etc.) para leña/madera; crecimiento rápido y rebrote (biomasa), melíferos, aceite esencial medicinal. Posible duplicado conceptual con los registros de especies de Eucalyptus. |
| Eucalyptus tereticornis (Eucalipto de Mysore) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, estrato | medium | Árbol de rápido crecimiento (hasta 35-45 m en sitios favorables), probado en plantaciones del noreste de México. Importante fuente de néctar y polen (miel), leña, carbón y madera. Se retiró 'Forraje' por falta de evidencia. |
| Eugenia brasiliensis (Cereza de brasil, grumixama) | funciones adicionales, nombres comunes, detalles, altura | medium | Árbol frutal de lento crecimiento, 3-7 m en cultivo (hasta 14 m silvestre); pleno sol a media sombra, requiere humedad constante. Fruto comestible. |
| Eugenia dysenterica (Cagaita, Cagaiteira, cagaita) | funciones adicionales, detalles, funciones ecológicas, altura | medium | Árbol del Cerrado brasileño de 4-11 m, tronco tortuoso; considerada melífera (Embrapa). Fruto comestible (laxante en exceso); hojas y corteza de uso medicinal tradicional (antidiarreico). Especie de sabana seca estacional: pleno sol, tolerante a sequía. No es nativa de México. |
| Eugenia involucrata (Cerella, cherry of rio grande) | funciones adicionales, nombres comunes, detalles, altura | medium | Árbol del sur de Brasil (clima templado, bosques con Araucaria) de hasta 15 m, copa estrecha y alargada; tolera frío/heladas ligeras. Fruto comestible. DUPLICADO: Eugenia aggregata (UU7LP5Fw5bnbPCs5UCVf) es sinónimo de esta especie. |
| Eugenia leitonii (Ubajai, araca piranga) | funciones adicionales, detalles, altura | low | Árbol semicaducifolio de 8-14 m con copa piramidal abierta (fuentes de viveros); fruto comestible. Se añade Alimento manteniendo Maderable existente. Ojo: GRIN marca el nombre 'Eugenia leitonii' como nom. inval.; además 'ubajai' corresponde a otra especie (Eugenia myrcianthes / Hexachlamys edulis). |
| Eugenia pyriformis (Avaia, uvaia) | funciones adicionales, detalles, altura | medium | Árbol frutal de la Mata Atlántica, hasta ~10 m (algunas fuentes hasta 15 m), adaptado a altitudes de hasta 1000 m. Fruto comestible. Tolerancia a heladas citada solo en fuente de divulgación (no se llenó). |
| Eugenia stipitata (Guayaba amazonica, arasaboy) | funciones adicionales, nombres comunes, detalles, altura | medium | Arbusto o árbol pequeño amazónico (2.5 m hasta 15 m excepcionalmente; en cultivo ~2-6 m), crece mejor bajo sombra de árboles más altos; se intercala con cultivos anuales en los primeros años. Fruto comestible. El edibleUses 'leaves' existente parece erróneo (se come el fruto). |
| Eugenia uniflora (Pitanga, cereza de Cayena) | funciones adicionales, nombres comunes, detalles, funciones ecológicas | high | Arbusto/árbol pequeño (hasta 8-10 m), fruto comestible; hojas en decocción como remedio para resfriado y febrífugo. Flores ricas en polen visitadas por abejas. Es invasora en algunas regiones tropicales. |
| Euterpe edulis (Palmito, palmito dulce, palmitero, ensarova, jussara, jucara) | funciones adicionales, detalles, altura | medium | Palma solitaria de sotobosque de la Mata Atlántica, 8-20 m, tolerante a sombra (sobre todo joven) y a heladas ligeras (plántulas soportan sobreenfriamiento hasta ~-10 °C). Palmito y fruto comestibles; se añade Alimento manteniendo Medicinal existente. No nativa de México. |
| Euterpe oleracea (Asai brasilero) | funciones adicionales, nombres comunes, detalles, altura, taxonomía | medium | Mismos datos que Euterpe oleracea. DUPLICADO de QVaPpZtRqRL2A1MrsKiF; se sugiere fusionar (conservar lifeCycle de este registro). |
| Euterpe precatoria (Asai nativo) | funciones adicionales, nombres comunes, detalles, altura, taxonomía | medium | Palma generalmente solitaria de 3-20 m (var. longivaginata de Centroamérica más baja, a veces cespitosa). Fruto (açaí) y palmito comestibles, tallos para construcción, raíces medicinales. Llega a Centroamérica; no se asignan otras zonas. |
| Eysenhardtia polystachya (Palo dulce) | funciones adicionales, detalles, funciones ecológicas, zonas, altura, estrato, taxonomía | high | Árbol/arbusto caducifolio nativo de México (SE Arizona a Oaxaca), 2-8 m. Nódulos fijadores de N desde los 30 días; reduce pérdida de suelo en restauración; muy visitado por abejas (mucho néctar). Forraje apetecido (~22% proteína), leña/postes y uso medicinal tradicional (afecciones renales). Probablemente también zona 'Selva baja' (id desconocido). |
| Fagopyrum esculentum (Trigo Sarraceno) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura | high | Hierba anual de 0.6-1.2 m, cultivo de cobertura muy rápido (flor a los 35-40 días). Extrae fósforo del suelo mejor que otros cultivos de cobertura (acumulador), flores abundantes muy atractivas para polinizadores. Grano comestible. Sensible a heladas y sequía. El estrato 'Alto' existente parece alto para su porte (quizá relativo en consorcio pionero); no se cambió. crownWidth estimado como extensión de planta. |
| Faidherbia albida (Espina de invierno) | funciones adicionales, detalles, funciones ecológicas, altura, estrato | high | Leguminosa africana de 15-30 m, copa amplia redondeada, fijadora de N (nódulos). Fenología invertida: pierde hojas en lluvias, no compite con cultivos (aumenta rendimiento de maíz). Vainas y hojas forrajeras en época seca. Zonas secas/aluviales; no nativa de México (no se asignan zonas). |
| Ficus carica (Higo) | funciones adicionales, nombres comunes, ancho de copa | high | Árbol pequeño de 3-8 m de alto y ancho, tolerante a sequía una vez establecido (aunque fructifica mal con estrés hídrico). Fruto comestible. Se corrige la copa. |
| Flemingia macrophylla (Flemingia) | funciones ecológicas, taxonomía | high | Arbusto leñoso de raíz profunda (~2.5-4 m), fija N con Bradyrhizobium (~75 kg N/ha/año), plantado en setos en curvas de nivel contra la erosión; su mulch se descompone lento y conserva humedad. Forraje pobre (taninos), no se añadió Forraje. El edibleUses 'fruit' existente no tiene sustento. |
| Foeniculum vulgare (Hinojo) | funciones adicionales, detalles, funciones ecológicas, altura, estrato | high | Hierba perenne (o bienal) de 1.5-2.4 m con raíz pivotante; flores atraen abejas e insectos benéficos (sírfidos, avispas parasitoides). Hojas y semillas comestibles y medicinales. Puede ser maleza invasora. |
| Fragaria vesca (Fresa silvestre) | funciones adicionales, ancho de copa, funciones ecológicas, altura, estrato | high | Hierba rastrera de 7-23 cm, se extiende por estolones como cobertura en sombra parcial (fructifica mejor a pleno sol). Fruto comestible. |
| Gleditsia triacanthos (Acacia Negra (Honey locust)) | nombres comunes, detalles | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Gliricidia sepium (Cocoite, cacahuananche, Palo de sol, cocohite, cocuite, gliricedia) | funciones adicionales, nombres comunes, detalles, funciones ecológicas | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Hevea brasiliensis (Arbol del caucho, Goma) | nombres comunes | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Hymenaea courbaril (Guapinol, curbaril, copinol, cuapinol, guapinol, jatoba o jatobá, jatayva en guaraní, Paquió (Bolivia), o Algarrobo  (Puerto Rico, Panamá, Venezuela y Colombia), jatobá) | nombres comunes, detalles | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Ipomoea batatas (Camote, batata) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, estrato, taxonomía | high | Se agregó familia, extensión (1-3 m), funciones (cobertura de suelo/erosión; alimento y forraje: las guías tienen valor forrajero comparable a la alfalfa). Se corrigió estrato a Rastrero y resistencia a heladas a false. |
| Jatropha curcas (Jatropa, piñón) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, estrato, taxonomía | high | Arbusto/arbolito de 3-6 m (estrato Medio), crecimiento rápido, tolera poda, usado como cerco vivo. Estudio en México registra 36 especies de insectos visitantes (abejas sin aguijón). Usos medicinales tradicionales (látex). Semillas tóxicas en variedades no comestibles (existe la variedad no tóxica mexicana 'piñón'). |
| Jubaea chilensis (Coquito chileno) | funciones adicionales, detalles, altura, estrato, taxonomía | medium | Palma chilena de crecimiento muy lento (florece a los 40-50 años), 12-25 m de altura; frutos comestibles ('coquitos') y savia para miel de palma. Tolera heladas (-9 a -15 °C). Especie de clima mediterráneo, no nativa de México; la zona ecológica existente (bosque de niebla) es dudosa pero no se modificó. |
| Juglans neotropica (Nogal Andino) | funciones adicionales | medium | Se agregaron usos maderable (madera fina, ebanistería; especie En Peligro por sobreexplotación) y alimento (nueces usadas en confitería). Puede alcanzar hasta 40 m en estado silvestre; se mantuvo la altura existente (16-20 m) como típica en cultivo. Especie andina, no nativa de México. |
| Juglans pyriformis (Nogal, cedro nogal) | funciones adicionales, detalles | medium | Endémica de México (Hidalgo, Veracruz, Oaxaca), amenazada (NOM-059), del estrato medio-alto del bosque mesófilo; madera muy valorada (muebles finos, instrumentos), usada como sombra en cafetales y cerco vivo. No se encontró una altura/diámetro de copa confiable. |
| Juglans regia (Nogal de castilla) | funciones adicionales, ancho de copa, detalles, altura | high | Árbol caducifolio de 12-20 m y copa de 8-20 m; tolera hasta -27 °C en dormancia (brotes sensibles a heladas tardías); polinización por viento. Usos: nuez comestible, madera fina, medicinal (hojas/cáscara, según PFAF). |
| Kalanchoe sp. (Calanchoe) | funciones adicionales, detalles, estrato, taxonomía | low | Registro a nivel de género; se completaron solo atributos comunes del género (suculenta de sol, tolerante a sequía, sensible a heladas). Si se trata de K. pinnata ('siempreviva', 0.3-2 m) tiene uso medicinal tradicional en México, pero CONABIO la cataloga como exótica invasora de riesgo muy alto. Conviene identificar la especie. |
| Khaya sp. (mogno africano) | funciones adicionales, nombres comunes, detalles | low | Registro a nivel de género. Las especies plantadas como 'mogno africano' (K. grandifoliola, K. senegalensis, K. ivorensis) son árboles maderables grandes (K. ivorensis 40-50 m), por lo que el estrato Emergente es coherente. No se fijó altura por depender de la especie. |
| Lablab purpureus (Dolichos lab-lab) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, estrato | high | Leguminosa trepadora fijadora de N, abono verde y cobertura que reduce erosión, forraje (6-10 t MS/ha), granos y vainas comestibles. Tolera sequía (raíz pivotante), no tolera heladas. POSIBLE DUPLICADO de n2UNcUf99pIELlnqOEAB (misma especie). |
| Lactuca indica (Lechuga tropical) | funciones adicionales, detalles, estrato, taxonomía | medium | Hierba semiperenne de crecimiento rápido, hojas comestibles; forraje (gansos, aves) y usos medicinales tradicionales (tónico, digestivo). Puede volverse maleza por autosiembra. |
| Lactuca sativa (Lechuga) | funciones adicionales, ancho de copa, detalles, zonas, altura, taxonomía | high | Identificada como Lactuca sativa. Hortaliza de clima fresco (zonas templadas/altas), tolera heladas ligeras; altura en estado vegetativo. OJO: edibleUses marca 'fruit' pero se consumen las hojas (no se modificó por estar fuera de los campos del spec). |
| Lampranthus coccineus (Flor de cristal​, perejil de la reina​ o uña de gato) | ancho de copa, detalles, funciones ecológicas, estrato | low | Datos a nivel de género (no hubo ficha específica de L. coccineus): suculenta cubresuelo de ~20 cm de alto y 50-70 cm de extensión, tolerante a sequía, atractiva para abejas. Uso ornamental. |
| Laurus nobilis (Laurel, louro) | funciones adicionales, detalles | medium | Hojas usadas como condimento y en medicina tradicional. Sin poda alcanza 7.5-15 m (copa 5-8 m); se mantuvo 2-4 m asumiendo manejo con poda. Resiste ~-5 °C. Nota: el 'laurel' mexicano de cocina suele ser Litsea glaucescens, distinto de L. nobilis. |
| Lavandula angustifolia (Lavanda) | funciones adicionales, detalles, funciones ecológicas, estrato | high | Subarbusto aromático de 0.4-1 m, muy visitado por abejas y mariposas (RHS 'plants for pollinators'), tolerante a sequía, resiste -15 °C. Uso medicinal/aromático. |
| Leucaena leucocephala (Guaje) | funciones adicionales, detalles, funciones ecológicas, zonas | high | Leguminosa fijadora de N de crecimiento rápido, tolera poda/rebrota (abono verde), setos en contorno contra erosión, forraje (máx. 20% de la dieta por mimosina), leña y carbón, forraje apícola; semillas/vainas ('guaje') comestibles en México. Moderadamente tolerante a sequía pero no a sitios muy secos: la zona 'Desierto' es dudosa. |
| Leucaena pulverulenta (Guaje) | nombres comunes, funciones ecológicas, zonas | medium | Árbol del noreste de México y sur de Texas ('tepeguaje'); NPSOT reporta 9-17 m (mayor a los 4-10 m registrados) y una base de datos indica tolerancia hasta ~-12 °C (zona USDA 8), lo que contradice isFrostResistant=false; no se corrigió por evidencia limitada. Fijación de N asumida a nivel de género Leucaena (Mimosoideae noduladoras). |
| Liquidambar styraciflua (Liquidambar) | funciones adicionales, nombres comunes, detalles, altura, estrato, taxonomía | medium | Árbol de hasta ~40 m de bosques montanos (mesófilo) de México; resina (estoraque/ocozote, náhuatl Ocotzocuahuitl) con usos medicinales tradicionales; madera usada en muebles y contrachapados. Caducifolio de origen templado, tolera heladas. |
| Litchi chinensis (Lichi, lychee) | funciones adicionales, detalles, funciones ecológicas | medium | Frutal; flores polinizadas por abejas (importantes) y moscas. Alcanza hasta 12 m (Agroforestree), usualmente menor en cultivo. isFrostResistant=true es discutible: árboles jóvenes sensibles a heladas, se recomienda zonas libres de heladas (no se cambió por fuentes contradictorias). Ciclo de vida asignado por analogía con rambután en el dataset. |
| Luffa aegyptiaca (Estropajo) | funciones adicionales, detalles, taxonomía | high | Trepadora anual (guía hasta ~9 m), sensible a heladas; frutos tiernos comestibles, fruto seco como esponja, usos medicinales y cosméticos. |
| Luma apiculata (Arrayan) | funciones adicionales, detalles, funciones ecológicas, altura, estrato | medium | Mirtácea chilena; bayas comestibles, flores muy visitadas por abejas (melífera). Resiste ~-10 °C; tolera sequía una vez establecida pero no calor extremo ni encharcamiento. La zona 'Desierto' parece inadecuada (no se modificó). |
| Lupinus angustifolius (Altramuz) | funciones adicionales, detalles, funciones ecológicas, estrato | high | Anual de 0.3-1.5 m, fija N (nódulos en raíz pivotante), abono verde con buena biomasa, moviliza fósforo; variedades dulces usadas como forraje. Tolerante al frío. heightRangeDescription 'coberturas y rastreras' no concuerda con 1 m de altura (no se cambió). |
| Lupinus sp. (Lupino) | detalles, funciones ecológicas, estrato | medium | Registro a nivel de género. México tiene ~110 especies nativas de Lupinus (p.ej. L. exaltatus, L. mexicanus, L. montanus, L. elegans) con fijación de N documentada y uso como abono verde y en rehabilitación de suelos forestales. Se recomienda identificar la especie. |
| Lycium barbarum (Goji berry) | funciones adicionales, detalles, funciones ecológicas, estrato | high | Arbusto de 1.5-3 m (RHS: 3 x 4 m), resistente a heladas y sequía, atrae abejas; fruto comestible y medicinal (medicina tradicional china). Puede extenderse por hijuelos. |
| Macadamia integrifolia (Macadamia) | funciones adicionales, detalles, funciones ecológicas | high | Árbol de 8-18 m (copa hasta 15 m); polinización por insectos, se recomienda introducir abejas. Prefiere clima subtropical sin heladas: isFrostResistant=true es discutible (no se cambió). Ciclo asignado por analogía con otros frutales arbóreos del dataset. |
| Musa acuminata (Banana, banana da terra) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Musa acuminata (Platano enano enano) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Musa acuminata (Platano enano gigante) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Musa acuminata (Platano morado) | funciones adicionales, detalles, funciones ecológicas, taxonomía | medium | Se identificó como el plátano morado/rojo (Musa grupo AAA). POSIBLE DUPLICADO de 'Musa acuminata (platano malayo, platano rojo, banana nanica)'. Musáceas: gran producción de biomasa (uso clásico en sintropía), fruta comestible; hojas de uso medicinal tradicional. Se agregó Alimento (0). Shape 'hierba' (hierba gigante); en el catálogo hay otro plátano como 'palma', revisar consistencia. |
| Musa sp. (banana gold) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Musa sp. (Platano manzano, banana apple) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Musa sp. (Platano plateado, silver banana) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Musa sp. (Platano, banana s. tomé) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Myrciaria glazioviana (Guapirijuba, cabeludinha) | funciones adicionales, detalles, funciones ecológicas, altura | medium | Arbusto grande o arbolito de 3-6 m (Growables, ECHO), nativo de la Mata Atlántica de Brasil; fruto comestible. Flores de Myrtaceae visitadas por abejas. No se asignó zona ecológica: su cultivo en México es marginal (sería Selva húmeda). |
| Myroxylon balsamum (Arbol del bálsamo, Quina quina) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, taxonomía | high | Árbol de 15-35 m (POWO: (8-)15-50 m), nativo del sur de México a Sudamérica. Nodula y fija nitrógeno; usado como sombra de café. Madera fina para ebanistería; bálsamo de uso medicinal (tos, asma) y en perfumería. Nombre en México: nabal. |
| Myrtillocactus geometrizans (Garambuyo) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, estrato | high | Cactácea arborescente endémica de México, 2-5 m. Frutos (garambullos) y flores comestibles; uso medicinal tradicional. Flores visitadas por abejas. Forma 'cactus' no está en el catálogo; se usó 'arbusto'. Se añadió la grafía correcta 'Garambullo'. |
| Neltuma glandulosa (Mezquite) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, zonas, altura, estrato, taxonomía | medium | Árbol/arbusto de 3-9 m de zonas áridas del norte de México. Nodula con Rhizobium (fijador de N), melífero, vainas comestibles y forrajeras, leña. Se actualizó el género a Neltuma (nombre aceptado en POWO); si se prefiere mantener Prosopis por uso común, revisar. Zonas: se eliminó el '6' duplicado. |
| Neltuma juliflora (Mezquite) | funciones adicionales, detalles, funciones ecológicas, zonas, altura, estrato, taxonomía | medium | Árbol de 3-12 m, fija nitrógeno (Rhizobium), vainas forrajeras y comestibles, leña y carbón muy apreciados, melífero. Sensible a heladas (ICRAF). Se eliminó zona '6' duplicada. Posible confusión de nombres: los tres mezquites del catálogo comparten el nombre común 'Mezquite'. |
| Neltuma laevigata (Mezquite) | funciones adicionales, detalles, funciones ecológicas, zonas, taxonomía | high | Árbol de hasta ~13 m del centro de México; vainas y follaje forrajeros, harina de vaina comestible, madera para leña/carbón/muebles, especie melífera. Se cambió el género a Neltuma (POWO) y se eliminó zona '6' duplicada. |
| Nephelium lappaceum (Rambutan, mamón chino, achotillo, rambotao) | funciones adicionales, detalles, funciones ecológicas, altura | high | Árbol de 10-12 m en cultivo (ICRAF), hasta 20-25 m silvestre; trópico húmedo (cultivado en Soconusco, Chiapas). Flores muy visitadas por abejas (fuente de néctar). Fruto comestible; usos medicinales tradicionales en Asia. |
| Ochroma pyramidale (Balsa, madera balsa) | funciones adicionales, detalles, funciones ecológicas, altura | high | Pionera típica de crecimiento muy rápido (hasta 30-40 m), copa estrecha y hojas grandes de vida corta: alta producción de biomasa. Flores nocturnas ricas en néctar visitadas por murciélagos, aves y otros polinizadores. Madera ligera (balsa). Precipitación 1250-3000 mm, <1000 msnm. |
| Ocotea longifolia (Canela de India, canela de cheiro) | detalles, altura | low | Información escasa. Árbol sudamericano (Amazonía/Cerrado) de 4-20 m según ejemplares de herbario y EOL. No se confirmó uso alimenticio del fruto (edibleUses.fruit existente es dudoso). Los nombres comunes parecen brasileños; no se asignó zona ecológica en México. |
| Oenocarpus bataua (Majo) | funciones adicionales, detalles, altura, taxonomía | high | Palma amazónica de 10-25 m, selvas húmedas <1000 msnm. Fruto comestible con aceite de alta calidad; aceite usado en medicina tradicional (afecciones respiratorias). No es nativa de México. |
| Oenothera macrocarpa (Onagra) | detalles, funciones ecológicas, altura, estrato, taxonomía | high | Herbácea perenne rastrera de 15-45 cm, extensión 0.3-0.6 m, tolerante a sequía, nativa del centro-sur de EUA. Flores grandes polinizadas por esfinges (polillas). Uso principalmente ornamental. |
| Olea europaea (Olivo, olivera, aceituno, oliveira) | funciones adicionales, detalles, taxonomía | high | Árbol mediterráneo muy longevo, tolerante a sequía y heladas ocasionales. Fruto y aceite comestibles, madera apreciada, hoja de uso medicinal (hipotensora). Polinización por viento, por eso no se marcó atracción de polinizadores. En México se cultiva en zonas áridas/semiáridas (BC, Sonora). |
| Opuntia cochenillifera (Nopal) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, altura, taxonomía | medium | Se interpretó 'Opuntia cochinea' como O. cochenillifera (sin. Nopalea cochenillifera), nativa de México, hospedera tradicional de la grana cochinilla; arbusto/arbolito de 3-4.5 m. Cladodios tiernos comestibles y usados como forraje; uso medicinal tradicional. Flores rojas visitadas por colibríes. Es de selva baja/matorral seco más que de desierto. Confianza media en la identificación. |
| Opuntia ficus-indica (Nopal) | funciones adicionales, detalles, funciones ecológicas, zonas, taxonomía | medium | Probable DUPLICADO de Opuntia ficus-indica (Tuna, id plB49IMLaw1gBhNqGKVy) y de 'Opuntia sp.' (Nopal de tuna). Altura registrada 0.5-1 m corresponde a nopal de verdura podado; heightRangeDescription 'hasta 5 mts'. Estrato '3' (Alto) parece alto para un nopal; revisar. |
| Opuntia ficus-indica (Tuna) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, estrato | high | Se usa en setos de contorno para control de erosión y como cortavientos; forraje importante en el norte de México; nopalitos y tunas comestibles; uso medicinal (glucosa). Flores amarillas muy visitadas por abejas. Se añadió zona Desierto. |
| Opuntia joconostle (Xoconostle) | funciones adicionales, detalles, funciones ecológicas, altura, estrato | medium | Arbusto de 2-3 m del centro de México (tuna agria). Fruto comestible; uso medicinal tradicional (diabetes, colesterol). Flores visitadas por abejas. La función adicional existente '2' (Maderable) parece incorrecta; se dejó por la regla de no borrar, revisar. Algunas listas lo tratan como sinónimo de O. ficus-indica; Villaseñor (2016) lo acepta. |
| Opuntia sp. (Nopal de tuna) | funciones adicionales, funciones ecológicas, zonas | medium | Funciones basadas en el género (nopal tunero, probablemente O. ficus-indica): setos de contorno contra erosión, flores melíferas, alimento, forraje y medicinal. Posible DUPLICADO de Opuntia ficus-indica (Tuna). |
| Origanum spp. (Oregano) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, estrato, taxonomía | medium | Hierba aromática perenne de pleno sol, tolerante a sequía; flores muy visitadas por abejas y mariposas. Culinaria y medicinal. Nota: el 'orégano mexicano' es Lippia graveolens (Verbenaceae), especie distinta; confirmar cuál se pretende. La función adicional existente '2' (Maderable) parece incorrecta; se dejó. |
| Oryza sativa (Arroz) | funciones adicionales, detalles, zonas, altura, taxonomía | high | Cereal anual de ~1-1.5 m, requiere mucha agua y sol, sin tolerancia a heladas. Grano alimento; paja usada como forraje y cama. Estrato '3' existente parece alto para un cereal de 1-1.5 m (se dejó; en consorcio de placenta podría ser relativo). |
| Otatea acuminata (Bambu otatea) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | high | Bambú nativo de México (culmos 2-10 m, POWO). Material de construcción tradicional (bajareque), cestería y bastones. Bambú amacollado que produce biomasa y sus rizomas sujetan el suelo. isFrostResistant=false con confianza media (tolera heladas ligeras según viveros; revisar). |
| Pachyrhizus erosus (Jícama) | funciones adicionales, detalles, funciones ecológicas, estrato, taxonomía | high | Leguminosa trepadora (hasta 10 m de guía), cultivada como anual (5-9 meses) por su raíz tuberosa comestible. Fija nitrógeno (163-216 kg N/ha en ensayos). Semillas y follaje tóxicos (rotenona). edibleUses.fruit existente es impreciso: lo comestible es la raíz. |
| Passiflora edulis (Maracuya amarillo, pasionaria, passionfruit) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura | high | Altura corregida a longitud de guía realista. Polinizada principalmente por abejorros carpinteros (Xylocopa). Fruto comestible; hojas/flores usadas como sedante en medicina tradicional. Ojo: isFrostResistant=true existente es dudoso, la forma amarilla es sensible a heladas (no se cambió sin fuente específica). Ciclo de vida: comercialmente productiva 3-5 años; se asignó Secundarias 1 / Hasta 15 años, coherente con P. ligularis. |
| Passiflora ligularis (Granadilla) | funciones adicionales, nombres comunes, detalles, funciones ecológicas | high | Pasiflora andina de altura (1500-2600 msnm, 15-23 °C), coherente con Bosque de niebla; daños por granizo y sequía; sin tolerancia documentada a heladas. Flores polinizadas por abejas grandes. Fruto comestible. No se encontró dato confiable de altura/longitud de guía. 'Granadita de China' es nombre usado en México (Veracruz/Puebla). |
| Passiflora quadrangularis (Maracuya flor vino) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, altura | high | Trepadora semileñosa vigorosa de 10-15 m, de trópico cálido-húmedo; se añadió zona Selva húmeda. La zona existente '4' (Pino-encino) es poco probable para esta especie de tierras bajas; revisar. Fruto comestible; flores grandes polinizadas por abejorros carpinteros. |
| Passiflora tripartita (Curuba) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | medium | Identificada por nombre común 'curuba' (Andes, Panamá a Perú); también existe P. tarminiana llamada curuba, por eso confianza media. Flor tubular larga polinizada por colibríes (Ensifera). Fruto comestible. Se conservó la función existente '1'. |
| Paullinia cupana (Guarana) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, zonas, altura | medium | Liana amazónica que en cultivo se maneja como arbusto extendido de ~2 m con copa del doble de ancho (Erickson et al. 1984). Semilla estimulante (bebidas) y medicinal. Flores visitadas por abejas meliponinas. El estrato existente '3' (Alto) parece alto para el cultivo podado; revisar (en estado silvestre trepa al dosel). |
| Paulownia tomentosa (Paulonia) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato, taxonomía | high | Árbol caducifolio de crecimiento muy rápido, 10-15 (20) m, copa semiabierta ~9-12 m. Melífero; hojas usadas como forraje para cabras; madera ligera valiosa. Tolera heladas (yemas pueden dañarse en inviernos duros). Advertencia: invasora en climas cálidos (IFAS). |
| Persea americana (Aguacate, palta, avocado) | funciones adicionales, funciones ecológicas, taxonomía | high | Fruto alimento; hojas de aguacate criollo usadas en medicina tradicional mexicana. Flores muy visitadas por abejas (miel de aguacate; polinización por abejas en huertos de Michoacán). Resto de datos completos. |
| Persea schiedeana (Anayo, aguacate criollo) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, taxonomía | high | DUPLICADO de Persea schiedeana 'Chinene' (id f2Ln2vUvmdBpnn0dZhpj); conviene fusionarlos. Nativa del sur de México a Panamá, bosques húmedos cálidos 0-2000 msnm (Los Tuxtlas, Chinantla): se añadió Selva húmeda. Usada como sombra de café y control de erosión (Pronatura). Altura registrada 8 m; en hábitat 15-20 m (no se cambió). |
| Persea schiedeana (Chinene) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, zonas, estrato, taxonomía | high | DUPLICADO de Persea schiedeana 'Anayo, aguacate criollo' (id OubbfQc8omznQ8xEo7Qu). Árbol de 15-20 m en hábitat (registrado 8-10 m). Sombra de café, control de erosión, fruto oleaginoso comestible. |
| Phaseolus coccineus (Frijol ayocote, gordo o botil) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | high | Enredadera perenne de raíz tuberosa, cultivada como anual en zonas altas (>1800 msnm). Leguminosa fijadora de N; flores rojas visitadas por abejorros y colibríes. La parte aérea no tolera heladas pero la raíz rebrota. Zona Selva húmeda existente es poco típica (especie de tierras altas templadas). |
| Phaseolus ssp (Frijol de mata) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Phaseolus ssp (Frijol trepador) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Plinia cauliflora (Jaboticaba, Guapuru, jaboticaba da mata atlántica) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | high | Nombre actualizado a Plinia cauliflora (Myrciaria cauliflora como sinónimo). Flores melíferas visitadas por abejas; fruto comestible y cáscara usada como astringente en medicina tradicional brasileña. Ojo: altura registrada 3.5 m pero heightRangeDescription dice 'de 5 a 10 mts'; en cultivo 3-5 m (Florida), hasta 9-15 m en hábitat. No se cambió altura. |
| Pouteria sapota (Zapote mamey) | funciones adicionales, nombres comunes, detalles, altura, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Prunus armeniaca (Chabacano) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, estrato | medium | Árbol pequeño de 4-8 m de alto y ancho (RHS); fruto comestible, flores polinizadas por abejas. Estrato Medio, coherente con Prunus domestica y P. persica del catálogo. Nota: 'heightRangeDescription' dice 'hasta 5 mts' (válido para árboles podados en huerto), no se cambió. |
| Prunus avium (Cereza (las verdaderas cerezas)) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato | medium | Árbol de 10-25 m (Ecocrop), copa 5-9 m; cultivares injertados en huerto son mucho más pequeños. Fruto comestible, madera valiosa para ebanistería, flores visitadas por abejas (RHS Plants for Pollinators). Requiere frío invernal; en México solo en zonas templadas altas. |
| Prunus cerasus (Cereza, guinda (más acido)) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, estrato | medium | Árbol pequeño o arbusto de 3-8 m, rebrota formando matorrales. Fruto ácido comestible, flores melíferas. Muy resistente al frío. |
| Prunus domestica (Ciruela roja) | funciones adicionales, funciones ecológicas | medium | Datos de tamaño existentes coherentes (RHS 2.5-4 m; 4-5 m en otras fuentes). Se agregó Alimento (fruto) y atracción de polinizadores (flores entomófilas melíferas). La función 'Forraje' existente parece dudosa, se mantuvo. |
| Prunus dulcis (Almendro) | funciones adicionales, detalles, funciones ecológicas, estrato | high | Árbol de 5-8 m (AUB); más tolerante a sequía que otros frutales (USU). Polinización dependiente de abejas. Semilla (almendra) comestible. |
| Prunus persica (Durazno enano, melocoton) | funciones adicionales, nombres comunes, detalles, funciones ecológicas | medium | Árbol de vida corta (10-20 años en huerto); flores visitadas por abejas; fruto comestible. Datos de tamaño existentes coherentes con árboles podados (3-4 m). |
| Prunus serotina (Capulin) | funciones adicionales, nombres comunes, funciones ecológicas, estrato, taxonomía | high | Nombre aceptado: Prunus serotina var. salicifolia (capulín). Fruto comestible, madera usada en carpintería, hojas de uso medicinal tradicional (tos), flores melíferas. Datos de tamaño existentes se mantuvieron. |
| Psidium cattleyanum (Guayaba fresa, guayabita del Perú, araca) | funciones adicionales, detalles, funciones ecológicas | medium | Árbol pequeño, normalmente 2-4 m (máx. ~13 m); tolera heladas ligeras (~-5 °C). Fruto comestible. Ciclo sucesional igual que P. guajava en el catálogo. Advertencia: especie muy invasora fuera de su área nativa (Brasil). |
| Psidium guajava (Guayaba, guava) | funciones adicionales, funciones ecológicas | medium | ICRAF: árbol de 3-10 m; usos: fruto, leña, postes y mangos de herramientas, medicina (corteza, hojas, raíz), conservación de suelos y cerca viva. Flores visitadas por abejas. Datos existentes coherentes. |
| Psophocarpus tetragonolobus (Frijol alado) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, taxonomía | high | Leguminosa trepadora fijadora de N (3-4 m), cultivada como anual; todas sus partes comestibles. DUPLICADO del registro rgGlvchtd2EEij8zhDNt ('Ejote alado'); se sugiere fusionar. Ciclo de vida tomado del duplicado para mantener coherencia. |
| Punica granatum (Granada, pomegranate) | funciones adicionales, detalles | high | Arbusto o árbol pequeño de 5-10 m (ICRAF), tolera sequía y heladas hasta ~-11 °C. Fruto comestible; corteza de raíz usada tradicionalmente como antihelmíntico (con toxicidad). Nota: el estrato existente 'Alto' parece elevado para su tamaño (Medio sería más coherente), no se cambió sin más evidencia. |
| Pyrus communis (Perón) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, estrato | medium | Árbol de hasta 12-15 m (menor si injertado), muy longevo (>100 años). Flores polinizadas por abejas. Nota: en México 'perón' suele referirse a una variedad de manzana (Malus domestica); verificar el nombre común. |
| Quercus ilex (Encino bellota dulce) | funciones adicionales, nombres comunes, ancho de copa, detalles, altura, estrato | medium | Encina mediterránea, 12-21 m de alto y 10-15 m de copa en cultivo; tolera sequía una vez establecida. Bellotas comestibles (harina) y forraje para ganado (dehesa); madera dura. La bellota dulce corresponde a la subsp. ballota (Q. rotundifolia), podría precisarse la subespecie. |
| Quercus insignis (Encino Chicalahuatl) | funciones adicionales, detalles, altura, estrato | high | Encino de bosque mesófilo (1500-2500 m), 15-30 m, con las bellotas más grandes del mundo. En peligro (UICN) por tala para madera y café. Se corrigió la altura. |
| Rheum rhabarbarum (Ruibarbo) | funciones adicionales, detalles, estrato, taxonomía | medium | Herbácea perenne (Polygonaceae) de 0.6-1.5 m, muy resistente al frío. Pecíolos comestibles; hojas tóxicas. Plantas productivas durante ~10-15 años. |
| Rhus standleyi (Vara negra) | zonas | low | Especie aceptada (POWO), endémica de México. Hábitat: laderas secas y rocosas, borde del desierto chihuahuense, matorrales y bosques de encino (1100-1870 m); por ello se añadió la zona 4. No se encontraron datos fiables de altura, usos ni del nombre 'vara negra'; resto sin cambios. |
| Ribes hirtellum (Uva espina, goseberry) | funciones adicionales, ancho de copa, detalles, altura | medium | Arbusto espinoso de 0.3-1.2 m, muy resistente al frío, vive ~15 años. Fruto comestible. El estrato existente 'Medio' parece alto para su tamaño (Bajo sería más coherente); no se cambió. |
| Ribes rubrum (Grosella espinoza europea, groselha) | funciones adicionales, nombres comunes, ancho de copa, detalles, altura | medium | Arbusto de 1-2 m. OJO: el nombre común existente 'grosella espinosa europea' corresponde a Ribes uva-crispa, no a R. rubrum (grosella roja); se añadió 'Grosella roja'. Revisar si el registro pretendía ser R. uva-crispa. |
| Ricinus communis (Higuerilla) | funciones adicionales, funciones ecológicas, zonas | medium | Arbusto de 1-5 m de crecimiento rápido; ICRAF lo cita para conservación de suelos, estabilización de riberas, barbecho y abono orgánico. Uso medicinal tradicional en México (raíz, hojas, aceite). Semillas muy tóxicas; exótica invasora. Se eliminó zona '6' duplicada. El 'edibleUses.fruit' existente es incorrecto (semilla tóxica) aunque no es campo de este trabajo. |
| Robinia pseudoacacia (Black locust) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, estrato | high | Leguminosa fijadora de N, usada para control de erosión, flores muy melíferas; madera muy durable (postes). Partes tóxicas (corteza) para humanos y ganado; invasora en muchas regiones. No es nativa de México. |
| Rosmarinus sp. (Romero rastrero) | taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Salvia hispanica (Chia) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, zonas, altura, taxonomía | high | Hierba anual de día corto, 1–2 m; nativa de zonas templadas/montaña del occidente y centro de México (bosque de pino-encino), sensible a heladas. Flores visitadas por abejas (polinizadores documentados). |
| Spondias purpurea (Ciruela tropical, Jocote) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, estrato | medium | Árbol caducifolio de 3–12 m, tolerante a sequía, muy usado como cerco vivo (se propaga por estacas grandes, tolera poda → biomasa). Usos: fruto comestible, forraje y medicinal (POWO). Estrato corregido de Emergente a Medio/Alto. También crece en selva baja caducifolia (zona sin id). |
| Stenocereus queretaroensis (Pitaya, pitaia) | funciones adicionales, detalles, funciones ecológicas, altura | medium | Cactácea columnar arborescente de 5–7 m, endémica del occidente de México (Jalisco, Michoacán, Querétaro); se cultiva por su fruto (pitaya). Flores nocturnas polinizadas por murciélagos y visitadas por abejas. Hábitat: selva baja caducifolia/semiárido (zonas sin id), por eso no se asignó zona ecológica. |
| Sterculia apetala (Palo boya, chichá) | funciones adicionales, detalles, zonas, altura, taxonomía | medium | Árbol de 20–40 m con contrafuertes, nativo de selvas de Veracruz, Tabasco y Chiapas. Semillas consumidas tostadas/hervidas y como alimento animal en el sureste de México (contienen ácidos ciclopropenoides, consumo moderado). POWO reporta usos medicinales. No se agregó 'castaño' como nombre común por falta de fuente sólida. |
| Swietenia macrophylla (Caoba, Mara) | funciones adicionales, detalles, altura | high | Árbol maderable de 30–40 m (hasta 60 m) nativo de la selva húmeda del sureste de México; madera preciosa; semillas y corteza con usos medicinales tradicionales. Heliófita, no tolera heladas. Nota: details.edibleUses.fruit=true existente parece erróneo (fruto no comestible), revisar. |
| Syagrus romanzoffiana (Palmera pindo, coquito, yeriva, guriroba, jerivá) | funciones adicionales, ancho de copa, detalles, altura | medium | Palma de 10–15 m con copa de 6–7.5 m, nativa del sur de Brasil/Argentina; fruto y palmito comestibles, hojas y frutos como forraje. Tolera heladas ligeras (aprox. -5 °C). Muy cultivada como ornamental en México. |
| Symphytum officinale (Consuelda) | funciones adicionales, nombres comunes, funciones ecológicas, altura, estrato, taxonomía | high | Hierba perenne de 0.6–1.2 m; acumuladora dinámica clásica (raíz profunda, K/Ca; nota: el respaldo científico es debatido), produce mucha biomasa con cortes repetidos, muy visitada por abejas y abejorros. Forraje y uso medicinal tradicional (uso interno no recomendado por alcaloides pirrolizidínicos). |
| Syzygium cumini (Jambolan, Aceituna tropical) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, taxonomía | high | Árbol perenne de 6-15 m (hasta 30 m), fruto comestible, madera y uso medicinal (semilla antidiabética tradicional); atrae abejas. Es invasora en varias islas tropicales. DUPLICADO del registro Syzygium cumini (jNI1faZFQcn4kT2VyYMb); se sugiere fusionar. |
| Syzygium jambos (Pomarrosa, jambo amarelo) | funciones adicionales, detalles, funciones ecológicas, zonas, altura | medium | Árbol de 7.5–12 m con copa densa a menudo más ancha que alta; fruto comestible, uso medicinal tradicional, madera para leña/construcción. Flores muy visitadas por polinizadores. Especie invasora en zonas húmedas (precaución). |
| Syzygium malaccense (Pomarosa, Manzana brasilera) | funciones adicionales, nombres comunes, detalles, altura, taxonomía | — | Sólo por fusión de duplicados o etiqueta de variedad. |
| Tagetes lucida (Pericon) | funciones adicionales, nombres comunes, detalles, altura, estrato | high | Hierba perenne aromática de 30–95 cm, nativa de México a Honduras. Condimento y té; uso medicinal (digestivo, cólicos). DUPLICADO del registro 'Tarete' (m3Cwv7S4RmA23jky27sI); se sugiere fusionar. |
| Tagetes nelsonii (Chilchahua) | funciones adicionales, detalles, altura, estrato | medium | Hierba aromática/subarbusto de 0.5–2 m, nativa de Chiapas a Guatemala. Hojas y flores comestibles (condimento de aroma cítrico) y uso medicinal en Chiapas. Zona ecológica no asignada por falta de dato claro (probablemente bosque de pino-encino de Chiapas). |
| Talisia esculenta (Pitomba, piton) | funciones adicionales, detalles, altura | medium | Árbol frutal sudamericano de 6–12 m (hasta 20 m silvestre); fruto comestible. Poco cultivado en México, por eso no se asignó zona. |
| Tamarindus indica (Tamarindo) | funciones adicionales, detalles, funciones ecológicas, altura | high | Árbol longevo de 12–20 m (hasta 30 m), muy resistente a sequía. Fruto comestible, hojas y frutos forrajeros, madera dura, usos medicinales; flora apícola. No fija nitrógeno (Detarioideae sin nodulación), por eso no se asignó función 1. También en selva baja caducifolia (sin id). |
| Taraxacum officinale (Diente de leon) | funciones adicionales, nombres comunes, ancho de copa, detalles, funciones ecológicas, altura, estrato | medium | Hierba perenne en roseta de 5–40 cm; raíz pivotante profunda (≥1 m) que rompe suelos compactados (acumuladora en permacultura); néctar y polen tempranos para abejas. Hojas, flores y raíz comestibles y medicinales. Copa (roseta) estimada 15–30 cm, confianza baja en ese dato. Nota: edibleUses.fruit existente no aplica (se comen hojas/flores). |
| Tectona grandis (Teca) | funciones adicionales, detalles, altura, taxonomía | high | Árbol maderable caducifolio de 25–40 m, muy demandante de luz (75–100% sol), no tolera heladas. Introducido; plantado en el trópico húmedo de México. Nota: details.edibleUses.fruit=true existente parece erróneo (fruto no comestible). |
| Tephrosia vogelii (Teprosia) | detalles, funciones ecológicas, estrato, taxonomía | high | Leguminosa arbustiva fijadora de N, de crecimiento rápido y tolerante a poda: abono verde, barbechos mejorados y setos en curvas de nivel (en Guatemala con café). Hojas tóxicas (piscicida/insecticida), no es forraje. Ciclo corto como Cajanus cajan en el dataset. |
| Tetragonia tetragonioides (Espinaca N.Z.) | funciones adicionales, nombres comunes, ancho de copa, detalles, estrato, taxonomía | medium | Hierba rastrera suculenta, perenne de vida corta cultivada como anual; extiende 0.6–1 m. Hojas comestibles (cocidas). Tolerante al calor. |
| Theobroma bicolor (Pataxte, pataste) | funciones adicionales, detalles, zonas, altura | medium | Árbol de 3–8 m en cultivo (hasta 12 m; 25–30 m en sotobosque). Cultivado intercalado con otros cultivos en Chiapas y Oaxaca; semillas y pulpa comestibles (bebidas como el tejate). Se conserva el valor existente 'Maderable' en additionalFunctionIds aunque no es su uso principal. |
| Theobroma cacao (Cacao, arbol de cacao, cacao) | funciones adicionales, detalles, altura, taxonomía | high | Árbol de sotobosque tolerante a sombra, 3–8 m en cultivo (hasta 12 m), se cultiva en sistemas agroforestales del trópico húmedo (Tabasco, Chiapas). Semillas alimenticias y usos medicinales tradicionales. Polinizado por mosquitas (Forcipomyia). |
| Theobroma grandiflorum (Copoazu, Cacao blanco, Cupuazú, cupuacu) | funciones adicionales, nombres comunes, detalles, altura | high | Árbol de 15–20 m silvestre, <8 m en cultivo, de selva amazónica primaria; pulpa y semillas comestibles (se conserva 'Forraje' existente). Plántulas crecen mejor con 50% de sombra. lifeCycle tomado del registro duplicado XKvOxf8kSGg7r1sG0Z84 para consistencia. |
| Thymus vulgaris (Tomillo) | funciones adicionales, ancho de copa, detalles, funciones ecológicas, altura, estrato, taxonomía | high | Subarbusto aromático mediterráneo de 15–40 cm, tolerante a sequía, muy melífero. Condimento y medicinal (antiséptico, respiratorio). |
| Tilia sp. (Tilo) | funciones adicionales, detalles, funciones ecológicas, altura, estrato | low | Asumiendo el tilo nativo (Tilia mexicana, en peligro, NOM-059): árbol de dosel del bosque mesófilo de hasta 35 m; flores e inflorescencias medicinales (sedante), madera usada; Tilia es melífera. Confianza baja porque la especie no está identificada; crownWidth 0.3 m es claramente erróneo pero no se encontró dato fiable para reemplazarlo. Verificar si en realidad se refiere a otra planta. |
| Tithonia diversifolia (Giganton) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, estrato | high | Arbusto de rápido crecimiento: abono verde (hojas ~3.5% N, 0.4% P, 3.5% K, acumuladora de P y K), corte cada ~4 meses, forraje proteico para rumiantes, flores melíferas. Puede ser invasora. lifeCycle 'Pioneras' (estimado, confianza media). |
| Toona ciliata (Toona, Cedro Australiano, cedro australiano) | funciones adicionales, detalles, altura, taxonomía | high | Árbol caducifolio de rápido crecimiento, 20–30 m (excepcionalmente 50–60 m), copa amplia; madera de alta calidad (330–600 kg/m³). Introducido en plantaciones en México; zona ecológica no asignada por falta de dato específico. |
| Trema micranthum (Ixpepe) | nombres comunes, detalles, funciones ecológicas, zonas, altura, taxonomía | medium | Árbol pionero de crecimiento muy rápido (hasta 14 m en 2 años; 10–20 m), de vida corta, usado en restauración; flores visitadas por abejas, frutos atraen aves. Corteza usada por otomíes para papel amate (sin categoría de uso). Se agregó selva húmeda por su amplia distribución en el trópico mexicano. Nota: el estrato Emergente existente se mantuvo (como pionera puede dominar temporalmente), revisar si se prefiere Alto. |
| Trichanthera gigantea (Nacedero) | funciones adicionales, detalles, funciones ecológicas, altura, taxonomía | high | Arbusto forrajero multipropósito (12–22% proteína en MS) para cerdos, conejos y rumiantes en corte y acarreo; rebrota tras cortes frecuentes (biomasa). Tradicionalmente plantado para proteger nacimientos de agua y cauces (control de erosión). Sensible al frío. Nota: details.edibleUses.rootsAndTubers existente parece erróneo. |
| Vachellia farnesiana (Huizache) | funciones adicionales, nombres comunes, detalles, funciones ecológicas, altura, estrato, taxonomía | high | Arbusto o árbol bajo de 2–5 m, hasta 10 m; fijador de N, coloniza suelos degradados y previene erosión (pionera); uso forrajero, leña y medicinal; flores muy perfumadas, visitadas por abejas (melífera conocida en México, confianza media en este punto). También es abundante en selva baja/matorral (zona sin id). |

## Correcciones de datos existentes (valor anterior → nuevo)

| Especie | Campo | Antes | Después | Motivo | Fuente |
| --- | --- | --- | --- | --- | --- |
| Acacia melanoxylon (Acacia negra) | details.heightRangeDescription | "de 5 a 10 mts" | "más de 10 mts" | Árbol de 6–45 m (habitualmente 15–30 m) | [enlace](https://apps.worldagroforestry.org/treedb2/AFTPDFS/Acacia_melanoxylon.PDF) |
| Acaciella angustissima (Timbre) | taxonomy.genus | "Acacia" | "Acaciella" | Nombre aceptado en POWO: Acaciella angustissima (Mill.) Britton & Rose; Acacia angustissima es sinónimo | [enlace](https://powo.science.kew.org/results?q=Acaciella%20angustissima) |
| Acaciella angustissima (Timbre) | ecologicalZoneIds | ["1", "3", "4", "6", "6"] | ["1", "3", "4", "6"] | Id '6' duplicado | - |
| Acanthocereus tetragonus (Cruceta) | details.heightRangeDescription | "hasta 2 mts" | "hasta 5 mts" | Cactus columnar/arqueado de 2–7 m | [enlace](https://en.wikipedia.org/wiki/Acanthocereus_tetragonus) |
| Acca sellowiana (Feijoa) | taxonomy.genus | "Feijoa" | "Acca" | Feijoa sellowiana es sinónimo de Acca sellowiana (nombre aceptado) | [enlace](https://worldplants.ca/display0.php?id=2717) |
| Achillea millefolium (Milenrama) | height | {"min": 0.7, "max": 0.7} | {"min": 0.5, "max": 1} | Rango típico 0.5–1 m (RHS) en lugar de valor único | [enlace](https://www.rhs.org.uk/plants/311/achillea-millefolium/details) |
| Agave americana (Maguey) | taxonomy.family | "Agavaceae" | "Asparagaceae" | En APG IV Agavaceae se incluye en Asparagaceae (subfam. Agavoideae) | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:5973-1) |
| Agave americana (Maguey) | ecologicalZoneIds | ["6", "6"] | ["4", "6"] | Id duplicado; se agrega 4: especie común en el altiplano/bosques de pino-encino | [enlace](https://ucanr.edu/sites/scmg/Plant_of_the_Month/Agave/) |
| Agave mapisaga (Maguey) | taxonomy.family | "Agavaceae" | "Asparagaceae" | APG IV | [enlace](https://powo.science.kew.org/) |
| Agave mapisaga (Maguey) | ecologicalZoneIds | ["6", "6"] | ["4", "6"] | Id duplicado; se cultiva en el altiplano central (Valle de México, Hidalgo, SLP) | [enlace](https://www.botanicalsciences.com.mx/index.php/botanicalSciences/article/view/1350) |
| Agave salmiana (Maguey) | taxonomy.family | "Agavaceae" | "Asparagaceae" | APG IV | [enlace](https://powo.science.kew.org/) |
| Agave salmiana (Maguey) | ecologicalZoneIds | ["6", "6"] | ["4", "6"] | Id duplicado; crece en el altiplano potosino-zacatecano y centro de México 1800–2400 m | [enlace](https://www.botanicalsciences.com.mx/index.php/botanicalSciences/article/view/1350) |
| Agave sp (Maguey) | taxonomy.family | "Agavaceae" | "Asparagaceae" | APG IV | [enlace](https://powo.science.kew.org/) |
| Agave sp. (Agave) | taxonomy.family | "Agavaceae" | "Asparagaceae" | APG IV | [enlace](https://powo.science.kew.org/) |
| Alibertia patinoi (Borojo) | taxonomy.genus | "Borojoa" | "Alibertia" | Borojoa patinoi es sinónimo; nombre aceptado Alibertia patinoi (Cuatrec.) Delprete & C.H.Perss. (POWO) | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77116169-1) |
| Amaranthus hypochondriacus (Amaranto) | taxonomy | "(vacío)" | "Amaranthus hypochondriacus" | Taxonomía vacía; el amaranto de grano de las zonas productoras de México (Puebla, Tlaxcala, CDMX) es principalmente A. hypochondriacus (también se cultiva A. cruentus) | [enlace](https://www.ecured.cu/Amaranthus_hypochondriacus) |
| Annona mucosa (Biriba, biriba) | taxonomy.genus | "Rollinia" | "Annona" | Rollinia se fusionó en Annona; POWO acepta Annona mucosa Jacq. | [enlace](https://ask.ifas.ufl.edu/publication/HS1523) |
| Attalea speciosa (Coco de macaco, coco de palmera, babucu) | taxonomy.family | "Aracaceae" | "Arecaceae" | error ortográfico en el nombre de la familia | [enlace](https://en.wikipedia.org/wiki/Babassu) |
| Azadirachta indica (Neem) | details.heightRangeDescription | "de 5 a 10 mts" | "más de 10 mts" | altura típica madura 15 m (hasta 30 m) según ICRAF | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Azadirachta_indica.PDF) |
| Bactris gasipaes (Pejibaye, chontaduro, pupuña, pipire, pijuayo, pixbae, chontaduro, cachipay, pifá, piba, chima, tembe, pupunha) | details.isFrostResistant | true | false | palma tropical sensible a heladas (zona 10) | [enlace](https://ask.ifas.ufl.edu/publication/HS312) |
| Bambusa oldhamii (Bambu oldhami) | taxonomy.species | "oldhami" | "oldhamii" | grafía aceptada (POWO) | [enlace](https://www.dimensions.com/element/giant-timber-bamboo-group-bambusa-oldhamii) |
| Basella alba (Espinaca de Malabar) | taxonomy.subspecies | "B. rubra" | "" | Basella rubra es sinónimo de B. alba, no subespecie; se movió a sinónimos | [enlace](https://en.wikipedia.org/wiki/Basella_alba) |
| Basella alba (Espinaca de Malabar) | additionalFunctionIds | ["2"] | ["0", "3"] | es una hortaliza de hoja (alimento) con uso medicinal ayurvédico; no es maderable | [enlace](https://ask.ifas.ufl.edu/publication/HS1371) |
| Bixa orellana (Achiote, urucu) | taxonomy.genus | "Bixia" | "Bixa" | error ortográfico | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Bixa_orellana.pdf) |
| Bixa orellana (Achiote, urucu) | details.isFrostResistant | true | false | requiere clima libre de heladas (zonas 10–12) | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Bixa_orellana.pdf) |
| Borago officinalis (Borraja) | taxonomy.species | "oficinalis" | "officinalis" | error ortográfico | [enlace](https://plants.ces.ncsu.edu/plants/borago-officinalis/common-name/borage/) |
| Bursera simaruba (Palo mulato, chaca) | details.heightRangeDescription | "de 5 a 10 mts" | "más de 10 mts" | altura 18–30 m según ICRAF | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Bursera_simaruba.pdf) |
| Byrsonima crassifolia (Nanche, nancite, murici) | taxonomy.family | "Malpigiáceas" | "Malpighiaceae" | nombre de familia en forma latina APG IV | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Byrsonima_crassifolia.pdf) |
| Cajanus cajan (Chicharo de arbol, gandul) | taxonomy.family | "fabaceae" | "Fabaceae" | capitalización | [enlace](https://www.feedipedia.org/Node/329) |
| Cajanus cajan (Chicharo de arbol, gandul) | details.humidityPreference | "H" | "L" | especie tolerante a sequía; produce forraje verde al final de la época seca | [enlace](https://www.feedipedia.org/Node/329) |
| Calendula officinalis (Calendula) | taxonomy.species | "Persea" | "officinalis" | epíteto erróneo (Persea es un género); la caléndula es Calendula officinalis | [enlace](https://temperate.theferns.info/plant/Calendula+officinalis) |
| Campomanesia xanthocarpa (guabioroba) | taxonomy | "- -" | "Campomanesia xanthocarpa" | Taxonomía faltante; 'guabiroba/guabiroba' es el nombre común brasileño de Campomanesia xanthocarpa (el registro forma parte del grupo de especies brasileñas del catálogo) | [enlace](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140787/1/Especies-Arboreas-Brasileiras-vol-2-Guaviroveira.pdf) |
| Canavalia ensiformis (Canavalia) | details.humidityPreference | "H" | "L" | sistema radicular profundo; una de las coberturas/abonos verdes más resistentes a sequía | [enlace](https://www.echocommunity.org/resources/5c18a2a7-fb50-4d68-9e72-85a2175fc278) |
| Canna indica (Achira) | taxonomy.species | "edulis" | "indica" | Canna edulis se trata como sinónimo de Canna indica (forma cultivada para rizoma) | [enlace](https://temperate.theferns.info/plant/Canna+edulis) |
| Canna indica (Achira) | stratumIds | ["3"] | ["1"] | hierba de 0.4–2.5 m; estrato Alto es imposible | [enlace](https://cipotato.org/wp-content/uploads/2014/06/11_El_cultivo_achira_alternat_produc.pdf) |
| Canna indica (Achira) | details.shape | "arbusto" | "hierba" | planta herbácea rizomatosa | [enlace](https://cipotato.org/wp-content/uploads/2014/06/11_El_cultivo_achira_alternat_produc.pdf) |
| Capsicum chinense (Chile habanero) | taxonomy | "(vacío)" | "Capsicum chinense" | Taxonomía vacía; 'chile habanero' corresponde inequívocamente a Capsicum chinense | [enlace](https://www.cicy.mx/Documentos/CICY/Sitios/Biodiversidad/pdfs/Cap7/04%20Chiles%20cultivados.pdf) |
| Cenchrus purpureus (Pasto elefate) | taxonomy.genus | "Panicum" | "Cenchrus" | El pasto elefante es Pennisetum purpureum, hoy Cenchrus purpureus (Morrone); no es un Panicum | [enlace](https://www.feedipedia.org/Node/395) |
| Cenchrus purpureus (Pasto elefate) | taxonomy.species | "Purpureum" | "purpureus" | Concordancia del epíteto con Cenchrus y minúscula | [enlace](https://www.feedipedia.org/Node/395) |
| Cenostigma pluviosum (Momoqui) | taxonomy.genus/species | "Caesalpinia pluviosa" | "Cenostigma pluviosum" | nombre aceptado según Gagnon et al. 2016 (PhytoKeys 71) | [enlace](https://sweetgum.nybg.org/science/vh/specimen-details/?irn=118644) |
| Cenostigma pluviosum (Momoqui) | taxonomy.family | "Caesalpinioideae (Leg.)" | "Fabaceae" | Caesalpinioideae es subfamilia; la familia es Fabaceae | [enlace](https://sweetgum.nybg.org/science/vh/specimen-details/?irn=118644) |
| Citrus × floridana (Limon Kumquat Meiva Hibrido, Limequat (x Citrofortunella)) | taxonomy.species | "× Fortunella" | "× floridana" | '× Fortunella' es un nombre de género, no un epíteto; el limequat es Citrus × floridana (sin. × Citrofortunella floridana) | [enlace](https://www.rhs.org.uk/plants/320513/citrus-x-floridana-(f)/details) |
| Citrus × limonia (Limon mandarina, limao cravo) | taxonomy.family | "Rosaceae" | "Rutaceae" | Citrus pertenece a Rutaceae | [enlace](https://www.evergreentrees.com.au/products/citrus-x-limonia-rangpur-lime) |
| Citrus × paradisi (Toronja) | taxonomy.species | "× paradisii" | "× paradisi" | error ortográfico; nombre aceptado Citrus × paradisi Macfad. | [enlace](https://powo.science.kew.org/results?q=Citrus%20paradisi) |
| Clitoria fairchildiana (mexican sombreiro) | taxonomy.species | "sp." | "fairchildiana" | 'sombreiro' es el nombre común brasileño de Clitoria fairchildiana R.A.Howard, árbol leguminoso usado en SAF y sombra | [enlace](https://www.nparks.gov.sg/florafaunaweb/flora/2/8/2814) |
| Coffea arabica (Cafe) | taxonomy.family | "Rubiacea" | "Rubiaceae" | error ortográfico del nombre de familia | [enlace](https://hort.ifas.ufl.edu/database/documents/pdf/shrub_fact_sheets/cofaraa.pdf) |
| Coffea canephora (Cafe) | taxonomy.species | "robusta" | "canephora" | Coffea robusta L.Linden es sinónimo de Coffea canephora Pierre ex A.Froehner (POWO) | [enlace](https://powo.science.kew.org/taxon/747247-1) |
| Colocasia esculenta (Malanga, Taro) | details.isFrostResistant | true | false | RHS la describe como perenne tuberosa 'frost tender' | [enlace](https://www.rhs.org.uk/plants/359375/colocasia-esculenta-hawaiian-punch-royal-hawaiian-series/details) |
| Commelina erecta (Matlali) | taxonomy.species | "elegans" | "erecta" | Commelina elegans Kunth es sinónimo de Commelina erecta L. | [enlace](https://www.nparks.gov.sg/florafaunaweb/flora/9/0/9003) |
| Crataegus mexicana (Tejocote) | taxonomy.species | "mexinaca" | "mexicana" | error ortográfico; nombre aceptado Crataegus mexicana Moc. & Sessé ex DC. (POWO) | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:723791-1) |
| Eucalyptus cinerea (Dolar) | details.heightRangeDescription | "hasta 5 mts" | "más de 10 mts" | La especie alcanza 8-15 m de altura en cultivo | [enlace](https://www.rhs.org.uk/plants/19957/eucalyptus-cinerea/details) |
| Eucalyptus sp. (Eucalipto, eucalyptus) | ecologicalZoneIds | ["1", "4", "6", "6"] | ["1", "4", "6"] | id duplicado | - |
| Eucalyptus sp. (Eucalipto, eucalyptus) | details.lifeCycleDuration | "Mas o menos 70 años" | "Hasta 80 años" | Valor fuera del catálogo; se normaliza al valor equivalente | - |
| Eucalyptus tereticornis (Eucalipto de Mysore) | additionalFunctionIds | ["1"] | ["2", "3"] | No se documenta uso como forraje; sus usos principales son leña, carbón, postes, madera y pulpa, y aceite esencial | [enlace](https://apps.worldagroforestry.org/treedb2/AFTPDFS/Eucalyptus_tereticornis.PDF) |
| Euterpe oleracea (Asai brasilero) | taxonomy.species | "oleraceae" | "oleracea" | error ortográfico del epíteto | [enlace](https://powo.science.kew.org/results?q=Euterpe%20oleracea) |
| Euterpe oleracea (Asai brasilero) | taxonomy.family | "Palmae" | "Arecaceae" | nombre de familia APG IV | [enlace](https://powo.science.kew.org/results?q=Euterpe%20oleracea) |
| Euterpe precatoria (Asai nativo) | taxonomy.family | "Palmae" | "Arecaceae" | nombre de familia APG IV | [enlace](https://colplanta.org/taxon/urn:lsid:ipni.org:names:666949-1/general-information) |
| Eysenhardtia polystachya (Palo dulce) | taxonomy.genus | "Eysenhartdia" | "Eysenhardtia" | error ortográfico | [enlace](https://npn.rngr.net/publications/semillas-de-especies-forestales/monografias/eysenhardtia-polystachya-ort.-sarg.-fabaceae/at_download/file) |
| Eysenhardtia polystachya (Palo dulce) | taxonomy.family | "fabaceae" | "Fabaceae" | mayúscula inicial | - |
| Eysenhardtia polystachya (Palo dulce) | ecologicalZoneIds | ["4", "6", "6"] | ["4", "6"] | id duplicado | - |
| Fagopyrum esculentum (Trigo Sarraceno) | details.lifeCycleDuration | "120 dias" | "Varios meses" | Valor fuera del catálogo; ciclo de ~3-4 meses | [enlace](https://www.sare.org/publications/managing-cover-crops-profitably/nonlegume-cover-crops/buckwheat/) |
| Ficus carica (Higo) | crownWidth | {"min": 10, "max": 10} | {"min": 3, "max": 8} | La higuera común alcanza 3-8 m de alto y de ancho en madurez; 10 m de copa con 4 m de altura es incoherente | [enlace](https://landscapeplants.aub.edu.lb/Plants/GetPDF/421a8f50-461a-46b0-b62f-d30e9e7b72de) |
| Foeniculum vulgare (Hinojo) | additionalFunctionIds | ["2"] | ["0", "3"] | El hinojo es una hierba aromática (alimento y medicinal), no maderable | [enlace](https://www.agroforestry.co.uk/product/foeniculum-vulgare/) |
| Fragaria vesca (Fresa silvestre) | height | {"min": 10, "max": 10} | {"min": 0.07, "max": 0.23} | Altura imposible (10 m); la planta mide 7-23 cm (probablemente se capturó en cm) | [enlace](https://worldplants.ca/display.php?id=3149) |
| Ipomoea batatas (Camote, batata) | stratumIds | ["1"] | ["0"] | Guía rastrera de 0.3-0.4 m que cubre el suelo; el SPEC usa el camote como ejemplo de Rastrero | [enlace](https://plants.ces.ncsu.edu/plants/all/ipomoea-batatas/) |
| Ipomoea batatas (Camote, batata) | details.isFrostResistant | true | false | Susceptible a heladas, se maneja como anual en climas fríos | [enlace](https://plants.ces.ncsu.edu/plants/all/ipomoea-batatas/) |
| Jatropha curcas (Jatropa, piñón) | details.isFrostResistant | true | false | Especie tropical sensible a heladas | [enlace](https://apps.worldagroforestry.org/treedb2/AFTPDFS/Jatropha_curcas.PDF) |
| Lablab purpureus (Dolichos lab-lab) | stratumIds | ["3"] | ["2"] | Enredadera herbácea de 3-6 m de guía; Alto (árboles 8-25 m) no corresponde. Se alinea con 'Frijol trepador' (estrato 2) del dataset | [enlace](https://cms.ctahr.hawaii.edu/soap/Resources/Lablab) |
| Lactuca indica (Lechuga tropical) | stratumIds | ["3"] | ["1"] | Hierba de 1-2 m; estrato Alto (árboles) no corresponde | [enlace](https://uses.plantnet-project.org/en/Lactuca_indica_(PROSEA)) |
| Lactuca sativa (Lechuga) | taxonomy | "(vacío)" | "Lactuca sativa" | Taxonomía vacía; 'lechuga' cultivada corresponde a Lactuca sativa | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:244587-1) |
| Leucaena leucocephala (Guaje) | ecologicalZoneIds | ["1", "3", "6", "6"] | ["1", "3", "6"] | id '6' duplicado | n/a |
| Leucaena pulverulenta (Guaje) | ecologicalZoneIds | ["1", "3", "6", "6"] | ["1", "3", "6"] | id '6' duplicado | n/a |
| Liquidambar styraciflua (Liquidambar) | taxonomy.species | "Styraciflua" | "styraciflua" | El epíteto específico va en minúscula | [enlace](https://powo.science.kew.org//taxon/urn:lsid:ipni.org:names:430718-1) |
| Luffa aegyptiaca (Estropajo) | taxonomy.genus | "Lufa" | "Luffa" | Error ortográfico | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:293060-1) |
| Luffa aegyptiaca (Estropajo) | taxonomy.species | "cylindria" | "aegyptiaca" | Error ortográfico de 'cylindrica'; POWO acepta Luffa aegyptiaca Mill. (L. cylindrica como sinónimo) | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:293060-1) |
| Luma apiculata (Arrayan) | details.heightRangeDescription | "hasta 2 mts" | "de 5 a 10 mts" | Árbol/arbusto grande de 8-12 m en cultivo (10-15 m en su hábitat); solo queda en ~1 m si se congela cada invierno | [enlace](https://www.rhs.org.uk/Plants/19921/Luma-apiculata/Details) |
| Lycium barbarum (Goji berry) | details.lightPreference | "L" | "H" | Requiere pleno sol para buena cosecha (tolera sombra ligera) | [enlace](https://www.rhs.org.uk/fruit/goji-berries/grow-your-own) |
| Macadamia integrifolia (Macadamia) | additionalFunctionIds | ["1"] | ["0"] | La macadamia se cultiva por su nuez comestible (alimento), no como forraje | [enlace](https://apps.worldagroforestry.org/treedb2/AFTPDFS/Macadamia_integrifolia.PDF) |
| Musa acuminata (Platano morado) | taxonomy | "- -" | "Musa acuminata cv. Morado" | Taxonomía faltante; 'plátano morado' es una de las variedades de plátano cultivadas en México (banano rojo, grupo AAA) | [enlace](https://academiaculinaria.org/index.php/gastronomia-cocina/article/download/40/68/315) |
| Myroxylon balsamum (Arbol del bálsamo, Quina quina) | taxonomy.family | "Papilionaceae (Leg.)" | "Fabaceae" | Nombre de familia APG IV | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:166483-2/general-information) |
| Myrtillocactus geometrizans (Garambuyo) | details.heightRangeDescription | "de 5 a 10 mts" | "hasta 5 mts" | Cactácea columnar ramificada de 2-4.5 m (hasta ~7 m excepcionalmente) | [enlace](https://www.redalyc.org/pdf/610/61003004.pdf) |
| Neltuma glandulosa (Mezquite) | taxonomy.genus | "Prosopis" | "Neltuma" | Las especies americanas de Prosopis se transfirieron a Neltuma (Hughes et al. 2022); POWO acepta Neltuma glandulosa | [enlace](https://powo.science.kew.org/) |
| Neltuma juliflora (Mezquite) | taxonomy.genus | "Prosopis" | "Neltuma" | Las especies americanas de Prosopis se transfirieron a Neltuma (Hughes et al. 2022); POWO acepta Neltuma juliflora | [enlace](https://powo.science.kew.org/) |
| Neltuma laevigata (Mezquite) | taxonomy.genus | "Prosopis" | "Neltuma" | POWO trata Prosopis laevigata como sinónimo de Neltuma laevigata | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:168105-2) |
| Oenocarpus bataua (Majo) | taxonomy.family | "Palmae" | "Arecaceae" | Nombre de familia APG IV (Palmae es nombre alternativo) | [enlace](https://colplanta.org/taxon/urn:lsid:ipni.org:names:668510-1/general-information) |
| Oenothera macrocarpa (Onagra) | taxonomy.species | "missouriensis" | "macrocarpa" | O. missouriensis es sinónimo de Oenothera macrocarpa | [enlace](https://mdc.mo.gov/discover-nature/field-guide/missouri-evening-primrose) |
| Oenothera macrocarpa (Onagra) | height | {"min": 0.7, "max": 0.7} | {"min": 0.15, "max": 0.45} | Herbácea perenne baja de tallos rastreros, 15-45 cm | [enlace](https://www.rhs.org.uk/plants/70730/wd/details) |
| Oenothera macrocarpa (Onagra) | details.shape | "arbusto" | "hierba" | Es una herbácea perenne, no un arbusto | [enlace](https://www.rhs.org.uk/plants/70730/wd/details) |
| Olea europaea (Olivo, olivera, aceituno, oliveira) | taxonomy.species | "europeaea" | "europaea" | Error ortográfico | [enlace](https://cvb.ehu.es/documents/1686888/3913390/57.+Olea+europaea.pdf) |
| Olea europaea (Olivo, olivera, aceituno, oliveira) | taxonomy.family | "Olaceae" | "Oleaceae" | Error ortográfico | [enlace](https://cvb.ehu.es/documents/1686888/3913390/57.+Olea+europaea.pdf) |
| Opuntia cochenillifera (Nopal) | taxonomy.species | "cochinea" | "cochenillifera" | 'cochinea' no es un epíteto válido; corresponde a Opuntia cochenillifera (nopal de la cochinilla), nombre aceptado en POWO | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1008816-2) |
| Opuntia cochenillifera (Nopal) | ecologicalZoneIds | ["6", "6"] | ["6"] | Id duplicado | - |
| Opuntia ficus-indica (Nopal) | taxonomy.species | "indica" | "ficus-indica" | 'Opuntia indica' no es un nombre aceptado; el nopal cultivado es Opuntia ficus-indica | [enlace](https://apps.lucidcentral.org/tropical_forages/pdf/opuntia_ficusindica.pdf) |
| Opuntia ficus-indica (Nopal) | ecologicalZoneIds | ["6", "6"] | ["6"] | Id duplicado | - |
| Opuntia ficus-indica (Tuna) | details.shape | "cactus" | "arbusto" | 'cactus' no está en el catálogo de formas; cactácea arbustiva de 2-5 m | [enlace](https://apps.lucidcentral.org/tropical_forages/pdf/opuntia_ficusindica.pdf) |
| Opuntia sp. (Nopal de tuna) | ecologicalZoneIds | ["1", "3", "4", "6", "6"] | ["1", "3", "4", "6"] | Id duplicado | - |
| Origanum spp. (Oregano) | taxonomy.genus | "Oreganum" | "Origanum" | Error ortográfico | [enlace](https://www.rhs.org.uk/plants/11923/origanum-vulgare/details) |
| Origanum spp. (Oregano) | details.lightPreference | "L" | "H" | El orégano requiere pleno sol | [enlace](https://plants.ces.ncsu.edu/plants/all/origanum-vulgare/) |
| Oryza sativa (Arroz) | taxonomy.genus | "Oriza" | "Oryza" | Error ortográfico | [enlace](https://www.nparks.gov.sg/florafaunaweb/flora/5/2/5218) |
| Oryza sativa (Arroz) | taxonomy.species | "Sativa" | "sativa" | El epíteto va en minúscula | [enlace](https://www.nparks.gov.sg/florafaunaweb/flora/5/2/5218) |
| Passiflora edulis (Maracuya amarillo, pasionaria, passionfruit) | height | {"min": 50, "max": 80} | {"min": 3, "max": 10} | 50-80 m es irreal (dato de un vendedor de semillas para tallos sin soporte); trepadora de 3-10 m (NParks hasta 15 m) | [enlace](https://www.nparks.gov.sg/florafaunaweb/flora/3/3/3332) |
| Passiflora quadrangularis (Maracuya flor vino) | details.shape | "guia" | "guía" | Ortografía del valor del catálogo | - |
| Passiflora tripartita (Curuba) | taxonomy.species | "sp." | "tripartita" | 'Curuba' corresponde a Passiflora tripartita var. mollissima (sin. P. mollissima), nombre aceptado en POWO | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:282224-2) |
| Paulownia tomentosa (Paulonia) | taxonomy.genus | "Paulonia" | "Paulownia" | Error ortográfico | [enlace](https://edis.ifas.ufl.edu/publication/ST433/pdf) |
| Paulownia tomentosa (Paulonia) | taxonomy.species | "tormentosa" | "tomentosa" | Error ortográfico | [enlace](https://edis.ifas.ufl.edu/publication/ST433/pdf) |
| Persea americana (Aguacate, palta, avocado) | taxonomy.family | "Lauráceas" | "Lauraceae" | Nombre científico de familia (APG IV) | [enlace](https://powo.science.kew.org/results?q=Persea%20americana) |
| Persea schiedeana (Anayo, aguacate criollo) | taxonomy.family | "Lauráceas" | "Lauraceae" | Nombre científico de familia (APG IV) | [enlace](https://p.gyb.elementfx.com/2071-1050/6/1/99) |
| Persea schiedeana (Chinene) | taxonomy.family | "Lauráceas" | "Lauraceae" | Nombre científico de familia (APG IV) | [enlace](https://p.gyb.elementfx.com/2071-1050/6/1/99) |
| Phaseolus coccineus (Frijol ayocote, gordo o botil) | taxonomy.species | "coccineous" | "coccineus" | Error ortográfico | [enlace](https://en.wikipedia.org/wiki/Phaseolus_coccineus) |
| Plinia cauliflora (Jaboticaba, Guapuru, jaboticaba da mata atlántica) | taxonomy.genus | "Myrciaria" | "Plinia" | Myrciaria cauliflora es sinónimo; nombre aceptado en POWO: Plinia cauliflora (Mart.) Kausel | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:203847-2) |
| Prunus serotina (Capulin) | taxonomy.species | "salicifolia" | "serotina (var. salicifolia)" | POWO trata Prunus salicifolia Kunth como sinónimo de Prunus serotina var. salicifolia | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:210885-2) |
| Punica granatum (Granada, pomegranate) | details.humidityPreference | "M" | "L" | ICRAF: tolera sequía, apta para forestación en zonas áridas y semiáridas | [enlace](https://apps.worldagroforestry.org/treedb2/speciesprofile.php?Spid=18036) |
| Quercus insignis (Encino Chicalahuatl) | height | {"min": 0.15, "max": 0.25} | {"min": 15, "max": 30} | Altura imposible para un encino; probablemente se capturó en otra unidad. Fuentes: 15-20 m (World Plants), hasta 30 m (Wikipedia/Oaks of the World) | [enlace](https://en.wikipedia.org/wiki/Quercus_insignis) |
| Robinia pseudoacacia (Black locust) | details.heightRangeDescription | "de 5 a 10 mts" | "más de 10 mts" | ICRAF: árbol de ~25 m; otras fuentes 9-24 m | [enlace](https://apps.worldagroforestry.org/treedb2/speciesprofile.php/docs/policydocument.pdf?Spid=1454) |
| Salvia hispanica (Chia) | taxonomy | "(vacío)" | "Salvia hispanica" | Taxonomía vacía; 'chía' corresponde a Salvia hispanica (ejemplo del spec) | [enlace](https://cigras.ucr.ac.cr/phocadownload/Repositorio_mesoamericano/Salvia hispanica L.pdf) |
| Spondias purpurea (Ciruela tropical, Jocote) | stratumIds | ["4"] | ["2", "3"] | Árbol pequeño de 3–12 m (registro indica 5–10 m); Emergente es incongruente con su altura; se asigna Medio/Alto como guayaba/mango en el dataset | [enlace](https://edis.ifas.ufl.edu/publication/MG059) |
| Sterculia apetala (Palo boya, chichá) | taxonomy.family | "Sterculioideae" | "Malvaceae" | Sterculioideae es subfamilia; la familia APG IV es Malvaceae | [enlace](https://powo.science.kew.org/taxon/245150-2) |
| Symphytum officinale (Consuelda) | height | {"min": 0.45, "max": 0.45} | {"min": 0.6, "max": 1.2} | La consuelda alcanza normalmente 0.6–1.2 m en floración | [enlace](https://naturblick.museumfuernaturkunde.berlin/species/portrait/468?lang=en) |
| Syzygium cumini (Jambolan, Aceituna tropical) | taxonomy.genus | "Eugenia" | "Syzygium" | Eugenia jambolana es sinónimo de Syzygium cumini (nombre aceptado en POWO) | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:601603-1/general-information) |
| Syzygium cumini (Jambolan, Aceituna tropical) | taxonomy.species | "jambolana" | "cumini" | sinónimo | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:601603-1/general-information) |
| Syzygium cumini (Jambolan, Aceituna tropical) | taxonomy.family | "Mirtaceae" | "Myrtaceae" | error ortográfico | [enlace](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:601603-1/general-information) |
| Tectona grandis (Teca) | taxonomy.family | "Verbenaceae" | "Lamiaceae" | En APG IV Tectona pertenece a Lamiaceae (Verbenaceae es la ubicación antigua) | [enlace](https://colplanta.org/taxon/urn:lsid:ipni.org:names:864923-1/general-information) |
| Tephrosia vogelii (Teprosia) | stratumIds | ["3"] | ["2"] | Arbusto de 0.5–4 m (registro 2–3 m); Alto es incongruente, Medio coincide con otros arbustos del dataset | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Tephrosia_vogelii.PDF) |
| Tetragonia tetragonioides (Espinaca N.Z.) | details.isFrostResistant | true | false | Planta sensible a heladas (rebrota desde la base al regresar el calor); como mucho tolera heladas ligeras | [enlace](https://www.nzpcn.org.nz/flora_details.asp?ID=325) |
| Theobroma cacao (Cacao, arbol de cacao, cacao) | taxonomy.family | "Sterculaceae" | "Malvaceae" | Sterculiaceae (mal escrito) está incluida en Malvaceae en APG IV | [enlace](https://en.wikipedia.org/wiki/Theobroma_cacao) |
| Thymus vulgaris (Tomillo) | taxonomy.genus | "Timus" | "Thymus" | Error ortográfico | [enlace](https://en.wikipedia.org/wiki/Thymus_vulgaris) |
| Thymus vulgaris (Tomillo) | additionalFunctionIds | ["2"] | ["0", "3"] | El tomillo es un subarbusto aromático (condimento y medicinal), no maderable | [enlace](https://pfaf.org/user/Plant.aspx?LatinName=Thymus+vulgaris) |
| Thymus vulgaris (Tomillo) | height | {"min": 0.4, "max": 0.4} | {"min": 0.15, "max": 0.4} | Rango típico 15–40 cm | [enlace](https://pfaf.org/user/Plant.aspx?LatinName=Thymus+vulgaris) |
| Tilia sp. (Tilo) | details.shape | "arbusto" | "árbol" | Las especies de Tilia son árboles; el tilo mexicano (Tilia mexicana / T. americana var. mexicana) alcanza hasta 35 m | [enlace](https://www.uaeh.edu.mx/investigacion/icbi/LI_EcologiaCambGlobal/numa_pavon/TiliaMexicana.pdf) |
| Tilia sp. (Tilo) | height | {"min": 3, "max": 3} | {"min": 15, "max": 35} | Altura de 3 m incongruente con un árbol del dosel de bosque mesófilo | [enlace](https://www.uaeh.edu.mx/investigacion/icbi/LI_EcologiaCambGlobal/numa_pavon/TiliaMexicana.pdf) |
| Tilia sp. (Tilo) | details.heightRangeDescription | "de 5 a 10 mts" | "más de 10 mts" | Consistente con la altura corregida | [enlace](https://www.uaeh.edu.mx/investigacion/icbi/LI_EcologiaCambGlobal/numa_pavon/TiliaMexicana.pdf) |
| Tithonia diversifolia (Giganton) | stratumIds | ["3"] | ["2"] | Arbusto de 1.2–3(–5) m; Alto es incongruente, Medio coincide con su altura | [enlace](https://apps.lucidcentral.org/tropical_forages/pdf/tithonia_diversifolia.pdf) |
| Tithonia diversifolia (Giganton) | height | {"min": 2, "max": 3} | {"min": 2, "max": 5} | Alcanza 2–3 (–5) m | [enlace](https://apps.lucidcentral.org/tropical_forages/pdf/tithonia_diversifolia.pdf) |
| Tithonia diversifolia (Giganton) | details.shape | "hierba" | "arbusto" | Arbusto semileñoso | [enlace](https://apps.worldagroforestry.org/treedb2/AFTPDFS/Tithonia_diversifolia.PDF) |
| Tithonia diversifolia (Giganton) | details.isFrostResistant | true | false | Crecimiento óptimo 15–31 °C; muere en temporadas frías (se cultiva como anual en climas fríos) | [enlace](https://apps.lucidcentral.org/tropical_forages/pdf/tithonia_diversifolia.pdf) |
| Toona ciliata (Toona, Cedro Australiano, cedro australiano) | taxonomy.family | "Lecythidaceae" | "Meliaceae" | Toona pertenece a Meliaceae (familia de la caoba y el cedro) | [enlace](https://apps.worldagroforestry.org/treedb/AFTPDFS/Toona_ciliata.PDF) |
| Trema micranthum (Ixpepe) | taxonomy.family | "Canabaceae" | "Cannabaceae" | Error ortográfico | [enlace](https://en.wikipedia.org/wiki/Trema_micranthum) |
| Trema micranthum (Ixpepe) | taxonomy.species | "Micrantha" | "micranthum" | Epíteto en minúscula; nombre aceptado actual Trema micranthum (L.) Blume (Trema es neutro); 'micrantha' queda como sinónimo ortográfico | [enlace](https://en.wikipedia.org/wiki/Trema_micranthum) |
| Trichanthera gigantea (Nacedero) | height | {"min": 2, "max": 2} | {"min": 3, "max": 6} | Arbusto/árbol pequeño de generalmente ~5 m (puede llegar a 12–15 m); 2 m solo corresponde a manejo con cortes | [enlace](https://www.feedipedia.org/Node/7270) |
| Trichanthera gigantea (Nacedero) | details.shape | "hierba" | "arbusto" | Especie leñosa arbustiva/arbórea | [enlace](https://www.feedipedia.org/Node/7270) |
| Trichanthera gigantea (Nacedero) | details.heightRangeDescription | "hasta 2 mts" | "hasta 5 mts" | Consistente con la altura corregida | [enlace](https://www.feedipedia.org/Node/7270) |
| Vachellia farnesiana (Huizache) | taxonomy.genus | "Acacia" | "Vachellia" | Nombre aceptado en POWO: Vachellia farnesiana (L.) Wight & Arn.; Acacia farnesiana es sinónimo | [enlace](https://rngr.net/publications/semillas-de-especies-forestales/monografias/vachellia-farnesiana-l.-wight-arn.-fabaceae/at_download/file) |

## Especies sin información confiable (se dejaron sin cambios)

- **(sin nombre científico) (babosa)** (`WjnDqFvSG2z8PDxtUS4i`): 'Babosa' es ambiguo: en Brasil designa a Aloe vera (ya existe como 'Sabila') y 'babosa-branca' a Cordia superba (árbol, coincidiría con estrato alto); en México 'baboso' también se usa para cactáceas. No se asignó taxonomía.
- **(sin nombre científico) (Caferana)** (`UMExbdqsCyh9DS38JEv5`): 'Caferana' es un nombre brasileño ambiguo: se aplica a Bunchosia armeniaca/B. glandulifera (Malpighiaceae, frutal, la más probable en un contexto agroforestal), a Picrolemma sprucei (Simaroubaceae) y a Tachia guianensis (Gentianaceae). No se asignó taxonomía; confirmar con el responsable.
- **(sin nombre científico) (Cosamalu)** (`i2Kfx3u9jq5lQUm3jVKz`): No se encontró ninguna fuente para 'cosamalu' (ni variantes cosamalo/cozamalo). Posible nombre indígena local de una hierba de bosque de niebla. Se requiere nombre científico.
- **(sin nombre científico) (Huevo de chivo)** (`UlFRGpKA1zF5zatLaemB`): No se encontró ninguna fuente que identifique una enredadera llamada 'huevo de chivo'; nombre local ambiguo. Se requiere nombre científico o foto.
- **(sin nombre científico) (Menta de matón)** (`Xr3FH2WWIcl9bbDQinAN`): No se encontró ninguna referencia a 'menta de matón'; probablemente un nombre local de alguna Mentha o Lamiaceae aromática. Se requiere nombre científico.
- **Prunus sp. (Albaricoque japones, ciruela china , japanese plum)** (`ZwbjlOxPSMaNk51tEnxh`): Los nombres comunes son ambiguos: 'albaricoque japonés' corresponde a Prunus mume, mientras que 'ciruela china/japanese plum' corresponde a Prunus salicina. No se puede identificar la especie sin más información; se recomienda que los responsables definan cuál es y separar en dos registros si aplica.

## Propuestas descartadas por la validación automática

- Psophocarpus tetragonolobus (Frijol alado) — `height`: sobrescribe un valor existente sin corrección documentada (propuesto: {"min": 3, "max": 4}, actual: {"min": 3, "max": 3})

## Pendientes de investigar

Estas especies no se alcanzaron a revisar en esta pasada (límite de búsquedas); no significa que no haya información.

Albizzia procera (Siri blanco), Allium fistulosum (Cebolla Welsh), Allium sp. (Cebollino), Alnus acuminata (Ilite, aile), Aloe vera (Sabila, savila), Aloysia citrodora (Cedron), Amaranthus sp. (Quelites), Anacardium occidentale (Marañon, cayu), Ananas cosmosus (Piña), Annona atemoya (Chirimoya Gerfner Annona cherimola Atemoya?), Annona cherimola (Chirimoya), Annona diversifolia (Ilama), Annona muricata (Guanabana, graviola), Annona squamosa (Anona), Arachis hypogaea (Cacahuate, mani), Arachis pintoi (Cacahuate forrajero), Araucaria angustifolia (Araucaria, Pino del Parana, pino misionero, pino Brasil, araucaria misionense o cury), Araucaria araucana (Araucaria), Araucaria bidwilli (Araucaria australiana), Ardisia compressa (Capulin de Mayo), Argania spinosa (Argan), Argemone mexicana (Chicalote), Arracacha xanthorrhiza (Arracacha), Artemisia absinthium (Ajenjo), Artemisia ludoviciana (Estafiate), Artocarpus altilis (Arbol del pan, frutipan, breadfruit, pan de fruta), Artocarpus heterophylus (Yaca, jack, nanka, panapen, jaca), Arundo Donax (Carrizo), Asparagus officinalis (Esparrago), Aspidosperma polyneuron (palo rosa, perobá, peroba, peroba común, peroba rosa, ybirá romí, ybyra ro'mi, peroba rosa), Astrocaryum murumuru (Murumuru), Astronium urundeuva (Arbol de pimienta, Palo fierro, aroeira verdadeira), Atractocarous fitzalanni (Gardeña o orange randia, yellow mangosteen), Capsicum pubescens (Chile cera), Carapa guianensis (Andiroba, cedro macho, andiroba), Cardulobica palmata (Iraca), Carica papaya (Papaya, papayón, olocotón, papayo, lechosa, lechoza, papaya), Cariniana sp. (yesquero (Bolivia), jequitiba (Brasil), cachimbo (Perú), bacú (Venezuela), jequitibá), Carissa grandiflora (Carisa), Carpobrotus acinaciformis (Flor del cuchillo, diente de dragón), Carya illinoensis (Nogal pecanero, pecan nut, Nuez de la isla, nuez encarcelada, walnut pecan), Caryocar brasiliense (Nuez souari, pequi), Casimiroa edulis (Zapote blanco), Castanea sativa (Castaño), Casuarina decaisneana (Casuarina del desierto), Casuarina equisetifolia (Casuarina), Cedrela odorata (Cedro), Ceiba pendrata (Ceiba), Centrolobium tomentosum (Arariba), Ceratonia siliqua (Algarrobo), Chamaecytisus palmensis (Tagasaste), Chamaedorea tepejilote (Tepejilote), Chamaemelum nobile (Manzanilla), Chenopodium ambrosioides (Epazote), Cinchona officinalis (Quina), Cinnamomum zeylanicum (Canela), Citrullus lanatus (Sandia), Citrus aurantium (Limon canario, limon criollo), Citrus aurantium (Naranja agria), Citrus latifolia (Limon persa, lima da persia), Citrus mitis (Limon calamondin), Citrus reticulata (Mandarina), Citrus reticulata (Tangerina ponkan, pokan), Citrus sinensis (Naranja), Crisobalamus icacus (Icaco), Crotalaria juncea (Crotalaria), Crotolaria longirostrata (Chipilin), Croton draconoides (Sangre de grado), Cucumis melo (Melos), Cucurbita ficifolia (Chilacayote), Cucurbita foetidisima (Calabacilla), Cucurbita moschata (Calabaza melona), Cucurbita sp. (Calabaza), Curcuma longa (Curcuma), Cydonia vulgaris (Membrillo), Cymbopogon citratos (Zacate limon), Cymbopogon winterianus (Citronela), Cynara scolimus (Alcachofa), Cyphomandra betacea (Tomate de Arbol, berenjenilla), Dahlia sp. (Dalia), Dalbergia paloescrito (Dalbergia), Desmodium arbicularis (Engordacabras), Desmodium rensonii (Desmodium rensonii), Desmodium spp. (Pega pega), Dimocarpus longan (Longan, Ojo de dragón), Dioscorea alata (Ñame), Dioscorea bulbifera (Papa Voladora), Dioscorea sp. (Camote de cerro), Diospyros digyna (Zapote negro), Diospyros kaki (Persimo, caqui), Dipteryx alata (Baru, Baruzeiro, arbol del Baru, barú), Elettaria cardamomum (Cardamomo), Enset ventricosum (Enset), Enterolobium cyclocarpum (Huanacaxtle, guanacastle, parota, guanacaste), Equisetum arvense (Cola de caballo, equiseto), Eriobotrya japonica (Nispero, nispero japonis, nespera), Eryngium foetidum (Cilantro silvestre, culantro silvestre), Erythrina americana (Colorin), Erythrina edulis (Chachafruto), Erythroxylum coca (Coca), Fraxinus uhedi (Fresno), Gallesia integrifolia (Palo de ajo, Ajo ajo (arbol)), Garcinia gardneriana (Bacupari, bacupari-acu), Garcinia mangostana (Mangostan, mangosteen), Garcinia sp. (Bacupari, bacupari miudo), Garcinia sp. (Mangostan amarillo, mangostao amarelo), Genipa americana (Manzana del monte), Gleditsia triacanthos (Acacia Negra (Honey locust)), Glicine max (Soya), Gliricidia sepium (Cocoite, cacahuananche, Palo de sol, cocohite, cocuite, gliricedia), Gossypium hirsutum (Algodon), Grevilea Robusta (Grevilea, grevilia, bredil), Guazuma ulmifolia (guazimo, guasima, guacima, caulote, cuaulote (del náhuatl) o majahua, mutamba), Handroanthus albus (lapacho amarillo, ipe amarelo), Handroanthus heptaphyllus (lapacho rosado, ipe rosa), Handroanthus impetiginosus (lapacho rosado, ipe roxo), Helianthus tuberosa (Alcachofa jerusalmem, tupinambur), Heliconia spp. (Platanillo, chilalaca), Heliocarpus americanus (Jonote), Hevea brasiliensis (Arbol del caucho, Goma), Hibiscus esculentus (Ocra), Hibiscus rosasinensis (Tulipancillo), Hibiscus sabdariffa (Jamaica), Hovenia dulcis (Arbol de las pasas, uva do japao), Hoya sp. (Cinnamon scent), Hylocereus undatus (Pitahaya), Hymenaea courbaril (Guapinol, curbaril, copinol, cuapinol, guapinol, jatoba o jatobá, jatayva en guaraní, Paquió (Bolivia), o Algarrobo  (Puerto Rico, Panamá, Venezuela y Colombia), jatobá), Ilex paraguariensis (Mate, Yerba Mate, erva mate), Inga edulis (Guaba negra, Jinicuil, Chalacahuite, acontope, jacanicuil, guaba, ingá), Inga oesterdiana (Chalahuite), Inga vera (Jinicuil), Mahonia aquifolium (Mahonia), Malphigia emarginata (Cerecita, manzanita, semeruco, acerola), Malpighia glabra (Acerola), Malus communis (Manzana, apple), Mammea americana (Mamey), Manguifera indica (Mango), Manihot esculenta (Yuca), Manilkara zapota (Chicozapote, Chicle, arbol del chicle, sapoti), Maranta arundinacea (Sagu), Mauritia flexuosa (Buriti, moriche, canangucha, mirití, aguaje, buriti), Medicago sativa (Alfalfa), Melia azedarach (Piocha, paraiso, canelo, cinamomo), Melicoccus bijugatus (Mamon - Guaya), Melissa officinalis (Toronjil), Mentha sp. (Menta), Mentha spicata (Hierbabuena), Mimosa scabrella (Bracatinga), Moringa stenopetala (Moringa), Morus alba (Morera para hoja, blacberry (silkworm)), Morus nigra (Morera negra), Morus sp (Morera), Mucuna pruriens (Frijol nescafe, picapica, frijol terciopelo, nescafé), Musa acuminata (Banana, banana da terra), Musa acuminata (Platano enano enano), Musa acuminata (Platano enano gigante), Musa acuminata (platano malayo, platano rojo, banana nanica), Musa balbisiana (Platano postre), Musa paradisiaca (Platano), Musa sp. (Guineo), Musa sp. (Platano manzano, banana apple), Musa sp. (Platano plateado, silver banana), Musa sp. (Platano, banana s. tomé), Musa sp. (banana bread), Musa sp. (banana gold), Musa sp. (bananas silver, bread, tropical apple), Phaseolus lunatus (Frijol ibes), Phaseolus lunatus (Frijol lima, fríjol mantequilla), Phaseolus ssp (Frijol de mata), Phaseolus ssp (Frijol trepador), Phoenix datilifera (Datil), Phormium tenax (Fornio), Phyllanthus acidus (Grosella), Phyllostachis aurea (Bambu dorado), Phyllostachis edulis (Bambu moso), Phyllostachis nigra (Bambu negro chico), Physalis peruviana (Uchuva, tomate silvestre), Pimienta dioica (Pimienta gorda), Pinus pinaster (Pino rodeno, pino marítimo , pino rubial​, pino negra, pinheiro bravo), Pinus pinea (Pino piñonero), Piper auritum (Acuyo), Piper nigrum (Pimienta negra), Pirus sp. (Pera), Pithecellobium dulce (Guamuchil), Plantago major (Llanten de la india, blond), Platanus spp. (Haya, platano), Platonia insignis (Bacuri, bacuri), Plinia edulis (Cambucá, cambucá), Podocarpus sp. (Podocarpos), Populus spp. (Alamo, poplar), Portulaca oleraceae (Verdolaga), Pouteri zapota (Zapote mamey), Pouteria caimito (Caimito, caimeto, abiu roxo), Pouteria campechiana (Canistel), Pouteria lucuma (Lucuma), Rosmarinus officinalis (Romero), Rosmarinus sp. (Romero rastrero), Rubus fruticosus (Zarzamora), Rubus idaeus (Frambuesa), Rumex acetosa (Sorrel), Rumex mexicanus (Lengua de Vaca), Ruta sp. (Ruda), Sabal mexicana (Guano, bonxaan), Sacharum oficinarum (Caña de azucar), Salix spp. (Sauce), Salvia officinalis (Salvia), Sambucus mexicana (Sauco), Sapindus saponaria (Jaboncillo, Sululo, pipe, kile), Sauropus androgynus (Katuk), Scheelea princeps (Motacu), Schinus molle (Pirul), Sclerocarya birrea (Marula), Sechium edule (Chayote, pataste), Selaginella martensii (Selaginela, doradilla), Selaginella sp. (Doradilla), Senna multiglandulosa (Retama), Sesamum+C13 indicum (Ajonjoli), Sideroxylon capiri (Tempisque), Silybum marianum (Cardo mariano), Simmondsia chinensis (Jojoba), Smallanthus sonchifolius (Yacon), Smilax officinalis (Zarzaparrilla), Solanum nigrum (Hierba mora), Solanum quitoense (Lulo), Sorghum spp. (Sorgo), Spathiphyllum sp. (Cuna de moises, chile de gato), Spondias mombin (Jobo, ciruela tropical, cedrillo), Trifolium pratense (Trebol rojo), Trifolium repens (Trebol blanco), Tropaeolum majus (Mastuerzo), Uncari tomentosa (Uña de gato), Urtica dioica (Ortiga), Vaccinium corymbosum (Mora azul), Vaccinium sp. (Arandano), Vainilla planiflora (Vainilla), Verbascum thapsus (Gordolobo), Verbesina crocata (Arnica capitaneja, palo espinoso, cachanquillo), Vicia faba (Haba), Vigna radiata (Frijol mungo), Vigna umbelata (Frijol arroz), Vigna ungiculata (Frijol vara), Vignia sesquipedais (Ejote Cubano), Vitellaria paradoxa (Karite), Vitis vinifera (Uva, vid, parra), Wisteria sinensis (Glicinia), Xanthosoma saggitifolium (Macal, Tiquisque morado, Taioba, Hualuza), Yucca elephantipes? (Izote), Zea mais (Maiz), Zingiber officinale (Jengibre), Zyzxgium malaccense (Pomarosa, Manzana brasilera), Árnica sp. (Arnica)

## Fuentes

Cada especie se investigó con fuentes como POWO (Kew), Tropicos, GBIF, CONABIO/Enciclovida, World Agroforestry (ICRAF), Useful Tropical Plants, PFAF, Feedipedia, CABI y guías de extensión. Las URL consultadas por especie están en `scripts/species-cleanup/sources.json`.

## Segunda pasada (2026-10-14)

La primera pasada (210 actualizaciones, 22 borrados) ya se aplicó en Firestore el 2026-10-14; el respaldo quedó en un `backup-*.json` local (no versionado).

Esta segunda pasada cubre las especies pendientes restantes. Los cambios están en `scripts/species-cleanup/changes-pass2.json` (217 actualizaciones, sin borrados). Se aplica con el mismo script:

```bash
node scripts/species-cleanup/apply-species-cleanup.mjs --file=scripts/species-cleanup/changes-pass2.json          # simulación
node scripts/species-cleanup/apply-species-cleanup.mjs --file=scripts/species-cleanup/changes-pass2.json --apply  # aplicar
```

> **Importante:** a diferencia de la primera pasada, estos datos **no se verificaron con búsquedas en línea por especie**; provienen de referencias botánicas generales (POWO para nombres aceptados, APG IV para familias) y son tamaños/preferencias típicos del cultivo. Confianza: media. Se siguieron los mismos criterios: sólo se llenan campos vacíos y las únicas modificaciones de valores existentes son las correcciones listadas abajo.

### Especies completadas

| Especie | Campos completados |
| --- | --- |
| Phaseolus lunatus (Frijol ibes) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Castanea sativa (Castaño) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Selaginella martensii (Selaginela, doradilla) | estrato, funciones ecológicas, ancho de copa, detalles |
| Citrus aurantium (Limon canario, limon criollo) | funciones ecológicas, funciones adicionales |
| Rosmarinus officinalis (Romero) | taxonomía, estrato, funciones ecológicas, detalles |
| Dimocarpus longan (Longan, Ojo de dragón) | taxonomía, funciones ecológicas, funciones adicionales |
| Hoya sp. (Cinnamon scent) | taxonomía, zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Phyllanthus acidus (Grosella) | estrato, funciones ecológicas, altura, ancho de copa, detalles |
| Mucuna pruriens (Frijol nescafe, picapica, frijol terciopelo, nescafé) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Ceiba pendrata (Ceiba) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Physalis peruviana (Uchuva, tomate silvestre) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Ruta sp. (Ruda) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Morus alba (Morera para hoja, blacberry (silkworm)) | zonas, funciones ecológicas, funciones adicionales |
| Ananas cosmosus (Piña) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Rumex mexicanus (Lengua de Vaca) | funciones ecológicas, funciones adicionales |
| Maranta arundinacea (Sagu) | taxonomía, funciones ecológicas |
| Crotalaria juncea (Crotalaria) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Piper auritum (Acuyo) | taxonomía, funciones ecológicas, funciones adicionales, detalles |
| Phoenix datilifera (Datil) | taxonomía, estrato, funciones adicionales, detalles |
| Musa balbisiana (Platano postre) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Solanum nigrum (Hierba mora) | estrato, funciones adicionales, detalles |
| Salvia officinalis (Salvia) | taxonomía, estrato, funciones ecológicas, funciones adicionales, detalles |
| Dioscorea sp. (Camote de cerro) | estrato, altura, ancho de copa, detalles |
| Dioscorea bulbifera (Papa Voladora) | funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Vignia sesquipedais (Ejote Cubano) | taxonomía, funciones ecológicas, ancho de copa, detalles |
| Garcinia mangostana (Mangostan, mangosteen) | taxonomía, altura, detalles |
| Podocarpus sp. (Podocarpos) | zonas, altura, ancho de copa, detalles |
| Citrus reticulata (Mandarina) | funciones ecológicas, funciones adicionales |
| Mentha spicata (Hierbabuena) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Trifolium repens (Trebol blanco) | estrato, funciones ecológicas, funciones adicionales, ancho de copa |
| Guazuma ulmifolia (guazimo, guasima, guacima, caulote, cuaulote (del náhuatl) o majahua, mutamba) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Smilax officinalis (Zarzaparrilla) | taxonomía, altura, ancho de copa, detalles |
| Hylocereus undatus (Pitahaya) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Heliocarpus americanus (Jonote) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Phyllostachis aurea (Bambu dorado) | taxonomía, funciones ecológicas, funciones adicionales |
| Artemisia absinthium (Ajenjo) | estrato, funciones adicionales, altura, ancho de copa, detalles |
| Cymbopogon winterianus (Citronela) | funciones ecológicas, altura |
| Morus nigra (Morera negra) | zonas, funciones ecológicas, funciones adicionales |
| Árnica sp. (Arnica) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Casuarina equisetifolia (Casuarina) | zonas, funciones ecológicas, funciones adicionales |
| Solanum quitoense (Lulo) | funciones ecológicas, funciones adicionales, detalles |
| Phyllostachis nigra (Bambu negro chico) | taxonomía, funciones ecológicas, funciones adicionales |
| Malus communis (Manzana, apple) | taxonomía, funciones ecológicas, funciones adicionales, detalles |
| Carpobrotus acinaciformis (Flor del cuchillo, diente de dragón) | estrato, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Annona muricata (Guanabana, graviola) | funciones ecológicas, funciones adicionales, detalles |
| Cedrela odorata (Cedro) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Argemone mexicana (Chicalote) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Xanthosoma saggitifolium (Macal, Tiquisque morado, Taioba, Hualuza) | taxonomía, funciones adicionales |
| Gossypium hirsutum (Algodon) | zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Populus spp. (Alamo, poplar) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Citrullus lanatus (Sandia) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Artocarpus heterophylus (Yaca, jack, nanka, panapen, jaca) | taxonomía, funciones ecológicas, detalles |
| Pouteria caimito (Caimito, caimeto, abiu roxo) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Cynara scolimus (Alcachofa) | taxonomía, estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Plantago major (Llanten de la india, blond) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Musa acuminata (platano malayo, platano rojo, banana nanica) | funciones ecológicas, altura, ancho de copa, detalles |
| Platanus spp. (Haya, platano) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Manihot esculenta (Yuca) | funciones ecológicas, funciones adicionales, detalles |
| Aloysia citrodora (Cedron) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Cinchona officinalis (Quina) | taxonomía, funciones adicionales, altura, ancho de copa, detalles |
| Elettaria cardamomum (Cardamomo) | taxonomía, funciones adicionales |
| Smallanthus sonchifolius (Yacon) | funciones ecológicas, detalles |
| Chamaedorea tepejilote (Tepejilote) | taxonomía, funciones adicionales |
| Verbesina crocata (Arnica capitaneja, palo espinoso, cachanquillo) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Pinus pinea (Pino piñonero) | estrato, funciones adicionales, altura, ancho de copa, detalles |
| Capsicum pubescens (Chile cera) | taxonomía, funciones ecológicas, funciones adicionales |
| Pouteria lucuma (Lucuma) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Arracacha xanthorrhiza (Arracacha) | taxonomía, estrato, funciones adicionales, detalles |
| Allium fistulosum (Cebolla Welsh) | estrato, funciones ecológicas, funciones adicionales |
| Spondias mombin (Jobo, ciruela tropical, cedrillo) | funciones ecológicas, altura, ancho de copa, detalles |
| Cymbopogon citratos (Zacate limon) | taxonomía, funciones ecológicas, funciones adicionales |
| Moringa stenopetala (Moringa) | taxonomía, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Phaseolus lunatus (Frijol lima, fríjol mantequilla) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Astronium urundeuva (Arbol de pimienta, Palo fierro, aroeira verdadeira) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Cucurbita ficifolia (Chilacayote) | taxonomía, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Pouteria campechiana (Canistel) | funciones ecológicas, funciones adicionales, altura, detalles |
| Allium sp. (Cebollino) | estrato, funciones ecológicas, funciones adicionales |
| Pithecellobium dulce (Guamuchil) | funciones ecológicas, funciones adicionales, detalles |
| Urtica dioica (Ortiga) | taxonomía, funciones ecológicas, funciones adicionales |
| Asparagus officinalis (Esparrago) | taxonomía, estrato, funciones adicionales |
| Malpighia glabra (Acerola) | taxonomía, funciones ecológicas, funciones adicionales |
| Mimosa scabrella (Bracatinga) | taxonomía, funciones ecológicas, altura, ancho de copa, detalles |
| Citrus sinensis (Naranja) | funciones ecológicas, funciones adicionales, detalles |
| Simmondsia chinensis (Jojoba) | estrato, funciones ecológicas, altura, ancho de copa, detalles |
| Rubus idaeus (Frambuesa) | estrato, funciones ecológicas, funciones adicionales |
| Ilex paraguariensis (Mate, Yerba Mate, erva mate) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Araucaria araucana (Araucaria) | altura, ancho de copa, detalles |
| Grevilea Robusta (Grevilea, grevilia, bredil) | taxonomía, estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Cariniana sp. (yesquero (Bolivia), jequitiba (Brasil), cachimbo (Perú), bacú (Venezuela), jequitibá) | zonas, altura, ancho de copa, detalles |
| Mauritia flexuosa (Buriti, moriche, canangucha, mirití, aguaje, buriti) | taxonomía, zonas, funciones adicionales, altura, ancho de copa, detalles |
| Malphigia emarginata (Cerecita, manzanita, semeruco, acerola) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Hovenia dulcis (Arbol de las pasas, uva do japao) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Scheelea princeps (Motacu) | taxonomía, funciones adicionales, altura, ancho de copa, detalles |
| Sesamum+C13 indicum (Ajonjoli) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Chamaemelum nobile (Manzanilla) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Ceratonia siliqua (Algarrobo) | estrato, funciones adicionales, detalles |
| Araucaria bidwilli (Araucaria australiana) | taxonomía, funciones adicionales, altura, ancho de copa |
| Sabal mexicana (Guano, bonxaan) | estrato, zonas, funciones adicionales, altura, ancho de copa, detalles |
| Salix spp. (Sauce) | taxonomía, estrato, funciones ecológicas |
| Desmodium rensonii (Desmodium rensonii) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Wisteria sinensis (Glicinia) | taxonomía, estrato, funciones ecológicas, ancho de copa, detalles |
| Alnus acuminata (Ilite, aile) | taxonomía, estrato, funciones ecológicas, detalles |
| Ardisia compressa (Capulin de Mayo) | taxonomía, funciones ecológicas, funciones adicionales |
| Croton draconoides (Sangre de grado) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Cucurbita moschata (Calabaza melona) | taxonomía, zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Vigna radiata (Frijol mungo) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Musa paradisiaca (Platano) | funciones ecológicas, detalles |
| Handroanthus heptaphyllus (lapacho rosado, ipe rosa) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Gallesia integrifolia (Palo de ajo, Ajo ajo (arbol)) | taxonomía, funciones adicionales, altura, ancho de copa, detalles |
| Desmodium arbicularis (Engordacabras) | taxonomía, estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Handroanthus impetiginosus (lapacho rosado, ipe roxo) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Aspidosperma polyneuron (palo rosa, perobá, peroba, peroba común, peroba rosa, ybirá romí, ybyra ro'mi, peroba rosa) | zonas, funciones adicionales, altura, ancho de copa, detalles |
| Inga edulis (Guaba negra, Jinicuil, Chalacahuite, acontope, jacanicuil, guaba, ingá) | zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Portulaca oleraceae (Verdolaga) | taxonomía, funciones ecológicas, ancho de copa |
| Uncari tomentosa (Uña de gato) | taxonomía, funciones adicionales, altura, ancho de copa, detalles |
| Sambucus mexicana (Sauco) | taxonomía, funciones ecológicas, detalles |
| Dioscorea alata (Ñame) | funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Carica papaya (Papaya, papayón, olocotón, papayo, lechosa, lechoza, papaya) | funciones ecológicas |
| Phormium tenax (Fornio) | taxonomía, estrato, funciones ecológicas, detalles |
| Artemisia ludoviciana (Estafiate) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Casuarina decaisneana (Casuarina del desierto) | estrato, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Heliconia spp. (Platanillo, chilalaca) | funciones ecológicas, detalles |
| Spathiphyllum sp. (Cuna de moises, chile de gato) | estrato, altura, ancho de copa, detalles |
| Caryocar brasiliense (Nuez souari, pequi) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Platonia insignis (Bacuri, bacuri) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Zea mais (Maiz) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Dalbergia paloescrito (Dalbergia) | taxonomía, estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Vitis vinifera (Uva, vid, parra) | funciones ecológicas, ancho de copa, detalles |
| Annona cherimola (Chirimoya) | funciones ecológicas, funciones adicionales, detalles |
| Verbascum thapsus (Gordolobo) | taxonomía, estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Sideroxylon capiri (Tempisque) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Enset ventricosum (Enset) | taxonomía, estrato, funciones ecológicas, funciones adicionales |
| Cucumis melo (Melos) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Trifolium pratense (Trebol rojo) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Vainilla planiflora (Vainilla) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Schinus molle (Pirul) | taxonomía, estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Enterolobium cyclocarpum (Huanacaxtle, guanacastle, parota, guanacaste) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Albizzia procera (Siri blanco) | taxonomía, estrato, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Citrus mitis (Limon calamondin) | taxonomía, funciones ecológicas, funciones adicionales |
| Chamaecytisus palmensis (Tagasaste) | taxonomía, estrato, zonas, funciones ecológicas, funciones adicionales, detalles |
| Garcinia gardneriana (Bacupari, bacupari-acu) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Annona squamosa (Anona) | funciones ecológicas, funciones adicionales, detalles |
| Inga vera (Jinicuil) | funciones ecológicas, funciones adicionales, detalles |
| Senna multiglandulosa (Retama) | taxonomía, estrato, funciones ecológicas, altura, ancho de copa, detalles |
| Fraxinus uhedi (Fresno) | taxonomía, estrato, funciones adicionales, altura, ancho de copa, detalles |
| Hibiscus sabdariffa (Jamaica) | funciones ecológicas, altura, ancho de copa, detalles |
| Genipa americana (Manzana del monte) | taxonomía, funciones ecológicas, altura, ancho de copa, detalles |
| Vigna ungiculata (Frijol vara) | taxonomía, estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Sapindus saponaria (Jaboncillo, Sululo, pipe, kile) | funciones ecológicas, funciones adicionales |
| Mahonia aquifolium (Mahonia) | taxonomía, estrato, funciones ecológicas, funciones adicionales, detalles |
| Pimienta dioica (Pimienta gorda) | taxonomía, funciones ecológicas, funciones adicionales |
| Silybum marianum (Cardo mariano) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Aloe vera (Sabila, savila) | taxonomía, estrato, funciones adicionales |
| Sclerocarya birrea (Marula) | estrato, zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Sauropus androgynus (Katuk) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Mentha sp. (Menta) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Astrocaryum murumuru (Murumuru) | taxonomía, funciones adicionales, altura, ancho de copa, detalles |
| Sorghum spp. (Sorgo) | zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Plinia edulis (Cambucá, cambucá) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Crisobalamus icacus (Icaco) | taxonomía, estrato, zonas, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Melicoccus bijugatus (Mamon - Guaya) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Erythrina edulis (Chachafruto) | funciones ecológicas, funciones adicionales, detalles |
| Zingiber officinale (Jengibre) | funciones adicionales, detalles |
| Vicia faba (Haba) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Cucurbita foetidisima (Calabacilla) | taxonomía, estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Sacharum oficinarum (Caña de azucar) | taxonomía, funciones ecológicas, ancho de copa, detalles |
| Carya illinoensis (Nogal pecanero, pecan nut, Nuez de la isla, nuez encarcelada, walnut pecan) | taxonomía, funciones adicionales, detalles |
| Mammea americana (Mamey) | taxonomía, funciones ecológicas, funciones adicionales, detalles |
| Hibiscus rosasinensis (Tulipancillo) | taxonomía, estrato, funciones ecológicas, altura, ancho de copa, detalles |
| Yucca elephantipes? (Izote) | taxonomía, funciones ecológicas, funciones adicionales, detalles |
| Casimiroa edulis (Zapote blanco) | taxonomía, funciones ecológicas, detalles |
| Citrus aurantium (Naranja agria) | funciones ecológicas, altura, ancho de copa, detalles |
| Chenopodium ambrosioides (Epazote) | taxonomía, detalles |
| Inga oesterdiana (Chalahuite) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Erythroxylum coca (Coca) | altura, ancho de copa, detalles |
| Glicine max (Soya) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Desmodium spp. (Pega pega) | funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Curcuma longa (Curcuma) | detalles |
| Dahlia sp. (Dalia) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Sechium edule (Chayote, pataste) | funciones ecológicas, ancho de copa, detalles |
| Rumex acetosa (Sorrel) | estrato, funciones adicionales, altura, detalles |
| Manguifera indica (Mango) | taxonomía, funciones ecológicas, funciones adicionales, detalles |
| Dipteryx alata (Baru, Baruzeiro, arbol del Baru, barú) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Pinus pinaster (Pino rodeno, pino marítimo , pino rubial​, pino negra, pinheiro bravo) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Anacardium occidentale (Marañon, cayu) | funciones ecológicas, funciones adicionales, altura, detalles |
| Centrolobium tomentosum (Arariba) | zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Arundo Donax (Carrizo) | taxonomía, estrato, zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Piper nigrum (Pimienta negra) | funciones adicionales, altura, ancho de copa, detalles |
| Vitellaria paradoxa (Karite) | estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Crotolaria longirostrata (Chipilin) | taxonomía, funciones ecológicas, funciones adicionales, detalles |
| Eryngium foetidum (Cilantro silvestre, culantro silvestre) | zonas, funciones adicionales, altura, ancho de copa, detalles |
| Arachis hypogaea (Cacahuate, mani) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Vaccinium corymbosum (Mora azul) | estrato, funciones ecológicas, funciones adicionales, detalles |
| Eriobotrya japonica (Nispero, nispero japonis, nespera) | funciones ecológicas, detalles |
| Diospyros digyna (Zapote negro) | taxonomía, funciones ecológicas, detalles |
| Phyllostachis edulis (Bambu moso) | taxonomía, estrato, funciones ecológicas, ancho de copa |
| Artocarpus altilis (Arbol del pan, frutipan, breadfruit, pan de fruta) | funciones ecológicas, funciones adicionales, detalles |
| Cyphomandra betacea (Tomate de Arbol, berenjenilla) | taxonomía, funciones ecológicas, detalles |
| Tropaeolum majus (Mastuerzo) | taxonomía, estrato, funciones ecológicas, funciones adicionales, ancho de copa |
| Erythrina americana (Colorin) | funciones ecológicas, funciones adicionales, detalles |
| Annona diversifolia (Ilama) | estrato, zonas, funciones ecológicas, funciones adicionales, detalles |
| Melissa officinalis (Toronjil) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Helianthus tuberosa (Alcachofa jerusalmem, tupinambur) | taxonomía, estrato, funciones ecológicas, funciones adicionales, ancho de copa, detalles |
| Cucurbita sp. (Calabaza) | taxonomía, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Equisetum arvense (Cola de caballo, equiseto) | estrato, funciones ecológicas, funciones adicionales, altura, detalles |
| Atractocarous fitzalanni (Gardeña o orange randia, yellow mangosteen) | taxonomía, zonas, funciones ecológicas, altura, ancho de copa, detalles |
| Vigna umbelata (Frijol arroz) | taxonomía, estrato, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Melia azedarach (Piocha, paraiso, canelo, cinamomo) | estrato, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Hibiscus esculentus (Ocra) | taxonomía, zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Arachis pintoi (Cacahuate forrajero) | funciones ecológicas, funciones adicionales, ancho de copa |
| Araucaria angustifolia (Araucaria, Pino del Parana, pino misionero, pino Brasil, araucaria misionense o cury) | zonas, funciones adicionales, altura, ancho de copa, detalles |
| Manilkara zapota (Chicozapote, Chicle, arbol del chicle, sapoti) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Medicago sativa (Alfalfa) | estrato, funciones ecológicas, altura, ancho de copa, detalles |
| Handroanthus albus (lapacho amarillo, ipe amarelo) | zonas, funciones ecológicas, funciones adicionales, altura, ancho de copa, detalles |
| Argania spinosa (Argan) | taxonomía, estrato, funciones ecológicas, funciones adicionales, detalles |
| Rubus fruticosus (Zarzamora) | funciones ecológicas |
| Carapa guianensis (Andiroba, cedro macho, andiroba) | funciones adicionales, altura, ancho de copa, detalles |

### Correcciones de datos existentes (pasada 2)

| Especie | Campo | Antes | Después | Motivo |
| --- | --- | --- | --- | --- |
| Rosmarinus officinalis (Romero) | taxonomy | Rosmarinus officinalis | Salvia rosmarinus | Nombre aceptado / corrección ortográfica (POWO) |
| Ceiba pendrata (Ceiba) | taxonomy | Ceiba pendrata | Ceiba pentandra | Nombre aceptado / corrección ortográfica (POWO) |
| Ceiba pendrata (Ceiba) | taxonomy.family | Bombacaceae | Malvaceae | Familia aceptada (APG IV / POWO) |
| Morus alba (Morera para hoja, blacberry (silkworm)) | ecologicalZoneIds | ["1", "3", "4", "6", "6"] | ["1", "3", "4", "6"] | Id duplicado |
| Ananas cosmosus (Piña) | taxonomy | Ananas cosmosus | Ananas comosus | Nombre aceptado / corrección ortográfica (POWO) |
| Crotalaria juncea (Crotalaria) | taxonomy.family | fabaceae | Fabaceae | Familia aceptada (APG IV / POWO) |
| Phoenix datilifera (Datil) | taxonomy | Phoenix datilifera | Phoenix dactylifera | Nombre aceptado / corrección ortográfica (POWO) |
| Phoenix datilifera (Datil) | taxonomy.family | Palmáceas | Arecaceae | Familia aceptada (APG IV / POWO) |
| Vignia sesquipedais (Ejote Cubano) | taxonomy | Vignia sesquipedais | Vigna unguiculata subsp. sesquipedalis | Nombre aceptado / corrección ortográfica (POWO) |
| Garcinia mangostana (Mangostan, mangosteen) | taxonomy.family | Guttiferáceas | Clusiaceae | Familia aceptada (APG IV / POWO) |
| Hylocereus undatus (Pitahaya) | taxonomy | Hylocereus undatus | Selenicereus undatus | Nombre aceptado / corrección ortográfica (POWO) |
| Phyllostachis aurea (Bambu dorado) | taxonomy | Phyllostachis aurea | Phyllostachys aurea | Nombre aceptado / corrección ortográfica (POWO) |
| Morus nigra (Morera negra) | ecologicalZoneIds | ["4", "6", "6"] | ["4", "6"] | Id duplicado |
| Casuarina equisetifolia (Casuarina) | ecologicalZoneIds | ["1", "3", "4", "6", "6"] | ["1", "3", "4", "6"] | Id duplicado |
| Phyllostachis nigra (Bambu negro chico) | taxonomy | Phyllostachis nigra | Phyllostachys nigra | Nombre aceptado / corrección ortográfica (POWO) |
| Malus communis (Manzana, apple) | taxonomy | Malus communis | Malus domestica | Nombre aceptado / corrección ortográfica (POWO) |
| Xanthosoma saggitifolium (Macal, Tiquisque morado, Taioba, Hualuza) | taxonomy | Xanthosoma saggitifolium | Xanthosoma sagittifolium | Nombre aceptado / corrección ortográfica (POWO) |
| Citrullus lanatus (Sandia) | taxonomy.family | Cucurbitáceas | Cucurbitaceae | Familia aceptada (APG IV / POWO) |
| Artocarpus heterophylus (Yaca, jack, nanka, panapen, jaca) | taxonomy | Artocarpus heterophylus | Artocarpus heterophyllus | Nombre aceptado / corrección ortográfica (POWO) |
| Cynara scolimus (Alcachofa) | taxonomy | Cynara scolimus | Cynara cardunculus var. scolymus | Nombre aceptado / corrección ortográfica (POWO) |
| Cinchona officinalis (Quina) | taxonomy.family | Rubiacea | Rubiaceae | Familia aceptada (APG IV / POWO) |
| Cymbopogon citratos (Zacate limon) | taxonomy | Cymbopogon citratos | Cymbopogon citratus | Nombre aceptado / corrección ortográfica (POWO) |
| Cucurbita ficifolia (Chilacayote) | taxonomy.family | Cucurbitáceas | Cucurbitaceae | Familia aceptada (APG IV / POWO) |
| Grevilea Robusta (Grevilea, grevilia, bredil) | taxonomy | Grevilea Robusta | Grevillea robusta | Nombre aceptado / corrección ortográfica (POWO) |
| Malphigia emarginata (Cerecita, manzanita, semeruco, acerola) | taxonomy | Malphigia emarginata | Malpighia emarginata | Nombre aceptado / corrección ortográfica (POWO) |
| Malphigia emarginata (Cerecita, manzanita, semeruco, acerola) | taxonomy.family | Malphigiaceae | Malpighiaceae | Familia aceptada (APG IV / POWO) |
| Hovenia dulcis (Arbol de las pasas, uva do japao) | taxonomy.family | Fabaceae | Rhamnaceae | Familia aceptada (APG IV / POWO) |
| Scheelea princeps (Motacu) | taxonomy | Scheelea princeps | Attalea princeps | Nombre aceptado / corrección ortográfica (POWO) |
| Scheelea princeps (Motacu) | taxonomy.family | Arecacea | Arecaceae | Familia aceptada (APG IV / POWO) |
| Sesamum+C13 indicum (Ajonjoli) | taxonomy | Sesamum+C13 indicum | Sesamum indicum | Nombre aceptado / corrección ortográfica (POWO) |
| Araucaria bidwilli (Araucaria australiana) | taxonomy | Araucaria bidwilli | Araucaria bidwillii | Nombre aceptado / corrección ortográfica (POWO) |
| Cucurbita moschata (Calabaza melona) | taxonomy.family | Cucurbitáceas | Cucurbitaceae | Familia aceptada (APG IV / POWO) |
| Gallesia integrifolia (Palo de ajo, Ajo ajo (arbol)) | taxonomy.family | Phytolaccaceae | Petiveriaceae | Familia aceptada (APG IV / POWO) |
| Desmodium arbicularis (Engordacabras) | taxonomy | Desmodium arbicularis | Desmodium orbiculare | Nombre aceptado / corrección ortográfica (POWO) |
| Desmodium arbicularis (Engordacabras) | ecologicalZoneIds | ["6", "6"] | ["6"] | Id duplicado |
| Portulaca oleraceae (Verdolaga) | taxonomy | Portulaca oleraceae | Portulaca oleracea | Nombre aceptado / corrección ortográfica (POWO) |
| Uncari tomentosa (Uña de gato) | taxonomy | Uncari tomentosa | Uncaria tomentosa | Nombre aceptado / corrección ortográfica (POWO) |
| Uncari tomentosa (Uña de gato) | taxonomy.family | Rubiacea | Rubiaceae | Familia aceptada (APG IV / POWO) |
| Sambucus mexicana (Sauco) | taxonomy | Sambucus mexicana | Sambucus canadensis | Nombre aceptado / corrección ortográfica (POWO) |
| Sambucus mexicana (Sauco) | taxonomy.family | Adoxaceae | Viburnaceae | Familia aceptada (APG IV / POWO) |
| Zea mais (Maiz) | taxonomy | Zea mais | Zea mays | Nombre aceptado / corrección ortográfica (POWO) |
| Dalbergia paloescrito (Dalbergia) | taxonomy | Dalbergia paloescrito | Dalbergia palo-escrito | Nombre aceptado / corrección ortográfica (POWO) |
| Vainilla planiflora (Vainilla) | taxonomy | Vainilla planiflora | Vanilla planifolia | Nombre aceptado / corrección ortográfica (POWO) |
| Albizzia procera (Siri blanco) | taxonomy | Albizzia procera | Albizia procera | Nombre aceptado / corrección ortográfica (POWO) |
| Citrus mitis (Limon calamondin) | taxonomy | Citrus mitis | Citrus × microcarpa | Nombre aceptado / corrección ortográfica (POWO) |
| Chamaecytisus palmensis (Tagasaste) | taxonomy.family | fabaceae | Fabaceae | Familia aceptada (APG IV / POWO) |
| Chamaecytisus palmensis (Tagasaste) | ecologicalZoneIds | ["4", "6", "6"] | ["4", "6"] | Id duplicado |
| Fraxinus uhedi (Fresno) | taxonomy | Fraxinus uhedi | Fraxinus uhdei | Nombre aceptado / corrección ortográfica (POWO) |
| Fraxinus uhedi (Fresno) | taxonomy.family | Olaceae | Oleaceae | Familia aceptada (APG IV / POWO) |
| Genipa americana (Manzana del monte) | taxonomy.family | Rubiacea | Rubiaceae | Familia aceptada (APG IV / POWO) |
| Vigna ungiculata (Frijol vara) | taxonomy | Vigna ungiculata | Vigna unguiculata | Nombre aceptado / corrección ortográfica (POWO) |
| Mahonia aquifolium (Mahonia) | taxonomy | Mahonia aquifolium | Berberis aquifolium | Nombre aceptado / corrección ortográfica (POWO) |
| Sauropus androgynus (Katuk) | taxonomy | Sauropus androgynus | Breynia androgyna | Nombre aceptado / corrección ortográfica (POWO) |
| Sauropus androgynus (Katuk) | taxonomy.family | Euphorbiaceae | Phyllanthaceae | Familia aceptada (APG IV / POWO) |
| Astrocaryum murumuru (Murumuru) | taxonomy.family | Palmae | Arecaceae | Familia aceptada (APG IV / POWO) |
| Sorghum spp. (Sorgo) | ecologicalZoneIds | ["1", "3", "6", "6"] | ["1", "3", "6"] | Id duplicado |
| Crisobalamus icacus (Icaco) | taxonomy | Crisobalamus icacus | Chrysobalanus icaco | Nombre aceptado / corrección ortográfica (POWO) |
| Cucurbita foetidisima (Calabacilla) | taxonomy | Cucurbita foetidisima | Cucurbita foetidissima | Nombre aceptado / corrección ortográfica (POWO) |
| Cucurbita foetidisima (Calabacilla) | taxonomy.family | Cucurbitáceas | Cucurbitaceae | Familia aceptada (APG IV / POWO) |
| Sacharum oficinarum (Caña de azucar) | taxonomy | Sacharum oficinarum | Saccharum officinarum | Nombre aceptado / corrección ortográfica (POWO) |
| Carya illinoensis (Nogal pecanero, pecan nut, Nuez de la isla, nuez encarcelada, walnut pecan) | taxonomy | Carya illinoensis | Carya illinoinensis | Nombre aceptado / corrección ortográfica (POWO) |
| Carya illinoensis (Nogal pecanero, pecan nut, Nuez de la isla, nuez encarcelada, walnut pecan) | taxonomy.family | Junglandaceae | Juglandaceae | Familia aceptada (APG IV / POWO) |
| Mammea americana (Mamey) | taxonomy.family | Guttiferáceas | Calophyllaceae | Familia aceptada (APG IV / POWO) |
| Hibiscus rosasinensis (Tulipancillo) | taxonomy | Hibiscus rosasinensis | Hibiscus rosa-sinensis | Nombre aceptado / corrección ortográfica (POWO) |
| Yucca elephantipes? (Izote) | taxonomy | Yucca elephantipes? | Yucca gigantea | Nombre aceptado / corrección ortográfica (POWO) |
| Chenopodium ambrosioides (Epazote) | taxonomy | Chenopodium ambrosioides | Dysphania ambrosioides | Nombre aceptado / corrección ortográfica (POWO) |
| Inga oesterdiana (Chalahuite) | taxonomy | Inga oesterdiana | Inga oerstediana | Nombre aceptado / corrección ortográfica (POWO) |
| Glicine max (Soya) | taxonomy | Glicine max | Glycine max | Nombre aceptado / corrección ortográfica (POWO) |
| Glicine max (Soya) | taxonomy.family | fabaceae | Fabaceae | Familia aceptada (APG IV / POWO) |
| Manguifera indica (Mango) | taxonomy | Manguifera indica | Mangifera indica | Nombre aceptado / corrección ortográfica (POWO) |
| Arundo Donax (Carrizo) | taxonomy | Arundo Donax | Arundo donax | Nombre aceptado / corrección ortográfica (POWO) |
| Arundo Donax (Carrizo) | ecologicalZoneIds | ["4", "6", "6"] | ["4", "6"] | Id duplicado |
| Crotolaria longirostrata (Chipilin) | taxonomy | Crotolaria longirostrata | Crotalaria longirostrata | Nombre aceptado / corrección ortográfica (POWO) |
| Diospyros digyna (Zapote negro) | taxonomy.family | Ebanáceas | Ebenaceae | Familia aceptada (APG IV / POWO) |
| Phyllostachis edulis (Bambu moso) | taxonomy | Phyllostachis edulis | Phyllostachys edulis | Nombre aceptado / corrección ortográfica (POWO) |
| Cyphomandra betacea (Tomate de Arbol, berenjenilla) | taxonomy | Cyphomandra betacea | Solanum betaceum | Nombre aceptado / corrección ortográfica (POWO) |
| Helianthus tuberosa (Alcachofa jerusalmem, tupinambur) | taxonomy | Helianthus tuberosa | Helianthus tuberosus | Nombre aceptado / corrección ortográfica (POWO) |
| Cucurbita sp. (Calabaza) | taxonomy.family | Cucurbitáceas | Cucurbitaceae | Familia aceptada (APG IV / POWO) |
| Atractocarous fitzalanni (Gardeña o orange randia, yellow mangosteen) | taxonomy | Atractocarous fitzalanni | Atractocarpus fitzalanii | Nombre aceptado / corrección ortográfica (POWO) |
| Vigna umbelata (Frijol arroz) | taxonomy | Vigna umbelata | Vigna umbellata | Nombre aceptado / corrección ortográfica (POWO) |
| Hibiscus esculentus (Ocra) | taxonomy | Hibiscus esculentus | Abelmoschus esculentus | Nombre aceptado / corrección ortográfica (POWO) |

### Omitidas (pertenecen a grupos dudosos sin especie definida)

- Musa sp. (banana bread): Musa sp. genérico (grupo dudoso)
- Musa sp. (Guineo): Musa sp. genérico (grupo dudoso)
- Musa sp. (bananas silver, bread, tropical apple): Musa sp. genérico (grupo dudoso)
- Garcinia sp. (Mangostan amarillo, mangostao amarelo): Garcinia sp. (grupo dudoso)
- Garcinia sp. (Bacupari, bacupari miudo): Garcinia sp. (grupo dudoso)
- Amaranthus sp. (Quelites): Amaranthus sp. (grupo dudoso)
- Pirus sp. (Pera): Pirus sp. (grupo dudoso)
- Morus sp (Morera): Morus sp. (grupo dudoso)
- Vaccinium sp. (Arandano): Vaccinium sp. (grupo dudoso)
- Selaginella sp. (Doradilla): Selaginella sp. (grupo dudoso)

## Tercera pasada: grupos dudosos y errores evidentes (2026-10-14)

La pasada 2 se aplicó en Firestore el 2026-10-14 (217 escrituras correctas).

Decisiones del responsable sobre los grupos dudosos, en `scripts/species-cleanup/changes-pass3.json`. El registro que se conserva hereda nombres comunes y los campos que le faltaban. Los registros de *Musa* se conservan por cultivar; sólo se eliminaron los genéricos que mezclaban varios cultivares. También se corrigen valores evidentemente erróneos (alturas imposibles, formas incorrectas) y los rangos con mínimo igual a máximo se convierten en rangos típicos, ampliados para incluir siempre el valor original.

| Tipo | Registro | Resultado | Motivo |
| --- | --- | --- | --- |
| fusión | Persea schiedeana (Chinene, Chinini, Anayo, Pahua) | Persea schiedeana (Anayo, aguacate criollo, Chinene, Chinini, Pahua) | Misma especie; Chinene/Chinini/Pahua son nombres comunes de P. schiedeana |
| fusión | Phaseolus lunatus (Frijol ibes) | Phaseolus lunatus (Frijol lima, fríjol mantequilla) | Ibes es el nombre maya del frijol lima |
| fusión | Malpighia glabra (Acerola) | Malpighia emarginata (Cerecita, manzanita, semeruco, acerola) | La acerola cultivada es M. emarginata |
| fusión | Garcinia sp. (Bacupari, bacupari miudo) | Garcinia gardneriana (Bacupari, bacupari-acu) | Decisión del responsable: un solo registro de bacupari |
| fusión | Garcinia sp. (Mangostan amarillo, mangostao amarelo) | Garcinia gardneriana (Bacupari, bacupari-acu) | Decisión del responsable: un solo registro de bacupari |
| fusión | Opuntia sp. (Nopal de tuna) | Opuntia ficus-indica (Tuna, Nopal, Nopal tunero) | El nopal de tuna es Opuntia ficus-indica |
| fusión | Opuntia ficus-indica (Nopal) | Opuntia ficus-indica (Tuna, Nopal, Nopal tunero) | Mismo taxón (O. ficus-indica); nopal y tuna son la misma planta |
| fusión | Agave sp. (Agave) | Agave sp (Maguey) | Dos registros genéricos de Agave con datos casi idénticos |
| fusión | Vaccinium sp. (Arandano) | Vaccinium corymbosum (Mora azul) | Mora azul y arándano designan al arándano azul |
| fusión | Morus sp (Morera) | Morus alba (Morera para hoja, blacberry (silkworm)) | Decisión del responsable: Morus sp. es Morus alba |
| corrección | Selaginella sp. (Doradilla) | Selaginella lepidophylla; función Maderable → Medicinal | La doradilla de México es S. lepidophylla (planta de resurrección, uso medicinal) |
| corrección | Pirus sp. (Pera) | Pyrus sp. | Ortografía del género |
| fusión | Musa sp. (Guineo) | Musa acuminata (platano malayo, platano rojo, banana nanica) | Guineo es el nombre genérico del banano de postre (M. acuminata) |
| fusión | Musa sp. (bananas silver, bread, tropical apple) | repartido entre Plateado, Manzano y banana bread | Registro que mezclaba tres cultivares |
| corrección | Musa acuminata (plátano malayo, rojo, nanica) | "plátano rojo" → cv. Morado; "banana nanica" → cv. Enano | Cada nombre pertenece a un cultivar que ya tiene su registro |
| corrección | Prunus sp. (Albaricoque japonés, ciruela china, japanese plum) | Prunus mume; se quitan "ciruela china" y "japanese plum" (son P. salicina) | Decisión del responsable |
| corrección | Trifolium repens (Trebol blanco) | height: 10–10 → 0.1–0.3 | Altura de 10 m imposible para un trébol (probable error de unidades) |
| corrección | Desmodium spp. (Pega pega) | height: 40–40 → 0.3–1.5 | Altura de 40 m imposible para Desmodium (probable error de unidades) |
| corrección | Morus alba (Morera para hoja, blacberry (silkworm)) | height: 2–2 → 5–15 | Morus alba es árbol de 5–15 m |
| corrección | Morus alba (Morera para hoja, blacberry (silkworm)) | crownWidth: 1–1 → 4–8 | Copa típica de árbol adulto |
| corrección | Morus alba (Morera para hoja, blacberry (silkworm)) | forma: hierba → árbol | Es un árbol |
| corrección | Sambucus canadensis (Sauco) | forma: hierba → arbusto | Es un arbusto |
| corrección | Citrus aurantium (Limon canario, limon criollo) | height: 4 → 3–6 | Valor único convertido al rango típico |
| corrección | Salvia rosmarinus (Romero) | height: 1.5 → 0.5–1.5 | Valor único convertido al rango típico |
| corrección | Salvia rosmarinus (Romero) | crownWidth: 1.5 → 0.6–1.5 | Valor único convertido al rango típico |
| corrección | Dimocarpus longan (Longan, Ojo de dragón) | height: 5.5–5.5 → 5.5–12 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Dimocarpus longan (Longan, Ojo de dragón) | crownWidth: 5 → 5–8 | Valor único convertido al rango típico |
| corrección | Rumex mexicanus (Lengua de Vaca) | height: 0.4 → 0.4–1 | Valor único convertido al rango típico |
| corrección | Rumex mexicanus (Lengua de Vaca) | crownWidth: 0.6 → 0.3–0.6 | Valor único convertido al rango típico |
| corrección | Maranta arundinacea (Sagu) | height: 0.7 → 0.7–1.5 | Valor único convertido al rango típico |
| corrección | Maranta arundinacea (Sagu) | crownWidth: 0.5 → 0.5–0.8 | Valor único convertido al rango típico |
| corrección | Piper auritum (Acuyo) | height: 2 → 2–5 | Valor único convertido al rango típico |
| corrección | Piper auritum (Acuyo) | crownWidth: 1.5 → 1.5–3 | Valor único convertido al rango típico |
| corrección | Phoenix dactylifera (Datil) | height: 30 → 15–30 | Valor único convertido al rango típico |
| corrección | Phoenix dactylifera (Datil) | crownWidth: 12–12 → 6–12 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Solanum nigrum (Hierba mora) | height: 0.6 → 0.3–0.8 | Valor único convertido al rango típico |
| corrección | Solanum nigrum (Hierba mora) | crownWidth: 0.6 → 0.3–0.6 | Valor único convertido al rango típico |
| corrección | Salvia officinalis (Salvia) | height: 1.5–1.5 → 0.5–1.5 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Salvia officinalis (Salvia) | crownWidth: 2–2 → 0.6–2 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Dioscorea bulbifera (Papa Voladora) | height: 13 → 6–13 | Valor único convertido al rango típico |
| corrección | Vigna unguiculata subsp. sesquipedalis (Ejote Cubano) | height: 2.5 → 2–4 | Valor único convertido al rango típico |
| corrección | Citrus reticulata (Mandarina) | height: 4 → 2–6 | Valor único convertido al rango típico |
| corrección | Citrus reticulata (Mandarina) | crownWidth: 3.6 → 2–4 | Valor único convertido al rango típico |
| corrección | Phyllostachys aurea (Bambu dorado) | height: 9 → 4–9 | Valor único convertido al rango típico |
| corrección | Phyllostachys aurea (Bambu dorado) | crownWidth: 2 → 1–2 | Valor único convertido al rango típico |
| corrección | Morus nigra (Morera negra) | height: 9 → 6–10 | Valor único convertido al rango típico |
| corrección | Solanum quitoense (Lulo) | height: 2 → 1–2.5 | Valor único convertido al rango típico |
| corrección | Solanum quitoense (Lulo) | crownWidth: 1.5 → 1.5–2 | Valor único convertido al rango típico |
| corrección | Phyllostachys nigra (Bambu negro chico) | height: 8 → 4–8 | Valor único convertido al rango típico |
| corrección | Phyllostachys nigra (Bambu negro chico) | crownWidth: 2 → 1–2 | Valor único convertido al rango típico |
| corrección | Malus domestica (Manzana, apple) | height: 4 → 3–8 | Valor único convertido al rango típico |
| corrección | Malus domestica (Manzana, apple) | crownWidth: 5 → 3–6 | Valor único convertido al rango típico |
| corrección | Carpobrotus acinaciformis (Flor del cuchillo, diente de dragón) | height: 0.2 → 0.1–0.2 | Valor único convertido al rango típico |
| corrección | Elettaria cardamomum (Cardamomo) | height: 2 → 2–4 | Valor único convertido al rango típico |
| corrección | Elettaria cardamomum (Cardamomo) | crownWidth: 2 → 1–2 | Valor único convertido al rango típico |
| corrección | Smallanthus sonchifolius (Yacon) | height: 1.5 → 1.5–2.5 | Valor único convertido al rango típico |
| corrección | Smallanthus sonchifolius (Yacon) | crownWidth: 0.6 → 0.6–1 | Valor único convertido al rango típico |
| corrección | Chamaedorea tepejilote (Tepejilote) | height: 2.5 → 2–5 | Valor único convertido al rango típico |
| corrección | Chamaedorea tepejilote (Tepejilote) | crownWidth: 1.5 → 1.5–2.5 | Valor único convertido al rango típico |
| corrección | Capsicum pubescens (Chile cera) | height: 2 → 1–2 | Valor único convertido al rango típico |
| corrección | Capsicum pubescens (Chile cera) | crownWidth: 2 → 1–2 | Valor único convertido al rango típico |
| corrección | Allium fistulosum (Cebolla Welsh) | height: 0.6 → 0.4–0.6 | Valor único convertido al rango típico |
| corrección | Allium fistulosum (Cebolla Welsh) | crownWidth: 0.5–0.5 → 0.2–0.5 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Cymbopogon citratus (Zacate limon) | height: 0.6 → 0.6–1.5 | Valor único convertido al rango típico |
| corrección | Cymbopogon citratus (Zacate limon) | crownWidth: 0.6 → 0.6–1 | Valor único convertido al rango típico |
| corrección | Moringa stenopetala (Moringa) | height: 4–4 → 4–10 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Allium sp. (Cebollino) | height: 0.2 → 0.2–0.4 | Valor único convertido al rango típico |
| corrección | Allium sp. (Cebollino) | crownWidth: 0.25 → 0.15–0.25 | Valor único convertido al rango típico |
| corrección | Pithecellobium dulce (Guamuchil) | height: 10 → 10–15 | Valor único convertido al rango típico |
| corrección | Pithecellobium dulce (Guamuchil) | crownWidth: 10 → 10–12 | Valor único convertido al rango típico |
| corrección | Urtica dioica (Ortiga) | height: 0.6 → 0.6–1.5 | Valor único convertido al rango típico |
| corrección | Urtica dioica (Ortiga) | crownWidth: 0.6 → 0.5–1 | Valor único convertido al rango típico |
| corrección | Asparagus officinalis (Esparrago) | height: 1 → 1–2 | Valor único convertido al rango típico |
| corrección | Asparagus officinalis (Esparrago) | crownWidth: 0.6 → 0.6–1 | Valor único convertido al rango típico |
| corrección | Citrus sinensis (Naranja) | height: 4–4 → 4–10 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Citrus sinensis (Naranja) | crownWidth: 5 → 4–6 | Valor único convertido al rango típico |
| corrección | Rubus idaeus (Frambuesa) | height: 1.2 → 1–2 | Valor único convertido al rango típico |
| corrección | Rubus idaeus (Frambuesa) | crownWidth: 1 → 0.5–1 | Valor único convertido al rango típico |
| corrección | Salix spp. (Sauce) | height: 4–4 → 4–20 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Salix spp. (Sauce) | crownWidth: 4 → 4–10 | Valor único convertido al rango típico |
| corrección | Wisteria sinensis (Glicinia) | height: 10 → 10–20 | Valor único convertido al rango típico |
| corrección | Ardisia compressa (Capulin de Mayo) | height: 1.5 → 1.5–6 | Valor único convertido al rango típico |
| corrección | Ardisia compressa (Capulin de Mayo) | crownWidth: 1.5 → 1.5–3 | Valor único convertido al rango típico |
| corrección | Musa paradisiaca (Platano) | height: 5 → 3–6 | Valor único convertido al rango típico |
| corrección | Musa paradisiaca (Platano) | crownWidth: 4 → 3–4 | Valor único convertido al rango típico |
| corrección | Sambucus canadensis (Sauco) | crownWidth: 1.5–1.5 → 1.5–4 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Phormium tenax (Fornio) | height: 2.5 → 1.5–3 | Valor único convertido al rango típico |
| corrección | Phormium tenax (Fornio) | crownWidth: 2.5 → 1.5–2.5 | Valor único convertido al rango típico |
| corrección | Casuarina decaisneana (Casuarina del desierto) | height: 15 → 10–15 | Valor único convertido al rango típico |
| corrección | Heliconia spp. (Platanillo, chilalaca) | height: 2.2 → 1.5–4 | Valor único convertido al rango típico |
| corrección | Heliconia spp. (Platanillo, chilalaca) | crownWidth: 1.5 → 1–2 | Valor único convertido al rango típico |
| corrección | Vitis vinifera (Uva, vid, parra) | height: 10 → 2–10 | Valor único convertido al rango típico |
| corrección | Annona cherimola (Chirimoya) | height: 4.2 → 4–8 | Valor único convertido al rango típico |
| corrección | Enset ventricosum (Enset) | height: 5 → 4–10 | Valor único convertido al rango típico |
| corrección | Enset ventricosum (Enset) | crownWidth: 5 → 3–5 | Valor único convertido al rango típico |
| corrección | Citrus × microcarpa (Limon calamondin) | height: 4 → 3–6 | Valor único convertido al rango típico |
| corrección | Citrus × microcarpa (Limon calamondin) | crownWidth: 3.5 → 2–4 | Valor único convertido al rango típico |
| corrección | Chamaecytisus palmensis (Tagasaste) | height: 5 → 3–6 | Valor único convertido al rango típico |
| corrección | Inga vera (Jinicuil) | height: 15 → 8–15 | Valor único convertido al rango típico |
| corrección | Inga vera (Jinicuil) | crownWidth: 8 → 8–12 | Valor único convertido al rango típico |
| corrección | Sapindus saponaria (Jaboncillo, Sululo, pipe, kile) | crownWidth: 6 → 6–10 | Valor único convertido al rango típico |
| corrección | Berberis aquifolium (Mahonia) | height: 0.8–0.8 → 0.8–2 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Berberis aquifolium (Mahonia) | crownWidth: 0.5–0.5 → 0.5–1.5 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Aloe vera (Sabila, savila) | height: 0.5 → 0.5–0.8 | Valor único convertido al rango típico |
| corrección | Aloe vera (Sabila, savila) | crownWidth: 0.5 → 0.5–0.8 | Valor único convertido al rango típico |
| corrección | Chrysobalanus icaco (Icaco) | height: 3 → 1–5 | Valor único convertido al rango típico |
| corrección | Erythrina edulis (Chachafruto) | height: 8 → 6–14 | Valor único convertido al rango típico |
| corrección | Erythrina edulis (Chachafruto) | crownWidth: 6 → 5–8 | Valor único convertido al rango típico |
| corrección | Zingiber officinale (Jengibre) | crownWidth: 0.4 → 0.3–0.5 | Valor único convertido al rango típico |
| corrección | Saccharum officinarum (Caña de azucar) | height: 3 → 3–5 | Valor único convertido al rango típico |
| corrección | Carya illinoinensis (Nogal pecanero, pecan nut, Nuez de la isla, nuez encarcelada, walnut pecan) | height: 10–10 → 10–40 | Valor único convertido a rango (se amplía para incluir el valor original) |
| corrección | Carya illinoinensis (Nogal pecanero, pecan nut, Nuez de la isla, nuez encarcelada, walnut pecan) | crownWidth: 10 → 10–20 | Valor único convertido al rango típico |
| corrección | Casimiroa edulis (Zapote blanco) | height: 8 → 8–15 | Valor único convertido al rango típico |
| corrección | Casimiroa edulis (Zapote blanco) | crownWidth: 5 → 5–8 | Valor único convertido al rango típico |
| corrección | Dysphania ambrosioides (Epazote) | height: 0.7 → 0.4–1.2 | Valor único convertido al rango típico |
| corrección | Dysphania ambrosioides (Epazote) | crownWidth: 0.6 → 0.3–0.6 | Valor único convertido al rango típico |
| corrección | Curcuma longa (Curcuma) | height: 1.3 → 0.6–1.3 | Valor único convertido al rango típico |
| corrección | Curcuma longa (Curcuma) | crownWidth: 1 → 0.5–1 | Valor único convertido al rango típico |
| corrección | Sechium edule (Chayote, pataste) | height: 10 → 5–10 | Valor único convertido al rango típico |
| corrección | Rumex acetosa (Sorrel) | crownWidth: 0.5 → 0.3–0.5 | Valor único convertido al rango típico |
| corrección | Anacardium occidentale (Marañon, cayu) | crownWidth: 8 → 8–12 | Valor único convertido al rango típico |
| corrección | Vaccinium corymbosum (Mora azul) | crownWidth: 1.5 → 1–1.5 | Valor único convertido al rango típico |
| corrección | Artocarpus altilis (Arbol del pan, frutipan, breadfruit, pan de fruta) | crownWidth: 9 → 9–12 | Valor único convertido al rango típico |
| corrección | Erythrina americana (Colorin) | crownWidth: 6 → 6–8 | Valor único convertido al rango típico |
| corrección | Annona diversifolia (Ilama) | height: 8 → 6–10 | Valor único convertido al rango típico |
| corrección | Annona diversifolia (Ilama) | crownWidth: 7 → 5–7 | Valor único convertido al rango típico |
| corrección | Equisetum arvense (Cola de caballo, equiseto) | crownWidth: 0.4 → 0.3–0.5 | Valor único convertido al rango típico |
| corrección | Argania spinosa (Argan) | height: 8 → 8–10 | Valor único convertido al rango típico |
| corrección | Argania spinosa (Argan) | crownWidth: 5 → 5–8 | Valor único convertido al rango típico |
| corrección | Rubus fruticosus (Zarzamora) | height: 1.5 → 1–3 | Valor único convertido al rango típico |
| corrección | Rubus fruticosus (Zarzamora) | crownWidth: 1 → 1–2 | Valor único convertido al rango típico |

Se conservan separados por decisión del responsable: *Amaranthus hypochondriacus* (Amaranto, grano) y *Amaranthus* sp. (Quelites, verdura); *Pyrus communis* (Perón) y *Pyrus* sp. (Pera); *Selaginella martensii* y *S. lepidophylla*. Los registros 'babosa', 'Caferana', 'Cosamalu', 'Huevo de chivo' y 'Menta de matón' ya habían sido eliminados desde el panel de admin.

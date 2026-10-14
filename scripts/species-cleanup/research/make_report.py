"""Genera el .md de resumen a partir de report.json y changes.json."""
import json, os, sys

D = os.path.dirname(os.path.abspath(__file__))
r = json.load(open(os.path.join(D, 'report.json')))
ch = json.load(open(os.path.join(D, 'changes.json')))
out_md, out_changes = sys.argv[1], sys.argv[2]
json.dump(ch, open(out_changes, 'w'), ensure_ascii=False, indent=1)

LABEL = {'taxonomy': 'taxonomía', 'commonNames': 'nombres comunes', 'stratums': 'estrato', 'ecologicalZones': 'zonas', 'ecologicalFunctions': 'funciones ecológicas',
         'additionalFunctions': 'funciones adicionales', 'height': 'altura', 'crownWidth': 'ancho de copa', 'details': 'detalles'}
res, names, old = r['results'], r['names'], r['oldNames']
removed = {d['id'] for d in ch['deletes']}
esc = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
upd = {u['id']: u for u in ch['updates']}
L = []
w = L.append
w('# Limpieza y enriquecimiento del catálogo de especies')
w('')
w(f"Generado: {r['generatedAt']} · Catálogo analizado: **{r['total']} especies** (colección `species` de Firestore).")
w('')
w('> **Estado: parcial.** La investigación en línea tiene un límite de búsquedas por turno; en esta pasada se verificaron '
  f"**{len(res)} de {r['total']}** especies. Las **{len(r['missingResults'])}** restantes quedan como *pendientes de investigar* "
  '(listadas abajo) y se completarán en una siguiente pasada. Nada se ha escrito todavía en Firestore.')
w('')
w('## Resumen')
w('')
nf = [i for i, x in res.items() if x['status'] == 'not_found']
w('| Concepto | Cantidad |')
w('| --- | --- |')
w(f"| Especies con cambios a aplicar | {len(ch['updates'])} |")
w(f"| Registros duplicados a eliminar (fusionados) | {len(ch['deletes'])} |")
w(f"| Especies investigadas sin información confiable (sin cambios) | {len(nf)} |")
w(f"| Especies pendientes de investigar | {len(r['missingResults'])} |")
w(f"| Grupos que parecen duplicados pero son variedades/especies distintas | {len(r['notDuplicates'])} |")
w(f"| Grupos dudosos que requieren revisión humana | {len(r['uncertain'])} |")
w('')
w('## Cómo aplicar los cambios')
w('')
w('Los cambios están en `scripts/species-cleanup/changes.json`. Para aplicarlos (requiere una cuenta registrada en la colección `admins`):')
w('')
w('```bash')
w('# 1. Simulación: muestra qué se cambiaría, no escribe nada')
w('node scripts/species-cleanup/apply-species-cleanup.mjs')
w('# 2. Aplicar (guarda un respaldo de cada documento antes de escribir)')
w('ADMIN_EMAIL=tu@correo ADMIN_PASSWORD=... node scripts/species-cleanup/apply-species-cleanup.mjs --apply')
w('```')
w('')
w('El script omite cualquier especie que haya sido editada después de generar este archivo (precondición `updateTime`), para no pisar cambios hechos desde el panel de admin.')
w('')
w('Criterios usados: sólo se llenan campos vacíos; un valor existente sólo se cambia si hay una corrección documentada con fuente (listadas abajo). '
  'Los estratos, zonas y funciones usan exclusivamente los ids de los catálogos existentes. Los rangos de altura y copa son tamaños típicos de la planta adulta en cultivo.')
w('')
w('## Duplicados fusionados')
w('')
w('El registro que se conserva hereda los datos que le faltaban del registro eliminado (nombres comunes, zonas, funciones, estrato, medidas y detalles).')
w('')
w('| Se conserva | Se elimina | Motivo |')
w('| --- | --- | --- |')
for m in r['merges']:
    w(f"| {esc(names[m['keep']])} | {esc('; '.join(old[x] for x in m['remove']))} | {esc(m['reason'])} |")
w('')
w('### Parecen duplicados pero no lo son (se conservan separados)')
w('')
for g in r['notDuplicates']:
    labels = g.get('subspeciesLabels') or {}
    extra = (' Variedad registrada en taxonomía: ' + ', '.join(f'{old[i]} → *{v}*' for i, v in labels.items() if i in old) + '.') if labels else ''
    w(f"- **{esc(g['names'])}**: {esc(g['reason'])}{esc(extra)}")
w('')
w('### Dudosos: requieren revisión humana (no se tocaron)')
w('')
for g in r['uncertain']:
    w(f"- **{esc(g['names'])}**: {esc(g['reason'])}")
w('')
w('## Especies actualizadas')
w('')
w('| Especie | Campos completados/corregidos | Confianza | Notas |')
w('| --- | --- | --- | --- |')
for i in sorted(upd, key=lambda x: names[x].lower()):
    x = res.get(i, {})
    fields = ', '.join(LABEL.get(f, f) for f in upd[i]['fields'])
    note = x.get('notes', '') if x else 'Sólo por fusión de duplicados o etiqueta de variedad.'
    w(f"| {esc(names[i])} | {fields} | {x.get('confidence', '—')} | {esc(note)} |")
w('')
w('## Correcciones de datos existentes (valor anterior → nuevo)')
w('')
w('| Especie | Campo | Antes | Después | Motivo | Fuente |')
w('| --- | --- | --- | --- | --- | --- |')
for i in sorted(res, key=lambda x: names[x].lower()):
    if i in removed or i not in upd: continue
    for c in res[i].get('corrections', []):
        src = c.get('source') or ''
        src = f'[enlace]({src})' if src.startswith('http') else esc(src)
        w(f"| {esc(names[i])} | {esc(c.get('field'))} | {esc(json.dumps(c.get('old'), ensure_ascii=False))} | {esc(json.dumps(c.get('new'), ensure_ascii=False))} | {esc(c.get('reason', ''))} | {src} |")
w('')
w('## Especies sin información confiable (se dejaron sin cambios)')
w('')
for i in sorted(nf, key=lambda x: names[x].lower()):
    w(f"- **{esc(names[i])}** (`{i}`): {esc(res[i].get('notes', ''))}")
w('')
if r['rejected']:
    w('## Propuestas descartadas por la validación automática')
    w('')
    for x in r['rejected']:
        w(f"- {esc(x.get('name', x.get('id')))} — `{x.get('field', '')}`: {esc(x['reason'])} (propuesto: {esc(json.dumps(x.get('value'), ensure_ascii=False))}, actual: {esc(json.dumps(x.get('old'), ensure_ascii=False))})")
    w('')
w('## Pendientes de investigar')
w('')
w('Estas especies no se alcanzaron a revisar en esta pasada (límite de búsquedas); no significa que no haya información.')
w('')
pend = [i for i in r['missingResults'] if i not in removed]
w(', '.join(sorted(esc(old[i]) for i in pend)))
w('')
w('## Fuentes')
w('')
w('Cada especie se investigó con fuentes como POWO (Kew), Tropicos, GBIF, CONABIO/Enciclovida, World Agroforestry (ICRAF), Useful Tropical Plants, PFAF, Feedipedia, CABI y guías de extensión. '
  'Las URL consultadas por especie están en `scripts/species-cleanup/sources.json`.')
open(out_md, 'w').write('\n'.join(L) + '\n')
json.dump({i: {'name': names[i], 'sources': res[i].get('sources', [])} for i in res}, open(os.path.join(os.path.dirname(out_changes), 'sources.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(L))

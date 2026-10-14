"""Combina results/batch_*.json + results/duplicates.json con un volcado fresco de
Firestore y genera changes.json (para apply-species-cleanup.mjs) y report.json
(insumo para el .md). Valida cada valor propuesto; lo inválido se descarta y se
reporta."""
import copy, glob, json, os, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

D = os.path.dirname(os.path.abspath(__file__))
P = os.environ['NEXT_PUBLIC_FIREBASE_PROJECT_ID']; K = os.environ['NEXT_PUBLIC_FIREBASE_API_KEY']

def conv(v):
    t, x = next(iter(v.items()))
    if t == 'mapValue': return {k: conv(w) for k, w in x.get('fields', {}).items()}
    if t == 'arrayValue': return [conv(w) for w in x.get('values', [])]
    if t == 'integerValue': return int(x)
    if t == 'nullValue': return None
    return x

def dump():
    out, tok = {}, None
    while True:
        q = {'pageSize': 300, 'key': K}
        if tok: q['pageToken'] = tok
        d = json.load(urllib.request.urlopen(f"https://firestore.googleapis.com/v1/projects/{P}/databases/(default)/documents/species?" + urllib.parse.urlencode(q)))
        for doc in d.get('documents', []):
            i = doc['name'].split('/')[-1]
            out[i] = {'data': {k: conv(v) for k, v in doc.get('fields', {}).items()}, 'updateTime': doc['updateTime']}
        tok = d.get('nextPageToken')
        if not tok: return out

cat = lambda f: {x['__id']: x['name']['es_mx'] for x in json.load(open(os.path.join(D, f)))}
STRATA, ECO, ADD = cat('stratums.json'), cat('ecologicalFunctions.json'), cat('additionalFunctions.json')
ZONES = {'1': 'Selva húmeda', '3': 'Bosque de niebla', '4': 'Bosque de pino y encino', '6': 'Desierto'}
LEVEL = {'H', 'M', 'L'}
SHAPES = {'árbol', 'arbusto', 'hierba', 'guía', 'palma', 'bambú', 'pasto', 'falsa trepadora', 'epífita'}
LIFE = {'Pioneras', 'Secundarias 1', 'Secundarias 2', 'Secundarias 3', 'Primarias'}
DURATION = {'Varios meses', 'Hasta 2 años', 'Hasta 15 años', 'Hasta 80 años', 'Mayor a 80 años'}
HRD = {'coberturas y rastreras', 'hasta 2 mts', 'hasta 5 mts', 'de 5 a 10 mts', 'más de 10 mts', 'enredaderas y trepadoras'}
# Nombre aceptado para el registro que se conserva en fusiones donde éste tenía
# el sinónimo o la errata (según results/duplicates.json, verificado en POWO).
KEEP_TAXONOMY = {
    'Carissa grandiflora': {'genus': 'Carissa', 'species': 'macrocarpa', 'family': 'Apocynaceae'},
    'Cardulobica palmata': {'genus': 'Carludovica', 'species': 'palmata', 'family': 'Cyclanthaceae'},
    'Cinnamomum zeylanicum': {'genus': 'Cinnamomum', 'species': 'verum', 'family': 'Lauraceae'},
    'Cydonia vulgaris': {'genus': 'Cydonia', 'species': 'oblonga', 'family': 'Rosaceae'},
    'Pouteri zapota': {'genus': 'Pouteria', 'species': 'sapota', 'family': 'Sapotaceae'},
    'Zyzxgium malaccense': {'genus': 'Syzygium', 'species': 'malaccense', 'family': 'Myrtaceae'},
    'Citrus latifolia': {'genus': 'Citrus', 'species': '× latifolia', 'family': 'Rutaceae'},
}
ARRAYS = {'stratumIds': ('stratums', STRATA), 'ecologicalFunctionIds': ('ecologicalFunctions', ECO), 'additionalFunctionIds': ('additionalFunctions', ADD), 'ecologicalZoneIds': (None, ZONES)}

def name_of(data):
    t = data.get('taxonomy', {}); cn = (data.get('commonNames', {}) or {}).get('es_mx', [])
    sci = f"{t.get('genus', '')} {t.get('species', '')}".strip(' -') or '(sin nombre científico)'
    return f"{sci}" + (f" ({cn[0]})" if cn else '')

def empty(v):
    if isinstance(v, str) and v.strip() in ('', '-'): return True
    return v in (None, '', [], {}) or (isinstance(v, dict) and set(v) == {'min', 'max'} and not v.get('min') and not v.get('max'))

def get_path(data, key):
    if key in ARRAYS:
        field, _ = ARRAYS[key]
        arr = data.get('ecologicalZones', {}).get('mx', []) if key == 'ecologicalZoneIds' else data.get(field, [])
        return [str(x['_id']) for x in arr or []]
    if key == 'commonNames': return (data.get('commonNames') or {}).get('es_mx', [])
    cur = data
    for p in key.split('.'):
        if not isinstance(cur, dict): return None
        cur = cur.get(p)
    return cur

def set_path(data, key, value):
    if key in ARRAYS:
        field, names = ARRAYS[key]
        objs = [{'_id': i, 'name': {'es_mx': names[i]}} for i in value]
        if key == 'ecologicalZoneIds': data.setdefault('ecologicalZones', {})['mx'] = objs
        else: data[field] = objs
        return field or 'ecologicalZones'
    if key == 'commonNames':
        data['commonNames'] = {'es_mx': value}; return 'commonNames'
    parts = key.split('.'); cur = data
    for p in parts[:-1]:
        if not isinstance(cur.get(p), dict): cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value
    return parts[0]

def validate(key, v):
    if key in ARRAYS:
        names = ARRAYS[key][1]
        return isinstance(v, list) and all(isinstance(i, str) and i in names for i in v) and len(set(v)) == len(v)
    if key == 'commonNames': return isinstance(v, list) and v and all(isinstance(s, str) and s.strip() for s in v)
    if key in ('height', 'crownWidth'):
        return isinstance(v, dict) and set(v) == {'min', 'max'} and all(isinstance(v[k], (int, float)) and not isinstance(v[k], bool) for k in v) and 0 < v['min'] <= v['max'] <= 120
    if key in ('details.lightPreference', 'details.humidityPreference', 'details.nutrientExtraction'): return v in LEVEL
    if key == 'details.isFrostResistant': return isinstance(v, bool)
    if key == 'details.shape': return v in SHAPES
    if key == 'details.lifeCycle': return v in LIFE
    if key == 'details.lifeCycleDuration': return v in DURATION
    if key == 'details.heightRangeDescription': return v in HRD
    if key in ('taxonomy.genus', 'taxonomy.species', 'taxonomy.family', 'taxonomy.subspecies', 'taxonomy.synonyms'): return isinstance(v, str) and 0 < len(v.strip()) <= 200
    return False

def main():
    db = dump()
    results = {}
    for f in sorted(glob.glob(os.path.join(D, 'results', 'batch_*.json'))):
        for r in json.load(open(f)): results[r['id']] = r
    dups = json.load(open(os.path.join(D, 'results', 'duplicates.json'))) if os.path.exists(os.path.join(D, 'results', 'duplicates.json')) else {'merges': [], 'notDuplicates': [], 'uncertain': []}

    new = {i: copy.deepcopy(d['data']) for i, d in db.items()}
    touched = {i: set() for i in db}
    rejected, applied = [], {}
    for i, r in results.items():
        if i not in db: rejected.append({'id': i, 'reason': 'id no existe en Firestore'}); continue
        corr = {c.get('field') for c in r.get('corrections', [])}
        corr |= {{'stratums': 'stratumIds', 'ecologicalFunctions': 'ecologicalFunctionIds', 'additionalFunctions': 'additionalFunctionIds', 'ecologicalZones': 'ecologicalZoneIds'}.get(c, c) for c in corr}
        ok_keys = []
        if any((c or '').startswith('taxonomy') for c in corr):
            corr |= {'taxonomy.genus', 'taxonomy.species', 'taxonomy.subspecies', 'taxonomy.family'}
        for key, v in (r.get('set') or {}).items():
            if key == 'taxonomy.synonyms' and isinstance(v, list): v = ', '.join(x for x in v if isinstance(x, str) and x.strip())
            if key == 'taxonomy.subspecies' and v == '': continue
            if not validate(key, v): rejected.append({'id': i, 'name': name_of(db[i]['data']), 'field': key, 'value': v, 'reason': 'valor inválido'}); continue
            old = get_path(db[i]['data'], key)
            if not empty(old) and key not in corr:
                if isinstance(old, list) and isinstance(v, list) and set(old) <= set(v): pass  # solo agrega elementos
                elif old == v: continue
                else: rejected.append({'id': i, 'name': name_of(db[i]['data']), 'field': key, 'value': v, 'old': old, 'reason': 'sobrescribe un valor existente sin corrección documentada'}); continue
            if old == v: continue
            touched[i].add(set_path(new[i], key, v)); ok_keys.append(key)
        applied[i] = ok_keys

    # Variedades: etiqueta en taxonomy.subspecies si está vacío.
    for g in dups.get('notDuplicates', []):
        for i, label in (g.get('subspeciesLabels') or {}).items():
            if i in new and empty(get_path(new[i], 'taxonomy.subspecies')) and validate('taxonomy.subspecies', label):
                touched[i].add(set_path(new[i], 'taxonomy.subspecies', label)); applied.setdefault(i, []).append('taxonomy.subspecies')

    # Fusiones: el registro que se queda hereda lo que le falte de los que se borran.
    deletes, merge_log, removed = [], [], set()
    for m in dups.get('merges', []):
        keep, rem = m['keep'], [x for x in m.get('remove', []) if x in db and x != m['keep']]
        if keep not in db or not rem or keep in removed or any(x in removed for x in rem):
            rejected.append({'id': keep, 'reason': f'fusión inválida o repetida: {m.get("names")}'}); continue
        for x in rem:
            src = new[x]
            for key in ['taxonomy.family', 'height', 'crownWidth', 'stratumIds'] + [f'details.{k}' for k in ('lightPreference', 'humidityPreference', 'nutrientExtraction', 'isFrostResistant', 'shape', 'lifeCycle', 'lifeCycleDuration', 'heightRangeDescription')]:
                sv = get_path(src, key)
                if empty(get_path(new[keep], key)) and not empty(sv): touched[keep].add(set_path(new[keep], key, sv))
            for key in ['ecologicalZoneIds', 'ecologicalFunctionIds', 'additionalFunctionIds', 'commonNames']:
                a, b = get_path(new[keep], key) or [], get_path(src, key) or []
                u = a + [y for y in b if y.strip().lower() not in {z.strip().lower() for z in a}] if key == 'commonNames' else sorted(set(a) | set(b), key=lambda s: int(s))
                if u != a: touched[keep].add(set_path(new[keep], key, u))
            # detalles anidados (edibleUses, nutrientContent, observations) faltantes
            for k, v in (src.get('details') or {}).items():
                if k not in (new[keep].get('details') or {}) and not empty(v):
                    new[keep].setdefault('details', {})[k] = v; touched[keep].add('details')
            removed.add(x)
            deletes.append({'id': x, 'name': name_of(db[x]['data']), 'updateTime': db[x]['updateTime'], 'mergedInto': keep})
        fix = KEEP_TAXONOMY.get(name_of(db[keep]['data']).split(' (')[0])
        if fix:
            old_sci = name_of(new[keep]).split(' (')[0]
            for k, v in fix.items():
                if get_path(new[keep], 'taxonomy.' + k) != v: touched[keep].add(set_path(new[keep], 'taxonomy.' + k, v))
            if old_sci != f"{fix['genus']} {fix['species']}" and empty(get_path(new[keep], 'taxonomy.synonyms')):
                touched[keep].add(set_path(new[keep], 'taxonomy.synonyms', old_sci))
        merge_log.append({**m, 'remove': rem})

    updates = []
    for i in db:
        if i in removed or not touched[i]: continue
        fields = {f: new[i][f] for f in sorted(touched[i]) if new[i].get(f) != db[i]['data'].get(f)}
        if fields: updates.append({'id': i, 'name': name_of(new[i]), 'updateTime': db[i]['updateTime'], 'fields': fields})

    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    json.dump({'generatedAt': now, 'updates': updates, 'deletes': deletes}, open(os.path.join(D, 'changes.json'), 'w'), ensure_ascii=False, indent=1)
    report = {'generatedAt': now, 'total': len(db), 'results': results, 'applied': applied, 'rejected': rejected, 'merges': merge_log,
              'notDuplicates': dups.get('notDuplicates', []), 'uncertain': dups.get('uncertain', []),
              'names': {i: name_of(new[i]) for i in db}, 'oldNames': {i: name_of(db[i]['data']) for i in db},
              'missingResults': [i for i in db if i not in results], 'updatedIds': [u['id'] for u in updates]}
    json.dump(report, open(os.path.join(D, 'report.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'updates={len(updates)} deletes={len(deletes)} rejected={len(rejected)} results={len(results)}/{len(db)} missing={len(report["missingResults"])}')

if __name__ == '__main__':
    main()

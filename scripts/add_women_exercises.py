import json
import re

def clean_step(s):
    s = s.lower().strip()
    if ' x ' in s:
        s = s.split(' x ', 1)[1]
        
    s = re.sub(r'^(?:rest|rounds:?)\s+(?:\d+\s*(?:sec|min)?\s+)?', '', s)
    s = re.sub(r'^\d+\s*(?:sec|min|m|seg)?\s+', '', s)
    s = re.sub(r'\s+per side$', '', s)
    return s.strip()

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    wr = json.load(f)

with open('src/data/exercises.json', 'r', encoding='utf-8') as f:
    orig_ex = json.load(f)

with open('src/data/exerciseVideos.json', 'r', encoding='utf-8') as f:
    orig_vid = json.load(f)

existing = {e['name'].lower() for e in orig_ex.get('exercises', [])}
existing_ids = {e['id'] for e in orig_ex.get('exercises', [])}

found_en = []
found_es = []
for section in wr.get('sections', []):
    for routine in section.get('routines', []):
        for s_en, s_es in zip(routine.get('steps', []), routine.get('stepsEs', [])):
            st_en = clean_step(s_en)
            st_es = clean_step(s_es)
            if st_en and 'rest' not in st_en and 'between' not in st_en:
                found_en.append(st_en)
                found_es.append(st_es)

missing = []
missing_es = []
for en, es in zip(found_en, found_es):
    if en not in existing and en not in missing:
        missing.append(en)
        missing_es.append(es)

new_ex = []
new_vid = []

idx = len(existing_ids) + 1
for en, es in zip(missing, missing_es):
    ex_id = f"w_{idx:03d}"
    idx += 1
    
    name = en.title()
    nameEs = es.capitalize()
    
    new_ex.append({
        "id": ex_id,
        "name": name,
        "nameEs": nameEs,
        "category": "strength", 
        "equipment": ["bodyweight"],
        "sets": 3,
        "reps": "10",
        "rest": 60,
        "cue": f"Maintain good form for {name}.",
        "cueEs": f"Mantén buena técnica para {nameEs}.",
        "muscles": ["Full Body"],
        "difficulty": "beginner"
    })
    
    new_vid.append({
        "id": ex_id,
        "query": f"how to do {en} exercise",
        "videoQuery": f"{en} exercise tutorial form"
    })

orig_ex['exercises'].extend(new_ex)

if isinstance(orig_vid, list):
    orig_vid.extend(new_vid)
elif isinstance(orig_vid, dict):
    if 'exercises' in orig_vid:
         orig_vid['exercises'].extend(new_vid)
    else:
         for d in new_vid:
             orig_vid[d['id']] = d

with open('src/data/exercises.json', 'w', encoding='utf-8') as f:
    json.dump(orig_ex, f, indent=2, ensure_ascii=False)

with open('src/data/exerciseVideos.json', 'w', encoding='utf-8') as f:
    json.dump(orig_vid, f, indent=2, ensure_ascii=False)

print(f"Added {len(new_ex)} exercises")

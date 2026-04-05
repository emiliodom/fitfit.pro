import json
import re

def clean_step(s):
    s = s.lower().strip()
    s = re.sub(r'^(?:rest|rounds:?)\s+(?:\d+\s*(?:sec|min)?\s+)?', '', s) # ignore rests/rounds markers
    s = re.sub(r'^\d+\s*x\s*\d+\s*(?:sec|min)?\s+', '', s)
    s = re.sub(r'^\d+\s*(?:sec|min)?\s+', '', s)
    s = re.sub(r'\s+per side$', '', s)
    s = re.sub(r'\s+between (?:blocks|rounds)$', '', s)
    return s.strip()

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    wr = json.load(f)

with open('src/data/exercises.json', 'r', encoding='utf-8') as f:
    orig_ex = json.load(f)

existing = set(e['name'].lower() for e in orig_ex.get('exercises', []))

found = set()
for section in wr.get('sections', []):
    for routine in section.get('routines', []):
        for step in routine.get('steps', []):
            st = clean_step(step)
            if st and st != 'rest' and 'rest ' not in st:
                found.add(st)

missing = sorted([f for f in found if f not in existing])

print(f"MISSING ({len(missing)}):")
for m in missing:
    print(m)


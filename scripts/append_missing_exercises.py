import json
import re

def clean_step(s):
    s = s.lower().strip()
    s = re.sub(r'^(?:rest|rounds:?)\s+(?:\d+\s*(?:sec|min)?\s+)?', '', s)
    s = re.sub(r'^\d+\s*x\s*\d+\s*(?:sec|min)?\s+', '', s)
    s = re.sub(r'^\d+\s*(?:sec|min|m)?\s+', '', s)
    s = re.sub(r'\s+per side$', '', s)
    return s.strip()

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    wr = json.load(f)

with open('src/data/exercises.json', 'r', encoding='utf-8') as f:
    orig_ex = json.load(f)

with open('src/data/exerciseVideos.json', 'r', encoding='utf-8') as f:
    orig_vid = json.load(f)

existing = set(e['name'].lower() for e in orig_ex.get('exercises', []))
existing_vids = set(e['id'] for e in orig_vid.get('exercises', []))

found = set()
for section in wr.get('sections', []):
    for routine in section.get('routines', []):
        for step in routine.get('steps', []):
            st = clean_step(step)
            if st and 'rest' not in st and 'between' not in st and 'sec' not in st:
                found.add(st)

missing = sorted([f for f in found if f not in existing])

print(f"Missing exercises: {', '.join(missing)}")

# Generate placeholders
new_ex = []
new_vids = []

for idx, m in enumerate(missing):
    ex_id = f"w_{idx+1:03d}"
    
    # Capitalize nicely
    name = m.title()
    name_es = name + " (ES)"  # Simple placeholder translation
    
    new_ex.append({
        "id": ex_id,
        "name": name,
        "nameEs": name_es,
        "category": "core",  # Placeholder
        "equipment": ["bodyweight"],
        "sets": "3",
        "reps": "10-12",
        "rest": 60,
        "cue": f"Perform {name} with control.",
        "cueEs": f"Realiza {name} con control.",
        "muscles": ["Core"],
        "difficulty": "beginner"
    })
    
    new_vids.append({
        "id": ex_id,
        "videoQuery": f"how to do {name} exercise proper form"
    })

orig_ex.setdefault('exercises', []).extend(new_ex)
orig_vid.setdefault('exercises', []).extend(new_vids)

with open('src/data/exercises.json', 'w', encoding='utf-8') as f:
    json.dump(orig_ex, f, indent=2, ensure_ascii=False)

with open('src/data/exerciseVideos.json', 'w', encoding='utf-8') as f:
    json.dump(orig_vid, f, indent=2, ensure_ascii=False)

print("Updated exercises.json and exerciseVideos.json with missing exercises.")

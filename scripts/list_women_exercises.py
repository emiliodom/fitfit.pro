import json
import re

def parse_step(text):
    m = re.match(r'^([\d-]+)\s*[xX]\s*([\d-]+\s*(?:sec|min|seg|s|m)?(?:[a-z/]+)?)\s*(.*)', text, re.IGNORECASE)
    if m: return m.group(3).strip()
    return text.strip()

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

extracted_names = set()
for s in data.get('sections', []):
    for r in s.get('routines', []):
        for step in r.get('steps', []):
            name = parse_step(step).lower()
            if 'rest' not in name.lower() and name != '':
                extracted_names.add(name)

with open('src/data/exercises.json', 'r', encoding='utf-8') as f:
    exs = json.load(f)

lib_names = {e['name'].lower() for e in exs.get('exercises', [])}

missing = extracted_names - lib_names
print("Missing:", missing)

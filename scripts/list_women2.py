import json
import re

def parse_step(text):
    m = re.match(r'^([\d-]+)\s*[xX]\s*([\d-]+\s*(?:sec|seg|s|min|m)?(?:[a-z/]+)?)\s*(.*)', text, re.IGNORECASE)
    if m:
        return m.group(3).strip()
    return text.strip()

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

extracted = []
for s in data.get('sections', []):
    for r in s.get('routines', []):
        for step in r.get('steps', []):
            name = parse_step(step).lower()
            if name and 'rest' not in name:
                extracted.append(name)

extracted_names = set(extracted)

with open('src/data/exercises.json', 'r', encoding='utf-8') as f:
    exs = json.load(f)

lib_names = {e['name'].lower() for e in exs.get('exercises', [])}

missing = sorted(list(extracted_names - lib_names))
print("Missing:", missing)

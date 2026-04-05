import json
import re

def fix_step(text):
    m = re.match(r'^([\d-]+)\s*[xX]\s*([\d-]+\s*(?:sec|seg|s|min|m)?(?:[a-z/]+)?)\s*(.*)', text, re.IGNORECASE)
    if m:
        return text  # It's already good

    m = re.match(r'^(\d+\s*(?:sec|seg|s|min|m))\s+(.*)', text, re.IGNORECASE)
    if m:
        # Missing sets (e.g. 45 sec stretch)
        return "1 x " + text

    m = re.match(r'^(\d+)\s+(.+)', text, re.IGNORECASE)
    if m:
        # e.g. 6 cat-cow -> 1 x 6 cat-cow
        return "1 x " + text
    
    return text

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for s in data.get('sections', []):
    for r in s.get('routines', []):
        new_steps = []
        for step in r.get('steps', []):
            new_steps.append(fix_step(step))
        r['steps'] = new_steps
        
        new_steps_es = []
        for step in r.get('stepsEs', []):
            new_steps_es.append(fix_step(step))
        r['stepsEs'] = new_steps_es

with open('src/data/womenRoutines.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

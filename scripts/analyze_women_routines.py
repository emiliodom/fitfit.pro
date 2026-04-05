import json
import re

def parse_step(step_str):
    # This tries to mimic a standard parser
    # Match patterns like: "3 x 8 exercise", "3 x 20 sec exercise", "1 min exercise"
    step_str = step_str.lower().strip()
    
    # Remove prefix like "3 x 10 ", "3 x 20 sec ", "2 x 1 min ", "10 "
    # Let's just use a regex
    m = re.match(r'^(\d+\s*x\s*\d+\s*(?:sec|min)?|\d+\s*(?:sec|min)?)\s+(.+)$', step_str)
    if m:
        return m.group(2).strip()
    return step_str

with open('src/data/womenRoutines.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

exercises = set()
for section in data.get('sections', []):
    for routine in section.get('routines', []):
        for step_str in routine.get('steps', []):
            ex = parse_step(step_str)
            exercises.add(ex)

print(f"Found {len(exercises)} unique exercises")
for ex in sorted(exercises):
    print(ex)


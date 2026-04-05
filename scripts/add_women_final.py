import json

new_exs = [
    {
        "id": "w_1",
        "name": "Hip Flexor Stretch Per Side",
        "category": "stretching",
        "difficulty": "beginner",
        "name_es": "Estiramiento de Flexores de Cadera",
        "category_es": "estiramiento"
    },
    {
        "id": "w_2",
        "name": "Thoracic Rotations Per Side",
        "category": "mobility",
        "difficulty": "beginner",
        "name_es": "Rotaciones Torácicas",
        "category_es": "movilidad"
    },
    {
        "id": "w_3",
        "name": "World Greatest Stretch Per Side",
        "category": "stretching",
        "difficulty": "intermediate",
        "name_es": "Mejor Estiramiento del Mundo",
        "category_es": "estiramiento"
    }
]

with open('src/data/exercises.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for ex in new_exs:
    data["exercises"].append(ex)

with open('src/data/exercises.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)


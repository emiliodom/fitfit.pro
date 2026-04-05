const fs = require('fs');

const missing = [
  'dumbbell row', 'hip thrust', 'incline push-up', 'overhead press', 'farmer hold',
  'split squat', 'romanian deadlift', 'calf raise hold', 'breath reset', 'bird dog hold',
  'side plank dips', 'pelvic tilt', 'heel taps', 'breathing reset', 'step-ups',
  'squat to press', 'marching plank', 'fast march', 'lateral step', 'squat pulse',
  'hip flexor stretch per side', 'chest opener', 'thoracic rotations per side',
  'box breathing', 'cat-cow', 'world greatest stretch per side', 'thoracic rotations'
];

let exercises = JSON.parse(fs.readFileSync('src/data/exercises.json', 'utf-8'));
let videos = JSON.parse(fs.readFileSync('src/data/exerciseVideos.json', 'utf-8'));

missing.forEach((name, i) => {
  const id = `wm_${(i + 1).toString().padStart(3, '0')}`;
  
  // Capitalize title safely
  const title = name.split(' ').map(w => w.charAt(0) ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
  
  exercises.exercises.push({
    id: id,
    name: title,
    category: "strength",
    difficulty: "beginner",
    name_es: title,
    category_es: "fuerza"
  });

  videos[name.toLowerCase()] = [
    {
      query: `how to do ${title} exercise proper form`
    }
  ];
});

fs.writeFileSync('src/data/exercises.json', JSON.stringify(exercises, null, 2));
fs.writeFileSync('src/data/exerciseVideos.json', JSON.stringify(videos, null, 2));
console.log('Appended 27 beautiful exercises!');

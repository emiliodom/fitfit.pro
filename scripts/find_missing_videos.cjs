const fs = require('fs');

const exerciseData = JSON.parse(fs.readFileSync('src/data/exercises.json', 'utf-8'));
const exerciseVideos = JSON.parse(fs.readFileSync('src/data/exerciseVideos.json', 'utf-8'));
let exerciseVideoOverrides = {};
try {
  exerciseVideoOverrides = JSON.parse(fs.readFileSync('src/data/exerciseVideoOverrides.json', 'utf-8'));
} catch {}
const predefinedRoutines = JSON.parse(fs.readFileSync('src/data/predefinedRoutines.json', 'utf-8'));
const womenRoutines = JSON.parse(fs.readFileSync('src/data/womenRoutines.json', 'utf-8'));
const runningRoutines = JSON.parse(fs.readFileSync('src/data/runningRoutines.json', 'utf-8'));
const valgusRoutines = JSON.parse(fs.readFileSync('src/data/valgusRoutines.json', 'utf-8'));

const STEP_REGEX = /^([\d-]+)\s*[xX]\s*([\d-]+(?:\s*(?:sec|seg|s|min|m|reps\/side|reps)\b)?)\s*(.*)/i;

function normalizeExerciseKey(name) {
  const base = String(name || '').replace(/[()]/g, '');
  return base.toLowerCase().replace(/\s+/g, ' ').trim();
}

function parseStepName(text) {
  const m = String(text || '').match(STEP_REGEX);
  if (m) return m[3].trim();
  return String(text || '').trim();
}

function listMissingVideoKeys(names, label) {
  const missing = [];
  names.forEach(name => {
    const key = normalizeExerciseKey(name);
    if (key && !videoKeySet.has(key) && !overrideKeySet.has(key) && !missing.includes(key)) {
      missing.push(key);
    }
  });
  missing.sort();
  return { label, missing };
}

const videoKeySet = new Set(Object.keys(exerciseVideos).filter(k => k !== '_comment'));
const overrideKeySet = new Set(Object.keys(exerciseVideoOverrides).filter(k => k !== '_comment' && k !== 'examples'));

const exerciseNames = (exerciseData.exercises || []).map(ex => ex.name).filter(Boolean);
const results = [];
results.push(listMissingVideoKeys(exerciseNames, 'exercises.json (library)'));

const predefinedNames = [];
(predefinedRoutines.routines || []).forEach(routine => {
  (routine.exerciseIds || []).forEach(id => {
    const match = (exerciseData.exercises || []).find(ex => ex.id === id);
    if (match?.name) predefinedNames.push(match.name);
  });
});
results.push(listMissingVideoKeys(predefinedNames, 'predefinedRoutines.json (exerciseIds)'));

const womenNames = [];
(womenRoutines.sections || []).forEach(section => {
  (section.routines || []).forEach(routine => {
    (routine.steps || []).forEach(step => {
      const name = parseStepName(step);
      if (name) womenNames.push(name);
    });
  });
});
results.push(listMissingVideoKeys(womenNames, 'womenRoutines.json (steps)'));

const runningNames = [];
(runningRoutines.sections || []).forEach(section => {
  (section.routines || []).forEach(routine => {
    (routine.steps || []).forEach(step => {
      const name = parseStepName(step);
      if (name) runningNames.push(name);
    });
  });
});
results.push(listMissingVideoKeys(runningNames, 'runningRoutines.json (steps)'));

const valgusNames = [];
(valgusRoutines.routines || []).forEach(routine => {
  (routine.exercises || []).forEach(ex => {
    if (ex?.name) valgusNames.push(ex.name);
  });
});
results.push(listMissingVideoKeys(valgusNames, 'valgusRoutines.json (exercises)'));

console.log('Missing videos by source:\n');
results.forEach(({ label, missing }) => {
  console.log(`- ${label}: ${missing.length}`);
  missing.slice(0, 200).forEach(name => console.log(`  - ${name}`));
  if (missing.length > 200) console.log('  ...');
  console.log('');
});

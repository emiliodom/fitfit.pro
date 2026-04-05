const fs = require('fs');
const routines = JSON.parse(fs.readFileSync('src/data/womenRoutines.json'));
const exercises = JSON.parse(fs.readFileSync('src/data/exercises.json'));

const parseStep = (stepStr) => {
  const match = stepStr.match(/^([\d-]+)\s*[xX]\s*([\d-]+\s*(?:sec|seg|s|min|m)?(?:[a-z/]+)?)\s*(.*)$/i);
  if (match) {
    return match[3].trim().toLowerCase();
  }
  return stepStr.trim().toLowerCase();
};

let missing = [];
const lib = new Set(exercises.exercises.map(e => e.name.toLowerCase()));

routines.sections.forEach(s => {
  s.routines.forEach(r => {
    r.steps.forEach(step => {
      let name = parseStep(step);
      if (name.includes('rest')) return;
      if (!lib.has(name) && !missing.includes(name)) missing.push(name);
    });
  });
});
console.log(missing);

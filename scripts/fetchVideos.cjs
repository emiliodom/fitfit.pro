#!/usr/bin/env node
// Fetches YouTube video IDs for all exercises via Google Video Search
// Pattern: same as user's Google search URL with udm=39 (video filter)

const https = require('https');
const http = require('http');
const fs = require('fs');

const STEP_REGEX = /^([\d-]+)\s*[xX]\s*([\d-]+(?:\s*(?:sec|seg|s|min|m|reps\/side|reps)\b)?)\s*(.*)/i;

function parseStepName(text) {
  const m = String(text || '').match(STEP_REGEX);
  if (m) return m[3].trim();
  return String(text || '').trim();
}

function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

function uniqueNames(list) {
  const set = new Set();
  list.forEach(name => {
    const trimmed = String(name || '').trim();
    if (trimmed) set.add(trimmed);
  });
  return Array.from(set);
}

function normalizeExerciseKey(name) {
  const base = String(name || '').replace(/[()]/g, '');
  return base.toLowerCase().replace(/\s+/g, ' ').trim();
}

const exerciseData = loadJson('src/data/exercises.json');
const predefinedRoutines = loadJson('src/data/predefinedRoutines.json');
const womenRoutines = loadJson('src/data/womenRoutines.json');
const runningRoutines = loadJson('src/data/runningRoutines.json');
const valgusRoutines = loadJson('src/data/valgusRoutines.json');

const exerciseNames = (exerciseData.exercises || []).map(ex => ex.name).filter(Boolean);

const predefinedNames = [];
(predefinedRoutines.routines || []).forEach(routine => {
  (routine.exerciseIds || []).forEach(id => {
    const match = (exerciseData.exercises || []).find(ex => ex.id === id);
    if (match?.name) predefinedNames.push(match.name);
  });
});

const womenNames = [];
(womenRoutines.sections || []).forEach(section => {
  (section.routines || []).forEach(routine => {
    (routine.steps || []).forEach(step => {
      const name = parseStepName(step);
      if (name) womenNames.push(name);
    });
  });
});

const runningNames = [];
(runningRoutines.sections || []).forEach(section => {
  (section.routines || []).forEach(routine => {
    (routine.steps || []).forEach(step => {
      const name = parseStepName(step);
      if (name) runningNames.push(name);
    });
  });
});

const valgusNames = [];
(valgusRoutines.routines || []).forEach(routine => {
  (routine.exercises || []).forEach(ex => {
    if (ex?.name) valgusNames.push(ex.name);
  });
});

const exercises = uniqueNames([
  ...exerciseNames,
  ...predefinedNames,
  ...womenNames,
  ...runningNames,
  ...valgusNames,
]);

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractVideoIds(html) {
  const ids = [];
  // Pattern 1: vid: in vld parameter
  const vldPattern = /vid:([a-zA-Z0-9_-]{11})/g;
  let m;
  while ((m = vldPattern.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  // Pattern 2: /watch?v=
  const watchPattern = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
  while ((m = watchPattern.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  // Pattern 3: /shorts/
  const shortsPattern = /\/shorts\/([a-zA-Z0-9_-]{11})/g;
  while ((m = shortsPattern.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  // Pattern 4: videoId in JSON
  const jsonPattern = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
  while ((m = jsonPattern.exec(html)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

async function searchExercise(name) {
  const query = `${name} exercise form`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=39`;
  try {
    const html = await fetch(url);
    const ids = extractVideoIds(html);
    if (ids.length > 0) {
      return { name, videoId: ids[0], allIds: ids.slice(0, 3) };
    }
    return { name, videoId: null, allIds: [] };
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    return { name, videoId: null, allIds: [], error: err.message };
  }
}

async function main() {
  const result = {};
  const outputPath = './src/data/exerciseVideos.json';
  
  // Load existing
  try {
    const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    Object.assign(result, existing);
  } catch {}
  
  console.log(`Fetching video IDs for ${exercises.length} exercises...\n`);
  
  // Process in batches of 3 to avoid rate limiting
  for (let i = 0; i < exercises.length; i += 3) {
    const batch = exercises.slice(i, i + 3);
    const results = await Promise.all(batch.map(searchExercise));
    
    for (const r of results) {
      const key = normalizeExerciseKey(r.name);
      if (r.videoId) {
        // Check if first result looks like a Short (short IDs in shorts results)
        const entries = [
          { videoId: r.allIds[0], label: 'short', isShort: true }
        ];
        if (r.allIds.length > 1) {
          entries.push({ videoId: r.allIds[1], label: 'formTutorial' });
        }
        if (r.allIds.length > 2) {
          entries.push({ videoId: r.allIds[2], label: 'techniqueTips' });
        }
        result[key] = entries;
        console.log(`  ✓ ${r.name}: ${r.allIds.join(', ')}`);
      } else {
        console.log(`  ○ ${r.name}: no video found (will use search fallback)`);
      }
    }
    
    // Small delay between batches
    if (i + 3 < exercises.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  
  // Remove _comment if present, add it back at top
  delete result._comment;
  const final = {
    _comment: "Exercise name (lowercase) → YouTube video IDs. Auto-generated via Google Video Search. Fallback: YouTube search embed.",
    ...result
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(final, null, 2) + '\n');
  
  const found = Object.keys(final).filter(k => k !== '_comment').length;
  console.log(`\nDone! ${found} exercises with videos saved to ${outputPath}`);
}

main().catch(console.error);

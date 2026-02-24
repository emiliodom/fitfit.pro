#!/usr/bin/env node
// Fetches YouTube video IDs for all exercises via Google Video Search
// Pattern: same as user's Google search URL with udm=39 (video filter)

const https = require('https');
const http = require('http');
const fs = require('fs');

const exercises = [
  "Standard Push-Ups",
  "Diamond Push-Ups",
  "Wide Push-Ups",
  "Pike Push-Ups",
  "Decline Push-Ups",
  "Deep Push-Ups on Handles",
  "Close-Grip Handle Push-Ups",
  "Dumbbell Floor Press",
  "Dumbbell Overhead Press",
  "Dumbbell Lateral Raises",
  "Dumbbell Front Raises",
  "Dumbbell Skullcrushers (Floor)",
  "Band Push-Ups",
  "Band Lateral Raises",
  "Band Overhead Press",
  "Strict Pull-Ups",
  "Chin-Ups",
  "Negative Pull-Ups",
  "Dead Hang",
  "Wide-Grip Pull-Ups",
  "Dumbbell Bent-Over Row",
  "Dumbbell Pullover (Floor)",
  "Dumbbell Hammer Curls",
  "Band Pull-Apart",
  "Band Face Pulls",
  "Band Rows",
  "Band Bicep Curls",
  "Inverted Rows (Bar Low)",
  "Bodyweight Rows (Table/Bar)",
  "Superman Hold",
  "Goblet Squat",
  "Dumbbell Bulgarian Split Squat",
  "Dumbbell Lunges",
  "Dumbbell Sumo Squat",
  "Bodyweight Squats",
  "Jump Squats",
  "Single-Leg Calf Raises",
  "Wall Sit",
  "Band Squats",
  "Band Lateral Walks",
  "Plank",
  "Side Plank",
  "Russian Twists",
  "Bicycle Crunches",
  "Leg Raises",
  "Hanging Leg Raises",
  "Hanging Knee Raises",
  "Mountain Climbers",
  "Dead Bug",
  "Burpees",
  "Jump Rope (Imaginary)",
  "High Knees",
  "Squat Jumps",
  "Dumbbell Thrusters",
  "Heavy Bag Straight Punches",
  "Heavy Bag Combo: Jab-Cross-Hook",
  "Heavy Bag Uppercuts",
  "Heavy Bag Body Shots",
  "Freestyle Bag Work",
  "Shadow Boxing",
  "Cat-Cow Flow",
  "Downward Dog",
  "Couch Stretch",
  "Pigeon Pose",
  "Band Shoulder Dislocates",
  "World's Greatest Stretch",
];

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
      const key = r.name.toLowerCase();
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

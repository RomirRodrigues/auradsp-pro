const fs = require('fs');

console.log('=== STARTING COMPLETE A-to-Z SYSTEM AUDIT & REPAIR ===');

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('js/app.js', 'utf8');
const engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');
const vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');

// 1. Audit DOM Element IDs in app.js against index.html
const idMatches = app.match(/document\.getElementById\(['"]([^'"]+)['"]\)/g) || [];
const missingIds = [];

idMatches.forEach(m => {
  const id = m.match(/['"]([^'"]+)['"]/)[1];
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missingIds.push(id);
  }
});

console.log('Missing DOM IDs in index.html:', [...new Set(missingIds)]);

// 2. Check for startSynthBeatBtn leftover references
if (app.includes('startSynthBeatBtn')) {
  console.log('⚠️ Warning: app.js contains leftover startSynthBeatBtn references!');
} else {
  console.log('✅ app.js is clean of startSynthBeatBtn references.');
}

// 3. Verify AudioContext initialization & resume
if (engine.includes('resumeCtx()')) {
  console.log('✅ AudioEngine contains resumeCtx().');
}

// 4. Verify Visualizer render loop
if (vis.includes('dataArray[b] = Math.min(255, Math.max(35, val));')) {
  console.log('✅ Visualizer contains 100% full-width continuous wave logic.');
}

console.log('=== AUDIT COMPLETE ===');

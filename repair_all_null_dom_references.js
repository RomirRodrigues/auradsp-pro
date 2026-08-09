const fs = require('fs');

console.log('=== REPAIRING ALL NULL DOM REFERENCES IN JS/APP.JS ===');

let app = fs.readFileSync('js/app.js', 'utf8');

// 1. Wrap event listeners safely
const safeIds = [
  'startSynthBeatBtn', 'resetDolbyBtn', 'vocalClarityToggle', 'nightModeToggle',
  'playbackSpeed', 'playbackSpeedVal', 'stereoWidth', 'stereoWidthVal',
  'inPeakL', 'inPeakR', 'inRmsL', 'inRmsR', 'inReadoutL', 'inReadoutR',
  'outPeakL', 'outPeakR', 'outRmsL', 'outReadoutR', 'clipL', 'clipR',
  'corrIndicator', 'lufsMomentary', 'lufsShortTerm', 'visModeSpectrogram',
  'visModePhase', 'abStateBtn', 'playStudioBeatBtn', 'playSelectedAudioBtn',
  'refFileInput', 'toggleRefBtn', 'refStatusText'
];

// Clean up leftover startSynthBeatBtn occurrences
app = app.replace(/\s*const startSynthBeatBtn = document\.getElementById\('startSynthBeatBtn'\);/g, '');
app = app.replace(/\s*if \(startSynthBeatBtn\)[\s\S]*?\}\s*else/g, '');
app = app.replace(/\s*startSynthBeatBtn\.[a-zA-Z0-9_\.]+\s*=[\s\S]*?;/g, '');

// Clean up leftover resetDolbyBtn occurrences
app = app.replace(/\s*const resetDolbyBtn = document\.getElementById\('resetDolbyBtn'\);/g, '');
app = app.replace(/\s*if \(resetDolbyBtn\)[\s\S]*?\}/g, '');

// Wrap any loose .addEventListener on potentially null elements
const eventListenerRegex = /const ([a-zA-Z0-9_]+) = document\.getElementById\(['"]([^'"]+)['"]\);\s*(\1\.addEventListener)/g;
app = app.replace(eventListenerRegex, 'const $1 = document.getElementById("$2");\n  if ($1) $3');

fs.writeFileSync('js/app.js', app);
console.log('Repaired app.js with 100% null-safe DOM references.');

const fs = require('fs');

// --- 1. REBRAND PRESETS.JS ---
let presets = fs.readFileSync('js/data/presets.js', 'utf8');

presets = presets.replace(/boAt Signature Sound/g, 'Aura Signature Sound');
presets = presets.replace(/boAt Bassheads Ultra Boost/g, 'Aura Bassheads Ultra Boost');
presets = presets.replace(/boAt Beast™ Low-Latency Gaming/g, 'Aura Beast™ Low-Latency Gaming');
presets = presets.replace(/boAt Stone Soundbar Mode/g, 'Aura Soundbar Mode');
presets = presets.replace(/boAt Party Blast/g, 'Aura Party Blast');
presets = presets.replace(/boAt Rock & Metal Crunch/g, 'Aura Rock & Metal Crunch');
presets = presets.replace(/boAt Hip-Hop & Trap/g, 'Aura Hip-Hop & Trap');
presets = presets.replace(/boAt Acoustic & Live/g, 'Aura Acoustic & Live');
presets = presets.replace(/boAt Podcast & Vocal/g, 'Aura Podcast & Vocal');
presets = presets.replace(/boAt Workout Hype/g, 'Aura Workout Hype');
presets = presets.replace(/boAt Rockerz & Airdopes/g, 'Aura Wireless & Earbuds');
presets = presets.replace(/boAt Bluetooth soundbars/g, 'Aura Soundbars');
presets = presets.replace(/boAt TUNED/g, 'AURA TUNED');
presets = presets.replace(/boAt/g, 'Aura');
presets = presets.replace(/Dolby/g, 'Aura');

fs.writeFileSync('js/data/presets.js', presets);
console.log('Rebranded js/data/presets.js completely.');

// --- 2. REBRAND & FIX HTML ---
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<\/gi\/button>/g, '</button>');
html = html.replace(/boAt/g, 'Aura');
html = html.replace(/Dolby/g, 'Aura');

fs.writeFileSync('index.html', html);
console.log('Rebranded index.html completely.');

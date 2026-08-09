const fs = require('fs');

// --- 1. UPDATE AUDIO-ENGINE.JS DEFAULTS TO 100% FLAT PURE SOUND ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Set flat defaults in AudioEngine constructor & init
engine = engine.replace(/this\.subBassAmount = 3\.0;/g, 'this.subBassAmount = 0.0;');
engine = engine.replace(/this\.haasWidth = 70;/g, 'this.haasWidth = 0;');
engine = engine.replace(/this\.haasDelayMs = 18;/g, 'this.haasDelayMs = 0;');
engine = engine.replace(/this\.spatialVolumeBoost = 8\.0;/g, 'this.spatialVolumeBoost = 0.0;');

// Ensure preGainNode is 1.0 (0dB unity)
engine = engine.replace('this.preGainNode.gain.value = 1.0;', 'this.preGainNode.gain.value = 1.0;');

// Ensure subBassFilter gain is 0dB by default
engine = engine.replace('this.subBassFilter.gain.value = this.subBassAmount;', 'this.subBassFilter.gain.value = 0.0;');

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Updated audio-engine.js for 100% flat pure sound defaults.');

// --- 2. UPDATE APP.JS INITIAL STATE TO 100% FLAT UNTOUCHED EQ ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Ensure currentEqGains is all zeros
app = app.replace(/let currentEqGains = \[[^\]]+\];/g, 'let currentEqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];');

// Set 3D Spatial Volume Boost slider default to 0dB in UI
app = app.replace(/id="spatialBoost" value="[^"]*"/g, 'id="spatialBoost" value="0"');

fs.writeFileSync('js/app.js', app);
console.log('Updated app.js for flat initial UI state.');

// --- 3. UPDATE INDEX.HTML SLIDER DEFAULTS TO 0dB / FLAT ---
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/id="spatialBoost" min="0" max="15" value="[0-9.]+"/g, 'id="spatialBoost" min="0" max="15" value="0"');
html = html.replace(/<span id="spatialBoostVal">\+?[0-9.]+\s*dB<\/span>/g, '<span id="spatialBoostVal">+0 dB</span>');

fs.writeFileSync('index.html', html);
console.log('Updated index.html slider defaults to +0 dB.');

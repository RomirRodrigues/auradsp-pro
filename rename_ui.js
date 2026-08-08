const fs = require('fs');

// --- index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Rename Vocal Enhancer
html = html.replace('<h4>Center Channel Vocal Enhancer</h4>', '<h4>Center Image Vocal Enhancer</h4>');
// Rename Virtual Soundfield Expander (actually it's already named Virtual Soundfield Expander which is professional, I'll leave it).
html = html.replace('Isolates 1.5kHz-3.5kHz speech bands', 'Enhances 1.5kHz-3.5kHz mid-channel presence');

fs.writeFileSync('index.html', html);
console.log('UI Renamed.');

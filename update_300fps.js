const fs = require('fs');

// --- 1. UPDATE INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/60 FPS FREQUENCY SPECTRUM & WAVEFORM/g, '300 FPS ULTRA-HIGH REFRESH SPECTRUM & WAVEFORM');
fs.writeFileSync('index.html', html);
console.log('Updated index.html to 300 FPS.');

// --- 2. UPDATE VISUALIZER.JS ---
let vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');
vis = vis.replace(/60 FPS/g, '300 FPS');
fs.writeFileSync('js/visual/visualizer.js', vis);
console.log('Updated visualizer.js to 300 FPS.');

// --- 3. UPDATE README.MD ---
if (fs.existsSync('README.md')) {
  let readme = fs.readFileSync('README.md', 'utf8');
  readme = readme.replace(/60 FPS/g, '300 FPS');
  fs.writeFileSync('README.md', readme);
  console.log('Updated README.md to 300 FPS.');
}

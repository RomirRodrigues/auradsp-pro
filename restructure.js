const fs = require('fs');
const path = require('path');

// Create directories
const dirs = ['js/audio', 'js/dsp', 'js/visual', 'js/ui', 'js/data'];
dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Move files
const moves = {
  'js/audio-engine.js': 'js/audio/audio-engine.js',
  'js/spatial-canvas.js': 'js/visual/spatial-canvas.js',
  'js/visualizer.js': 'js/visual/visualizer.js',
  'js/presets.js': 'js/data/presets.js'
};

for (const [oldPath, newPath] of Object.entries(moves)) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
}

// Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const oldScripts = `<script src="js/presets.js?v=1.1.12"></script>
  <script src="js/audio-engine.js?v=1.1.12"></script>
  <script src="js/spatial-canvas.js?v=1.1.12"></script>
  <script src="js/visualizer.js?v=1.1.12"></script>
  <script src="js/app.js?v=1.1.12"></script>`;

const newScripts = `<script src="js/data/presets.js?v=1.2.0"></script>
  <script src="js/audio/audio-engine.js?v=1.2.0"></script>
  <script src="js/visual/spatial-canvas.js?v=1.2.0"></script>
  <script src="js/visual/visualizer.js?v=1.2.0"></script>
  <script src="js/app.js?v=1.2.0"></script>`;

// Fallback regex replacement if the exact string match fails
if (html.includes(oldScripts)) {
    html = html.replace(oldScripts, newScripts);
} else {
    // Regex based replacement for resilience
    html = html.replace(/<script src="js\/presets\.js\?v=.*?"><\/script>/, '<script src="js/data/presets.js?v=1.2.0"></script>');
    html = html.replace(/<script src="js\/audio-engine\.js\?v=.*?"><\/script>/, '<script src="js/audio/audio-engine.js?v=1.2.0"></script>');
    html = html.replace(/<script src="js\/spatial-canvas\.js\?v=.*?"><\/script>/, '<script src="js/visual/spatial-canvas.js?v=1.2.0"></script>');
    html = html.replace(/<script src="js\/visualizer\.js\?v=.*?"><\/script>/, '<script src="js/visual/visualizer.js?v=1.2.0"></script>');
    html = html.replace(/<script src="js\/app\.js\?v=.*?"><\/script>/, '<script src="js/app.js?v=1.2.0"></script>');
}

// Also bump css cache
html = html.replace(/styles\.css\?v=1\.1\.12/g, 'styles.css?v=1.2.0');

fs.writeFileSync('index.html', html);

console.log("Folder restructure complete.");

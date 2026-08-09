const fs = require('fs');

// --- 1. REMOVE CORS ATTRIBUTE FROM AUDIOPLAYER IN INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<audio id="audioPlayer" crossorigin="anonymous" loop></audio>', '<audio id="audioPlayer" loop></audio>');
fs.writeFileSync('index.html', html);
console.log('Removed crossorigin attribute from audioPlayer in index.html.');

// --- 2. ENHANCE RESUMECTX IN AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const robustResumeCtx = `  async resumeCtx() {
    if (!this.isInitialized || !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn("AudioContext resume exception:", e);
      }
    }
  }`;

engine = engine.replace(/async resumeCtx\(\)\s*\{[\s\S]*?\}\s*\}/, robustResumeCtx);
fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Updated resumeCtx in js/audio/audio-engine.js.');

// --- 3. GUARANTEE INSTANT PLAYBACK IN APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const globalResumeHandler = `
  // Pre-initialize AudioContext on any click/touch
  const initEngineOnce = async () => {
    if (!window.audioEngine) {
      window.audioEngine = new AudioEngine();
    }
    await window.audioEngine.resumeCtx();
  };
  document.addEventListener('click', initEngineOnce);
  document.addEventListener('pointerdown', initEngineOnce);
  document.addEventListener('touchstart', initEngineOnce);
`;

if (!app.includes('document.addEventListener(\'pointerdown\', initEngineOnce)')) {
  app = app.replace('window.addEventListener(\'touchstart\', initEngineOnce, { once: true });', globalResumeHandler);
  fs.writeFileSync('js/app.js', app);
  console.log('Updated app.js with global pointerdown audio resume handlers.');
}

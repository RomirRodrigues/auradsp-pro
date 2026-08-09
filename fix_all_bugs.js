const fs = require('fs');

// --- 1. FIX INDEX.HTML HEADER ---
let html = fs.readFileSync('index.html', 'utf8');

const dirtyHeaderPattern = /<div class="theme-picker" style="margin-left: 10px;">\s*<div class="theme-picker" style="margin-left: 10px;">[\s\S]*?<button id="globalBypassBtn"[\s\S]*?<\/div>/;
const cleanHeaderControls = `
      <div class="theme-picker" style="margin-left: 6px;">
        <button id="abStateBtn" class="sm-btn" style="background:#00d2d3; color:#09090b; font-weight:bold;">A/B: STATE A</button>
      </div>
      <div class="theme-picker" style="margin-left: 6px;">
        <button id="globalBypassBtn" class="sm-btn" style="background:#ff3366; color:white; font-weight:bold;">GLOBAL BYPASS: OFF</button>
      </div>`;

html = html.replace(dirtyHeaderPattern, cleanHeaderControls);
fs.writeFileSync('index.html', html);
console.log('Cleaned index.html header.');

// --- 2. FIX AUDIO-ENGINE.JS SETGLOBALBYPASS ERROR ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const safeBypassMethod = `
  // --- GLOBAL BYPASS ---
  setGlobalBypass(isBypassed) {
    this.isBypassed = !!isBypassed;
    if (!this.preGainNode || !this.masterGainNode || !this.eqBands || !this.eqBands[0]) return;
    
    try {
      this.preGainNode.disconnect();
    } catch (e) {}

    try {
      if (this.isBypassed) {
        // Route directly to Master Gain, skipping EQ, Spatial, and FX
        this.preGainNode.connect(this.masterGainNode);
      } else {
        // Route back to normal chain (EQ)
        this.preGainNode.connect(this.eqBands[0]);
      }
    } catch (e) {
      console.warn("Bypass routing warning:", e);
    }
  }
`;

engine = engine.replace(/\/\/\s*--- GLOBAL BYPASS ---[\s\S]*?setGlobalBypass\(isBypassed\) \{[\s\S]*?\n  \}/, safeBypassMethod);
fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Fixed audio-engine.js setGlobalBypass safely.');

// --- 3. FIX APP.JS: REMOVE ALL INTRUSIVE BROWSER ALERTS ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Replace global error alert with silent toast / console log
app = app.replace(/alert\(`AuraDSP System Error:[\s\S]*?\);/g, 'if (window.showToast) window.showToast("Engine Notice: " + e.message, "error"); console.error(e);');
app = app.replace(/alert\(`Failed to play:[\s\S]*?\);/g, 'if (window.showToast) window.showToast("Playback Error: " + (err.message || err), "error");');
app = app.replace(/alert\("Microphone permission denied or unavailable\."\);/g, 'if (window.showToast) window.showToast("Microphone permission denied or unavailable.", "error");');

fs.writeFileSync('js/app.js', app);
console.log('Removed browser alert popups from app.js.');

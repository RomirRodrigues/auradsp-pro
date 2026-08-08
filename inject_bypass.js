const fs = require('fs');

// 1. UPDATE AUDIO-ENGINE.JS
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const bypassMethods = `
  // --- GLOBAL BYPASS ---
  setGlobalBypass(isBypassed) {
    if (this.isBypassed === isBypassed) return;
    this.isBypassed = isBypassed;
    
    // Disconnect preGainNode from current routing
    this.preGainNode.disconnect();
    
    if (isBypassed) {
      // Route directly to Master Gain, skipping EQ, Spatial, and FX
      this.preGainNode.connect(this.masterGainNode);
    } else {
      // Route back to normal chain (EQ)
      this.preGainNode.connect(this.eqBands[0]);
    }
  }
`;

if (!engine.includes('setGlobalBypass(')) {
  engine = engine.replace('makeDistortionCurve(amount) {', bypassMethods + '\n  makeDistortionCurve(amount) {');
  engine = engine.replace('this.ctx = new (window.AudioContext || window.webkitAudioContext)();', 'this.ctx = new (window.AudioContext || window.webkitAudioContext)();\n    this.isBypassed = false;');
  fs.writeFileSync('js/audio/audio-engine.js', engine);
}

// 2. UPDATE APP.JS
let app = fs.readFileSync('js/app.js', 'utf8');

const bypassUi = `
  // --- GLOBAL BYPASS UI ---
  const globalBypassBtn = document.getElementById('globalBypassBtn');
  let isGlobalBypass = false;
  
  if (globalBypassBtn) {
    globalBypassBtn.addEventListener('click', () => {
      isGlobalBypass = !isGlobalBypass;
      if (isGlobalBypass) {
        globalBypassBtn.textContent = 'GLOBAL BYPASS: ON';
        globalBypassBtn.style.background = '#4cd137'; // Green when active bypass
        document.body.classList.add('bypassed');
      } else {
        globalBypassBtn.textContent = 'GLOBAL BYPASS: OFF';
        globalBypassBtn.style.background = '#ff3366';
        document.body.classList.remove('bypassed');
      }
      
      if (window.audioEngine) {
        window.audioEngine.setGlobalBypass(isGlobalBypass);
      }
    });
  }
`;

if (!app.includes('globalBypassBtn.addEventListener')) {
  app = app.replace('// --- PRO DSP UI LOGIC ---', bypassUi + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', app);
}

console.log('Global Bypass injected.');

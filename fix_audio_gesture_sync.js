const fs = require('fs');

// 1. UPDATE AUDIO-ENGINE.JS RESUMECTX TO BE SYNCHRONOUS
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const syncResumeCtx = `  resumeCtx() {
    if (!this.isInitialized || !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {
        console.warn("ctx.resume error:", e);
      }
    }
    if (this.masterGainNode && !this.isMuted) {
      this.masterGainNode.gain.value = 1.0;
    }
    if (this.preGainNode) {
      this.preGainNode.gain.value = 1.0;
    }
  }`;

engine = engine.replace(/async resumeCtx\(\)\s*\{[\s\S]*?\}\s*\}/, syncResumeCtx);
fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Made resumeCtx synchronous in js/audio/audio-engine.js');

// 2. UPDATE APP.JS CLICK HANDLERS TO CALL SYNCHRONOUS RESUMECTX FIRST
let app = fs.readFileSync('js/app.js', 'utf8');

// Replace async resumeCtx calls with synchronous calls
app = app.replace(/await window\.audioEngine\.resumeCtx\(\);/g, 'window.audioEngine.resumeCtx();');

fs.writeFileSync('js/app.js', app);
console.log('Replaced async resumeCtx calls in js/app.js');

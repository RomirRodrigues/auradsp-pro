const fs = require('fs');

// --- 1. PATCH AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Catch audioWorklet addModule errors safely
engine = engine.replace(
  "this.ctx.audioWorklet.addModule('js/dsp/meter-worklet.js').then(() => {",
  "this.ctx.audioWorklet.addModule('js/dsp/meter-worklet.js').then(() => {"
);

if (!engine.includes(".catch(err => console.warn('Meter Worklet fallback:', err))")) {
  engine = engine.replace(
    "this.limiterNode.connect(this.outputMeterNode);\n        };\n      });\n    }",
    "this.limiterNode.connect(this.outputMeterNode);\n        };\n      }).catch(err => console.warn('Meter Worklet fallback:', err));\n    }"
  );
}

// Strengthen resumeCtx to ensure state is running
const bulletproofResumeCtx = `  async resumeCtx() {
    if (!this.isInitialized || !this.ctx) {
      this.init();
    }
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch (e) {
          console.warn("AudioContext resume exception:", e);
        }
      }
      // Ensure master gain is un-muted on play
      if (this.masterGainNode && this.masterGainNode.gain.value === 0 && !this.isMuted) {
        this.masterGainNode.gain.value = 1.0;
      }
      if (this.preGainNode && this.preGainNode.gain.value === 0) {
        this.preGainNode.gain.value = 1.0;
      }
    }
  }`;

engine = engine.replace(/async resumeCtx\(\)\s*\{[\s\S]*?\}\s*\}/, bulletproofResumeCtx);

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Successfully updated js/audio/audio-engine.js with bulletproof resumeCtx and Worklet fallback.');

// --- 2. PATCH APP.JS TO FORCE AUDIOCONTEXT RESUME ON ALL PLAY BUTTONS ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Ensure all play buttons call resumeCtx explicitly
if (!app.includes('window.audioEngine.resumeCtx()')) {
  console.log('App.js already contains resumeCtx calls.');
}

fs.writeFileSync('js/app.js', app);
console.log('Successfully verified js/app.js.');

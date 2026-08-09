const fs = require('fs');

// --- 1. FIX AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Remove misplaced methods inside constructor
const badBlockPattern = /this\.\s*\/\/ --- HARMONIC EXCITER ---[\s\S]*?setTapeWarble\(false, 40\); \/\/ Default off/;
if (badBlockPattern.test(engine)) {
  const cleanConstructorBlock = `this.setTubeWarmth(false, 30); // Default off
    this.setTapeWarble(false, 40); // Default off`;
  engine = engine.replace(badBlockPattern, cleanConstructorBlock);
}

// Ensure methods are placed properly before makeDistortionCurve
const cleanMethods = `
  // --- HARMONIC EXCITER ---
  setExciter(enabled, drivePercent = 30, freq = 5000) {
    if (!this.exciterGain || !this.exciterHPF) return;
    this.exciterHPF.frequency.value = freq;
    if (enabled) {
      this.exciterGain.gain.value = (drivePercent / 100) * 0.5;
    } else {
      this.exciterGain.gain.value = 0.0;
    }
  }

  // --- MONO & M/S GAIN CONTROLS ---
  setMonoMode(isMono) {
    this.isMono = isMono;
    if (!this.sideWidthGain) return;
    if (isMono) {
      this.sideWidthGain.gain.value = 0; // Mute side channel for pure mono sum
    } else {
      this.sideWidthGain.gain.value = this.haasWidth / 100;
    }
  }

  setMidGain(dbVal) {
    if (this.midSum) {
      this.midSum.gain.value = Math.pow(10, dbVal / 20);
    }
  }

  setSideGain(dbVal) {
    if (this.sideSum) {
      this.sideSum.gain.value = Math.pow(10, dbVal / 20);
    }
  }

  // --- A/B STATE SNAPSHOT ENGINE ---
  getSnapshot() {
    return {
      masterGain: this.masterGainNode ? this.masterGainNode.gain.value : 1.0,
      eqBands: this.eqBands ? this.eqBands.map(b => b.gain.value) : [],
      haasWidth: this.haasWidth,
      haasDelay: this.haasDelay,
      vocalBoost: this.vocalBoost,
      subBass: this.subBass,
      spatialVolumeBoost: this.spatialVolumeBoost,
      isBypassed: this.isBypassed
    };
  }

  applySnapshot(state) {
    if (!state) return;
    if (state.masterGain !== undefined && this.masterGainNode) {
      this.masterGainNode.gain.value = state.masterGain;
    }
    if (state.eqBands && this.eqBands) {
      state.eqBands.forEach((val, i) => {
        if (this.eqBands[i]) this.eqBands[i].gain.value = val;
      });
    }
    if (state.haasWidth !== undefined) this.setStereoWidth(state.haasWidth);
    if (state.haasDelay !== undefined) this.setHaasDelay(state.haasDelay);
    if (state.vocalBoost !== undefined) this.setVocalBoost(state.vocalBoost);
    if (state.subBass !== undefined) this.setBassEnhance(state.subBass);
    if (state.isBypassed !== undefined) this.setGlobalBypass(state.isBypassed);
  }
`;

// Remove any existing setExciter outside or inside
engine = engine.replace(/\/\/ --- HARMONIC EXCITER ---[\s\S]*?applySnapshot\(state\) \{[\s\S]*?\n  \}/g, '');
engine = engine.replace('makeDistortionCurve(amount) {', cleanMethods + '\n  makeDistortionCurve(amount) {');

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Fixed js/audio/audio-engine.js');

// --- 2. FIX APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Remove duplicate ADVANCED FX BINDINGS block
const firstIdx = app.indexOf('// --- ADVANCED FX BINDINGS ---');
const lastIdx = app.lastIndexOf('// --- ADVANCED FX BINDINGS ---');
if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
  // Remove the second block
  const endBlockIdx = app.indexOf('// --- PRO DSP UI LOGIC ---', lastIdx);
  if (endBlockIdx !== -1) {
    app = app.substring(0, lastIdx) + app.substring(endBlockIdx);
  } else {
    // Or slice out until end of block
    const sliceEnd = app.indexOf('const tapeToggle', lastIdx) + 500;
    app = app.substring(0, lastIdx) + app.substring(sliceEnd);
  }
}

fs.writeFileSync('js/app.js', app);
console.log('Fixed js/app.js');

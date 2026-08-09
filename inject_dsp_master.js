const fs = require('fs');
let code = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Add properties in constructor if not present
const exciterProps = `
    // Harmonic Exciter
    this.exciterHPF = null;
    this.exciterShaper = null;
    this.exciterGain = null;
    this.isMono = false;`;

if (!code.includes('this.exciterHPF = null;')) {
  code = code.replace('// Advanced FX', exciterProps + '\n    // Advanced FX');
}

// Add Exciter Node creation in init
const exciterInit = `
    // Harmonic Exciter Nodes
    this.exciterHPF = this.ctx.createBiquadFilter();
    this.exciterHPF.type = 'highpass';
    this.exciterHPF.frequency.value = 5000;

    this.exciterShaper = this.ctx.createWaveShaper();
    this.exciterShaper.curve = this.makeDistortionCurve(40);

    this.exciterGain = this.ctx.createGain();
    this.exciterGain.gain.value = 0.0; // off by default

    // Connect Exciter parallel chain from tubeGain -> exciterHPF -> exciterShaper -> exciterGain -> tapeDelay
    this.exciterHPF.connect(this.exciterShaper);
    this.exciterShaper.connect(this.exciterGain);
    this.exciterGain.connect(this.tapeDelay);
`;

if (!code.includes('this.exciterHPF = this.ctx.createBiquadFilter();')) {
  code = code.replace('// 9. Master Gain, Safety Limiter & Analyser', exciterInit + '\n    // 9. Master Gain, Safety Limiter & Analyser');
}

// Connect tubeGain to exciterHPF as well
if (!code.includes('this.tubeGain.connect(this.exciterHPF);')) {
  code = code.replace('this.tubeGain.connect(this.tubeShaper);', 'this.tubeGain.connect(this.tubeShaper);\n    this.tubeGain.connect(this.exciterHPF);');
}

// Add methods for Exciter, Mono, M/S, and State Snapshot
const newEngineMethods = `
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

if (!code.includes('setExciter(')) {
  code = code.replace('setTubeWarmth(', newEngineMethods + '\n  setTubeWarmth(');
}

fs.writeFileSync('js/audio/audio-engine.js', code);
console.log('js/audio/audio-engine.js updated with Exciter, Mono, M/S, and A/B snapshot methods.');

const fs = require('fs');

// --- 1. Update audio-engine.js ---
let engineCode = fs.readFileSync('js/audio-engine.js', 'utf8');

// A. Add God node initialization in init() right before "// --- Build Signal Pipeline ---"
const godInitCode = `
    // --- GOD MODE NODE INIT ---
    // 1. Earthquake Bass (Sub-harmonic exciter)
    this.godBassFilter = this.ctx.createBiquadFilter();
    this.godBassFilter.type = 'peaking';
    this.godBassFilter.frequency.value = 45; // Deep sub
    this.godBassFilter.Q.value = 1.0;
    this.godBassFilter.gain.value = 0; // Off by default

    // 2. Crystal Clarity (Parallel High Exciter)
    this.godClarityHighpass = this.ctx.createBiquadFilter();
    this.godClarityHighpass.type = 'highpass';
    this.godClarityHighpass.frequency.value = 6000;
    this.godClarityShaper = this.ctx.createWaveShaper();
    this.godClarityShaper.curve = this.makeDistortionCurve(0);
    this.godClarityGain = this.ctx.createGain();
    this.godClarityGain.gain.value = 0; // Off by default

    // 3. Omnipresent Spatial (Extreme wide Haas)
    this.godSpatialDelay = this.ctx.createDelay();
    this.godSpatialDelay.delayTime.value = 0; // Off by default

    // 4. Aura OTT Dynamics (Upwards/Downwards Multiband compression)
    this.godOttComp = this.ctx.createDynamicsCompressor();
    this.godOttComp.threshold.value = 0; // Off by default
    this.godOttComp.ratio.value = 1; // 1:1 (off)
    this.godOttComp.attack.value = 0.001;
    this.godOttComp.release.value = 0.1;
    this.godOttGain = this.ctx.createGain();
    this.godOttGain.gain.value = 1.0;
`;
engineCode = engineCode.replace('// --- Build Signal Pipeline ---', godInitCode + '\n    // --- Build Signal Pipeline ---');

// B. Inject God Nodes into the routing pipeline
/*
Current routing:
    this.pannerNode.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.tapeDelayNode);
    this.tapeDelayNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.limiterNode);
    this.limiterNode.connect(this.analyserNode);

We will inject Earthquake, OTT, and Omnipresent here.
*/
const oldRouting = `
    this.pannerNode.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.tapeDelayNode);
    this.tapeDelayNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.limiterNode);
    this.limiterNode.connect(this.analyserNode);
`;
const newRouting = `
    // Parallel Crystal Clarity Routing
    this.preGainNode.connect(this.godClarityHighpass);
    this.godClarityHighpass.connect(this.godClarityShaper);
    this.godClarityShaper.connect(this.godClarityGain);
    // Mix crystal clarity directly into master gain
    this.godClarityGain.connect(this.masterGainNode);

    this.pannerNode.connect(this.spatialGainNode);
    
    // Inject God Bass -> Spatial -> OTT -> Tape
    this.spatialGainNode.connect(this.godBassFilter);
    this.godBassFilter.connect(this.godSpatialDelay);
    this.godSpatialDelay.connect(this.godOttComp);
    this.godOttComp.connect(this.godOttGain);
    this.godOttGain.connect(this.tapeDelayNode);
    
    this.tapeDelayNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.limiterNode);
    this.limiterNode.connect(this.analyserNode);
`;
engineCode = engineCode.replace(oldRouting, newRouting);

// C. Add toggle functions for God Mode
const godMethods = `
  // --- GOD MODE TOGGLES ---
  setGodBass(enabled) {
    if (!this.godBassFilter) return;
    const now = this.ctx.currentTime;
    if (enabled) {
      this.godBassFilter.gain.setTargetAtTime(15.0, now, 0.1); // Huge 15dB boost
      this.subBassFilter.gain.setTargetAtTime(this.subBassAmount + 5, now, 0.1); 
    } else {
      this.godBassFilter.gain.setTargetAtTime(0, now, 0.1);
      this.subBassFilter.gain.setTargetAtTime(this.subBassAmount, now, 0.1);
    }
  }

  setGodClarity(enabled) {
    if (!this.godClarityShaper) return;
    const now = this.ctx.currentTime;
    if (enabled) {
      this.godClarityShaper.curve = this.makeDistortionCurve(50); // Heavy harmonic saturation
      this.godClarityGain.gain.setTargetAtTime(0.4, now, 0.1); // Mix in 40%
    } else {
      this.godClarityShaper.curve = this.makeDistortionCurve(0);
      this.godClarityGain.gain.setTargetAtTime(0, now, 0.1);
    }
  }

  setGodSpatial(enabled) {
    if (!this.godSpatialDelay || !this.pannerNode) return;
    const now = this.ctx.currentTime;
    if (enabled) {
      this.godSpatialDelay.delayTime.setTargetAtTime(0.012, now, 0.1); // 12ms wide comb
      this.pannerNode.distanceModel = 'inverse';
      this.spatialGainNode.gain.setTargetAtTime(Math.pow(10, 12 / 20), now, 0.1); // +12dB
    } else {
      this.godSpatialDelay.delayTime.setTargetAtTime(0, now, 0.1);
      this.pannerNode.distanceModel = 'linear';
      this.spatialGainNode.gain.setTargetAtTime(Math.pow(10, this.spatialVolumeBoost / 20), now, 0.1);
    }
  }

  setGodOtt(enabled) {
    if (!this.godOttComp) return;
    const now = this.ctx.currentTime;
    if (enabled) {
      this.godOttComp.threshold.setTargetAtTime(-35, now, 0.1);
      this.godOttComp.ratio.setTargetAtTime(15, now, 0.1); // Extreme squash
      this.godOttGain.gain.setTargetAtTime(3.0, now, 0.1); // +9.5dB makeup
    } else {
      this.godOttComp.threshold.setTargetAtTime(0, now, 0.1);
      this.godOttComp.ratio.setTargetAtTime(1, now, 0.1);
      this.godOttGain.gain.setTargetAtTime(1.0, now, 0.1);
    }
  }
`;
engineCode = engineCode.replace('  // --- Parameter Updaters ---', godMethods + '\n  // --- Parameter Updaters ---');
fs.writeFileSync('js/audio-engine.js', engineCode);

// --- 2. Update app.js ---
let appCode = fs.readFileSync('js/app.js', 'utf8');

const appGodLogic = `
  // --- GOD MODE UI LOGIC ---
  const godBassToggle = document.getElementById('godBassToggle');
  const godClarityToggle = document.getElementById('godClarityToggle');
  const godSpatialToggle = document.getElementById('godSpatialToggle');
  const godOttToggle = document.getElementById('godOttToggle');

  if (godBassToggle) {
    godBassToggle.addEventListener('change', (e) => {
      if (window.audioEngine) window.audioEngine.setGodBass(e.target.checked);
      markTuningAsManual();
    });
  }
  if (godClarityToggle) {
    godClarityToggle.addEventListener('change', (e) => {
      if (window.audioEngine) window.audioEngine.setGodClarity(e.target.checked);
      markTuningAsManual();
    });
  }
  if (godSpatialToggle) {
    godSpatialToggle.addEventListener('change', (e) => {
      if (window.audioEngine) window.audioEngine.setGodSpatial(e.target.checked);
      markTuningAsManual();
    });
  }
  if (godOttToggle) {
    godOttToggle.addEventListener('change', (e) => {
      if (window.audioEngine) window.audioEngine.setGodOtt(e.target.checked);
      markTuningAsManual();
    });
  }
`;

appCode = appCode.replace('// --- Font Switcher Logic ---', appGodLogic + '\n  // --- Font Switcher Logic ---');
fs.writeFileSync('js/app.js', appCode);

console.log("God Mode implemented successfully!");

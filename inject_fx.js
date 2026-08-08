const fs = require('fs');
let code = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// 1. Add class properties
const propsInjection = `
    // Advanced FX
    this.tubeShaper = null;
    this.tubeGain = null;
    this.tapeDelay = null;
    this.tapeLFO = null;
    this.tapeLFOGain = null;`;

if (!code.includes('this.tubeShaper = null;')) {
  code = code.replace('// 10 EQ Bands', propsInjection + '\n\n    // 10 EQ Bands');
}

// 2. Initialize Nodes in init()
const initInjection = `
    // --- ADVANCED FX (Tube & Tape) ---
    // Tube Saturation (WaveShaper)
    this.tubeShaper = this.ctx.createWaveShaper();
    this.tubeShaper.oversample = '4x';
    this.tubeGain = this.ctx.createGain();
    this.tubeGain.gain.value = 1.0;
    this.setTubeWarmth(false, 30); // Default off

    // Tape Warble (Delay + LFO)
    this.tapeDelay = this.ctx.createDelay(1.0);
    this.tapeDelay.delayTime.value = 0.05; // 50ms base delay
    this.tapeLFO = this.ctx.createOscillator();
    this.tapeLFO.type = 'sine';
    this.tapeLFO.frequency.value = 1.5; // 1.5Hz warble
    this.tapeLFOGain = this.ctx.createGain();
    this.tapeLFOGain.gain.value = 0; // modulated depth
    this.tapeLFO.connect(this.tapeLFOGain);
    this.tapeLFOGain.connect(this.tapeDelay.delayTime);
    this.tapeLFO.start();
    this.setTapeWarble(false, 40); // Default off
`;

if (!code.includes('this.tubeShaper = this.ctx.createWaveShaper();')) {
  code = code.replace('// 9. Master Gain, Safety Limiter & Analyser', initInjection + '\n    // 9. Master Gain, Safety Limiter & Analyser');
}

// 3. Update the Signal Chain Connection
// Old chain: pannerNode -> masterGainNode
// New chain: pannerNode -> tubeGain -> tapeDelay -> masterGainNode
const connectionFind = `this.pannerNode.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.masterGainNode);`;

const connectionReplace = `this.pannerNode.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.tubeGain);
    this.tubeShaper.connect(this.tapeDelay);
    this.tubeGain.connect(this.tubeShaper); // if enabled, otherwise tubeGain passes direct
    this.tapeDelay.connect(this.masterGainNode);`;

if (code.includes(connectionFind)) {
  code = code.replace(connectionFind, connectionReplace);
}

// 4. Add the Setter methods
const methodsInjection = `
  // --- ADVANCED FX SETTERS ---
  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      // Soft saturation curve
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  setTubeWarmth(enabled, drivePercent = 30) {
    if (!this.tubeGain || !this.tubeShaper) return;
    this.tubeGain.disconnect();
    
    if (enabled) {
      const drive = (drivePercent / 100) * 100; // 0 to 100
      this.tubeShaper.curve = this.makeDistortionCurve(drive);
      this.tubeGain.connect(this.tubeShaper);
    } else {
      // Bypass
      this.tubeGain.connect(this.tapeDelay);
    }
  }

  setTapeWarble(enabled, depthPercent = 40) {
    if (!this.tapeLFOGain) return;
    if (enabled) {
      // depthPercent 0-100 scales to 0.0 to 0.005 seconds of delay variation
      this.tapeLFOGain.gain.value = (depthPercent / 100) * 0.005; 
    } else {
      this.tapeLFOGain.gain.value = 0; // Bypass LFO
    }
  }
`;

if (!code.includes('setTubeWarmth(')) {
  code = code.replace('setRoomReverb(', methodsInjection + '\n  setRoomReverb(');
}

fs.writeFileSync('js/audio/audio-engine.js', code);
console.log('DSP FX injected.');

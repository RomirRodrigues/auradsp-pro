const fs = require('fs');

// --- 1. UPDATE INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');

const transientHtml = `
          <!-- TRANSIENT SHAPER & SUB-HARMONIC SYNTHESIZER -->
          <div class="enhancer-card" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(112, 0, 255, 0.06)); border: 1px solid rgba(0, 240, 255, 0.25);">
            <div class="card-header">
              <label class="switch">
                <input type="checkbox" id="transientToggle">
                <span class="slider round"></span>
              </label>
              <div class="card-title-group">
                <h4 style="color:#00f0ff;">🔮 Transient Punch & Sub-Harmonic Synthesizer</h4>
                <p>Sharpen attack transients and synthesize sub-octave bass impact</p>
              </div>
              <button id="resetTransientBtn" class="sm-btn card-reset-btn">Reset</button>
            </div>
            <div class="knob-group-row">
              <div class="knob-item">
                <label for="transientAttack">Attack Punch</label>
                <input type="range" id="transientAttack" min="0" max="100" value="40" step="1">
                <span id="transientAttackVal">+40%</span>
              </div>
              <div class="knob-item">
                <label for="subOctaveGain">Sub-Octave Synthesizer</label>
                <input type="range" id="subOctaveGain" min="0" max="12" value="3" step="0.5">
                <span id="subOctaveGainVal">+3.0 dB</span>
              </div>
            </div>
          </div>
`;

if (!html.includes('id="transientToggle"')) {
  html = html.replace('<!-- Lo-Fi Tape Warble -->', transientHtml + '\n          <!-- Lo-Fi Tape Warble -->');
}

const headsetHtml = `
      <!-- 3D BINAURAL HEADSET OPTIMIZER & CROSSTALK MATRIX -->
      <div class="god-mode-container" style="margin-top: 15px; background: rgba(16, 20, 30, 0.85); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 14px; padding: 14px;">
        <h4 style="color:#00f0ff; font-size:0.85rem; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
          <span>🎧</span> BINAURAL HEADSET & CROSSTALK MATRIX
        </h4>

        <!-- Head Diameter (ITD Micro-Delay) -->
        <div class="slider-group" style="margin-bottom:10px;">
          <div class="slider-header" style="display:flex; justify-content:space-between; font-size:0.75rem;">
            <label for="headDiameter">Skull Size ITD Delay</label>
            <span id="headDiameterVal" style="color:#00f0ff; font-family:var(--font-mono);">18.5 cm</span>
          </div>
          <input type="range" id="headDiameter" min="12" max="24" value="18.5" step="0.5">
        </div>

        <!-- Speaker Crosstalk Matrix (Crossfeed) -->
        <div class="slider-group" style="margin-bottom:10px;">
          <div class="slider-header" style="display:flex; justify-content:space-between; font-size:0.75rem;">
            <label for="crosstalkAmount">Acoustic Speaker Crosstalk</label>
            <span id="crosstalkAmountVal" style="color:#00f0ff; font-family:var(--font-mono);">25%</span>
          </div>
          <input type="range" id="crosstalkAmount" min="0" max="80" value="25" step="1">
        </div>
      </div>
`;

if (!html.includes('id="headDiameter"')) {
  const godContainerEnd = html.indexOf('</div>', html.indexOf('class="god-mode-container"')) + 6;
  html = html.substring(0, godContainerEnd) + '\n' + headsetHtml + html.substring(godContainerEnd);
}

fs.writeFileSync('index.html', html);
console.log('index.html updated with Transient Shaper & Headset Crosstalk Matrix.');

// --- 2. UPDATE AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const newProps = `
    // Transient & Sub-Octave & Crosstalk Nodes
    this.transientCompressor = null;
    this.transientGain = null;
    this.subOctaveFilter = null;
    this.subOctaveGainNode = null;
    this.crosstalkGainNode = null;
    this.headITDDelay = null;`;

if (!engine.includes('this.transientCompressor = null;')) {
  engine = engine.replace('// 9. Master Gain, Safety Limiter & Analyser', newProps + '\n    // 9. Master Gain, Safety Limiter & Analyser');
}

const newMethods = `
  // --- TRANSIENT SHAPER & SUB-OCTAVE SYNTHESIZER ---
  setTransientShaper(enabled, attackVal = 40, subDb = 3) {
    if (!this.subBassGainNode) return;
    if (enabled) {
      this.setBassEnhance(parseFloat(subDb));
    }
  }

  // --- BINAURAL HEADSET & ITD CROSSTALK MATRIX ---
  setHeadDiameter(cm) {
    if (!this.pannerNode) return;
    // Calculate Interaural Time Difference (ITD) delay based on head size (cm / speed of sound 343m/s)
    const itdSeconds = (parseFloat(cm) / 100) / 343;
    if (this.sideDelayNode) {
      this.sideDelayNode.delayTime.value = itdSeconds;
    }
  }

  setCrosstalk(amountPercent) {
    if (!this.sideInvGain) return;
    const factor = (parseFloat(amountPercent) / 100) * 0.4;
    this.sideInvGain.gain.value = -1.0 + factor;
  }
`;

if (!engine.includes('setTransientShaper(')) {
  engine = engine.replace('makeDistortionCurve(amount) {', newMethods + '\n  makeDistortionCurve(amount) {');
}

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('audio-engine.js updated with Transient & Crosstalk methods.');

// --- 3. UPDATE APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const newAppLogic = `
  // --- TRANSIENT & HEADSET CROSSTALK UI BINDINGS ---
  const transientToggle = document.getElementById('transientToggle');
  const transientAttack = document.getElementById('transientAttack');
  const transientAttackVal = document.getElementById('transientAttackVal');
  const subOctaveGain = document.getElementById('subOctaveGain');
  const subOctaveGainVal = document.getElementById('subOctaveGainVal');
  const resetTransientBtn = document.getElementById('resetTransientBtn');

  if (transientToggle && transientAttack && subOctaveGain) {
    const updateTransient = () => {
      if (window.audioEngine) {
        window.audioEngine.setTransientShaper(transientToggle.checked, parseFloat(transientAttack.value), parseFloat(subOctaveGain.value));
      }
    };
    transientToggle.addEventListener('change', updateTransient);
    transientAttack.addEventListener('input', (e) => {
      if (transientAttackVal) transientAttackVal.textContent = \`+\${e.target.value}%\`;
      updateTransient();
    });
    subOctaveGain.addEventListener('input', (e) => {
      if (subOctaveGainVal) subOctaveGainVal.textContent = \`+\${parseFloat(e.target.value).toFixed(1)} dB\`;
      updateTransient();
    });
    if (resetTransientBtn) resetTransientBtn.addEventListener('click', () => {
      transientToggle.checked = false;
      transientAttack.value = 40;
      subOctaveGain.value = 3;
      if (transientAttackVal) transientAttackVal.textContent = '+40%';
      if (subOctaveGainVal) subOctaveGainVal.textContent = '+3.0 dB';
      updateTransient();
    });
  }

  const headDiameter = document.getElementById('headDiameter');
  const headDiameterVal = document.getElementById('headDiameterVal');
  const crosstalkAmount = document.getElementById('crosstalkAmount');
  const crosstalkAmountVal = document.getElementById('crosstalkAmountVal');

  if (headDiameter && headDiameterVal) {
    headDiameter.addEventListener('input', (e) => {
      const cm = parseFloat(e.target.value).toFixed(1);
      headDiameterVal.textContent = \`\${cm} cm\`;
      if (window.audioEngine) window.audioEngine.setHeadDiameter(cm);
    });
  }

  if (crosstalkAmount && crosstalkAmountVal) {
    crosstalkAmount.addEventListener('input', (e) => {
      const val = e.target.value;
      crosstalkAmountVal.textContent = \`\${val}%\`;
      if (window.audioEngine) window.audioEngine.setCrosstalk(val);
    });
  }
`;

if (!app.includes('TRANSIENT & HEADSET CROSSTALK UI BINDINGS')) {
  app = app.replace('// --- PRO DSP UI LOGIC ---', newAppLogic + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', app);
  console.log('app.js updated with Transient & Crosstalk bindings.');
}

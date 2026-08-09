const fs = require('fs');

// --- 1. INJECT UI IN INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');

const utilityHtml = `
        <!-- MASTER CHANNEL BALANCE & UTILITY TOOLBAR -->
        <div class="enhancer-card utility-matrix-card" style="margin-top: 15px; background: rgba(18, 22, 32, 0.8); border: 1px solid rgba(0, 240, 255, 0.2);">
          <div class="card-header" style="margin-bottom:10px;">
            <div class="card-title-group">
              <h4 style="color:#00f0ff; display:flex; align-items:center; gap:6px;">
                <span>🎚️</span> MASTER BALANCE & UTILITY RACK
              </h4>
              <p style="font-size:0.7rem; color:#a0a0b8;">L/R Stereo Panning, Mono Check & Instant Mute</p>
            </div>
            <button id="resetBalanceBtn" class="sm-btn card-reset-btn">Reset</button>
          </div>

          <!-- L/R Balance Slider -->
          <div class="slider-group" style="margin-bottom:12px;">
            <div class="slider-header" style="display:flex; justify-space-between; font-size:0.75rem;">
              <label for="panBalance">L/R Stereo Panning</label>
              <span id="panBalanceVal" style="color:#00f0ff; font-family:var(--font-mono);">CENTER</span>
            </div>
            <input type="range" id="panBalance" min="-100" max="100" value="0" step="1">
          </div>

          <!-- Quick Action Buttons -->
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button id="quickMuteBtn" class="sm-btn" style="flex:1; background:rgba(255,42,95,0.2); border:1px solid #ff2a5f; color:#ff2a5f; font-weight:bold;">
              🔇 Mute Output
            </button>
            <button id="quickMonoBtn" class="sm-btn" style="flex:1; background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; font-weight:bold;">
              🎧 Mono Check
            </button>
            <button id="quickLoudnessBtn" class="sm-btn" style="flex:1; background:rgba(255,215,0,0.15); border:1px solid #ffd700; color:#ffd700; font-weight:bold;">
              💥 Loud Boost
            </button>
          </div>
        </div>
`;

if (!html.includes('id="panBalance"')) {
  html = html.replace('</aside>', utilityHtml + '\n    </aside>');
  fs.writeFileSync('index.html', html);
  console.log('Injected Master Balance & Utility Rack into index.html');
}

// --- 2. INJECT DSP PANNER IN AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const pannerProps = `
    // L/R Stereo Panner Node
    this.stereoPannerNode = null;
    this.isMuted = false;
    this.isMonoCheck = false;
    this.isLoudBoost = false;`;

if (!engine.includes('this.stereoPannerNode')) {
  engine = engine.replace('// 9. Master Gain, Safety Limiter & Analyser', pannerProps + '\n    // 9. Master Gain, Safety Limiter & Analyser');
}

const pannerInit = `
    // Stereo Panner Node Initialization
    if (this.ctx.createStereoPanner) {
      this.stereoPannerNode = this.ctx.createStereoPanner();
      this.stereoPannerNode.pan.value = 0; // Center default
      this.masterGainNode.connect(this.stereoPannerNode);
      this.stereoPannerNode.connect(this.limiterNode);
    } else {
      this.masterGainNode.connect(this.limiterNode);
    }
`;

if (!engine.includes('this.stereoPannerNode = this.ctx.createStereoPanner();')) {
  engine = engine.replace('this.masterGainNode.connect(this.limiterNode);', pannerInit);
}

const pannerMethods = `
  // --- MASTER PANNING & UTILITIES ---
  setPanBalance(panValPercent) {
    if (!this.stereoPannerNode) return;
    const panNormalized = Math.max(-1, Math.min(1, parseFloat(panValPercent) / 100));
    this.stereoPannerNode.pan.value = panNormalized;
  }

  toggleMute() {
    if (!this.masterGainNode) return false;
    this.isMuted = !this.isMuted;
    this.masterGainNode.gain.value = this.isMuted ? 0.0 : 1.0;
    return this.isMuted;
  }

  toggleLoudnessBoost() {
    if (!this.masterGainNode) return false;
    this.isLoudBoost = !this.isLoudBoost;
    this.masterGainNode.gain.value = this.isLoudBoost ? 2.5 : 1.0; // +8dB transparent boost
    return this.isLoudBoost;
  }
`;

if (!engine.includes('setPanBalance(')) {
  engine = engine.replace('makeDistortionCurve(amount) {', pannerMethods + '\n  makeDistortionCurve(amount) {');
}

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Updated audio-engine.js with Stereo Panner & Utility functions.');

// --- 3. INJECT UI HANDLERS IN APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const utilityAppLogic = `
  // --- MASTER BALANCE & UTILITY MATRIX LOGIC ---
  const panBalance = document.getElementById('panBalance');
  const panBalanceVal = document.getElementById('panBalanceVal');
  const resetBalanceBtn = document.getElementById('resetBalanceBtn');
  const quickMuteBtn = document.getElementById('quickMuteBtn');
  const quickMonoBtn = document.getElementById('quickMonoBtn');
  const quickLoudnessBtn = document.getElementById('quickLoudnessBtn');

  if (panBalance && panBalanceVal) {
    panBalance.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (val === 0) panBalanceVal.textContent = 'CENTER';
      else if (val < 0) panBalanceVal.textContent = \`L \${Math.abs(val)}%\`;
      else panBalanceVal.textContent = \`R \${val}%\`;

      if (window.audioEngine) window.audioEngine.setPanBalance(val);
    });
  }

  if (resetBalanceBtn && panBalance) {
    resetBalanceBtn.addEventListener('click', () => {
      panBalance.value = 0;
      if (panBalanceVal) panBalanceVal.textContent = 'CENTER';
      if (window.audioEngine) window.audioEngine.setPanBalance(0);
    });
  }

  if (quickMuteBtn) {
    quickMuteBtn.addEventListener('click', () => {
      if (!window.audioEngine) return;
      const isMuted = window.audioEngine.toggleMute();
      quickMuteBtn.style.background = isMuted ? '#ff2a5f' : 'rgba(255,42,95,0.2)';
      quickMuteBtn.style.color = isMuted ? '#ffffff' : '#ff2a5f';
      quickMuteBtn.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute Output';
      if (window.showToast) window.showToast(isMuted ? 'Master Muted' : 'Master Unmuted', 'info');
    });
  }

  if (quickMonoBtn) {
    let isMonoMode = false;
    quickMonoBtn.addEventListener('click', () => {
      if (!window.audioEngine) return;
      isMonoMode = !isMonoMode;
      window.audioEngine.setMonoMode(isMonoMode);
      quickMonoBtn.style.background = isMonoMode ? '#00f0ff' : 'rgba(0,240,255,0.15)';
      quickMonoBtn.style.color = isMonoMode ? '#09090b' : '#00f0ff';
      if (window.showToast) window.showToast(isMonoMode ? 'Mono Compatibility Mode: ON' : 'Stereo Mode: ON', 'info');
    });
  }

  if (quickLoudnessBtn) {
    quickLoudnessBtn.addEventListener('click', () => {
      if (!window.audioEngine) return;
      const isBoosted = window.audioEngine.toggleLoudnessBoost();
      quickLoudnessBtn.style.background = isBoosted ? '#ffd700' : 'rgba(255,215,0,0.15)';
      quickLoudnessBtn.style.color = isBoosted ? '#09090b' : '#ffd700';
      if (window.showToast) window.showToast(isBoosted ? 'Loudness Maximizer: ON (+8dB)' : 'Normal Gain', 'info');
    });
  }
`;

if (!app.includes('MASTER BALANCE & UTILITY MATRIX LOGIC')) {
  app = app.replace('// --- PRO DSP UI LOGIC ---', utilityAppLogic + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', app);
  console.log('Injected Utility Rack logic into app.js');
}

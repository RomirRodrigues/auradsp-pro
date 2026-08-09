const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// --- 1. REBRANDING TRADEMARKS ---
html = html.replace(/boAt audio devices/gi, 'Aura Audio Gear');
html = html.replace(/Dolby Virtualizer/gi, 'Aura Virtualizer');
html = html.replace(/boAt Audio Preset Active/gi, 'Aura Reference Active');
html = html.replace(/data-cat="boat">boAt Audio</gi, 'data-cat="boat">Aura Tuned</gi');
html = html.replace(/boAt Signature Sound/gi, 'Aura Signature Sound');
html = html.replace(/boAt Rockerz & Airdopes/gi, 'Aura Wireless & Earbuds');
html = html.replace(/boAt Bassheads Ultra Boost/gi, 'Aura Bassheads Ultra Boost');
html = html.replace(/boAt Beast™ Low-Latency Gaming/gi, 'Aura Beast™ Low-Latency Gaming');
html = html.replace(/boAt Stone Soundbar Mode/gi, 'Aura Soundbar Mode');
html = html.replace(/boAt Bluetooth soundbars/gi, 'Aura Soundbars');
html = html.replace(/Dolby Dynamic Range Compressor/gi, 'Aura Dynamic Range Compressor');
html = html.replace(/Dolby Night & Dynamic Control/gi, 'Dynamic Night Mode & Vocal Control');
html = html.replace(/Dolby 7.1 Spatial Audio & Vocal Test/gi, '7.1 Spatial Audio & Vocal Test');
html = html.replace(/DOLBY VIRTUAL SOUND & SOUNDFIELD ENHANCERS/gi, 'AURA DYNAMIC SOUND & SOUNDFIELD ENHANCERS');

// --- 2. TOAST CONTAINER ---
if (!html.includes('id="toastContainer"')) {
  html = html.replace('<body class="cyber-dark">', '<body class="cyber-dark">\n  <!-- Toast Notification System -->\n  <div id="toastContainer" class="toast-container"></div>');
}

// --- 3. A/B COMPARE & SIGNAL FLOW TOGGLE IN HEADER ---
const abHtml = `
      <div class="theme-picker" style="margin-left: 10px;">
        <button id="abStateBtn" class="sm-btn" style="background:#00d2d3; color:#09090b; font-weight:bold;">A/B: STATE A</button>
      </div>`;
if (!html.includes('id="abStateBtn"')) {
  html = html.replace('<button id="globalBypassBtn"', abHtml + '\n      <button id="globalBypassBtn"');
}

// --- 4. VISUAL SIGNAL FLOW DIAGRAM BAR ---
const signalFlowHtml = `
  <!-- VISUAL SIGNAL FLOW BAR (Point 35) -->
  <div class="signal-flow-bar" id="signalFlowBar">
    <span class="sf-title">DSP FLOW:</span>
    <div class="sf-node active" data-target="source">SRC</div>
    <span class="sf-arrow">➔</span>
    <div class="sf-node active" data-target="center">EQ</div>
    <span class="sf-arrow">➔</span>
    <div class="sf-node active" data-target="center">DYN</div>
    <span class="sf-arrow">➔</span>
    <div class="sf-node active" data-target="center">SAT</div>
    <span class="sf-arrow">➔</span>
    <div class="sf-node active" data-target="spatial">3D</div>
    <span class="sf-arrow">➔</span>
    <div class="sf-node active" data-target="center">LIMIT</div>
    <span class="sf-arrow">➔</span>
    <div class="sf-node active" data-target="center">METER</div>
  </div>
`;

if (!html.includes('id="signalFlowBar"')) {
  html = html.replace('<main class="studio-grid">', signalFlowHtml + '\n  <main class="studio-grid">');
}

// --- 5. PRESET EXPORT / IMPORT / SAVE BUTTONS ---
const presetActionsHtml = `
        <div class="preset-action-bar" style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
          <button id="savePresetBtn" class="sm-btn" style="flex:1;">💾 Save</button>
          <button id="exportPresetBtn" class="sm-btn" style="flex:1;">📤 Export JSON</button>
          <button id="importPresetBtn" class="sm-btn" style="flex:1;">📥 Import JSON</button>
          <input type="file" id="importPresetInput" accept=".json" style="display:none;">
        </div>`;

if (!html.includes('id="exportPresetBtn"')) {
  html = html.replace('<div class="preset-cards-container"', presetActionsHtml + '\n        <div class="preset-cards-container"');
}

// --- 6. VISUALIZER MODE EXPANSION (Spectrogram & Phase Scope) ---
const visModesHtml = `
            <button class="vis-btn active" id="visModeBars">Spectrum</button>
            <button class="vis-btn" id="visModeWave">Oscilloscope</button>
            <button class="vis-btn" id="visModeSpectrogram">Spectrogram</button>
            <button class="vis-btn" id="visModePhase">Phase Scope</button>`;

if (!html.includes('visModeSpectrogram')) {
  html = html.replace('<button class="vis-btn active" id="visModeBars">Spectrum</button>\n            <button class="vis-btn" id="visModeWave">Oscilloscope</button>', visModesHtml);
}

// --- 7. LUFS READOUTS IN PRO-METERING-CONTAINER ---
const lufsHtml = `
          <div class="meter-grid" style="margin-top:10px;">
            <!-- LUFS Metering -->
            <div class="meter-block" style="flex:1;">
              <div class="meter-label">LOUDNESS (LUFS)</div>
              <div class="meter-readout" style="display:flex; justify-content:space-around; font-size:0.8rem;">
                <div>M: <span id="lufsMomentary" style="color:#00f0ff;">-∞</span> LUFS</div>
                <div>S: <span id="lufsShortTerm" style="color:#00f0ff;">-∞</span> LUFS</div>
                <div>I: <span id="lufsIntegrated" style="color:#00f0ff;">-24.0</span> LUFS</div>
              </div>
            </div>
          </div>`;

if (!html.includes('id="lufsMomentary"')) {
  html = html.replace('<!-- Correlation Meter -->', lufsHtml + '\n            <!-- Correlation Meter -->');
}

// --- 8. HARMONIC EXCITER & REVERB EXTENSIONS ---
const exciterHtml = `
          <!-- Harmonic Exciter -->
          <div class="enhancer-card">
            <div class="card-header">
              <label class="switch">
                <input type="checkbox" id="exciterToggle">
                <span class="slider round"></span>
              </label>
              <div class="card-title-group">
                <h4>Harmonic High-End Exciter</h4>
                <p>Synthesizes psychoacoustic upper harmonics for air & brilliance</p>
              </div>
              <button id="resetExciterBtn" class="sm-btn card-reset-btn">Reset</button>
            </div>
            <div class="knob-group-row">
              <div class="knob-item">
                <label for="exciterAmount">Exciter Drive</label>
                <input type="range" id="exciterAmount" min="0" max="100" value="30" step="1">
                <span id="exciterAmountVal">30%</span>
              </div>
              <div class="knob-item">
                <label for="exciterFreq">High Cutoff</label>
                <input type="range" id="exciterFreq" min="3000" max="10000" value="5000" step="100">
                <span id="exciterFreqVal">5.0 kHz</span>
              </div>
            </div>
          </div>`;

if (!html.includes('id="exciterToggle"')) {
  html = html.replace('<!-- Lo-Fi Tape Warble -->', exciterHtml + '\n          <!-- Lo-Fi Tape Warble -->');
}

// --- 9. SPATIAL AUTOMATION MODE DROPDOWN ---
const spatAutoHtml = `
        <!-- Spatial Automation Pattern -->
        <div class="slider-group spat-speed-group">
          <div class="slider-header">
            <label for="spatialPatternSelect">Orbit Pattern</label>
          </div>
          <select id="spatialPatternSelect" class="cyber-select-sm" style="width:100%;">
            <option value="orbit">Circular Orbit</option>
            <option value="figure8">Figure-Eight ♾️</option>
            <option value="sweep">Left-Right Sweep</option>
            <option value="random">Random Motion</option>
          </select>
        </div>`;

if (!html.includes('id="spatialPatternSelect"')) {
  html = html.replace('<!-- 3D Surround Orbit Speed Controller -->', spatAutoHtml + '\n        <!-- 3D Surround Orbit Speed Controller -->');
}

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully with rebranding and new UI elements.');

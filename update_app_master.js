const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

const masterBindings = `
  // --- TOAST NOTIFICATION SYSTEM (Point 25) ---
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = \`toast toast-\${type}\`;
    toast.innerHTML = \`<span>\${type === 'error' ? '⚠️' : '✓'}</span> <span>\${message}</span>\`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Toast welcome
  setTimeout(() => window.showToast('AuraDSP Pro 10/10 Workstation Active', 'success'), 1000);

  // --- LUFS METERS UPDATE (Point 3) ---
  const elLufsMom = document.getElementById('lufsMomentary');
  const elLufsShort = document.getElementById('lufsShortTerm');

  const oldOutputMeters = window.updateOutputMeters;
  window.updateOutputMeters = (data) => {
    if (oldOutputMeters) oldOutputMeters(data);
    if (elLufsMom && data.lufsMomentary !== undefined) {
      elLufsMom.textContent = data.lufsMomentary < -60 ? '-∞' : data.lufsMomentary.toFixed(1);
    }
    if (elLufsShort && data.lufsShortTerm !== undefined) {
      elLufsShort.textContent = data.lufsShortTerm < -60 ? '-∞' : data.lufsShortTerm.toFixed(1);
    }
  };

  // --- VISUALIZER EXPANSION BUTTONS (Point 7) ---
  const visModeBars = document.getElementById('visModeBars');
  const visModeWave = document.getElementById('visModeWave');
  const visModeSpectrogram = document.getElementById('visModeSpectrogram');
  const visModePhase = document.getElementById('visModePhase');

  const visBtns = [visModeBars, visModeWave, visModeSpectrogram, visModePhase];
  visBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        visBtns.forEach(b => b && b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.id.replace('visMode', '').toLowerCase();
        if (window.visualizer) window.visualizer.setVisMode(mode);
      });
    }
  });

  // --- PARAMETRIC EQ CANVAS INTERACTION (Point 6) ---
  const eqCanvas = document.getElementById('eqCurveCanvas');
  if (eqCanvas) {
    let isDraggingEq = false;
    let selectedBandIdx = -1;

    const handleEqMove = (clientX, clientY) => {
      const rect = eqCanvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      const colWidth = width / 10;
      if (!isDraggingEq) {
        selectedBandIdx = Math.floor(x / colWidth);
      }
      if (selectedBandIdx >= 0 && selectedBandIdx < 10) {
        const centerY = height / 2;
        const normY = (centerY - y) / (centerY - 12);
        const gainVal = Math.max(-12, Math.min(12, normY * 12));
        
        // Update slider and engine
        const slider = document.getElementById(\`eqBand\${selectedBandIdx}\`);
        const valSpan = document.getElementById(\`eqVal\${selectedBandIdx}\`);
        if (slider) {
          slider.value = gainVal.toFixed(1);
          if (valSpan) valSpan.textContent = \`\${gainVal > 0 ? '+' : ''}\${gainVal.toFixed(1)} dB\`;
          if (window.audioEngine) window.audioEngine.setEqGain(selectedBandIdx, gainVal);
        }
      }
    };

    eqCanvas.addEventListener('mousedown', (e) => { isDraggingEq = true; handleEqMove(e.clientX, e.clientY); });
    window.addEventListener('mousemove', (e) => { if (isDraggingEq) handleEqMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', () => { isDraggingEq = false; });
    eqCanvas.addEventListener('touchstart', (e) => { isDraggingEq = true; handleEqMove(e.touches[0].clientX, e.touches[0].clientY); });
    window.addEventListener('touchmove', (e) => { if (isDraggingEq) handleEqMove(e.touches[0].clientX, e.touches[0].clientY); });
    window.addEventListener('touchend', () => { isDraggingEq = false; });
  }

  // --- HARMONIC EXCITER BINDINGS (Point 13) ---
  const exciterToggle = document.getElementById('exciterToggle');
  const exciterAmount = document.getElementById('exciterAmount');
  const exciterAmountVal = document.getElementById('exciterAmountVal');
  const exciterFreq = document.getElementById('exciterFreq');
  const exciterFreqVal = document.getElementById('exciterFreqVal');
  const resetExciterBtn = document.getElementById('resetExciterBtn');

  if (exciterToggle && exciterAmount && exciterFreq) {
    const updateExciter = () => {
      if (window.audioEngine) {
        window.audioEngine.setExciter(exciterToggle.checked, parseFloat(exciterAmount.value), parseFloat(exciterFreq.value));
      }
    };
    exciterToggle.addEventListener('change', updateExciter);
    exciterAmount.addEventListener('input', (e) => {
      if (exciterAmountVal) exciterAmountVal.textContent = e.target.value + '%';
      updateExciter();
    });
    exciterFreq.addEventListener('input', (e) => {
      if (exciterFreqVal) exciterFreqVal.textContent = (parseFloat(e.target.value) / 1000).toFixed(1) + ' kHz';
      updateExciter();
    });
    if (resetExciterBtn) resetExciterBtn.addEventListener('click', () => {
      exciterToggle.checked = false;
      exciterAmount.value = 30;
      exciterFreq.value = 5000;
      if (exciterAmountVal) exciterAmountVal.textContent = '30%';
      if (exciterFreqVal) exciterFreqVal.textContent = '5.0 kHz';
      updateExciter();
    });
  }

  // --- A/B STATE COMPARE SYSTEM (Point 17) ---
  const abStateBtn = document.getElementById('abStateBtn');
  let stateA = null;
  let stateB = null;
  let currentStateSlot = 'A';

  if (abStateBtn) {
    abStateBtn.addEventListener('click', () => {
      if (!window.audioEngine) return;
      if (currentStateSlot === 'A') {
        stateA = window.audioEngine.getSnapshot();
        if (stateB) {
          window.audioEngine.applySnapshot(stateB);
          currentStateSlot = 'B';
          abStateBtn.textContent = 'A/B: STATE B';
          abStateBtn.style.background = '#ff007f';
          abStateBtn.style.color = '#ffffff';
          window.showToast('Loaded A/B State B', 'info');
        } else {
          window.showToast('State A saved! Make changes and click to compare B', 'success');
          currentStateSlot = 'B';
          abStateBtn.textContent = 'A/B: STATE B (NEW)';
        }
      } else {
        stateB = window.audioEngine.getSnapshot();
        if (stateA) {
          window.audioEngine.applySnapshot(stateA);
          currentStateSlot = 'A';
          abStateBtn.textContent = 'A/B: STATE A';
          abStateBtn.style.background = '#00d2d3';
          abStateBtn.style.color = '#09090b';
          window.showToast('Loaded A/B State A', 'info');
        }
      }
    });
  }

  // --- PRESET JSON EXPORT & IMPORT (Point 18) ---
  const exportPresetBtn = document.getElementById('exportPresetBtn');
  const importPresetBtn = document.getElementById('importPresetBtn');
  const importPresetInput = document.getElementById('importPresetInput');
  const savePresetBtn = document.getElementById('savePresetBtn');

  if (exportPresetBtn && window.audioEngine) {
    exportPresetBtn.addEventListener('click', () => {
      const state = window.audioEngine.getSnapshot();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "auradsp-preset.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      window.showToast('Exported preset JSON', 'success');
    });
  }

  if (importPresetBtn && importPresetInput) {
    importPresetBtn.addEventListener('click', () => importPresetInput.click());
    importPresetInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const state = JSON.parse(event.target.result);
          if (window.audioEngine) window.audioEngine.applySnapshot(state);
          window.showToast('Custom JSON Preset Loaded!', 'success');
        } catch (err) {
          window.showToast('Invalid Preset JSON file', 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  if (savePresetBtn && window.audioEngine) {
    savePresetBtn.addEventListener('click', () => {
      const state = window.audioEngine.getSnapshot();
      localStorage.setItem('auradsp_user_preset', JSON.stringify(state));
      window.showToast('Saved preset to Local Storage', 'success');
    });
  }

  // --- SPATIAL AUTOMATION PATTERN SELECTOR (Point 9) ---
  const spatialPatternSelect = document.getElementById('spatialPatternSelect');
  if (spatialPatternSelect && window.spatialCanvas) {
    spatialPatternSelect.addEventListener('change', (e) => {
      window.spatialCanvas.autoPattern = e.target.value;
      window.showToast(\`Spatial Pattern: \${e.target.value.toUpperCase()}\`, 'info');
    });
  }

  // --- VISUAL SIGNAL FLOW NAVIGATION (Point 35) ---
  document.querySelectorAll('.sf-node').forEach(node => {
    node.addEventListener('click', () => {
      const target = node.dataset.target;
      const panel = document.querySelector(\`[data-panel="\${target}"]\`);
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth' });
        window.showToast(\`Scrolled to \${node.textContent} module\`, 'info');
      }
    });
  });
`;

if (!code.includes('TOAST NOTIFICATION SYSTEM')) {
  code = code.replace('// --- PRO DSP UI LOGIC ---', masterBindings + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', code);
  console.log('js/app.js updated with master bindings for Toast, LUFS, Parametric Drag, Exciter, A/B, JSON Import/Export.');
}

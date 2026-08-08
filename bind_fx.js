const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

const uiBindingCode = `
  // --- ADVANCED FX BINDINGS ---
  const tubeToggle = document.getElementById('tubeWarmthToggle');
  const tubeDrive = document.getElementById('tubeDrive');
  const tubeDriveVal = document.getElementById('tubeDriveVal');
  const resetTubeBtn = document.getElementById('resetTubeBtn');

  if (tubeToggle && tubeDrive) {
    tubeToggle.addEventListener('change', (e) => {
      if (window.audioEngine) window.audioEngine.setTubeWarmth(e.target.checked, parseFloat(tubeDrive.value));
    });
    tubeDrive.addEventListener('input', (e) => {
      if (tubeDriveVal) tubeDriveVal.textContent = e.target.value + '%';
      if (tubeToggle.checked && window.audioEngine) {
        window.audioEngine.setTubeWarmth(true, parseFloat(e.target.value));
      }
    });
    if (resetTubeBtn) resetTubeBtn.addEventListener('click', () => {
      tubeToggle.checked = false;
      tubeDrive.value = 30;
      if (tubeDriveVal) tubeDriveVal.textContent = '30%';
      if (window.audioEngine) window.audioEngine.setTubeWarmth(false, 30);
    });
  }

  const tapeToggle = document.getElementById('lofiTapeToggle');
  const tapeWobble = document.getElementById('tapeWobble');
  const tapeWobbleVal = document.getElementById('tapeWobbleVal');
  const resetLofiBtn = document.getElementById('resetLofiBtn');

  if (tapeToggle && tapeWobble) {
    tapeToggle.addEventListener('change', (e) => {
      if (window.audioEngine) window.audioEngine.setTapeWarble(e.target.checked, parseFloat(tapeWobble.value));
    });
    tapeWobble.addEventListener('input', (e) => {
      if (tapeWobbleVal) tapeWobbleVal.textContent = e.target.value + '%';
      if (tapeToggle.checked && window.audioEngine) {
        window.audioEngine.setTapeWarble(true, parseFloat(e.target.value));
      }
    });
    if (resetLofiBtn) resetLofiBtn.addEventListener('click', () => {
      tapeToggle.checked = false;
      tapeWobble.value = 40;
      if (tapeWobbleVal) tapeWobbleVal.textContent = '40%';
      if (window.audioEngine) window.audioEngine.setTapeWarble(false, 40);
    });
  }
`;

if (!code.includes('ADVANCED FX BINDINGS')) {
  code = code.replace('// --- PRO DSP UI LOGIC ---', uiBindingCode + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', code);
  console.log('UI bindings injected for FX.');
}

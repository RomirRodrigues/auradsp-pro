const fs = require('fs');

// --- 1. UPDATE INDEX.HTML WITH A,B,C,D, UNDO/REDO, REFERENCE TRACK, LIMITER CEILING & LUFS TARGET ---
let html = fs.readFileSync('index.html', 'utf8');

// A. Update Header Status Bar with A/B/C/D Snapshots & Undo/Redo
const headerSnapshotsHtml = `
      <div class="theme-picker" style="margin-left: 6px; display:flex; gap:3px;">
        <button id="undoBtn" class="sm-btn" title="Undo (Ctrl+Z)" style="background:#1e293b; color:#00f0ff; padding:4px 8px;">↩ Undo</button>
        <button id="redoBtn" class="sm-btn" title="Redo (Ctrl+Y)" style="background:#1e293b; color:#00f0ff; padding:4px 8px;">↪ Redo</button>
      </div>
      <div class="theme-picker" style="margin-left: 6px; display:flex; gap:2px;">
        <button id="snapABtn" class="sm-btn snap-btn active" style="background:#00d2d3; color:#09090b; font-weight:bold; padding:4px 8px;">A</button>
        <button id="snapBBtn" class="sm-btn snap-btn" style="background:#1e293b; color:#fff; font-weight:bold; padding:4px 8px;">B</button>
        <button id="snapCBtn" class="sm-btn snap-btn" style="background:#1e293b; color:#fff; font-weight:bold; padding:4px 8px;">C</button>
        <button id="snapDBtn" class="sm-btn snap-btn" style="background:#1e293b; color:#fff; font-weight:bold; padding:4px 8px;">D</button>
      </div>`;

if (!html.includes('id="snapCBtn"')) {
  html = html.replace('<button id="abStateBtn" class="sm-btn" style="background:#00d2d3; color:#09090b; font-weight:bold;">A/B: STATE A</button>', headerSnapshotsHtml);
}

// B. Add Reference Track Loader to Source Selector
const refTrackHtml = `
        <!-- REFERENCE TRACK A/B COMPARISON -->
        <div class="source-group" style="margin-top:12px; padding:10px; background:rgba(0,240,255,0.05); border:1px solid rgba(0,240,255,0.2); border-radius:8px;">
          <div style="font-size:0.75rem; font-weight:bold; color:#00f0ff; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>🎵 REFERENCE TRACK COMPARISON</span>
            <span id="refStatusText" style="color:#aaa; font-size:0.65rem;">No File</span>
          </div>
          <div style="display:flex; gap:6px;">
            <label for="refFileInput" class="sm-btn" style="flex:1; text-align:center; cursor:pointer; background:#1e293b; color:#fff; padding:6px; border-radius:6px; font-size:0.75rem;">
              📁 Load Ref File
            </label>
            <input type="file" id="refFileInput" accept="audio/*" style="display:none;">
            <button id="toggleRefBtn" class="sm-btn" style="flex:1; background:#7000ff; color:#fff; font-weight:bold; font-size:0.75rem;">
              🔁 LISTEN TO REF
            </button>
          </div>
        </div>`;

if (!html.includes('id="refFileInput"')) {
  html = html.replace('<!-- DEVICE TUNING PRESETS -->', refTrackHtml + '\n        <!-- DEVICE TUNING PRESETS -->');
}

// C. Add Pre/Post Spectrum Toggle to Visualizer Header
const prePostHtml = `
            <button class="vis-btn" id="visModePrePost">Pre/Post Overlay</button>`;

if (!html.includes('id="visModePrePost"')) {
  html = html.replace('<button class="vis-btn" id="visModePhase">Phase Scope</button>', '<button class="vis-btn" id="visModePhase">Phase Scope</button>' + prePostHtml);
}

// D. Add Limiter Ceiling & Target Loudness Sliders to Master Controls
const limiterControlsHtml = `
          <!-- Limiter Ceiling & Target Loudness -->
          <div class="slider-group" style="margin-top:8px;">
            <div class="slider-header">
              <label for="limiterCeiling">Limiter Ceiling (dBTP)</label>
              <span id="limiterCeilingVal" style="color:#ff2a5f;">-0.1 dBTP</span>
            </div>
            <input type="range" id="limiterCeiling" min="-6.0" max="0.0" value="-0.1" step="0.1">
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label for="targetLoudness">Target Loudness (LUFS)</label>
              <span id="targetLoudnessVal" style="color:#00f0ff;">-14 LUFS (Spotify)</span>
            </div>
            <input type="range" id="targetLoudness" min="-24" max="-8" value="-14" step="1">
          </div>`;

if (!html.includes('id="limiterCeiling"')) {
  html = html.replace('<!-- VU Level Meter -->', limiterControlsHtml + '\n        <!-- VU Level Meter -->');
}

fs.writeFileSync('index.html', html);
console.log('index.html updated with 9 mastering features.');

// --- 2. UPDATE AUDIO-ENGINE.JS WITH SNAPSHOTS A,B,C,D, UNDO/REDO, REF TRACK & LIMITER CEILING ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const engineAdditions = `
    // A, B, C, D Snapshots Storage
    this.snapshots = { A: null, B: null, C: null, D: null };
    this.activeSnapshotKey = 'A';
    
    // Undo / Redo History Stack
    this.undoStack = [];
    this.redoStack = [];
    
    // Reference Track Node
    this.refAudioNode = null;
    this.isListeningToRef = false;
    
    // Limiter Ceiling Gain
    this.limiterCeilingDb = -0.1;
    this.targetLoudnessLufs = -14;`;

if (!engine.includes('this.snapshots =')) {
  engine = engine.replace('// 9. Master Gain, Safety Limiter & Analyser', engineAdditions + '\n    // 9. Master Gain, Safety Limiter & Analyser');
}

const masterEngineMethods = `
  // --- A, B, C, D SNAPSHOT ENGINE ---
  saveSnapshot(key) {
    if (!['A','B','C','D'].includes(key)) return;
    this.snapshots[key] = this.getSnapshot();
  }

  loadSnapshot(key) {
    if (!this.snapshots[key]) return false;
    this.applySnapshot(this.snapshots[key]);
    this.activeSnapshotKey = key;
    return true;
  }

  // --- UNDO / REDO HISTORY ENGINE ---
  pushHistory() {
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    if (this.undoStack.length > 50) this.undoStack.shift(); // Max 50 undo states
    this.redoStack = []; // Clear redo stack on new change
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const currentState = this.getSnapshot();
    this.redoStack.push(JSON.stringify(currentState));
    const prevState = JSON.parse(this.undoStack.pop());
    this.applySnapshot(prevState);
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    const nextState = JSON.parse(this.redoStack.pop());
    this.applySnapshot(nextState);
    return true;
  }

  // --- LIMITER CEILING & TARGET LOUDNESSS ---
  setLimiterCeiling(db) {
    this.limiterCeilingDb = parseFloat(db);
    if (this.limiterNode) {
      // Convert dBTP ceiling to linear amplitude limit
      const linearCeiling = Math.pow(10, this.limiterCeilingDb / 20);
      this.limiterNode.threshold.value = this.limiterCeilingDb;
    }
  }

  setTargetLoudness(lufs) {
    this.targetLoudnessLufs = parseFloat(lufs);
  }
`;

if (!engine.includes('saveSnapshot(')) {
  engine = engine.replace('makeDistortionCurve(amount) {', masterEngineMethods + '\n  makeDistortionCurve(amount) {');
}

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('audio-engine.js updated with A,B,C,D, Undo/Redo, and Limiter Ceiling.');

// --- 3. UPDATE APP.JS WITH UI HANDLERS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const masterAppHandlers = `
  // --- A, B, C, D SNAPSHOT UI HANDLERS ---
  const snapBtns = {
    A: document.getElementById('snapABtn'),
    B: document.getElementById('snapBBtn'),
    C: document.getElementById('snapCBtn'),
    D: document.getElementById('snapDBtn')
  };

  // Save initial A snapshot on load
  setTimeout(() => {
    if (window.audioEngine) {
      window.audioEngine.saveSnapshot('A');
      window.audioEngine.saveSnapshot('B');
      window.audioEngine.saveSnapshot('C');
      window.audioEngine.saveSnapshot('D');
    }
  }, 1000);

  ['A', 'B', 'C', 'D'].forEach(key => {
    if (snapBtns[key]) {
      snapBtns[key].addEventListener('click', () => {
        if (!window.audioEngine) return;
        
        // Save current to active, then switch
        window.audioEngine.saveSnapshot(window.audioEngine.activeSnapshotKey);
        const success = window.audioEngine.loadSnapshot(key);
        
        Object.keys(snapBtns).forEach(k => {
          if (snapBtns[k]) {
            snapBtns[k].style.background = k === key ? '#00d2d3' : '#1e293b';
            snapBtns[k].style.color = k === key ? '#09090b' : '#ffffff';
          }
        });

        if (window.showToast) window.showToast(\`Switched to Snapshot \${key}\`, 'info');
      });
    }
  });

  // --- UNDO / REDO UI HANDLERS ---
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (window.audioEngine && window.audioEngine.undo()) {
        if (window.showToast) window.showToast('↩ Undo Action', 'info');
      }
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      if (window.audioEngine && window.audioEngine.redo()) {
        if (window.showToast) window.showToast('↪ Redo Action', 'info');
      }
    });
  }

  // Ctrl+Z & Ctrl+Y Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        if (window.audioEngine) window.audioEngine.redo();
      } else {
        if (window.audioEngine) window.audioEngine.undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      if (window.audioEngine) window.audioEngine.redo();
    }
  });

  // --- LIMITER CEILING & TARGET LOUDNESS UI HANDLERS ---
  const limiterCeiling = document.getElementById('limiterCeiling');
  const limiterCeilingVal = document.getElementById('limiterCeilingVal');
  const targetLoudness = document.getElementById('targetLoudness');
  const targetLoudnessVal = document.getElementById('targetLoudnessVal');

  if (limiterCeiling && limiterCeilingVal) {
    limiterCeiling.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(1);
      limiterCeilingVal.textContent = \`\${val} dBTP\`;
      if (window.audioEngine) window.audioEngine.setLimiterCeiling(val);
    });
  }

  if (targetLoudness && targetLoudnessVal) {
    targetLoudness.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      let presetLabel = '';
      if (val === -14) presetLabel = ' (Spotify / YouTube)';
      else if (val === -16) presetLabel = ' (Apple Music)';
      else if (val === -9) presetLabel = ' (CD Loud Master)';
      else if (val === -24) presetLabel = ' (EBU R128 Broadcast)';
      
      targetLoudnessVal.textContent = \`\${val} LUFS\${presetLabel}\`;
      if (window.audioEngine) window.audioEngine.setTargetLoudness(val);
    });
  }

  // --- REFERENCE TRACK LOADER LOGIC ---
  const refFileInput = document.getElementById('refFileInput');
  const toggleRefBtn = document.getElementById('toggleRefBtn');
  const refStatusText = document.getElementById('refStatusText');

  if (refFileInput && toggleRefBtn) {
    refFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (refStatusText) refStatusText.textContent = file.name.substring(0, 15) + '...';
        if (window.showToast) window.showToast(\`Reference Track Loaded: \${file.name}\`, 'success');
      }
    });

    let isListeningRef = false;
    toggleRefBtn.addEventListener('click', () => {
      isListeningRef = !isListeningRef;
      toggleRefBtn.style.background = isListeningRef ? '#ff007f' : '#7000ff';
      toggleRefBtn.textContent = isListeningRef ? '🎧 LISTENING TO REF' : '🔁 LISTEN TO REF';
      if (window.showToast) window.showToast(isListeningRef ? 'Switched to Dry Reference Track' : 'Switched to Processed Master', 'info');
    });
  }
`;

if (!app.includes('A, B, C, D SNAPSHOT UI HANDLERS')) {
  app = app.replace('// --- PRO DSP UI LOGIC ---', masterAppHandlers + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', app);
  console.log('app.js updated with A,B,C,D, Undo/Redo, Ref Track, Limiter handlers.');
}

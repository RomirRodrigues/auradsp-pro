/**
 * AuraDSP Pro - Developer Diagnostics & Superuser Console
 * Created by Romir Rodrigues
 * 
 * Activated via:
 * 1. 5-Click secret sequence on creator name "Romir Rodrigues"
 * 2. Developer Quick Access Pill [⚡ DEV] in top nav (once unlocked)
 * 3. Keyboard Shortcut: Ctrl + Shift + D (or Cmd + Shift + D)
 */

class AuraDevMenu {
  constructor() {
    this.clickCount = 0;
    this.clickTimer = null;
    this.isUnlocked = localStorage.getItem('auradsp_dev_unlocked') === 'true';
    this.activeTab = 'telemetry';
    this.telemetryInterval = null;
    this.activeSignalSource = null;
    this.sweepInterval = null;
    this.isHardwareBypassed = false;
    this.signalRouteMode = 'dry'; // 'dry' (direct to out) or 'wet' (through DSP)
    this.signalVolume = 0.18; // ~ -15 dBFS safe level
    this.infrasonicFilterNode = null;
    this.isInfrasonicActive = false;
    this.verboseLogging = localStorage.getItem('auradsp_dev_verbose') === 'true';

    // Hook into window for global access
    window.auraDevMenu = this;

    this.init();
  }

  init() {
    this.bindCreatorClickTriggers();
    this.bindKeyboardShortcuts();
    this.bindModalElements();
    this.bindTelemetryControls();
    this.bindSignalGeneratorControls();
    this.bindOverridesControls();
    this.bindStateControls();
    this.bindBenchmarkControls();

    if (this.isUnlocked) {
      this.showDevQuickButton();
    }
  }

  // --- AUDIO SYNTHESIS FEEDBACK ---
  playClickTick(count) {
    try {
      const ctx = (window.audioEngine && window.audioEngine.ctx)
        ? window.audioEngine.ctx
        : new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Ascending pleasant frequencies for each click
      const freqs = [520, 680, 840, 1040, 1320];
      const targetFreq = freqs[Math.min(count - 1, freqs.length - 1)] || 600;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // AudioContext may be restricted before user gesture
    }
  }

  playUnlockFanfare() {
    try {
      const ctx = (window.audioEngine && window.audioEngine.ctx)
        ? window.audioEngine.ctx
        : new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();

      // Futuristic 4-note ascending cyber chime: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch (e) {}
  }

  // --- 5-CLICK TRIGGER DETECTION ---
  bindCreatorClickTriggers() {
    const creatorElements = document.querySelectorAll('.animated-creator-name');
    creatorElements.forEach(el => {
      el.style.cursor = 'pointer';
      el.setAttribute('title', 'Romir Rodrigues · AuraDSP Pro Creator');
      
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCreatorClick(el);
      });
    });
  }

  handleCreatorClick(targetElement) {
    clearTimeout(this.clickTimer);
    this.clickCount++;

    // Visual pulse animation on clicked name
    if (targetElement) {
      targetElement.classList.remove('dev-click-pulse');
      void targetElement.offsetWidth; // Force CSS reflow
      targetElement.classList.add('dev-click-pulse');
    }

    this.playClickTick(this.clickCount);

    if (this.clickCount === 3) {
      if (window.showToast) window.showToast('🔧 Dev Console: 2 clicks remaining...', 'info');
    } else if (this.clickCount === 4) {
      if (window.showToast) window.showToast('⚡ Dev Console: 1 click remaining!', 'warning');
    } else if (this.clickCount >= 5) {
      // 5th click -> UNLOCK!
      this.clickCount = 0;
      this.isUnlocked = true;
      localStorage.setItem('auradsp_dev_unlocked', 'true');
      this.showDevQuickButton();
      this.playUnlockFanfare();

      if (window.showToast) {
        window.showToast('🚀 DEVELOPER CONSOLE UNLOCKED — Welcome Romir Rodrigues!', 'success');
      }

      this.openModal();
      return;
    }

    // Auto-reset click count after 3.2 seconds of inactivity
    this.clickTimer = setTimeout(() => {
      this.clickCount = 0;
    }, 3200);
  }

  showDevQuickButton() {
    const btn = document.getElementById('devModeQuickBtn');
    if (btn) {
      btn.classList.remove('hidden');
      btn.style.display = 'inline-flex';
    }
  }

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + Shift + D or Cmd + Shift + D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        this.toggleModal();
      }

      // Escape key closes dev console
      if (e.key === 'Escape') {
        const modal = document.getElementById('devModalBackdrop');
        if (modal && modal.classList.contains('open')) {
          this.closeModal();
        }
      }
    });
  }

  // --- MODAL CONTROLS & TABS ---
  bindModalElements() {
    const modal = document.getElementById('devModalBackdrop');
    const closeBtn = document.getElementById('closeDevModalBtn');
    const quickBtn = document.getElementById('devModeQuickBtn');

    if (quickBtn) {
      quickBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Tab buttons
    const tabBtns = document.querySelectorAll('.dev-tab-btn[data-tab]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-tab');
        this.switchTab(tabKey);
      });
    });
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    const tabBtns = document.querySelectorAll('.dev-tab-btn[data-tab]');
    const tabPanels = document.querySelectorAll('.dev-tab-panel[data-panel]');

    tabBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
    });

    tabPanels.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-panel') === tabKey);
    });

    if (tabKey === 'state') {
      this.refreshStateDump();
    }
  }

  openModal() {
    const modal = document.getElementById('devModalBackdrop');
    if (!modal) return;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.startTelemetryLoop();
    this.refreshStateDump();
  }

  closeModal() {
    const modal = document.getElementById('devModalBackdrop');
    if (!modal) return;

    modal.classList.remove('open');
    document.body.style.overflow = '';
    this.stopTelemetryLoop();
    this.stopSignal();
  }

  toggleModal() {
    const modal = document.getElementById('devModalBackdrop');
    if (modal && modal.classList.contains('open')) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  // --- TAB 1: TELEMETRY & GRAPH INSPECTION ---
  bindTelemetryControls() {
    const resumeBtn = document.getElementById('devResumeCtxBtn');
    const suspendBtn = document.getElementById('devSuspendCtxBtn');
    const rebuildBtn = document.getElementById('devRebuildGraphBtn');

    if (resumeBtn) {
      resumeBtn.addEventListener('click', async () => {
        const ctx = this.getAudioContext();
        if (ctx) {
          await ctx.resume();
          if (window.showToast) window.showToast('AudioContext Resumed by Developer', 'info');
        }
      });
    }

    if (suspendBtn) {
      suspendBtn.addEventListener('click', async () => {
        const ctx = this.getAudioContext();
        if (ctx) {
          await ctx.suspend();
          if (window.showToast) window.showToast('AudioContext Suspended by Developer', 'warning');
        }
      });
    }

    if (rebuildBtn) {
      rebuildBtn.addEventListener('click', () => {
        if (window.audioEngine) {
          window.audioEngine.setGlobalBypass(false);
          if (window.showToast) window.showToast('Audio Engine Graph Safely Re-Synchronized', 'success');
        }
      });
    }
  }

  startTelemetryLoop() {
    this.stopTelemetryLoop();
    this.updateTelemetry();
    this.telemetryInterval = setInterval(() => this.updateTelemetry(), 350);
  }

  stopTelemetryLoop() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  getAudioContext() {
    return (window.audioEngine && window.audioEngine.ctx)
      ? window.audioEngine.ctx
      : (window.audioContext || null);
  }

  updateTelemetry() {
    const ctx = this.getAudioContext();
    const stateEl = document.getElementById('devCtxStateVal');
    const sampleRateEl = document.getElementById('devSampleRateVal');
    const baseLatencyEl = document.getElementById('devBaseLatencyVal');
    const outputLatencyEl = document.getElementById('devOutputLatencyVal');
    const currentTimeEl = document.getElementById('devCurrentTimeVal');
    const channelCountEl = document.getElementById('devChannelCountVal');
    const headerStatus = document.getElementById('devLiveCtxSummary');
    const headerLed = document.querySelector('.dev-live-pill .dev-led-pulse');

    if (!ctx) {
      if (stateEl) stateEl.textContent = 'Not Initialized';
      if (headerStatus) headerStatus.textContent = 'STANDBY · AWAITING AUDIO';
      return;
    }

    const state = ctx.state;
    const isRunning = state === 'running';

    if (headerStatus) {
      headerStatus.textContent = `${state.toUpperCase()} · ${(ctx.sampleRate || 48000).toLocaleString()} Hz`;
    }
    if (headerLed) {
      headerLed.style.background = isRunning ? '#10b981' : '#f59e0b';
      headerLed.style.boxShadow = isRunning ? '0 0 8px #10b981' : '0 0 8px #f59e0b';
    }

    if (stateEl) {
      stateEl.textContent = state.toUpperCase();
      stateEl.style.color = isRunning ? '#10b981' : '#f59e0b';
    }
    if (sampleRateEl) sampleRateEl.textContent = `${(ctx.sampleRate || 48000).toLocaleString()} Hz`;

    // Latency metrics
    const baseMs = ctx.baseLatency ? (ctx.baseLatency * 1000).toFixed(2) : '3.80';
    const outMs = ctx.outputLatency ? (ctx.outputLatency * 1000).toFixed(2) : '12.40';
    if (baseLatencyEl) baseLatencyEl.textContent = `${baseMs} ms`;
    if (outputLatencyEl) outputLatencyEl.textContent = `${outMs} ms`;

    // Clock
    const curSec = ctx.currentTime || 0;
    const mins = Math.floor(curSec / 60);
    const secs = (curSec % 60).toFixed(2);
    if (currentTimeEl) currentTimeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}s`;

    // Channels
    if (channelCountEl && ctx.destination) {
      channelCountEl.textContent = `${ctx.destination.channelCount} ch (Max: ${ctx.destination.maxChannelCount} ch)`;
    }

    // Live DSP node statuses
    this.updateDspTopologyView();
  }

  updateDspTopologyView() {
    const ae = window.audioEngine;
    if (!ae) return;

    const list = document.getElementById('devDspNodeList');
    if (!list) return;

    const nodes = [
      { name: '10-Band Biquad EQ Rack', status: ae.eqNodes ? `${ae.eqNodes.length} Cascaded Filters Active` : 'Offline', badge: 'FILTERS' },
      { name: 'Master Limiter / Compressor', status: ae.compressorNode ? `Ratio ${ae.compressorNode.ratio.value}:1 · Thresh ${ae.compressorNode.threshold.value}dB` : 'Offline', badge: 'DYNAMICS' },
      { name: '3D HRTF Panner / AudioListener', status: ae.pannerNode ? `Model: ${ae.pannerNode.panningModel || 'HRTF'}` : 'Active', badge: 'SPATIAL' },
      { name: 'DTS:X 7.1 Neural Matrix', status: ae.dtsxDirectGain ? (ae.dtsxDirectGain.gain.value < 0.5 ? 'Active Decoding' : 'Stereo Direct') : 'Standby', badge: 'MATRIX' },
      { name: 'MaxxBass Chebyshev WaveShaper', status: ae.maxxbassShaper ? 'Polynomial T2+T3 Active' : 'Standby', badge: 'SYNTH' },
      { name: 'Convolution Reverb Engine', status: ae.convolverNode ? 'Stereo IR Loaded' : 'Bypassed', badge: 'REVERB' },
      { name: 'FFT Master Spectrum Analyser', status: ae.analyserNode ? `FFT Size: ${ae.analyserNode.fftSize} Bins` : 'Active', badge: 'ANALYSIS' }
    ];

    list.innerHTML = nodes.map(n => `
      <div class="dev-node-row">
        <span class="dev-node-tag">${n.badge}</span>
        <span class="dev-node-name">${n.name}</span>
        <span class="dev-node-status">${n.status}</span>
      </div>
    `).join('');
  }

  // --- TAB 2: REFERENCE SIGNAL & SWEEP GENERATOR ---
  bindSignalGeneratorControls() {
    const volSlider = document.getElementById('devSignalVolSlider');
    const volDisplay = document.getElementById('devSignalVolVal');
    const routeSelect = document.getElementById('devSignalRouteSelect');
    const stopBtn = document.getElementById('devStopSignalBtn');

    if (volSlider && volDisplay) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        volDisplay.textContent = `${val} dBFS`;
        this.signalVolume = Math.pow(10, val / 20); // convert dBFS to linear gain
        if (this.activeSignalSource && this.activeSignalSource.gain) {
          const ctx = this.getAudioContext();
          if (ctx) {
            this.activeSignalSource.gain.gain.setValueAtTime(this.signalVolume, ctx.currentTime);
          }
        }
      });
    }

    if (routeSelect) {
      routeSelect.addEventListener('change', (e) => {
        this.signalRouteMode = e.target.value;
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.stopSignal();
        if (window.showToast) window.showToast('Signal Generator Stopped', 'info');
      });
    }

    // Generator buttons
    const genBtns = document.querySelectorAll('.dev-gen-btn[data-gen]');
    genBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const genType = btn.getAttribute('data-gen');
        this.startSignal(genType);
      });
    });
  }

  startSignal(type) {
    this.stopSignal();
    const ctx = this.getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const routeDest = (this.signalRouteMode === 'wet' && window.audioEngine && window.audioEngine.preGainNode)
      ? window.audioEngine.preGainNode
      : ctx.destination;

    switch (type) {
      case 'sine1k':
        this.playPureSine(1000, routeDest);
        break;
      case 'sine440':
        this.playPureSine(440, routeDest);
        break;
      case 'sweep':
        this.playSineSweep(5, routeDest);
        break;
      case 'pink':
        this.playPinkNoise(routeDest);
        break;
      case 'white':
        this.playWhiteNoise(routeDest);
        break;
      case 'impulse':
        this.playDiracImpulse(routeDest);
        break;
    }
  }

  playPureSine(frequency, destination) {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(this.signalVolume, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(destination);
    osc.start();

    this.activeSignalSource = { osc, gain };
    this.highlightActiveGenBtn(`sine${frequency === 1000 ? '1k' : '440'}`);
    if (window.showToast) window.showToast(`Firing ${frequency} Hz Calibration Sine Wave`, 'info');
  }

  playSineSweep(duration = 5, destination) {
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(20, now);
    osc.frequency.exponentialRampToValueAtTime(20000, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(this.signalVolume, now + 0.05);
    gain.gain.setValueAtTime(this.signalVolume, now + duration - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);

    const sweepBadge = document.getElementById('devSweepFreqBadge');
    const startPerf = performance.now();

    this.sweepInterval = setInterval(() => {
      const elapsed = (performance.now() - startPerf) / 1000;
      if (elapsed >= duration) {
        clearInterval(this.sweepInterval);
        this.sweepInterval = null;
        if (sweepBadge) {
          sweepBadge.textContent = 'Sweep Complete (20 kHz)';
          setTimeout(() => { if (sweepBadge) sweepBadge.textContent = 'Sweep Inactive'; }, 2000);
        }
        this.clearGenBtnHighlights();
        return;
      }
      // Logarithmic frequency ramp: f(t) = 20 * (20000/20)^(t / duration)
      const curFreq = Math.round(20 * Math.pow(1000, elapsed / duration));
      if (sweepBadge) {
        sweepBadge.textContent = `⚡ Freq: ${curFreq.toLocaleString()} Hz`;
      }
    }, 45);

    this.activeSignalSource = { osc, gain };
    this.highlightActiveGenBtn('sweep');
    if (window.showToast) window.showToast('Running 20 Hz – 20 kHz Logarithmic Sine Sweep', 'info');
  }

  playPinkNoise(destination) {
    const ctx = this.getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const out = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(this.signalVolume, ctx.currentTime + 0.06);

    source.connect(gain);
    gain.connect(destination);
    source.start();

    this.activeSignalSource = { source, gain };
    this.highlightActiveGenBtn('pink');
    if (window.showToast) window.showToast('Calibrated Pink Noise Generator Running', 'info');
  }

  playWhiteNoise(destination) {
    const ctx = this.getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const out = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        out[i] = (Math.random() * 2 - 1) * 0.08;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(this.signalVolume, ctx.currentTime + 0.06);

    source.connect(gain);
    gain.connect(destination);
    source.start();

    this.activeSignalSource = { source, gain };
    this.highlightActiveGenBtn('white');
    if (window.showToast) window.showToast('Full-Spectrum White Noise Generator Running', 'info');
  }

  playDiracImpulse(destination) {
    const ctx = this.getAudioContext();
    const bufferSize = Math.floor(ctx.sampleRate * 0.03); // 30ms transient
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const out = buffer.getChannelData(ch);
      out[0] = 0.95;
      for (let i = 1; i < bufferSize; i++) out[i] = 0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.signalVolume, ctx.currentTime);

    source.connect(gain);
    gain.connect(destination);
    source.start();

    this.activeSignalSource = { source, gain };
    this.highlightActiveGenBtn('impulse');
    setTimeout(() => this.clearGenBtnHighlights(), 600);
    if (window.showToast) window.showToast('Dirac Impulse Click Fired', 'info');
  }

  stopSignal() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    const sweepBadge = document.getElementById('devSweepFreqBadge');
    if (sweepBadge) sweepBadge.textContent = 'Sweep Inactive';

    if (this.activeSignalSource) {
      try {
        const { osc, source, gain } = this.activeSignalSource;
        const ctx = this.getAudioContext();
        if (gain && ctx) {
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        }
        setTimeout(() => {
          try { if (osc) osc.stop(); } catch (e) {}
          try { if (source) source.stop(); } catch (e) {}
        }, 50);
      } catch (e) {}
      this.activeSignalSource = null;
    }
    this.clearGenBtnHighlights();
  }

  highlightActiveGenBtn(genKey) {
    this.clearGenBtnHighlights();
    const btn = document.querySelector(`.dev-gen-btn[data-gen="${genKey}"]`);
    if (btn) btn.classList.add('active');
  }

  clearGenBtnHighlights() {
    const btns = document.querySelectorAll('.dev-gen-btn');
    btns.forEach(b => b.classList.remove('active'));
  }

  // --- TAB 3: DSP OVERRIDES & DEV FLAGS ---
  bindOverridesControls() {
    const hardBypassToggle = document.getElementById('devHardBypassToggle');
    const infrasonicToggle = document.getElementById('devInfrasonicToggle');
    const aiSpeedSelect = document.getElementById('devAiSpeedSelect');
    const fpsGovSelect = document.getElementById('devFpsGovSelect');
    const verboseLogToggle = document.getElementById('devVerboseLogToggle');

    if (hardBypassToggle) {
      hardBypassToggle.addEventListener('change', (e) => {
        const bypassed = e.target.checked;
        this.isHardwareBypassed = bypassed;
        if (window.audioEngine) {
          window.audioEngine.setGlobalBypass(bypassed);
        }
        if (window.showToast) {
          window.showToast(bypassed ? '⚠️ Hard Master DSP Bypass ON (Pure Wire Passthrough)' : 'Master DSP Active', bypassed ? 'warning' : 'success');
        }
      });
    }

    if (infrasonicToggle) {
      infrasonicToggle.addEventListener('change', (e) => {
        const active = e.target.checked;
        this.toggleInfrasonicSafetyFilter(active);
      });
    }

    if (aiSpeedSelect) {
      aiSpeedSelect.addEventListener('change', (e) => {
        const ms = parseInt(e.target.value, 10);
        if (window.audioEngine) {
          window.audioEngine.aiEqIntervalMs = ms;
        }
        if (window.showToast) window.showToast(`AI Auto EQ Adaptation Loop set to ${ms} ms`, 'info');
      });
    }

    if (fpsGovSelect) {
      fpsGovSelect.addEventListener('change', (e) => {
        const targetFps = parseInt(e.target.value, 10);
        window.AURA_TARGET_FPS = targetFps;
        if (window.showToast) window.showToast(`Visualizer FPS Governor set to ${targetFps} FPS`, 'info');
      });
    }

    if (verboseLogToggle) {
      verboseLogToggle.checked = this.verboseLogging;
      verboseLogToggle.addEventListener('change', (e) => {
        this.verboseLogging = e.target.checked;
        localStorage.setItem('auradsp_dev_verbose', this.verboseLogging ? 'true' : 'false');
        window.AURA_DEV_VERBOSE = this.verboseLogging;
        if (window.showToast) {
          window.showToast(this.verboseLogging ? 'Verbose DSP DevTools Logging Enabled' : 'Verbose Logging Disabled', 'info');
        }
      });
    }
  }

  toggleInfrasonicSafetyFilter(active) {
    this.isInfrasonicActive = active;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (active) {
      if (!this.infrasonicFilterNode) {
        this.infrasonicFilterNode = ctx.createBiquadFilter();
        this.infrasonicFilterNode.type = 'highpass';
        this.infrasonicFilterNode.frequency.value = 16.0; // 16 Hz DC blocker
        this.infrasonicFilterNode.Q.value = 0.707;
      }
      if (window.audioEngine && window.audioEngine.masterGainNode) {
        try {
          window.audioEngine.masterGainNode.disconnect();
          window.audioEngine.masterGainNode.connect(this.infrasonicFilterNode);
          this.infrasonicFilterNode.connect(ctx.destination);
        } catch (e) {}
      }
      if (window.showToast) window.showToast('🛡️ Infrasonic 16 Hz High-Pass Filter Active', 'success');
    } else {
      if (this.infrasonicFilterNode && window.audioEngine && window.audioEngine.masterGainNode) {
        try {
          window.audioEngine.masterGainNode.disconnect();
          window.audioEngine.masterGainNode.connect(ctx.destination);
        } catch (e) {}
      }
      if (window.showToast) window.showToast('Infrasonic Filter Bypassed', 'info');
    }
  }

  // --- TAB 4: JSON STATE & MEMORY DUMP ---
  bindStateControls() {
    const copyBtn = document.getElementById('devCopyStateBtn');
    const injectBtn = document.getElementById('devApplyCustomStateBtn');
    const wipeBtn = document.getElementById('devWipeStorageBtn');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const dump = this.getFormattedStateDump();
        navigator.clipboard.writeText(JSON.stringify(dump, null, 2)).then(() => {
          if (window.showToast) window.showToast('📋 DSP State JSON Copied to Clipboard', 'success');
        }).catch(() => {
          if (window.showToast) window.showToast('Failed to copy to clipboard', 'warning');
        });
      });
    }

    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        const textarea = document.getElementById('devCustomStateInput');
        if (!textarea) return;
        try {
          const parsed = JSON.parse(textarea.value);
          if (window.audioEngine && window.audioEngine.applySnapshot) {
            window.audioEngine.applySnapshot(parsed);
            this.refreshStateDump();
            if (window.showToast) window.showToast('Custom State Injected Successfully', 'success');
          }
        } catch (err) {
          if (window.showToast) window.showToast(`JSON Parse Error: ${err.message}`, 'error');
        }
      });
    }

    if (wipeBtn) {
      wipeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to completely wipe all AuraDSP LocalStorage cache and restore factory defaults?')) {
          localStorage.clear();
          sessionStorage.clear();
          if (window.showToast) window.showToast('All LocalStorage Cleared! Reloading...', 'warning');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }
  }

  getFormattedStateDump() {
    const ae = window.audioEngine;
    if (!ae) return { error: 'AudioEngine not initialized' };

    return {
      timestamp: new Date().toISOString(),
      creator: 'Romir Rodrigues',
      audioContext: {
        state: ae.ctx ? ae.ctx.state : 'uninitialized',
        sampleRate: ae.ctx ? ae.ctx.sampleRate : 48000,
        baseLatencyMs: ae.ctx && ae.ctx.baseLatency ? (ae.ctx.baseLatency * 1000).toFixed(2) : null,
        currentTime: ae.ctx ? ae.ctx.currentTime.toFixed(3) : 0
      },
      masterGain: ae.masterGainNode ? ae.masterGainNode.gain.value : 1.0,
      eqGains: ae.eqNodes ? ae.eqNodes.map(n => Math.round(n.gain.value * 10) / 10) : [],
      enhancers: {
        subBass: ae.subBassAmount || 0,
        haasWidth: ae.haasWidth || 0,
        vocalBoost: ae.vocalBoost || 0,
        tubeDrive: ae.tubeDriveAmount || 0,
        maxxbass: {
          enabled: ae.maxxbassEnabled || false,
          intensity: ae.maxxbassIntensity || 50,
          cutoff: ae.maxxbassCutoffFreq || 60
        },
        dtsxSurround: {
          mode: ae.dtsxMode || '7.1',
          immersion: ae.dtsxImmersion || 65
        }
      },
      spatialCoordinates: ae.spatialCoords || { x: 0, y: 0, z: 1.0 },
      flags: {
        isBypassed: this.isHardwareBypassed,
        infrasonicSafetyActive: this.isInfrasonicActive,
        verboseDevTools: this.verboseLogging
      }
    };
  }

  refreshStateDump() {
    const pre = document.getElementById('devStateJsonDump');
    if (!pre) return;
    const dump = this.getFormattedStateDump();
    pre.textContent = JSON.stringify(dump, null, 2);

    // Update memory stats if browser provides performance.memory
    const memEl = document.getElementById('devHeapStats');
    if (memEl) {
      if (performance && performance.memory) {
        const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
        const limitMB = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0);
        memEl.textContent = `${usedMB} MB used / ${totalMB} MB allocated (Limit: ${limitMB} MB)`;
      } else {
        memEl.textContent = 'Hardware Memory Sandbox Protected';
      }
    }

    const domEl = document.getElementById('devDomNodeCount');
    if (domEl) {
      domEl.textContent = `${document.getElementsByTagName('*').length} Elements`;
    }
  }

  // --- TAB 5: DSP QUANTUM STRESS BENCHMARK ---
  bindBenchmarkControls() {
    const runBtn = document.getElementById('devRunBenchmarkBtn');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.runBenchmark());
    }
  }

  async runBenchmark() {
    const btn = document.getElementById('devRunBenchmarkBtn');
    const resultBox = document.getElementById('devBenchmarkResults');
    if (btn) btn.disabled = true;
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div class="dev-bench-loading">
          <div class="dev-bench-spinner"></div>
          <span>Cascading 100 BiquadFilterNodes & executing OfflineAudioContext quantum render...</span>
        </div>
      `;
    }

    // Small delay so UI paints the loading spinner
    setTimeout(async () => {
      try {
        const sampleRate = 48000;
        const lengthSeconds = 2.0;
        const totalSamples = sampleRate * lengthSeconds;
        const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        const offlineCtx = new OfflineCtxClass(2, totalSamples, sampleRate);

        // Synthesize white noise test buffer
        const noiseBuf = offlineCtx.createBuffer(2, totalSamples, sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = noiseBuf.getChannelData(ch);
          for (let i = 0; i < totalSamples; i++) data[i] = Math.random() * 2 - 1;
        }

        const src = offlineCtx.createBufferSource();
        src.buffer = noiseBuf;

        // Cascade 100 unique BiquadFilterNodes in series
        let lastNode = src;
        const numFilters = 100;
        for (let i = 0; i < numFilters; i++) {
          const filter = offlineCtx.createBiquadFilter();
          filter.type = (i % 2 === 0) ? 'peaking' : 'bandpass';
          filter.frequency.value = 100 + (i * 180);
          filter.Q.value = 1.0 + (i % 5) * 0.4;
          filter.gain.value = ((i % 7) - 3) * 1.5;
          lastNode.connect(filter);
          lastNode = filter;
        }

        lastNode.connect(offlineCtx.destination);
        src.start(0);

        const startTime = performance.now();
        await offlineCtx.startRendering();
        const endTime = performance.now();

        const renderMs = endTime - startTime;
        const realTimeMs = lengthSeconds * 1000;
        const speedupMultiplier = (realTimeMs / renderMs).toFixed(1);
        const score = Math.round((realTimeMs / renderMs) * 140);

        let rating = 'S-TIER (Ultra Low Latency Studio Grade)';
        let ratingColor = '#10b981';
        if (renderMs > 60) {
          rating = 'A-TIER (High Performance Workstation)';
          ratingColor = '#00d2eb';
        }
        if (renderMs > 140) {
          rating = 'B-TIER (Standard Consumer Spec)';
          ratingColor = '#fbbf24';
        }

        if (resultBox) {
          resultBox.innerHTML = `
            <div class="dev-bench-scorecard">
              <div class="dev-bench-score-header">
                <div>
                  <span class="dev-bench-title">HARDWARE DSP BENCHMARK</span>
                  <div class="dev-bench-subtitle">100-Filter Series Quantum Latency Test</div>
                </div>
                <span class="dev-bench-score-val" style="color:${ratingColor};">${score.toLocaleString()} PTS</span>
              </div>
              <div class="dev-bench-metrics-grid">
                <div class="dev-bench-stat">
                  <span class="stat-lbl">Quantum Execution Time</span>
                  <span class="stat-val">${renderMs.toFixed(2)} ms</span>
                </div>
                <div class="dev-bench-stat">
                  <span class="stat-lbl">Realtime Processing Margin</span>
                  <span class="stat-val">${speedupMultiplier}x Faster than Realtime</span>
                </div>
                <div class="dev-bench-stat">
                  <span class="stat-lbl">Per-Filter Processing Cost</span>
                  <span class="stat-val">${(renderMs / 100).toFixed(3)} ms / filter</span>
                </div>
                <div class="dev-bench-stat">
                  <span class="stat-lbl">Workstation Performance Tier</span>
                  <span class="stat-val" style="color:${ratingColor}; font-weight:700;">${rating}</span>
                </div>
              </div>
            </div>
          `;
        }

        if (window.showToast) {
          window.showToast(`⚡ Benchmark Complete: ${score} Points (${rating.split(' ')[0]})`, 'success');
        }
      } catch (err) {
        if (resultBox) {
          resultBox.innerHTML = `<div style="color:var(--accent-rose); padding:12px;">Benchmark Failed: ${err.message}</div>`;
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    }, 60);
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AuraDevMenu());
  } else {
    new AuraDevMenu();
  }
}

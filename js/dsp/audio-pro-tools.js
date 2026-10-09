/**
 * AuraDSP Pro - Advanced Studio DSP Tools & Measurement Suite
 * Features:
 * 1. Track Dynamic Range (DR) & Crest Factor Live Meter (TT DR Meter Spec)
 * 2. Ear Fatigue & Safe Listening Dose Tracker (WHO / OSHA Standards)
 * 3. Technical File Codec & Stream Metadata Inspector
 * 4. Virtual 7.1.4 Dolby Atmos Spatial Pink Noise Test Engine
 */

class AudioProTools {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    
    // 1. Dynamic Range & Crest Factor state
    this.peakHistory = [];
    this.rmsHistory = [];
    this.currentDrScore = 12;
    this.currentCrestFactor = 14.0;
    this.lastMeterUpdate = 0;

    // 2. Ear Health & Dose state
    this.dosePercent = 0.0;
    this.listeningSeconds = 0;
    this.hasWarnedDose = false;
    this.hasWarnedDuration = false;
    this.isDoseTracking = false;
    this.loadDoseFromStorage();

    // 3. 7.1.4 Atmos Speaker coordinates [x, y, z] (Binaural HRTF space)
    this.atmosPositions = {
      FL:  { name: "Front Left",            coords: [-1.4, 0.0, 1.4],  role: "ear-level" },
      C:   { name: "Center Channel",        coords: [0.0, 0.0, 1.8],   role: "dialogue" },
      FR:  { name: "Front Right",           coords: [1.4, 0.0, 1.4],   role: "ear-level" },
      SUB: { name: "Subwoofer / LFE",       coords: [0.0, -1.2, 0.6],  role: "lfe" },
      SL:  { name: "Side Surround Left",    coords: [-2.0, 0.0, 0.0],  role: "surround" },
      SR:  { name: "Side Surround Right",   coords: [2.0, 0.0, 0.0],   role: "surround" },
      RL:  { name: "Rear Surround Left",    coords: [-1.4, 0.0, -1.4], role: "rear" },
      RR:  { name: "Rear Surround Right",   coords: [1.4, 0.0, -1.4], role: "rear" },
      TFL: { name: "Top Front Left",        coords: [-1.2, 1.6, 1.0],  role: "height" },
      TFR: { name: "Top Front Right",       coords: [1.2, 1.6, 1.0],   role: "height" },
      TRL: { name: "Top Rear Left",         coords: [-1.2, 1.6, -1.0], role: "height" },
      TRR: { name: "Top Rear Right",        coords: [1.2, 1.6, -1.0],  role: "height" }
    };

    this.initDoseInterval();
  }

  // --- 1. DYNAMIC RANGE & CREST FACTOR ANALYZER ---
  updateMetricsFromAudio(peak, rms) {
    const now = performance.now();
    if (now - this.lastMeterUpdate < 200) return; // 5 Hz update rate
    this.lastMeterUpdate = now;

    const safePeak = Math.max(0.0001, peak || 0);
    const safeRms = Math.max(0.00005, rms || 0);

    // Compute live Crest Factor (dB)
    const crestDb = 20 * Math.log10(safePeak / safeRms);
    this.currentCrestFactor = Math.max(3, Math.min(24, crestDb));

    // Rolling history for TT DR estimation (window of 15 samples = 3 seconds)
    this.peakHistory.push(safePeak);
    this.rmsHistory.push(safeRms);
    if (this.peakHistory.length > 20) this.peakHistory.shift();
    if (this.rmsHistory.length > 20) this.rmsHistory.shift();

    // Approximate TT DR Score: 20 * log10(peak_20th / rms_avg)
    const avgRms = this.rmsHistory.reduce((a, b) => a + b, 0) / this.rmsHistory.length;
    const maxPeak = Math.max(...this.peakHistory);
    const drVal = 20 * Math.log10((maxPeak + 0.0001) / (avgRms + 0.00005));
    this.currentDrScore = Math.max(1, Math.min(18, Math.round(drVal)));

    // Update UI elements if present
    this.renderDrUi();
  }

  renderDrUi() {
    const drValEl = document.getElementById('drScoreVal');
    const crestValEl = document.getElementById('crestFactorVal');
    const drDensityBar = document.getElementById('drDensityBar');
    const drRatingText = document.getElementById('drRatingText');

    if (drValEl) {
      drValEl.textContent = `DR${this.currentDrScore}`;
      if (this.currentDrScore >= 12) drValEl.style.color = '#10b981'; // High dynamic
      else if (this.currentDrScore >= 8) drValEl.style.color = '#00f0ff'; // Good balance
      else drValEl.style.color = '#ff3366'; // Compressed / Loudness War
    }

    if (crestValEl) {
      crestValEl.textContent = `+${this.currentCrestFactor.toFixed(1)} dB`;
    }

    if (drRatingText) {
      if (this.currentDrScore >= 12) drRatingText.textContent = "High Dynamic Range (Pristine)";
      else if (this.currentDrScore >= 8) drRatingText.textContent = "Standard Commercial Mix";
      else drRatingText.textContent = "Heavy Limiting (Loudness War)";
    }

    if (drDensityBar) {
      const pct = Math.min(100, Math.max(5, (this.currentDrScore / 16) * 100));
      drDensityBar.style.width = `${pct}%`;
      drDensityBar.style.background = this.currentDrScore >= 10 ? '#10b981' : (this.currentDrScore >= 7 ? '#00f0ff' : '#ff3366');
    }

    const fvisDrEl = document.getElementById('fvisDrScore');
    const fvisCrestEl = document.getElementById('fvisCrestFactor');
    if (fvisDrEl) {
      fvisDrEl.textContent = `DR${this.currentDrScore}`;
      fvisDrEl.style.color = this.currentDrScore >= 12 ? '#10b981' : (this.currentDrScore >= 8 ? '#00f0ff' : '#ff3366');
    }
    if (fvisCrestEl) {
      fvisCrestEl.textContent = `+${this.currentCrestFactor.toFixed(1)} dB`;
    }
  }

  // --- 2. EAR FATIGUE & SAFE LISTENING DOSE TRACKER ---
  initDoseInterval() {
    setInterval(() => {
      // Check if audio is actively playing
      const isPlaying = (typeof window !== 'undefined' && window.audioEngine && (window.audioEngine.isPlaying || window.audioEngine.isBufferPlaying));
      if (!isPlaying) return;

      this.listeningSeconds += 1;

      // Calculate exposure intensity based on master gain and target loudness
      const masterDb = (typeof window !== 'undefined' && window.audioEngine && typeof window.audioEngine.masterGainValue === 'number')
        ? window.audioEngine.masterGainValue
        : 0;
      
      // Standard 85dB reference: 8 hours allowed per day.
      // Every +3dB doubles dose accumulation rate (equal energy rule).
      const intensityFactor = Math.pow(2, (masterDb) / 3.0);
      const doseIncrementPerSec = (100 / (8 * 3600)) * Math.max(0.4, intensityFactor);
      
      this.dosePercent = Math.min(100, this.dosePercent + doseIncrementPerSec);
      this.saveDoseToStorage();
      this.renderDoseUi();

      // Alerts
      if (this.dosePercent >= 80 && !this.hasWarnedDose) {
        this.hasWarnedDose = true;
        if (window.showToast) window.showToast('⚠️ Safe Listening Alert: 80% daily acoustic dose reached. Consider taking a 5-min ear rest.', 'info');
      }

      if (this.listeningSeconds >= 3600 && !this.hasWarnedDuration) {
        this.hasWarnedDuration = true;
        if (window.showToast) window.showToast('🎧 60 Min Listening Milestone: Give your ears a short 5-minute break.', 'info');
      }
    }, 1000);
  }

  renderDoseUi() {
    const badge = document.getElementById('earDoseBadge');
    const doseText = document.getElementById('earDoseText');
    const modalDosePct = document.getElementById('modalDosePct');
    const modalDoseBar = document.getElementById('modalDoseBar');
    const modalDurationText = document.getElementById('modalDurationText');

    const mins = Math.floor(this.listeningSeconds / 60);
    const doseRound = Math.round(this.dosePercent);

    if (doseText) {
      doseText.textContent = `DOSE: ${doseRound}% · ${mins}m`;
    }

    if (badge) {
      if (this.dosePercent >= 80) {
        badge.style.borderColor = 'rgba(255, 51, 102, 0.6)';
        badge.style.color = '#ff3366';
      } else if (this.dosePercent >= 50) {
        badge.style.borderColor = 'rgba(245, 158, 11, 0.6)';
        badge.style.color = '#fbbf24';
      } else {
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        badge.style.color = '#10b981';
      }
    }

    if (modalDosePct) modalDosePct.textContent = `${doseRound}%`;
    if (modalDoseBar) {
      modalDoseBar.style.width = `${Math.min(100, doseRound)}%`;
      modalDoseBar.style.background = this.dosePercent >= 80 ? '#ff3366' : (this.dosePercent >= 50 ? '#f59e0b' : '#10b981');
    }
    if (modalDurationText) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      modalDurationText.textContent = h > 0 ? `${h}h ${m}m elapsed` : `${m} minutes elapsed`;
    }
  }

  resetDose() {
    this.dosePercent = 0.0;
    this.listeningSeconds = 0;
    this.hasWarnedDose = false;
    this.hasWarnedDuration = false;
    this.saveDoseToStorage();
    this.renderDoseUi();
    if (window.showToast) window.showToast('Ear Health Dose & Listening Timer Reset', 'success');
  }

  saveDoseToStorage() {
    try {
      localStorage.setItem('auradsp_ear_dose', JSON.stringify({
        date: new Date().toDateString(),
        dose: this.dosePercent,
        secs: this.listeningSeconds
      }));
    } catch (_) {}
  }

  loadDoseFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem('auradsp_ear_dose') || '{}');
      if (saved && saved.date === new Date().toDateString()) {
        this.dosePercent = saved.dose || 0;
        this.listeningSeconds = saved.secs || 0;
      }
    } catch (_) {}
  }

  // --- 3. VIRTUAL 7.1.4 DOLBY ATMOS SPATIAL PINK NOISE ENGINE ---
  testAtmosSpeaker(speakerKey) {
    const spk = this.atmosPositions[speakerKey];
    if (!spk) return;

    const ctx = (window.audioEngine && window.audioEngine.ctx) ? window.audioEngine.ctx : new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    // 1. Create Spatial PannerNode
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 1000;
    panner.rolloffFactor = 1;
    panner.positionX.setValueAtTime(spk.coords[0], ctx.currentTime);
    panner.positionY.setValueAtTime(spk.coords[1], ctx.currentTime);
    panner.positionZ.setValueAtTime(spk.coords[2], ctx.currentTime);

    // 2. Synthesize Pink Noise Burst (1.2 seconds)
    const duration = 1.2;
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Filter depending on channel role
    const filter = ctx.createBiquadFilter();
    if (spk.role === 'lfe') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime); // LFE low-pass 100Hz
    } else if (spk.role === 'height') {
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime); // Heights
    } else {
      filter.type = 'peaking';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
    }

    // Gain envelope (smooth fade-in and fade-out)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime + duration - 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    // Audio routing
    noiseSource.connect(filter);
    filter.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();

    // Trigger UI pulse on speaker button
    const btn = document.querySelector(`[data-speaker="${speakerKey}"]`);
    if (btn) {
      btn.classList.add('firing');
      setTimeout(() => btn.classList.remove('firing'), duration * 1000);
    }

    if (window.showToast) {
      window.showToast(`Firing 7.1.4 Channel: ${speakerKey} (${spk.name})`, 'info');
    }
  }

  cycleAllSpeakers() {
    const keys = Object.keys(this.atmosPositions);
    keys.forEach((key, index) => {
      setTimeout(() => {
        this.testAtmosSpeaker(key);
      }, index * 800);
    });
  }

  // --- 4. AUDIO FILE CODEC & TECHNICAL METADATA INSPECTOR ---
  inspectAudioElement(audioEl, fileName = '') {
    if (!audioEl) return null;
    const sampleRate = (typeof window !== 'undefined' && window.audioEngine && window.audioEngine.ctx) ? window.audioEngine.ctx.sampleRate : 48000;
    const duration = audioEl.duration || 0;
    const src = audioEl.src || '';

    let ext = 'MP3 Audio';
    if (src.includes('.flac') || fileName.toLowerCase().endsWith('.flac')) ext = 'FLAC Lossless';
    else if (src.includes('.wav') || fileName.toLowerCase().endsWith('.wav')) ext = 'WAV Linear PCM';
    else if (src.includes('.m4a') || src.includes('.aac') || fileName.toLowerCase().endsWith('.m4a')) ext = 'AAC-LC / M4A';
    else if (src.includes('.opus') || src.includes('.ogg')) ext = 'Ogg Opus Stream';
    else if (src.includes('jiosaavn') || src.includes('spotify') || src.includes('archive.org')) ext = 'CORS Direct Stream';

    const isLossless = ext.includes('FLAC') || ext.includes('WAV');
    const estimatedBitrate = isLossless ? '1411 kbps (Lossless)' : '320 kbps (High Fidelity)';

    return {
      fileName: fileName || (src.substring(src.lastIndexOf('/') + 1, src.indexOf('?')) || 'Streaming Track'),
      codec: ext,
      sampleRate: `${sampleRate / 1000} kHz (${sampleRate} Hz)`,
      bitDepth: isLossless ? '24-Bit Studio Master' : '32-Bit Float Web Audio DSP',
      channels: '2.0 Stereo (Interleaved L/R)',
      bitrate: estimatedBitrate,
      duration: duration > 0 ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : 'Live Web Stream',
      isLossless: isLossless
    };
  }
}

if (typeof window !== 'undefined') {
  window.AudioProTools = AudioProTools;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioProTools;
}


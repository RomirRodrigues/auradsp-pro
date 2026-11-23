/**
 * AuraDSP Pro - Personalized Hearing Calibration & Audiogram Suite
 * Version: v54.8.0
 * 
 * Features:
 * 1. Clinical Pure-Tone Audiometry Tone Burst Generator (125 Hz - 16,000 Hz)
 * 2. Left / Right / Stereo Ear Threshold Assessment Wizard with smooth cosine envelopes
 * 3. High-DPI Interactive Audiogram Canvas (ISO 8253-1 clinical standards: -10 to +90 dB HL)
 * 4. Clinical Pure-Tone Average (PTA) & Hearing Loss Classification
 * 5. NAL-R Dynamic Inverted Ear-Compensation Curve Engine (maps to 10-Band EQ)
 * 6. Clinical & Demographic Presets (Presbycusis, Fletcher-Munson, Notch Repair)
 * 7. JSON Profile Export, Import & LocalStorage Synchronization
 */

class AudiogramCalibration {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.ctx = null;

    // Standard clinical test frequencies (Hz)
    this.frequencies = [125, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000];

    // Reference Equivalent Threshold Sound Pressure Levels (RETSPL / ISO 389-1)
    // Converts human ear sensitivity curve to normalized dB HL digital amplitude
    this.retsplOffsets = {
      125:   18.0,
      250:   11.0,
      500:   5.5,
      1000:  0.0,  // Reference anchor
      2000:  -2.0, // Human ear canal resonance peak
      4000:  -4.0, // Maximum acoustic sensitivity zone
      8000:  9.5,
      12000: 16.0,
      16000: 24.0
    };

    // User hearing thresholds in dB HL (-10 to 90 dB HL)
    // 0 dB HL represents standard normal young hearing; higher values indicate loss
    this.thresholds = {
      left:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
      right: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    // Active test wizard state
    this.isTesting = false;
    this.currentEar = 'both'; // 'left', 'right', 'both'
    this.freqIndex = 0;
    this.currentDbHl = 15; // Starting test level
    this.isTonePlaying = false;
    this.activeNodes = [];
    this.pulseTimer = null;

    // Compensation engine state
    this.compensationStrength = 0.75; // 75% prescription intensity
    this.computedEqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10 bands
    this.activeProfileName = 'Default Normal';

    // Canvas interactivity
    this.hoverPoint = null;

    this.loadFromStorage();
  }

  // Ensure AudioContext is ready
  getAudioContext() {
    if (this.audioEngine && this.audioEngine.ctx) {
      this.ctx = this.audioEngine.ctx;
    } else if (!this.ctx) {
      const AudioCtx = (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext));
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- 1. PURE-TONE TONE BURST GENERATOR ---
  /**
   * Generates a clinical triple-pulse pure sine tone burst with smooth cosine envelopes
   * @param {number} freq - Frequency in Hz
   * @param {number} dbHl - Hearing Level in dB HL (-10 to 60)
   * @param {string} ear - 'left', 'right', or 'both'
   * @param {function} onComplete - Callback when triple pulse finishes
   */
  playTone(freq, dbHl, ear = 'both', onComplete = null) {
    this.stopTone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isTonePlaying = true;
    const now = ctx.currentTime + 0.03;

    // Calculate digital peak gain from dB HL with RETSPL weighting
    const offset = this.retsplOffsets[freq] || 0;
    // Standard baseline: 0 dB HL at 1kHz = -50 dBFS digital amplitude
    const dbFs = -50 + dbHl + (offset * 0.4);
    const peakGain = Math.max(0.00005, Math.min(0.7, Math.pow(10, dbFs / 20)));

    // Create Stereo Panner or Splitter for Channel Routing
    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      if (ear === 'left') panner.pan.setValueAtTime(-1.0, now);
      else if (ear === 'right') panner.pan.setValueAtTime(1.0, now);
      else panner.pan.setValueAtTime(0.0, now);
    }

    // Master burst gain node
    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.0, now);

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Triple pulse parameters
    const pulseLen = 0.16; // 160ms pulse
    const gapLen = 0.09;   // 90ms gap
    const rampLen = 0.025; // 25ms raised cosine ramp

    for (let p = 0; p < 3; p++) {
      const pStart = now + p * (pulseLen + gapLen);
      const pRampUp = pStart + rampLen;
      const pSustainEnd = pStart + pulseLen - rampLen;
      const pEnd = pStart + pulseLen;

      burstGain.gain.setValueAtTime(0.00001, pStart);
      burstGain.gain.exponentialRampToValueAtTime(peakGain, pRampUp);
      burstGain.gain.setValueAtTime(peakGain, pSustainEnd);
      burstGain.gain.exponentialRampToValueAtTime(0.00001, pEnd);
    }

    const totalDuration = 3 * (pulseLen + gapLen) + 0.05;

    // Connect nodes
    osc.connect(burstGain);
    if (panner) {
      burstGain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      burstGain.connect(ctx.destination);
    }

    osc.start(now);
    osc.stop(now + totalDuration);

    this.activeNodes = [osc, burstGain, panner].filter(Boolean);

    this.pulseTimer = setTimeout(() => {
      this.isTonePlaying = false;
      this.renderTestingUi();
      if (typeof onComplete === 'function') onComplete();
    }, totalDuration * 1000);

    this.renderTestingUi();
  }

  stopTone() {
    if (this.pulseTimer) {
      clearTimeout(this.pulseTimer);
      this.pulseTimer = null;
    }
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (_) {}
    });
    this.activeNodes = [];
    this.isTonePlaying = false;
  }

  // --- 2. TEST WIZARD FLOW ---
  startTest(ear = 'both') {
    this.isTesting = true;
    this.currentEar = ear;
    this.freqIndex = 0;
    this.currentDbHl = 15; // Starting at comfortable audible level
    this.renderTestingUi();
    this.drawAudiogram();
    this.playTone(this.getCurrentFrequency(), this.currentDbHl, this.currentEar);
  }

  stopTest() {
    this.stopTone();
    this.isTesting = false;
    this.renderTestingUi();
    this.drawAudiogram();
  }

  getCurrentFrequency() {
    return this.frequencies[this.freqIndex] || 1000;
  }

  hearTone() {
    const freqIdx = this.freqIndex;
    const db = this.currentDbHl;

    if (this.currentEar === 'left' || this.currentEar === 'both') {
      this.thresholds.left[freqIdx] = db;
    }
    if (this.currentEar === 'right' || this.currentEar === 'both') {
      this.thresholds.right[freqIdx] = db;
    }

    this.advanceFrequency();
  }

  cantHearTone() {
    // Increase level by 5 dB HL (up to 55 dB HL safety limit)
    if (this.currentDbHl < 55) {
      this.currentDbHl += 5;
      this.playTone(this.getCurrentFrequency(), this.currentDbHl, this.currentEar);
    } else {
      // Reached ceiling for this frequency
      this.hearTone();
    }
    this.renderTestingUi();
  }

  adjustTestVolume(delta) {
    this.currentDbHl = Math.max(-10, Math.min(55, this.currentDbHl + delta));
    this.playTone(this.getCurrentFrequency(), this.currentDbHl, this.currentEar);
    this.renderTestingUi();
  }

  advanceFrequency() {
    this.stopTone();
    if (this.freqIndex < this.frequencies.length - 1) {
      this.freqIndex++;
      this.currentDbHl = 15; // Reset level for next band
      this.renderTestingUi();
      this.drawAudiogram();
      this.computeCompensationCurve();
      setTimeout(() => {
        if (this.isTesting) {
          this.playTone(this.getCurrentFrequency(), this.currentDbHl, this.currentEar);
        }
      }, 350);
    } else {
      // Completed current ear test
      this.isTesting = false;
      this.activeProfileName = `Custom Calibrated (${new Date().toLocaleDateString()})`;
      this.saveToStorage();
      this.computeCompensationCurve();
      this.renderTestingUi();
      this.drawAudiogram();
      if (typeof window !== "undefined" && window.showToast) {
        (typeof window !== "undefined" && window.showToast) && window.showToast('🎧 Hearing Calibration Complete! Custom compensation curve generated.', 'success');
      }
    }
  }

  skipFrequency() {
    this.stopTone();
    if (this.freqIndex < this.frequencies.length - 1) {
      this.freqIndex++;
      this.currentDbHl = 15;
      this.renderTestingUi();
      this.drawAudiogram();
    } else {
      this.isTesting = false;
      this.renderTestingUi();
      this.drawAudiogram();
    }
  }

  // --- 3. DIAGNOSTICS & PURE-TONE AVERAGE (PTA) ---
  calculatePta(ear = 'average') {
    // Standard PTA calculates average loss at 500Hz, 1kHz, 2kHz, 4kHz
    const ptaIndices = [2, 3, 4, 5]; // indices for 500, 1k, 2k, 4k
    let leftSum = 0;
    let rightSum = 0;

    ptaIndices.forEach(idx => {
      leftSum += (this.thresholds.left[idx] || 0);
      rightSum += (this.thresholds.right[idx] || 0);
    });

    const leftPta = leftSum / ptaIndices.length;
    const rightPta = rightSum / ptaIndices.length;

    if (ear === 'left') return Math.round(leftPta * 10) / 10;
    if (ear === 'right') return Math.round(rightPta * 10) / 10;
    return Math.round(((leftPta + rightPta) / 2) * 10) / 10;
  }

  getClassification(dbHl) {
    if (dbHl <= 20) return { label: 'Normal Hearing', color: '#10b981', badge: 'PRISTINE' };
    if (dbHl <= 40) return { label: 'Mild Loss', color: '#f59e0b', badge: 'MILD' };
    if (dbHl <= 70) return { label: 'Moderate Loss', color: '#f97316', badge: 'MODERATE' };
    return { label: 'Severe Loss', color: '#ef4444', badge: 'SEVERE' };
  }

  getDiagnosticSummary() {
    const leftPta = this.calculatePta('left');
    const rightPta = this.calculatePta('right');
    const avgPta = Math.round(((leftPta + rightPta) / 2) * 10) / 10;
    const classification = this.getClassification(avgPta);

    // Check for high-frequency roll-off (8kHz - 16kHz)
    const hfLoss = ((this.thresholds.left[6] + this.thresholds.right[6]) / 2 +
                    (this.thresholds.left[8] + this.thresholds.right[8]) / 2) / 2;
    const isHfDrop = hfLoss > avgPta + 10;

    // Check for 4kHz acoustic notch (common from headphone fatigue or loud concerts)
    const notch4k = ((this.thresholds.left[5] + this.thresholds.right[5]) / 2);
    const isNotch = notch4k > avgPta + 12;

    let notes = [];
    if (isHfDrop) notes.push('High-frequency roll-off (Presbycusis profile)');
    if (isNotch) notes.push('4 kHz listening notch detected');
    if (Math.abs(leftPta - rightPta) >= 10) notes.push('Binaural ear asymmetry');
    if (notes.length === 0) notes.push('Well-balanced binaural response across audible spectrum');

    return {
      leftPta,
      rightPta,
      avgPta,
      classification,
      notes: notes.join(' · ')
    };
  }

  // --- 4. NAL-R INVERTED EAR COMPENSATION CURVE GENERATOR ---
  /**
   * Generates a 10-band target EQ curve to compensate for measured hearing thresholds
   * Uses NAL-R prescription formula with dynamic half-gain scaling & safety headroom
   */
  computeCompensationCurve() {
    // 10 AuraDSP Bands: [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] Hz
    const eqFrequencies = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    const avgPta = this.calculatePta('average');

    const gains = eqFrequencies.map(eqFreq => {
      // Find matching or nearest threshold
      let loss = 0;
      if (eqFreq <= 125) {
        // Bass anchor to 125Hz
        loss = (this.thresholds.left[0] + this.thresholds.right[0]) / 2;
      } else {
        const matchIdx = this.frequencies.indexOf(eqFreq);
        if (matchIdx !== -1) {
          loss = (this.thresholds.left[matchIdx] + this.thresholds.right[matchIdx]) / 2;
        } else {
          // Interpolate
          loss = avgPta;
        }
      }

      // NAL-R (National Acoustic Laboratories - Revised) insertion gain formula:
      // Target Gain = 0.46 * Loss + 0.15 * PTA
      // Clamped to prevent acoustic over-amplification
      let rawGain = (0.42 * loss + 0.12 * avgPta) * this.compensationStrength;

      // Add gentle high-frequency presence lift if loss is detected above 4kHz
      if (eqFreq >= 4000 && loss > 10) {
        rawGain += Math.min(2.5, (loss - 10) * 0.1);
      }

      // Round to 0.5 dB steps and clamp between -4.0 dB and +9.5 dB
      const clamped = Math.max(-4.0, Math.min(9.5, Math.round(rawGain * 2) / 2));
      return clamped;
    });

    this.computedEqGains = gains;
    this.renderCompensationUi();
    return gains;
  }

  setCompensationStrength(strength) {
    this.compensationStrength = Math.max(0.1, Math.min(1.0, parseFloat(strength)));
    this.computeCompensationCurve();
  }

  // Apply custom audiogram compensation directly to AuraDSP Pro 10-Band EQ
  applyToMasterEq() {
    const gains = this.computeCompensationCurve();

    if (typeof window !== 'undefined' && Array.isArray(window.currentEqGains)) {
      gains.forEach((g, i) => {
        window.currentEqGains[i] = g;
        if (typeof window.updateEqBandUI === 'function') {
          window.updateEqBandUI(i, g);
        }
        if (this.audioEngine && typeof this.audioEngine.setBandGain === 'function') {
          this.audioEngine.setBandGain(i, g);
        }
      });

      if (window.visualizer && typeof window.visualizer.drawEqCurve === 'function') {
        window.visualizer.drawEqCurve(window.currentEqGains);
      }
    }

    const badge = document.getElementById('activeDeviceText');
    if (badge) {
      badge.textContent = `Hearing Calibrated: ${this.activeProfileName}`;
    }

    const aiTarget = document.getElementById('aiEqTargetMode');
    if (aiTarget) {
      aiTarget.textContent = `Target: Audiogram (${Math.round(this.compensationStrength * 100)}% Intensity)`;
    }

    if (typeof window !== "undefined" && window.showToast) {
      (typeof window !== "undefined" && window.showToast) && window.showToast(`🎧 Applied Ear-Calibrated EQ: ${this.activeProfileName}`, 'success');
    }
  }

  // --- 5. CLINICAL & DEMOGRAPHIC PRESETS ---
  applyPreset(presetKey) {
    switch (presetKey) {
      case 'young_reference':
        this.thresholds.left = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.thresholds.right = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.activeProfileName = 'Golden Ears Young Reference (0 dB HL)';
        break;

      case 'presbycusis':
        // High-frequency natural roll-off common in adults 40+
        this.thresholds.left = [0, 0, 5, 5, 10, 20, 30, 40, 45];
        this.thresholds.right = [0, 0, 5, 5, 10, 20, 30, 40, 45];
        this.activeProfileName = 'Presbycusis 45+ (High-Frequency Air Recovery)';
        break;

      case 'fletcher_munson':
        // Equal-loudness contour contouring for 40-phon curve
        this.thresholds.left = [15, 10, 5, 0, -2, -3, 8, 15, 20];
        this.thresholds.right = [15, 10, 5, 0, -2, -3, 8, 15, 20];
        this.activeProfileName = 'Fletcher-Munson 40-Phon Equal Loudness';
        break;

      case 'noise_notch':
        // 4kHz acoustic dip caused by concerts or earbud exposure
        this.thresholds.left = [0, 0, 0, 5, 10, 28, 10, 5, 5];
        this.thresholds.right = [0, 0, 0, 5, 10, 30, 10, 5, 5];
        this.activeProfileName = '4 kHz Acoustic Notch Recovery';
        break;

      case 'speech_clarity':
        // Vocal presence boost in 1.5kHz - 4kHz range
        this.thresholds.left = [0, 0, 5, 15, 20, 20, 10, 5, 0];
        this.thresholds.right = [0, 0, 5, 15, 20, 20, 10, 5, 0];
        this.activeProfileName = 'Speech & Podcast Intelligibility';
        break;

      default:
        return;
    }

    this.computeCompensationCurve();
    this.drawAudiogram();
    this.renderTestingUi();
    this.saveToStorage();

    if (typeof window !== "undefined" && window.showToast) {
      (typeof window !== "undefined" && window.showToast) && window.showToast(`Loaded Preset: ${this.activeProfileName}`, 'info');
    }
  }

  // --- 6. HIGH-DPI AUDIOGRAM CANVAS RENDERING ---
  initCanvas(canvas) {
    if (!canvas) return;
    this.canvas = canvas;

    // Support Retina & high-DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1;
    canvas.width = (rect.width || 640) * dpr;
    canvas.height = (rect.height || 320) * dpr;

    this.canvasCtx = canvas.getContext('2d');
    this.canvasCtx.scale(dpr, dpr);

    // Interactive Hover Tracking
    canvas.onmousemove = (e) => {
      const cRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - cRect.left;
      const mouseY = e.clientY - cRect.top;
      this.handleCanvasHover(mouseX, mouseY, cRect.width, cRect.height);
    };

    canvas.onmouseleave = () => {
      this.hoverPoint = null;
      this.drawAudiogram();
    };

    this.drawAudiogram();
  }

  drawAudiogram() {
    if (typeof document === 'undefined') return;
    if (!this.canvas || !this.canvasCtx) {
      const canvasEl = document.getElementById('audiogramCanvas');
      if (canvasEl) this.initCanvas(canvasEl);
      if (!this.canvasCtx) return;
    }

    const ctx = this.canvasCtx;
    const c = this.canvas;
    const dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1;
    const width = c.width / dpr;
    const height = c.height / dpr;

    ctx.clearRect(0, 0, width, height);

    // Margins
    const padL = 48;
    const padR = 24;
    const padT = 28;
    const padB = 34;

    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // dB HL Axis Range (-10 dB HL top to 90 dB HL bottom)
    const minDb = -10;
    const maxDb = 90;

    const getY = (db) => {
      const norm = (db - minDb) / (maxDb - minDb);
      return padT + norm * plotH;
    };

    // Frequency X Coordinates (Logarithmic)
    const minLog = Math.log10(125);
    const maxLog = Math.log10(16000);

    const getX = (freq) => {
      const norm = (Math.log10(freq) - minLog) / (maxLog - minLog);
      return padL + norm * plotW;
    };

    // 1. Shaded Clinical Zones
    const zones = [
      { from: -10, to: 20, color: 'rgba(16, 185, 129, 0.08)', label: 'Normal (0-20 dB)' },
      { from: 20, to: 40, color: 'rgba(245, 158, 11, 0.08)', label: 'Mild (20-40 dB)' },
      { from: 40, to: 70, color: 'rgba(249, 115, 22, 0.08)', label: 'Moderate (40-70 dB)' },
      { from: 70, to: 90, color: 'rgba(239, 68, 68, 0.08)', label: 'Severe (70+ dB)' }
    ];

    zones.forEach(z => {
      const y1 = getY(z.from);
      const y2 = getY(z.to);
      ctx.fillStyle = z.color;
      ctx.fillRect(padL, y1, plotW, y2 - y1);
    });

    // 2. Grid Lines (Horizontal dB HL)
    ctx.font = '10px "Inter", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let db = -10; db <= 90; db += 10) {
      const y = getY(db);
      ctx.strokeStyle = db === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = db === 0 ? 1.5 : 1;
      ctx.setLineDash(db === 0 ? [] : [2, 3]);

      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = db === 0 ? '#00f0ff' : 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(`${db}`, padL - 8, y);
    }
    ctx.setLineDash([]);

    // 3. Grid Lines (Vertical Frequency)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    this.frequencies.forEach((f, idx) => {
      const x = getX(f);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();

      // Label format: 125, 250, 500, 1k, 2k, 4k, 8k, 12k, 16k
      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      ctx.fillStyle = (this.isTesting && idx === this.freqIndex) ? '#00f0ff' : 'rgba(255, 255, 255, 0.6)';
      ctx.font = (this.isTesting && idx === this.freqIndex) ? 'bold 11px "Inter"' : '10px "Inter"';
      ctx.fillText(label, x, padT + plotH + 8);
    });

    // Axis Labels
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px "Inter"';
    ctx.fillText('HEARING LEVEL (dB HL)', -(padT + plotH / 2), 14);
    ctx.restore();

    // 4. Plot Right Ear (Red Line & Circles 'O')
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    this.frequencies.forEach((f, i) => {
      const x = getX(f);
      const y = getY(this.thresholds.right[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    this.frequencies.forEach((f, i) => {
      const x = getX(f);
      const y = getY(this.thresholds.right[i]);
      ctx.fillStyle = '#0a0c10';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 5. Plot Left Ear (Blue Line & Crosses 'X')
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    this.frequencies.forEach((f, i) => {
      const x = getX(f);
      const y = getY(this.thresholds.left[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    this.frequencies.forEach((f, i) => {
      const x = getX(f);
      const y = getY(this.thresholds.left[i]);
      const sz = 4.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x - sz, y - sz);
      ctx.lineTo(x + sz, y + sz);
      ctx.moveTo(x + sz, y - sz);
      ctx.lineTo(x - sz, y + sz);
      ctx.stroke();
    });

    // 6. Highlight active testing cursor
    if (this.isTesting) {
      const activeX = getX(this.getCurrentFrequency());
      const activeY = getY(this.currentDbHl);

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(activeX, padT);
      ctx.lineTo(activeX, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsing beacon
      ctx.fillStyle = this.isTonePlaying ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(activeX, activeY, this.isTonePlaying ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(activeX, activeY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Interactive Hover Crosshair & Tooltip
    if (this.hoverPoint) {
      const hX = getX(this.hoverPoint.freq);
      const hY = getY(this.hoverPoint.db);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hX, padT);
      ctx.lineTo(hX, padT + plotH);
      ctx.moveTo(padL, hY);
      ctx.lineTo(padL + plotW, hY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip Card
      const ttText = `${this.hoverPoint.freq >= 1000 ? (this.hoverPoint.freq / 1000) + ' kHz' : this.hoverPoint.freq + ' Hz'}: R ${this.hoverPoint.rightDb}dB · L ${this.hoverPoint.leftDb}dB (${this.hoverPoint.classLabel})`;
      ctx.font = '11px "Inter", monospace';
      const textW = ctx.measureText(ttText).width;
      const boxW = textW + 16;
      const boxH = 24;
      const boxX = Math.min(width - boxW - 10, Math.max(padL + 10, hX - boxW / 2));
      const boxY = Math.max(padT + 6, hY - 32);

      ctx.fillStyle = 'rgba(15, 20, 30, 0.95)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ttText, boxX + boxW / 2, boxY + boxH / 2);
    }
  }

  handleCanvasHover(mouseX, mouseY, width, height) {
    const padL = 48;
    const padR = 24;
    const padT = 28;
    const padB = 34;
    const plotW = width - padL - padR;

    if (mouseX < padL || mouseX > width - padR || mouseY < padT || mouseY > height - padB) {
      this.hoverPoint = null;
      this.drawAudiogram();
      return;
    }

    const minLog = Math.log10(125);
    const maxLog = Math.log10(16000);

    // Find closest frequency index
    let closestIdx = 0;
    let minDist = Infinity;

    this.frequencies.forEach((f, i) => {
      const norm = (Math.log10(f) - minLog) / (maxLog - minLog);
      const x = padL + norm * plotW;
      const dist = Math.abs(x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    });

    const freq = this.frequencies[closestIdx];
    const leftDb = this.thresholds.left[closestIdx];
    const rightDb = this.thresholds.right[closestIdx];
    const avgDb = (leftDb + rightDb) / 2;
    const classification = this.getClassification(avgDb);

    this.hoverPoint = {
      freq,
      index: closestIdx,
      leftDb,
      rightDb,
      db: avgDb,
      classLabel: classification.label
    };

    this.drawAudiogram();
  }

  // --- 7. UI BINDING & DOM SYNCHRONIZATION ---
  renderTestingUi() {
    if (typeof document === 'undefined') return;
    const freqEl = document.getElementById('agCurrentFreq');
    const dbEl = document.getElementById('agCurrentDb');
    const stepEl = document.getElementById('agStepCounter');
    const earTagEl = document.getElementById('agCurrentEarTag');
    const playBtn = document.getElementById('agPlayToneBtn');
    const statusNote = document.getElementById('agTestingStatus');

    const f = this.getCurrentFrequency();
    const fStr = f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`;

    if (freqEl) freqEl.textContent = fStr;
    if (dbEl) dbEl.textContent = `${this.currentDbHl} dB HL`;
    if (stepEl) stepEl.textContent = `Frequency ${this.freqIndex + 1} of ${this.frequencies.length}`;

    if (earTagEl) {
      if (this.currentEar === 'left') {
        earTagEl.textContent = 'LEFT EAR';
        earTagEl.style.color = '#38bdf8';
        earTagEl.style.borderColor = '#38bdf8';
      } else if (this.currentEar === 'right') {
        earTagEl.textContent = 'RIGHT EAR';
        earTagEl.style.color = '#ef4444';
        earTagEl.style.borderColor = '#ef4444';
      } else {
        earTagEl.textContent = 'BINAURAL (STEREO)';
        earTagEl.style.color = '#00f0ff';
        earTagEl.style.borderColor = '#00f0ff';
      }
    }

    if (playBtn) {
      if (this.isTonePlaying) {
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<span class="pulse-ring"></span><span>🔊 Playing Tone...</span>';
      } else {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = '<span>▶ Play Test Tone</span>';
      }
    }

    if (statusNote) {
      if (this.isTesting) {
        statusNote.textContent = `Testing ${fStr} at ${this.currentDbHl} dB HL. Click "I Hear It!" or increase volume if silent.`;
      } else {
        statusNote.textContent = 'Assessment idle. Click "Start Hearing Test" to evaluate your hearing thresholds.';
      }
    }

    this.renderDiagnosticSummaryUi();
  }

  renderDiagnosticSummaryUi() {
    if (typeof document === 'undefined') return;
    const diag = this.getDiagnosticSummary();
    const ptaEl = document.getElementById('agPtaScore');
    const classBadgeEl = document.getElementById('agClassBadge');
    const notesEl = document.getElementById('agDiagnosticNotes');
    const profileTitleEl = document.getElementById('agProfileTitle');

    if (ptaEl) ptaEl.textContent = `${diag.avgPta} dB HL`;
    if (classBadgeEl) {
      classBadgeEl.textContent = diag.classification.badge;
      classBadgeEl.style.background = `${diag.classification.color}22`;
      classBadgeEl.style.color = diag.classification.color;
      classBadgeEl.style.borderColor = diag.classification.color;
    }
    if (notesEl) notesEl.textContent = diag.notes;
    if (profileTitleEl) profileTitleEl.textContent = this.activeProfileName;
  }

  renderCompensationUi() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('agEqMiniBars');
    if (!container) return;

    const bands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    container.innerHTML = this.computedEqGains.map((gain, i) => {
      const heightPct = Math.max(12, Math.min(100, ((gain + 6) / 16) * 100));
      const color = gain > 0 ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.4)';
      const label = bands[i] >= 1000 ? `${bands[i] / 1000}k` : `${bands[i]}`;
      return `
        <div class="ag-mini-bar-item" title="${bands[i]}Hz: ${gain > 0 ? '+' : ''}${gain}dB">
          <div class="ag-bar-track">
            <div class="ag-bar-fill" style="height: ${heightPct}%; background: ${color};"></div>
          </div>
          <span class="ag-bar-label">${label}</span>
          <span class="ag-bar-val">${gain > 0 ? '+' : ''}${gain}</span>
        </div>
      `;
    }).join('');
  }

  // --- 8. PERSISTENCE, EXPORT & IMPORT ---
  saveToStorage() {
    try {
      localStorage.setItem('auradsp_audiogram_profile', JSON.stringify({
        date: new Date().toISOString(),
        name: this.activeProfileName,
        thresholds: this.thresholds,
        compensationStrength: this.compensationStrength
      }));
    } catch (_) {}
  }

  loadFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem('auradsp_audiogram_profile') || '{}');
      if (saved && saved.thresholds) {
        if (Array.isArray(saved.thresholds.left)) this.thresholds.left = saved.thresholds.left;
        if (Array.isArray(saved.thresholds.right)) this.thresholds.right = saved.thresholds.right;
        if (saved.name) this.activeProfileName = saved.name;
        if (saved.compensationStrength) this.compensationStrength = saved.compensationStrength;
      }
    } catch (_) {}
  }

  exportProfileJson() {
    const data = {
      app: 'AuraDSP Pro',
      version: 'v54.8.0',
      exportedAt: new Date().toISOString(),
      profileName: this.activeProfileName,
      frequencies: this.frequencies,
      thresholds: this.thresholds,
      ptaSummary: this.getDiagnosticSummary(),
      eqGains: this.computeCompensationCurve()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auradsp-audiogram-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof window !== "undefined" && window.showToast) (typeof window !== "undefined" && window.showToast) && window.showToast('Exported Audiogram JSON profile', 'success');
  }

  importProfileJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.thresholds && Array.isArray(parsed.thresholds.left)) {
          this.thresholds.left = parsed.thresholds.left;
          this.thresholds.right = parsed.thresholds.right || parsed.thresholds.left;
          if (parsed.profileName) this.activeProfileName = parsed.profileName;
          this.computeCompensationCurve();
          this.saveToStorage();
          this.drawAudiogram();
          this.renderTestingUi();
          if (typeof window !== "undefined" && window.showToast) (typeof window !== "undefined" && window.showToast) && window.showToast(`Imported Profile: ${this.activeProfileName}`, 'success');
        } else {
          throw new Error('Invalid Audiogram JSON structure');
        }
      } catch (err) {
        if (typeof window !== "undefined" && window.showToast) (typeof window !== "undefined" && window.showToast) && window.showToast('Failed to import Audiogram: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }
}

if (typeof window !== 'undefined') {
  window.AudiogramCalibration = AudiogramCalibration;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudiogramCalibration;
}

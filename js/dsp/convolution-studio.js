/**
 * AuraDSP Pro - Studio Convolution Reverb & Room Impulse Response (IR) Simulator
 * Version: v54.9.0
 * 
 * Features:
 * 1. Physical Acoustic Ray-Tracing & Stochastic Velvet-Noise IR Synthesizer
 * 2. 8 Curated Iconic Studio & Acoustic Space Presets (Abbey Road, Sydney Opera, Notre-Dame, Car Cabin, etc.)
 * 3. High-DPI Interactive Waveform & Schroeder Energy Decay Curve (EDC / RT60) Canvas
 * 4. User Custom IR Audio File Loader (Drag & Drop .WAV, .MP3, .FLAC)
 * 5. Instant Acoustic Audition Stimulus Triggers (Dirac Click, Studio Rimshot, 1kHz Burst)
 * 6. Studio 24-bit WAV Impulse Response Exporter for external DAWs
 * 7. Seamless Web Audio ConvolverNode & Reverb Gain Node Integration
 */

class ConvolutionStudio {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.ctx = null;

    // Iconic Studio & Acoustic Spaces
    this.presets = {
      abbey_road: {
        name: "Abbey Road Studio 2",
        category: "Studio Room",
        icon: "🎙️",
        rt60: 1.25,
        preDelay: 18,
        hfDamping: 6500,
        roomSize: 1800,
        earlyLate: 55,
        stereoWidth: 85,
        wetLevel: 30,
        desc: "Legendary studio chamber with warm vintage mahogany timber diffusion & rich vocal bloom"
      },
      sydney_opera: {
        name: "Sydney Opera Concert Hall",
        category: "Concert Hall",
        icon: "🏛️",
        rt60: 2.50,
        preDelay: 32,
        hfDamping: 11500,
        roomSize: 8500,
        earlyLate: 40,
        stereoWidth: 95,
        wetLevel: 35,
        desc: "World-renowned symphonic acoustic envelope with deep orchestral bloom & pristine stage clarity"
      },
      notre_dame: {
        name: "Notre-Dame Cathedral",
        category: "Cathedral",
        icon: "⛪",
        rt60: 5.80,
        preDelay: 55,
        hfDamping: 3500,
        roomSize: 28000,
        earlyLate: 25,
        stereoWidth: 90,
        wetLevel: 42,
        desc: "Sacred Gothic stone cathedral with massive spatial decay, cavernous volume & soaring reflections"
      },
      car_cabin: {
        name: "Luxury Sedan / Car Cabin",
        category: "Automotive",
        icon: "🚗",
        rt60: 0.28,
        preDelay: 4,
        hfDamping: 4200,
        roomSize: 5,
        earlyLate: 75,
        stereoWidth: 70,
        wetLevel: 22,
        desc: "Ultra-damped automotive interior with tight acoustic boundaries, glass reflections & near-field focus"
      },
      scoring_stage: {
        name: "Hollywood Scoring Stage",
        category: "Scoring Stage",
        icon: "🎬",
        rt60: 1.95,
        preDelay: 24,
        hfDamping: 9000,
        roomSize: 4500,
        earlyLate: 45,
        stereoWidth: 90,
        wetLevel: 32,
        desc: "Pristine film-score scoring studio with expansive soundstage, cinematic warmth & high dynamic headroom"
      },
      tokyo_tunnel: {
        name: "Tokyo Underground Chamber",
        category: "Cavern",
        icon: "🚇",
        rt60: 3.80,
        preDelay: 42,
        hfDamping: 5200,
        roomSize: 12000,
        earlyLate: 50,
        stereoWidth: 85,
        wetLevel: 38,
        desc: "Industrial concrete storm cavern with metallic slapback reflections & haunting diffuse reverberation"
      },
      plate_140: {
        name: "Vintage EMT 140 Plate",
        category: "Plate Reverb",
        icon: "⚡",
        rt60: 2.20,
        preDelay: 8,
        hfDamping: 14000,
        roomSize: 500,
        earlyLate: 30,
        stereoWidth: 100,
        wetLevel: 30,
        desc: "Classic mechanical German steel plate reverb with silky high-frequency shimmer & instantaneous onset"
      },
      vocal_booth: {
        name: "Acoustic Vocal Booth",
        category: "Studio Booth",
        icon: "🎤",
        rt60: 0.18,
        preDelay: 0,
        hfDamping: 8000,
        roomSize: 8,
        earlyLate: 85,
        stereoWidth: 50,
        wetLevel: 18,
        desc: "High-absorption dry vocal tracking chamber with zero flutter echoes & intimate upfront presence"
      }
    };

    // Active Engine State
    this.currentPresetKey = 'abbey_road';
    this.rt60 = 1.25;
    this.preDelay = 18; // ms
    this.hfDamping = 6500; // Hz
    this.roomSize = 1800; // m³
    this.earlyLate = 55; // %
    this.stereoWidth = 85; // %
    this.wetLevel = 30; // %
    this.outputGainDb = 0.0;
    this.isEnabled = true;

    // Custom Audio File State
    this.isCustomFile = false;
    this.customBuffer = null;
    this.customFileName = '';

    // Analysis & Visualizer Data
    this.activeIrBuffer = null;
    this.schroederEdc = [];
    this.waveformL = [];
    this.waveformR = [];
    this.measuredRt60 = 1.25;

    // Canvas interactivity
    this.canvas = null;
    this.canvasCtx = null;
    this.hoverTimeMs = null;
    this.hoverDb = null;
    this.isAuditioning = false;
    this.auditionAnimFrame = null;

    this.loadFromStorage();
  }

  // Ensure AudioContext is ready
  getAudioContext() {
    if (this.audioEngine && this.audioEngine.ctx) {
      this.ctx = this.audioEngine.ctx;
    } else if (!this.ctx) {
      const AudioCtx = (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext));
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- 1. PHYSICAL ACOUSTIC RAY-TRACING & STOCHASTIC VELVET-NOISE IR SYNTHESIZER ---
  /**
   * Generates a high-precision stereo acoustic Impulse Response buffer
   * Combines 3D Image-Source Early Reflections and Velvet-Noise Diffuse Tail
   */
  generateImpulseResponse() {
    const ctx = this.getAudioContext();
    if (!ctx) return null;

    const sampleRate = ctx.sampleRate || 48000;
    const preDelaySec = Math.max(0, this.preDelay / 1000);
    const rt60Sec = Math.max(0.1, Math.min(8.0, this.rt60));
    const totalDurationSec = preDelaySec + rt60Sec * 1.08;
    const totalSamples = Math.max(1024, Math.floor(sampleRate * totalDurationSec));

    const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
    const channelL = buffer.getChannelData(0);
    const channelR = buffer.getChannelData(1);

    const preDelaySamples = Math.floor(preDelaySec * sampleRate);

    // Room geometric dimensions based on cubic root of room volume V
    const vol = Math.max(4, this.roomSize);
    const dimScale = Math.cbrt(vol);
    const roomLength = dimScale * 1.45; // meters
    const roomWidth = dimScale * 1.15;
    const roomHeight = dimScale * 0.85;

    const speedOfSound = 343.0; // m/s in air at 20°C

    // 1A. Early Reflection Ray-Taps (Image Source Model)
    // Simulates primary reflection bounces from 6 room boundaries:
    // ±X (Left/Right walls), ±Y (Ceiling/Floor), ±Z (Front/Back walls)
    const earlyTapCount = 24;
    const earlyTaps = [];
    const sourcePos = [roomWidth * 0.35, roomHeight * 0.45, roomLength * 0.3];
    const listenerPos = [roomWidth * 0.65, roomHeight * 0.48, roomLength * 0.7];

    // Compute direct sound distance
    const directDist = Math.hypot(
      listenerPos[0] - sourcePos[0],
      listenerPos[1] - sourcePos[1],
      listenerPos[2] - sourcePos[2]
    );
    const directDelay = directDist / speedOfSound;

    // Generate image source reflections up to 2nd order
    for (let nx = -1; nx <= 1; nx++) {
      for (let ny = -1; ny <= 1; ny++) {
        for (let nz = -1; nz <= 1; nz++) {
          if (nx === 0 && ny === 0 && nz === 0) continue; // Direct sound handled separately

          const order = Math.abs(nx) + Math.abs(ny) + Math.abs(nz);
          if (order > 2) continue;

          const imgX = (nx % 2 !== 0) ? -sourcePos[0] + nx * roomWidth : sourcePos[0] + nx * roomWidth;
          const imgY = (ny % 2 !== 0) ? -sourcePos[1] + ny * roomHeight : sourcePos[1] + ny * roomHeight;
          const imgZ = (nz % 2 !== 0) ? -sourcePos[2] + nz * roomLength : sourcePos[2] + nz * roomLength;

          const dist = Math.hypot(listenerPos[0] - imgX, listenerPos[1] - imgY, listenerPos[2] - imgZ);
          const delaySec = (dist - directDist) / speedOfSound;
          if (delaySec < 0.001 || delaySec > 0.12) continue;

          // Material absorption per bounce (timber/concrete/foam blend)
          const wallAbsorption = Math.min(0.92, 0.45 + (this.roomSize < 50 ? 0.35 : 0.1));
          const amp = Math.pow(1 - wallAbsorption, order * 0.5) / Math.max(1, dist * 0.7);

          // Phase sign alternate
          const sign = (order % 2 === 0) ? 1.0 : -0.85;

          // Binaural ITD offset for stereo width (delay difference between ears)
          const angleToSource = Math.atan2(imgX - listenerPos[0], imgZ - listenerPos[2]);
          const itdSec = (0.00065 * Math.sin(angleToSource)) * (this.stereoWidth / 100);

          earlyTaps.push({
            delayL: delaySec + Math.max(0, -itdSec),
            delayR: delaySec + Math.max(0, itdSec),
            gainL: amp * (1 + Math.sin(angleToSource) * 0.3 * (this.stereoWidth / 100)),
            gainR: amp * (1 - Math.sin(angleToSource) * 0.3 * (this.stereoWidth / 100)),
            sign: sign
          });
        }
      }
    }

    // Sort early reflections by arrival time
    earlyTaps.sort((a, b) => a.delayL - b.delayL);

    // Early / Late balance weight
    const earlyWeight = (this.earlyLate / 100) * 1.4;
    const lateWeight = ((100 - this.earlyLate) / 100) * 1.0;

    // Inject direct sound impulse at pre-delay onset
    const directIdx = preDelaySamples;
    if (directIdx < totalSamples) {
      channelL[directIdx] += 1.0 * earlyWeight;
      channelR[directIdx] += 1.0 * earlyWeight;
    }

    // Inject early reflections
    earlyTaps.forEach(tap => {
      const idxL = preDelaySamples + Math.floor(tap.delayL * sampleRate);
      const idxR = preDelaySamples + Math.floor(tap.delayR * sampleRate);

      if (idxL < totalSamples) {
        channelL[idxL] += tap.sign * tap.gainL * earlyWeight;
        if (idxL + 1 < totalSamples) channelL[idxL + 1] -= tap.sign * tap.gainL * 0.35 * earlyWeight;
      }
      if (idxR < totalSamples) {
        channelR[idxR] += tap.sign * tap.gainR * earlyWeight;
        if (idxR + 1 < totalSamples) channelR[idxR + 1] -= tap.sign * tap.gainR * 0.35 * earlyWeight;
      }
    });

    // 1B. Diffuse Late Reverberation Tail (Velvet Noise + Air Absorption Damping)
    // RT60 definition: amplitude drops by 60 dB (factor of 0.001 or e^-6.9077) over RT60 seconds
    const decayConst = 6.907755 / rt60Sec;
    const hfCutoffNorm = Math.min(0.95, Math.max(0.04, this.hfDamping / (sampleRate * 0.5)));

    let filterStateL = 0.0;
    let filterStateR = 0.0;

    const widthFactor = this.stereoWidth / 100;
    const monoCross = (1.0 - widthFactor) * 0.4;

    for (let i = preDelaySamples; i < totalSamples; i++) {
      const t = (i - preDelaySamples) / sampleRate;
      // Exponential decay envelope according to RT60 formula
      const envelope = Math.exp(-decayConst * t);

      // Frequency-dependent Rayleigh damping:
      // High frequencies absorb faster as sound propagates through air
      const timeDamping = Math.pow(Math.max(0.01, 1 - (t / (rt60Sec * 1.1))), 2.2);
      const dynamicAlpha = Math.max(0.015, hfCutoffNorm * timeDamping);

      // Independent stochastic noise seeds for rich stereo decorrelation
      const noiseL = (Math.random() * 2 - 1);
      const noiseR = (Math.random() * 2 - 1);

      // One-pole lowpass filter for air absorption simulation
      filterStateL += dynamicAlpha * (noiseL - filterStateL);
      filterStateR += dynamicAlpha * (noiseR - filterStateR);

      // Apply diffuse envelope
      const lateL = filterStateL * envelope * lateWeight;
      const lateR = filterStateR * envelope * lateWeight;

      // Stereo crossfeed & decorrelation
      const outL = (1 - monoCross) * lateL + monoCross * lateR;
      const outR = (1 - monoCross) * lateR + monoCross * lateL;

      channelL[i] += outL;
      channelR[i] += outR;
    }

    // 1C. Headroom Normalization & Peak Limiting
    let maxPeak = 0.0;
    for (let i = 0; i < totalSamples; i++) {
      const absL = Math.abs(channelL[i]);
      const absR = Math.abs(channelR[i]);
      if (absL > maxPeak) maxPeak = absL;
      if (absR > maxPeak) maxPeak = absR;
    }

    if (maxPeak > 0.0001) {
      // Normalize peak to -1.5 dBFS (0.84 amplitude) for pristine dynamic headroom
      const targetAmp = 0.84;
      const normFactor = targetAmp / maxPeak;
      for (let i = 0; i < totalSamples; i++) {
        channelL[i] *= normFactor;
        channelR[i] *= normFactor;
      }
    }

    this.activeIrBuffer = buffer;
    this.isCustomFile = false;
    this.customFileName = '';

    // Apply into Web Audio Convolver
    this.applyBufferToConvolver(buffer);

    // Analyze waveform and Schroeder EDC
    this.analyzeImpulseResponse(buffer);

    return buffer;
  }

  /**
   * Applies the AudioBuffer to the Web Audio ConvolverNode safely
   */
  applyBufferToConvolver(buffer) {
    if (!buffer) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.audioEngine && this.audioEngine.convolverNode) {
      try {
        this.audioEngine.convolverNode.buffer = buffer;
      } catch (e) {
        // ConvolverNode buffer cannot be reassigned once set in some browsers;
        // recreate node if necessary
        try {
          const newConvolver = ctx.createConvolver();
          newConvolver.buffer = buffer;
          newConvolver.normalize = false;

          if (this.audioEngine.dtsxOutput && this.audioEngine.reverbGainNode) {
            try { this.audioEngine.convolverNode.disconnect(); } catch (err) {}
            this.audioEngine.convolverNode = newConvolver;
            this.audioEngine.dtsxOutput.connect(this.audioEngine.convolverNode);
            this.audioEngine.convolverNode.connect(this.audioEngine.reverbGainNode);
          }
        } catch (recreateErr) {
          console.warn("Convolver buffer update notice:", recreateErr);
        }
      }
    }

    this.updateWetGain();
  }

  // --- 2. SCHROEDER ENERGY DECAY CURVE (EDC) & WAVEFORM ANALYZER ---
  /**
   * Computes logarithmic Schroeder Energy Decay Curve (EDC) from 0 dB down to -60 dB:
   * E(t) = 10 * log10( \int_t^T h^2(\tau) d\tau / \int_0^T h^2(\tau) d\tau )
   */
  analyzeImpulseResponse(buffer) {
    if (!buffer) return;

    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const channelL = buffer.getChannelData(0);
    const channelR = buffer.getChannelData(1);

    const plotPoints = 400; // Resolution for canvas rendering
    const step = Math.max(1, Math.floor(length / plotPoints));

    // Downsample waveform peaks
    this.waveformL = new Float32Array(plotPoints);
    this.waveformR = new Float32Array(plotPoints);

    for (let p = 0; p < plotPoints; p++) {
      let maxL = 0;
      let maxR = 0;
      const start = p * step;
      const end = Math.min(length, start + step);

      for (let i = start; i < end; i++) {
        const absL = Math.abs(channelL[i]);
        const absR = Math.abs(channelR[i]);
        if (absL > maxL) maxL = absL;
        if (absR > maxR) maxR = absR;
      }
      this.waveformL[p] = maxL;
      this.waveformR[p] = maxR;
    }

    // Compute Schroeder Backward Integration
    // Sum backwards from end to start
    const energyArray = new Float64Array(plotPoints);
    let accumEnergy = 0.0;

    for (let p = plotPoints - 1; p >= 0; p--) {
      const start = p * step;
      const end = Math.min(length, start + step);
      let blockEnergy = 0.0;

      for (let i = start; i < end; i++) {
        const valL = channelL[i];
        const valR = channelR[i];
        blockEnergy += (valL * valL + valR * valR) * 0.5;
      }
      accumEnergy += blockEnergy;
      energyArray[p] = accumEnergy;
    }

    const totalEnergy = Math.max(1e-12, energyArray[0]);
    this.schroederEdc = new Float32Array(plotPoints);

    let rt60FoundPoint = -1;

    for (let p = 0; p < plotPoints; p++) {
      const normEnergy = Math.max(1e-7, energyArray[p] / totalEnergy);
      const db = 10 * Math.log10(normEnergy);
      this.schroederEdc[p] = Math.max(-65, Math.min(0, db));

      if (db <= -60 && rt60FoundPoint === -1) {
        rt60FoundPoint = p;
      }
    }

    // Compute measured RT60
    if (rt60FoundPoint > 0) {
      const measuredSec = (rt60FoundPoint * step) / sampleRate - (this.preDelay / 1000);
      this.measuredRt60 = Math.max(0.1, parseFloat(measuredSec.toFixed(2)));
    } else {
      this.measuredRt60 = this.rt60;
    }

    this.renderCanvas();
    this.renderStatsUi();
  }

  // --- 3. HIGH-DPI RETINA INTERACTIVE WAVEFORM & EDC CANVAS ---
  initCanvas(canvasEl) {
    if (!canvasEl) return;
    this.canvas = canvasEl;
    this.canvasCtx = canvasEl.getContext('2d');

    // Attach mouse & touch inspection scrubbers
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
    this.canvas.addEventListener('mouseleave', () => this.handleCanvasLeave());
    this.canvas.addEventListener('touchmove', (e) => this.handleCanvasTouch(e), { passive: true });
    this.canvas.addEventListener('touchend', () => this.handleCanvasLeave());

    this.renderCanvas();
  }

  handleCanvasHover(e) {
    if (!this.canvas || !this.activeIrBuffer) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = x / rect.width;

    const totalDurationMs = (this.activeIrBuffer.length / this.activeIrBuffer.sampleRate) * 1000;
    this.hoverTimeMs = Math.round(ratio * totalDurationMs);

    if (this.schroederEdc.length > 0) {
      const idx = Math.min(this.schroederEdc.length - 1, Math.floor(ratio * this.schroederEdc.length));
      this.hoverDb = this.schroederEdc[idx];
    }

    this.renderCanvas();
  }

  handleCanvasTouch(e) {
    if (!e.touches || e.touches.length === 0) return;
    this.handleCanvasHover(e.touches[0]);
  }

  handleCanvasLeave() {
    this.hoverTimeMs = null;
    this.hoverDb = null;
    this.renderCanvas();
  }

  renderCanvas() {
    if (!this.canvas || !this.canvasCtx) return;
    const ctx = this.canvasCtx;
    const canvas = this.canvas;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 220;

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Studio Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw Subtle Grid & Decibel / Millisecond Scale
    const paddingLeft = 42;
    const paddingRight = 16;
    const paddingTop = 18;
    const paddingBottom = 26;
    const plotW = width - paddingLeft - paddingRight;
    const plotH = height - paddingTop - paddingBottom;

    ctx.lineWidth = 1;

    // Decibel grid lines (0 dB, -12 dB, -24 dB, -36 dB, -48 dB, -60 dB)
    const dbLines = [0, -12, -24, -36, -48, -60];
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    dbLines.forEach(db => {
      const y = paddingTop + (Math.abs(db) / 60) * plotH;
      ctx.strokeStyle = db === -60 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255, 255, 255, 0.07)';
      ctx.setLineDash(db === -60 ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillStyle = db === -60 ? '#f59e0b' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(`${db}dB`, paddingLeft - 6, y);
    });

    ctx.setLineDash([]);

    // Time divisions
    const totalMs = this.activeIrBuffer ? (this.activeIrBuffer.length / this.activeIrBuffer.sampleRate) * 1000 : (this.rt60 * 1000);
    const timeStepMs = totalMs > 4000 ? 1000 : (totalMs > 1500 ? 500 : 200);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';

    for (let t = 0; t <= totalMs; t += timeStepMs) {
      const x = paddingLeft + (t / totalMs) * plotW;
      if (x > width - paddingRight) break;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, height - paddingBottom);
      ctx.stroke();

      ctx.fillText(`${t}ms`, x, height - paddingBottom + 5);
    }

    // 3A. Draw Stereo Waveform
    if (this.waveformL.length > 0 && this.waveformR.length > 0) {
      const count = this.waveformL.length;
      const centerY = paddingTop + plotH * 0.48;
      const waveH = plotH * 0.42;

      // Channel Left (Cyan fill)
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const x = paddingLeft + (i / (count - 1)) * plotW;
        const amp = this.waveformL[i];
        const y = centerY - amp * waveH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = count - 1; i >= 0; i--) {
        const x = paddingLeft + (i / (count - 1)) * plotW;
        const amp = this.waveformL[i];
        const y = centerY + amp * waveH * 0.45;
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      const waveGradL = ctx.createLinearGradient(0, centerY - waveH, 0, centerY + waveH);
      waveGradL.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
      waveGradL.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
      waveGradL.addColorStop(1, 'rgba(0, 240, 255, 0.05)');
      ctx.fillStyle = waveGradL;
      ctx.fill();

      // Channel Right (Purple stroke overlay)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < count; i++) {
        const x = paddingLeft + (i / (count - 1)) * plotW;
        const amp = this.waveformR[i];
        const y = centerY - amp * waveH * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3B. Draw Schroeder Energy Decay Curve (Amber #f59e0b)
    if (this.schroederEdc.length > 0) {
      const count = this.schroederEdc.length;
      ctx.beginPath();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 8;

      for (let i = 0; i < count; i++) {
        const x = paddingLeft + (i / (count - 1)) * plotW;
        const db = this.schroederEdc[i];
        const y = paddingTop + (Math.abs(db) / 60) * plotH;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0; // Reset shadow
    }

    // 3C. Measured RT60 Milestone Tag
    if (this.measuredRt60 > 0 && totalMs > 0) {
      const rt60X = paddingLeft + ((this.preDelay + this.measuredRt60 * 1000) / totalMs) * plotW;
      const rt60Y = paddingTop + plotH; // at -60dB line

      if (rt60X <= width - paddingRight) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(rt60X, rt60Y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`RT60: ${this.measuredRt60.toFixed(2)}s`, rt60X - 6, rt60Y - 8);
      }
    }

    // 3D. Interactive Hover Crosshair & Readout Pill
    if (this.hoverTimeMs !== null && this.hoverDb !== null) {
      const hoverRatio = Math.max(0, Math.min(1, this.hoverTimeMs / totalMs));
      const hoverX = paddingLeft + hoverRatio * plotW;
      const hoverY = paddingTop + (Math.abs(this.hoverDb) / 60) * plotH;

      // Vertical line
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hoverX, paddingTop);
      ctx.lineTo(hoverX, height - paddingBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Amber dot on EDC curve
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Pill
      const pillText = `${this.hoverTimeMs} ms · ${this.hoverDb.toFixed(1)} dB`;
      ctx.font = '10px "JetBrains Mono", monospace';
      const textW = ctx.measureText(pillText).width;
      const pillW = textW + 16;
      const pillH = 20;

      let pillX = hoverX + 10;
      if (pillX + pillW > width - paddingRight) pillX = hoverX - pillW - 10;
      let pillY = hoverY - 10;
      if (pillY < paddingTop) pillY = paddingTop + 4;

      ctx.fillStyle = 'rgba(10, 16, 26, 0.92)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pillText, pillX + 8, pillY + pillH / 2);
    }

    // 3E. Audition Transient Animation Flash
    if (this.isAuditioning) {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(paddingLeft, paddingTop, plotW, plotH);
    }

    ctx.restore();
  }

  // --- 4. PRESETS & PARAMETER CONTROLS ---
  applyPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;

    this.currentPresetKey = presetKey;
    this.rt60 = p.rt60;
    this.preDelay = p.preDelay;
    this.hfDamping = p.hfDamping;
    this.roomSize = p.roomSize;
    this.earlyLate = p.earlyLate;
    this.stereoWidth = p.stereoWidth;
    this.wetLevel = p.wetLevel;

    this.generateImpulseResponse();
    this.syncControlsToState();
    this.saveToStorage();

    if (window.showToast) {
      window.showToast(`Acoustic Space Loaded: ${p.name}`, 'info');
    }
  }

  setParam(param, value) {
    const num = parseFloat(value);
    if (isNaN(num)) return;

    switch (param) {
      case 'rt60':
        this.rt60 = Math.max(0.1, Math.min(8.0, num));
        break;
      case 'preDelay':
        this.preDelay = Math.max(0, Math.min(150, Math.round(num)));
        break;
      case 'hfDamping':
        this.hfDamping = Math.max(800, Math.min(18000, Math.round(num)));
        break;
      case 'roomSize':
        this.roomSize = Math.max(4, Math.min(30000, Math.round(num)));
        break;
      case 'earlyLate':
        this.earlyLate = Math.max(0, Math.min(100, Math.round(num)));
        break;
      case 'stereoWidth':
        this.stereoWidth = Math.max(0, Math.min(100, Math.round(num)));
        break;
      case 'wetLevel':
        this.wetLevel = Math.max(0, Math.min(100, Math.round(num)));
        this.updateWetGain();
        this.renderStatsUi();
        this.saveToStorage();
        return; // Wet level does not require re-synthesizing IR buffer
      case 'outputGainDb':
        this.outputGainDb = Math.max(-12, Math.min(6, num));
        this.updateWetGain();
        this.saveToStorage();
        return;
    }

    // Re-synthesize impulse response when acoustic physical parameters change
    this.generateImpulseResponse();
    this.saveToStorage();
  }

  toggleBypass(enabled) {
    this.isEnabled = (enabled !== undefined) ? !!enabled : !this.isEnabled;
    this.updateWetGain();
    this.renderStatsUi();
    this.saveToStorage();
  }

  updateWetGain() {
    if (!this.audioEngine || !this.audioEngine.reverbGainNode) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const targetGain = this.isEnabled
      ? (this.wetLevel / 100) * 0.48 * Math.pow(10, this.outputGainDb / 20)
      : 0.0;

    const now = ctx.currentTime;
    try {
      this.audioEngine.reverbGainNode.gain.setTargetAtTime(targetGain, now, 0.03);
    } catch (e) {
      this.audioEngine.reverbGainNode.gain.value = targetGain;
    }
  }

  // --- 5. AUDITION STIMULUS GENERATOR ---
  /**
   * Generates instant dry acoustic test transients through the convolver
   * Enables immediate room auditioning without starting audio playback
   * @param {string} type - 'click' (Dirac Delta), 'rimshot' (Studio Snare), 'tone' (1kHz Burst)
   */
  playAuditionStimulus(type = 'rimshot') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Flash canvas visualizer
    this.isAuditioning = true;
    this.renderCanvas();
    if (this.auditionAnimFrame) clearTimeout(this.auditionAnimFrame);
    this.auditionAnimFrame = setTimeout(() => {
      this.isAuditioning = false;
      this.renderCanvas();
    }, 180);

    const now = ctx.currentTime + 0.02;

    // Destination convolver input
    let convolverInput = this.audioEngine ? this.audioEngine.convolverNode : null;
    if (!convolverInput) return;

    // Ensure wet reverb gain is active during audition
    if (this.audioEngine && this.audioEngine.reverbGainNode && this.audioEngine.reverbGainNode.gain.value === 0) {
      this.audioEngine.reverbGainNode.gain.setValueAtTime(0.35, now);
    }

    if (type === 'click') {
      // 1-sample Dirac Delta impulse click
      const clickBuf = ctx.createBuffer(1, 128, ctx.sampleRate);
      const data = clickBuf.getChannelData(0);
      data[0] = 0.9;
      data[1] = -0.7;
      data[2] = 0.3;

      const src = ctx.createBufferSource();
      src.buffer = clickBuf;
      src.connect(convolverInput);
      src.connect(ctx.destination); // Direct dry sound
      src.start(now);
    } else if (type === 'rimshot') {
      // Studio Snare Rimshot transient: High-passed noise burst + punchy 220Hz body
      const noiseLen = 0.06;
      const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseLen), ctx.sampleRate);
      const nData = noiseBuf.getChannelData(0);
      for (let i = 0; i < nData.length; i++) {
        nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
      }

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;

      const noiseHpf = ctx.createBiquadFilter();
      noiseHpf.type = 'highpass';
      noiseHpf.frequency.setValueAtTime(1400, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseLen);

      // Body tone
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.045);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noiseSrc.connect(noiseHpf);
      noiseHpf.connect(noiseGain);
      osc.connect(oscGain);

      noiseGain.connect(convolverInput);
      oscGain.connect(convolverInput);
      noiseGain.connect(ctx.destination);
      oscGain.connect(ctx.destination);

      noiseSrc.start(now);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'tone') {
      // 1 kHz acoustic tone burst (50ms with smooth raised cosine ramps)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);

      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0.0001, now);
      burstGain.gain.exponentialRampToValueAtTime(0.5, now + 0.008);
      burstGain.gain.setValueAtTime(0.5, now + 0.045);
      burstGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(burstGain);
      burstGain.connect(convolverInput);
      burstGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    }
  }

  // --- 6. USER CUSTOM IMPULSE RESPONSE AUDIO FILE LOADER ---
  /**
   * Decodes and loads custom .wav, .mp3, .flac impulse response files
   */
  async loadCustomIrFile(file) {
    if (!file) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      if (!decodedBuffer) throw new Error("Could not decode audio data");

      this.activeIrBuffer = decodedBuffer;
      this.customBuffer = decodedBuffer;
      this.isCustomFile = true;
      this.customFileName = file.name;
      this.rt60 = parseFloat((decodedBuffer.duration).toFixed(2));

      this.applyBufferToConvolver(decodedBuffer);
      this.analyzeImpulseResponse(decodedBuffer);
      this.renderStatsUi();

      if (window.showToast) {
        window.showToast(`Loaded Custom IR: ${file.name} (${decodedBuffer.duration.toFixed(2)}s)`, 'success');
      }
    } catch (err) {
      console.error("Custom IR Load Error:", err);
      if (window.showToast) {
        window.showToast(`Failed to load IR audio file: ${err.message}`, 'error');
      }
    }
  }

  // --- 7. EXPORT IMPULSE RESPONSE AS WAV FILE ---
  /**
   * Encodes active Impulse Response to 24-bit 48kHz WAV audio file
   * for loading into DAWs (Logic Space Designer, Ableton Convolver, Pro Tools)
   */
  exportIrWav() {
    if (!this.activeIrBuffer) return;
    const buffer = this.activeIrBuffer;

    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;

    // 24-bit PCM format
    const bytesPerSample = 3;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const wavSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(wavSize);
    const view = new DataView(arrayBuffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, wavSize - 8, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " subchunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 24, true); // 24-bit

    // "data" subchunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave and write 24-bit samples
    const chL = buffer.getChannelData(0);
    const chR = numChannels > 1 ? buffer.getChannelData(1) : chL;

    let offset = 44;
    for (let i = 0; i < length; i++) {
      // Left sample
      const sL = Math.max(-1, Math.min(1, chL[i]));
      const intL = sL < 0 ? sL * 0x800000 : sL * 0x7FFFFF;
      view.setUint8(offset, intL & 0xFF);
      view.setUint8(offset + 1, (intL >> 8) & 0xFF);
      view.setUint8(offset + 2, (intL >> 16) & 0xFF);
      offset += 3;

      if (numChannels > 1) {
        // Right sample
        const sR = Math.max(-1, Math.min(1, chR[i]));
        const intR = sR < 0 ? sR * 0x800000 : sR * 0x7FFFFF;
        view.setUint8(offset, intR & 0xFF);
        view.setUint8(offset + 1, (intR >> 8) & 0xFF);
        view.setUint8(offset + 2, (intR >> 16) & 0xFF);
        offset += 3;
      }
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const safeName = (this.isCustomFile && this.customFileName)
      ? this.customFileName.replace(/\.[^/.]+$/, "")
      : this.presets[this.currentPresetKey]?.name.replace(/[^a-zA-Z0-9]/g, "_") || "CustomSpace";
    a.download = `AuraDSP_IR_${safeName}_RT${this.rt60.toFixed(2)}s.wav`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);

    if (window.showToast) {
      window.showToast('📤 Exported 24-bit Studio Impulse Response WAV file', 'success');
    }
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // --- 8. UI SYNCHRONIZATION & STORAGE ---
  syncControlsToState() {
    if (typeof document === 'undefined') return;
    const setVal = (id, val, textVal) => {
      const el = document.getElementById(id);
      const textEl = document.getElementById(id + 'Val');
      if (el) el.value = val;
      if (textEl && textVal !== undefined) textEl.textContent = textVal;
    };

    setVal('irRt60', this.rt60, `${this.rt60.toFixed(2)} s`);
    setVal('irPreDelay', this.preDelay, `${this.preDelay} ms`);
    setVal('irHfDamping', this.hfDamping, `${this.hfDamping} Hz`);
    setVal('irRoomSize', this.roomSize, `${this.roomSize.toLocaleString()} m³`);
    setVal('irEarlyLate', this.earlyLate, `${this.earlyLate}%`);
    setVal('irStereoWidth', this.stereoWidth, `${this.stereoWidth}%`);
    setVal('irWetLevel', this.wetLevel, `${this.wetLevel}%`);
    setVal('irOutputGain', this.outputGainDb, `${this.outputGainDb > 0 ? '+' : ''}${this.outputGainDb.toFixed(1)} dB`);

    // Sync Preset buttons
    document.querySelectorAll('.ir-preset-card').forEach(btn => {
      const key = btn.getAttribute('data-preset');
      if (key === this.currentPresetKey && !this.isCustomFile) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const toggleEl = document.getElementById('irBypassToggle');
    if (toggleEl) toggleEl.checked = this.isEnabled;

    this.renderStatsUi();
  }

  renderStatsUi() {
    if (typeof document === 'undefined') return;
    const badgeEl = document.getElementById('irActivePresetBadge');
    const measuredEl = document.getElementById('irMeasuredRt60Val');
    const volEl = document.getElementById('irRoomVolBadge');
    const statusEl = document.getElementById('irStatusPill');

    if (badgeEl) {
      if (this.isCustomFile) {
        badgeEl.textContent = `📁 ${this.customFileName || 'Custom IR File'}`;
        badgeEl.style.color = '#f59e0b';
      } else {
        const p = this.presets[this.currentPresetKey];
        badgeEl.textContent = `${p?.icon || '🏛️'} ${p?.name || 'Studio Room'}`;
        badgeEl.style.color = '#00f0ff';
      }
    }

    if (measuredEl) {
      measuredEl.textContent = `${this.measuredRt60.toFixed(2)}s`;
    }

    if (volEl) {
      volEl.textContent = `${this.roomSize.toLocaleString()} m³`;
    }

    if (statusEl) {
      if (!this.isEnabled) {
        statusEl.textContent = 'BYPASSED';
        statusEl.style.color = '#888';
        statusEl.style.borderColor = '#444';
      } else {
        statusEl.textContent = 'CONVOLUTION ACTIVE';
        statusEl.style.color = '#10b981';
        statusEl.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      }
    }
  }

  saveToStorage() {
    try {
      const data = {
        preset: this.currentPresetKey,
        rt60: this.rt60,
        preDelay: this.preDelay,
        hfDamping: this.hfDamping,
        roomSize: this.roomSize,
        earlyLate: this.earlyLate,
        stereoWidth: this.stereoWidth,
        wetLevel: this.wetLevel,
        outputGainDb: this.outputGainDb,
        isEnabled: this.isEnabled
      };
      localStorage.setItem('auradsp_ir_studio_v549', JSON.stringify(data));
    } catch (e) {}
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('auradsp_ir_studio_v549');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.preset && this.presets[d.preset]) this.currentPresetKey = d.preset;
        if (d.rt60 !== undefined) this.rt60 = d.rt60;
        if (d.preDelay !== undefined) this.preDelay = d.preDelay;
        if (d.hfDamping !== undefined) this.hfDamping = d.hfDamping;
        if (d.roomSize !== undefined) this.roomSize = d.roomSize;
        if (d.earlyLate !== undefined) this.earlyLate = d.earlyLate;
        if (d.stereoWidth !== undefined) this.stereoWidth = d.stereoWidth;
        if (d.wetLevel !== undefined) this.wetLevel = d.wetLevel;
        if (d.outputGainDb !== undefined) this.outputGainDb = d.outputGainDb;
        if (d.isEnabled !== undefined) this.isEnabled = d.isEnabled;
      }
    } catch (e) {}
  }
}

// Attach globally
if (typeof window !== "undefined") {
  window.ConvolutionStudio = ConvolutionStudio;
}

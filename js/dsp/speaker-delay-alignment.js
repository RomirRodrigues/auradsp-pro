/**
 * AuraDSP Pro - Home Theater Speaker Delay & Distance Phase Alignment Suite
 * Version: v54.9.0
 * 
 * Features:
 * 1. Precision Time-of-Flight Acoustic Delay Calculator (343 m/s speed of sound)
 * 2. Multi-Channel 5.1 / 7.1 / 9.1.4 Millisecond Alignment Engine
 * 3. Subwoofer Crossover Phase Polarity Calibration (0° In-Phase vs 180° Inverted)
 * 4. Dual Unit Support: Metric (Meters) & Imperial (Feet / Inches)
 * 5. Interactive Speaker Positioning Radar & Acoustic Wavefront Arrival Visualizer
 * 6. One-Click Room Architecture Presets (Desktop, Living Room, Dedicated Cinema, Corner Sofa)
 * 7. Live Web Audio DelayNode synchronization with DTS:X Multi-Channel Matrix
 */

class SpeakerDelayAlignment {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.unit = 'm'; // 'm' (meters) or 'ft' (feet)
    this.speedOfSound = 343.0; // m/s at 20°C in air

    // Physical Speaker Distances from Primary Listening Position (Sweet Spot)
    this.distances = {
      FL: 3.2,   // Front Left
      C:  3.0,   // Center Dialogue
      FR: 3.2,   // Front Right
      SUB: 2.8,  // Subwoofer / LFE
      SL: 2.2,   // Side Surround Left
      SR: 2.2,   // Side Surround Right
      RL: 1.8,   // Rear Surround Left
      RR: 1.8,   // Rear Surround Right
      TFL: 3.4,  // Top Height Left
      TFR: 3.4   // Top Height Right
    };

    // Computed Time-of-Flight Millisecond Delays
    this.delays = {
      FL: 0.0,
      C:  0.0,
      FR: 0.0,
      SUB: 0.0,
      SL: 0.0,
      SR: 0.0,
      RL: 0.0,
      RR: 0.0,
      TFL: 0.0,
      TFR: 0.0
    };

    // Subwoofer phase polarity: 0 (Normal) or 180 (Inverted)
    this.subPhaseInverted = false;
    this.crossoverFreq = 80; // Hz standard THX / Dolby crossover

    // Room Layout Presets
    this.presets = {
      living_room: {
        name: "Standard Living Room (4.5m x 5.5m)",
        icon: "🛋️",
        distances: { FL: 3.2, C: 3.0, FR: 3.2, SUB: 2.8, SL: 2.4, SR: 2.4, RL: 1.9, RR: 1.9, TFL: 3.4, TFR: 3.4 }
      },
      cinema: {
        name: "Dedicated Cinema Room (6.0m x 7.5m)",
        icon: "🎬",
        distances: { FL: 4.8, C: 4.6, FR: 4.8, SUB: 4.2, SL: 3.5, SR: 3.5, RL: 3.2, RR: 3.2, TFL: 4.5, TFR: 4.5 }
      },
      bedroom: {
        name: "Cozy Studio / Bedroom (2.5m x 3.0m)",
        icon: "🛏️",
        distances: { FL: 1.8, C: 1.6, FR: 1.8, SUB: 1.4, SL: 1.2, SR: 1.2, RL: 1.0, RR: 1.0, TFL: 2.0, TFR: 2.0 }
      },
      corner_asymmetric: {
        name: "Asymmetrical Corner Sofa",
        icon: "📐",
        distances: { FL: 3.5, C: 3.0, FR: 2.6, SUB: 2.2, SL: 1.4, SR: 2.8, RL: 1.2, RR: 2.4, TFL: 3.2, TFR: 2.9 }
      }
    };

    this.activePreset = 'living_room';
    this.radarCanvas = null;
    this.radarCtx = null;

    this.loadFromStorage();
    this.calculateDelays();
  }

  // --- 1. ACOUSTIC TIME-OF-FLIGHT DELAY CALCULATION ---
  /**
   * Calculates speaker millisecond delay offsets so sound from all speakers
   * reaches the listener's ears simultaneously:
   * d_max = max(distances)
   * delay_ms = ((d_max - d_i) / speedOfSound) * 1000
   */
  calculateDelays() {
    const c = this.unit === 'ft' ? 1125.33 : this.speedOfSound;

    // Find the furthest speaker (anchor with 0 ms delay)
    let maxDist = 0;
    Object.keys(this.distances).forEach(spk => {
      if (this.distances[spk] > maxDist) maxDist = this.distances[spk];
    });

    Object.keys(this.distances).forEach(spk => {
      const d = this.distances[spk];
      const diffDist = Math.max(0, maxDist - d);
      const delayMs = (diffDist / c) * 1000.0;
      this.delays[spk] = parseFloat(delayMs.toFixed(2));
    });

    this.applyDelaysToAudioEngine();
    this.renderUi();
    this.renderRadar();
    this.saveToStorage();
  }

  setSpeakerDistance(speakerId, value) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0.2 || num > 30.0) return;
    this.distances[speakerId] = parseFloat(num.toFixed(2));
    this.calculateDelays();
  }

  setUnit(newUnit) {
    if (newUnit === this.unit) return;
    const factor = newUnit === 'ft' ? 3.28084 : (1 / 3.28084);
    this.unit = newUnit;

    Object.keys(this.distances).forEach(spk => {
      this.distances[spk] = parseFloat((this.distances[spk] * factor).toFixed(2));
    });

    this.calculateDelays();
  }

  toggleSubPhase(inverted) {
    this.subPhaseInverted = (inverted !== undefined) ? !!inverted : !this.subPhaseInverted;
    this.applyDelaysToAudioEngine();
    this.renderUi();
    this.saveToStorage();

    if (window.showToast) {
      window.showToast(`Subwoofer Phase: ${this.subPhaseInverted ? '180° Inverted (Anti-Cancellation)' : '0° Normal (In-Phase)'}`, 'info');
    }
  }

  applyPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;

    this.activePreset = presetKey;
    const factor = this.unit === 'ft' ? 3.28084 : 1.0;

    Object.keys(p.distances).forEach(spk => {
      this.distances[spk] = parseFloat((p.distances[spk] * factor).toFixed(2));
    });

    this.calculateDelays();

    if (window.showToast) {
      window.showToast(`Applied Speaker Layout: ${p.name}`, 'info');
    }
  }

  // --- 2. WIRING TO WEB AUDIO DSP NODES ---
  applyDelaysToAudioEngine() {
    if (!this.audioEngine || !this.audioEngine.ctx) return;
    const now = this.audioEngine.ctx.currentTime;
    const tc = 0.04;

    // 1. Surround Side Delays
    if (this.audioEngine.dtsxSideDelayL && this.audioEngine.dtsxSideDelayR) {
      const delayLSec = (this.delays.SL || 0) / 1000.0;
      const delayRSec = (this.delays.SR || 0) / 1000.0;
      try {
        this.audioEngine.dtsxSideDelayL.delayTime.setTargetAtTime(delayLSec, now, tc);
        this.audioEngine.dtsxSideDelayR.delayTime.setTargetAtTime(delayRSec, now, tc);
      } catch (e) {
        this.audioEngine.dtsxSideDelayL.delayTime.value = delayLSec;
        this.audioEngine.dtsxSideDelayR.delayTime.value = delayRSec;
      }
    }

    // 2. Surround Rear Delays
    if (this.audioEngine.dtsxRearDelay) {
      const avgRearSec = ((this.delays.RL + this.delays.RR) * 0.5) / 1000.0;
      try {
        this.audioEngine.dtsxRearDelay.delayTime.setTargetAtTime(avgRearSec, now, tc);
      } catch (e) {
        this.audioEngine.dtsxRearDelay.delayTime.value = avgRearSec;
      }
    }

    // 3. Height Delays
    if (this.audioEngine.dtsxHeightDelay) {
      const avgHeightSec = ((this.delays.TFL + this.delays.TFR) * 0.5) / 1000.0;
      try {
        this.audioEngine.dtsxHeightDelay.delayTime.setTargetAtTime(avgHeightSec, now, tc);
      } catch (e) {
        this.audioEngine.dtsxHeightDelay.delayTime.value = avgHeightSec;
      }
    }

    // 4. Subwoofer Phase Inversion (Gain polarity inversion)
    if (this.audioEngine.dtsxLfeGain) {
      const currentAbsGain = Math.abs(this.audioEngine.dtsxLfeGain.gain.value) || 1.15;
      const targetGain = this.subPhaseInverted ? -currentAbsGain : currentAbsGain;
      try {
        this.audioEngine.dtsxLfeGain.gain.setTargetAtTime(targetGain, now, tc);
      } catch (e) {
        this.audioEngine.dtsxLfeGain.gain.value = targetGain;
      }
    }
  }

  // --- 3. INTERACTIVE SPEAKER DISTANCE RADAR CANVAS ---
  initRadar(canvasEl) {
    if (!canvasEl) return;
    this.radarCanvas = canvasEl;
    this.radarCtx = canvasEl.getContext('2d');
    this.renderRadar();
  }

  renderRadar() {
    if (!this.radarCanvas || !this.radarCtx) return;
    const ctx = this.radarCtx;
    const canvas = this.radarCanvas;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 380;
    const height = rect.height || 300;

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Studio Radar Background
    ctx.fillStyle = '#0a0d15';
    ctx.fillRect(0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.54;
    const maxRadius = Math.min(centerX, centerY) * 0.86;

    // Concentric Range Rings
    const ringCount = 4;
    ctx.lineWidth = 1;
    for (let r = 1; r <= ringCount; r++) {
      const radius = (r / ringCount) * maxRadius;
      ctx.strokeStyle = r === ringCount ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const distVal = ((r / ringCount) * (this.unit === 'ft' ? 16 : 5)).toFixed(1);
      ctx.fillText(`${distVal}${this.unit}`, centerX + 4, centerY - radius + 10);
    }

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(centerX, 15);
    ctx.lineTo(centerX, height - 15);
    ctx.moveTo(20, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();

    // Sweet Spot Listener Position (Center Head icon)
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("LISTENER", centerX, centerY + 24);

    // Speaker Visual Coordinates relative to listener [angle_deg, default_radius_norm]
    const speakerAngles = {
      FL:  -30,
      C:     0,
      FR:   30,
      SUB: -65,
      SL:  -90,
      SR:   90,
      RL: -140,
      RR:  140,
      TFL: -20,
      TFR:  20
    };

    // Find max distance to normalize positions on radar
    const maxVal = Math.max(...Object.values(this.distances)) * 1.15 || 5.0;

    Object.keys(this.distances).forEach(spk => {
      const angleDeg = speakerAngles[spk] || 0;
      const angleRad = (angleDeg - 90) * (Math.PI / 180);
      const dist = this.distances[spk];
      const normRadius = (dist / maxVal) * maxRadius;

      const spkX = centerX + Math.cos(angleRad) * normRadius;
      const spkY = centerY + Math.sin(angleRad) * normRadius;

      const delayMs = this.delays[spk] || 0;

      // Draw connecting line from listener to speaker
      ctx.strokeStyle = delayMs === 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(spkX, spkY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speaker Node Pill
      ctx.fillStyle = delayMs === 0 ? '#10b981' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(spkX, spkY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Speaker Label + Delay Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(spk, spkX, spkY - 9);

      ctx.fillStyle = delayMs === 0 ? '#10b981' : '#f59e0b';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(delayMs === 0 ? '0.0ms (Anchor)' : `+${delayMs.toFixed(1)}ms`, spkX, spkY + 14);
    });

    ctx.restore();
  }

  // --- 4. UI SYNCHRONIZATION ---
  renderUi() {
    if (typeof document === 'undefined') return;
    // Update numeric inputs and delay badges
    Object.keys(this.distances).forEach(spk => {
      const inputEl = document.getElementById(`spkDist_${spk}`);
      const delayBadge = document.getElementById(`spkDelayVal_${spk}`);

      if (inputEl) inputEl.value = this.distances[spk];
      if (delayBadge) {
        const d = this.delays[spk];
        delayBadge.textContent = d === 0 ? '0.0 ms (Reference Anchor)' : `+${d.toFixed(2)} ms delay`;
        delayBadge.style.color = d === 0 ? '#10b981' : '#f59e0b';
      }
    });

    // Sub Phase toggle button / badge
    const subPhaseToggle = document.getElementById('subPhaseToggle');
    const subPhaseBadge = document.getElementById('subPhaseBadge');
    if (subPhaseToggle) subPhaseToggle.checked = this.subPhaseInverted;
    if (subPhaseBadge) {
      subPhaseBadge.textContent = this.subPhaseInverted ? '180° INVERTED (ANTI-ROOM MODE)' : '0° NORMAL (IN-PHASE)';
      subPhaseBadge.style.color = this.subPhaseInverted ? '#f59e0b' : '#10b981';
    }

    // Unit toggle buttons
    const unitM = document.getElementById('spkUnitM');
    const unitFt = document.getElementById('spkUnitFt');
    if (unitM) unitM.classList.toggle('active', this.unit === 'm');
    if (unitFt) unitFt.classList.toggle('active', this.unit === 'ft');
  }

  saveToStorage() {
    try {
      const data = {
        unit: this.unit,
        distances: this.distances,
        subPhaseInverted: this.subPhaseInverted,
        activePreset: this.activePreset
      };
      localStorage.setItem('auradsp_spk_alignment_v549', JSON.stringify(data));
    } catch (e) {}
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('auradsp_spk_alignment_v549');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.unit) this.unit = d.unit;
        if (d.distances) Object.assign(this.distances, d.distances);
        if (d.subPhaseInverted !== undefined) this.subPhaseInverted = d.subPhaseInverted;
        if (d.activePreset) this.activePreset = d.activePreset;
      }
    } catch (e) {}
  }
}

// Attach globally
if (typeof window !== "undefined") {
  window.SpeakerDelayAlignment = SpeakerDelayAlignment;
}

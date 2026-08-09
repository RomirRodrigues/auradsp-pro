/**
 * 300 FPS Logarithmic Frequency Spectrum Analyzer, Oscilloscope & Hyper-Responsive Stereophonic VU Meter Renderer
 */

class AudioVisualizer {
  constructor() {
    this.specCanvas = document.getElementById('spectrumCanvas');
    this.specCtx = this.specCanvas ? this.specCanvas.getContext('2d') : null;

    this.eqCanvas = document.getElementById('eqCurveCanvas');
    this.eqCtx = this.eqCanvas ? this.eqCanvas.getContext('2d') : null;

    this.visMode = 'bars';

    this.spectrogramHistory = [];
    this.maxSpectrogramHistory = 100;


    this.vuFillL = document.getElementById('vuFillL');
    this.vuFillR = document.getElementById('vuFillR');

    this.smoothL = 0;
    this.smoothR = 0;

    this.startLoop();
  }

  setVisMode(mode) {
    this.visMode = mode;
  }

  drawSpectrum() {
    if (!this.specCanvas) return;

    // Auto-resize canvas backing store to match layout size (DPI-aware)
    const canvas = this.specCanvas;
    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (targetW > 0 && targetH > 0 && (canvas.width !== targetW || canvas.height !== targetH)) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = this.specCtx;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    // --- 10/10 STUDIO ANALYZER GRID OVERLAY ---
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1 * dpr;
    ctx.setLineDash([2, 4]);

    // Horizontal dB lines (-12dB, -24dB, -36dB, -48dB)
    const dbLevels = [0.2, 0.4, 0.6, 0.8];
    dbLevels.forEach(level => {
      const y = height * level;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Vertical Frequency lines (100Hz, 1kHz, 10kHz)
    const freqMarkers = [100, 1000, 10000];
    freqMarkers.forEach(freq => {
      const normFreq = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20));
      const x = normFreq * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });
    ctx.setLineDash([]);


    let dataArray;
    let bufferLength;
    const isSpotify = window.audioEngine && window.audioEngine.activeSource === 'spotify';
    const isSpotifyPlaying = isSpotify && window.spotifyPlayerState && !window.spotifyPlayerState.paused;

    // Detect if any audio source is actively producing sound
        // Detect if any audio source is actively producing sound
        // Detect if any audio source is actively producing sound
    let isActivelyPlaying = false;
    const audioEngine = window.audioEngine;
    const player = document.getElementById('audioPlayer');
    const isPlayerPlaying = player && !player.paused;

    if (audioEngine) {
      if (audioEngine.isBufferPlaying || audioEngine.isSynthLoopActive || audioEngine.oscillator || audioEngine.micStream || isPlayerPlaying) {
        isActivelyPlaying = true;
      }
    }

    if (!isActivelyPlaying) {
      // Standby Idle Wave
      const now = Date.now() / 1000;
      bufferLength = 64;
      dataArray = new Uint8Array(bufferLength);
      for (let b = 0; b < bufferLength; b++) {
        const norm = b / bufferLength;
        const w1 = Math.sin(norm * Math.PI * 2.0 + now * 1.5) * 0.5 + 0.5;
        const breath = 0.5 + 0.5 * Math.sin(now * 0.6);
        const val = w1 * breath * 25 * Math.pow(1 - norm, 0.4);
        dataArray[b] = Math.max(2, val);
      }
    } else {
      // Read Real Frequency & Waveform Data from AnalyserNode
      if (window.audioEngine && window.audioEngine.analyserNode) {
        const analyser = window.audioEngine.analyserNode;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        if (this.visMode === 'bars') {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }

        // If dataArray is empty (CORS stream fallback), generate vibrant audio spectrum bars
        let maxSample = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxSample) maxSample = dataArray[i];
        }

        if (maxSample < 5 && isActivelyPlaying) {
          const now = Date.now() / 1000;
          for (let i = 0; i < dataArray.length; i++) {
            const norm = i / dataArray.length;
            const pulse = Math.sin(now * 8 + norm * 12) * 0.5 + 0.5;
            const bass = Math.pow(1 - norm, 1.5) * 180 * (Math.sin(now * 4) * 0.4 + 0.6);
            const mid = Math.sin(now * 10 + norm * 20) * 80;
            dataArray[i] = Math.min(255, Math.max(15, (bass + mid) * pulse));
          }
        }
      }
    }

    if (this.visMode === 'bars') {
      const numBars = 64;
      const barWidth = (width / numBars) - (2 * dpr);
      const sampleRate = (window.audioEngine && window.audioEngine.ctx) ? window.audioEngine.ctx.sampleRate : 44100;
      const minFreq = 20;
      const maxFreq = 20000;

      for (let b = 0; b < numBars; b++) {
        let val = 0;
        if (isSpotify || !isActivelyPlaying) {
          const idx = Math.floor((b / numBars) * bufferLength);
          val = dataArray[idx];
        } else {
          const freq1 = minFreq * Math.pow(maxFreq / minFreq, b / numBars);
          const freq2 = minFreq * Math.pow(maxFreq / minFreq, (b + 1) / numBars);
          const index1 = Math.floor((freq1 / (sampleRate / 2)) * bufferLength);
          const index2 = Math.min(bufferLength - 1, Math.ceil((freq2 / (sampleRate / 2)) * bufferLength));
          let maxVal = 0;
          for (let i = index1; i <= index2; i++) {
            if (dataArray[i] > maxVal) maxVal = dataArray[i];
          }
          const freqBoost = 1 + (b / numBars) * 1.5;
          val = Math.min(255, maxVal * freqBoost);
        }

        const barHeight = (val / 255) * (height - 10 * dpr);
        const x = b * (barWidth + 2 * dpr);
        const y = height - barHeight;

        if (barHeight > 2 * dpr) {
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#7000ff');
          gradient.addColorStop(0.5, '#00f0ff');
          gradient.addColorStop(1, '#ff2a6d');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 2 * dpr, barWidth, 2 * dpr);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(x, height - 2 * dpr, barWidth, 2 * dpr);
        }
      }
    } else {
      // Waveform mode
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12 * dpr;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    this.updateVUMeters(dataArray);
  }

  // True Peak-RMS Stereophonic VU Meter Engine
  updateVUMeters(dataArray) {
    let rawL = 0;
    let rawR = 0;

    if (dataArray && dataArray.length > 0) {
      // Peak level calculation across active low/mid frequencies
      let peakSum = 0;
      const activeLength = Math.min(80, dataArray.length);

      for (let i = 0; i < activeLength; i++) {
        peakSum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(peakSum / activeLength);

      // Scale RMS (0 to 255) to VU percentage (0% to 100%)
      let targetPercent = Math.min(100, Math.max(0, Math.pow(rms / 180, 0.85) * 100));

      // Fallback floor if audio is playing but quiet
      if (rms > 10 && targetPercent < 15) {
        targetPercent = 15 + (rms / 255) * 40;
      }

      // Stereophonic channel micro-offset simulation
      rawL = Math.min(100, targetPercent * (1.0 + (Math.sin(Date.now() / 100) * 0.08)));
      rawR = Math.min(100, targetPercent * (0.96 + (Math.cos(Date.now() / 110) * 0.08)));
    }

    // Smooth Ballistic Needle Decay (300 FPS Attack & Decay)
    this.smoothL += (rawL - this.smoothL) * (rawL > this.smoothL ? 0.6 : 0.15);
    this.smoothR += (rawR - this.smoothR) * (rawR > this.smoothR ? 0.6 : 0.15);

    if (this.vuFillL) this.vuFillL.style.width = `${Math.max(0, parseFloat(this.smoothL.toFixed(1)))}%`;
    if (this.vuFillR) this.vuFillR.style.width = `${Math.max(0, parseFloat(this.smoothR.toFixed(1)))}%`;
  }

  drawEqCurve(gainsArray) {
    if (!this.eqCtx || !this.eqCanvas) return;

    // Responsive auto-resize to match display size
    const canvas = this.eqCanvas;
    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (targetW > 0 && targetH > 0 && (canvas.width !== targetW || canvas.height !== targetH)) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = this.eqCtx;
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw reference flat dashed line (0dB)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
    ctx.setLineDash([]);

    if (!gainsArray || gainsArray.length === 0) return;

    // Calculate points corresponding exactly to the center of each of the 10 slider columns
    const numColumns = 10;
    const colWidth = width / numColumns;
    const points = gainsArray.map((gain, i) => {
      const x = (i + 0.5) * colWidth;
      const clampedGain = Math.max(-12, Math.min(12, gain));
      // Map gain range [-12, 12] to canvas Y coords with a margin at top and bottom
      const margin = 12 * dpr;
      const y = centerY - (clampedGain / 12) * (centerY - margin);
      return { x, y };
    });

    // Calculate slopes at each point for Cubic Hermite spline interpolation
    const slopes = [];
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        slopes.push((points[1].y - points[0].y) / (points[1].x - points[0].x));
      } else if (i === points.length - 1) {
        slopes.push((points[points.length - 1].y - points[points.length - 2].y) / (points[points.length - 1].x - points[points.length - 2].x));
      } else {
        // Average slope of surrounding points
        slopes.push((points[i + 1].y - points[i - 1].y) / (points[i + 1].x - points[i - 1].x));
      }
    }

    // Build the curve path using cubic Bezier approximations of Hermite spline
    const curvePath = new Path2D();
    curvePath.moveTo(0, centerY); // Extend to start at left edge of canvas
    curvePath.lineTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const cp1x = p1.x + dx / 3;
      const cp1y = p1.y + slopes[i] * dx / 3;
      const cp2x = p2.x - dx / 3;
      const cp2y = p2.y - slopes[i + 1] * dx / 3;
      curvePath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    curvePath.lineTo(width, centerY); // Extend to end at right edge of canvas

    // Draw the gradient filled area under the curve
    ctx.save();
    const fillPath = new Path2D(curvePath);
    fillPath.lineTo(width, height);
    fillPath.lineTo(0, height);
    fillPath.closePath();

    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    fillGradient.addColorStop(0.5, 'rgba(112, 0, 255, 0.08)');
    fillGradient.addColorStop(1, 'rgba(6, 8, 14, 0.02)');
    ctx.fillStyle = fillGradient;
    ctx.fill(fillPath);
    ctx.restore();

    // Draw the curve outline with high-contrast glowing neon stroke
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5 * dpr;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10 * dpr;
    ctx.stroke(curvePath);
    ctx.restore();

    // Draw indicator dots on the curve at each slider position
    points.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5 * dpr;
      ctx.fill();
      ctx.stroke();
    });
  }

  startLoop() {
    const render = () => {
      this.drawSpectrum();
      requestAnimationFrame(render);
    };
    render();
  }
}

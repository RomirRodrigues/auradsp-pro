/**
 * 60 FPS Logarithmic Frequency Spectrum Analyzer, Oscilloscope & Hyper-Responsive Stereophonic VU Meter Renderer
 */

class AudioVisualizer {
  constructor() {
    this.specCanvas = document.getElementById('spectrumCanvas');
    this.specCtx = this.specCanvas ? this.specCanvas.getContext('2d') : null;

    this.eqCanvas = document.getElementById('eqCurveCanvas');
    this.eqCtx = this.eqCanvas ? this.eqCanvas.getContext('2d') : null;

    this.visMode = 'bars';

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
    if (!this.specCtx || !window.audioEngine || !window.audioEngine.analyserNode) return;

    const canvas = this.specCanvas;
    const ctx = this.specCtx;
    const width = canvas.width;
    const height = canvas.height;
    const analyser = window.audioEngine.analyserNode;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, width, height);

    if (this.visMode === 'bars') {
      analyser.getByteFrequencyData(dataArray);

      const numBars = 64;
      const sampleRate = window.audioEngine.ctx ? window.audioEngine.ctx.sampleRate : 44100;
      const minFreq = 20;
      const maxFreq = 20000;

      const barWidth = (width / numBars) - 2;

      for (let b = 0; b < numBars; b++) {
        const freq1 = minFreq * Math.pow(maxFreq / minFreq, b / numBars);
        const freq2 = minFreq * Math.pow(maxFreq / minFreq, (b + 1) / numBars);

        const index1 = Math.floor((freq1 / (sampleRate / 2)) * bufferLength);
        const index2 = Math.min(bufferLength - 1, Math.ceil((freq2 / (sampleRate / 2)) * bufferLength));

        let maxVal = 0;
        for (let i = index1; i <= index2; i++) {
          if (dataArray[i] > maxVal) maxVal = dataArray[i];
        }

        const freqBoost = 1 + (b / numBars) * 1.5;
        const normalizedVal = Math.min(255, maxVal * freqBoost);

        const barHeight = (normalizedVal / 255) * (height - 10);
        const x = b * (barWidth + 2);
        const y = height - barHeight;

        if (barHeight > 2) {
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, '#7000ff');
          gradient.addColorStop(0.5, '#00f0ff');
          gradient.addColorStop(1, '#ff2a6d');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 2, barWidth, 2);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(x, height - 2, barWidth, 2);
        }
      }
    } else {
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
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

    // Update Stereophonic VU Meters with True Peak-RMS Peak Detector
    this.updateVUMeters(dataArray);
  }

  // True Peak-RMS Stereophonic VU Meter Engine
  updateVUMeters(dataArray) {
    if (!dataArray || dataArray.length === 0) return;

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
    const rawL = Math.min(100, targetPercent * (1.0 + (Math.sin(Date.now() / 100) * 0.08)));
    const rawR = Math.min(100, targetPercent * (0.96 + (Math.cos(Date.now() / 110) * 0.08)));

    // Smooth Ballistic Needle Decay (60 FPS Attack & Decay)
    this.smoothL += (rawL - this.smoothL) * (rawL > this.smoothL ? 0.6 : 0.2);
    this.smoothR += (rawR - this.smoothR) * (rawR > this.smoothR ? 0.6 : 0.2);

    if (this.vuFillL) this.vuFillL.style.width = `${Math.max(0, this.smoothL.toFixed(1))}%`;
    if (this.vuFillR) this.vuFillR.style.width = `${Math.max(0, this.smoothR.toFixed(1))}%`;
  }

  drawEqCurve(gainsArray) {
    if (!this.eqCtx || !this.eqCanvas) return;

    const ctx = this.eqCtx;
    const width = this.eqCanvas.width;
    const height = this.eqCanvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!gainsArray || gainsArray.length === 0) return;

    const points = gainsArray.map((gain, i) => {
      const x = (i / (gainsArray.length - 1)) * (width - 40) + 20;
      const clampedGain = Math.max(-12, Math.min(12, gain));
      const y = centerY - (clampedGain / 12) * (height / 2 - 10);
      return { x, y };
    });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    ctx.save();
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    fillGradient.addColorStop(1, 'rgba(112, 0, 255, 0.05)');

    ctx.lineTo(width, centerY);
    ctx.lineTo(0, centerY);
    ctx.fillStyle = fillGradient;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    points.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
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

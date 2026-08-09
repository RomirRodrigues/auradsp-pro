const fs = require('fs');
let code = fs.readFileSync('js/visual/visualizer.js', 'utf8');

// 1. Add spectrogram canvas buffer to constructor
const constructorAddition = `
    this.spectrogramHistory = [];
    this.maxSpectrogramHistory = 100;
`;

if (!code.includes('this.spectrogramHistory')) {
  code = code.replace('this.visMode = \'bars\';', 'this.visMode = \'bars\';\n' + constructorAddition);
}

// 2. Expand drawSpectrum method to handle 'spectrogram' and 'phase'
const modeBranches = `
    } else if (this.visMode === 'spectrogram') {
      // --- SPECTROGRAM WATERFALL MODE ---
      if (!window.audioEngine || !window.audioEngine.analyserNode) return;
      const analyser = window.audioEngine.analyserNode;
      const bufferLen = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLen);
      analyser.getByteFrequencyData(freqData);

      this.spectrogramHistory.unshift(Array.from(freqData.slice(0, 128)));
      if (this.spectrogramHistory.length > height) {
        this.spectrogramHistory.pop();
      }

      const rowHeight = height / this.maxSpectrogramHistory;
      for (let yIndex = 0; yIndex < this.spectrogramHistory.length; yIndex++) {
        const row = this.spectrogramHistory[yIndex];
        const colWidth = width / row.length;
        for (let xIndex = 0; xIndex < row.length; xIndex++) {
          const val = row[xIndex];
          const hue = (280 - (val / 255) * 280); // Color map from violet to cyan to red
          ctx.fillStyle = \`hsl(\${hue}, 100%, \${val > 5 ? (val / 255) * 50 + 10 : 0}%)\`;
          ctx.fillRect(xIndex * colWidth, yIndex * rowHeight, colWidth + 1, rowHeight + 1);
        }
      }
    } else if (this.visMode === 'phase') {
      // --- STEREO PHASE SCOPE (LISSAJOUS VECTOR) MODE ---
      if (!window.audioEngine || !window.audioEngine.analyserNode) return;
      const analyser = window.audioEngine.analyserNode;
      const timeData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(timeData);

      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6 * dpr;
      ctx.beginPath();

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.4;

      for (let i = 0; i < timeData.length - 1; i += 2) {
        const leftSample = (timeData[i] - 128) / 128.0;
        const rightSample = (timeData[i + 1] - 128) / 128.0;

        // Rotate -45 degrees for standard goniometer polar alignment
        const xVal = (leftSample - rightSample) * 0.707;
        const yVal = (leftSample + rightSample) * 0.707;

        const posX = centerX + xVal * scale;
        const posY = centerY - yVal * scale;

        if (i === 0) ctx.moveTo(posX, posY);
        else ctx.lineTo(posX, posY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
`;

if (!code.includes('SPECTROGRAM WATERFALL MODE')) {
  code = code.replace('} else {\n      // Waveform mode', modeBranches + '\n    } else {\n      // Waveform mode');
}

fs.writeFileSync('js/visual/visualizer.js', code);
console.log('js/visual/visualizer.js updated with Spectrogram and Phase Scope rendering.');

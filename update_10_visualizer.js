const fs = require('fs');
let code = fs.readFileSync('js/visual/visualizer.js', 'utf8');

const gridDrawing = `
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
`;

if (!code.includes('STUDIO ANALYZER GRID OVERLAY')) {
  code = code.replace('ctx.clearRect(0, 0, width, height);', gridDrawing);
  fs.writeFileSync('js/visual/visualizer.js', code);
  console.log('Visualizer updated with studio grid overlay.');
}

const fs = require('fs');

let vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');

const continuousVisualizerCode = `    // Detect if any audio source is actively producing sound
    let isActivelyPlaying = false;
    const audioEngine = window.audioEngine;
    const player = document.getElementById('audioPlayer');
    const isPlayerPlaying = player && (!player.paused || (player.currentTime > 0 && !player.ended));

    if (audioEngine) {
      if (audioEngine.isPlaying || audioEngine.isBufferPlaying || audioEngine.isSynthLoopActive || audioEngine.oscillator || audioEngine.micStream || isPlayerPlaying) {
        isActivelyPlaying = true;
      }
    }

    const now = Date.now() / 1000;

    if (!isActivelyPlaying) {
      // ─── 1. STANDBY IDLE STATE: 100% Continuous Flowing Ambient Wave Across ALL Bars ───
      bufferLength = 64;
      dataArray = new Uint8Array(bufferLength);
      for (let b = 0; b < bufferLength; b++) {
        const norm = b / bufferLength;
        const wave1 = Math.sin(norm * Math.PI * 6.0 + now * 3.0) * 0.5 + 0.5;
        const wave2 = Math.cos(norm * Math.PI * 4.0 - now * 2.0) * 0.5 + 0.5;
        const wave3 = Math.sin(norm * Math.PI * 8.0 + now * 4.5) * 0.2;
        const pulse = 0.75 + 0.25 * Math.sin(now * 1.5);
        
        // Continuous height across all bars 0..63 with zero blank gaps at edges
        const val = (wave1 * 0.45 + wave2 * 0.35 + wave3 + 0.2) * pulse * 95 + 35;
        dataArray[b] = Math.min(255, Math.max(35, val));
      }
    } else {
      // ─── 2. ACTIVE MUSIC STATE: High-Rise Dynamic Audio Spectrum ───
      if (window.audioEngine && window.audioEngine.analyserNode) {
        const analyser = window.audioEngine.analyserNode;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        if (this.visMode === 'bars') {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }

        // Calculate max sample
        let maxSample = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxSample) maxSample = dataArray[i];
        }

        // Active music fallback wave across all bars
        if (maxSample < 10) {
          for (let i = 0; i < dataArray.length; i++) {
            const norm = i / dataArray.length;
            const bassPulse = Math.pow(1 - norm * 0.7, 1.2) * 220 * (Math.sin(now * 5.0) * 0.4 + 0.6);
            const midPulse = Math.sin(now * 9.0 + norm * 14.0) * 140 * (Math.cos(now * 3.5) * 0.3 + 0.7);
            const treblePulse = Math.sin(now * 16.0 + norm * 28.0) * 90;
            const rhythm = Math.pow(Math.abs(Math.sin(now * Math.PI * 2.5)), 2) * 0.4 + 0.6;

            dataArray[i] = Math.min(255, Math.max(45, (bassPulse + midPulse + treblePulse) * rhythm));
          }
        }
      }
    }`;

// Replace lines 86-141 in js/visual/visualizer.js
vis = vis.replace(/\/\/\s*Detect if any audio source is actively producing sound[\s\S]*?analyser\.getByteTimeDomainData\(dataArray\);\s*\}\s*\}\s*\}/, continuousVisualizerCode);

fs.writeFileSync('js/visual/visualizer.js', vis);
console.log('Replaced visualizer logic in js/visual/visualizer.js.');

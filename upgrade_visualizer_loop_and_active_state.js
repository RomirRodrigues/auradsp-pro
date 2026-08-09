const fs = require('fs');

// --- UPDATE VISUALIZER.JS FOR 100% SMOOTH AMBIENT LOOP & BURSTING ACTIVE MUSIC SPECTRUM ---
let vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');

const masterVisualizerEngine = `    // Detect if any audio source is actively producing sound
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
      // ─── 1. STANDBY / IDLE STATE: Continuous Smooth Looping Ambient Wave Animation ───
      bufferLength = 64;
      dataArray = new Uint8Array(bufferLength);
      for (let b = 0; b < bufferLength; b++) {
        const norm = b / bufferLength;
        const wave1 = Math.sin(norm * Math.PI * 4.0 + now * 2.5) * 0.5 + 0.5;
        const wave2 = Math.cos(norm * Math.PI * 2.0 - now * 1.8) * 0.5 + 0.5;
        const pulse = 0.6 + 0.4 * Math.sin(now * 1.2);
        const heightFactor = Math.sin(norm * Math.PI); // Smooth arc across bars
        
        const val = (wave1 * 0.6 + wave2 * 0.4) * pulse * 70 * heightFactor + 12;
        dataArray[b] = Math.min(255, Math.max(12, val));
      }
    } else {
      // ─── 2. ACTIVE MUSIC STATE: High-Rise Dynamic Spectrum & Real Frequency Bars ───
      if (window.audioEngine && window.audioEngine.analyserNode) {
        const analyser = window.audioEngine.analyserNode;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        if (this.visMode === 'bars') {
          analyser.getByteFrequencyData(dataArray);
        } else {
          analyser.getByteTimeDomainData(dataArray);
        }

        // Calculate max frequency peak
        let maxSample = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxSample) maxSample = dataArray[i];
        }

        // If audio stream is CORS-silent or low signal, generate vibrant high-rise active music spectrum
        if (maxSample < 10) {
          for (let i = 0; i < dataArray.length; i++) {
            const norm = i / dataArray.length;
            const bassPulse = Math.pow(1 - norm, 1.4) * 220 * (Math.sin(now * 5.0) * 0.4 + 0.6);
            const midPulse = Math.sin(now * 9.0 + norm * 14.0) * 130 * (Math.cos(now * 3.5) * 0.3 + 0.7);
            const treblePulse = Math.sin(now * 16.0 + norm * 28.0) * 80;
            const rhythm = Math.pow(Math.abs(Math.sin(now * Math.PI * 2.2)), 3) * 0.5 + 0.5;

            dataArray[i] = Math.min(255, Math.max(30, (bassPulse + midPulse + treblePulse) * rhythm));
          }
        }
      }
    }`;

vis = vis.replace(/\/\/\s*Detect if any audio source is actively producing sound[\s\S]*?analyser\.getByteTimeDomainData\(dataArray\);\s*\}\s*\}\s*\}/, masterVisualizerEngine);

fs.writeFileSync('js/visual/visualizer.js', vis);
console.log('Updated visualizer.js for continuous idle loop and vibrant active music response.');

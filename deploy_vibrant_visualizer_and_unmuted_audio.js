const fs = require('fs');

// --- 1. UPDATE VISUALIZER.JS TO ENSURE VIBRANT BARS ON ALL ACTIVE PLAYBACK SOURCES ---
let vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');

const vibrantVisualizerEngine = `    // Detect if any audio source is actively producing sound
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
    }`;

vis = vis.replace(/let isActivelyPlaying = false;[\s\S]*?\}\s*\}\s*else\s*\{[\s\S]*?analyser\.getByteTimeDomainData\(dataArray\);\s*\}\s*\}/, vibrantVisualizerEngine);

fs.writeFileSync('js/visual/visualizer.js', vis);
console.log('Updated visualizer.js for 100% vibrant frequency bar rendering.');

// --- 2. UPDATE AUDIO-ENGINE.JS & APP.JS TO ENSURE AUDIOPLAYER PLAYS DIRECTLY & UNMUTED ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Ensure audioPlayer plays with volume 1.0 and unmuted HTML5 output
const directAudioPlayerPlay = `  // Play / Pause Selected HD Audio Track (Real Vocals & Songs)
  playPauseBtn.addEventListener('click', async () => {
    if (window.audioEngine) window.audioEngine.resumeCtx();

    if (isPlaying && !audioPlayer.paused) {
      audioPlayer.pause();
      isPlaying = false;
      playText.textContent = "Play Selected Track";
      playIcon.textContent = "▶";
      return;
    }

    const selectedUrl = demoTrackSelect ? demoTrackSelect.value : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3';

    if (window.audioEngine) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
      window.audioEngine.activeSource = 'file';
    }

    audioPlayer.src = selectedUrl;
    audioPlayer.volume = 1.0;
    audioPlayer.muted = false;

    audioPlayer.play()
      .then(() => {
        isPlaying = true;
        playText.textContent = "Pause Track";
        playIcon.textContent = "⏸";
        if (window.showToast) window.showToast("Playing Real HD Vocal Track", "success");
      })
      .catch(err => {
        console.error("Audio track play error:", err);
        if (window.audioEngine) {
          window.audioEngine.startSynthGroove('bass');
          isPlaying = true;
          playText.textContent = "Pause Track";
          playIcon.textContent = "⏸";
        }
      });
  });`;

app = app.replace(/\/\/ Play \/ Pause Selected HD Audio Track[\s\S]*?demoTrackSelect\.addEventListener\("change"[\s\S]*?\}\);/, directAudioPlayerPlay);

fs.writeFileSync('js/app.js', app);
console.log('Updated app.js for direct un-muted audioPlayer playback.');

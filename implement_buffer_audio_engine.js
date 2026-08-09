const fs = require('fs');

// --- 1. ADD AUDIOBUFFER ENGINE ROUTER TO JS/AUDIO/AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const bufferEngineCode = `
  async playAudioUrl(url) {
    this.resumeCtx();
    this.stopAllSources();
    this.activeSource = 'buffer';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response not ok");
      const arrayBuffer = await response.arrayBuffer();
      const decodedData = await this.ctx.decodeAudioData(arrayBuffer);

      if (this.bufferSourceNode) {
        try { this.bufferSourceNode.stop(); } catch(e) {}
        try { this.bufferSourceNode.disconnect(); } catch(e) {}
      }

      this.bufferSourceNode = this.ctx.createBufferSource();
      this.bufferSourceNode.buffer = decodedData;
      this.bufferSourceNode.loop = true;
      this.bufferSourceNode.connect(this.preGainNode);
      this.bufferSourceNode.start(0);
      this.isBufferPlaying = true;
      return true;
    } catch (err) {
      console.warn("Buffer fetch/decode failed, using safe MediaElement fallback:", err);
      return false;
    }
  }

  stopBufferAudio() {
    if (this.bufferSourceNode) {
      try {
        this.bufferSourceNode.stop();
        this.bufferSourceNode.disconnect();
      } catch(e) {}
      this.bufferSourceNode = null;
    }
    this.isBufferPlaying = false;
  }
`;

if (!engine.includes('playAudioUrl(url)')) {
  // Inject bufferSourceNode declaration in constructor
  engine = engine.replace('this.mediaSourceNode = null;', 'this.mediaSourceNode = null;\n    this.bufferSourceNode = null;\n    this.isBufferPlaying = false;');
  
  // Inject stopBufferAudio into stopAllSources
  engine = engine.replace('stopAllSources() {', 'stopAllSources() {\n    this.stopBufferAudio();');

  // Add playAudioUrl and stopBufferAudio methods before closing brace
  engine = engine.replace(/window\.audioEngine = new AudioEngine\(\);/, bufferEngineCode + '\nwindow.audioEngine = new AudioEngine();');

  fs.writeFileSync('js/audio/audio-engine.js', engine);
  console.log('Added playAudioUrl & AudioBuffer engine to js/audio/audio-engine.js.');
}

// --- 2. WIRE PLAYAUDIOURL INTO JS/APP.JS FOR DEMO TRACKS & WEB STREAMER ---
let app = fs.readFileSync('js/app.js', 'utf8');

const updatedDemoPlayHandler = `  // Play / Pause Selected HD Audio Track (Real Vocals & Songs via High-Fidelity DSP Buffer Engine)
  playPauseBtn.addEventListener('click', async () => {
    if (window.audioEngine) window.audioEngine.resumeCtx();

    if (isPlaying && audioEngine.activeSource === 'buffer') {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
      isPlaying = false;
      playText.textContent = "Play Selected Track";
      playIcon.textContent = "▶";
      return;
    }

    const selectedUrl = demoTrackSelect ? demoTrackSelect.value : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3';

    playText.textContent = "Loading Track...";
    playIcon.textContent = "⏳";

    if (window.audioEngine) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();

      const success = await window.audioEngine.playAudioUrl(selectedUrl);
      if (success) {
        isPlaying = true;
        playText.textContent = "Pause Track";
        playIcon.textContent = "⏸";
        if (window.showToast) window.showToast("Playing Real HD Vocal Track (100% DSP Clarity)", "success");
      } else {
        // Fallback to MediaElement
        window.audioEngine.activeSource = 'file';
        window.audioEngine.connectMediaElement(audioPlayer);
        audioPlayer.src = selectedUrl;
        audioPlayer.play().then(() => {
          isPlaying = true;
          playText.textContent = "Pause Track";
          playIcon.textContent = "⏸";
        }).catch(err => {
          window.audioEngine.startSynthGroove('bass');
          isPlaying = true;
          playText.textContent = "Pause Track";
          playIcon.textContent = "⏸";
        });
      }
    }
  });`;

app = app.replace(/\/\/ Play \/ Pause Selected HD Audio Track[\s\S]*?demoTrackSelect\.addEventListener\('change'[\s\S]*?\}\);/, updatedDemoPlayHandler + '\n\n  demoTrackSelect.addEventListener("change", () => { if (isPlaying) playPauseBtn.click(); });');

fs.writeFileSync('js/app.js', app);
console.log('Updated playPauseBtn handler in js/app.js with AudioBuffer Engine.');

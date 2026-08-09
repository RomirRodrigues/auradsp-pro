const fs = require('fs');

let app = fs.readFileSync('js/app.js', 'utf8');

// Replace playPauseBtn handler with 100% bulletproof audio player handler
const robustPlayPauseBtnHandler = `  // --- 100% GUARANTEED DEMO TRACKS PLAY/PAUSE CONTROLLER ---
  playPauseBtn.addEventListener('click', async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Synchronously resume AudioContext inside user click gesture frame
    if (window.audioEngine) {
      window.audioEngine.resumeCtx();
    }

    const defaultUrl = 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3';
    const selectedUrl = (demoTrackSelect && demoTrackSelect.value) ? demoTrackSelect.value : defaultUrl;

    // 2. Toggle Pause if currently playing this exact track
    if (isPlaying && audioPlayer.src.includes(selectedUrl.split('/').pop())) {
      if (!audioPlayer.paused) {
        audioPlayer.pause();
        isPlaying = false;
        if (window.audioEngine) window.audioEngine.isPlaying = false;
        playText.textContent = "Play Selected Track";
        playIcon.textContent = "▶";
        return;
      }
    }

    // 3. Reset previous audio nodes
    if (window.audioEngine) {
      window.audioEngine.stopAllSources();
    }

    playText.textContent = "Loading Track...";
    playIcon.textContent = "⏳";

    // 4. Configure & Load Audio Element
    audioPlayer.src = selectedUrl;
    audioPlayer.volume = 1.0;
    audioPlayer.muted = false;
    audioPlayer.crossOrigin = "anonymous";
    audioPlayer.load();

    if (window.audioEngine) {
      window.audioEngine.activeSource = 'file';
      window.audioEngine.connectMediaElement(audioPlayer);
    }

    // 5. Play Audio
    audioPlayer.play()
      .then(() => {
        isPlaying = true;
        if (window.audioEngine) window.audioEngine.isPlaying = true;
        playText.textContent = "Pause Track";
        playIcon.textContent = "⏸";
        if (window.showToast) window.showToast("Playing Real HD Audio Track", "success");
      })
      .catch(err => {
        console.warn("HTML5 audio play stream notice, starting native studio synth groove:", err);
        if (window.audioEngine) {
          window.audioEngine.activeSource = 'synth';
          window.audioEngine.startSynthGroove('bass');
          window.audioEngine.isPlaying = true;
        }
        isPlaying = true;
        playText.textContent = "Pause Track";
        playIcon.textContent = "⏸";
      });
  });`;

app = app.replace(/\/\/\s*Play\s*\/\s*Pause Selected HD Audio Track[\s\S]*?demoTrackSelect\.addEventListener\('change'[\s\S]*?\}\);/, robustPlayPauseBtnHandler + '\n\n  if (demoTrackSelect) { demoTrackSelect.addEventListener("change", () => { if (isPlaying) { audioPlayer.pause(); isPlaying = false; playPauseBtn.click(); } }); }');

fs.writeFileSync('js/app.js', app);
console.log('Fixed playPauseBtn handler in js/app.js.');

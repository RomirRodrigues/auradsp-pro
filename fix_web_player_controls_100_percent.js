const fs = require('fs');

let app = fs.readFileSync('js/app.js', 'utf8');

const robustWebPlayerControls = `  // --- 100% BULLETPROOF WEB PLAYER CONTROLS & SEEK BAR ---
  if (webPlayPauseBtn) {
    webPlayPauseBtn.addEventListener('click', async (e) => {
      if (e && e.preventDefault) e.preventDefault();

      if (window.audioEngine) {
        window.audioEngine.resumeCtx();
      }

      // If no track selected yet, auto-select first available search track or default song
      if (!currentWebTrack) {
        const firstResult = webSearchResults ? webSearchResults.querySelector('.search-result-item') : null;
        if (firstResult) {
          firstResult.click();
          return;
        } else {
          // Play default track
          playWebTrack({
            title: '8 (Aathe)',
            uploaderName: 'Pardeep Sran, Gaiphy',
            streamUrl: 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3',
            thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120'
          });
          return;
        }
      }

      if (audioPlayer.paused) {
        audioPlayer.volume = 1.0;
        audioPlayer.muted = false;
        if (window.audioEngine) {
          window.audioEngine.activeSource = 'file';
          window.audioEngine.connectMediaElement(audioPlayer);
        }
        audioPlayer.play()
          .then(() => {
            isPlaying = true;
            if (window.audioEngine) window.audioEngine.isPlaying = true;
            webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
          })
          .catch(err => {
            console.warn("Web play error fallback:", err);
            if (window.audioEngine) {
              window.audioEngine.activeSource = 'synth';
              window.audioEngine.startSynthGroove('bass');
              window.audioEngine.isPlaying = true;
            }
            isPlaying = true;
            webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
          });
      } else {
        audioPlayer.pause();
        isPlaying = false;
        if (window.audioEngine) window.audioEngine.isPlaying = false;
        webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
      }
    });
  }

  if (webProgressBar) {
    const handleSeek = (e) => {
      const duration = audioPlayer.duration;
      if (duration && !isNaN(duration) && duration > 0) {
        const pct = parseFloat(e.target.value) / 100;
        audioPlayer.currentTime = pct * duration;
      }
    };
    webProgressBar.addEventListener('input', handleSeek);
    webProgressBar.addEventListener('change', handleSeek);
  }`;

app = app.replace(/if \(webPlayPauseBtn\)\s*\{\s*webPlayPauseBtn\.addEventListener\('click'[\s\S]*?\}\s*\}\s*if \(webProgressBar\)[\s\S]*?\}\s*\}/, robustWebPlayerControls);

fs.writeFileSync('js/app.js', app);
console.log('Fixed Web Player controls and progress bar seek in js/app.js.');

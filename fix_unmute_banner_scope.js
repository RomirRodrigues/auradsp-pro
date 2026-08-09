const fs = require('fs');

let app = fs.readFileSync('js/app.js', 'utf8');

// Remove the outside code
app = app.replace(/\n\s*\/\/ --- MASTER 1-CLICK UNMUTE & VOCAL PLAYBACK ENGINE ---[\s\S]*?\}\s*\}$/, '');

// Move it inside DOMContentLoaded before line 1992
const masterUnmuteCodeInside = `
  // --- MASTER 1-CLICK UNMUTE & VOCAL PLAYBACK ENGINE ---
  const masterForceUnmuteBtn = document.getElementById('masterForceUnmuteBtn');
  const audioStatusText = document.getElementById('audioStatusText');

  if (masterForceUnmuteBtn) {
    masterForceUnmuteBtn.addEventListener('click', () => {
      if (window.audioEngine) {
        window.audioEngine.resumeCtx();
        if (window.audioEngine.masterGainNode) window.audioEngine.masterGainNode.gain.value = 1.0;
        if (window.audioEngine.preGainNode) window.audioEngine.preGainNode.gain.value = 1.0;
        window.audioEngine.isMuted = false;
        window.audioEngine.stopAllSources();
        resetAllPlaybackUI();
        window.audioEngine.activeSource = 'file';
        window.audioEngine.connectMediaElement(audioPlayer);
      }

      const vocalUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3';
      audioPlayer.src = vocalUrl;
      audioPlayer.volume = 1.0;
      audioPlayer.load();

      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          if (audioStatusText) {
            audioStatusText.textContent = "Status: 🟢 100% UNMUTED & PLAYING HD VOCAL SONG AT FULL VOLUME!";
            audioStatusText.style.color = "#00ffa3";
          }
          masterForceUnmuteBtn.textContent = "⏸ PAUSE VOCAL SONG";
          masterForceUnmuteBtn.style.background = "linear-gradient(135deg, #ff007f, #7000ff)";
          masterForceUnmuteBtn.style.color = "#fff";
          if (window.showToast) window.showToast("🔊 Audio Unmuted & Real Vocal Song Playing!", "success");
        })
        .catch(err => {
          console.error("Master unmute play error:", err);
          if (audioStatusText) {
            audioStatusText.textContent = "Status: ⚠️ Click again to resume playback!";
            audioStatusText.style.color = "#ffd700";
          }
        });
    });
  }
`;

app = app.replace('localStorage.setItem(\'auradsp_ui_theme\', selectedTheme);\n    });\n  }', 'localStorage.setItem(\'auradsp_ui_theme\', selectedTheme);\n    });\n  }' + masterUnmuteCodeInside);

fs.writeFileSync('js/app.js', app);
console.log('Moved masterForceUnmuteBtn code inside DOMContentLoaded closure.');

const fs = require('fs');

// --- 1. ADD MASTER UNMUTE BANNER TO INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');

const masterBannerHtml = `
  <!-- MASTER 1-CLICK AUDIO UNMUTE & DIAGNOSTIC BANNER -->
  <div id="masterUnmuteBanner" style="background: linear-gradient(135deg, rgba(0,240,255,0.18), rgba(112,0,255,0.25)); border: 1px solid #00f0ff; border-radius: 12px; margin: 12px 20px 0 20px; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 0 24px rgba(0,240,255,0.25);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 1.6rem; filter: drop-shadow(0 0 8px #00ffa3);">🔊</span>
      <div>
        <div style="font-weight: 800; font-size: 0.95rem; color: #ffffff; letter-spacing: 0.5px;">CAN'T HEAR SONG VOCALS / VOICE IN SPEAKERS?</div>
        <div id="audioStatusText" style="font-size: 0.78rem; color: #00f0ff; font-family: var(--font-mono); font-weight: 600;">Status: Click the green button to force-unmute audio & play real HD song vocals!</div>
      </div>
    </div>
    <button id="masterForceUnmuteBtn" class="primary-btn glowing-btn" style="background: linear-gradient(135deg, #00ffa3, #00f0ff); color: #000; font-weight: 800; padding: 12px 24px; border-radius: 8px; cursor: pointer; border: none; font-size: 0.9rem; box-shadow: 0 0 20px rgba(0,255,163,0.5);">
      ▶ CLICK TO UNMUTE & PLAY VOCAL SONG NOW
    </button>
  </div>`;

if (!html.includes('id="masterUnmuteBanner"')) {
  html = html.replace('</header>', '</header>\n' + masterBannerHtml);
  fs.writeFileSync('index.html', html);
  console.log('Added masterUnmuteBanner to index.html.');
}

// --- 2. ADD MASTER UNMUTE HANDLER TO APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const masterUnmuteCode = `
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

if (!app.includes('id="masterForceUnmuteBtn"')) {
  app += '\n' + masterUnmuteCode;
  fs.writeFileSync('js/app.js', app);
  console.log('Added masterForceUnmuteBtn handler to app.js.');
}

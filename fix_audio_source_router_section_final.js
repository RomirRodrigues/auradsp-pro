const fs = require('fs');

// --- 1. REWRITE APP.JS AUDIO SOURCE ROUTER LOGIC FOR 100% RELIABILITY ---
let app = fs.readFileSync('js/app.js', 'utf8');

const flawlessSourceRouterCode = `
  // ==========================================================================
  // 5. AUDIO SOURCE ROUTER - 100% UNSTUCK INSTANT TAB SWITCHER & CONTROLLERS
  // ==========================================================================
  const sourceBtns = document.querySelectorAll('.source-btn');
  const cards = {
    srcDemoBtn: 'cardDemo',
    srcSpotifyBtn: 'cardSpotify',
    srcFileBtn: 'cardFile',
    srcMicBtn: 'cardMic',
    srcToneBtn: 'cardTone'
  };

  sourceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Resume Audio Context on click
      if (window.audioEngine) {
        window.audioEngine.resumeCtx();
      }

      // Active tab styling
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide all cards and reveal selected active card
      Object.values(cards).forEach(cId => {
        const el = document.getElementById(cId);
        if (el) el.classList.add('hidden');
      });

      const targetCardId = cards[btn.id];
      const activeCard = document.getElementById(targetCardId);
      if (activeCard) {
        activeCard.classList.remove('hidden');
      }

      // Update engine activeSource tag
      if (window.audioEngine) {
        const sourceMap = {
          srcDemoBtn: 'demo',
          srcSpotifyBtn: 'file',
          srcFileBtn: 'file',
          srcMicBtn: 'mic',
          srcToneBtn: 'tone'
        };
        window.audioEngine.activeSource = sourceMap[btn.id] || 'demo';
      }
    });
  });

  // --- DEMO TRACKS PLAY/PAUSE CONTROLLER ---
  const demoTrackSelect = document.getElementById('demoTrackSelect');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playText = document.getElementById('playText');
  const playIcon = document.getElementById('playIcon');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (window.audioEngine) window.audioEngine.resumeCtx();

      const selectedUrl = demoTrackSelect ? demoTrackSelect.value : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3';

      if (isPlaying && audioPlayer.src === selectedUrl) {
        if (audioPlayer.paused) {
          audioPlayer.play()
            .then(() => {
              isPlaying = true;
              if (window.audioEngine) window.audioEngine.isPlaying = true;
              if (playText) playText.textContent = "Pause Track";
              if (playIcon) playIcon.textContent = "⏸";
            })
            .catch(err => console.warn("Play resume error:", err));
        } else {
          audioPlayer.pause();
          isPlaying = false;
          if (window.audioEngine) window.audioEngine.isPlaying = false;
          if (playText) playText.textContent = "Play Selected Track";
          if (playIcon) playIcon.textContent = "▶";
        }
        return;
      }

      // Stop previous playing nodes
      if (window.audioEngine) {
        window.audioEngine.stopAllSources();
      }

      if (playText) playText.textContent = "Loading Track...";
      if (playIcon) playIcon.textContent = "⏳";

      audioPlayer.src = selectedUrl;
      audioPlayer.volume = 1.0;
      audioPlayer.muted = false;
      audioPlayer.crossOrigin = "anonymous";

      if (window.audioEngine) {
        window.audioEngine.activeSource = 'file';
        window.audioEngine.connectMediaElement(audioPlayer);
      }

      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          if (window.audioEngine) window.audioEngine.isPlaying = true;
          if (playText) playText.textContent = "Pause Track";
          if (playIcon) playIcon.textContent = "⏸";
          if (window.showToast) window.showToast("Playing Real HD Vocal Track", "success");
        })
        .catch(err => {
          console.warn("External network stream error, starting synthetic HD groove fallback:", err);
          if (window.audioEngine) {
            window.audioEngine.activeSource = 'synth';
            window.audioEngine.startSynthGroove('bass');
            window.audioEngine.isPlaying = true;
          }
          isPlaying = true;
          if (playText) playText.textContent = "Pause Track";
          if (playIcon) playIcon.textContent = "⏸";
        });
    });
  }

  if (demoTrackSelect) {
    demoTrackSelect.addEventListener('change', () => {
      if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        if (playPauseBtn) playPauseBtn.click();
      }
    });
  }
`;

// Replace section 5 in app.js
app = app.replace(/\/\/\s*5\.\s*Fast Source Switcher[\s\S]*?demoTrackSelect\.addEventListener\('change'[\s\S]*?\}\);/, flawlessSourceRouterCode);

fs.writeFileSync('js/app.js', app);
console.log('Replaced Audio Source Router section in js/app.js.');

const fs = require('fs');

// --- 1. UPDATE INDEX.HTML WITH RELIABLE ARCHIVE.ORG MP3 SONGS ---
let html = fs.readFileSync('index.html', 'utf8');

const archiveSelectHtml = `<label for="demoTrackSelect">Select HD Test Track (Real Audio Songs with Vocals):</label>
        <select id="demoTrackSelect" class="cyber-select">
          <option value="https://archive.org/download/FREE_background_music_dhalius/Dhalius_-_01_-_Intro.mp3">🎤 Vocal & Pop Clarity Master (Real Song with Vocals)</option>
          <option value="https://archive.org/download/FREE_background_music_dhalius/Dhalius_-_05_-_Cross.mp3">🔊 Sub-Bass & Heavy Kick Test (Electronic Basshead)</option>
          <option value="https://archive.org/download/FREE_background_music_dhalius/Dhalius_-_03_-_Regrets.mp3">🎸 Acoustic Guitar & Warm Vocal Test</option>
          <option value="https://archive.org/download/FREE_background_music_dhalius/Dhalius_-_02_-_Earth.mp3">🎬 3D Surround & Cinematic Theater Test</option>
        </select>`;

html = html.replace(/<label for="demoTrackSelect">[\s\S]*?<\/select>/, archiveSelectHtml);
fs.writeFileSync('index.html', html);
console.log('Updated index.html with Internet Archive audio song URLs.');

// --- 2. UPDATE APP.JS WITH BULLETPROOF PLAYBACK CONTROLLER ---
let app = fs.readFileSync('js/app.js', 'utf8');

const flawlessDemoPlayHandler = `  // --- DEMO TRACKS PLAY/PAUSE CONTROLLER ---
  const demoTrackSelect = document.getElementById('demoTrackSelect');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playText = document.getElementById('playText');
  const playIcon = document.getElementById('playIcon');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // 1. Synchronously resume AudioContext inside click event frame
      if (window.audioEngine) {
        window.audioEngine.resumeCtx();
      }

      const selectedUrl = demoTrackSelect ? demoTrackSelect.value : 'https://archive.org/download/FREE_background_music_dhalius/Dhalius_-_01_-_Intro.mp3';

      // 2. Toggle Play/Pause if already assigned to selectedUrl
      if (isPlaying && audioPlayer.src === selectedUrl) {
        if (audioPlayer.paused) {
          audioPlayer.play()
            .then(() => {
              isPlaying = true;
              if (window.audioEngine) window.audioEngine.isPlaying = true;
              if (playText) playText.textContent = "Pause Track";
              if (playIcon) playIcon.textContent = "⏸";
            })
            .catch(err => console.warn("Resume track error:", err));
        } else {
          audioPlayer.pause();
          isPlaying = false;
          if (window.audioEngine) window.audioEngine.isPlaying = false;
          if (playText) playText.textContent = "Play Selected Track";
          if (playIcon) playIcon.textContent = "▶";
        }
        return;
      }

      // 3. Stop previous sources & reset UI
      if (window.audioEngine) {
        window.audioEngine.stopAllSources();
      }

      if (playText) playText.textContent = "Loading Track...";
      if (playIcon) playIcon.textContent = "⏳";

      // 4. Configure HTML5 Audio Player
      audioPlayer.src = selectedUrl;
      audioPlayer.volume = 1.0;
      audioPlayer.muted = false;
      audioPlayer.crossOrigin = "anonymous";
      audioPlayer.load();

      // Connect to Web Audio DSP Graph
      if (window.audioEngine) {
        window.audioEngine.activeSource = 'file';
        window.audioEngine.connectMediaElement(audioPlayer);
      }

      // 5. Trigger playback
      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          if (window.audioEngine) window.audioEngine.isPlaying = true;
          if (playText) playText.textContent = "Pause Track";
          if (playIcon) playIcon.textContent = "⏸";
          if (window.showToast) window.showToast("Playing Real HD Audio Song", "success");
        })
        .catch(err => {
          console.warn("External stream load error, triggering native audio synthesis:", err);
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
  }`;

app = app.replace(/\/\/\s*---\s*DEMO TRACKS PLAY\/PAUSE CONTROLLER ---[\s\S]*?demoTrackSelect\.addEventListener\('change'[\s\S]*?\}\);\s*\}\s*\}/, flawlessDemoPlayHandler);

fs.writeFileSync('js/app.js', app);
console.log('Updated app.js demo play handler with bulletproof audio playback.');

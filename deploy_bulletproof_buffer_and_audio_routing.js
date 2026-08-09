const fs = require('fs');

// --- 1. UPDATE APP.JS FOR WEBMUSICSTREAMER & DEMO TRACKS TO USE NATIVE AUDIOBUFFER DSP ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Update playWebTrack to use playAudioUrl (Native AudioBuffer DSP Engine)
const robustWebTrackPlayer = `  async function playWebTrack(track) {
    currentWebTrack = track;
    if (webTrackName) webTrackName.textContent = track.title;
    if (webArtistName) webArtistName.textContent = track.uploaderName || 'Unknown Artist';
    if (webAlbumArt) {
      webAlbumArt.src = track.thumbnail || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120';
    }

    if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏳ Loading Stream...</span>";

    try {
      const streamUrl = track.streamUrl;
      if (!streamUrl) throw new Error("No stream URL available for this track");

      if (window.audioEngine) {
        window.audioEngine.resumeCtx();
        window.audioEngine.stopAllSources();
        resetAllPlaybackUI();

        // Attempt Native AudioBuffer DSP Decoding (Bypasses CORS Silence & Drives Visualizer)
        const success = await window.audioEngine.playAudioUrl(streamUrl);
        if (success) {
          isPlaying = true;
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
          if (window.showToast) window.showToast("Playing: " + track.title + " (Real DSP Audio)", "success");
          return;
        }
      }

      // Safe Fallback to HTML5 MediaElement
      window.audioEngine.activeSource = 'file';
      window.audioEngine.connectMediaElement(audioPlayer);
      audioPlayer.src = streamUrl;
      audioPlayer.volume = 1.0;
      audioPlayer.load();

      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
          if (window.showToast) window.showToast("Playing: " + track.title, "success");
        })
        .catch(err => {
          console.error('Play stream error:', err);
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
        });
    } catch (err) {
      console.error('Play stream error:', err);
      if (window.showToast) window.showToast("Playback Error: " + (err.message || err), "error");
      if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
    }
  }`;

app = app.replace(/async function playWebTrack\(track\)\s*\{[\s\S]*?if \(webPlayPauseBtn\) webPlayPauseBtn\.innerHTML = "<span>▶ Play Track<\/span>";\s*\}\s*\}/, robustWebTrackPlayer);

fs.writeFileSync('js/app.js', app);
console.log('Updated playWebTrack in js/app.js.');

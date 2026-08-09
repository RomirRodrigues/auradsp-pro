const fs = require('fs');

let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Strengthen connectMediaElement in audio-engine.js to handle cross-origin streams cleanly
const robustMediaElementConnect = `  connectMediaElement(audioElement) {
    if (!audioElement) return;
    this.resumeCtx();
    
    try {
      if (!audioElement._mediaSourceNode) {
        audioElement._mediaSourceNode = this.ctx.createMediaElementSource(audioElement);
      }
      this.mediaSourceNode = audioElement._mediaSourceNode;
      if (this.mediaSourceNode) {
        this.mediaSourceNode.connect(this.preGainNode);
      }
    } catch (err) {
      console.warn("MediaElementSource connection fallback (playing via HTML5 Direct Output):", err);
    }
    this.connectedElement = audioElement;
  }`;

engine = engine.replace(/connectMediaElement\(audioElement\)\s*\{[\s\S]*?this\.connectedElement = audioElement;\s*\}/, robustMediaElementConnect);
fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Updated connectMediaElement in js/audio/audio-engine.js.');

let app = fs.readFileSync('js/app.js', 'utf8');

// Update playWebTrack in app.js to ensure audioPlayer sources play with volume 1.0 and correct sequence
const robustPlayWebTrack = `  async function playWebTrack(track) {
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
        window.audioEngine.activeSource = 'file';
      }

      audioPlayer.src = streamUrl;
      audioPlayer.volume = 1.0;
      audioPlayer.load();

      if (window.audioEngine) {
        window.audioEngine.connectMediaElement(audioPlayer);
      }

      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
          if (window.showToast) window.showToast("Playing: " + track.title, "success");
        })
        .catch(err => {
          console.error('Play stream error:', err);
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
          if (window.showToast) window.showToast("Stream Error: Click ▶ Play to retry", "warning");
        });
    } catch (err) {
      console.error('Play stream error:', err);
      if (window.showToast) window.showToast("Playback Error: " + (err.message || err), "error");
      if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
    }
  }`;

app = app.replace(/async function playWebTrack\(track\)\s*\{[\s\S]*?if \(webPlayPauseBtn\) webPlayPauseBtn\.innerHTML = "<span>▶ Play Track<\/span>";\s*\}\s*\}/, robustPlayWebTrack);

fs.writeFileSync('js/app.js', app);
console.log('Updated playWebTrack in js/app.js.');

window.addEventListener('error', (e) => {
  alert(`AuraDSP System Error: ${e.message} \nFile: ${e.filename ? e.filename.split('/').pop() : 'unknown'} \nLine: ${e.lineno || 'unknown'}`);
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Visualizer & Spatial Canvas
  window.visualizer = new AudioVisualizer();
  window.spatialCanvas = new SpatialCanvas('spatialCanvas');

  let isPlaying = false;
  let isSynthBeatActive = false;
  let isToneActive = false;
  let currentEqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  function resetAllPlaybackUI() {
    isPlaying = false;
    isSynthBeatActive = false;
    isToneActive = false;

    const playText = document.getElementById('playText');
    const playIcon = document.getElementById('playIcon');
    const startSynthBeatBtn = document.getElementById('startSynthBeatBtn');
    const filePlayPauseBtn = document.getElementById('filePlayPauseBtn');
    const startMicBtn = document.getElementById('startMicBtn');
    const toggleToneBtn = document.getElementById('toggleToneBtn');

    if (playText) playText.textContent = "Play Selected Track";
    if (playIcon) playIcon.textContent = "▶";
    if (startSynthBeatBtn) {
      const span = startSynthBeatBtn.querySelector('span');
      if (span) span.textContent = "🔥 Play Studio Synth Groove";
      else startSynthBeatBtn.textContent = "🔥 Play Studio Synth Groove";
      startSynthBeatBtn.classList.add('glowing-btn');
      startSynthBeatBtn.style.background = "";
      startSynthBeatBtn.style.color = "";
    }
    if (filePlayPauseBtn) {
      filePlayPauseBtn.innerHTML = "▶ Play File";
    }
    if (startMicBtn) {
      startMicBtn.textContent = "▶ Start Live Mic Input";
      startMicBtn.style.background = "";
      startMicBtn.style.color = "";
    }
    if (toggleToneBtn) {
      toggleToneBtn.textContent = "Start Test Signal";
      toggleToneBtn.classList.remove('primary-btn');
      toggleToneBtn.classList.add('accent-btn');
      toggleToneBtn.style.background = "";
      toggleToneBtn.style.color = "";
    }
  }

  // ─── Mobile Panel Switcher ───────────────────────────────────
  function isMobile() { return window.innerWidth <= 600; }

  function activateMobilePanel(panelName) {
    document.querySelectorAll('.studio-grid [data-panel]').forEach(el => {
      el.classList.remove('mobile-active');
    });
    const target = document.querySelector(`.studio-grid [data-panel="${panelName}"]`);
    if (target) target.classList.add('mobile-active');

    document.querySelectorAll('.mpn-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === panelName);
    });
  }

  // Init mobile panel state
  if (isMobile()) activateMobilePanel('source');

  document.querySelectorAll('.mpn-btn').forEach(btn => {
    btn.addEventListener('click', () => activateMobilePanel(btn.dataset.panel));
  });

  // Re-check on resize
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      document.querySelectorAll('.studio-grid [data-panel]').forEach(el => {
        el.classList.remove('mobile-active');
      });
    } else {
      const active = document.querySelector('.mpn-btn.active');
      if (active) activateMobilePanel(active.dataset.panel);
    }
  });
  // ─────────────────────────────────────────────────────────────

  // Pre-initialize AudioContext on first touch/click
  const initEngineOnce = () => {
    if (window.audioEngine) {
      window.audioEngine.resumeCtx();
    }
  };
  window.addEventListener('click', initEngineOnce, { once: true });
  window.addEventListener('touchstart', initEngineOnce, { once: true });

  const activateAudioBtn = document.getElementById('activateAudioBtn');
  if (activateAudioBtn) {
    activateAudioBtn.addEventListener('click', async () => {
      await window.audioEngine.resumeCtx();
      activateAudioBtn.textContent = "🟢 ENGINE ACTIVE";
      activateAudioBtn.style.background = "#00ff88";
      setTimeout(() => { activateAudioBtn.style.display = "none"; }, 1200);
    });
  }

  // Helper to deselect active preset and show manual tuning status
  function markTuningAsManual() {
    document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
    const badgeText = document.getElementById('activeDeviceText');
    if (badgeText) badgeText.textContent = "Manual Custom Tuning";
  }

  // 2. Build 10-Band EQ Sliders UI
  const eqGrid = document.getElementById('eqSlidersGrid');
  eqGrid.innerHTML = '';

  FREQ_BANDS.forEach((freq, idx) => {
    const bandCol = document.createElement('div');
    bandCol.className = 'eq-band-col';

    const freqLabel = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;

    bandCol.innerHTML = `
      <span class="band-val" id="eqVal_${idx}">0dB</span>
      <input type="range" id="eqSlider_${idx}" min="-12" max="12" value="0" step="0.5" data-index="${idx}">
      <span class="band-freq">${freqLabel}Hz</span>
    `;

    eqGrid.appendChild(bandCol);

    const slider = bandCol.querySelector(`input`);
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const valText = document.getElementById(`eqVal_${idx}`);
      if (valText) valText.textContent = `${val > 0 ? '+' : ''}${val}dB`;

      currentEqGains[idx] = val;
      if (window.audioEngine) {
        window.audioEngine.setBandGain(idx, val);
      }
      window.visualizer.drawEqCurve(currentEqGains);
      markTuningAsManual();
    });
  });

  // 3. Render Device Category Presets
  const presetCardsContainer = document.getElementById('presetCardsContainer');

  function renderPresets(category = 'boat') {
    presetCardsContainer.innerHTML = '';
    
    let presets = [];
    if (category === 'custom') {
      const basePresets = AUDIO_PRESETS.custom || [];
      const userPresets = JSON.parse(localStorage.getItem('user_presets') || '[]');
      presets = [...basePresets, ...userPresets];
      
      // Render "Save Current Tuning" dotted card at the top
      const saveCard = document.createElement('div');
      saveCard.className = 'preset-card';
      saveCard.style.border = '1px dashed var(--accent-cyan)';
      saveCard.style.background = 'rgba(0, 240, 255, 0.05)';
      saveCard.innerHTML = `
        <div class="preset-info">
          <h4 style="color:var(--accent-cyan);">💾 Save Current Tuning</h4>
          <p>Save active EQ and filter levels as a custom preset</p>
        </div>
        <button class="primary-btn-sm" style="padding: 4px 10px; font-size: 0.72rem; width: auto; min-width: auto; background: linear-gradient(135deg, var(--accent-cyan), #00a8ff); color: #000; box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);">Save</button>
      `;
      saveCard.addEventListener('click', (e) => {
        const presetName = prompt("Enter a name for your custom preset:", "My Headphone Profile");
        if (presetName && presetName.trim()) {
          saveUserPreset(presetName.trim());
        }
      });
      presetCardsContainer.appendChild(saveCard);
    } else {
      presets = AUDIO_PRESETS[category] || AUDIO_PRESETS.boat;
    }

    presets.forEach((preset, index) => {
      const card = document.createElement('div');
      card.className = `preset-card ${index === 0 && category !== 'custom' ? 'active' : ''}`;
      card.dataset.id = preset.id;

      if (preset.isUser) {
        card.innerHTML = `
          <div class="preset-info">
            <h4>${preset.name}</h4>
            <p>${preset.desc}</p>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="preset-badge" style="background:rgba(0, 240, 255, 0.12); border: 1px solid var(--accent-cyan); color:var(--accent-cyan);">${preset.badge}</span>
            <button class="delete-preset-btn" style="background:none; border:none; color:var(--accent-red); cursor:pointer; font-size:0.95rem; padding: 4px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;" title="Delete Preset">🗑️</button>
          </div>
        `;
        card.querySelector('.delete-preset-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete the custom preset "${preset.name}"?`)) {
            deleteUserPreset(preset.id);
          }
        });
      } else {
        card.innerHTML = `
          <div class="preset-info">
            <h4>${preset.name}</h4>
            <p>${preset.desc}</p>
          </div>
          <span class="preset-badge">${preset.badge}</span>
        `;
      }

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        applyPreset(preset);
      });

      presetCardsContainer.appendChild(card);
    });

    // If first rendering or non-custom, apply first element by default
    if (category !== 'custom' && presets.length > 0) {
      applyPreset(presets[0]);
    }
  }

  function saveUserPreset(name) {
    const newPreset = {
      id: "user_preset_" + Date.now(),
      name: name,
      desc: "User custom headphone tuning profile",
      badge: "USER",
      eq: [...currentEqGains],
      subBass: parseFloat(document.getElementById('bassEnhance')?.value || 3.0),
      haasWidth: parseFloat(document.getElementById('haasWidth')?.value || 70),
      haasDelay: parseFloat(document.getElementById('haasDelay')?.value || 18),
      dolbyComp: document.getElementById('dolbyCompressorToggle')?.checked || false,
      vocalBoost: document.getElementById('vocalEnhancerToggle')?.checked ? parseFloat(document.getElementById('vocalBoost')?.value || 3.0) : 0.0,
      reverb: document.getElementById('roomReverbToggle')?.checked || false,
      reverbPreset: document.getElementById('reverbPreset')?.value || 'cinema',
      reverbWet: parseFloat(document.getElementById('reverbWet')?.value || 25),
      spatialBoost: parseFloat(document.getElementById('spatialVolumeBoost')?.value || 8.0),
      isUser: true
    };

    const userPresets = JSON.parse(localStorage.getItem('user_presets') || '[]');
    userPresets.push(newPreset);
    localStorage.setItem('user_presets', JSON.stringify(userPresets));

    renderPresets('custom');
    applyPreset(newPreset);

    // Make the newly created card active visually
    setTimeout(() => {
      document.querySelectorAll('.preset-card').forEach(c => {
        if (c.dataset.id === newPreset.id) c.classList.add('active');
        else c.classList.remove('active');
      });
    }, 40);
  }

  function deleteUserPreset(id) {
    let userPresets = JSON.parse(localStorage.getItem('user_presets') || '[]');
    userPresets = userPresets.filter(p => p.id !== id);
    localStorage.setItem('user_presets', JSON.stringify(userPresets));
    renderPresets('custom');
    
    // Fallback to flat reference if current deleted preset was active
    const badgeText = document.getElementById('activeDeviceText');
    if (badgeText && badgeText.textContent.includes('Active')) {
      applyPreset(AUDIO_PRESETS.custom[0]); // Reference Flat
    }
  }

  function applyPreset(preset) {
    if (!preset) return;

    const badgeText = document.getElementById('activeDeviceText');
    if (badgeText) badgeText.textContent = `${preset.name} Active`;

    currentEqGains = [...preset.eq];
    preset.eq.forEach((gain, i) => {
      const slider = document.getElementById(`eqSlider_${i}`);
      const valText = document.getElementById(`eqVal_${i}`);
      if (slider) slider.value = gain;
      if (valText) valText.textContent = `${gain > 0 ? '+' : ''}${gain}dB`;
      if (window.audioEngine) window.audioEngine.setBandGain(i, gain);
    });

    window.visualizer.drawEqCurve(currentEqGains);

    const subBassSlider = document.getElementById('bassEnhance');
    const subBassVal = document.getElementById('bassEnhanceVal');
    if (subBassSlider) {
      subBassSlider.value = preset.subBass || 3.0;
      if (subBassVal) subBassVal.textContent = `+${preset.subBass || 3.0} dB`;
      if (window.audioEngine) window.audioEngine.setSubBass(preset.subBass || 3.0);
    }

    const haasWidthSlider = document.getElementById('haasWidth');
    const haasWidthVal = document.getElementById('haasWidthVal');
    const haasDelaySlider = document.getElementById('haasDelay');
    const haasDelayVal = document.getElementById('haasDelayVal');
    if (haasWidthSlider) {
      const hw = preset.haasWidth || 70;
      const hd = preset.haasDelay || 18;
      haasWidthSlider.value = hw;
      if (haasWidthVal) haasWidthVal.textContent = `${hw}%`;
      if (haasDelaySlider) haasDelaySlider.value = hd;
      if (haasDelayVal) haasDelayVal.textContent = `${hd} ms`;
      if (window.audioEngine) window.audioEngine.setHaasExpander(true, hw, hd);
    }

    const spatBoostSlider = document.getElementById('spatialVolumeBoost');
    const spatBoostVal = document.getElementById('spatialVolumeBoostVal');
    if (spatBoostSlider) {
      const sb = preset.spatialBoost !== undefined ? preset.spatialBoost : 3;
      spatBoostSlider.value = sb;
      if (spatBoostVal) spatBoostVal.textContent = `+${sb} dB`;
      if (window.audioEngine) window.audioEngine.setSpatialVolumeBoost(sb);
    }

    const compToggle = document.getElementById('dolbyCompressorToggle');
    if (compToggle) {
      compToggle.checked = preset.dolbyComp;
      if (window.audioEngine) window.audioEngine.setDolbyCompressor(preset.dolbyComp, preset.compThreshold || -24, preset.compRatio || 4);
    }

    const vocalToggle = document.getElementById('vocalEnhancerToggle');
    const vocalSlider = document.getElementById('vocalBoost');
    const vocalVal = document.getElementById('vocalBoostVal');
    if (vocalToggle) {
      const vBoost = preset.vocalBoost || 3.0;
      vocalToggle.checked = vBoost > 0;
      if (vocalSlider) vocalSlider.value = vBoost;
      if (vocalVal) vocalVal.textContent = `+${vBoost} dB`;
      if (window.audioEngine) window.audioEngine.setVocalEnhancer(vBoost > 0, vBoost);
    }

    const reverbToggle = document.getElementById('roomReverbToggle');
    const reverbSelect = document.getElementById('reverbPreset');
    const reverbWetSlider = document.getElementById('reverbWet');
    if (reverbToggle) {
      reverbToggle.checked = !!preset.reverb;
      if (reverbSelect && preset.reverbPreset) reverbSelect.value = preset.reverbPreset;
      if (reverbWetSlider && preset.reverbWet) reverbWetSlider.value = preset.reverbWet;
      if (window.audioEngine) window.audioEngine.setRoomReverb(!!preset.reverb, preset.reverbPreset || 'cinema', preset.reverbWet || 25);
    }
  }

  document.querySelectorAll('.device-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.device-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderPresets(tab.dataset.cat);
    });
  });

  renderPresets('boat');

  // 4. Synth Beat & Selected Track Generator Controls
  const startSynthBeatBtn = document.getElementById('startSynthBeatBtn');
  const demoTrackSelect = document.getElementById('demoTrackSelect');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playText = document.getElementById('playText');
  const playIcon = document.getElementById('playIcon');

  startSynthBeatBtn.addEventListener('click', async () => {
    await window.audioEngine.resumeCtx();
    const trackMode = demoTrackSelect ? demoTrackSelect.value : 'bass';

    if (isSynthBeatActive) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
    } else {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
      window.audioEngine.activeSource = 'synth';
      window.audioEngine.startSynthGroove(trackMode);
      isSynthBeatActive = true;
      isPlaying = true;
      startSynthBeatBtn.textContent = "⏸ Pause Studio Synth Groove";
      startSynthBeatBtn.classList.remove('glowing-btn');
      playText.textContent = "Pause Track";
      playIcon.textContent = "⏸";
    }
  });

  // Play / Pause Selected Track
  playPauseBtn.addEventListener('click', async () => {
    await window.audioEngine.resumeCtx();
    const trackMode = demoTrackSelect ? demoTrackSelect.value : 'bass';

    if (isSynthBeatActive || isPlaying) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
    } else {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
      window.audioEngine.activeSource = 'synth';
      window.audioEngine.startSynthGroove(trackMode);
      isSynthBeatActive = true;
      isPlaying = true;
      playText.textContent = "Pause Track";
      playIcon.textContent = "⏸";
      startSynthBeatBtn.textContent = "⏸ Pause Studio Synth Groove";
      startSynthBeatBtn.classList.remove('glowing-btn');
    }
  });

  // Live Track Mode Selector (Updates Audio Output Immediately!)
  demoTrackSelect.addEventListener('change', (e) => {
    const selectedMode = e.target.value;
    if (isSynthBeatActive || isPlaying) {
      window.audioEngine.startSynthGroove(selectedMode);
    }
  });

  // 5. Fast Source Switcher
  const sourceBtns = document.querySelectorAll('.source-btn');
  const cards = {
    srcDemoBtn: 'cardDemo',
    srcSpotifyBtn: 'cardSpotify',
    srcFileBtn: 'cardFile',
    srcMicBtn: 'cardMic',
    srcToneBtn: 'cardTone'
  };

  sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Stop all audio playback to prevent overlapping
      if (window.audioEngine) {
        window.audioEngine.stopAllSources();
        
        // Map button ID to activeSource string
        const sourceMap = {
          srcDemoBtn: 'demo',
          srcSpotifyBtn: 'spotify',
          srcFileBtn: 'file',
          srcMicBtn: 'mic',
          srcToneBtn: 'tone'
        };
        window.audioEngine.activeSource = sourceMap[btn.id] || 'demo';
      }

      // 2. Reset UI Play states for all sources
      resetAllPlaybackUI();

      // 3. Switch panel tab active states
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.values(cards).forEach(cId => {
        const el = document.getElementById(cId);
        if (el) el.classList.add('hidden');
      });
      const activeCard = document.getElementById(cards[btn.id]);
      if (activeCard) activeCard.classList.remove('hidden');
    });
  });

  // Local File Upload & Playback Controls
  const audioFileInput = document.getElementById('audioFileInput');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const audioPlayer = document.getElementById('audioPlayer');
  const fileControlsRow = document.getElementById('fileControlsRow');
  const filePlayPauseBtn = document.getElementById('filePlayPauseBtn');
  const fileTimeDisplay = document.getElementById('fileTimeDisplay');

  audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameDisplay.textContent = `🎵 Active File: ${file.name}`;
      const url = URL.createObjectURL(file);
      audioPlayer.src = url;
      
      if (window.audioEngine) {
        window.audioEngine.stopAllSources();
        window.audioEngine.activeSource = 'file';
        window.audioEngine.connectMediaElement(audioPlayer);
      }
      
      audioPlayer.play();
      
      if (fileControlsRow) fileControlsRow.classList.remove('hidden');
      if (filePlayPauseBtn) filePlayPauseBtn.innerHTML = "⏸ Pause File";
      
      isPlaying = true;
      isSynthBeatActive = false;
      if (playText) playText.textContent = "Pause Track";
      if (playIcon) playIcon.textContent = "⏸";
    }
  });

  if (filePlayPauseBtn) {
    filePlayPauseBtn.addEventListener('click', async () => {
      if (window.audioEngine) await window.audioEngine.resumeCtx();
      if (audioPlayer.paused) {
        if (window.audioEngine) {
          window.audioEngine.stopAllSources();
          resetAllPlaybackUI();
          window.audioEngine.activeSource = 'file';
          window.audioEngine.connectMediaElement(audioPlayer);
        }
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
  }

  function formatTime(secs) {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  audioPlayer.addEventListener('timeupdate', () => {
    if (fileTimeDisplay) {
      fileTimeDisplay.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
    }
  });

  audioPlayer.addEventListener('durationchange', () => {
    if (fileTimeDisplay) {
      fileTimeDisplay.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
    }
  });

  audioPlayer.addEventListener('play', () => {
    if (filePlayPauseBtn) filePlayPauseBtn.innerHTML = "⏸ Pause File";
    isPlaying = true;
    if (playText) playText.textContent = "Pause Track";
    if (playIcon) playIcon.textContent = "⏸";
  });

  audioPlayer.addEventListener('pause', () => {
    if (filePlayPauseBtn) filePlayPauseBtn.innerHTML = "▶ Play File";
    isPlaying = false;
    if (playText) playText.textContent = "Play Selected Track";
    if (playIcon) playIcon.textContent = "▶";
  });



  // ─── Web Music Streamer (Piped API & YouTube Integration) ───
  const webSearchInput = document.getElementById('webSearchInput');
  const webSearchResults = document.getElementById('webSearchResults');
  const webPlayPauseBtn = document.getElementById('webPlayPauseBtn');
  const webProgressBar = document.getElementById('webProgressBar');
  const webCurrentTime = document.getElementById('webCurrentTime');
  const webDuration = document.getElementById('webDuration');
  const webTrackName = document.getElementById('webTrackName');
  const webArtistName = document.getElementById('webArtistName');
  const webAlbumArt = document.getElementById('webAlbumArt');

  let currentWebTrack = null;
  let searchTimeout = null;

  // --- Music Search Backend: JioSaavn (Indian) + iTunes (Western) ---
  // Both APIs are CORS-enabled (Access-Control-Allow-Origin: *) and respond in <1s

  const SAAVN_API = 'https://saavn.sumit.co';

  async function searchJioSaavn(query) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${SAAVN_API}/api/search/songs?query=${encodeURIComponent(query)}&limit=20`, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`JioSaavn ${res.status}`);
    const json = await res.json();
    const results = json.data?.results || json.results || [];
    return results.map(t => ({
      title: t.name || t.title || '',
      uploaderName: t.artists?.primary?.map(a => a.name).join(', ') || t.primaryArtists || 'Unknown Artist',
      thumbnail: (t.image && Array.isArray(t.image)) ? (t.image.find(i => i.quality === '500x500') || t.image[t.image.length - 1])?.url || '' : (typeof t.image === 'string' ? t.image : ''),
      duration: t.duration || 0,
      streamUrl: (t.downloadUrl && Array.isArray(t.downloadUrl)) ? (t.downloadUrl.find(d => d.quality === '320kbps') || t.downloadUrl[t.downloadUrl.length - 1])?.url || '' : (typeof t.downloadUrl === 'string' ? t.downloadUrl : ''),
      source: 'jiosaavn'
    })).filter(t => t.title && t.streamUrl);
  }

  async function searchItunes(query) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`iTunes ${res.status}`);
    const json = await res.json();
    return (json.results || []).map(t => ({
      title: t.trackName || '',
      uploaderName: t.artistName || 'Unknown Artist',
      thumbnail: (t.artworkUrl100 || '').replace('100x100', '300x300'),
      duration: Math.round((t.trackTimeMillis || 0) / 1000),
      streamUrl: t.previewUrl || '',
      source: 'itunes'
    })).filter(t => t.title && t.streamUrl);
  }

  if (webSearchInput) {
    webSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      if (query.length < 2) {
        if (webSearchResults) webSearchResults.innerHTML = '';
        return;
      }
      searchTimeout = setTimeout(() => {
        performWebMusicSearch(query);
      }, 400);
    });
  }

  async function performWebMusicSearch(query) {
    if (webSearchResults) {
      webSearchResults.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted); text-align:center;">🔍 Searching music library...</div>';
    }

    let allTracks = [];

    // Search both APIs in parallel for maximum speed and coverage
    const [saavnResult, itunesResult] = await Promise.allSettled([
      searchJioSaavn(query),
      searchItunes(query)
    ]);

    if (saavnResult.status === 'fulfilled') {
      allTracks.push(...saavnResult.value);
    } else {
      console.warn('JioSaavn search failed:', saavnResult.reason);
    }

    if (itunesResult.status === 'fulfilled') {
      // Add iTunes results that aren't duplicates
      const existingTitles = new Set(allTracks.map(t => t.title.toLowerCase()));
      itunesResult.value.forEach(t => {
        if (!existingTitles.has(t.title.toLowerCase())) {
          allTracks.push(t);
        }
      });
    } else {
      console.warn('iTunes search failed:', itunesResult.reason);
    }

    // If both failed, try Audius as last resort
    if (allTracks.length === 0) {
      try {
        const res = await fetch(`https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=auradsppro`);
        if (res.ok) {
          const json = await res.json();
          const tracks = json.data || [];
          allTracks = tracks.map(t => ({
            title: t.title,
            uploaderName: t.user?.name || 'Unknown Artist',
            thumbnail: t.artwork && t.artwork['150x150'] ? t.artwork['150x150'] : '',
            duration: t.duration || 0,
            streamUrl: `https://api.audius.co/v1/tracks/${t.id}/stream?app_name=auradsppro`,
            source: 'audius'
          }));
        }
      } catch (e) {
        console.warn('Audius backup also failed:', e);
      }
    }

    renderWebSearchResults(allTracks);
  }

  function renderWebSearchResults(tracks) {
    if (!webSearchResults) return;
    webSearchResults.innerHTML = '';
    
    if (tracks.length === 0) {
      webSearchResults.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted); text-align:center;">No matching songs found</div>';
      return;
    }

    tracks.forEach(track => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '10px';
      item.style.padding = '8px';
      item.style.margin = '4px 0';
      item.style.borderRadius = '4px';
      item.style.cursor = 'pointer';
      item.style.background = 'rgba(255,255,255,0.02)';
      item.style.border = '1px solid rgba(255,255,255,0.04)';
      item.style.transition = 'all 0.1s';

      const imgUrl = track.thumbnail || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=40';
      const durationStr = track.duration > 0 ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : '';
      const sourceIcon = track.source === 'jiosaavn' ? '🎵' : (track.source === 'itunes' ? '🍎' : '🎧');

      item.innerHTML = `
        <img src="${imgUrl}" style="width:36px; height:36px; border-radius:4px; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=40'">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size:0.8rem; font-weight:600; color:var(--text-main); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${sourceIcon} ${track.title}</div>
          <div style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.uploaderName}${durationStr ? ' · ' + durationStr : ''}</div>
        </div>
      `;

      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(0, 240, 255, 0.06)';
        item.style.borderColor = 'rgba(0, 240, 255, 0.2)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'rgba(255,255,255,0.02)';
        item.style.borderColor = 'rgba(255,255,255,0.04)';
      });

      item.addEventListener('click', () => {
        playWebTrack(track);
      });

      webSearchResults.appendChild(item);
    });
  }

  async function playWebTrack(track) {
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
        window.audioEngine.stopAllSources();
        resetAllPlaybackUI();
        window.audioEngine.activeSource = 'file';
        window.audioEngine.connectMediaElement(audioPlayer);
      }

      audioPlayer.src = streamUrl;
      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
        })
        .catch(err => {
          console.error('Play error:', err);
          if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
        });
    } catch (err) {
      console.error('Play stream error:', err);
      alert(`Failed to play: ${err.message || err}`);
      if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
    }
  }

  if (webPlayPauseBtn) {
    webPlayPauseBtn.addEventListener('click', async () => {
      if (!currentWebTrack) return;
      if (window.audioEngine) await window.audioEngine.resumeCtx();
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
  }

  if (webProgressBar) {
    webProgressBar.addEventListener('input', (e) => {
      if (!audioPlayer.duration) return;
      const pct = parseFloat(e.target.value) / 100;
      audioPlayer.currentTime = pct * audioPlayer.duration;
    });
  }

  function formatMs(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  audioPlayer.addEventListener('timeupdate', () => {
    if (window.audioEngine && window.audioEngine.activeSource === 'file' && currentWebTrack) {
      if (webProgressBar && audioPlayer.duration) {
        webProgressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      }
      if (webCurrentTime) {
        webCurrentTime.textContent = formatMs(audioPlayer.currentTime * 1000);
      }
      if (webDuration && audioPlayer.duration) {
        webDuration.textContent = formatMs(audioPlayer.duration * 1000);
      }
    }
  });

  audioPlayer.addEventListener('durationchange', () => {
    if (window.audioEngine && window.audioEngine.activeSource === 'file' && currentWebTrack) {
      if (webDuration && audioPlayer.duration) {
        webDuration.textContent = formatMs(audioPlayer.duration * 1000);
      }
    }
  });

  audioPlayer.addEventListener('play', () => {
    if (currentWebTrack && webPlayPauseBtn) {
      webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
    }
  });

  audioPlayer.addEventListener('pause', () => {
    if (currentWebTrack && webPlayPauseBtn) {
      webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
    }
  });
  // ────────────────────────────────────────────────────────────

  // Microphone Input (Play/Pause Toggle)
  const startMicBtn = document.getElementById('startMicBtn');
  startMicBtn.addEventListener('click', async () => {
    await window.audioEngine.resumeCtx();
    if (window.audioEngine.micStream) {
      // Microphone is active, pause/stop it
      window.audioEngine.stopMicrophone();
      startMicBtn.textContent = "▶ Start Live Mic Input";
      startMicBtn.style.background = "";
      startMicBtn.style.color = "";
    } else {
      // Microphone is inactive, start it
      try {
        window.audioEngine.stopAllSources();
        window.audioEngine.activeSource = 'mic';
        await window.audioEngine.connectMicrophone();
        startMicBtn.textContent = "⏸ Pause Live Mic Input";
        startMicBtn.style.background = "#00ff88";
        startMicBtn.style.color = "#000";
      } catch (err) {
        alert("Microphone permission denied or unavailable.");
      }
    }
  });

  // Tone Generator
  const toggleToneBtn = document.getElementById('toggleToneBtn');
  let currentToneType = 'sine';

  document.querySelectorAll('.tone-type-btn').forEach(tBtn => {
    tBtn.addEventListener('click', () => {
      document.querySelectorAll('.tone-type-btn').forEach(b => b.classList.remove('active'));
      tBtn.classList.add('active');
      currentToneType = tBtn.dataset.type;
      if (isToneActive) {
        const freq = document.getElementById('toneFreq').value;
        window.audioEngine.startToneGenerator(currentToneType, freq);
      }
    });
  });

  const toneFreqInput = document.getElementById('toneFreq');
  const toneFreqVal = document.getElementById('toneFreqVal');
  toneFreqInput.addEventListener('input', (e) => {
    toneFreqVal.textContent = e.target.value;
    if (isToneActive) {
      window.audioEngine.startToneGenerator(currentToneType, e.target.value);
    }
  });

  toggleToneBtn.addEventListener('click', () => {
    if (isToneActive) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
    } else {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
      window.audioEngine.activeSource = 'tone';
      const freq = toneFreqInput.value;
      window.audioEngine.startToneGenerator(currentToneType, freq);
      isToneActive = true;
      toggleToneBtn.textContent = "Stop Test Signal";
      toggleToneBtn.classList.remove('accent-btn');
      toggleToneBtn.classList.add('primary-btn');
    }
  });

  // 6. Master Controls
  const masterGain = document.getElementById('masterGain');
  const masterGainVal = document.getElementById('masterGainVal');
  masterGain.addEventListener('input', (e) => {
    const val = e.target.value;
    masterGainVal.textContent = `${val > 0 ? '+' : ''}${val} dB`;
    if (window.audioEngine) window.audioEngine.setMasterGain(val);
  });

  const bassEnhance = document.getElementById('bassEnhance');
  const bassEnhanceVal = document.getElementById('bassEnhanceVal');
  bassEnhance.addEventListener('input', (e) => {
    const val = e.target.value;
    bassEnhanceVal.textContent = `+${val} dB`;
    if (window.audioEngine) window.audioEngine.setSubBass(val);
    markTuningAsManual();
  });

  const resetMasterBtn = document.getElementById('resetMasterBtn');
  if (resetMasterBtn) {
    resetMasterBtn.addEventListener('click', () => {
      masterGain.value = 0;
      masterGainVal.textContent = "0 dB";
      if (window.audioEngine) window.audioEngine.setMasterGain(0);

      bassEnhance.value = 3;
      bassEnhanceVal.textContent = "+3.0 dB";
      if (window.audioEngine) window.audioEngine.setSubBass(3);
    });
  }

  // EQ Reset
  const resetEqBtn = document.getElementById('resetEqBtn');
  resetEqBtn.addEventListener('click', () => {
    currentEqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    FREQ_BANDS.forEach((_, i) => {
      const slider = document.getElementById(`eqSlider_${i}`);
      const valText = document.getElementById(`eqVal_${i}`);
      if (slider) slider.value = 0;
      if (valText) valText.textContent = "0dB";
      if (window.audioEngine) window.audioEngine.setBandGain(i, 0);
    });
    window.visualizer.drawEqCurve(currentEqGains);
  });

  // Visualizer Mode
  document.getElementById('visModeBars').addEventListener('click', (e) => {
    document.getElementById('visModeWave').classList.remove('active');
    e.target.classList.add('active');
    window.visualizer.setVisMode('bars');
  });

  document.getElementById('visModeWave').addEventListener('click', (e) => {
    document.getElementById('visModeBars').classList.remove('active');
    e.target.classList.add('active');
    window.visualizer.setVisMode('wave');
  });

  // 7. Enhancers Rack
  const compToggle = document.getElementById('dolbyCompressorToggle');
  const compThreshold = document.getElementById('compThreshold');
  const compThresholdVal = document.getElementById('compThresholdVal');
  const compRatio = document.getElementById('compRatio');
  const compRatioVal = document.getElementById('compRatioVal');

  const updateComp = () => {
    if (compThresholdVal) compThresholdVal.textContent = `${compThreshold.value} dB`;
    if (compRatioVal) compRatioVal.textContent = `${compRatio.value}:1`;
    if (window.audioEngine) {
      window.audioEngine.setDolbyCompressor(compToggle.checked, compThreshold.value, compRatio.value);
    }
    markTuningAsManual();
  };
  compToggle.addEventListener('change', updateComp);
  compThreshold.addEventListener('input', updateComp);
  compRatio.addEventListener('input', updateComp);

  const haasToggle = document.getElementById('haasToggle');
  const haasWidth = document.getElementById('haasWidth');
  const haasWidthVal = document.getElementById('haasWidthVal');
  const haasDelay = document.getElementById('haasDelay');
  const haasDelayVal = document.getElementById('haasDelayVal');

  const updateHaas = () => {
    if (haasWidthVal) haasWidthVal.textContent = `${haasWidth.value}%`;
    if (haasDelayVal) haasDelayVal.textContent = `${haasDelay.value} ms`;
    if (window.audioEngine) {
      window.audioEngine.setHaasExpander(haasToggle.checked, haasWidth.value, haasDelay.value);
    }
    markTuningAsManual();
  };
  haasToggle.addEventListener('change', updateHaas);
  haasWidth.addEventListener('input', updateHaas);
  haasDelay.addEventListener('input', updateHaas);

  const vocalToggle = document.getElementById('vocalEnhancerToggle');
  const vocalBoost = document.getElementById('vocalBoost');
  const vocalBoostVal = document.getElementById('vocalBoostVal');

  const updateVocal = () => {
    if (vocalBoostVal) vocalBoostVal.textContent = `+${vocalBoost.value} dB`;
    if (window.audioEngine) {
      window.audioEngine.setVocalEnhancer(vocalToggle.checked, vocalBoost.value);
    }
    markTuningAsManual();
  };
  vocalToggle.addEventListener('change', updateVocal);
  vocalBoost.addEventListener('input', updateVocal);

  const reverbToggle = document.getElementById('roomReverbToggle');
  const reverbPreset = document.getElementById('reverbPreset');
  const reverbWet = document.getElementById('reverbWet');
  const reverbWetVal = document.getElementById('reverbWetVal');

  const updateReverb = () => {
    if (reverbWetVal) reverbWetVal.textContent = `${reverbWet.value}%`;
    if (window.audioEngine) {
      window.audioEngine.setRoomReverb(reverbToggle.checked, reverbPreset.value, reverbWet.value);
    }
    markTuningAsManual();
  };
  reverbToggle.addEventListener('change', updateReverb);
  reverbPreset.addEventListener('change', updateReverb);
  reverbWet.addEventListener('input', updateReverb);

  // Card Reset Buttons
  document.getElementById('resetDolbyBtn')?.addEventListener('click', () => {
    compToggle.checked = true;
    compThreshold.value = -24;
    compRatio.value = 4;
    updateComp();
  });

  document.getElementById('resetHaasBtn')?.addEventListener('click', () => {
    haasToggle.checked = true;
    haasWidth.value = 70;
    haasDelay.value = 18;
    updateHaas();
  });

  document.getElementById('resetVocalBtn')?.addEventListener('click', () => {
    vocalToggle.checked = true;
    vocalBoost.value = 3;
    updateVocal();
  });

  document.getElementById('resetReverbBtn')?.addEventListener('click', () => {
    reverbToggle.checked = false;
    reverbPreset.value = 'cinema';
    reverbWet.value = 25;
    updateReverb();
  });

  // 8. Spatial Canvas Controls
  document.querySelectorAll('.spat-btn').forEach(sBtn => {
    sBtn.addEventListener('click', () => {
      if (sBtn.id === 'spatOrbitToggle') {
        const isOrbit = window.spatialCanvas.toggleOrbit();
        sBtn.classList.toggle('active', isOrbit);
      } else if (sBtn.dataset.angle) {
        window.spatialCanvas.setPresetAngle(sBtn.dataset.angle);
      }
    });
  });

  const spatialHeight = document.getElementById('spatialHeight');
  const spatialHeightVal = document.getElementById('spatialHeightVal');
  if (spatialHeight) {
    spatialHeight.addEventListener('input', (e) => {
      spatialHeightVal.textContent = `${parseFloat(e.target.value).toFixed(1)} m`;
      window.spatialCanvas.setElevation(e.target.value);
    });
  }

  const spatialSpeed = document.getElementById('spatialSpeed');
  const spatialSpeedVal = document.getElementById('spatialSpeedVal');
  if (spatialSpeed) {
    spatialSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(1);
      if (spatialSpeedVal) spatialSpeedVal.textContent = `${val}x`;
      if (window.spatialCanvas) {
        window.spatialCanvas.setOrbitSpeed(val);
      }
    });
  }

  // 3D Stage Volume Boost Slider
  const spatialVolumeBoost = document.getElementById('spatialVolumeBoost');
  const spatialVolumeBoostVal = document.getElementById('spatialVolumeBoostVal');
  if (spatialVolumeBoost) {
    spatialVolumeBoost.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (spatialVolumeBoostVal) spatialVolumeBoostVal.textContent = `+${val} dB`;
      if (window.audioEngine) window.audioEngine.setSpatialVolumeBoost(val);
      markTuningAsManual();
    });
  }
  // --- Quick Enhancements Logic ---
  const vocalClarityToggle = document.getElementById('vocalClarityToggle');
  if (vocalClarityToggle) {
    vocalClarityToggle.addEventListener('change', (e) => {
      if (window.audioEngine) {
        window.audioEngine.setVocalEnhancer(e.target.checked, 5.0); // +5dB boost at vocal range
      }
    });
  }

  const nightModeToggle = document.getElementById('nightModeToggle');
  if (nightModeToggle) {
    nightModeToggle.addEventListener('change', (e) => {
      if (window.audioEngine) {
        // Extreme compression for night mode: levels everything out
        window.audioEngine.setDolbyCompressor(e.target.checked, -35, 10);
      }
    });
  }

  const playbackSpeed = document.getElementById('playbackSpeed');
  const playbackSpeedVal = document.getElementById('playbackSpeedVal');
  if (playbackSpeed) {
    playbackSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (playbackSpeedVal) playbackSpeedVal.textContent = `${val.toFixed(2)}x`;
      if (audioPlayer) {
        audioPlayer.playbackRate = val;
      }
    });
  }

  const stereoWidth = document.getElementById('stereoWidth');
  const stereoWidthVal = document.getElementById('stereoWidthVal');
  if (stereoWidth) {
    stereoWidth.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (stereoWidthVal) stereoWidthVal.textContent = `${val.toFixed(1)}x`;
      if (window.audioEngine) {
        // sideWidthGain value of 1.0 = original width. 
        // Our val is 0.0 to 3.0, mapping perfectly to sideWidthGain scale (0 to 3).
        if (window.audioEngine.sideWidthGain) {
          window.audioEngine.sideWidthGain.gain.value = val;
        }
      }
    });
  }
});

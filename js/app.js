/**
 * AuraDSP Application Controller & Event Handler
 * Ultra-Responsive Zero-Lag UI Engine with 4 Distinct Test Audio Generators
 */

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
      spatialBoost: parseFloat(document.getElementById('spatialVolumeBoost')?.value || 3.0),
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

      // 2. Reset UI Play states for other sources
      isPlaying = false;
      isSynthBeatActive = false;
      if (playText) playText.textContent = "Play Selected Track";
      if (playIcon) playIcon.textContent = "▶";
      if (startSynthBeatBtn) {
        startSynthBeatBtn.querySelector('span').textContent = "🔥 Play Studio Synth Groove";
        startSynthBeatBtn.style.background = "";
      }
      if (startMicBtn) {
        startMicBtn.textContent = "▶ Start Live Mic Input";
        startMicBtn.style.background = "";
        startMicBtn.style.color = "";
      }
      if (toggleToneBtn) {
        toggleToneBtn.textContent = "⚡ Activate Tone Oscillator";
        toggleToneBtn.style.background = "";
        toggleToneBtn.style.color = "";
      }

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

  // ─── Spotify Direct In-App Player & Authentication ──────────
  const redirectUri = window.location.origin + window.location.pathname;
  const redirectUriEl = document.getElementById('spotifyRedirectUriVal');
  if (redirectUriEl) redirectUriEl.textContent = redirectUri;

  const storedClientId = localStorage.getItem('spotify_client_id') || '';
  const clientIdInput = document.getElementById('spotifyClientIdInput');
  if (clientIdInput) {
    clientIdInput.value = storedClientId;
    clientIdInput.addEventListener('input', (e) => {
      localStorage.setItem('spotify_client_id', e.target.value.trim());
    });
  }

  // ─── Spotify PKCE Authentication Flow ───
  // Helper functions for Cryptographic PKCE Generation
  function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function base64urlencode(a) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function generateCodeChallenge(v) {
    const encoder = new TextEncoder();
    const data = encoder.encode(v);
    const hashed = await window.crypto.subtle.digest('SHA-256', data);
    return base64urlencode(hashed);
  }

  function refreshSpotifyToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    const clientId = localStorage.getItem('spotify_client_id');
    if (!refreshToken || !clientId) return Promise.reject("No refresh token or client ID");

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId
    });

    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to refresh");
      return res.json();
    })
    .then(data => {
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        return data.access_token;
      } else {
        throw new Error("Failed to refresh token");
      }
    });
  }

  // Parse authorization code from redirect URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');
  if (authCode) {
    const clientId = localStorage.getItem('spotify_client_id') || '';
    const codeVerifier = localStorage.getItem('spotify_code_verifier') || '';
    const redirectUri = window.location.origin + window.location.pathname;

    if (clientId && codeVerifier) {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      });

      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('spotify_access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
          }
          // Remove query params from address bar clean
          window.history.replaceState("", document.title, window.location.pathname);
          updateSpotifyUI();
          if (window.onSpotifyWebPlaybackSDKReady) {
            window.onSpotifyWebPlaybackSDKReady();
          }
        }
      })
      .catch(err => console.error("Error exchanging authorization code:", err));
    }
  }

  const authStateDiv = document.getElementById('spotifyAuthState');
  const playerStateDiv = document.getElementById('spotifyPlayerState');

  // ─── Playlists & Search Tab Switching ───
  const showSearchBtn = document.getElementById('spotifyShowSearchBtn');
  const showPlaylistsBtn = document.getElementById('spotifyShowPlaylistsBtn');
  const searchContainer = document.getElementById('spotifySearchContainer');
  const playlistsContainer = document.getElementById('spotifyPlaylistsContainer');

  if (showSearchBtn && showPlaylistsBtn) {
    showSearchBtn.addEventListener('click', () => {
      showSearchBtn.classList.add('active');
      showSearchBtn.style.background = 'rgba(0, 240, 255, 0.15)';
      showSearchBtn.style.borderColor = 'var(--accent-cyan)';
      
      showPlaylistsBtn.classList.remove('active');
      showPlaylistsBtn.style.background = 'transparent';
      showPlaylistsBtn.style.borderColor = 'rgba(255,255,255,0.1)';

      if (searchContainer) searchContainer.classList.remove('hidden');
      if (playlistsContainer) playlistsContainer.classList.add('hidden');
    });

    showPlaylistsBtn.addEventListener('click', () => {
      showPlaylistsBtn.classList.add('active');
      showPlaylistsBtn.style.background = 'rgba(0, 240, 255, 0.15)';
      showPlaylistsBtn.style.borderColor = 'var(--accent-cyan)';

      showSearchBtn.classList.remove('active');
      showSearchBtn.style.background = 'transparent';
      showSearchBtn.style.borderColor = 'rgba(255,255,255,0.1)';

      if (playlistsContainer) playlistsContainer.classList.remove('hidden');
      if (searchContainer) searchContainer.classList.add('hidden');
      
      loadSpotifyPlaylists();
    });
  }

  function updateSpotifyUI() {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      if (authStateDiv) authStateDiv.style.display = 'none';
      if (playerStateDiv) playerStateDiv.style.display = 'block';
      // Load user playlists upon successful connection
      loadSpotifyPlaylists();
    } else {
      if (authStateDiv) authStateDiv.style.display = 'block';
      if (playerStateDiv) playerStateDiv.style.display = 'none';
    }
  }
  updateSpotifyUI();

  // Playlists API Handling
  function loadSpotifyPlaylists() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;
    
    const playlistsList = document.getElementById('spotifyPlaylistsList');
    if (playlistsList) playlistsList.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted); text-align:center;">Loading playlists...</div>';

    fetch('https://api.spotify.com/v1/me/playlists?limit=25', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        return refreshSpotifyToken()
          .then(newToken => {
            return fetch('https://api.spotify.com/v1/me/playlists?limit=25', {
              headers: { 'Authorization': `Bearer ${newToken}` }
            });
          })
          .then(r => r.json())
          .catch(() => {
            localStorage.removeItem('spotify_access_token');
            updateSpotifyUI();
            return null;
          });
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;
      renderSpotifyPlaylists(data.items || []);
    })
    .catch(err => {
      console.error('Error fetching playlists:', err);
      if (playlistsList) playlistsList.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--accent-red); text-align:center;">Failed to load playlists</div>';
    });
  }

  function renderSpotifyPlaylists(playlists) {
    const playlistsList = document.getElementById('spotifyPlaylistsList');
    if (!playlistsList) return;
    playlistsList.innerHTML = '';
    
    // Reset secondary container
    const tracksContainer = document.getElementById('spotifyPlaylistTracksContainer');
    if (tracksContainer) tracksContainer.classList.add('hidden');
    playlistsList.classList.remove('hidden');

    if (playlists.length === 0) {
      playlistsList.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted); text-align:center;">No playlists found</div>';
      return;
    }

    playlists.forEach(playlist => {
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
      
      const imgUrl = playlist.images && playlist.images[0] ? playlist.images[0].url : 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=40';
      
      item.innerHTML = `
        <img src="${imgUrl}" style="width:36px; height:36px; border-radius:4px; object-fit:cover;">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size:0.8rem; font-weight:600; color:var(--text-main); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${playlist.name}</div>
          <div style="font-size:0.68rem; color:var(--text-muted);">${playlist.tracks.total} tracks</div>
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
        loadPlaylistTracks(playlist.id, playlist.name);
      });

      playlistsList.appendChild(item);
    });
  }

  function loadPlaylistTracks(playlistId, playlistName) {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    const listContainer = document.getElementById('spotifyPlaylistTracksList');
    const container = document.getElementById('spotifyPlaylistTracksContainer');
    const listMain = document.getElementById('spotifyPlaylistsList');
    const label = document.getElementById('spotifyPlaylistNameLabel');
    
    if (label) label.textContent = playlistName;
    if (listContainer) listContainer.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted); text-align:center;">Loading tracks...</div>';
    
    if (listMain) listMain.classList.add('hidden');
    if (container) container.classList.remove('hidden');

    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=40`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async res => {
      if (res.status === 401) {
        const newToken = await refreshSpotifyToken();
        const retryRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=40`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
        return retryRes.json();
      }
      return res.json();
    })
    .then(data => {
      if (data) renderPlaylistTracks(data.items || []);
    })
    .catch(err => {
      console.error('Error fetching tracks:', err);
      if (listContainer) listContainer.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--accent-red); text-align:center;">Failed to load tracks</div>';
    });
  }

  function renderPlaylistTracks(items) {
    const listContainer = document.getElementById('spotifyPlaylistTracksList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    const tracks = items.map(item => item.track).filter(track => track && track.uri);
    
    if (tracks.length === 0) {
      listContainer.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted); text-align:center;">No tracks in this playlist</div>';
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

      const imgUrl = track.album.images && track.album.images[0] ? track.album.images[0].url : 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=40';
      
      item.innerHTML = `
        <img src="${imgUrl}" style="width:36px; height:36px; border-radius:4px; object-fit:cover;">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size:0.8rem; font-weight:600; color:var(--text-main); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.name}</div>
          <div style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.artists.map(a => a.name).join(', ')}</div>
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
        playSpotifyTrack(track.uri);
      });

      listContainer.appendChild(item);
    });
  }

  const backToPlaylistsBtn = document.getElementById('spotifyBackToPlaylistsBtn');
  if (backToPlaylistsBtn) {
    backToPlaylistsBtn.addEventListener('click', () => {
      const container = document.getElementById('spotifyPlaylistTracksContainer');
      const listMain = document.getElementById('spotifyPlaylistsList');
      if (container) container.classList.add('hidden');
      if (listMain) listMain.classList.remove('hidden');
    });
  }

  const loginBtn = document.getElementById('spotifyLoginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const clientId = localStorage.getItem('spotify_client_id') || '';
      if (!clientId) {
        alert('Please enter your Spotify Developer Client ID first!');
        return;
      }
      
      const codeVerifier = generateRandomString(64);
      localStorage.setItem('spotify_code_verifier', codeVerifier);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      const scopes = 'streaming user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative';
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}&show_dialog=true`;
      window.location.href = authUrl;
    });
  }

  const logoutBtn = document.getElementById('spotifyLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('spotify_access_token');
      updateSpotifyUI();
      if (window.spotifyPlayerInstance) {
        try { window.spotifyPlayerInstance.disconnect(); } catch(e){}
        window.spotifyPlayerInstance = null;
      }
    });
  }

  window.onSpotifyWebPlaybackSDKReady = () => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    const player = new Spotify.Player({
      name: 'AuraDSP Pro Player',
      getOAuthToken: cb => { cb(token); },
      volume: 0.8
    });

    window.spotifyPlayerInstance = player;

    player.addListener('initialization_error', ({ message }) => { console.error('Initialization Error:', message); });
    player.addListener('authentication_error', ({ message }) => { 
      console.error('Authentication Error:', message);
      refreshSpotifyToken()
        .then(() => {
          player.disconnect();
          window.onSpotifyWebPlaybackSDKReady();
        })
        .catch(() => {
          localStorage.removeItem('spotify_access_token');
          updateSpotifyUI();
        });
    });
    player.addListener('account_error', ({ message }) => { 
      alert('Spotify Playback SDK requires a Spotify Premium account.'); 
    });
    player.addListener('playback_error', ({ message }) => { console.error('Playback Error:', message); });

    player.addListener('player_state_changed', state => {
      if (!state) return;

      const wasPaused = window.spotifyPlayerState ? window.spotifyPlayerState.paused : true;
      window.spotifyPlayerState = state;

      if (!state.paused && wasPaused) {
        // Spotify just started playing! Stop all other audio sources.
        if (window.audioEngine) {
          const tempPlayer = window.spotifyPlayerInstance;
          window.spotifyPlayerInstance = null; // Temporarily bypass so stopAllSources doesn't pause Spotify

          window.audioEngine.stopAllSources();

          window.spotifyPlayerInstance = tempPlayer;
          window.audioEngine.activeSource = 'spotify';
          resetAllPlaybackUI();
        }
      }
      
      const track = state.track_window.current_track;
      const artImg = document.getElementById('spotifyAlbumArt');
      const trackName = document.getElementById('spotifyTrackName');
      const artistName = document.getElementById('spotifyArtistName');
      const playPauseBtn = document.getElementById('spotifyPlayPauseBtn');

      if (track) {
        if (trackName) trackName.textContent = track.name;
        if (artistName) artistName.textContent = track.artists.map(a => a.name).join(', ');
        if (artImg) {
          artImg.src = track.album.images[0]?.url || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120';
          artImg.classList.toggle('playing', !state.paused);
        }
      }

      if (playPauseBtn) {
        playPauseBtn.querySelector('span').textContent = state.paused ? '▶ Play' : '⏸ Pause';
        playPauseBtn.classList.toggle('active', !state.paused);
      }

      const durationSlider = document.getElementById('spotifyProgressBar');
      if (durationSlider) {
        durationSlider.max = state.duration;
        durationSlider.value = state.position;
      }
      const curTimeLabel = document.getElementById('spotifyCurrentTime');
      const durLabel = document.getElementById('spotifyDuration');
      if (curTimeLabel) curTimeLabel.textContent = formatMs(state.position);
      if (durLabel) durLabel.textContent = formatMs(state.duration);
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('Spotify SDK Player Ready with Device ID:', device_id);
      window.spotifyDeviceId = device_id;
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('Spotify Device ID went offline:', device_id);
    });

    player.connect();
  };

  function formatMs(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  // Playback Control Event Handlers
  const spotifyPlayPauseBtn = document.getElementById('spotifyPlayPauseBtn');
  if (spotifyPlayPauseBtn) {
    spotifyPlayPauseBtn.addEventListener('click', () => {
      if (window.spotifyPlayerInstance) window.spotifyPlayerInstance.togglePlay();
    });
  }

  const prevBtn = document.getElementById('spotifyPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (window.spotifyPlayerInstance) window.spotifyPlayerInstance.previousTrack();
    });
  }

  const nextBtn = document.getElementById('spotifyNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (window.spotifyPlayerInstance) window.spotifyPlayerInstance.nextTrack();
    });
  }

  const volSlider = document.getElementById('spotifyVolumeSlider');
  const volVal = document.getElementById('spotifyVolumeVal');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value) / 100;
      if (volVal) volVal.textContent = `${e.target.value}%`;
      if (window.spotifyPlayerInstance) window.spotifyPlayerInstance.setVolume(vol);
    });
  }

  const progressSlider = document.getElementById('spotifyProgressBar');
  if (progressSlider) {
    progressSlider.addEventListener('change', (e) => {
      const pos = parseInt(e.target.value, 10);
      if (window.spotifyPlayerInstance) window.spotifyPlayerInstance.seek(pos);
    });
  }

  // In-App Catalog Search & Play
  const searchInput = document.getElementById('spotifySearchInput');
  const searchResults = document.getElementById('spotifySearchResults');
  let searchDebounce = null;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      const query = e.target.value.trim();
      if (!query) {
        if (searchResults) searchResults.innerHTML = '';
        return;
      }
      searchDebounce = setTimeout(() => {
        performSpotifySearch(query);
      }, 300);
    });
  }

  async function performSpotifySearch(query) {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;
    try {
      let res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        const newToken = await refreshSpotifyToken();
        res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }
      
      const data = await res.json();
      renderSearchResults(data.tracks?.items || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  function renderSearchResults(tracks) {
    if (!searchResults) return;
    searchResults.innerHTML = '';
    if (tracks.length === 0) {
      searchResults.innerHTML = '<div style="padding:10px; font-size:0.75rem; color:var(--text-muted);">No tracks found</div>';
      return;
    }
    tracks.forEach(track => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <img src="${track.album.images[2]?.url || track.album.images[0]?.url || ''}" class="search-result-art" alt="art">
        <div class="search-result-info">
          <span class="search-result-title">${track.name}</span>
          <span class="search-result-artist">${track.artists.map(a => a.name).join(', ')}</span>
        </div>
      `;
      item.addEventListener('click', () => {
        playSpotifyTrack(track.uri);
      });
      searchResults.appendChild(item);
    });
  }

  async function playSpotifyTrack(uri) {
    const token = localStorage.getItem('spotify_access_token');
    const deviceId = window.spotifyDeviceId;
    if (!token || !deviceId) {
      alert('Spotify Player is not ready. Make sure you connected your account.');
      return;
    }
    try {
      if (window.audioEngine) {
        window.audioEngine.stopAllSources();
        resetAllPlaybackUI();
        window.audioEngine.activeSource = 'spotify';
      }
      
      let res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401) {
        const newToken = await refreshSpotifyToken();
        res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [uri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          }
        });
      }
      
      fetchTrackTempo(uri.split(':').pop());
    } catch (err) {
      console.error('Play track error:', err);
    }
  }

  async function fetchTrackTempo(trackId) {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;
    try {
      let res = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        const newToken = await refreshSpotifyToken();
        res = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
      }
      
      const data = await res.json();
      window.spotifyTempo = data.tempo || 120;
    } catch (e) {
      window.spotifyTempo = 120;
    }
  }

  // Poll progress bar updates
  setInterval(() => {
    const state = window.spotifyPlayerState;
    const isPlaying = state && !state.paused;
    if (isPlaying) {
      const progressSlider = document.getElementById('spotifyProgressBar');
      const curTimeLabel = document.getElementById('spotifyCurrentTime');
      const currentPos = state.position + (Date.now() - state.timestamp);
      if (progressSlider) {
        progressSlider.value = Math.min(state.duration, currentPos);
      }
      if (curTimeLabel) {
        curTimeLabel.textContent = formatMs(Math.min(state.duration, currentPos));
      }
    }
  }, 500);

  // Trigger SDK initialization manually if loaded already
  if (typeof Spotify !== 'undefined' && window.onSpotifyWebPlaybackSDKReady) {
    window.onSpotifyWebPlaybackSDKReady();
  }
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
});

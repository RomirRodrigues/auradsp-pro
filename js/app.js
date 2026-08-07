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
  let currentEqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
    });
  });

  // 3. Render Device Category Presets
  const presetCardsContainer = document.getElementById('presetCardsContainer');

  function renderPresets(category = 'boat') {
    presetCardsContainer.innerHTML = '';
    const presets = AUDIO_PRESETS[category] || AUDIO_PRESETS.boat;

    presets.forEach((preset, index) => {
      const card = document.createElement('div');
      card.className = `preset-card ${index === 0 ? 'active' : ''}`;
      card.dataset.id = preset.id;

      card.innerHTML = `
        <div class="preset-info">
          <h4>${preset.name}</h4>
          <p>${preset.desc}</p>
        </div>
        <span class="preset-badge">${preset.badge}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        applyPreset(preset);
      });

      presetCardsContainer.appendChild(card);
    });

    if (presets.length > 0) {
      applyPreset(presets[0]);
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
      window.audioEngine.stopSynthGroove();
      isSynthBeatActive = false;
      startSynthBeatBtn.textContent = "🔥 Play Studio Synth Groove";
      startSynthBeatBtn.classList.add('glowing-btn');
      playText.textContent = "Play Selected Track";
      playIcon.textContent = "▶";
    } else {
      window.audioEngine.startSynthGroove(trackMode);
      isSynthBeatActive = true;
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
      window.audioEngine.stopSynthGroove();
      isSynthBeatActive = false;
      isPlaying = false;
      playText.textContent = "Play Selected Track";
      playIcon.textContent = "▶";
      startSynthBeatBtn.textContent = "🔥 Play Studio Synth Groove";
      startSynthBeatBtn.classList.add('glowing-btn');
    } else {
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
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.values(cards).forEach(cId => {
        const el = document.getElementById(cId);
        if (el) el.classList.add('hidden');
      });
      const activeCard = document.getElementById(cards[btn.id]);
      if (activeCard) activeCard.classList.remove('hidden');

      if (btn.id !== 'srcToneBtn') {
        window.audioEngine.stopToneGenerator();
      }
    });
  });

  // Local File Upload
  const audioFileInput = document.getElementById('audioFileInput');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const audioPlayer = document.getElementById('audioPlayer');

  audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameDisplay.textContent = `🎵 Active File: ${file.name}`;
      const url = URL.createObjectURL(file);
      audioPlayer.src = url;
      window.audioEngine.stopSynthGroove();
      window.audioEngine.connectMediaElement(audioPlayer);
      audioPlayer.play();
      isPlaying = true;
      isSynthBeatActive = false;
      playText.textContent = "Pause Track";
      playIcon.textContent = "⏸";
    }
  });

  // ─── Spotify Mobile/Desktop Detection ──────────────────────
  const isMobileDevice = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.innerWidth <= 600 && !window.matchMedia('(pointer: fine)').matches);

  const spotifyDesktopMode = document.getElementById('spotifyDesktopMode');
  const spotifyMobileMode  = document.getElementById('spotifyMobileMode');

  if (isMobileDevice()) {
    if (spotifyDesktopMode) spotifyDesktopMode.style.display = 'none';
    if (spotifyMobileMode)  spotifyMobileMode.style.display  = 'block';
    const desc = document.getElementById('spotifyHeaderDesc');
    if (desc) desc.textContent = 'Mobile Mode — Mic capture or open on desktop';
  } else {
    if (spotifyDesktopMode) spotifyDesktopMode.style.display = 'block';
    if (spotifyMobileMode)  spotifyMobileMode.style.display  = 'none';
  }

  // Desktop: 1-Click Direct Spotify App Sound Connection
  const directConnectSpotifyBtn = document.getElementById('directConnectSpotifyBtn');
  const spotifyStatusText = document.getElementById('spotifyStatusText');
  const spotifyLiveBadge = document.getElementById('spotifyLiveBadge');

  if (directConnectSpotifyBtn) {
    directConnectSpotifyBtn.addEventListener('click', async () => {
      try {
        if (spotifyStatusText) spotifyStatusText.textContent = "Connecting Spotify App Audio Stream...";
        window.audioEngine.stopSynthGroove();
        await window.audioEngine.connectTabAudio();
        if (spotifyStatusText) spotifyStatusText.textContent = "🟢 SPOTIFY SOUND ENGINE CONNECTED LIVE!";
        if (spotifyLiveBadge) spotifyLiveBadge.classList.add('active');
        directConnectSpotifyBtn.innerHTML = `<span>🟢 SPOTIFY SOUND PIPELINE ACTIVE</span>`;
        directConnectSpotifyBtn.style.background = "linear-gradient(135deg, #1ed760, #1db954)";
        directConnectSpotifyBtn.style.color = "#000";
      } catch (err) {
        if (spotifyStatusText) spotifyStatusText.textContent = err.message || "Connection canceled or failed.";
      }
    });
  }

  // Mobile: Mic Capture Mode for Spotify
  const mobileMicCaptureBtn = document.getElementById('mobileMicCaptureBtn');
  const mobileMicStatus = document.getElementById('mobileMicStatus');

  if (mobileMicCaptureBtn) {
    mobileMicCaptureBtn.addEventListener('click', async () => {
      try {
        mobileMicStatus.textContent = "⏳ Requesting mic permission...";
        mobileMicStatus.style.color = "#ffaa00";
        window.audioEngine.stopSynthGroove();
        await window.audioEngine.connectMicrophone();
        mobileMicStatus.textContent = "🟢 MIC LIVE — play Spotify from speaker now!";
        mobileMicStatus.style.color = "#00ff88";
        mobileMicCaptureBtn.textContent = "🎙️ Mic Capturing Live";
        mobileMicCaptureBtn.style.background = "#00ff88";
        mobileMicCaptureBtn.style.color = "#000";
      } catch (err) {
        mobileMicStatus.textContent = "❌ Mic permission denied. Allow mic in browser settings.";
        mobileMicStatus.style.color = "#ff2a6d";
      }
    });
  }
  // ────────────────────────────────────────────────────────────

  // Microphone Input
  const startMicBtn = document.getElementById('startMicBtn');
  startMicBtn.addEventListener('click', async () => {
    try {
      window.audioEngine.stopSynthGroove();
      await window.audioEngine.connectMicrophone();
      startMicBtn.textContent = "🎙️ Mic Live Pass-Through Active";
      startMicBtn.style.background = "#00ff88";
      startMicBtn.style.color = "#000";
    } catch (err) {
      alert("Microphone permission denied or unavailable.");
    }
  });

  // Tone Generator
  const toggleToneBtn = document.getElementById('toggleToneBtn');
  let isToneActive = false;
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
      window.audioEngine.stopToneGenerator();
      isToneActive = false;
      toggleToneBtn.textContent = "Start Test Signal";
      toggleToneBtn.classList.remove('primary-btn');
      toggleToneBtn.classList.add('accent-btn');
    } else {
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
    });
  }
});

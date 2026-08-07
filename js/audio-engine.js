/**
 * AuraDSP Audio Engine - High-Performance Real Web Audio API DSP Pipeline
 * Loud, Crisp 3D Binaural Spatial Audio Engine with Distance Attenuation Fix & Dedicated 3D Gain Boost
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;

    // Audio Source Nodes
    this.mediaSourceNode = null;
    this.connectedElement = null;
    this.synthLoopTimer = null;
    this.synthGain = null;
    this.micStream = null;
    this.tabStream = null;
    this.oscillator = null;

    // Gains & Filters
    this.preGainNode = null;
    this.masterGainNode = null;
    this.subBassFilter = null;

    // 10 EQ Bands
    this.eqNodes = [];
    this.bands = FREQ_BANDS;

    // Dolby Multiband Compressor & Makeup Gain
    this.compressorNode = null;
    this.compMakeupGainNode = null;

    // HAAS 3D Expander Matrix Nodes
    this.splitterNode = null;
    this.mergerNode = null;
    this.delayNodeL = null;
    this.delayNodeR = null;
    this.sideGainNode = null;

    // Vocal Enhancer Node
    this.vocalBandpassNode = null;

    // Room Reverb Nodes
    this.convolverNode = null;
    this.reverbGainNode = null;

    // 3D HRTF Spatial Panner & Dedicated Spatial Volume Boost Gain
    this.pannerNode = null;
    this.spatialGainNode = null;

    // Analyser Node for Spectrum & VU Meters
    this.analyserNode = null;

    // Parameters State
    this.subBassAmount = 3.0;
    this.haasWidth = 70;
    this.haasDelayMs = 18;
    this.spatialVolumeBoost = 3.0; // Default +3dB 3D Volume Boost
    this.isSynthLoopActive = false;
    this.currentTrackMode = 'bass';
  }

  init() {
    if (this.isInitialized && this.ctx) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx({ latencyHint: 'interactive' });

    if (this.ctx.listener) {
      if (this.ctx.listener.setOrientation) {
        this.ctx.listener.setOrientation(0, 0, -1, 0, 1, 0);
      }
      if (this.ctx.listener.setPosition) {
        this.ctx.listener.setPosition(0, 0, 0);
      }
    }

    // 1. Pre-Gain
    this.preGainNode = this.ctx.createGain();
    this.preGainNode.gain.value = 1.0;

    // 2. Sub-Bass Synthesizer (Low-shelf 30Hz - 120Hz)
    this.subBassFilter = this.ctx.createBiquadFilter();
    this.subBassFilter.type = 'lowshelf';
    this.subBassFilter.frequency.value = 80;
    this.subBassFilter.gain.value = this.subBassAmount;

    // 3. 10 Band EQ BiquadFilters
    this.eqNodes = this.bands.map((freq) => {
      const filter = this.ctx.createBiquadFilter();
      filter.frequency.value = freq;
      filter.Q.value = 1.4;

      if (freq <= 62) {
        filter.type = 'lowshelf';
      } else if (freq >= 8000) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
      }
      filter.gain.value = 0;
      return filter;
    });

    for (let i = 0; i < this.eqNodes.length - 1; i++) {
      this.eqNodes[i].connect(this.eqNodes[i + 1]);
    }

    // 4. Vocal Enhancer Node
    this.vocalBandpassNode = this.ctx.createBiquadFilter();
    this.vocalBandpassNode.type = 'peaking';
    this.vocalBandpassNode.frequency.value = 2500;
    this.vocalBandpassNode.Q.value = 0.8;
    this.vocalBandpassNode.gain.value = 3.0;

    // 5. Dolby Dynamic Range Compressor & Makeup Gain
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 12;
    this.compressorNode.ratio.value = 4;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    this.compMakeupGainNode = this.ctx.createGain();
    this.compMakeupGainNode.gain.value = 1.4;

    // 6. HAAS 3D Surround Expander Matrix
    this.splitterNode = this.ctx.createChannelSplitter(2);
    this.mergerNode = this.ctx.createChannelMerger(2);
    this.delayNodeL = this.ctx.createDelay(0.1);
    this.delayNodeR = this.ctx.createDelay(0.1);
    this.sideGainNode = this.ctx.createGain();

    this.delayNodeL.delayTime.value = 0.0;
    this.delayNodeR.delayTime.value = this.haasDelayMs / 1000;
    this.sideGainNode.gain.value = 1.3;

    // 7. Convolution Room Reverb Nodes
    this.convolverNode = this.ctx.createConvolver();
    this.reverbGainNode = this.ctx.createGain();
    this.reverbGainNode.gain.value = 0.0;
    this.generateImpulseResponse('cinema');

    // 8. 3D Binaural HRTF PannerNode (Calibrated for High Loudness)
    this.pannerNode = this.ctx.createPanner();
    this.pannerNode.panningModel = 'HRTF';
    this.pannerNode.distanceModel = 'linear'; // Prevents quiet volume drops at distance!
    this.pannerNode.refDistance = 3.0;
    this.pannerNode.maxDistance = 10000;
    this.pannerNode.rolloffFactor = 0.2; // Low attenuation for loud 3D positioning
    this.pannerNode.coneInnerAngle = 360;
    if (this.pannerNode.setPosition) {
      this.pannerNode.setPosition(0, 0, -2.0);
    }

    // Dedicated 3D Spatial Volume Boost Gain Node
    this.spatialGainNode = this.ctx.createGain();
    this.spatialGainNode.gain.value = Math.pow(10, this.spatialVolumeBoost / 20);

    // 9. Master Gain & Analyser
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = 1.0;

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // --- Build Signal Pipeline ---
    this.preGainNode.connect(this.subBassFilter);
    this.subBassFilter.connect(this.eqNodes[0]);

    const lastEqNode = this.eqNodes[this.eqNodes.length - 1];
    lastEqNode.connect(this.vocalBandpassNode);
    this.vocalBandpassNode.connect(this.compressorNode);
    this.compressorNode.connect(this.compMakeupGainNode);

    this.compMakeupGainNode.connect(this.splitterNode);
    this.splitterNode.connect(this.delayNodeL, 0);
    this.splitterNode.connect(this.delayNodeR, 1);

    this.delayNodeL.connect(this.mergerNode, 0, 0);
    this.delayNodeR.connect(this.sideGainNode);
    this.sideGainNode.connect(this.mergerNode, 0, 1);

    this.mergerNode.connect(this.pannerNode);

    this.mergerNode.connect(this.convolverNode);
    this.convolverNode.connect(this.reverbGainNode);
    this.reverbGainNode.connect(this.pannerNode);

    // Panner -> Spatial Gain Boost -> Master Gain -> Analyser -> Output
    this.pannerNode.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  async resumeCtx() {
    if (!this.isInitialized || !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  connectMediaElement(audioElement) {
    this.resumeCtx();
    if (this.connectedElement === audioElement && this.mediaSourceNode) {
      return;
    }
    if (this.mediaSourceNode) {
      try { this.mediaSourceNode.disconnect(); } catch (e) {}
    }
    this.mediaSourceNode = this.ctx.createMediaElementSource(audioElement);
    this.mediaSourceNode.connect(this.preGainNode);
    this.connectedElement = audioElement;
  }

  fadeGain(targetGain = 1.0, durationMs = 30) {
    if (!this.preGainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.preGainNode.gain.cancelScheduledValues(now);
    this.preGainNode.gain.setTargetAtTime(targetGain, now, durationMs / 1000);
  }

  startSynthGroove(trackMode = 'bass') {
    this.resumeCtx();
    this.stopSynthGroove();
    this.isSynthLoopActive = true;
    this.currentTrackMode = trackMode;

    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.value = 0.55;
    this.synthGain.connect(this.preGainNode);

    let step = 0;
    const bpm = trackMode === 'acoustic' ? 90 : trackMode === 'movie' ? 70 : 120;
    const stepInterval = (60 / bpm / 4) * 1000;

    const bassFreqs = [55, 55, 65, 49, 55, 55, 73, 65];
    const acousticChords = [
      [220, 277.18, 329.63],
      [164.81, 246.94, 329.63],
      [146.83, 220.00, 293.66],
      [220, 261.63, 329.63]
    ];
    const spatialMelody = [523.25, 659.25, 783.99, 1046.50, 880.00, 659.25, 587.33, 440.00];

    this.synthLoopTimer = setInterval(() => {
      if (!this.isSynthLoopActive || !this.ctx) return;
      const now = this.ctx.currentTime;

      if (trackMode === 'bass') {
        if (step % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(160, now);
          kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
          
          kickGain.gain.setValueAtTime(0.9, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          kickOsc.connect(kickGain);
          kickGain.connect(this.synthGain);
          kickOsc.start(now);
          kickOsc.stop(now + 0.18);
        }

        if (step % 2 === 1) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          hatOsc.type = 'triangle';
          hatOsc.frequency.setValueAtTime(3000 + Math.random() * 4000, now);
          
          hatGain.gain.setValueAtTime(0.25, now);
          hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          hatOsc.connect(hatGain);
          hatGain.connect(this.synthGain);
          hatOsc.start(now);
          hatOsc.stop(now + 0.05);
        }

        const bassNote = bassFreqs[Math.floor(step / 2) % bassFreqs.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassNote, now);

        bassGain.gain.setValueAtTime(0.45, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        bassOsc.connect(bassGain);
        bassGain.connect(this.synthGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.2);
      }
      else if (trackMode === 'spatial') {
        const leadNote = spatialMelody[step % spatialMelody.length];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadNote, now);

        const vocalFilter = this.ctx.createBiquadFilter();
        vocalFilter.type = 'bandpass';
        vocalFilter.frequency.value = 1200 + Math.sin(step) * 600;
        vocalFilter.Q.value = 3.0;

        leadGain.gain.setValueAtTime(0.35, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        leadOsc.connect(vocalFilter);
        vocalFilter.connect(leadGain);
        leadGain.connect(this.synthGain);
        leadOsc.start(now);
        leadOsc.stop(now + 0.35);

        if (step % 8 === 0) {
          const padOsc = this.ctx.createOscillator();
          const padGain = this.ctx.createGain();
          padOsc.type = 'triangle';
          padOsc.frequency.setValueAtTime(130.81, now);

          padGain.gain.setValueAtTime(0.3, now);
          padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          padOsc.connect(padGain);
          padGain.connect(this.synthGain);
          padOsc.start(now);
          padOsc.stop(now + 1.2);
        }
      }
      else if (trackMode === 'acoustic') {
        const chordIndex = Math.floor(step / 4) % acousticChords.length;
        const noteFreq = acousticChords[chordIndex][step % 3];

        const guitarOsc = this.ctx.createOscillator();
        const guitarGain = this.ctx.createGain();
        guitarOsc.type = 'triangle';
        guitarOsc.frequency.setValueAtTime(noteFreq, now);

        guitarGain.gain.setValueAtTime(0.4, now);
        guitarGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        guitarOsc.connect(guitarGain);
        guitarGain.connect(this.synthGain);
        guitarOsc.start(now);
        guitarOsc.stop(now + 0.4);

        if (step % 4 === 2) {
          const voiceOsc = this.ctx.createOscillator();
          const voiceGain = this.ctx.createGain();
          voiceOsc.type = 'sine';
          voiceOsc.frequency.setValueAtTime(440, now);

          voiceGain.gain.setValueAtTime(0.3, now);
          voiceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          voiceOsc.connect(voiceGain);
          voiceGain.connect(this.synthGain);
          voiceOsc.start(now);
          voiceOsc.stop(now + 0.5);
        }
      }
      else if (trackMode === 'movie') {
        if (step % 8 === 0) {
          const boomOsc = this.ctx.createOscillator();
          const boomGain = this.ctx.createGain();
          boomOsc.type = 'sine';
          boomOsc.frequency.setValueAtTime(180, now);
          boomOsc.frequency.exponentialRampToValueAtTime(20, now + 1.2);

          boomGain.gain.setValueAtTime(1.0, now);
          boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          boomOsc.connect(boomGain);
          boomGain.connect(this.synthGain);
          boomOsc.start(now);
          boomOsc.stop(now + 1.2);

          const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noiseSource = this.ctx.createBufferSource();
          noiseSource.buffer = noiseBuffer;

          const noiseFilter = this.ctx.createBiquadFilter();
          noiseFilter.type = 'lowpass';
          noiseFilter.frequency.setValueAtTime(800, now);
          noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.8);

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.6, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.synthGain);
          noiseSource.start(now);
        }
      }

      step = (step + 1) % 16;
    }, stepInterval);
  }

  stopSynthGroove() {
    this.isSynthLoopActive = false;
    if (this.synthLoopTimer) {
      clearInterval(this.synthLoopTimer);
      this.synthLoopTimer = null;
    }
  }

  async connectMicrophone() {
    await this.resumeCtx();
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    this.micStream = stream;
    const micSource = this.ctx.createMediaStreamSource(stream);
    micSource.connect(this.preGainNode);
    return stream;
  }

  async connectTabAudio() {
    await this.resumeCtx();
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      throw new Error("No audio track selected! Please check 'Share tab audio' or 'Share system audio'.");
    }

    this.tabStream = stream;
    const tabSource = this.ctx.createMediaStreamSource(stream);
    tabSource.connect(this.preGainNode);
    return stream;
  }

  startToneGenerator(type = 'sine', freq = 440) {
    this.resumeCtx();
    this.stopToneGenerator();

    if (type === 'sub') {
      freq = 40;
      type = 'sine';
    }

    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = type === 'sweep' ? 'sine' : type;
    this.oscillator.frequency.value = freq;

    if (type === 'sweep') {
      const now = this.ctx.currentTime;
      this.oscillator.frequency.setValueAtTime(20, now);
      this.oscillator.frequency.exponentialRampToValueAtTime(20000, now + 10);
    }

    const toneGain = this.ctx.createGain();
    toneGain.gain.value = 0.3;

    this.oscillator.connect(toneGain);
    toneGain.connect(this.preGainNode);
    this.oscillator.start();
  }

  stopToneGenerator() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {}
      this.oscillator = null;
    }
  }

  setBandGain(index, valueDb) {
    if (this.eqNodes[index]) {
      this.eqNodes[index].gain.value = parseFloat(valueDb);
    }
  }

  setSubBass(gainDb) {
    this.subBassAmount = parseFloat(gainDb);
    if (this.subBassFilter) {
      this.subBassFilter.gain.value = this.subBassAmount;
    }
  }

  // Master Volume Control
  setMasterGain(gainDb) {
    if (this.masterGainNode) {
      const val = parseFloat(gainDb);
      this.masterGainNode.gain.value = Math.pow(10, val / 20);
    }
  }

  // 3D Spatial Volume Boost Control (0 dB to +12 dB)
  setSpatialVolumeBoost(gainDb) {
    this.spatialVolumeBoost = parseFloat(gainDb);
    if (this.spatialGainNode) {
      this.spatialGainNode.gain.value = Math.pow(10, this.spatialVolumeBoost / 20);
    }
  }

  setDolbyCompressor(enabled, threshold = -24, ratio = 4) {
    if (!this.compressorNode || !this.compMakeupGainNode) return;
    if (enabled) {
      this.compressorNode.threshold.value = parseFloat(threshold);
      this.compressorNode.ratio.value = parseFloat(ratio);
      this.compressorNode.knee.value = 15;
      this.compMakeupGainNode.gain.value = 1.6;
    } else {
      this.compressorNode.threshold.value = 0;
      this.compressorNode.ratio.value = 1;
      this.compMakeupGainNode.gain.value = 1.0;
    }
  }

  setHaasExpander(enabled, widthPercent = 70, delayMs = 18) {
    this.haasWidth = widthPercent;
    this.haasDelayMs = delayMs;

    if (!this.delayNodeR || !this.sideGainNode) return;
    if (enabled) {
      const delaySec = (delayMs / 1000) * (widthPercent / 100);
      this.delayNodeR.delayTime.value = delaySec;
      this.sideGainNode.gain.value = 1.0 + (widthPercent / 100) * 0.8;
    } else {
      this.delayNodeR.delayTime.value = 0;
      this.sideGainNode.gain.value = 1.0;
    }
  }

  setVocalEnhancer(enabled, boostDb = 3.0) {
    if (!this.vocalBandpassNode) return;
    if (enabled) {
      this.vocalBandpassNode.gain.value = parseFloat(boostDb) * 1.5;
    } else {
      this.vocalBandpassNode.gain.value = 0;
    }
  }

  generateImpulseResponse(preset = 'cinema') {
    if (!this.ctx) return;
    let duration = 2.5;
    let decay = 2.2;

    if (preset === 'studio') { duration = 0.9; decay = 4.5; }
    if (preset === 'stadium') { duration = 4.5; decay = 1.2; }

    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this.convolverNode.buffer = impulse;
  }

  setRoomReverb(enabled, preset = 'cinema', wetPercent = 25) {
    if (!this.reverbGainNode) return;
    if (enabled) {
      this.generateImpulseResponse(preset);
      this.reverbGainNode.gain.value = (wetPercent / 100) * 0.95;
    } else {
      this.reverbGainNode.gain.value = 0;
    }
  }

  set3DPosition(x, y, z) {
    if (!this.pannerNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.pannerNode.positionX) {
      this.pannerNode.positionX.setTargetAtTime(x, now, 0.03);
      this.pannerNode.positionY.setTargetAtTime(y, now, 0.03);
      this.pannerNode.positionZ.setTargetAtTime(z, now, 0.03);
    } else if (this.pannerNode.setPosition) {
      this.pannerNode.setPosition(x, y, z);
    }
  }
}

// Global Engine Instance
window.audioEngine = new AudioEngine();

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

    
    
    // Harmonic Exciter
    this.exciterHPF = null;
    this.exciterShaper = null;
    this.exciterGain = null;
    this.isMono = false;
    // Advanced FX
    this.tubeShaper = null;
    this.tubeGain = null;
    this.tapeDelay = null;
    this.tapeLFO = null;
    this.tapeLFOGain = null;

    // 10 EQ Bands
    this.eqNodes = [];
    this.bands = FREQ_BANDS;

    // Dolby Compressor Nodes
    this.compressorNode = null;
    this.compMakeupGainNode = null;

    // Vocal Enhancer Peaking Filter Node
    this.vocalBandpassNode = null;

    // Mid/Side Matrix & Soundfield Expander Nodes
    this.msSplitter = null;
    this.msMerger = null;
    this.midGainL = null;
    this.midGainR = null;
    this.midSum = null;
    this.sideGainL = null;
    this.sideGainR = null;
    this.sideSum = null;
    
    this.sideWidthGain = null;
    this.sideDelayNode = null;
    
    this.outL = null;
    this.outR = null;
    this.sideInvGain = null;

    // Room Reverb Nodes
    this.convolverNode = null;
    this.reverbGainNode = null;

    // 3D HRTF Spatial Panner & Dedicated Spatial Volume Boost Gain
    this.pannerNode = null;
    this.spatialGainNode = null;

    // Analyser Node for Spectrum & VU Meters
    this.analyserNode = null;
    this.limiterNode = null;

    // --- GOD MODE NODES ---
    // Earthquake Bass
    this.godBassFilter = null;
    this.godBassShaper = null;
    // Crystal Clarity
    this.godClarityHighpass = null;
    this.godClarityShaper = null;
    this.godClarityGain = null;
    // Omnipresent Spatial
    this.godSpatialDelayL = null;
    this.godSpatialDelayR = null;
    this.godSpatialFeedback = null;
    // Aura OTT
    this.godOttComp1 = null;
    this.godOttComp2 = null;

    // Parameters State
    this.subBassAmount = 3.0;
    this.haasWidth = 70;
    this.haasDelayMs = 18;
    this.spatialVolumeBoost = 8.0; // Default +8dB 3D Volume Boost to counter HRTF loss
    this.isSynthLoopActive = false;
    this.currentTrackMode = 'bass';
    this.activeSource = 'demo';
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

    // 1. Pre-Gain (boosted slightly to compensate for Web Audio API native HRTF volume drops)
    this.preGainNode = this.ctx.createGain();
    this.preGainNode.gain.value = 1.0; // Normal unity gain

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

    // 4. Center Channel Vocal Enhancer Node (Peaking EQ at 2500Hz for speech intelligibility)
    this.vocalBandpassNode = this.ctx.createBiquadFilter();
    this.vocalBandpassNode.type = 'peaking';
    this.vocalBandpassNode.frequency.value = 2500;
    this.vocalBandpassNode.Q.value = 0.85;
    this.vocalBandpassNode.gain.value = 0.0; // Disabled by default

    // 5. Dolby Dynamic Range Compressor & Makeup Gain
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = 0.0; // Neutral default
    this.compressorNode.knee.value = 12;
    this.compressorNode.ratio.value = 1.0;     // Neutral default
    this.compressorNode.attack.value = 0.005;  // 5ms attack
    this.compressorNode.release.value = 0.20;  // 200ms release

    this.compMakeupGainNode = this.ctx.createGain();
    this.compMakeupGainNode.gain.value = 1.0;

    // 6. Mid-Side (M/S) Matrix & Haas Soundfield Expander Nodes
    this.msSplitter = this.ctx.createChannelSplitter(2);
    this.msMerger = this.ctx.createChannelMerger(2);

    // Summing nodes to extract Mid channel: Mid = (L + R) * 0.5
    this.midGainL = this.ctx.createGain();
    this.midGainR = this.ctx.createGain();
    this.midGainL.gain.value = 0.5;
    this.midGainR.gain.value = 0.5;
    this.midSum = this.ctx.createGain();
    this.midSum.gain.value = 1.0;

    // Summing nodes to extract Side channel: Side = (L - R) * 0.5
    this.sideGainL = this.ctx.createGain();
    this.sideGainR = this.ctx.createGain();
    this.sideGainL.gain.value = 0.5;
    this.sideGainR.gain.value = -0.5; // Phase inverted to subtract Right from Left
    this.sideSum = this.ctx.createGain();
    this.sideSum.gain.value = 1.0;

    // Stereo widening controller & Haas micro-delay for side channel
    this.sideWidthGain = this.ctx.createGain();
    this.sideWidthGain.gain.value = 1.0; // Neutral default
    this.sideDelayNode = this.ctx.createDelay(0.1);
    this.sideDelayNode.delayTime.value = 0.0; // Neutral default

    // Nodes to reconstruct Left & Right: L = Mid + Side, R = Mid - Side
    this.outL = this.ctx.createGain();
    this.outR = this.ctx.createGain();
    this.outL.gain.value = 1.0;
    this.outR.gain.value = 1.0;

    this.sideInvGain = this.ctx.createGain();
    this.sideInvGain.gain.value = -1.0; // Phase inverted side to subtract from Mid on Right channel

    // 7. Convolution Room Reverb Nodes
    this.convolverNode = this.ctx.createConvolver();
    this.reverbGainNode = this.ctx.createGain();
    this.reverbGainNode.gain.value = 0.0;
    this.generateImpulseResponse('cinema');

    // 8. 3D Binaural HRTF PannerNode (Calibrated for High Loudness)
    this.pannerNode = this.ctx.createPanner();
    this.pannerNode.panningModel = 'HRTF';
    this.pannerNode.distanceModel = 'linear'; 
    this.pannerNode.refDistance = 3.0;
    this.pannerNode.maxDistance = 10000;
    this.pannerNode.rolloffFactor = 0.2; 
    this.pannerNode.coneInnerAngle = 360;
    if (this.pannerNode.setPosition) {
      this.pannerNode.setPosition(0, 0, -2.0);
    }

    // Dedicated 3D Spatial Volume Boost Gain Node
    this.spatialGainNode = this.ctx.createGain();
    this.spatialGainNode.gain.value = Math.pow(10, this.spatialVolumeBoost / 20);

    
    // --- ADVANCED FX (Tube & Tape) ---
    // Tube Saturation (WaveShaper)
    this.tubeShaper = this.ctx.createWaveShaper();
    this.tubeShaper.oversample = '4x';
    this.tubeGain = this.ctx.createGain();
    this.tubeGain.gain.value = 1.0;
    this.setTubeWarmth(false, 30); // Default off
    this.setTapeWarble(false, 40); // Default off

    
    // Harmonic Exciter Nodes
    this.exciterHPF = this.ctx.createBiquadFilter();
    this.exciterHPF.type = 'highpass';
    this.exciterHPF.frequency.value = 5000;

    this.exciterShaper = this.ctx.createWaveShaper();
    this.exciterShaper.curve = this.makeDistortionCurve(40);

    this.exciterGain = this.ctx.createGain();
    this.exciterGain.gain.value = 0.0; // off by default

    // Connect Exciter parallel chain from tubeGain -> exciterHPF -> exciterShaper -> exciterGain -> tapeDelay
    this.exciterHPF.connect(this.exciterShaper);
    this.exciterShaper.connect(this.exciterGain);
    this.exciterGain.connect(this.tapeDelay);

    
    // L/R Stereo Panner Node
    this.stereoPannerNode = null;
    this.isMuted = false;
    this.isMonoCheck = false;
    this.isLoudBoost = false;
    
    // Transient & Sub-Octave & Crosstalk Nodes
    this.transientCompressor = null;
    this.transientGain = null;
    this.subOctaveFilter = null;
    this.subOctaveGainNode = null;
    this.crosstalkGainNode = null;
    this.headITDDelay = null;
    
    // A, B, C, D Snapshots Storage
    this.snapshots = { A: null, B: null, C: null, D: null };
    this.activeSnapshotKey = 'A';
    
    // Undo / Redo History Stack
    this.undoStack = [];
    this.redoStack = [];
    
    // Reference Track Node
    this.refAudioNode = null;
    this.isListeningToRef = false;
    
    // Limiter Ceiling Gain
    this.limiterCeilingDb = -0.1;
    this.targetLoudnessLufs = -14;
    // 9. Master Gain, Safety Limiter & Analyser
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = 1.0; // Normal unity gain

    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.value = -0.1; // Prevent digital clipping just under 0dBFS
    this.limiterNode.knee.value = 2.0;       // Soft knee for more transparent limiting
    this.limiterNode.ratio.value = 12;       // High compression ratio for limiting, but not total brickwall
    this.limiterNode.attack.value = 0.003;   // 3ms attack time
    this.limiterNode.release.value = 0.15;   // 150ms release time

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Load Meter Worklets
    if (this.ctx.audioWorklet) {
      this.ctx.audioWorklet.addModule('js/dsp/meter-worklet.js').then(() => {
        this.inputMeterNode = new AudioWorkletNode(this.ctx, 'meter-processor');
        this.outputMeterNode = new AudioWorkletNode(this.ctx, 'meter-processor');

        // Setup message handlers
        this.inputMeterNode.port.onmessage = (e) => {
          if (window.updateInputMeters) window.updateInputMeters(e.data);
        };
        this.outputMeterNode.port.onmessage = (e) => {
          if (window.updateOutputMeters) window.updateOutputMeters(e.data);
        };

        // Wire them up (Input is post-preGain, Output is post-limiter)
        this.preGainNode.connect(this.inputMeterNode);
        // The Limiter is already connected to Analyser. We can just tap the signal.
        this.limiterNode.connect(this.outputMeterNode);
      }).catch(err => console.error("Worklet load error:", err));
    }


    // --- New Modules: Tube & Tape ---
    this.tubeShaperNode = this.ctx.createWaveShaper();
    this.tubeShaperNode.oversample = '4x';
    this.tubeShaperNode.curve = this.makeDistortionCurve(0); // Off by default

    this.tapeDelayNode = this.ctx.createDelay(1.0);
    this.tapeDelayNode.delayTime.value = 0.02; // 20ms base delay
    this.tapeLfo = this.ctx.createOscillator();
    this.tapeLfo.type = 'sine';
    this.tapeLfo.frequency.value = 2.0; // 2 Hz wobble
    this.tapeLfoGain = this.ctx.createGain();
    this.tapeLfoGain.gain.value = 0.0; // Off by default
    this.tapeLfo.connect(this.tapeLfoGain);
    this.tapeLfoGain.connect(this.tapeDelayNode.delayTime);
    this.tapeLfo.start();

    
    // --- GOD MODE NODE INIT ---
    // 1. Earthquake Bass (Sub-harmonic exciter)
    this.godBassFilter = this.ctx.createBiquadFilter();
    this.godBassFilter.type = 'peaking';
    this.godBassFilter.frequency.value = 45; // Deep sub
    this.godBassFilter.Q.value = 1.0;
    this.godBassFilter.gain.value = 0; // Off by default

    // 2. Crystal Clarity (Parallel High Exciter)
    this.godClarityHighpass = this.ctx.createBiquadFilter();
    this.godClarityHighpass.type = 'highpass';
    this.godClarityHighpass.frequency.value = 6000;
    this.godClarityShaper = this.ctx.createWaveShaper();
    this.godClarityShaper.curve = this.makeDistortionCurve(0);
    this.godClarityGain = this.ctx.createGain();
    this.godClarityGain.gain.value = 0; // Off by default

    // 3. Omnipresent Spatial (Extreme wide Haas)
    this.godSpatialDelay = this.ctx.createDelay();
    this.godSpatialDelay.delayTime.value = 0; // Off by default

    // 4. Aura OTT Dynamics (Upwards/Downwards Multiband compression)
    this.godOttComp = this.ctx.createDynamicsCompressor();
    this.godOttComp.threshold.value = 0; // Off by default
    this.godOttComp.ratio.value = 1; // 1:1 (off)
    this.godOttComp.attack.value = 0.001;
    this.godOttComp.release.value = 0.1;
    this.godOttGain = this.ctx.createGain();
    this.godOttGain.gain.value = 1.0;

    // --- Build Signal Pipeline ---
    // PreGain -> SubBass -> 10-Band EQ -> Tube -> Mid/Side Splitting Matrix
    this.preGainNode.connect(this.subBassFilter);
    this.subBassFilter.connect(this.eqNodes[0]);

    const lastEqNode = this.eqNodes[this.eqNodes.length - 1];
    lastEqNode.connect(this.tubeShaperNode);
    this.tubeShaperNode.connect(this.msSplitter);

    // Connect Splitter outputs to Mid/Side Summing networks
    this.msSplitter.connect(this.midGainL, 0); // L input to Mid
    this.msSplitter.connect(this.midGainR, 1); // R input to Mid
    this.midGainL.connect(this.midSum);
    this.midGainR.connect(this.midSum);

    this.msSplitter.connect(this.sideGainL, 0); // L input to Side
    this.msSplitter.connect(this.sideGainR, 1); // R (inverted) input to Side
    this.sideGainL.connect(this.sideSum);
    this.sideGainR.connect(this.sideSum);

    // PROCESS MID CHANNEL: Peaking Vocal EQ -> Dolby Compressor
    this.midSum.connect(this.vocalBandpassNode);
    this.vocalBandpassNode.connect(this.compressorNode);
    this.compressorNode.connect(this.compMakeupGainNode);

    // PROCESS SIDE CHANNEL: Stereo Width -> Haas Delay
    this.sideSum.connect(this.sideWidthGain);
    this.sideWidthGain.connect(this.sideDelayNode);

    // RECONSTRUCT STEREO: L = Mid + Side, R = Mid - Side
    this.compMakeupGainNode.connect(this.outL); // Mid L contribution
    this.sideDelayNode.connect(this.outL);      // Side L contribution

    this.compMakeupGainNode.connect(this.outR); // Mid R contribution
    this.sideDelayNode.connect(this.sideInvGain);
    this.sideInvGain.connect(this.outR);        // Side R (inverted) contribution

    // Merge Left and Right back to stereo stream
    this.outL.connect(this.msMerger, 0, 0);
    this.outR.connect(this.msMerger, 0, 1);

    // Route stereo stream to Panner and Room Reverb
    this.msMerger.connect(this.pannerNode);
    this.msMerger.connect(this.convolverNode);
    this.convolverNode.connect(this.reverbGainNode);
    this.reverbGainNode.connect(this.pannerNode);

    // Panner -> Spatial Gain Boost -> Tape Warble -> Master Gain -> Limiter -> Analyser -> Output
    this.pannerNode.connect(this.spatialGainNode);
    this.spatialGainNode.connect(this.tapeDelayNode);
    this.tapeDelayNode.connect(this.masterGainNode);
    
    // Stereo Panner Node Initialization
    if (this.ctx.createStereoPanner) {
      this.stereoPannerNode = this.ctx.createStereoPanner();
      this.stereoPannerNode.pan.value = 0; // Center default
      this.masterGainNode.connect(this.stereoPannerNode);
      this.stereoPannerNode.connect(this.limiterNode);
    } else {
      this.masterGainNode.connect(this.limiterNode);
    }

    this.limiterNode.connect(this.analyserNode);
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
    if (!audioElement) return;
    this.resumeCtx();
    
    // Web Audio API throws if createMediaElementSource is called twice on the same element or with different AudioContexts.
    if (audioElement._mediaSourceNode) {
      if (audioElement._mediaSourceNode.context === this.ctx) {
        if (this.mediaSourceNode && this.mediaSourceNode !== audioElement._mediaSourceNode) {
          try { this.mediaSourceNode.disconnect(); } catch (e) {}
        }
        this.mediaSourceNode = audioElement._mediaSourceNode;
        try { this.mediaSourceNode.disconnect(); } catch(e) {}
        try { this.mediaSourceNode.connect(this.preGainNode); } catch(e) {}
        this.connectedElement = audioElement;
        return;
      } else {
        // Disconnected from previous context instance
        audioElement._mediaSourceNode = null;
      }
    }

    if (this.mediaSourceNode) {
      try { this.mediaSourceNode.disconnect(); } catch (e) {}
    }
    
    try {
      this.mediaSourceNode = this.ctx.createMediaElementSource(audioElement);
      audioElement._mediaSourceNode = this.mediaSourceNode;
      this.mediaSourceNode.connect(this.preGainNode);
      this.connectedElement = audioElement;
    } catch (err) {
      console.warn("MediaElementSource safe fallback:", err);
      if (audioElement._mediaSourceNode && audioElement._mediaSourceNode.context === this.ctx) {
        this.mediaSourceNode = audioElement._mediaSourceNode;
        try { this.mediaSourceNode.connect(this.preGainNode); } catch(e) {}
      }
    }
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

  stopMicrophone() {
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.micStream = null;
    }
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

  stopAllSources() {
    this.stopSynthGroove();
    this.stopToneGenerator();

    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.micStream = null;
    }

    if (this.tabStream) {
      try {
        this.tabStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.tabStream = null;
    }

    if (this.connectedElement) {
      try {
        this.connectedElement.pause();
        this.connectedElement.currentTime = 0;
      } catch (e) {}
      this.connectedElement = null;
    }

    if (window.spotifyPlayerInstance) {
      try {
        window.spotifyPlayerInstance.pause();
      } catch (e) {}
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
      const threshVal = parseFloat(threshold);
      const ratioVal = parseFloat(ratio);
      
      this.compressorNode.threshold.value = threshVal;
      this.compressorNode.ratio.value = ratioVal;
      this.compressorNode.knee.value = 12;

      // Mathematically correct makeup gain to offset loudness loss from compression:
      // Gain(dB) = (Abs(Threshold) / 2) * (1 - 1/Ratio)
      const makeupDb = (Math.abs(threshVal) / 2) * (1.0 - 1.0 / ratioVal);
      this.compMakeupGainNode.gain.value = Math.pow(10, makeupDb / 20);
    } else {
      this.compressorNode.threshold.value = 0;
      this.compressorNode.ratio.value = 1;
      this.compMakeupGainNode.gain.value = 1.0;
    }
  }

  setHaasExpander(enabled, widthPercent = 70, delayMs = 18) {
    this.haasWidth = widthPercent;
    this.haasDelayMs = delayMs;

    if (!this.sideWidthGain || !this.sideDelayNode) return;
    if (enabled) {
      // 50% width = original stereo width (1.0). 100% = extra wide (2.0). 0% = mono (0.0).
      this.sideWidthGain.gain.value = parseFloat(widthPercent) / 50;
      this.sideDelayNode.delayTime.value = parseFloat(delayMs) / 1000;
    } else {
      this.sideWidthGain.gain.value = 1.0;
      this.sideDelayNode.delayTime.value = 0.0;
    }
  }

  setVocalEnhancer(enabled, boostDb = 3.0) {
    if (!this.vocalBandpassNode) return;
    if (enabled) {
      this.vocalBandpassNode.gain.value = parseFloat(boostDb);
    } else {
      this.vocalBandpassNode.gain.value = 0.0;
    }
  }

  generateImpulseResponse(preset = 'cinema') {
    if (!this.ctx) return;
    let duration = 2.0;
    let decay = 2.0;

    if (preset === 'studio') { duration = 0.8; decay = 4.0; }
    if (preset === 'stadium') { duration = 4.0; decay = 1.0; }

    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    let prevL = 0;
    let prevR = 0;

    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Sliding lowpass damping filter to simulate frequency-dependent room absorption:
      // High frequencies absorb faster, leaving a warm low-mid decay tail
      const alpha = 0.04 + 0.96 * Math.pow(1 - t, 2.5);
      
      const rawL = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      const rawR = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);

      // Simple one-pole IIR filter
      prevL = prevL + alpha * (rawL - prevL);
      prevR = prevR + alpha * (rawR - prevR);

      left[i] = prevL;
      right[i] = prevR;
    }
    this.convolverNode.buffer = impulse;
  }

  setRoomReverb(enabled, preset = 'cinema', wetPercent = 25) {
    if (!this.reverbGainNode) return;
    if (enabled) {
      this.generateImpulseResponse(preset);
      // Calibrate wet level contribution
      this.reverbGainNode.gain.value = (wetPercent / 100) * 0.45;
    } else {
      this.reverbGainNode.gain.value = 0.0;
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

  // --- Analog Warmth & Tape Modules ---
  
  
  // --- GLOBAL BYPASS ---
  setGlobalBypass(isBypassed) {
    this.isBypassed = !!isBypassed;
    if (!this.preGainNode || !this.masterGainNode || !this.eqBands || !this.eqBands[0]) return;
    
    try {
      this.preGainNode.disconnect();
    } catch (e) {}

    try {
      if (this.isBypassed) {
        // Route directly to Master Gain, skipping EQ, Spatial, and FX
        this.preGainNode.connect(this.masterGainNode);
      } else {
        // Route back to normal chain (EQ)
        this.preGainNode.connect(this.eqBands[0]);
      }
    } catch (e) {
      console.warn("Bypass routing warning:", e);
    }
  }


  
  // --- HARMONIC EXCITER ---
  setExciter(enabled, drivePercent = 30, freq = 5000) {
    if (!this.exciterGain || !this.exciterHPF) return;
    this.exciterHPF.frequency.value = freq;
    if (enabled) {
      this.exciterGain.gain.value = (drivePercent / 100) * 0.5;
    } else {
      this.exciterGain.gain.value = 0.0;
    }
  }

  // --- MONO & M/S GAIN CONTROLS ---
  setMonoMode(isMono) {
    this.isMono = isMono;
    if (!this.sideWidthGain) return;
    if (isMono) {
      this.sideWidthGain.gain.value = 0; // Mute side channel for pure mono sum
    } else {
      this.sideWidthGain.gain.value = this.haasWidth / 100;
    }
  }

  setMidGain(dbVal) {
    if (this.midSum) {
      this.midSum.gain.value = Math.pow(10, dbVal / 20);
    }
  }

  setSideGain(dbVal) {
    if (this.sideSum) {
      this.sideSum.gain.value = Math.pow(10, dbVal / 20);
    }
  }

  // --- A/B STATE SNAPSHOT ENGINE ---
  getSnapshot() {
    return {
      masterGain: this.masterGainNode ? this.masterGainNode.gain.value : 1.0,
      eqBands: this.eqBands ? this.eqBands.map(b => b.gain.value) : [],
      haasWidth: this.haasWidth,
      haasDelay: this.haasDelay,
      vocalBoost: this.vocalBoost,
      subBass: this.subBass,
      spatialVolumeBoost: this.spatialVolumeBoost,
      isBypassed: this.isBypassed
    };
  }

  applySnapshot(state) {
    if (!state) return;
    if (state.masterGain !== undefined && this.masterGainNode) {
      this.masterGainNode.gain.value = state.masterGain;
    }
    if (state.eqBands && this.eqBands) {
      state.eqBands.forEach((val, i) => {
        if (this.eqBands[i]) this.eqBands[i].gain.value = val;
      });
    }
    if (state.haasWidth !== undefined && this.setHaasExpander) {
      this.setHaasExpander(true, state.haasWidth, state.haasDelay || 18);
    }
    if (state.vocalBoost !== undefined && this.setVocalEnhancer) {
      this.setVocalEnhancer(true, state.vocalBoost);
    }
    if (state.subBass !== undefined && this.setSubBass) {
      this.setSubBass(state.subBass);
    }
    if (state.isBypassed !== undefined && this.setGlobalBypass) {
      this.setGlobalBypass(state.isBypassed);
    }
  }

  
  // --- MASTER PANNING & UTILITIES ---
  setPanBalance(panValPercent) {
    if (!this.stereoPannerNode) return;
    const panNormalized = Math.max(-1, Math.min(1, parseFloat(panValPercent) / 100));
    this.stereoPannerNode.pan.value = panNormalized;
  }

  toggleMute() {
    if (!this.masterGainNode) return false;
    this.isMuted = !this.isMuted;
    this.masterGainNode.gain.value = this.isMuted ? 0.0 : 1.0;
    return this.isMuted;
  }

  toggleLoudnessBoost() {
    if (!this.masterGainNode) return false;
    this.isLoudBoost = !this.isLoudBoost;
    this.masterGainNode.gain.value = this.isLoudBoost ? 2.5 : 1.0; // +8dB transparent boost
    return this.isLoudBoost;
  }

  
  // --- TRANSIENT SHAPER & SUB-OCTAVE SYNTHESIZER ---
  setTransientShaper(enabled, attackVal = 40, subDb = 3) {
    if (!this.subBassGainNode) return;
    if (enabled) {
      this.setBassEnhance(parseFloat(subDb));
    }
  }

  // --- BINAURAL HEADSET & ITD CROSSTALK MATRIX ---
  setHeadDiameter(cm) {
    if (!this.pannerNode) return;
    // Calculate Interaural Time Difference (ITD) delay based on head size (cm / speed of sound 343m/s)
    const itdSeconds = (parseFloat(cm) / 100) / 343;
    if (this.sideDelayNode) {
      this.sideDelayNode.delayTime.value = itdSeconds;
    }
  }

  setCrosstalk(amountPercent) {
    if (!this.sideInvGain) return;
    const factor = (parseFloat(amountPercent) / 100) * 0.4;
    this.sideInvGain.gain.value = -1.0 + factor;
  }

  
  
  // --- A, B, C, D SNAPSHOT ENGINE ---
  saveSnapshot(key) {
    if (!['A','B','C','D'].includes(key)) return;
    if (!this.snapshots) this.snapshots = { A: null, B: null, C: null, D: null };
    this.snapshots[key] = this.getSnapshot();
  }

  loadSnapshot(key) {
    if (!this.snapshots) this.snapshots = { A: null, B: null, C: null, D: null };
    if (!this.snapshots[key]) return false;
    this.applySnapshot(this.snapshots[key]);
    this.activeSnapshotKey = key;
    return true;
  }

  // --- UNDO / REDO HISTORY ENGINE ---
  pushHistory() {
    if (!this.undoStack) this.undoStack = [];
    if (!this.redoStack) this.redoStack = [];
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
  }

  undo() {
    if (!this.undoStack || this.undoStack.length === 0) return false;
    if (!this.redoStack) this.redoStack = [];
    const currentState = this.getSnapshot();
    this.redoStack.push(JSON.stringify(currentState));
    const prevState = JSON.parse(this.undoStack.pop());
    this.applySnapshot(prevState);
    return true;
  }

  redo() {
    if (!this.redoStack || this.redoStack.length === 0) return false;
    if (!this.undoStack) this.undoStack = [];
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    const nextState = JSON.parse(this.redoStack.pop());
    this.applySnapshot(nextState);
    return true;
  }


  // --- UNDO / REDO HISTORY ENGINE ---
  pushHistory() {
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    if (this.undoStack.length > 50) this.undoStack.shift(); // Max 50 undo states
    this.redoStack = []; // Clear redo stack on new change
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const currentState = this.getSnapshot();
    this.redoStack.push(JSON.stringify(currentState));
    const prevState = JSON.parse(this.undoStack.pop());
    this.applySnapshot(prevState);
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const currentState = this.getSnapshot();
    this.undoStack.push(JSON.stringify(currentState));
    const nextState = JSON.parse(this.redoStack.pop());
    this.applySnapshot(nextState);
    return true;
  }

  // --- LIMITER CEILING & TARGET LOUDNESSS ---
  setLimiterCeiling(db) {
    this.limiterCeilingDb = parseFloat(db);
    if (this.limiterNode) {
      // Convert dBTP ceiling to linear amplitude limit
      const linearCeiling = Math.pow(10, this.limiterCeilingDb / 20);
      this.limiterNode.threshold.value = this.limiterCeilingDb;
    }
  }

  setTargetLoudness(lufs) {
    this.targetLoudnessLufs = parseFloat(lufs);
  }

  makeDistortionCurve(amount) {
    if (amount === 0) return null;
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = i * 2 / n_samples - 1;
      // Soft saturation formula
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  setTubeWarmth(enabled, drivePercent = 30) {
    if (!this.tubeShaperNode) return;
    if (enabled) {
      // Map 0-100 slider to 0-400 distortion amount
      const amount = (parseFloat(drivePercent) / 100) * 400;
      this.tubeShaperNode.curve = this.makeDistortionCurve(amount);
    } else {
      this.tubeShaperNode.curve = null; // Bypass shaper
    }
  }

  setTapeWarble(enabled, depthPercent = 40) {
    if (!this.tapeLfoGain) return;
    if (enabled) {
      // depthPercent 0-100 maps to 0.0 - 0.005 seconds of delay wobble
      const wobble = (parseFloat(depthPercent) / 100) * 0.005;
      this.tapeLfoGain.gain.value = wobble;
    } else {
      this.tapeLfoGain.gain.value = 0.0;
    }
  }
}

// Global Engine Instance
window.audioEngine = new AudioEngine();

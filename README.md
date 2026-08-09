# 🎛️ AuraDSP Pro — Professional Web Audio Processing & 3D Spatialization Lab

> **A professional-grade, mathematically accurate Web Audio DSP Workstation operating entirely in the browser.**  
> Built with zero dependencies using pure Web Audio API, AudioWorklets, and Canvas 2D.

---

## 🌐 Live Demo & Deployment
👉 **[Open AuraDSP Pro Live Site](https://RomirRodrigues.github.io/auradsp-pro/)**

---

## 🎛️ DSP Signal Chain Architecture

```
[ AUDIO SOURCE ] (Local File / Mic / Test Lab / Web Streamer)
       │
       ▼
[ PRE-GAIN STAGE ] (Input Gain Control & Metering)
       │
       ▼
[ 10-BAND PARAMETRIC / GRAPHIC EQ ] (31Hz–16kHz Biquad Filters)
       │
       ▼
[ DYNAMIC RANGE COMPRESSOR ] (Soft-Knee Knee/Attack/Release)
       │
       ▼
[ ANALOG TUBE & TAPE SATURATION ] (WaveShaper Soft-Clipping + Wow/Flutter LFO)
       │
       ▼
[ HARMONIC EXCITER ] (High-Pass High-Frequency Harmonic Synthesizer)
       │
       ▼
[ MID/SIDE MATRIX & STEREO WIDENER ] (Haas Micro-Delay + Center Image Vocal Enhancer)
       │
       ▼
[ CONVOLUTION ROOM REVERB ] (Acoustic Impulse Responses)
       │
       ▼
[ 3D BINAURAL HRTF SPATIALIZER ] (LFO Orbit, Figure-8, Sweep, Random Motion)
       │
       ▼
[ BRICKWALL SAFETY LIMITER ] (-0.1 dBTP Ceiling Protection)
       │
       ▼
[ PRO METERING & ANALYZER ] (AudioWorklet Peak/RMS, LUFS, Phase Correlation)
       │
       ▼
[ AUDIO OUTPUT ]
```

---

## ✨ Features Overview

- **🎚️ 10-Band EQ & Interactive Parametric Canvas**: Real BiquadFilter nodes (31Hz to 16kHz) with interactive node dragging.
- **📊 AudioWorklet Pro Metering**: Off-main-thread Peak, RMS, True-Peak clipping, Phase Correlation (-1 to +1), and Momentary/Short-Term **LUFS**.
- **🌐 3D HRTF Binaural Spatializer**: Interactive soundstage canvas with coordinate overlay and automated motion patterns (Circular Orbit, Figure-Eight ♾️, Left-Right Sweep, Random).
- **🎛️ Analog DSP FX Suite**:
  - **Tube Warmth**: 4x oversampled `WaveShaperNode` soft-clipping distortion.
  - **Lo-Fi Tape Warble**: 1.5Hz sub-audible LFO delay pitch modulation.
  - **Harmonic Exciter**: High-frequency psychoacoustic harmonic synthesis.
- **🔄 Mid/Side Processing & Vocal Enhancer**: Center Image Vocal Enhancer for isolating 1.5–3.5kHz vocals, plus Mono Summing test toggle.
- **🔴 Global Bypass & A/B Comparison**: A/B state snapshot engine for comparing processed states vs dry audio.
- **🧪 Expanded Test Signal Lab**: Pure Sine, Square, 40Hz Sub-bass, and 20Hz-20kHz Logarithmic Frequency Sweeps.
- **💾 JSON Preset Management**: Save, Export JSON, and Import custom `.json` preset files.
- **📱 PWA & Offline Support**: Web App Manifest and Service Worker caching for complete offline functionality.

---

## 📁 Modular Project Structure

```
auradsp-pro/
├── index.html              # Studio console HTML layout
├── styles.css              # Cyber-dark hardware aesthetics & animations
├── manifest.json           # PWA Web App Manifest
├── sw.js                   # Service Worker offline asset cache
└── js/
    ├── app.js              # UI controller & event binding
    ├── audio/
    │   └── audio-engine.js # Core Web Audio API DSP signal chain
    ├── dsp/
    │   └── meter-worklet.js# AudioWorklet processor for 60fps meters & LUFS
    ├── visual/
    │   ├── visualizer.js   # Spectrum, Waveform, Spectrogram & Phase Scope
    │   └── spatial-canvas.js # 3D HRTF soundstage canvas
    └── data/
        └── presets.js      # Reference sound tuning profiles database
```

---

## 🛠️ Technical Specifications

| Component | Technical Implementation |
|---|---|
| Audio Core | Web Audio API (`AudioContext`, `AudioWorkletNode`) |
| Equalization | 10x `BiquadFilterNode` peaking filters |
| Metering | `AudioWorkletProcessor` (Float32Array buffer analysis) |
| Spatial Audio | `PannerNode` with HRTF panning model |
| Saturation | `WaveShaperNode` with polynomial curve & `DelayNode` + `OscillatorNode` |
| Storage | HTML5 LocalStorage & JSON file serialization |

---

Made with ❤️ for Audio Engineers & Audiophiles.

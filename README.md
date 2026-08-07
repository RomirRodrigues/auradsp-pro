# 🎧 AuraDSP Pro — Live Audio Tuning & 3D Spatial Sound Engine

> **Real-time DSP audio tuner for boAt Audio, TWS Earbuds, and Home Theater systems.**  
> Built with pure Web Audio API — no plugins, no installs, just open and tune.

---

## 🌐 Live Demo
👉 **[Open AuraDSP Pro](https://darkside18500.github.io/auradsp-pro)**

---

## ✨ Features

- 🎛️ **10-Band Precision Equalizer** — Real DSP BiquadFilter nodes (31Hz–16kHz)
- 🔊 **Dolby Night & Dynamic Control** — DynamicsCompressor + makeup gain
- 🌐 **Virtual Soundfield Expander** — HAAS 3D stereo width matrix (up to 1.8× width)
- 🎤 **Center Channel Vocal Enhancer** — Peaking filter at 2.5kHz for crisp vocals
- 🏠 **Home Theater Room Acoustics** — ConvolverNode impulse-response reverb (Cinema / Studio / Stadium)
- 🎯 **3D HRTF Binaural Spatial Stage** — Drag-and-drop interactive soundstage with Auto Orbit
- 📊 **60 FPS Logarithmic Spectrum Analyzer** — 64 log-spaced frequency bands (20Hz–20kHz)
- 🎵 **25 Expert Sound Profiles** — boAt Audio, Earbuds, Home Theater, Custom EQ tabs
- 🟢 **Spotify Direct App Connection** — Capture Spotify Desktop App audio live into the DSP pipeline
- 🎙️ **Microphone Live Input** — Real-time EQ & 3D processing on mic input
- 🔬 **Test Signal Generator** — Sine, Sawtooth, Square, Sub-bass, Frequency Sweep

---

## 📁 File Structure

```
auradsp-pro/
├── index.html          # Main app UI
├── styles.css          # Dark studio hardware theme
├── .nojekyll           # GitHub Pages fix
└── js/
    ├── presets.js      # 25 sound profiles database
    ├── audio-engine.js # Core DSP signal chain
    ├── visualizer.js   # Spectrum analyzer & VU meters
    ├── spatial-canvas.js # 3D HRTF soundstage canvas
    └── app.js          # UI controller & event wiring
```

---

## 🚀 Deploy to GitHub Pages

1. Upload all files to a GitHub repo
2. Go to **Settings → Pages → Branch: main → Save**
3. Live in ~60 seconds at `https://your-username.github.io/repo-name`

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| Web Audio API | Real-time DSP signal processing |
| BiquadFilterNode | 10-Band parametric EQ |
| DynamicsCompressorNode | Dolby-style compression |
| ConvolverNode | Room acoustics reverb |
| PannerNode (HRTF) | 3D binaural spatial audio |
| Canvas 2D | Spectrum analyzer & spatial stage |
| Vanilla JS / CSS | Zero-dependency frontend |

---

Made with ❤️ using the Web Audio API

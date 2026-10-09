/**
 * AuraDSP Pro - Complete Version History & Changelog Data
 * Records all 52 version milestones from v1.0.0 (Genesis) to v52.0.0 (Latest).
 */

const CHANGELOG_DATA = [
  {
    version: 'v53.1.0',
    title: 'Developer Diagnostics & Superuser Console (Romir Rodrigues Secret Menu)',
    tag: 'Latest',
    date: 'Current Release',
    items: [
      '5-Click AuraDSP Pro Easter Egg: Clicking the "AURA DSP PRO" brand name 5 times plays a sci-fi unlock chime and launches the Developer Diagnostics & Superuser Console.',
      'AudioContext Runtime Telemetry: Live real-time inspection of AudioContext state, sample rate, base & output buffer latency, DSP clock runtime, and channel topology.',
      'Calibrated Reference Signal Generator: Laboratory signal generator for 1 kHz reference sine (-18 dBFS), 440 Hz tuning pitch (A4), 20 Hz – 20 kHz log sine sweep with live frequency tracker, calibrated pink noise, flat white noise, and 1ms Dirac acoustic impulse clicks.',
      'Low-Level DSP Overrides & Safety: Zero-latency master hardware wire passthrough bypass, 16 Hz infrasonic high-pass sub-guard filter, and AI Auto EQ speed governor.',
      'Active State JSON Inspector: Real-time JSON state serialization, one-click clipboard copy, and custom state JSON injection.',
      '100-Filter Quantum DSP Benchmark: Stress-test hardware audio rendering headroom with 100 cascaded BiquadFilterNodes measuring sub-millisecond execution latency and hardware tier scoring (S-Tier / A-Tier).'
    ]
  },
  {
    version: 'v53.0.0',
    title: 'DTS:X 7.1 Surround Up-Mixer & MaxxBass Sub-Bass Synthesizer',
    tag: 'Major',
    date: 'Milestone Release',
    items: [
      'Feature 3 - DTS:X / 5.1 & 7.1 Real-Time Surround Up-Mixer: Decodes 2-channel stereo into virtual 5.1 Cinema, 7.1 DTS:X, and 9.1.4 Neural:X multi-channel surround with Center dialogue focus, 24dB/oct LFE subwoofer extraction, Haas side delays, and rear ear-shadow filtering.',
      'Live 8-Channel Surround Decoder Activity Matrix: Real-time visual activity meters for FL, C, FR, LFE, SL, SR, RL, and RR channels.',
      'Instant A/B Surround Audition: One-click comparison button to switch between Direct Stereo and DTS:X immersive surround soundstage.',
      'Feature 5 - MaxxBass Psychoacoustic "Missing Fundamental" Synthesizer: Generates 2nd and 3rd harmonic overtones (Waves MaxxBass tech) allowing earphones and small speakers to perceive deep 20Hz-50Hz bass without driver distortion.',
      'Earbud Sub-Distortion Guard: Infrasonic high-pass filter cutting sub-45Hz rumble while synthetic harmonics retain massive perceived sub-bass.',
      'Unlimited Continuous AI Auto EQ: Upgraded adaptive equalizing engine with zero dropouts, self-healing watchdog, and background tab immunity.'
    ]
  },
  {
    version: 'v52.1.0',
    title: 'Studio Pro Measurement & Spatial Calibration Suite',
    tag: 'Major',
    date: 'Milestone Release',
    items: [
      'Feature 4 - Fullscreen Party / Cinema Visualizer: Immersive 300 FPS cinema display with floating track metadata, live DR metrics, and F key shortcut.',
      'Feature 8 - Virtual 7.1.4 Dolby Atmos Speaker Matrix: Interactive 12-speaker spatial audio layout across ceiling heights (.4) and bed (7.1) with binaural pink noise engine.',
      'Feature 10 - 500+ Headphone AutoEQ Profile Importer: Searchable database of calibrated Harman Target curves for Sony, Apple, Sennheiser, Bose, Beyerdynamic, boAt, Moondrop, KZ & more.',
      'Feature 13 - Ear Fatigue & Safe Listening Dose Tracker: WHO/OSHA 85dB SPL standard acoustic dosage tracker with timer, warning threshold, and daily dose badge.',
      'Feature 19 - Track Dynamic Range (DR) & Crest Factor Live Meter: TT DR Meter spec with real-time peak/RMS ratio in dB, dynamic density gauge, and stereo VU needles.',
      'Feature 20 - Technical Audio File & Codec Inspector: Deep stream analysis of container codec, sample rate, bit depth, bitrate, latency, and Hi-Res Lossless certification.'
    ]
  },
  {
    version: 'v52.0.0',
    title: 'Auto AI 10-Band Equalizer & Dynamic Real-Time Acoustic Optimization',
    tag: 'Major',
    date: 'Milestone Release',
    items: [
      'Added Auto AI 10-Band Equalizer with real-time psychoacoustic spectrum analysis (Fletcher-Munson & Harman Target Reference).',
      'Dynamic 3-4 Second Adaptation Cycle: Automatically re-evaluates the song spectrum and smoothly glides all 10 hardware sliders over 1.2s.',
      'Pause-Freeze Memory: Freezes sliders at the exact last tuned position when audio is paused or stopped, resuming when playback starts.',
      'Interactive AI Control: Added [✨ AI Auto EQ: ON/OFF] toggle button with animated neon pulse beacon and live profile status strip.'
    ]
  },
  {
    version: 'v51.0.0',
    title: 'Full-Length Audio Engines & Apple Music 30s Preview Elimination',
    tag: 'Audio Engine',
    items: [
      'Eliminated Apple Music 30-second preview limit: Completely removed preview snippets from search engines, genre buttons, and link resolvers.',
      'Netlabels Hi-Fi Master Vault: Added 70,000+ full studio release albums & direct lossless MP3 tracks.',
      'Archive.org Live Music Archive (etree): Added 250,000+ full-length soundboard live concert recordings and acoustic sets.',
      'Apple Music URL Re-routing: When music.apple.com URLs are pasted, extracts metadata and streams full-length 320kbps studio master audio.'
    ]
  },
  {
    version: 'v50.0.0',
    title: '144Hz / 240Hz Ultra-High Refresh Rate Render Pipeline & Live FPS Counter',
    tag: 'Performance',
    items: [
      'Unlocked 144Hz and 240Hz render loops for high-refresh display monitors across spectrum visualizer and spatial stage.',
      'Eliminated layout thrashing by pre-allocating Float32 and Uint8 audio buffers.',
      'Added live hardware FPS counter badge in the studio header toolbar.'
    ]
  },
  {
    version: 'v49.0.0',
    title: 'Professional Studio Hardware Console Redesign',
    tag: 'UI/UX',
    items: [
      'Overhauled user interface to neutral, high-contrast studio workstation design.',
      'Replaced oversaturated cyberpunk neon with professional slate, titanium, and cyan accents.'
    ]
  },
  {
    version: 'v48.0.0',
    title: 'Universal Multi-Platform Audio Stream Resolver',
    tag: 'Streaming',
    items: [
      'Universal audio playback for YouTube, WhatsApp shared voice/audio, Spotify, Amazon Music, SoundCloud, Dropbox, Google Drive, and raw audio files.',
      'Intelligent shared text cleaner that parses song and artist metadata from chat shares.'
    ]
  },
  {
    version: 'v47.0.0',
    title: 'Studio Hardware Typography & Icon Polish',
    tag: 'Design',
    items: [
      'Cleaned up all emojis across controls, replacing them with sharp vector SVG hardware icons.',
      'Refined studio typography and component spacing.'
    ]
  },
  {
    version: 'v46.0.0',
    title: 'Spotify & YouTube Music Streaming Integration',
    tag: 'Engines',
    items: [
      'Integrated Noembed and Spotify oEmbed metadata resolvers with multi-engine fallback streaming.',
      'Instant audio link parsing with high-res album art resolution.'
    ]
  },
  {
    version: 'v45.0.0',
    title: 'Universal Link Player Module',
    tag: 'Feature',
    items: [
      'Added dedicated Universal Link & Stream Player panel to the AUDIO SOURCE ROUTER.',
      'Allows pasting direct audio links or supported music streaming URLs.'
    ]
  },
  {
    version: 'v44.0.0',
    title: '7 Universal Audio Engine Clusters (100M+ Global Catalog)',
    tag: 'Catalog',
    items: [
      'Concurrently queries 7 global audio clusters in parallel (Saavn, Audius, Netlabels, Radio Browser, Live Concerts, Archive, Vinyl).',
      'Provides resilient multi-proxy fallback architecture with 1:1 global song coverage.'
    ]
  },
  {
    version: 'v43.0.0',
    title: 'Studio Ergonomic Layout Optimization',
    tag: 'Workflow',
    items: [
      'Swapped layout positions of 3D Spatial Audio Stage and Spectrum & Waveform Visualizer for optimal mixing ergonomics.',
      'Centered visual feedback directly in the producer field of view.'
    ]
  },
  {
    version: 'v42.0.0',
    title: 'Pixel-Perfect Hardware Slider Thumb Centering',
    tag: 'Hardware',
    items: [
      'Centered 28px tactile hardware slider thumbs exactly in the middle of vertical fader slots.',
      'Added tactile zero-detent line across all 10 channels.'
    ]
  },
  {
    version: 'v41.0.0',
    title: 'Hardware Channel Fader Alignment',
    tag: 'Hardware',
    items: [
      'Corrected vertical slider channel detent lines and zero-point alignment across all 10 EQ bands.'
    ]
  },
  {
    version: 'v40.0.0',
    title: 'Modern shadcn Studio Dark Aesthetic',
    tag: 'UI/UX',
    items: [
      'Upgraded cards, switches, status pills, and sliders to modern shadcn studio design standards.'
    ]
  },
  {
    version: 'v39.0.0',
    title: 'Multi-Cluster JioSaavn HD Audio Engine',
    tag: 'Regional',
    items: [
      'Integrated 4 independent server mirrors for 80M+ Bollywood, Marathi, and international 320kbps CDN tracks.'
    ]
  },
  {
    version: 'v38.0.0',
    title: 'Clarity Engines Selector Rack',
    tag: 'DSP',
    items: [
      'Added dedicated audiophile clarity engine profiles (Warm Acoustic, Vocal Intimacy, Club Bass Quake, Pure Audiophile).'
    ]
  },
  {
    version: 'v37.0.0',
    title: 'Lossless Open-CORS Audio Stream Enforcement',
    tag: 'Streaming',
    items: [
      'Replaced restricted media streams with direct open CORS MP3 audio streams for reliable browser decoding.'
    ]
  },
  {
    version: 'v36.0.0',
    title: 'Eliminated Synth Fallbacks & Enforced Real Songs',
    tag: 'Audio',
    items: [
      'Removed remaining synth groove fallbacks, enforcing genuine audio streams across all search results.'
    ]
  },
  {
    version: 'v35.0.0',
    title: 'Global Music Catalog Expansion',
    tag: 'Catalog',
    items: [
      'Expanded catalog coverage to over 100M+ studio master tracks.'
    ]
  },
  {
    version: 'v34.0.0',
    title: 'Tactile Scroll Wheel Sensitivity for EQ Bands',
    tag: 'Controls',
    items: [
      'Added wheel scroll adjustment (0.5 dB per notch) and double-click reset to 0dB on all 10 EQ channels.'
    ]
  },
  {
    version: 'v33.0.0',
    title: 'Pointer-Capture Hardware Fader Dragging',
    tag: 'Controls',
    items: [
      'Implemented touch and mouse pointer capture on fader wells for fluid vertical dragging.'
    ]
  },
  {
    version: 'v32.0.0',
    title: 'Audius Decentralized Audio Network Integration',
    tag: 'Streaming',
    items: [
      'Added multi-provider discovery node fallback for direct 320kbps MP3 streaming.'
    ]
  },
  {
    version: 'v31.0.0',
    title: 'Web Audio Stream Synchronization',
    tag: 'Sync',
    items: [
      'Resolved audio buffer desync between UI seek slider and Web Audio source nodes.'
    ]
  },
  {
    version: 'v30.0.0',
    title: 'Studio Hardware 10-Band EQ Redesign',
    tag: 'Hardware',
    items: [
      'Redesigned 10-band equalizer to tactile hardware mixer faders with real-time color-coded dB badges.'
    ]
  },
  {
    version: 'v29.0.0',
    title: 'Visualizer Phantom Motion Elimination',
    tag: 'Visual',
    items: [
      'Fixed idle visualizer motion so bars sit completely flat at 0 when audio is paused.'
    ]
  },
  {
    version: 'v28.0.0',
    title: 'Audio Engine Resiliency & AudioContext Auto-Resume',
    tag: 'Engine',
    items: [
      'Added bulletproof AudioContext resume triggers on first user interaction.'
    ]
  },
  {
    version: 'v27.0.0',
    title: 'Spring Physics, Spotlight Glow & Quick Dock',
    tag: 'Motion',
    items: [
      'Integrated spring physics animations, spotlight cursor tracking, and quick dock controls.'
    ]
  },
  {
    version: 'v26.0.0',
    title: 'Jio CDN Direct Audio Streams',
    tag: 'Streaming',
    items: [
      'Deployed official Jio CDN direct MP3 streams with zero-CORS timing slider.'
    ]
  },
  {
    version: 'v25.0.0',
    title: 'Synchronous Instant Gesture Playback',
    tag: 'Controls',
    items: [
      'Implemented instant track playback on user click without asynchronous browser auto-play blocks.'
    ]
  },
  {
    version: 'v24.0.0',
    title: 'Real-Time Seek Slider & Duration Timer',
    tag: 'Playback',
    items: [
      'Added real-time progress slider and minute:second time displays for streamed audio.'
    ]
  },
  {
    version: 'v23.0.0',
    title: 'Multiple 100% Full-Song Search Engines',
    tag: 'Engines',
    items: [
      'Instituted multi-engine full-length song searching and removed truncated preview providers.'
    ]
  },
  {
    version: 'v22.0.0',
    title: 'Stream Resolution Resiliency',
    tag: 'Streaming',
    items: [
      'Enhanced network error recovery and automatic fallback for stream dropouts.'
    ]
  },
  {
    version: 'v21.0.0',
    title: 'Master DSP Power Switch & Anti-Phasing Filter',
    tag: 'DSP',
    items: [
      'Added Master DSP hardware bypass switch for instant A/B dry vs. processed comparison.',
      'Eliminated comb filtering and metallic stereo widening artifacts.'
    ]
  },
  {
    version: 'v20.0.0',
    title: 'Repository Architecture Cleanup',
    tag: 'Maintenance',
    items: [
      'Removed 92 deprecated helper scripts and optimized asset loading.'
    ]
  },
  {
    version: 'v19.0.0',
    title: 'Pure Audiophile Neutral Defaults',
    tag: 'Acoustic',
    items: [
      'Eliminated pre-boosted filter defaults in favor of bit-perfect transparent acoustic baseline.'
    ]
  },
  {
    version: 'v18.0.0',
    title: 'Playback Controller State Synchronization',
    tag: 'Sync',
    items: [
      'Synchronized play/pause buttons, keyboard spacebar controls, and transport indicators.'
    ]
  },
  {
    version: 'v17.0.0',
    title: 'Startup Error Hardening',
    tag: 'Stability',
    items: [
      'Wrapped all DOM lookups in defensive guards to ensure error-free initialization.'
    ]
  },
  {
    version: 'v16.0.0',
    title: 'Full-Width 64-Bar Flowing Visualizer',
    tag: 'Visual',
    items: [
      'Expanded frequency spectrum visualizer across all 64 log-spaced frequency bars.'
    ]
  },
  {
    version: 'v15.0.0',
    title: 'High-Fidelity Reference Calibration Audio',
    tag: 'Audio',
    items: [
      'Added sub-bass and kick drum calibration test files to demo track library.'
    ]
  },
  {
    version: 'v14.0.0',
    title: 'Continuous Flowing Idle Wave Animation',
    tag: 'Visual',
    items: [
      'Created ambient idle visualizer wave animation while waiting for audio input.'
    ]
  },
  {
    version: 'v13.0.0',
    title: 'Open-CORS Reference Library',
    tag: 'Audio',
    items: [
      'Integrated verified high-definition audio sources from Google and Mozilla media archives.'
    ]
  },
  {
    version: 'v12.0.0',
    title: 'Internet Archive Open Audio Vault',
    tag: 'Engines',
    items: [
      'Added direct search and stream integration with Archive.org open audio archives.'
    ]
  },
  {
    version: 'v11.0.0',
    title: 'Audio Source Router Tab Switcher',
    tag: 'Routing',
    items: [
      'Implemented tabbed source switcher between Local Files, Reference Tracks, and Web Streams.'
    ]
  },
  {
    version: 'v10.0.0',
    title: 'Studio DAW Modular Architecture',
    tag: 'Architecture',
    items: [
      'Refactored monolithic script into specialized ES modules (audio-engine, visualizer, spatial-canvas, motion-ui, presets).'
    ]
  },
  {
    version: 'v9.0.0',
    title: 'Visualizer Active State Synchronization',
    tag: 'Sync',
    items: [
      'Linked real Web Audio energy levels to visualizer rendering to eliminate phantom bar motion.'
    ]
  },
  {
    version: 'v8.0.0',
    title: 'Direct Fail-Safe Destination Routing',
    tag: 'Audio',
    items: [
      'Guaranteed audible sound output path through master limiter and destination nodes.'
    ]
  },
  {
    version: 'v7.0.0',
    title: 'AudioBuffer High-Performance DSP Engine',
    tag: 'Engine',
    items: [
      'Added decoded AudioBuffer streaming to bypass cross-origin browser media restrictions.'
    ]
  },
  {
    version: 'v6.0.0',
    title: 'Master Output Gain & Limiter Stage',
    tag: 'DSP',
    items: [
      'Re-engineered output stage with brickwall limiter to protect against digital clipping.'
    ]
  },
  {
    version: 'v5.0.0',
    title: 'Analog Tape Warble & Harmonic Exciter Rack',
    tag: 'DSP',
    items: [
      'Added vintage tape delay with LFO pitch flutter and harmonic saturation exciter.'
    ]
  },
  {
    version: 'v4.0.0',
    title: 'A/B/C/D Snapshots, Full Undo/Redo & LUFS Loudness Target',
    tag: 'Major Release',
    items: [
      'Added 4 snapshot memory banks (A, B, C, D) for instant A/B sound comparison.',
      'Full Undo/Redo history stack tracking all DSP parameters.',
      'Target loudness metering with presets for Spotify (-14 LUFS), Apple (-16 LUFS), and EBU (-23 LUFS).'
    ]
  },
  {
    version: 'v3.0.0',
    title: 'Touch Ergonomics & Accessibility Release',
    tag: 'Major Release',
    items: [
      'Added keyboard hotkeys (Space for play/pause, Ctrl+Z for undo, Ctrl+Y for redo).',
      'Optimized touch interactions and layout responsiveness for mobile devices.'
    ]
  },
  {
    version: 'v2.0.0',
    title: 'Aura Dynamic Sound Enhancers Rack & Hardware VU Meters',
    tag: 'Major Release',
    items: [
      'Haas 3D Virtual Soundfield Expander for ultra-wide stereo soundstage.',
      'Center Channel Vocal Enhancer for dialogue and speech clarity.',
      'Dolby Dynamic Range Compressor for peak normalization.',
      'Stereo Output VU Meters with live peak indicators.'
    ]
  },
  {
    version: 'v1.0.0',
    title: 'Genesis Release: AuraDSP Pro Audio Tuning Workstation',
    tag: 'Inception',
    items: [
      '10-Band Parametric Equalizer with real Web Audio API BiquadFilterNodes (31Hz to 16kHz).',
      '3D Binaural HRTF Spatial Audio Stage with interactive orbital listener positioning.',
      'Acoustic target presets for Aura Tuned, Earbuds, Home Theater, and Custom EQ.'
    ]
  }
];

if (typeof window !== 'undefined') {
  window.CHANGELOG_DATA = CHANGELOG_DATA;
}

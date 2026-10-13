/**
 * AuraDSP Pro - Complete Version History & Changelog Data
 * Records all 54+ version milestones from v1.0.0 (Genesis) to v54.3.0 (Latest).
 */

const CHANGELOG_DATA = [
  {
    version: 'v54.3.0',
    title: 'Mobile Viewport Zero-Overflow Engine & 2-Column Responsive Card Architecture',
    tag: 'Latest',
    date: 'Current Release',
    items: [
      'Universal Mobile Viewport Containment: Resolved the layout blowout on mobile screens where the right ~15% of the page was clipped off, ensuring all panels, controls, and sliders fit 100% within the smartphone viewport while leaving desktop workstation mode unchanged.',
      'Grid Containment with minmax(0, 1fr): Upgraded .studio-grid to grid-template-columns: minmax(0, 1fr) with overflow-x: hidden on mobile, strictly prohibiting child elements from expanding the main studio grid wider than the screen.',
      '2-Column Mobile Multi-Engine DSP Cards: Re-engineered .engine-cards-grid into a balanced 2-column grid (repeat(2, minmax(0, 1fr))) on mobile, with the 5th card ("Pure Audiophile") spanning full-width across both columns to eliminate horizontal overflow.',
      'Defensive Panel & Status Strip Clamping: Added min-width: 0 and overflow-x: hidden across .panel, and converted .ai-eq-status-strip and action bars into wrapping flex layouts so long status strings never force container expansion.',
      'Resolved Legacy Media Query Overrides: Scoped legacy tablet rules to min-width: 851px, eliminating conflicting style overrides that previously inflated mobile button paddings and erased navigation offsets.'
    ]
  },
  {
    version: 'v54.2.0',
    title: 'DSP Clarity Profile Container Boundary Fitting & Zero-Overflow Engine',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Resolved DSP Clarity Profile Box Overflow: Fixed the layout defect where the 5th engine button ("Audiophile") protruded outside the right border of the DSP Clarity Profile selector card on desktop streamer sidebars and mobile screens.',
      'Responsive minmax(0, 1fr) Grid Architecture: Replaced rigid inline repeat(5, 1fr) styling with semantic CSS using grid-template-columns: repeat(5, minmax(0, 1fr)), eliminating min-content intrinsic width blowouts and strictly containing all 5 button tracks within 100% of the parent card.',
      'Card Boundary Clamping & Clean Typographic Scaling: Added overflow: hidden, box-sizing: border-box, and text-overflow ellipsis protection to .web-engine-selector and .web-engine-btn, perfectly fitting Clarity 4K, Mastering, Cinema 3D, Bass Quake, and Audiophile within any screen or panel width.',
      'Flexible Profile Header Row: Converted the DSP clarity label and active engine badge into a responsive flex layout (.web-engine-header) with smooth wrapping and clean cyber accents.'
    ]
  },
  {
    version: 'v54.1.0',
    title: 'Workspace Simplification & Removal of Standalone Pink Noise Test Matrix',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Removed Virtual 7.1.4 Atmos Pink Noise Matrix: Deprecated and removed the standalone 12-channel pink noise test card from the 3D Spatial Audio section as it was a diagnostic test generator rather than an active music enhancement tool.',
      'Reclaimed Screen Real Estate: Significantly compacted vertical layout height on both mobile devices and desktop monitors, placing the 10-Band Parametric EQ and AutoEQ calibrator directly below the 3D HRTF Spatial Soundstage.',
      'Optimized DOM & Style Footprint: Stripped out redundant Atmos matrix DOM tree nodes, speaker button event listeners, and CSS layout grids, accelerating initial DOM load and mobile page responsiveness.'
    ]
  },
  {
    version: 'v54.0.0',
    title: 'Mobile Background Audio Stability, Zero-Crackling Engine & Lookahead Audio Clock Scheduler',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Eliminated Mobile Background Crackling & Fast Playback: Resolved Android buffer underflow pops and fast-forward clock catchup rushes by switching mobile AudioContext to interactive latency and standard hardware buffer sizes, preventing deep queue drift on mobile.',
      'Two-Clock Lookahead Web Audio Hardware Scheduler: Re-engineered live DSP synth grooves with a 400ms lookahead audio hardware timeline queue (this.ctx.currentTime), ensuring rock-solid sample-accurate rhythm with zero stutter, zero pitch changes, and zero speedup even when Android OS throttles background JavaScript timers.',
      'Android MediaSession Foreground Service Promotion: Connected navigator.mediaSession with track metadata, playback state tracking, and lock screen / notification shade controls, promoting Chrome into an active Android Media Service that prevents Doze-mode CPU starvation of the audio thread.',
      'Background UI & DOM IPC Yielding: Paused AudioWorklet meter message dispatch (480 msg/s) and DOM style recalculations while document.hidden is true, dedicating 100% of available CPU to glitch-free audio processing.',
      'De-Zippered Smooth Filter & Panner Transitions: Implemented setTargetAtTime parameter smoothing on all 10 EQ biquad filters and 3D binaural panner coordinates, eliminating digital clicks, pops, and stepping artifacts during background AI adaptations.',
      'Gentle 10Hz Background 3D Spatial Orbit Heartbeat: Calibrated background 3D spatial soundstage updates to a smooth 10Hz tick with continuous audio interpolation, keeping 3D spatial orbits dynamic in the background without HRTF convolution overload.'
    ]
  },
  {
    version: 'v53.9.0',
    title: 'Mobile Display Scaling Optimization & Responsive 850px Viewport Engine',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Expanded Mobile/Tablet Breakpoint (850px): Upgraded the mobile layout switcher from 600px to 850px in both JavaScript and CSS, ensuring all modern Android & iOS smartphones (regardless of display density, UI scaling, or landscape mode) receive the dedicated single-panel mobile workstation and bottom navigation instead of the oversized desktop grid.',
      'Proportional Mobile Header: Streamlined the studio top banner on mobile devices with an ultra-compact single-line footprint, reduced 32px logo, auto-truncated subtitles (170px), and hidden manual labels to eliminate horizontal header blowout.',
      'Perfect-Fit 10-Band EQ Mobile Rack: Re-engineered .eq-sliders-grid with responsive flex scaling (min-width: 25px, well width: 24px, height: 115px), fitting all 10 EQ channels cleanly within 316px without edge cutoffs or horizontal overflow.',
      'Responsive Canvas & Stage Architecture: Proportionally scaled spectrum analyzer (110px), EQ curve canvas (60px), and 3D spatial stage (230px max-width) to preserve complete visual fidelity while fitting modern smartphone screen ratios.',
      'Horizontal Streaming Profile Chip Bar: Converted web music engine buttons into a silky touch-scrollable horizontal pill bar to prevent wrap clutter.',
      '2-Column Dolby Atmos Virtualizer Matrix: Structured multichannel speaker nodes into a balanced 2-column mobile matrix with touch-friendly padded badges.'
    ]
  },
  {
    version: 'v53.8.0',
    title: 'Definitive Viewport Scrollport Unification (overflow-x: clip & Zero-Interception Engine)',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Solved Dual Scrollport Conflict: Converted body and html overflow-x from hidden to clip, keeping overflow-y strictly visible on body and letting the root browser window act as the single universal scrollport without nested viewport deadzones.',
      'Zero-Interception Wheel & Touch Pipeline: Stripped all wheel and touchmove event listeners from EQ bands and curve canvases so mouse wheel rolling and mobile finger swiping pass directly to compositor-level scrolling everywhere.',
      'Eliminated Isolated Composite Layers: Removed translateZ and will-change layer promotions from panels, keeping all workstation controls in the primary composite scroll pass.',
      'On-Demand Touch Drag Lifecycle: Dynamically bind spatial panner touchmove listeners only during active touch drags, releasing window touch events immediately when idle.'
    ]
  },
  {
    version: 'v53.7.0',
    title: 'Global Universal Scroll Engine & Deep Hardware Element Pass-Through',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Global Universal Scroll Engine: Applied overscroll-behavior-y: auto across the universal reset (*) and all audio hardware containers (enhancer cards, preset cards, source selectors, matrix grids, speaker nodes, canvases), guaranteeing zero-friction vertical scrolling from any millimeter of the screen on both Desktop and Android.',
      'Instant Mobile Tab Recalibration: Mobile navigation tab switches immediately align scroll position (window.scrollTo(0, 0)) to prevent viewport height traps between panel views.',
      'Touch-Action Pan-Y Pinch-Zoom Propagation: Explicitly configured hardware cards, matrices, and interactive modules to allow native multi-touch gestures to stream directly to the root viewport.',
      'Service Worker Instant Refresh: Automated client claim and cache bust synchronization across all scripts and styles.'
    ]
  },
  {
    version: 'v53.6.0',
    title: 'Universal Full-Screen Scrolling on Desktop & Android + Background Persistence',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Universal Full-Screen Scrolling: Completely solved the edge-only scrolling restriction across both Desktop and Android by removing scroll containment traps (overscroll-behavior: contain and overflow: hidden) from all hardware panels.',
      'Unrestricted Mouse Wheel & Touch Swiping: Mouse wheel over all 10 EQ channels now effortlessly scrolls the web page vertically (hold Ctrl/Shift/Alt to adjust band gain). Mobile touch swiping across slider tracks and canvases flows smoothly without pointer-capture locking.',
      'Single Canonical Scroll Viewport: Configured html as the primary smooth scrollport and unified body styling, eliminating nested scroll contention between browser viewport and inner workstations.',
      'Uninterrupted Background Audio: Completely removed playback pauses and crackles when switching apps or minimizing browsers, maintaining continuous audio context clock streaming.',
      'Persistent 3D Spatial Audio & Orbit: 3D spatial orbit math is decoupled from requestAnimationFrame and continuously ticks at 50Hz via background heartbeat timer so 3D soundstage remains fully dynamic in the background.'
    ]
  },
  {
    version: 'v53.5.0',
    title: 'Mobile Touch Optimization, Background Audio Persistence & Seamless 3D Orbit Engine',
    tag: 'Stable',
    date: 'October 2026',
    items: [
      'Universal Touch Scrolling: Enforced pan-y pinch-zoom and overscroll-behavior across all mobile panels, grids, and touch areas, allowing natural fluid vertical scrolling from anywhere on screen.',
      'Uninterrupted Background Playback: Completely eliminated audio pause and crackle on tab switch, window minimization, or phone screen lock by maintaining continuous Web Audio context clock routing.',
      'Decoupled 3D Spatial Audio Orbit: Separated 3D HRTF orbital path calculations from visual rendering using an autonomous delta-time engine so 3D spatial surround sound keeps orbiting continuously when minimized.',
      'Android / Mobile CPU Optimization: Canvas draw calls and meter DOM updates intelligently yield when minimized (document.hidden), dedicating 100% thread resources to glitch-free real-time audio DSP.',
      'Hardware-Matched Latency Pipeline: Automatic latencyHint tuning without forced sample-rate clamping, aligning cleanly with native DAC sample clocks across Android, Windows, and macOS.'
    ]
  },
  {
    version: 'v53.1.0',
    title: 'Developer Diagnostics & Superuser Console (Romir Rodrigues Secret Menu)',
    tag: 'Major',
    date: 'Milestone Release',
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

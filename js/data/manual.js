/**
 * AuraDSP Pro - Complete Studio User Manual & Feature Guide Data
 * Comprehensive documentation of all website functions, how to use them,
 * SVG diagrams/illustrations, operational working principles, and sonic benefits.
 */

const MANUAL_QUICK_START = [
  {
    step: 1,
    title: "Load Audio Source",
    desc: "Paste any link (Spotify, YouTube, WhatsApp voice/audio, SoundCloud, Amazon Music), drag & drop high-res local audio files (FLAC/MP3/WAV), or choose from 320,000+ lossless Netlabel & Live Concert archives.",
    badge: "Input",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
  },
  {
    step: 2,
    title: "Select Reference Acoustic Target",
    desc: "Choose an engineered calibration preset tailored for your output device: Earbuds, Over-Ear Headphones, Home Theater 5.1/7.1, Car Audio, or Audiophile Reference.",
    badge: "Calibration",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`
  },
  {
    step: 3,
    title: "Engage Auto AI EQ or Custom Faders",
    desc: "Turn on [✨ AI Auto EQ] to let the real-time psychoacoustic analyzer automatically tune all 10 bands every 3-4 seconds matching Harman target curves, or adjust faders manually.",
    badge: "Equalization",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5v14M7 5v14M2 9v6M22 9v6"/></svg>`
  },
  {
    step: 4,
    title: "Position in 3D Binaural Spatial Soundstage",
    desc: "Drag the orbital sound node in the 360° radar canvas to transform flat stereo into out-of-head 3D holographic surround sound with realistic acoustic room reflections.",
    badge: "Spatial Stage",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`
  },
  {
    step: 5,
    title: "Dial In Studio Dynamic Enhancers & Limiters",
    desc: "Enhance sub-bass depth, expand stereo soundfield width with the Haas delay, boost vocal intelligibility, compress dynamic range, and prevent clipping distortion with master LUFS limiting.",
    badge: "Mastering",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 15h6"/></svg>`
  }
];

const MANUAL_FEATURES = [
  {
    id: "auto_ai_eq",
    category: "eq",
    title: "Auto AI 10-Band Equalizer (Dynamic Acoustic Optimization)",
    badge: "AI Powered",
    summary: "Dynamic psychoacoustic spectrum analyzer that automatically tunes all 10 hardware EQ sliders in real time for any playing song.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <!-- Title & Status -->
        <text x="24" y="28" fill="#58a6ff" font-family="monospace" font-size="11" font-weight="700">REAL-TIME PSYCHOACOUSTIC ANALYZER (2048-POINT FFT)</text>
        <circle cx="490" cy="24" r="5" fill="#00f0ff" filter="drop-shadow(0 0 4px #00f0ff)"/>
        <!-- Frequency spectrum curve -->
        <path d="M 30 110 Q 70 45, 110 80 T 190 70 T 270 95 T 350 55 T 430 75 T 490 100" fill="none" stroke="rgba(0, 240, 255, 0.25)" stroke-width="2" stroke-dasharray="4 3"/>
        <path d="M 30 105 Q 80 55, 130 65 T 230 85 T 330 60 T 430 65 T 490 90" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
        <!-- AI target nodes -->
        <circle cx="80" cy="55" r="4" fill="#a855f7"/>
        <text x="70" y="42" fill="#d8b4fe" font-size="9" font-family="monospace">+4.2dB</text>
        <circle cx="180" cy="72" r="4" fill="#00f0ff"/>
        <text x="170" y="60" fill="#7dd3fc" font-size="9" font-family="monospace">+1.5dB</text>
        <circle cx="330" cy="60" r="4" fill="#10b981"/>
        <text x="320" y="48" fill="#6ee7b7" font-size="9" font-family="monospace">+3.0dB</text>
        <circle cx="430" cy="65" r="4" fill="#f59e0b"/>
        <text x="420" y="52" fill="#fde68a" font-size="9" font-family="monospace">+2.8dB</text>
        <!-- 10 Band indicators at bottom -->
        <g transform="translate(30, 118)" fill="#8b949e" font-family="monospace" font-size="8">
          <text x="0" y="10">31Hz</text><text x="48" y="10">62Hz</text><text x="96" y="10">125</text><text x="144" y="10">250</text>
          <text x="192" y="10">500</text><text x="240" y="10">1k</text><text x="288" y="10">2k</text><text x="336" y="10">4k</text>
          <text x="384" y="10">8k</text><text x="432" y="10">16k</text>
        </g>
      </svg>
    `,
    working: "Connects a high-precision 2048-point Fast Fourier Transform (FFT) AnalyserNode into the audio pipeline. Every 3 to 4 seconds during playback, it calculates the RMS energy across 10 psychoacoustic octaves and compares them against the scientifically proven Fletcher-Munson Equal-Loudness Contours and Harman Target Curve. When discrepancies occur (e.g. muffled vocals, excessive sub-bass mud, or dull treble), the AI calculates the exact compensating dB gain and glides all 10 BiquadFilterNodes smoothly over a 1.2-second transition.",
    whyToUse: "Eliminates the frustration of having to manually readjust equalizer sliders for every different genre or poorly mastered song. If you play hip-hop with boomy bass, it tames low resonances; if you switch to acoustic jazz, it illuminates breath and string detail; when audio pauses, it freezes the faders in place so you never lose your sound signature.",
    proTip: "Toggle [✨ AI Auto EQ] ON for everyday background listening or diverse playlists. If you want to customize a specific band, simply move any slider and the AI will gracefully yield to your manual touch."
  },
  {
    id: "hardware_eq",
    category: "eq",
    title: "10-Band Parametric Hardware Studio Equalizer",
    badge: "DSP Core",
    summary: "Precision 10-band surgical equalizer covering 31Hz sub-bass to 16kHz air frequencies with ±12dB calibrated gain.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="25" fill="#00f0ff" font-family="monospace" font-size="11" font-weight="700">10-BAND CASCADED BIQUAD FILTER STACK (±12dB)</text>
        <!-- Center zero line -->
        <line x1="30" y1="75" x2="490" y2="75" stroke="#30363d" stroke-width="1" stroke-dasharray="3 3"/>
        <text x="495" y="78" fill="#484f58" font-family="monospace" font-size="9">0dB</text>
        <!-- 10 Faders representation -->
        <!-- 1 (31) -->
        <line x1="50" y1="35" x2="50" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="42" y="48" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="38" y="130" fill="#8b949e" font-family="monospace" font-size="8">31Hz</text>
        <!-- 2 (62) -->
        <line x1="95" y1="35" x2="95" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="87" y="55" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="83" y="130" fill="#8b949e" font-family="monospace" font-size="8">62Hz</text>
        <!-- 3 (125) -->
        <line x1="140" y1="35" x2="140" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="132" y="68" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="127" y="130" fill="#8b949e" font-family="monospace" font-size="8">125Hz</text>
        <!-- 4 (250) -->
        <line x1="185" y1="35" x2="185" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="177" y="78" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="172" y="130" fill="#8b949e" font-family="monospace" font-size="8">250Hz</text>
        <!-- 5 (500) -->
        <line x1="230" y1="35" x2="230" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="222" y="75" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="217" y="130" fill="#8b949e" font-family="monospace" font-size="8">500Hz</text>
        <!-- 6 (1k) -->
        <line x1="275" y1="35" x2="275" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="267" y="62" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="267" y="130" fill="#8b949e" font-family="monospace" font-size="8">1kHz</text>
        <!-- 7 (2k) -->
        <line x1="320" y1="35" x2="320" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="312" y="58" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="312" y="130" fill="#8b949e" font-family="monospace" font-size="8">2kHz</text>
        <!-- 8 (4k) -->
        <line x1="365" y1="35" x2="365" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="357" y="50" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="357" y="130" fill="#8b949e" font-family="monospace" font-size="8">4kHz</text>
        <!-- 9 (8k) -->
        <line x1="410" y1="35" x2="410" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="402" y="44" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="402" y="130" fill="#8b949e" font-family="monospace" font-size="8">8kHz</text>
        <!-- 10 (16k) -->
        <line x1="455" y1="35" x2="455" y2="115" stroke="#21262d" stroke-width="4" stroke-linecap="round"/>
        <rect x="447" y="40" width="16" height="12" rx="3" fill="#00f0ff"/>
        <text x="445" y="130" fill="#8b949e" font-family="monospace" font-size="8">16kHz</text>
      </svg>
    `,
    working: "Operates 10 cascaded 2nd-order IIR BiquadFilterNodes (lowshelf at 31Hz, 8 peaking filters with Q=1.414 from 62Hz to 8kHz, and highshelf at 16kHz). Each filter calculates coefficient matrices at 32-bit floating point precision, providing click-free parameter interpolation via AudioParam ramping.",
    whyToUse: "Hardware speakers and headphones have physical acoustic flaws—such as piercing 4kHz treble peaks or recessed 125Hz punch. This equalizer gives you complete studio control to sculpt the audio signature to match your exact hardware and hearing preferences.",
    proTip: "To fix 'boxy' or muddy sound, try dipping 250Hz and 500Hz by -2dB to -3dB. To add 'air' and shimmer without harshness, boost 16kHz by +3dB."
  },
  {
    id: "spatial_audio",
    category: "spatial",
    title: "3D Binaural HRTF Spatial Audio Stage",
    badge: "Immersive 3D",
    summary: "Holographic 360-degree soundfield engine that positions audio in 3D physical space using binaural ear filters.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="25" fill="#a855f7" font-family="monospace" font-size="11" font-weight="700">3D BINAURAL HRTF ORBITAL SOUNDSTAGE</text>
        <!-- Center radar circles -->
        <circle cx="260" cy="78" r="50" fill="none" stroke="#21262d" stroke-width="1" stroke-dasharray="3 3"/>
        <circle cx="260" cy="78" r="32" fill="none" stroke="#30363d" stroke-width="1"/>
        <circle cx="260" cy="78" r="14" fill="none" stroke="#388bfd" stroke-width="1" stroke-opacity="0.4"/>
        <!-- Radar Crosshairs -->
        <line x1="260" y1="20" x2="260" y2="135" stroke="#161b22" stroke-width="1"/>
        <line x1="200" y1="78" x2="320" y2="78" stroke="#161b22" stroke-width="1"/>
        <!-- Listener Head -->
        <circle cx="260" cy="78" r="9" fill="#1f6feb" stroke="#58a6ff" stroke-width="1.5"/>
        <!-- Ears -->
        <rect x="248" y="75" width="3" height="6" rx="1.5" fill="#58a6ff"/>
        <rect x="269" y="75" width="3" height="6" rx="1.5" fill="#58a6ff"/>
        <!-- Sound Source Node -->
        <line x1="260" y1="78" x2="295" y2="48" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="2 2"/>
        <circle cx="295" cy="48" r="7" fill="#a855f7" filter="drop-shadow(0 0 6px #a855f7)"/>
        <!-- Labels -->
        <text x="310" y="52" fill="#c084fc" font-family="monospace" font-size="9" font-weight="700">SOURCE (+35° AZIMUTH)</text>
        <text x="220" y="105" fill="#8b949e" font-family="monospace" font-size="8">LISTENER (HRTF CENTER)</text>
      </svg>
    `,
    working: "Employs Web Audio's PannerNode with panningModel set to 'HRTF' (Head-Related Transfer Function). It computes physical sound wave diffraction around human ear pinnae, head shadow effects, and Interaural Time Differences (ITD & ILD) in real-time, accompanied by quadratic distance attenuation.",
    whyToUse: "Standard stereo headphones inject sound directly into your eardrums, causing intense ear fatigue and an artificial 'inside the skull' feeling. Binaural HRTF pushes the audio outside your head, creating a lifelike acoustic illusion of sitting in front of multi-speaker studio monitors or an IMAX cinema.",
    proTip: "Use the presets on the spatial panel (Studio Nearfield, Concert Hall, Cinema IMAX). Moving the sound source slightly forward (+Z axis) creates an immediate natural out-of-head stereo soundstage."
  },
  {
    id: "universal_streamer",
    category: "streaming",
    title: "Universal Link Streamer & Multi-Platform Audio Resolver",
    badge: "All Links",
    summary: "Plays full-length, uncompressed audio directly from Spotify, YouTube, WhatsApp voice/audio, Amazon Music, SoundCloud, and raw web URLs.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="25" fill="#10b981" font-family="monospace" font-size="11" font-weight="700">MULTI-PLATFORM STREAM RESOLVER PIPELINE</text>
        <!-- Platform sources -->
        <rect x="25" y="45" width="85" height="24" rx="4" fill="#1db954" fill-opacity="0.15" stroke="#1db954" stroke-width="1"/>
        <text x="35" y="61" fill="#1db954" font-family="monospace" font-size="9" font-weight="700">SPOTIFY</text>
        <rect x="25" y="75" width="85" height="24" rx="4" fill="#ff0000" fill-opacity="0.15" stroke="#ff0000" stroke-width="1"/>
        <text x="35" y="91" fill="#ff4d4d" font-family="monospace" font-size="9" font-weight="700">YOUTUBE</text>
        <rect x="25" y="105" width="85" height="24" rx="4" fill="#25d366" fill-opacity="0.15" stroke="#25d366" stroke-width="1"/>
        <text x="35" y="121" fill="#25d366" font-family="monospace" font-size="9" font-weight="700">WHATSAPP</text>
        <!-- Stream Engine Node -->
        <path d="M 115 57 L 180 87 M 115 87 L 180 87 M 115 117 L 180 87" stroke="#30363d" stroke-width="1.5"/>
        <rect x="180" y="55" width="150" height="65" rx="6" fill="#161b22" stroke="#58a6ff" stroke-width="1.5"/>
        <text x="195" y="78" fill="#58a6ff" font-family="monospace" font-size="10" font-weight="700">METADATA PARSER</text>
        <text x="195" y="94" fill="#8b949e" font-family="monospace" font-size="8">&amp; CORS STREAM ROUTER</text>
        <text x="195" y="108" fill="#10b981" font-family="monospace" font-size="8">320kbps FULL AUDIO</text>
        <!-- Arrow to Audio Engine -->
        <line x1="335" y1="87" x2="385" y2="87" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
        <rect x="385" y="60" width="115" height="55" rx="6" fill="#00f0ff" fill-opacity="0.1" stroke="#00f0ff" stroke-width="1.5"/>
        <text x="400" y="85" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="700">AURA 32-BIT</text>
        <text x="400" y="100" fill="#7dd3fc" font-family="monospace" font-size="8">DSP ENGINE</text>
      </svg>
    `,
    working: "Analyzes pasted URLs using regex matching for Spotify, YouTube, WhatsApp, SoundCloud, Amazon Music, Google Drive, and raw MP3/FLAC endpoints. For platform share links, it strips tracking queries, extracts track and artist metadata, and routes the request through resilient backend CORS gateways (JioSaavn, Invidious, Cobalt, Netlabels) to stream the 320kbps full-length studio track directly into Web Audio.",
    whyToUse: "You don't have to download audio files or suffer through frustrating 30-second music preview limits. Simply copy a link from WhatsApp, YouTube, or Spotify, paste it into AuraDSP Pro, and immediately experience the track processed through reference-grade studio equalizers.",
    proTip: "You can also paste raw audio URLs ending in .mp3, .wav, .flac, or .m4a directly to play lossless web streams."
  },
  {
    id: "dynamic_enhancers",
    category: "enhancers",
    title: "Dynamic Sound Enhancers Rack",
    badge: "Studio Polish",
    summary: "Four modular analog-modeled DSP processors: Sub-Bass Harmonics, Haas 3D Expander, Center Vocal Clarity, and Dolby Compressor.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#f59e0b" font-family="monospace" font-size="11" font-weight="700">ANALOG DYNAMIC ENHANCERS RACK</text>
        <!-- Module 1: Sub Bass -->
        <rect x="25" y="40" width="110" height="85" rx="6" fill="#161b22" stroke="#f59e0b" stroke-width="1"/>
        <text x="35" y="58" fill="#fbbf24" font-family="monospace" font-size="9" font-weight="700">SUB-BASS</text>
        <circle cx="80" cy="85" r="16" fill="#0d1117" stroke="#f59e0b" stroke-width="2"/>
        <line x1="80" y1="85" x2="90" y2="75" stroke="#fbbf24" stroke-width="2"/>
        <text x="50" y="115" fill="#8b949e" font-family="monospace" font-size="7">HARMONIC SAT</text>
        <!-- Module 2: Haas Width -->
        <rect x="145" y="40" width="110" height="85" rx="6" fill="#161b22" stroke="#00f0ff" stroke-width="1"/>
        <text x="155" y="58" fill="#38bdf8" font-family="monospace" font-size="9" font-weight="700">HAAS 3D</text>
        <circle cx="200" cy="85" r="16" fill="#0d1117" stroke="#00f0ff" stroke-width="2"/>
        <line x1="200" y1="85" x2="212" y2="80" stroke="#38bdf8" stroke-width="2"/>
        <text x="165" y="115" fill="#8b949e" font-family="monospace" font-size="7">STEREO EXPAND</text>
        <!-- Module 3: Vocal Boost -->
        <rect x="265" y="40" width="110" height="85" rx="6" fill="#161b22" stroke="#10b981" stroke-width="1"/>
        <text x="275" y="58" fill="#34d399" font-family="monospace" font-size="9" font-weight="700">VOCAL CLARITY</text>
        <circle cx="320" cy="85" r="16" fill="#0d1117" stroke="#10b981" stroke-width="2"/>
        <line x1="320" y1="85" x2="328" y2="73" stroke="#34d399" stroke-width="2"/>
        <text x="285" y="115" fill="#8b949e" font-family="monospace" font-size="7">CENTER ISOLATE</text>
        <!-- Module 4: Dolby Comp -->
        <rect x="385" y="40" width="110" height="85" rx="6" fill="#161b22" stroke="#a855f7" stroke-width="1"/>
        <text x="395" y="58" fill="#c084fc" font-family="monospace" font-size="9" font-weight="700">DOLBY COMP</text>
        <circle cx="440" cy="85" r="16" fill="#0d1117" stroke="#a855f7" stroke-width="2"/>
        <line x1="440" y1="85" x2="445" y2="70" stroke="#c084fc" stroke-width="2"/>
        <text x="405" y="115" fill="#8b949e" font-family="monospace" font-size="7">PEAK NORMALIZER</text>
      </svg>
    `,
    working: "Consists of 4 distinct DSP circuits: (1) Sub-Bass Harmonic Generator uses polynomial WaveShaper distortion to synthesise higher bass harmonics audible on smaller speakers; (2) Haas Stereo Expander introduces a 10-25ms micro-delay between L/R channels; (3) Vocal Clarity Enhancer uses Mid/Side matrix separation to boost 1-3kHz speech frequencies in the phantom center; (4) Dolby Compressor employs a 4:1 compression ratio with fast 10ms attack to tame harsh peaks.",
    whyToUse: "Takes flat, sterile audio and injects analog warmth, massive stereo separation, crystal-clear song vocals or movie dialogue, and broadcast-grade dynamic punch.",
    proTip: "Keep Haas Delay between 15ms and 22ms for maximum stereo widening without comb-filtering or hollow phase cancellation."
  },
  {
    id: "reference_presets",
    category: "presets",
    title: "Aura Reference Target Presets",
    badge: "Acoustic Curves",
    summary: "Engineered acoustic target profiles including Aura Tuned, Harman Target, Bassheads Ultra, Home Theater 5.1/7.1, and Vocal Focus.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">TARGET CURVE SELECTION &amp; DRIVER PROFILES</text>
        <!-- Curves representation -->
        <path d="M 30 70 Q 120 40, 200 80 T 360 65 T 490 60" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
        <text x="30" y="48" fill="#00f0ff" font-family="monospace" font-size="8">AURA TUNED SIGNATURE</text>
        <path d="M 30 50 Q 100 45, 180 85 T 340 75 T 490 85" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2"/>
        <text x="30" y="105" fill="#f59e0b" font-family="monospace" font-size="8">BASSHEADS ULTRA (+10dB SUB)</text>
        <path d="M 30 85 Q 120 80, 220 80 T 380 75 T 490 70" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2 2"/>
        <text x="30" y="125" fill="#10b981" font-family="monospace" font-size="8">HARMAN AUDIOPHILE REFERENCE</text>
        <!-- Preset pills -->
        <rect x="360" y="45" width="130" height="22" rx="4" fill="#00f0ff" fill-opacity="0.1" stroke="#00f0ff" stroke-width="1"/>
        <text x="375" y="60" fill="#00f0ff" font-family="monospace" font-size="9" font-weight="700">EARBUDS / TWS</text>
        <rect x="360" y="75" width="130" height="22" rx="4" fill="#a855f7" fill-opacity="0.1" stroke="#a855f7" stroke-width="1"/>
        <text x="370" y="90" fill="#c084fc" font-family="monospace" font-size="9" font-weight="700">HOME THEATER 7.1</text>
        <rect x="360" y="105" width="130" height="22" rx="4" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-width="1"/>
        <text x="375" y="120" fill="#6ee7b7" font-family="monospace" font-size="9" font-weight="700">AUDIOPHILE FLAT</text>
      </svg>
    `,
    working: "Applies scientifically calibrated EQ, Haas width, sub-bass harmonics, and limiter settings instantly with a single click. Pre-calibrated presets account for different transducer acoustic impedance, driver sizes, and target listening environments.",
    whyToUse: "Quickly transforms the sound of budget wireless earbuds into punchy, high-definition IEMs, or optimizes laptop speakers to simulate expansive multi-channel surround sound.",
    proTip: "Try 'Aura Bassheads' for electronic and hip-hop music, or 'Harman Audiophile' for classical, acoustic, and vocal jazz recordings."
  },
  {
    id: "god_dsp",
    category: "enhancers",
    title: "Pro DSP Switches (GOD MODE Audio Processors)",
    badge: "Extreme DSP",
    summary: "Heavy-duty macro switches for instant high-octane sonic impact: GodBass, GodClarity, GodSpatial, and GodOtt.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#ef4444" font-family="monospace" font-size="11" font-weight="700">PRO DSP 'GOD MODE' HEAVY-DUTY MACRO SWITCHES</text>
        <!-- 4 Switches -->
        <g transform="translate(30, 45)">
          <rect width="105" height="75" rx="6" fill="#161b22" stroke="#ef4444" stroke-width="1"/>
          <circle cx="20" cy="20" r="4" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)"/>
          <text x="32" y="24" fill="#fff" font-family="monospace" font-size="9" font-weight="700">GOD BASS</text>
          <text x="12" y="50" fill="#8b949e" font-family="monospace" font-size="8">Deep Sub-Harmonics</text>
          <text x="12" y="64" fill="#ef4444" font-family="monospace" font-size="7">30Hz +6dB BOOST</text>
        </g>
        <g transform="translate(150, 45)">
          <rect width="105" height="75" rx="6" fill="#161b22" stroke="#00f0ff" stroke-width="1"/>
          <circle cx="20" cy="20" r="4" fill="#00f0ff" filter="drop-shadow(0 0 4px #00f0ff)"/>
          <text x="32" y="24" fill="#fff" font-family="monospace" font-size="9" font-weight="700">GOD CLARITY</text>
          <text x="12" y="50" fill="#8b949e" font-family="monospace" font-size="8">Ultra Vocal Detail</text>
          <text x="12" y="64" fill="#00f0ff" font-family="monospace" font-size="7">8kHz TRANSIENT AIR</text>
        </g>
        <g transform="translate(270, 45)">
          <rect width="105" height="75" rx="6" fill="#161b22" stroke="#a855f7" stroke-width="1"/>
          <circle cx="20" cy="20" r="4" fill="#a855f7" filter="drop-shadow(0 0 4px #a855f7)"/>
          <text x="32" y="24" fill="#fff" font-family="monospace" font-size="9" font-weight="700">GOD SPATIAL</text>
          <text x="12" y="50" fill="#8b949e" font-family="monospace" font-size="8">360° IMAX Stage</text>
          <text x="12" y="64" fill="#a855f7" font-family="monospace" font-size="7">MAX HAAS WIDTH</text>
        </g>
        <g transform="translate(390, 45)">
          <rect width="105" height="75" rx="6" fill="#161b22" stroke="#f59e0b" stroke-width="1"/>
          <circle cx="20" cy="20" r="4" fill="#f59e0b" filter="drop-shadow(0 0 4px #f59e0b)"/>
          <text x="32" y="24" fill="#fff" font-family="monospace" font-size="9" font-weight="700">GOD OTT</text>
          <text x="12" y="50" fill="#8b949e" font-family="monospace" font-size="8">Over-The-Top Comp</text>
          <text x="12" y="64" fill="#f59e0b" font-family="monospace" font-size="7">UP/DOWN MULTIBAND</text>
        </g>
      </svg>
    `,
    working: "God Mode switches engage multi-node DSP macros: GodBass activates a dedicated 35Hz resonant filter with asymmetric tube saturation; GodClarity activates an 8kHz exciter; GodSpatial maximizes Haas delay while engaging HRTF elevation; GodOTT engages aggressive upward/downward multiband dynamics inspired by EDM studio mastering.",
    whyToUse: "Perfect for movies, EDM, gaming, and parties when you want extreme physical energy without tedious tweaking.",
    proTip: "Combine [GodBass] and [GodSpatial] when watching action movies or playing FPS games for cinematic explosive impact."
  },
  {
    id: "ab_monitoring",
    category: "mastering",
    title: "A/B Reference Monitoring & Snapshot Memory (A / B / C / D)",
    badge: "Studio Reference",
    summary: "Instant non-destructive dry vs. wet comparison and 4-slot DSP configuration memory bank.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#eab308" font-family="monospace" font-size="11" font-weight="700">A/B DRY REFERENCE ROUTING &amp; 4-SLOT SNAPSHOT RECALL</text>
        <!-- A/B comparison toggle -->
        <rect x="30" y="45" width="180" height="70" rx="6" fill="#161b22" stroke="#eab308" stroke-width="1"/>
        <text x="45" y="70" fill="#eab308" font-family="monospace" font-size="10" font-weight="700">A/B REFERENCE MONITOR</text>
        <rect x="45" y="82" width="70" height="22" rx="4" fill="#eab308" fill-opacity="0.2"/>
        <text x="55" y="96" fill="#eab308" font-family="monospace" font-size="8" font-weight="700">DRY REF</text>
        <rect x="125" y="82" width="70" height="22" rx="4" fill="#00f0ff" fill-opacity="0.2"/>
        <text x="135" y="96" fill="#00f0ff" font-family="monospace" font-size="8" font-weight="700">PROCESSED</text>
        <!-- Snapshots A B C D -->
        <rect x="230" y="45" width="260" height="70" rx="6" fill="#161b22" stroke="#58a6ff" stroke-width="1"/>
        <text x="245" y="68" fill="#58a6ff" font-family="monospace" font-size="10" font-weight="700">SNAPSHOT MEMORY BANKS</text>
        <g transform="translate(245, 80)">
          <rect width="45" height="24" rx="4" fill="#00f0ff" fill-opacity="0.3" stroke="#00f0ff" stroke-width="1"/>
          <text x="18" y="16" fill="#fff" font-family="monospace" font-size="10" font-weight="700">A</text>
          <rect x="55" width="45" height="24" rx="4" fill="#21262d" stroke="#30363d" stroke-width="1"/>
          <text x="73" y="16" fill="#8b949e" font-family="monospace" font-size="10" font-weight="700">B</text>
          <rect x="110" width="45" height="24" rx="4" fill="#21262d" stroke="#30363d" stroke-width="1"/>
          <text x="128" y="16" fill="#8b949e" font-family="monospace" font-size="10" font-weight="700">C</text>
          <rect x="165" width="45" height="24" rx="4" fill="#21262d" stroke="#30363d" stroke-width="1"/>
          <text x="183" y="16" fill="#8b949e" font-family="monospace" font-size="10" font-weight="700">D</text>
        </g>
      </svg>
    `,
    working: "The A/B Monitor switch instantly diverts the audio signal around all Biquad filters, spatial panners, and compressors to output the raw original track without stopping playback. The Snapshot memory (A, B, C, D) saves full 10-band states, enhancer knobs, and 3D coordinates in RAM.",
    whyToUse: "Psychoacoustic ear adaptation often tricks listeners into thinking 'louder is better'. A/B monitoring allows you to switch back and forth instantly to confirm your tuning genuinely improves clarity, depth, and fidelity without bias.",
    proTip: "Save your favorite gaming profile in Slot A and your vocal music profile in Slot B to switch between them instantly."
  },
  {
    id: "spectrum_visualizer",
    category: "mastering",
    title: "144Hz / 240Hz High Refresh Rate Spectrum Visualizer",
    badge: "144Hz / 240Hz",
    summary: "Ultra-responsive real-time frequency bar and oscilloscope waveform monitor operating at up to 240 frames per second.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#00f0ff" font-family="monospace" font-size="11" font-weight="700">HIGH-REFRESH HARDWARE SPECTRUM ANALYZER</text>
        <rect x="420" y="14" width="75" height="18" rx="4" fill="#00f0ff" fill-opacity="0.15" stroke="#00f0ff" stroke-width="1"/>
        <text x="430" y="27" fill="#00f0ff" font-family="monospace" font-size="9" font-weight="700">144 / 240 FPS</text>
        <!-- Spectrum bars -->
        <g transform="translate(30, 45)" fill="#00f0ff">
          <rect x="0" y="30" width="8" height="50" rx="2" fill-opacity="0.9"/>
          <rect x="14" y="15" width="8" height="65" rx="2" fill-opacity="0.85"/>
          <rect x="28" y="8" width="8" height="72" rx="2" fill-opacity="0.9"/>
          <rect x="42" y="25" width="8" height="55" rx="2" fill-opacity="0.8"/>
          <rect x="56" y="35" width="8" height="45" rx="2" fill-opacity="0.75"/>
          <rect x="70" y="20" width="8" height="60" rx="2" fill-opacity="0.85"/>
          <rect x="84" y="40" width="8" height="40" rx="2" fill-opacity="0.7"/>
          <rect x="98" y="18" width="8" height="62" rx="2" fill-opacity="0.85"/>
          <rect x="112" y="30" width="8" height="50" rx="2" fill-opacity="0.8"/>
          <rect x="126" y="45" width="8" height="35" rx="2" fill-opacity="0.7"/>
          <rect x="140" y="55" width="8" height="25" rx="2" fill-opacity="0.6"/>
          <rect x="154" y="65" width="8" height="15" rx="2" fill-opacity="0.5"/>
        </g>
        <!-- Oscilloscope Waveform on right -->
        <path d="M 220 80 Q 240 40, 260 80 T 300 80 T 340 50 T 380 100 T 420 70 T 480 80" fill="none" stroke="#a855f7" stroke-width="2.5"/>
        <text x="220" y="40" fill="#a855f7" font-family="monospace" font-size="9">OSCILLOSCOPE TIME DOMAIN</text>
      </svg>
    `,
    working: "Directly queries AnalyserNode.getByteFrequencyData() and getByteTimeDomainData() using pre-allocated typed arrays (Uint8Array and Float32Array). The render loop is tied directly to the browser's hardware display refresh rate, delivering ultra-fluid visual feedback at 60Hz, 144Hz, or 240Hz without garbage collection stutter.",
    whyToUse: "Visualizes exactly what your ears are hearing in real time, making it effortless to identify resonance spikes, bass overloading, or clipping.",
    proTip: "Watch the leftmost bass bars while adjusting 31Hz and 62Hz to see how Sub-Bass harmonics light up the low end."
  },
  {
    id: "master_limiter",
    category: "mastering",
    title: "Master Limiter, Stereo VU Meters & LUFS Loudness Metering",
    badge: "Broadcast Master",
    summary: "Precision true-peak limiter and loudness normalization calibrated for Spotify (-14 LUFS), Apple Music (-16 LUFS), and CD (-9 LUFS).",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#10b981" font-family="monospace" font-size="11" font-weight="700">MASTER TRUE-PEAK LIMITER &amp; LUFS NORMALIZER</text>
        <!-- VU Meters -->
        <g transform="translate(30, 45)">
          <text x="0" y="15" fill="#8b949e" font-family="monospace" font-size="9">LEFT VU</text>
          <rect x="0" y="22" width="180" height="10" rx="3" fill="#161b22" stroke="#21262d"/>
          <rect x="2" y="24" width="140" height="6" rx="2" fill="#10b981"/>
          <text x="0" y="48" fill="#8b949e" font-family="monospace" font-size="9">RIGHT VU</text>
          <rect x="0" y="55" width="180" height="10" rx="3" fill="#161b22" stroke="#21262d"/>
          <rect x="2" y="57" width="135" height="6" rx="2" fill="#10b981"/>
        </g>
        <!-- LUFS presets -->
        <g transform="translate(240, 45)">
          <text x="0" y="15" fill="#58a6ff" font-family="monospace" font-size="9" font-weight="700">STREAMING TARGET LUFS</text>
          <rect x="0" y="25" width="120" height="22" rx="4" fill="#161b22" stroke="#10b981" stroke-width="1"/>
          <text x="10" y="40" fill="#10b981" font-family="monospace" font-size="8">-14 LUFS (SPOTIFY/YT)</text>
          <rect x="130" y="25" width="120" height="22" rx="4" fill="#161b22" stroke="#388bfd" stroke-width="1"/>
          <text x="140" y="40" fill="#58a6ff" font-family="monospace" font-size="8">-16 LUFS (APPLE MUSIC)</text>
          <rect x="0" y="52" width="120" height="22" rx="4" fill="#161b22" stroke="#f59e0b" stroke-width="1"/>
          <text x="10" y="67" fill="#fbbf24" font-family="monospace" font-size="8">-9 LUFS (CD MASTER)</text>
          <rect x="130" y="52" width="120" height="22" rx="4" fill="#161b22" stroke="#a855f7" stroke-width="1"/>
          <text x="140" y="67" fill="#c084fc" font-family="monospace" font-size="8">-24 LUFS (BROADCAST)</text>
        </g>
      </svg>
    `,
    working: "Applies a brickwall limiter at the final master output stage with zero lookahead latency. If cumulative EQ boosts exceed 0dBFS, the limiter clamps the signal smoothly to prevent digital harshness. The Target Loudness control recalculates overall pre-gain to hit standard streaming loudness targets.",
    whyToUse: "Prevents blown speaker cones, buzzing earbud drivers, and distorted sound when you apply heavy bass or treble boosts, keeping music clear and consistent.",
    proTip: "Keep Target Loudness set to -14 LUFS for modern streaming, or select -9 LUFS if you want maximum punch and volume for club and party playlists."
  },
  {
    id: "audio_vaults",
    category: "streaming",
    title: "Local Audio Files & Lossless Streaming Master Archives",
    badge: "Lossless Audio",
    summary: "Instant drag-and-drop local file player (FLAC/WAV/MP3) paired with 320,000+ lossless Netlabels and Live Concert archives.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#00f0ff" font-family="monospace" font-size="11" font-weight="700">LOSSLESS LOCAL PLAYBACK &amp; ARCHIVE REPOSITORIES</text>
        <!-- Drag drop card -->
        <rect x="30" y="45" width="220" height="70" rx="6" fill="#161b22" stroke="#00f0ff" stroke-width="1" stroke-dasharray="4 3"/>
        <text x="50" y="75" fill="#00f0ff" font-family="monospace" font-size="10" font-weight="700">DRAG &amp; DROP AUDIO FILES</text>
        <text x="50" y="92" fill="#8b949e" font-family="monospace" font-size="8">Lossless FLAC, WAV, MP3, AAC</text>
        <!-- Online vaults -->
        <rect x="270" y="45" width="220" height="70" rx="6" fill="#161b22" stroke="#a855f7" stroke-width="1"/>
        <text x="285" y="70" fill="#c084fc" font-family="monospace" font-size="10" font-weight="700">ARCHIVE.ORG HI-FI VAULT</text>
        <text x="285" y="86" fill="#8b949e" font-family="monospace" font-size="8">70,000+ Netlabel Studio Releases</text>
        <text x="285" y="100" fill="#10b981" font-family="monospace" font-size="8">250,000+ Live Concert Soundboards</text>
      </svg>
    `,
    working: "Uses the HTML5 File API and Web Audio decodeAudioData() for 100% offline, zero-latency playback of your local audio library. Also connects directly to the Internet Archive's Open Audio API to stream 320kbps full-length studio releases and live soundboards.",
    whyToUse: "Test your tuned headphone and home theater settings using pristine, uncompressed master recordings without Spotify compression or internet buffering.",
    proTip: "Try searching 'electronic' or 'acoustic' in the Netlabels tab to discover high-fidelity studio test tracks."
  },
  {
    id: "theme_customizer",
    category: "presets",
    title: "Studio Visual Themes & Typography",
    badge: "Ergonomics",
    summary: "Switch between Dark Studio, Obsidian OLED, and Graphite themes, plus customize studio typography for maximum visual comfort.",
    svgDiagram: `
      <svg viewBox="0 0 520 140" class="manual-diagram-svg">
        <rect width="520" height="140" rx="10" fill="#0d1117" stroke="#21262d" stroke-width="1.5"/>
        <text x="24" y="24" fill="#a855f7" font-family="monospace" font-size="11" font-weight="700">STUDIO HARDWARE THEMES &amp; HIGH-CONTRAST PALETTES</text>
        <!-- Theme 1 -->
        <g transform="translate(30, 45)">
          <rect width="140" height="70" rx="6" fill="#0d1117" stroke="#00f0ff" stroke-width="1.5"/>
          <text x="15" y="30" fill="#00f0ff" font-family="monospace" font-size="9" font-weight="700">DARK STUDIO</text>
          <text x="15" y="48" fill="#8b949e" font-family="monospace" font-size="8">Reference Blue/Cyan</text>
          <circle cx="15" cy="58" r="4" fill="#00f0ff"/>
        </g>
        <!-- Theme 2 -->
        <g transform="translate(190, 45)">
          <rect width="140" height="70" rx="6" fill="#000000" stroke="#30363d" stroke-width="1.5"/>
          <text x="15" y="30" fill="#fff" font-family="monospace" font-size="9" font-weight="700">OBSIDIAN OLED</text>
          <text x="15" y="48" fill="#8b949e" font-family="monospace" font-size="8">Pure #000000 Black</text>
          <circle cx="15" cy="58" r="4" fill="#ffffff"/>
        </g>
        <!-- Theme 3 -->
        <g transform="translate(350, 45)">
          <rect width="140" height="70" rx="6" fill="#1c1f26" stroke="#484f58" stroke-width="1.5"/>
          <text x="15" y="30" fill="#d1d5db" font-family="monospace" font-size="9" font-weight="700">GRAPHITE GREY</text>
          <text x="15" y="48" fill="#8b949e" font-family="monospace" font-size="8">Neutral Matte Studio</text>
          <circle cx="15" cy="58" r="4" fill="#9ca3af"/>
        </g>
      </svg>
    `,
    working: "Instantly swaps CSS root variables for hardware panel backgrounds, border glows, accent cyan/amber/emerald tones, and font families with zero page reloads. Selections are stored persistently in localStorage.",
    whyToUse: "Reduces visual fatigue during extended listening or audio mastering sessions, and optimizes battery life on mobile OLED displays.",
    proTip: "Select 'Obsidian OLED' on mobile devices or laptops with OLED displays for deep blacks and battery savings."
  }
];

if (typeof window !== 'undefined') {
  window.MANUAL_QUICK_START = MANUAL_QUICK_START;
  window.MANUAL_FEATURES = MANUAL_FEATURES;
}

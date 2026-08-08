/**
 * AuraDSP Presets Database - Expanded Edition
 * Frequency Bands: [31Hz, 62Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz]
 * Each preset drives: eq[], subBass, haasWidth, haasDelay, dolbyComp, compThreshold, compRatio,
 *                     vocalBoost, reverb, reverbPreset, reverbWet, spatialBoost
 */

const AUDIO_PRESETS = {
  boat: [
    {
      id: "boat_signature",
      name: "boAt Signature Sound",
      desc: "Deep punchy bass + crisp highs tuned for boAt Rockerz & Airdopes",
      badge: "boAt TUNED",
      eq: [6.0, 5.5, 3.5, 1.0, 0.0, 1.5, 2.5, 4.0, 4.5, 5.0],
      subBass: 5.0, haasWidth: 65, haasDelay: 18,
      dolbyComp: true, compThreshold: -24, compRatio: 4,
      vocalBoost: 2.0, reverb: false, spatialBoost: 3
    },
    {
      id: "boat_bassheads",
      name: "boAt Bassheads Ultra Boost",
      desc: "Extreme 30Hz-120Hz sub-woofer rumble & heavy kick impact",
      badge: "EXTRA BASS",
      eq: [10.0, 9.0, 6.5, 3.0, 0.5, -1.0, 0.0, 2.0, 3.0, 3.5],
      subBass: 9.5, haasWidth: 50, haasDelay: 12,
      dolbyComp: true, compThreshold: -20, compRatio: 5,
      vocalBoost: 0.0, reverb: false, spatialBoost: 4
    },
    {
      id: "boat_gaming",
      name: "boAt Beast™ Low-Latency Gaming",
      desc: "Enhanced footsteps, spatial directional cues & gunshot clarity",
      badge: "GAME MODE",
      eq: [-2.0, -1.0, 1.0, 3.0, 4.5, 5.0, 6.0, 5.5, 4.0, 3.0],
      subBass: 2.0, haasWidth: 85, haasDelay: 22,
      dolbyComp: true, compThreshold: -28, compRatio: 3,
      vocalBoost: 4.5, reverb: false, spatialBoost: 5
    },
    {
      id: "boat_stone_bar",
      name: "boAt Stone Soundbar Mode",
      desc: "Wide soundstage & room-filling bass for boAt Bluetooth soundbars",
      badge: "SOUNDBAR",
      eq: [7.5, 6.0, 4.0, 2.0, 1.0, 2.0, 3.5, 5.0, 6.0, 6.5],
      subBass: 6.0, haasWidth: 90, haasDelay: 25,
      dolbyComp: true, compThreshold: -22, compRatio: 4,
      vocalBoost: 3.0, reverb: true, reverbPreset: "studio", reverbWet: 15, spatialBoost: 4
    },
    {
      id: "boat_party",
      name: "boAt Party Blast",
      desc: "Maximum loudness & hypnotic bass pumping for parties",
      badge: "PARTY",
      eq: [9.0, 8.0, 7.0, 4.0, 1.5, 0.0, 2.5, 5.0, 6.0, 7.0],
      subBass: 8.0, haasWidth: 75, haasDelay: 20,
      dolbyComp: true, compThreshold: -18, compRatio: 6,
      vocalBoost: 1.5, reverb: true, reverbPreset: "stadium", reverbWet: 20, spatialBoost: 5
    },
    {
      id: "boat_rock",
      name: "boAt Rock & Metal Crunch",
      desc: "Guitar crunch, drum impact & high-gain distortion clarity",
      badge: "ROCK",
      eq: [5.0, 4.0, 2.0, -1.0, 1.0, 3.5, 5.0, 6.5, 5.5, 4.5],
      subBass: 4.0, haasWidth: 70, haasDelay: 18,
      dolbyComp: true, compThreshold: -26, compRatio: 4,
      vocalBoost: 3.5, reverb: false, spatialBoost: 3
    },
    {
      id: "boat_hiphop",
      name: "boAt Hip-Hop & Trap",
      desc: "Booming 808 bass, snappy snares & spacious hi-hat rolls",
      badge: "HIP-HOP",
      eq: [8.5, 7.5, 5.0, 2.5, -0.5, -1.0, 1.5, 3.0, 3.5, 4.0],
    },
    {
      id: "boat_acoustic",
      name: "boAt Acoustic & Live",
      desc: "Sparkling string details & live concert presence",
      badge: "ACOUSTIC",
      eq: [2.0, 1.5, 2.5, 3.0, 1.0, 2.0, 4.0, 5.5, 6.0, 5.0],
      subBass: 1.5, haasWidth: 80, haasDelay: 20,
      dolbyComp: false, compThreshold: -28, compRatio: 2,
      vocalBoost: 4.0, reverb: true, reverbPreset: "studio", reverbWet: 15, spatialBoost: 4
    },
    {
      id: "boat_podcast",
      name: "boAt Podcast & Vocal",
      desc: "Maximum speech intelligibility and reduced fatigue for long listening",
      badge: "PODCAST",
      eq: [-3.0, -2.0, -1.0, 1.5, 4.5, 5.0, 3.5, 1.5, -1.0, -2.0],
      subBass: -2.0, haasWidth: 40, haasDelay: 10,
      dolbyComp: true, compThreshold: -32, compRatio: 6,
      vocalBoost: 5.5, reverb: false, spatialBoost: 2
    },
    {
      id: "boat_workout",
      name: "boAt Workout Hype",
      desc: "High energy, adrenaline-pumping bass and piercing highs",
      badge: "WORKOUT",
      eq: [9.5, 8.0, 6.0, 2.0, -1.5, 1.0, 3.0, 5.5, 7.0, 6.5],
      subBass: 9.0, haasWidth: 65, haasDelay: 16,
      dolbyComp: true, compThreshold: -18, compRatio: 7,
      vocalBoost: 1.5, reverb: false, spatialBoost: 5
    }
  ],

  earbuds: [
    {
      id: "earbud_spatial_3d",
      name: "Binaural 3D Spatial Surround",
      desc: "Full HRTF 3D head-tracked acoustic virtualization for TWS earbuds",
      badge: "3D BINAURAL",
      eq: [3.0, 2.5, 2.0, 1.0, 1.5, 2.5, 4.0, 4.5, 5.0, 6.0],
      subBass: 3.5, haasWidth: 95, haasDelay: 28,
      dolbyComp: true, compThreshold: -28, compRatio: 3,
      vocalBoost: 2.5, reverb: false, spatialBoost: 6
    },
    {
      id: "earbud_anc_dampen",
      name: "In-Ear Acoustic Seal Enhancer",
      desc: "Compensates for ear-canal resonance & boosts sub-frequencies",
      badge: "EAR SEAL",
      eq: [5.5, 4.5, 2.0, -1.0, -1.5, 0.5, 2.0, 3.5, 4.0, 3.0],
      subBass: 4.5, haasWidth: 60, haasDelay: 16,
      dolbyComp: true, compThreshold: -26, compRatio: 4,
      vocalBoost: 2.0, reverb: false, spatialBoost: 3
    },
    {
      id: "earbud_vocal_clarity",
      name: "Crystal Vocal & Podcast",
      desc: "Isolates speech intelligibility band for clean dialogues & audiobooks",
      badge: "VOCAL BOOST",
      eq: [-4.0, -3.0, -1.0, 1.5, 4.0, 6.0, 5.5, 3.5, 1.5, 0.0],
      subBass: 0.0, haasWidth: 40, haasDelay: 10,
      dolbyComp: true, compThreshold: -32, compRatio: 8,
      vocalBoost: 6.0, reverb: false, spatialBoost: 2
    },
    {
      id: "earbud_edm",
      name: "EDM & Electronic Pulse",
      desc: "Thundering drops, synth stabs & wide stereo field for electronic music",
      badge: "EDM",
      eq: [7.0, 6.0, 4.5, 1.5, -0.5, 0.5, 3.5, 5.0, 5.5, 6.0],
      subBass: 7.5, haasWidth: 90, haasDelay: 25,
      dolbyComp: true, compThreshold: -20, compRatio: 5,
      vocalBoost: 1.0, reverb: false, spatialBoost: 5
    },
    {
      id: "earbud_jazz",
      name: "Jazz & Acoustic Sessions",
      desc: "Warm low-mids, silky highs and intimate studio presence",
      badge: "JAZZ",
      eq: [2.0, 3.0, 4.0, 2.5, 1.0, 0.5, -0.5, 1.0, 2.0, 1.5],
      subBass: 2.0, haasWidth: 50, haasDelay: 14,
      dolbyComp: false, compThreshold: -24, compRatio: 2,
      vocalBoost: 3.0, reverb: true, reverbPreset: "studio", reverbWet: 20, spatialBoost: 3
    },
    {
      id: "earbud_sleep",
      name: "Sleep & Meditation",
      desc: "Ultra-smooth frequencies for calm listening & focus sessions",
      badge: "RELAX",
      eq: [1.0, 1.5, 2.0, 1.0, 0.5, -0.5, -1.0, -1.5, -2.0, -2.5],
      subBass: 1.0, haasWidth: 30, haasDelay: 8,
      dolbyComp: false, compThreshold: -40, compRatio: 2,
      vocalBoost: 1.5, reverb: true, reverbPreset: "studio", reverbWet: 35, spatialBoost: 2
    },
    {
      id: "earbud_commute",
      name: "Commute Loudness Maximizer",
      desc: "Cuts through ambient transport noise with maximized loudness & punch",
      badge: "COMMUTE",
      eq: [6.0, 5.0, 2.0, 0.5, 1.5, 3.0, 4.5, 5.5, 4.5, 4.0],
      subBass: 5.5, haasWidth: 55, haasDelay: 14,
      dolbyComp: true, compThreshold: -16, compRatio: 7,
      vocalBoost: 4.0, reverb: false, spatialBoost: 4
    },
    {
      id: "earbud_transparency",
      name: "Open-Back Transparency",
      desc: "Simulates an open-back headphone feel with airy, natural acoustics",
      badge: "AIRY",
      eq: [-2.0, -1.0, 0.0, 1.0, 2.5, 3.5, 5.0, 6.0, 7.5, 8.5],
      subBass: -1.0, haasWidth: 100, haasDelay: 25,
      dolbyComp: false, compThreshold: -24, compRatio: 2,
      vocalBoost: 2.0, reverb: true, reverbPreset: "studio", reverbWet: 20, spatialBoost: 4
    },
    {
      id: "earbud_lofi",
      name: "Lo-Fi Hip Hop Chill",
      desc: "Vintage warmth, heavy mid-bass bounce, and rolled-off treble",
      badge: "LO-FI",
      eq: [6.5, 7.5, 6.0, 4.0, 2.0, -0.5, -2.0, -3.5, -4.5, -5.0],
      subBass: 7.0, haasWidth: 50, haasDelay: 12,
      dolbyComp: true, compThreshold: -26, compRatio: 5,
      vocalBoost: 1.0, reverb: true, reverbPreset: "studio", reverbWet: 30, spatialBoost: 3
    },
    {
      id: "earbud_asmr",
      name: "ASMR Detail Enhancer",
      desc: "Ultra-wide stereo, extreme high-frequency clarity and whisper focus",
      badge: "ASMR",
      eq: [1.0, 1.0, 1.5, 2.0, 3.0, 5.5, 7.0, 8.5, 9.5, 10.0],
      subBass: 1.0, haasWidth: 100, haasDelay: 35,
      dolbyComp: true, compThreshold: -35, compRatio: 8,
      vocalBoost: 6.5, reverb: false, spatialBoost: 6
    }
  ],

  hometheater: [
    {
      id: "ht_dolby_71",
      name: "Dolby Atmos 7.1 Virtual Theater",
      desc: "Full cinematic dynamic range, center dialogue focus & LFE subwoofer upmix",
      badge: "DOLBY 7.1",
      eq: [8.0, 7.0, 4.5, 1.5, 1.0, 3.0, 4.0, 5.5, 6.5, 7.5],
      subBass: 7.0, haasWidth: 100, haasDelay: 30,
      dolbyComp: true, compThreshold: -22, compRatio: 4,
      vocalBoost: 4.0, reverb: true, reverbPreset: "cinema", reverbWet: 30, spatialBoost: 6
    },
    {
      id: "ht_night_mode",
      name: "Dolby Night Dialogue Protect",
      desc: "Compresses loud action while keeping whisper dialogue crystal clear",
      badge: "NIGHT MODE",
      eq: [1.0, 1.0, 2.0, 3.0, 4.5, 5.0, 4.0, 2.5, 1.0, -1.0],
      subBass: 2.0, haasWidth: 70, haasDelay: 18,
      dolbyComp: true, compThreshold: -32, compRatio: 8,
      vocalBoost: 5.0, reverb: false, spatialBoost: 2
    },
    {
      id: "ht_action_blockbuster",
      name: "Cinematic Action & Explosions",
      desc: "Massive sub-bass impact with high dynamic punch for AV receivers",
      badge: "BLOCKBUSTER",
      eq: [9.0, 8.5, 6.0, 2.0, 0.5, 2.0, 3.5, 5.0, 6.5, 7.0],
      subBass: 8.5, haasWidth: 90, haasDelay: 28,
      dolbyComp: true, compThreshold: -20, compRatio: 5,
      vocalBoost: 2.5, reverb: true, reverbPreset: "cinema", reverbWet: 20, spatialBoost: 5
    },
    {
      id: "ht_music_concert",
      name: "Stadium Concert Hall",
      desc: "Feel like front-row at a live concert with massive stage width & reverb",
      badge: "CONCERT",
      eq: [5.0, 4.5, 3.0, 2.0, 2.5, 3.5, 4.5, 5.5, 6.0, 6.5],
      subBass: 5.0, haasWidth: 100, haasDelay: 35,
      dolbyComp: true, compThreshold: -24, compRatio: 3,
      vocalBoost: 3.5, reverb: true, reverbPreset: "stadium", reverbWet: 45, spatialBoost: 6
    },
    {
      id: "ht_sport",
      name: "Sports Arena Commentary",
      desc: "Crowd energy, punchy mid-bass & razor-sharp commentary vocals",
      badge: "SPORTS",
      eq: [4.0, 3.5, 2.5, 2.0, 3.5, 5.0, 4.5, 3.5, 3.0, 2.5],
      subBass: 3.5, haasWidth: 80, haasDelay: 20,
      dolbyComp: true, compThreshold: -26, compRatio: 4,
      vocalBoost: 5.5, reverb: true, reverbPreset: "stadium", reverbWet: 25, spatialBoost: 5
    },
    {
      id: "ht_surround_51",
      name: "DTS 5.1 Surround Virtualize",
      desc: "Discrete 5.1 channel virtualization with front-wide & rear image cues",
      badge: "DTS 5.1",
      eq: [6.5, 5.5, 3.0, 1.0, 1.5, 2.5, 3.5, 5.0, 6.0, 7.0],
      subBass: 6.0, haasWidth: 95, haasDelay: 32,
      dolbyComp: true, compThreshold: -22, compRatio: 4,
      vocalBoost: 3.0, reverb: true, reverbPreset: "cinema", reverbWet: 22, spatialBoost: 6
    },
    {
      id: "ht_imax",
      name: "IMAX Enhanced Mode",
      desc: "Reference-grade ultra-wide dynamic range for premium AV systems",
      badge: "IMAX",
      eq: [7.0, 6.0, 4.0, 1.5, 0.5, 2.0, 4.0, 6.0, 7.0, 8.0],
      subBass: 7.5, haasWidth: 100, haasDelay: 35,
      dolbyComp: true, compThreshold: -18, compRatio: 3,
      vocalBoost: 4.5, reverb: true, reverbPreset: "cinema", reverbWet: 28, spatialBoost: 7
    },
    {
      id: "ht_midnight",
      name: "Midnight Binge TV",
      desc: "Zero subwoofer rumble, hyper-compressed dynamics so you don't wake the house",
      badge: "LATE NIGHT",
      eq: [-6.0, -4.0, -2.0, 1.0, 3.5, 4.5, 3.5, 2.0, 0.0, -2.0],
      subBass: -8.0, haasWidth: 40, haasDelay: 10,
      dolbyComp: true, compThreshold: -40, compRatio: 12,
      vocalBoost: 6.0, reverb: false, spatialBoost: 1
    },
    {
      id: "ht_vintage_film",
      name: "Vintage 35mm Film Audio",
      desc: "Simulates classic cinema sound with prominent midrange and warm distortion",
      badge: "CLASSIC",
      eq: [-3.0, -1.0, 2.5, 4.0, 5.5, 4.5, 2.0, -1.0, -3.0, -5.0],
      subBass: 0.0, haasWidth: 30, haasDelay: 8,
      dolbyComp: true, compThreshold: -24, compRatio: 6,
      vocalBoost: 4.0, reverb: true, reverbPreset: "cinema", reverbWet: 15, spatialBoost: 3
    },
    {
      id: "ht_scifi",
      name: "Massive Sci-Fi Epic",
      desc: "Wall-shaking LFE rumble and immense alien soundscapes",
      badge: "SCI-FI",
      eq: [10.0, 9.0, 6.0, 2.0, 0.0, 1.5, 4.0, 6.0, 7.5, 8.5],
      subBass: 10.0, haasWidth: 100, haasDelay: 40,
      dolbyComp: true, compThreshold: -20, compRatio: 5,
      vocalBoost: 3.0, reverb: true, reverbPreset: "cinema", reverbWet: 35, spatialBoost: 8
    }
  ],

  custom: [
    {
      id: "custom_flat",
      name: "Studio Reference Flat",
      desc: "Unmodified original audio signal pass-through – zero coloration",
      badge: "FLAT",
      eq: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      subBass: 0.0, haasWidth: 0, haasDelay: 0,
      dolbyComp: false, compThreshold: -24, compRatio: 1,
      vocalBoost: 0.0, reverb: false, spatialBoost: 0
    },
    {
      id: "custom_warm",
      name: "Warm & Smooth",
      desc: "Gentle bass roll-off & soft high-end for fatigue-free long listening",
      badge: "WARM",
      eq: [3.5, 3.0, 2.5, 1.5, 0.5, 0.0, -0.5, -1.0, -1.5, -2.0],
      subBass: 2.5, haasWidth: 45, haasDelay: 12,
      dolbyComp: false, compThreshold: -30, compRatio: 2,
      vocalBoost: 2.0, reverb: true, reverbPreset: "studio", reverbWet: 15, spatialBoost: 2
    },
    {
      id: "custom_bright",
      name: "Bright & Analytical",
      desc: "Extended treble detail for critical mastering & studio monitoring",
      badge: "BRIGHT",
      eq: [-1.0, -0.5, 0.0, 0.5, 1.0, 2.0, 3.5, 5.0, 6.5, 8.0],
      subBass: 0.5, haasWidth: 55, haasDelay: 14,
      dolbyComp: false, compThreshold: -28, compRatio: 2,
      vocalBoost: 1.5, reverb: false, spatialBoost: 2
    },
    {
      id: "custom_loudness",
      name: "Loudness Maximizer",
      desc: "Push every watt for maximum perceived loudness without clipping",
      badge: "MAX VOL",
      eq: [7.0, 5.5, 2.5, 0.5, 0.5, 1.5, 3.0, 4.5, 5.5, 6.5],
      subBass: 7.0, haasWidth: 70, haasDelay: 18,
      dolbyComp: true, compThreshold: -16, compRatio: 8,
      vocalBoost: 2.5, reverb: false, spatialBoost: 6
    },
    {
      id: "custom_vocal_forward",
      name: "Vocal Forward",
      desc: "Pushes the lead singer to the very front of the mix",
      badge: "VOCAL",
      eq: [-1.0, -0.5, 0.5, 2.5, 5.0, 6.5, 4.5, 2.0, 0.5, 0.0],
      subBass: 0.0, haasWidth: 50, haasDelay: 12,
      dolbyComp: true, compThreshold: -28, compRatio: 4,
      vocalBoost: 7.0, reverb: false, spatialBoost: 3
    },
    {
      id: "custom_v_shape",
      name: "V-Shape Smile",
      desc: "Classic fun EQ: Scooped mids with thumping bass and sparkling treble",
      badge: "V-SHAPE",
      eq: [8.0, 6.5, 4.0, 1.0, -2.5, -2.0, 1.5, 4.5, 6.5, 8.0],
      subBass: 7.5, haasWidth: 80, haasDelay: 22,
      dolbyComp: true, compThreshold: -24, compRatio: 3,
      vocalBoost: 0.0, reverb: false, spatialBoost: 5
    },
    {
      id: "custom_mid_centric",
      name: "Mid-Centric Vintage",
      desc: "Focused purely on guitars, keys, and vocals for a retro feel",
      badge: "RETRO",
      eq: [-4.0, -2.0, 1.5, 3.5, 5.5, 4.5, 2.5, 0.0, -2.5, -4.5],
      subBass: 0.0, haasWidth: 40, haasDelay: 10,
      dolbyComp: false, compThreshold: -24, compRatio: 2,
      vocalBoost: 3.5, reverb: false, spatialBoost: 2
    }
  ]
};

const FREQ_BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

/**
 * AuraDSP Pro - AutoEQ Headphone & Earbud Calibration Database
 * Calibrated 10-Band Harman/Oratory1990 Target Curves
 * Frequency bands: [31Hz, 62Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz]
 */

const AUTOEQ_DATABASE = [
  // --- SONY ---
  {
    id: "sony_wh1000xm5",
    brand: "Sony",
    model: "WH-1000XM5",
    type: "Over-Ear Wireless ANC",
    eq: [-4.5, -3.0, -2.0, -1.0, 0.5, 1.5, 2.5, 3.5, -2.0, 1.5],
    desc: "Tames bloated upper-bass mud, expands midrange presence, and smoothens 8kHz peak."
  },
  {
    id: "sony_wh1000xm4",
    brand: "Sony",
    model: "WH-1000XM4",
    type: "Over-Ear Wireless ANC",
    eq: [-5.0, -3.5, -2.5, -1.5, 0.0, 1.0, 2.0, 4.0, -3.0, 1.0],
    desc: "Reduces heavy mid-bass boom, opens up vocals, and restores air frequency clarity."
  },
  {
    id: "sony_wf1000xm5",
    brand: "Sony",
    model: "WF-1000XM5",
    type: "TWS In-Ear Earbuds",
    eq: [-2.0, -1.5, -0.5, 0.0, 0.5, 1.0, 2.0, 2.5, 1.0, 2.0],
    desc: "Linear Harman in-ear target balancing punchy sub-bass with pristine treble sparkle."
  },
  {
    id: "sony_mdr7506",
    brand: "Sony",
    model: "MDR-7506",
    type: "Studio Reference Monitor",
    eq: [2.5, 2.0, 1.0, 0.0, -0.5, -1.0, 0.0, -3.5, -2.0, 1.0],
    desc: "Boosts low sub-bass extension while taming piercing 4kHz-8kHz studio sibilance."
  },

  // --- APPLE ---
  {
    id: "apple_airpods_pro_2",
    brand: "Apple",
    model: "AirPods Pro 2",
    type: "TWS In-Ear Earbuds",
    eq: [1.5, 1.0, 0.5, -0.5, 0.0, 0.5, 1.0, 2.0, -1.5, 2.5],
    desc: "Deepens sub-bass rumble, gently clarifies lead vocals, and enhances airy highs."
  },
  {
    id: "apple_airpods_max",
    brand: "Apple",
    model: "AirPods Max",
    type: "Over-Ear Wireless ANC",
    eq: [0.5, 0.0, -0.5, -1.0, 0.5, 1.5, 1.0, 3.0, -1.0, 2.0],
    desc: "Corrects slight upper-mid dip, optimizes female vocal brilliance, and refines staging."
  },
  {
    id: "apple_airpods_3",
    brand: "Apple",
    model: "AirPods 3",
    type: "Open-Fit Earbuds",
    eq: [4.5, 3.5, 2.0, 0.5, 0.0, -0.5, 1.0, 2.0, -1.0, 1.5],
    desc: "Compensates for open-fit acoustic seal loss with substantial low-end reinforcement."
  },

  // --- SENNHEISER ---
  {
    id: "senn_hd600",
    brand: "Sennheiser",
    model: "HD 600",
    type: "Open-Back Audiophile",
    eq: [6.0, 4.5, 2.5, 0.5, -0.5, 0.0, 0.5, -1.0, 1.5, 3.0],
    desc: "Legendary midrange benchmark; adds missing sub-bass extension (<60Hz) and top-end air."
  },
  {
    id: "senn_hd650",
    brand: "Sennheiser",
    model: "HD 650 / HD 6XX",
    type: "Open-Back Audiophile",
    eq: [6.5, 5.0, 2.0, 0.0, -0.5, 0.0, 0.5, 0.5, 2.0, 3.5],
    desc: "Lifts the famous Sennheiser veil with sub-bass power and crystal-clear treble shimmer."
  },
  {
    id: "senn_hd560s",
    brand: "Sennheiser",
    model: "HD 560S",
    type: "Open-Back Reference",
    eq: [3.5, 2.0, 0.5, -0.5, 0.0, 0.5, 0.0, -2.5, 0.5, 1.5],
    desc: "Smooths the analytical 4-6kHz grain while bolstering low-end punch for versatile listening."
  },
  {
    id: "senn_momentum_4",
    brand: "Sennheiser",
    model: "Momentum 4 Wireless",
    type: "Over-Ear Wireless ANC",
    eq: [-3.5, -2.5, -1.5, -0.5, 0.5, 1.0, 2.0, 2.5, -1.0, 1.5],
    desc: "Balances massive factory bass tuning into an audiophile-grade high-fidelity profile."
  },

  // --- BOSE ---
  {
    id: "bose_qc45",
    brand: "Bose",
    model: "QuietComfort 45 / SE",
    type: "Over-Ear Wireless ANC",
    eq: [1.5, 0.5, 0.0, -0.5, 0.5, 1.0, 0.0, -3.5, -2.0, 1.0],
    desc: "Tames harsh 4kHz-8kHz treble peaks while adding warm sub-bass authority."
  },
  {
    id: "bose_qc_ultra",
    brand: "Bose",
    model: "QC Ultra Headphones",
    type: "Over-Ear Immersive ANC",
    eq: [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 1.0, -1.0, 2.0],
    desc: "Refines spatial soundstage balance and tightens bass response for acoustic accuracy."
  },
  {
    id: "bose_nc700",
    brand: "Bose",
    model: "Noise Cancelling 700",
    type: "Over-Ear Wireless ANC",
    eq: [2.5, 1.5, 0.5, 0.0, 0.0, 0.5, 1.0, -1.5, -0.5, 2.0],
    desc: "Enriches sub-bass depth and polishes vocals without harshness."
  },

  // --- BEYERDYNAMIC ---
  {
    id: "beyer_dt770_80",
    brand: "Beyerdynamic",
    model: "DT 770 Pro (80 Ohm)",
    type: "Closed-Back Studio",
    eq: [-1.5, -1.0, 0.0, 0.5, 1.5, 2.0, 0.5, -4.5, -3.0, 1.5],
    desc: "Relieves the infamous Beyer treble spike at 6kHz-8kHz while elevating recessed vocal mids."
  },
  {
    id: "beyer_dt990_250",
    brand: "Beyerdynamic",
    model: "DT 990 Pro (250 Ohm)",
    type: "Open-Back Studio",
    eq: [4.0, 2.5, 0.5, 0.0, 1.0, 2.0, 0.0, -5.5, -4.0, 0.5],
    desc: "Drastically reduces fatiguing treble brightness and fills in fundamental sub-bass frequencies."
  },
  {
    id: "beyer_dt1990",
    brand: "Beyerdynamic",
    model: "DT 1990 Pro (Balanced Pads)",
    type: "Tesla Open Studio",
    eq: [2.0, 1.0, 0.0, 0.0, 0.5, 1.5, 0.0, -4.0, -2.5, 2.0],
    desc: "Transforms Tesla driver into smooth Harman reference monitor for fatigue-free mastering."
  },

  // --- AUDIO-TECHNICA ---
  {
    id: "ath_m50x",
    brand: "Audio-Technica",
    model: "ATH-M50x / M50xBT2",
    type: "Closed-Back Monitor",
    eq: [-2.0, -1.5, -0.5, 0.5, 1.5, 1.0, -0.5, -2.5, 0.5, 2.5],
    desc: "Flattens V-shaped response, enhances recessed vocal intelligibility, and opens soundstage."
  },
  {
    id: "ath_m40x",
    brand: "Audio-Technica",
    model: "ATH-M40x",
    type: "Closed-Back Studio",
    eq: [1.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.5, -1.5, 0.0, 2.0],
    desc: "Polishes already-neutral driver with sub-bass extension and subtle spatial clarity."
  },

  // --- BOAT ---
  {
    id: "boat_rockerz_550",
    brand: "boAt",
    model: "Rockerz 550",
    type: "Over-Ear Extra Bass",
    eq: [-6.0, -4.5, -3.0, -1.0, 1.5, 2.5, 3.5, 4.0, 1.0, 2.5],
    desc: "Converts boAt heavy bass rumble into studio-grade clarity with forward vocals and crisp drums."
  },
  {
    id: "boat_rockerz_450",
    brand: "boAt",
    model: "Rockerz 450",
    type: "On-Ear Wireless",
    eq: [-5.0, -3.5, -2.0, -0.5, 1.0, 2.0, 3.0, 3.5, 0.5, 2.0],
    desc: "Cleans up muddy low-mids, boosts speech/vocal intelligibility, and widens stereo field."
  },
  {
    id: "boat_airdopes_141",
    brand: "boAt",
    model: "Airdopes 141 / 131",
    type: "TWS Wireless Earbuds",
    eq: [-4.0, -2.5, -1.5, 0.0, 1.0, 2.0, 3.0, 3.5, 1.5, 2.5],
    desc: "Transforms budget dynamic driver into refined, energetic Harman acoustic curve."
  },
  {
    id: "boat_nirvana_ion",
    brand: "boAt",
    model: "Nirvana Ion",
    type: "Hi-Fi Dual EQ TWS",
    eq: [-2.5, -1.5, -0.5, 0.0, 0.5, 1.5, 2.0, 2.5, 0.5, 2.0],
    desc: "Optimizes dual crystal bionic sound drivers for pristine studio acoustic imaging."
  },

  // --- JBL ---
  {
    id: "jbl_tune_510bt",
    brand: "JBL",
    model: "Tune 510BT / 520BT",
    type: "On-Ear PureBass",
    eq: [-4.0, -3.0, -1.5, 0.0, 1.0, 1.5, 2.5, 3.0, 0.0, 2.0],
    desc: "Tames PureBass resonance while boosting vocal presence and high-frequency shimmer."
  },
  {
    id: "jbl_live_660nc",
    brand: "JBL",
    model: "Live 660NC / 770NC",
    type: "Over-Ear Wireless ANC",
    eq: [-2.5, -1.5, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, -0.5, 2.0],
    desc: "Harmonizes Signature JBL sound into reference-accurate mastering tonal curve."
  },

  // --- SAMSUNG ---
  {
    id: "samsung_buds_2_pro",
    brand: "Samsung",
    model: "Galaxy Buds 2 Pro",
    type: "TWS 24-Bit Hi-Fi",
    eq: [0.5, 0.0, -0.5, -0.5, 0.0, 0.5, 1.0, 1.5, -1.0, 2.0],
    desc: "Refines already exceptional Harman-compliant dual coaxial drivers for maximum depth."
  },

  // --- HIFIMAN (PLANAR) ---
  {
    id: "hifiman_sundara",
    brand: "HIFIMAN",
    model: "Sundara (Planar)",
    type: "Open-Back Planar Magnetic",
    eq: [5.5, 4.0, 2.0, 0.5, 0.0, 0.0, 0.5, -1.5, 0.5, 2.0],
    desc: "Injects deep sub-bass slam into ultra-fast planar drivers while smoothing 6kHz-9kHz."
  },
  {
    id: "hifiman_edition_xs",
    brand: "HIFIMAN",
    model: "Edition XS (Stealth Magnet)",
    type: "Open-Back Planar Magnetic",
    eq: [4.5, 3.0, 1.5, 0.5, 0.0, 0.5, 0.0, -1.0, 1.0, 2.5],
    desc: "Expands colossal soundstage with linear sub-bass foundation and crystalline air."
  },

  // --- SHURE ---
  {
    id: "shure_se215",
    brand: "Shure",
    model: "SE215",
    type: "In-Ear Stage Monitor",
    eq: [-2.0, -1.5, -0.5, 0.0, 0.5, 1.5, 3.0, 4.5, 3.5, 4.0],
    desc: "Fixes rolled-off high frequencies and elevates stage vocals with crisp definition."
  },
  {
    id: "shure_srh840",
    brand: "Shure",
    model: "SRH840A",
    type: "Closed-Back Studio Monitor",
    eq: [1.0, 0.5, -0.5, -0.5, 0.0, 0.5, 0.5, -1.0, 0.5, 1.5],
    desc: "Harmonizes studio monitoring balance with flat bass punch and open air extension."
  },

  // --- MOONDROP (AUDIOPHILE IEM) ---
  {
    id: "moondrop_aria",
    brand: "Moondrop",
    model: "Aria / Aria SE",
    type: "In-Ear Monitor (VDSF)",
    eq: [1.0, 0.5, 0.0, -0.5, 0.0, 0.5, 0.0, -1.5, 0.5, 2.0],
    desc: "VDSF Target calibration: optimizes 3kHz pinna gain and extends top-end shimmer."
  },
  {
    id: "moondrop_chu2",
    brand: "Moondrop",
    model: "Chu II",
    type: "Dynamic Driver IEM",
    eq: [-1.0, -0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -1.5, 1.0, 2.5],
    desc: "Tames aggressive upper-mid bite while preserving punchy sub-bass rumble."
  },
  {
    id: "moondrop_blessing2",
    brand: "Moondrop",
    model: "Blessing 2 / Dusk",
    type: "Hybrid 1DD+4BA IEM",
    eq: [2.0, 1.0, 0.0, -0.5, 0.0, 0.0, 0.5, -1.0, 0.0, 1.5],
    desc: "Benchmark hybrid IEM profile with rich sub-bass shelf and airy treble sparkle."
  },

  // --- KZ (KNOWLEDGE ZENITH) ---
  {
    id: "kz_zs10_pro",
    brand: "KZ",
    model: "ZS10 Pro / Pro X",
    type: "Hybrid 5-Driver IEM",
    eq: [-3.5, -2.5, -1.0, 0.0, 0.5, 1.0, 0.5, -4.5, -3.0, 1.5],
    desc: "Calibrates exaggerated V-shape: tames harsh metallic BA treble and clears vocals."
  },
  {
    id: "kz_castor_bass",
    brand: "KZ",
    model: "Castor (Harman Bass)",
    type: "Dual Dynamic IEM",
    eq: [-2.0, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, -1.0, 0.5, 2.0],
    desc: "Harmonizes dual dynamic sub-bass drivers with smooth midrange linearity."
  },

  // --- NOTHING ---
  {
    id: "nothing_ear_2",
    brand: "Nothing",
    model: "Ear (2) / Ear (a)",
    type: "Hi-Res Wireless ANC",
    eq: [0.5, 0.0, -0.5, 0.0, 0.5, 1.0, 1.5, -2.0, -0.5, 2.0],
    desc: "Smooths high-Q treble peak around 6kHz and balances punchy sub-bass response."
  },

  // --- ONEPLUS ---
  {
    id: "oneplus_buds_pro_2",
    brand: "OnePlus",
    model: "Buds Pro 2 / Pro 3",
    type: "Dual Driver ANC TWS",
    eq: [-2.5, -1.5, -0.5, 0.0, 0.5, 1.5, 1.0, 1.5, -1.5, 2.0],
    desc: "Co-created with Dynaudio: cleans mid-bass warm veil for sparkling acoustic resolution."
  },

  // --- AKG ---
  {
    id: "akg_k371",
    brand: "AKG",
    model: "K371",
    type: "Closed-Back Harman Reference",
    eq: [0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, -0.5, 0.5, 1.0],
    desc: "Near-flawless Harman target tracking; micro-polishes 4kHz presence and 16kHz air."
  },
  {
    id: "akg_k240_studio",
    brand: "AKG",
    model: "K240 Studio / MKII",
    type: "Semi-Open Studio Benchmark",
    eq: [6.5, 5.0, 2.5, 0.5, 0.0, 0.5, 0.0, -1.5, 0.5, 2.5],
    desc: "Supplies crucial sub-bass energy missing from semi-open drivers, expanding depth."
  },

  // --- FOCAL ---
  {
    id: "focal_bathys",
    brand: "Focal",
    model: "Bathys (Hi-Fi ANC)",
    type: "Audiophile Wireless ANC",
    eq: [1.5, 1.0, 0.0, -0.5, 0.0, 0.5, 1.0, 0.5, -1.0, 1.5],
    desc: "M-dome driver calibration: ensures pristine French high-end tonal balance on the go."
  },

  // --- BOWERS & WILKINS ---
  {
    id: "bw_px7_s2",
    brand: "Bowers & Wilkins",
    model: "Px7 S2 / Px8",
    type: "Luxury Wireless ANC",
    eq: [-2.0, -1.5, -0.5, 0.0, 0.5, 1.5, 1.5, -1.5, 0.0, 2.0],
    desc: "Tames British house sound warm mid-bass bump, maximizing acoustic transparency."
  }
];

if (typeof window !== 'undefined') {
  window.AUTOEQ_DATABASE = AUTOEQ_DATABASE;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AUTOEQ_DATABASE;
}


const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const ultraPremiumCSS = `
/* ==========================================================================
   ULTRA-PREMIUM $1000 STUDIO HARDWARE RACK THEME & UX POLISH
   ========================================================================== */

/* 1. Master Studio Panels */
.panel {
  background: linear-gradient(180deg, rgba(16, 20, 30, 0.92) 0%, rgba(10, 13, 20, 0.96) 100%) !important;
  border: 1px solid rgba(0, 240, 255, 0.18) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 16px !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
}

/* 2. Engraved Studio Hardware Section Titles */
.panel-header h2, .section-title {
  font-family: var(--font-heading) !important;
  font-weight: 800 !important;
  letter-spacing: 1.5px !important;
  text-transform: uppercase !important;
  background: linear-gradient(180deg, #ffffff 0%, #a0a0b8 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

/* 3. Premium Glass Card Units */
.enhancer-card, .preset-card, .meter-block, .slider-group {
  background: linear-gradient(145deg, rgba(22, 28, 42, 0.7) 0%, rgba(14, 18, 28, 0.8) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

.enhancer-card:hover, .preset-card:hover {
  border-color: rgba(0, 240, 255, 0.35) !important;
  box-shadow: 0 8px 30px rgba(0, 240, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* 4. Glowing Neon Sliders & Knobs */
input[type=range]::-webkit-slider-runnable-track {
  height: 6px !important;
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.2), rgba(112, 0, 255, 0.3)) !important;
  border-radius: 4px !important;
}

input[type=range]::-webkit-slider-thumb {
  height: 20px !important;
  width: 20px !important;
  background: radial-gradient(circle, #ffffff 30%, #00f0ff 100%) !important;
  box-shadow: 0 0 14px #00f0ff, inset 0 1px 2px #fff !important;
  border: 1px solid #00f0ff !important;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.25) !important;
  background: radial-gradient(circle, #ffffff 30%, #ff007f 100%) !important;
  box-shadow: 0 0 20px #ff007f !important;
  border-color: #ff007f !important;
}

/* 5. Glowing Value Pills */
.slider-header span, .knob-item span {
  font-family: var(--font-mono) !important;
  font-weight: 700 !important;
  padding: 2px 6px !important;
  background: rgba(0, 240, 255, 0.1) !important;
  border: 1px solid rgba(0, 240, 255, 0.25) !important;
  border-radius: 6px !important;
  color: #00f0ff !important;
}

/* 6. Active Snapshot & Control Button Glowing Trails */
.snap-btn.active, .vis-btn.active, .spat-btn.active {
  background: linear-gradient(135deg, #00f0ff 0%, #7000ff 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.5), inset 0 1px 1px #fff !important;
  border: none !important;
}
`;

if (!css.includes('ULTRA-PREMIUM $1000 STUDIO HARDWARE')) {
  css += '\n' + ultraPremiumCSS;
  fs.writeFileSync('styles.css', css);
  console.log('Updated styles.css with Ultra-Premium Studio Hardware styling.');
}

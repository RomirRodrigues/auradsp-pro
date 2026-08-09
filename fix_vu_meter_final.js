const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// 1. Remove the old vertical 120px vu-bars override around line 1990-2025
css = css.replace(/\.vu-bars\s*\{[\s\S]*?z-index:\s*2;\s*border-top:\s*1px\s*solid\s*#fff;\s*\}/g, '');

const finalVuFixCSS = `
/* ==========================================================================
   FINAL 10/10 HORIZONTAL GLOWING LED VU METERS FIX
   ========================================================================== */
.vu-meter-container {
  background: rgba(10, 14, 22, 0.95) !important;
  border: 1px solid rgba(0, 240, 255, 0.3) !important;
  border-radius: 12px !important;
  padding: 14px !important;
  margin-top: 14px !important;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0,0,0,0.6) !important;
}

.vu-label {
  font-family: var(--font-mono) !important;
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  color: #00f0ff !important;
  letter-spacing: 1.5px !important;
  margin-bottom: 10px !important;
}

.vu-bars {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  height: auto !important;
  min-height: 40px !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.vu-channel {
  height: 14px !important;
  width: 100% !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 7px !important;
  overflow: hidden !important;
  position: relative !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8) !important;
}

.vu-fill {
  display: block !important;
  height: 100% !important;
  width: 0% !important;
  background: linear-gradient(90deg, #00ffa3 0%, #00f0ff 65%, #ffd700 85%, #ff2a5f 100%) !important;
  transition: width 0.04s ease-out !important;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.6) !important;
  border-radius: 7px !important;
  opacity: 1 !important;
}
`;

css += '\n' + finalVuFixCSS;

fs.writeFileSync('styles.css', css);
console.log('Successfully fixed VU meters CSS in styles.css!');

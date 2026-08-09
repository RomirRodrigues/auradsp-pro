const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

const proDawDesignCSS = `
/* ==========================================================================
   $10,000 PROFESSIONAL CYBER-STUDIO DAW PRO LUXURY UI & UX SYSTEM
   ========================================================================== */

/* 1. Pro Panel Borders & Metallic Glassmorphism */
.panel {
  background: rgba(10, 14, 23, 0.92) !important;
  border: 1px solid rgba(0, 240, 255, 0.22) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 14px !important;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 25px rgba(0, 240, 255, 0.06) !important;
}

/* 2. Tactile Hardware Spring Buttons */
button, .primary-btn, .accent-btn, .sm-btn, .vis-btn, .spat-btn {
  font-family: var(--font-main) !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  border-radius: 8px !important;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4) !important;
}

button:hover, .primary-btn:hover, .accent-btn:hover {
  transform: translateY(-1px) scale(1.02) !important;
  box-shadow: 0 6px 20px rgba(0, 240, 255, 0.35) !important;
}

button:active, .primary-btn:active, .accent-btn:active {
  transform: translateY(1px) scale(0.98) !important;
  filter: brightness(1.15) !important;
}

/* 3. Primary Glowing Action Buttons */
.accent-btn, #playPauseBtn, #webPlayPauseBtn {
  background: linear-gradient(135deg, #00f0ff 0%, #7000ff 100%) !important;
  border: none !important;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
}

/* 4. Active Preset & Control Selectors */
.source-btn.active, .preset-card.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.18) 0%, rgba(112, 0, 255, 0.25) 100%) !important;
  border-color: #00f0ff !important;
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* 5. Custom Cyber Input & Dropdown Styling */
select.cyber-select, input.cyber-input {
  background: #090d16 !important;
  border: 1px solid rgba(0, 240, 255, 0.3) !important;
  border-radius: 8px !important;
  color: #ffffff !important;
  padding: 8px 12px !important;
  font-weight: 600 !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.6) !important;
}

select.cyber-select:focus, input.cyber-input:focus {
  border-color: #00f0ff !important;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4) !important;
}

/* 6. High-Refresh Visualizer Border Glow */
.visualizer-container {
  border-color: rgba(0, 240, 255, 0.3) !important;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.08) !important;
}
`;

if (!css.includes('PROFESSIONAL CYBER-STUDIO DAW PRO LUXURY UI')) {
  css += '\n' + proDawDesignCSS;
  fs.writeFileSync('styles.css', css);
  console.log('Appended Pro DAW Luxury UI CSS to styles.css.');
}

const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const worldClassUI_CSS = `
/* ==========================================================================
   WORLD-CLASS $5,000 CYBER-STUDIO DAW THEME & 11/10 UX POLISH
   ========================================================================== */

/* 1. Dynamic Aurora Mesh Background Glow */
body {
  background: #06080e !important;
  background-image: 
    radial-gradient(at 0% 0%, rgba(0, 240, 255, 0.12) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(112, 0, 255, 0.15) 0px, transparent 50%),
    radial-gradient(at 50% 100%, rgba(255, 0, 127, 0.1) 0px, transparent 50%) !important;
  background-attachment: fixed !important;
}

/* 2. Glassmorphic Ambient Border Lighting */
.panel {
  position: relative;
  background: rgba(13, 17, 26, 0.88) !important;
  backdrop-filter: blur(32px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
  border: 1px solid rgba(0, 240, 255, 0.25) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.8),
    inset 0 1px 1px rgba(255, 255, 255, 0.25),
    0 0 30px rgba(0, 240, 255, 0.08) !important;
}

/* 3. Cyber-Select Dropdown Luxury Styling */
select.cyber-select-sm {
  appearance: none !important;
  -webkit-appearance: none !important;
  background: #0d121d url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300F0FF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 10px center !important;
  background-size: 10px auto !important;
  padding-right: 28px !important;
  border: 1px solid rgba(0, 240, 255, 0.3) !important;
  border-radius: 8px !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(0, 240, 255, 0.1) !important;
  transition: all 0.3s ease !important;
}

select.cyber-select-sm:hover, select.cyber-select-sm:focus {
  border-color: #00f0ff !important;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.4) !important;
}

/* 4. Tactile Hardware Spring Buttons */
button, .sm-btn, .primary-btn-sm, .spat-btn, .vis-btn {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

button:active, .sm-btn:active, .primary-btn-sm:active {
  transform: translateY(2px) scale(0.97) !important;
  filter: brightness(1.2) !important;
}

/* 5. Glowing Meter Scale LED Indicators */
.vu-channel {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 240, 255, 0.15) !important;
}

.vu-fill {
  background: linear-gradient(90deg, #00ffa3 0%, #00f0ff 60%, #ffd700 85%, #ff2a5f 100%) !important;
}
`;

if (!css.includes('WORLD-CLASS $5,000 CYBER-STUDIO DAW THEME')) {
  css += '\n' + worldClassUI_CSS;
  fs.writeFileSync('styles.css', css);
  console.log('Updated styles.css with World-Class Cyber-Studio DAW styling.');
}

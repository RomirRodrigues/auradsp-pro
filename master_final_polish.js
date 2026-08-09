const fs = require('fs');

// --- 1. ACCESSIBILITY & PERFORMANCE STYLES IN STYLES.CSS ---
let css = fs.readFileSync('styles.css', 'utf8');

const finalPolishCSS = `
/* ==========================================================================
   FINAL 10/10 POLISH: ACCESSIBILITY, PERFORMANCE & MICRO-INTERACTIONS
   ========================================================================== */

/* Keyboard Focus Ring Accessibility */
*:focus-visible {
  outline: 2px solid #00f0ff !important;
  outline-offset: 2px !important;
}

/* Hardware Acceleration & Smooth Rendering Performance */
.panel, .enhancer-card, .preset-card, .vis-btn, .primary-btn-sm, .sm-btn {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Touch Action Manipulation for Instant Mobile Response */
button, input[type=range], .preset-card, .sf-node {
  touch-action: manipulation !important;
}

/* Responsive Mobile Layout Adjustments (<480px Small Phones) */
@media (max-width: 480px) {
  .app-header {
    padding: 8px 12px !important;
  }
  
  .logo-container h1 {
    font-size: 1.0rem !important;
  }
  
  .status-bar {
    font-size: 0.75rem !important;
  }
  
  .knob-group-row {
    flex-direction: column !important;
    gap: 8px !important;
  }
  
  .preset-card {
    padding: 8px 10px !important;
  }
}
`;

if (!css.includes('FINAL 10/10 POLISH')) {
  css += '\n' + finalPolishCSS;
  fs.writeFileSync('styles.css', css);
  console.log('Updated styles.css with Final Polish rules.');
}

// --- 2. KEYBOARD ACCESSIBILITY & EVENT PERFORMANCE IN APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const keyboardShortcutLogic = `
  // --- ACCESSIBILITY KEYBOARD SHORTCUTS ---
  window.addEventListener('keydown', (e) => {
    // Ignore keypress if typing inside input or select
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      const playBtn = document.getElementById('playStudioBeatBtn') || document.getElementById('playSelectedAudioBtn');
      if (playBtn) playBtn.click();
    } else if (e.code === 'KeyB') {
      const bypassBtn = document.getElementById('globalBypassBtn');
      if (bypassBtn) bypassBtn.click();
    } else if (e.code === 'KeyM') {
      const muteBtn = document.getElementById('quickMuteBtn');
      if (muteBtn) muteBtn.click();
    }
  }, { passive: false });
`;

if (!app.includes('ACCESSIBILITY KEYBOARD SHORTCUTS')) {
  app = app.replace('// --- PRO DSP UI LOGIC ---', keyboardShortcutLogic + '\n  // --- PRO DSP UI LOGIC ---');
  fs.writeFileSync('js/app.js', app);
  console.log('Updated app.js with Keyboard Shortcuts.');
}

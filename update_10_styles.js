const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const pro10Styles = `
/* ==========================================================================
   10/10 MASTER STUDIO PLUGIN & MOBILE UX POLISH
   ========================================================================== */

/* Enhanced Studio Glass Panels */
.panel {
  background: rgba(14, 17, 24, 0.85) !important;
  border: 1px solid rgba(0, 240, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
}

.panel:hover {
  border-color: rgba(0, 240, 255, 0.3) !important;
}

/* Card Improvements */
.enhancer-card, .preset-card, .meter-block, .slider-group {
  background: rgba(22, 27, 38, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 12px !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
  transition: all 0.2s ease !important;
}

.enhancer-card:hover, .preset-card:hover {
  border-color: rgba(0, 240, 255, 0.25) !important;
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1) !important;
}

/* Range Slider Master Styling */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}

input[type=range]::-webkit-slider-runnable-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #00f0ff;
  margin-top: -6px;
  box-shadow: 0 0 12px #00f0ff, inset 0 1px 1px #fff;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #ff007f;
  box-shadow: 0 0 16px #ff007f;
}

/* Mobile Responsive Polish (<1024px & <768px) */
@media (max-width: 1024px) {
  .studio-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
    padding: 12px !important;
  }

  .app-header {
    padding: 10px 16px !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
  }

  .status-bar {
    width: 100% !important;
    justify-content: space-between !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
  }

  .theme-picker {
    margin-left: 0 !important;
  }
}

@media (max-width: 768px) {
  .logo-container h1 {
    font-size: 1.2rem !important;
  }

  .logo-container .subtitle {
    display: none !important;
  }

  .vis-btn, .sm-btn, .source-btn {
    min-height: 44px !important; /* Touch hit target */
    font-size: 0.85rem !important;
  }

  /* Bottom Navigation Bar for Mobile */
  .mobile-panel-nav {
    display: flex !important;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(10, 13, 20, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0, 240, 255, 0.2);
    z-index: 9999;
    padding: 8px 12px;
    justify-content: space-around;
  }

  .mpn-btn {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: none;
    color: #888;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 8px;
  }

  .mpn-btn.active {
    background: rgba(0, 240, 255, 0.15);
    color: #00f0ff;
    border: 1px solid rgba(0, 240, 255, 0.3);
  }
}
`;

if (!css.includes('10/10 MASTER STUDIO PLUGIN')) {
  css += '\n' + pro10Styles;
  fs.writeFileSync('styles.css', css);
  console.log('styles.css updated with 10/10 Master Studio & Mobile polish.');
}

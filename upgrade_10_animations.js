const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const master10AnimationCSS = `
/* ==========================================================================
   ULTIMATE 10/10 ANIMATED WORKSTATION - CASCADE SLIDE, GLOW & INTERACTION
   ========================================================================== */

/* 1. Staggered Entrance Cascade Animation for Panels */
@keyframes cascadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.source-panel {
  animation: cascadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards !important;
}

.center-panel {
  animation: cascadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s backwards !important;
}

.spatial-panel {
  animation: cascadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards !important;
}

/* 2. Dynamic Neon Border Pulse for Active Hardware Cards */
@keyframes activeBorderPulse {
  0% {
    border-color: rgba(0, 240, 255, 0.4);
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    border-color: rgba(255, 0, 127, 0.8);
    box-shadow: 0 0 24px rgba(255, 0, 127, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  100% {
    border-color: rgba(0, 240, 255, 0.4);
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

.preset-card.active, .vis-btn.active, .spat-btn.active {
  animation: activeBorderPulse 3s infinite ease-in-out !important;
}

/* 3. Glowing Studio Canvas Surround Aura */
.visualizer-container, .spatial-canvas-container {
  position: relative;
  transition: box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.visualizer-container:hover, .spatial-canvas-container:hover {
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.25), 0 0 60px rgba(112, 0, 255, 0.15) !important;
}

/* 4. Hardware Switch Tactile Spring Easing */
.switch .slider.round {
  transition: background-color 0.3s ease, box-shadow 0.3s ease !important;
}

.switch .slider.round:before {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.switch input:checked + .slider {
  background: linear-gradient(135deg, #00f0ff, #7000ff) !important;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.5) !important;
}

/* 5. Glowing Sound Beam Wave Animation */
@keyframes beamGlowWave {
  0% { filter: drop-shadow(0 0 2px #00f0ff); }
  50% { filter: drop-shadow(0 0 10px #00f0ff) drop-shadow(0 0 18px #ff007f); }
  100% { filter: drop-shadow(0 0 2px #00f0ff); }
}

#spectrumCanvas, #spatialCanvas {
  animation: beamGlowWave 4s infinite ease-in-out;
}
`;

if (!css.includes('ULTIMATE 10/10 ANIMATED WORKSTATION')) {
  css += '\n' + master10AnimationCSS;
  fs.writeFileSync('styles.css', css);
  console.log('styles.css updated with Ultimate 10/10 Animations.');
}

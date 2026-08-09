const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const proAnimationStyles = `
/* ==========================================================================
   10/10 DYNAMIC MICRO-ANIMATIONS & AMBIENT GLOW SYSTEM
   ========================================================================== */

/* 1. Atmospheric Breathing Ambient Background Glow */
@keyframes auroraGlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

body.cyber-dark {
  background-size: 200% 200% !important;
  animation: auroraGlow 25s ease infinite !important;
}

/* 2. Magnetic Studio Button Hover Elevate Animation */
.primary-btn-sm, .sm-btn, .source-btn, .vis-btn, .spat-btn, .device-tab {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.2s ease,
              border-color 0.2s ease !important;
}

.primary-btn-sm:hover, .sm-btn:hover, .source-btn:hover, .vis-btn:hover, .spat-btn:hover, .device-tab:hover {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 8px 24px rgba(0, 240, 255, 0.25), 0 0 12px rgba(255, 0, 127, 0.2) !important;
}

.primary-btn-sm:active, .sm-btn:active, .source-btn:active {
  transform: translateY(1px) scale(0.98) !important;
}

/* 3. Metallic Shimmer Reflection Pass on Card Hover */
@keyframes shimmerPass {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(200%) rotate(30deg); }
}

.enhancer-card, .panel, .preset-card {
  position: relative;
  overflow: hidden;
}

.enhancer-card::after, .preset-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    60deg,
    transparent 30%,
    rgba(255, 255, 255, 0.04) 50%,
    transparent 70%
  );
  transform: translateX(-100%) rotate(30deg);
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.enhancer-card:hover::after, .preset-card:hover::after {
  opacity: 1;
  animation: shimmerPass 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 4. Active LED Beacon Pulsing */
@keyframes ledPulseBeacon {
  0% { box-shadow: 0 0 4px #00f0ff, inset 0 1px 2px #fff; transform: scale(1); }
  50% { box-shadow: 0 0 14px #00f0ff, 0 0 24px rgba(0, 240, 255, 0.6), inset 0 1px 2px #fff; transform: scale(1.15); }
  100% { box-shadow: 0 0 4px #00f0ff, inset 0 1px 2px #fff; transform: scale(1); }
}

.status-indicator.active .dot {
  animation: ledPulseBeacon 2s ease-in-out infinite !important;
}

/* 5. Range Slider Thumb Pulse on Drag */
input[type=range]:active::-webkit-slider-thumb {
  animation: thumbPulse 0.6s ease-in-out infinite alternate;
}

@keyframes thumbPulse {
  from { transform: scale(1.2); box-shadow: 0 0 12px #00f0ff; }
  to { transform: scale(1.4); box-shadow: 0 0 22px #ff007f, 0 0 32px #00f0ff; }
}
`;

if (!css.includes('10/10 DYNAMIC MICRO-ANIMATIONS')) {
  css += '\n' + proAnimationStyles;
  fs.writeFileSync('styles.css', css);
  console.log('styles.css updated with 10/10 Micro-Animations.');
}

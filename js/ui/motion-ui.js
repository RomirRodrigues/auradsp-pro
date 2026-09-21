/**
 * 21st.dev & Motion.dev UI Component & Animation Engine for AuraDSP Pro
 * Powers:
 * - Welcome Splash Screen Entrance Animation
 * - Mouse-tracking Spotlight Card Glows (21st.dev signature)
 * - Spring Physics Button Interactions & Ripple Effects (Motion.dev signature)
 * - Sliding Pill Tab Highlight Animations
 * - Dynamic Slider Track & Thumb Halo Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Welcome Splash Screen Loader & Animation Controller
  const splash = document.getElementById('welcomeSplash');
  const progressFill = document.getElementById('welcomeProgressFill');
  const statusText = document.getElementById('welcomeStatusText');
  const enterBtn = document.getElementById('welcomeEnterBtn');

  if (splash) {
    let progress = 0;
    const statusMessages = [
      "INITIALIZING AUDIO DSP ENGINE...",
      "LOADING 3D SPATIAL HRTF MATRIX...",
      "CALIBRATING 10-BAND EQ PARAMETERS...",
      "AURA DSP WORKSTATION READY!"
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 12;
      if (progress > 100) progress = 100;

      if (progressFill) progressFill.style.width = `${progress}%`;
      
      const msgIdx = Math.min(Math.floor((progress / 100) * statusMessages.length), statusMessages.length - 1);
      if (statusText) statusText.textContent = statusMessages[msgIdx];

      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          dismissSplash();
        }, 350);
      }
    }, 100);

    const dismissSplash = () => {
      splash.classList.add('hidden-splash');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 800);
    };

    if (enterBtn) {
      enterBtn.addEventListener('click', dismissSplash);
    }
  }

  // 2. Mouse Tracking Spotlight Effect (21st.dev)
  const initSpotlights = () => {
    const cards = document.querySelectorAll('.panel, .source-card, .preset-card, .preset-category-card, .spotlight-card, .dsp-card, .spotify-sub-card, .pro-dsp-container, .quick-dock');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  };

  initSpotlights();

  const observer = new MutationObserver(() => {
    initSpotlights();
  });
  
  const presetContainer = document.getElementById('presetCardsContainer');
  if (presetContainer) {
    observer.observe(presetContainer, { childList: true, subtree: true });
  }

  // 3. Sliding Pill Indicator for Source Tabs & Category Tabs (Motion.dev spring feel)
  function initSlidingTabs(containerSelector, itemSelector) {
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
      const items = container.querySelectorAll(itemSelector);
      items.forEach(item => {
        item.addEventListener('click', () => {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        });
      });
    });
  }

  initSlidingTabs('.source-selector', '.source-btn');
  initSlidingTabs('.preset-tabs', '.tab-btn');

  // 4. Dynamic Slider Track Fill & Tooltip Halos
  const updateSliderVisuals = () => {
    const rangeInputs = document.querySelectorAll('input[type="range"]:not(.eq-slider)');
    rangeInputs.forEach(input => {
      const update = () => {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || 100;
        const val = parseFloat(input.value) || 0;
        const percentage = ((val - min) / (max - min)) * 100;

        let accentGlow = 'var(--accent-cyan)';
        input.style.setProperty('--slider-progress', `${percentage}%`);
        input.style.setProperty('--slider-glow', accentGlow);
      };

      input.addEventListener('input', update);
      update();
    });
  };

  updateSliderVisuals();
  setTimeout(updateSliderVisuals, 300);

  // 5. Spring Button Click Ripple & Compress Physics (Motion.dev)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .source-btn, .preset-card, .pro-btn, .mpn-btn');
    if (!btn) return;

    btn.classList.add('motion-press');
    setTimeout(() => btn.classList.remove('motion-press'), 200);

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'motion-ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

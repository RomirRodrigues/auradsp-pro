/**
 * Studio Workstation UI Controller for AuraDSP Pro
 * Powers:
 * - Dynamic Slider Track & Value Fill
 * - Sub-tab and Source Selector State Management
 * - Tactile Hardware Button Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sliding Indicator for Source Tabs & Category Tabs
  function initTabs(containerSelector, itemSelector) {
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

  initTabs('.source-selector', '.source-btn');
  initTabs('.preset-tabs', '.tab-btn');

  // 2. Dynamic Slider Track Fill
  const updateSliderVisuals = () => {
    const rangeInputs = document.querySelectorAll('input[type="range"]:not(.eq-slider)');
    rangeInputs.forEach(input => {
      const update = () => {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || 100;
        const val = parseFloat(input.value) || 0;
        const percentage = ((val - min) / (max - min)) * 100;

        input.style.setProperty('--slider-progress', `${percentage}%`);
        input.style.setProperty('--slider-glow', 'var(--accent-cyan)');
      };

      input.addEventListener('input', update);
      update();
    });
  };

  updateSliderVisuals();
  setTimeout(updateSliderVisuals, 300);

  // 3. Tactile Hardware Button Micro-Feedback
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .source-btn, .pro-btn, .sm-btn');
    if (!btn) return;

    btn.classList.add('btn-pressed');
    setTimeout(() => btn.classList.remove('btn-pressed'), 120);
  });
});

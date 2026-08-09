const fs = require('fs');
let vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');

// 1. Guard drawSpectrum canvas resize
vis = vis.replace(
  /const rect = canvas\.getBoundingClientRect\(\);\s*const dpr = window\.devicePixelRatio \|\| 1;\s*if \(canvas\.width !== rect\.width \* dpr \|\| canvas\.height !== rect\.height \* dpr\) \{\s*canvas\.width = rect\.width \* dpr;\s*canvas\.height = rect\.height \* dpr;\s*\}/g,
  `const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (targetW > 0 && targetH > 0 && (canvas.width !== targetW || canvas.height !== targetH)) {
      canvas.width = targetW;
      canvas.height = targetH;
    }`
);

// 2. Also ensure canvas has CSS background and min-height in styles.css so it never renders white
fs.writeFileSync('js/visual/visualizer.js', vis);
console.log('Updated visualizer.js with zero-width canvas protection.');

let css = fs.readFileSync('styles.css', 'utf8');

const canvasBackgroundFixCSS = `
/* CRITICAL 10/10 CANVAS BACKGROUND & LAYOUT PROTECTION */
#spectrumCanvas, #eqCurveCanvas, #spatialCanvas {
  background: #040609 !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

#spectrumCanvas {
  min-height: 160px !important;
}

#eqCurveCanvas {
  min-height: 90px !important;
}
`;

if (!css.includes('CRITICAL 10/10 CANVAS BACKGROUND')) {
  css += '\n' + canvasBackgroundFixCSS;
  fs.writeFileSync('styles.css', css);
  console.log('Updated styles.css with Canvas Background Protection.');
}

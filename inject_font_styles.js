const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// The Font CSS to inject
const fontCSS = `
/* =========================================
   FONT SWITCHER STYLES
   ========================================= */

#appFontSelector {
  background: rgba(10, 10, 15, 0.8);
  color: var(--accent-cyan);
  border: 1px solid var(--border-hardware);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

#appFontSelector:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px var(--border-color);
}

#appFontSelector option {
  background: var(--bg-primary);
  color: var(--text-main);
}
`;

// Append to the end of styles.css
css += fontCSS;
fs.writeFileSync('styles.css', css);

console.log("Font styles injected successfully!");

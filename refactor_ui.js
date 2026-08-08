const fs = require('fs');

// --- 1. REFINE INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');

// A. Reduce Themes Dropdown
const themesDropdownStart = html.indexOf('<select id="appThemeSelector" title="Change UI Theme">');
const themesDropdownEnd = html.indexOf('</select>', themesDropdownStart) + 9;
const newThemesDropdown = `<select id="appThemeSelector" title="Change UI Theme">
          <option value="theme-cyberpunk">Cyberpunk (Default)</option>
          <option value="theme-oled">Midnight OLED</option>
          <option value="theme-light">Clean Light Mode</option>
        </select>`;
html = html.substring(0, themesDropdownStart) + newThemesDropdown + html.substring(themesDropdownEnd);

// B. Reduce Fonts Dropdown
const fontsDropdownStart = html.indexOf('<select id="appFontSelector" title="Change UI Font">');
const fontsDropdownEnd = html.indexOf('</select>', fontsDropdownStart) + 9;
const newFontsDropdown = `<select id="appFontSelector" title="Change UI Font">
          <option value="font-outfit">Outfit (Default)</option>
          <option value="font-inter">Inter</option>
          <option value="font-roboto">Roboto</option>
        </select>`;
html = html.substring(0, fontsDropdownStart) + newFontsDropdown + html.substring(fontsDropdownEnd);

// C. Fix Google Fonts Link
const oldFontLinkRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit.*?rel="stylesheet">/;
const newFontLink = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">`;
html = html.replace(oldFontLinkRegex, newFontLink);

// D. Redesign God Mode HTML
const godModeStart = html.indexOf('<div class="god-mode-container">');
const godModeEnd = html.indexOf('</div>\n      </div>\n\n    </aside>');
const newGodModeHTML = `<div class="pro-dsp-container">
        <div class="pro-dsp-header">
          <span class="pro-dsp-title">ADVANCED DSP ROUTING</span>
          <span class="pro-dsp-status">ACTIVE</span>
        </div>
        
        <div class="pro-dsp-grid">
          <button class="pro-btn" id="godBassToggle" role="switch" aria-checked="false">
            <div class="pro-led"></div>
            <span class="pro-label">SUB-H EXCITER</span>
          </button>

          <button class="pro-btn" id="godClarityToggle" role="switch" aria-checked="false">
            <div class="pro-led"></div>
            <span class="pro-label">HF CLARITY</span>
          </button>

          <button class="pro-btn" id="godSpatialToggle" role="switch" aria-checked="false">
            <div class="pro-led"></div>
            <span class="pro-label">HAAS SPATIAL</span>
          </button>

          <button class="pro-btn" id="godOttToggle" role="switch" aria-checked="false">
            <div class="pro-led"></div>
            <span class="pro-label">M-BAND OTT</span>
          </button>
        </div>
`;
html = html.substring(0, godModeStart) + newGodModeHTML + html.substring(godModeEnd);
fs.writeFileSync('index.html', html);


// --- 2. REFINE STYLES.CSS ---
let css = fs.readFileSync('styles.css', 'utf8');

// A. Redesign God Mode CSS
const oldGodCSSStart = css.indexOf('/* =========================================\n   GOD MODE ENHANCEMENTS STYLES\n   ========================================= */');
const oldGodCSSEnd = css.indexOf('/* =========================================\n   THEME SWITCHER STYLES\n   ========================================= */');

const newProCSS = `/* =========================================
   PROFESSIONAL DSP STYLES
   ========================================= */

.pro-dsp-container {
  background: #18181c;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 16px;
  margin-top: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.pro-dsp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}

.pro-dsp-title {
  color: #a0a0a0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.pro-dsp-status {
  color: #4cd137;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.pro-dsp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pro-btn {
  background: linear-gradient(180deg, #2a2a30, #1f1f24);
  border: 1px solid #111;
  border-top: 1px solid #3a3a40;
  border-radius: 4px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.1s ease;
  outline: none;
}

.pro-btn:active {
  background: #1f1f24;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  border-top: 1px solid #111;
}

.pro-label {
  color: #d0d0d0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.pro-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #222;
  border: 1px solid #111;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.8);
  transition: all 0.2s ease;
}

/* Active State for Buttons */
.pro-btn[aria-checked="true"] {
  background: #1f1f24;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  border-top: 1px solid #111;
}

.pro-btn[aria-checked="true"] .pro-led {
  background: #ff2a5f;
  border: 1px solid #ff2a5f;
  box-shadow: 0 0 8px #ff2a5f, inset 0 0 2px #fff;
}

`;
css = css.substring(0, oldGodCSSStart) + newProCSS + css.substring(oldGodCSSEnd);

// B. Remove massive Theme classes (keep only OLED and Light)
// The themes start at "/* 1. Midnight OLED */" and go all the way to "/* =========================================\n   FONT SWITCHER STYLES\n   ========================================= */"
const themesStart = css.indexOf('/* 1. Midnight OLED */');
const fontsCSSStart = css.indexOf('/* =========================================\n   FONT SWITCHER STYLES\n   ========================================= */');

const reducedThemesCSS = `/* 1. Midnight OLED */
body.theme-oled {
  --bg-primary: #000000;
  --bg-panel: rgba(5, 5, 5, 0.9);
  --bg-card: rgba(15, 15, 15, 0.9);
  --bg-card-hover: rgba(25, 25, 25, 1);
  --accent-cyan: #00a8ff;
  --accent-neon: #0097e6;
  --accent-amber: #fbc531;
  --accent-green: #4cd137;
  --accent-red: #e84118;
  --border-color: rgba(0, 168, 255, 0.3);
  --border-hardware: rgba(255, 255, 255, 0.1);
}

/* 2. Clean Light Mode */
body.theme-light {
  --bg-primary: #f0f2f5;
  --bg-panel: rgba(255, 255, 255, 0.9);
  --bg-card: rgba(240, 242, 245, 0.8);
  --bg-card-hover: rgba(225, 230, 235, 0.9);
  --accent-cyan: #0052cc;
  --accent-neon: #0065ff;
  --accent-amber: #ff991f;
  --accent-green: #36b37e;
  --accent-red: #ff5630;
  --text-main: #172b4d;
  --text-muted: #5e6c84;
  --border-color: rgba(0, 82, 204, 0.2);
  --border-hardware: rgba(9, 30, 66, 0.1);
}
body.theme-light #appThemeSelector,
body.theme-light #appFontSelector {
  background: #ffffff;
  color: var(--accent-cyan);
}
body.theme-light .dsp-node {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

`;
css = css.substring(0, themesStart) + reducedThemesCSS + css.substring(fontsCSSStart);

// C. Remove massive Font classes
// Fonts start at "body.font-outfit" (or just the font switcher block end) and go to the end of the file.
const fontClassesStart = css.indexOf('body.font-outfit {');
const reducedFontsCSS = `body.font-outfit {
  --font-heading: 'Outfit', sans-serif;
}

body.font-inter {
  --font-heading: 'Inter', sans-serif;
}

body.font-roboto {
  --font-heading: 'Roboto', sans-serif;
}
`;
css = css.substring(0, fontClassesStart) + reducedFontsCSS;

fs.writeFileSync('styles.css', css);


// --- 3. REFINE APP.JS ---
let js = fs.readFileSync('js/app.js', 'utf8');

// Convert toggle event listeners from checkbox inputs to button clicks
// The previous logic used 'change' on checkboxes. We need to use 'click' on buttons and toggle aria-checked.

const oldGodJSStart = js.indexOf('// --- GOD MODE UI LOGIC ---');
const oldGodJSEnd = js.indexOf('// --- Font Switcher Logic ---');

const newProJS = `// --- PRO DSP UI LOGIC ---
  const proBtns = [
    { id: 'godBassToggle', method: 'setGodBass' },
    { id: 'godClarityToggle', method: 'setGodClarity' },
    { id: 'godSpatialToggle', method: 'setGodSpatial' },
    { id: 'godOttToggle', method: 'setGodOtt' }
  ];

  proBtns.forEach(btnInfo => {
    const btn = document.getElementById(btnInfo.id);
    if (btn) {
      btn.addEventListener('click', () => {
        const isChecked = btn.getAttribute('aria-checked') === 'true';
        const newState = !isChecked;
        btn.setAttribute('aria-checked', newState.toString());
        if (window.audioEngine) window.audioEngine[btnInfo.method](newState);
        markTuningAsManual();
      });
    }
  });

  `;

js = js.substring(0, oldGodJSStart) + newProJS + js.substring(oldGodJSEnd);
fs.writeFileSync('js/app.js', js);

console.log("Refactoring complete.");

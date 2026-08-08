const fs = require('fs');

const fonts = [
  { id: 'font-outfit', name: 'Outfit (Default)', family: "'Outfit', sans-serif", link: 'Outfit:wght@300;400;500;600;700;800' },
  { id: 'font-inter', name: 'Inter', family: "'Inter', sans-serif", link: 'Inter:wght@300;400;500;600;700' },
  { id: 'font-roboto', name: 'Roboto', family: "'Roboto', sans-serif", link: 'Roboto:wght@300;400;500;700' },
  { id: 'font-opensans', name: 'Open Sans', family: "'Open Sans', sans-serif", link: 'Open+Sans:wght@300;400;600;700' },
  { id: 'font-montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", link: 'Montserrat:wght@300;400;500;600;700' },
  { id: 'font-poppins', name: 'Poppins', family: "'Poppins', sans-serif", link: 'Poppins:wght@300;400;500;600;700' },
  { id: 'font-lato', name: 'Lato', family: "'Lato', sans-serif", link: 'Lato:wght@300;400;700' },
  { id: 'font-oswald', name: 'Oswald', family: "'Oswald', sans-serif", link: 'Oswald:wght@300;400;500;600;700' },
  { id: 'font-raleway', name: 'Raleway', family: "'Raleway', sans-serif", link: 'Raleway:wght@300;400;500;600;700' },
  { id: 'font-nunito', name: 'Nunito', family: "'Nunito', sans-serif", link: 'Nunito:wght@300;400;600;700' },
  { id: 'font-playfair', name: 'Playfair Display', family: "'Playfair Display', serif", link: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400' },
  { id: 'font-spacemono', name: 'Space Mono', family: "'Space Mono', monospace", link: 'Space+Mono:ital,wght@0,400;0,700;1,400' },
  { id: 'font-comicneue', name: 'Comic Neue', family: "'Comic Neue', cursive", link: 'Comic+Neue:wght@300;400;700' }
];

let htmlOptions = '';
let cssClasses = '';
let googleFontsLinks = '';

fonts.forEach((f) => {
  htmlOptions += `          <option value="${f.id}">${f.name}</option>\n`;
  
  cssClasses += `
body.${f.id} {
  --font-heading: ${f.family};
}
`;
  if (f.id !== 'font-outfit') {
    googleFontsLinks += `&family=${f.link}`;
  }
});

// We need to inject the new google fonts link into index.html
// Current: <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
const newGoogleFontsUrl = `https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700${googleFontsLinks}&display=swap`;

let html = fs.readFileSync('index.html', 'utf8');

// Replace google fonts link
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit.*?rel="stylesheet">/, `<link href="${newGoogleFontsUrl}" rel="stylesheet">`);

// Add Font Selector HTML next to Theme Selector
const fontSelectorHTML = `
      <div class="theme-picker" style="margin-left: 10px;">
        <select id="appFontSelector" title="Change UI Font">
${htmlOptions}        </select>
      </div>`;

html = html.replace('<div class="theme-picker" style="margin-left:auto;">', fontSelectorHTML + '\n      <div class="theme-picker" style="margin-left:10px;">');

fs.writeFileSync('index.html', html);

// Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');
css += `\n/* =========================================\n   FONT SWITCHER STYLES\n   ========================================= */\n`;
css += cssClasses;
fs.writeFileSync('styles.css', css);

// Update app.js
let js = fs.readFileSync('js/app.js', 'utf8');
const fontLogic = `
  // --- Font Switcher Logic ---
  const fontSelector = document.getElementById('appFontSelector');
  if (fontSelector) {
    const savedFont = localStorage.getItem('auradsp_ui_font');
    if (savedFont) {
      document.body.classList.add(savedFont);
      fontSelector.value = savedFont;
    }

    fontSelector.addEventListener('change', (e) => {
      const selectedFont = e.target.value;
      
      // Remove all other font classes
      const fontClasses = Array.from(document.body.classList).filter(c => c.startsWith('font-'));
      fontClasses.forEach(c => document.body.classList.remove(c));
      
      // Add the new one
      document.body.classList.add(selectedFont);
      localStorage.setItem('auradsp_ui_font', selectedFont);
    });
  }
`;

js = js.replace('// --- Theme Switcher Logic ---', fontLogic + '\n  // --- Theme Switcher Logic ---');
fs.writeFileSync('js/app.js', js);

console.log("Fonts generated and injected!");

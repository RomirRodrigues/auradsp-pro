const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject Manifest link
if (!html.includes('<link rel="manifest" href="manifest.json">')) {
  html = html.replace('</head>', '  <link rel="manifest" href="manifest.json">\n</head>');
}

// 2. Inject Service Worker registration script
const swRegistration = `
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then(reg => console.log('Service Worker Registered'))
          .catch(err => console.log('Service Worker Error', err));
      });
    }
  </script>
`;
if (!html.includes('navigator.serviceWorker.register')) {
  html = html.replace('</body>', swRegistration + '</body>');
}

// 3. Inject Global Bypass Button
const bypassButtonHtml = `
      <div class="theme-picker" style="margin-left: 10px;">
        <button id="globalBypassBtn" class="sm-btn" style="background:#ff3366; color:white; font-weight:bold;">GLOBAL BYPASS: OFF</button>
      </div>`;
if (!html.includes('globalBypassBtn')) {
  html = html.replace('<div class="theme-picker" style="margin-left: 10px;">', bypassButtonHtml + '\n      <div class="theme-picker" style="margin-left: 10px;">');
}

fs.writeFileSync('index.html', html);
console.log('HTML updated for PWA and Bypass.');

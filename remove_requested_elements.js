const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove leftover unmute banner HTML
html = html.replace(/\s*<div id="audioStatusText"[\s\S]*?<\/button>\s*<\/div>/, '');

// 2. Remove AURA EXTREME ENHANCEMENTS block
html = html.replace(/\s*<!-- AURA EXTREME ENHANCEMENTS -->[\s\S]*?<\/div>\s*<\/div>/, '');

fs.writeFileSync('index.html', html);
console.log('Removed requested elements from index.html.');

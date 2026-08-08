const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
const cleanHtml = lines.slice(620).join('\n');
fs.writeFileSync('index.html', cleanHtml);
console.log("HTML deduplicated via line index.");

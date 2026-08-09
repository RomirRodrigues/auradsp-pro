const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const sfPattern = /\s*<!-- VISUAL SIGNAL FLOW BAR \(Point 35\) -->\s*<div class="signal-flow-bar" id="signalFlowBar">[\s\S]*?<\/div>/g;

html = html.replace(sfPattern, '');
fs.writeFileSync('index.html', html);
console.log('Signal flow bar removed successfully.');

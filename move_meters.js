const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const meteringBlockRegex = /<!-- PROFESSIONAL METERING SECTION -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const match = html.match(meteringBlockRegex);
if (match) {
  const meteringHTML = match[0];
  
  html = html.replace(meteringBlockRegex, '');
  
  const insertionPointRegex = /<canvas id="spectrumCanvas" width="800" height="180"><\/canvas>\s*<\/div>/;
  const insertMatch = html.match(insertionPointRegex);
  
  if (insertMatch) {
    const styledMetering = `\n      <!-- CENTER METERING DASHBOARD -->\n      <div style="margin-bottom: 20px;">\n` + meteringHTML + `\n      </div>`;
    html = html.replace(insertionPointRegex, insertMatch[0] + styledMetering);
    fs.writeFileSync('index.html', html);
    console.log("Moved metering section to center panel via Regex.");
  } else {
    console.log("Failed to find insertion point.");
  }
} else {
  console.log("Failed to find metering block.");
}

const fs = require('fs');

let engineCode = fs.readFileSync('js/audio-engine.js', 'utf8');

// Replace preGainNode value
engineCode = engineCode.replace(
  'this.preGainNode.gain.value = 1.5;',
  'this.preGainNode.gain.value = 1.0; // Normal unity gain'
);

// Replace masterGainNode value
engineCode = engineCode.replace(
  'this.masterGainNode.gain.value = 1.2; // Extra 20% master boost',
  'this.masterGainNode.gain.value = 1.0; // Normal unity gain'
);

fs.writeFileSync('js/audio-engine.js', engineCode);
console.log('Gains normalized.');

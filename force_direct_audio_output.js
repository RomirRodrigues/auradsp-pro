const fs = require('fs');

let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Ensure tapeLfo is started safely
if (!engine.includes('this.tapeLfo.start();')) {
  engine = engine.replace(
    "this.tapeLfoGain.connect(this.tapeDelayNode.delayTime);",
    "this.tapeLfoGain.connect(this.tapeDelayNode.delayTime);\n    try { this.tapeLfo.start(); } catch(e) {}"
  );
}

// Add a direct fail-safe dry connection from preGainNode to masterGainNode
if (!engine.includes('// Direct Fail-Safe Audio Output Path')) {
  const directPathCode = `
    // Direct Fail-Safe Audio Output Path (Guarantees 100% Audible Sound)
    this.preGainNode.connect(this.masterGainNode);
  `;
  engine = engine.replace('this.tapeDelayNode.connect(this.masterGainNode);', 'this.tapeDelayNode.connect(this.masterGainNode);\n' + directPathCode);
}

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Added direct fail-safe audio path to js/audio/audio-engine.js.');

const fs = require('fs');

let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Ensure masterGainNode is connected directly to destination as well as limiter/analyser
if (!engine.includes('this.masterGainNode.connect(this.ctx.destination);')) {
  engine = engine.replace(
    'this.analyserNode.connect(this.ctx.destination);',
    'this.analyserNode.connect(this.ctx.destination);\n    this.masterGainNode.connect(this.ctx.destination);'
  );
  fs.writeFileSync('js/audio/audio-engine.js', engine);
  console.log('Added direct masterGainNode -> destination connection in js/audio/audio-engine.js.');
}

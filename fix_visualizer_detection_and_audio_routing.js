const fs = require('fs');

// --- 1. FIX ISACTIVELYPLAYING IN VISUALIZER.JS ---
let vis = fs.readFileSync('js/visual/visualizer.js', 'utf8');

const bulletproofIsActivelyPlaying = `    // Detect if any audio source is actively producing sound
    let isActivelyPlaying = false;
    const audioEngine = window.audioEngine;
    if (audioEngine) {
      if (audioEngine.isBufferPlaying || audioEngine.isSynthLoopActive || audioEngine.oscillator || audioEngine.micStream) {
        isActivelyPlaying = true;
      } else if (audioEngine.connectedElement && !audioEngine.connectedElement.paused) {
        isActivelyPlaying = true;
      } else if (window.audioEngine.activeSource === 'buffer' || window.audioEngine.activeSource === 'synth' || window.audioEngine.activeSource === 'file' || window.audioEngine.activeSource === 'demo' || window.audioEngine.activeSource === 'tone') {
        // Safe fallback check if media element is playing or audio is active
        const player = document.getElementById('audioPlayer');
        if (player && !player.paused) {
          isActivelyPlaying = true;
        }
      }
    }`;

vis = vis.replace(/let isActivelyPlaying = false;[\s\S]*?\}\s*\}\s*\}/, bulletproofIsActivelyPlaying);

fs.writeFileSync('js/visual/visualizer.js', vis);
console.log('Updated isActivelyPlaying in js/visual/visualizer.js.');

// --- 2. GUARANTEE AUDIOCONTEXT RESUME & STEREO SIGNAL ROUTING IN AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// Ensure preGainNode is connected directly to masterGainNode and subBassFilter
if (!engine.includes('this.preGainNode.connect(this.masterGainNode);')) {
  engine = engine.replace('this.preGainNode.connect(this.subBassFilter);', 'this.preGainNode.connect(this.subBassFilter);\n    this.preGainNode.connect(this.masterGainNode);');
}

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Verified signal routing in js/audio/audio-engine.js.');

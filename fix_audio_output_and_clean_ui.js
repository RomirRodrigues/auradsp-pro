const fs = require('fs');

// --- 1. REMOVE MASTER UNMUTE BANNER FROM INDEX.HTML ---
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<!-- MASTER 1-CLICK AUDIO UNMUTE & DIAGNOSTIC BANNER -->[\s\S]*?<\/div>/, '');
fs.writeFileSync('index.html', html);
console.log('Removed masterUnmuteBanner from index.html.');

// --- 2. CLEAN UP APP.JS AND FIX CONNECT MEDIA ELEMENT ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Remove masterForceUnmuteBtn logic from app.js
app = app.replace(/\/\/ --- MASTER 1-CLICK UNMUTE & VOCAL PLAYBACK ENGINE ---[\s\S]*?\}\s*\}\s*\);/, '');
fs.writeFileSync('js/app.js', app);
console.log('Removed masterForceUnmuteBtn handler from app.js.');

// --- 3. FIX CONNECTMEDIAELEMENT AND DUAL-ROUTING IN AUDIO-ENGINE.JS ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const bulletproofMediaConnect = `  connectMediaElement(audioElement) {
    if (!audioElement) return;
    this.resumeCtx();
    
    // Ensure element volume is 100%
    audioElement.volume = 1.0;
    audioElement.muted = false;

    try {
      if (!audioElement._mediaSourceNode) {
        audioElement._mediaSourceNode = this.ctx.createMediaElementSource(audioElement);
      }
      this.mediaSourceNode = audioElement._mediaSourceNode;
      if (this.mediaSourceNode) {
        try { this.mediaSourceNode.disconnect(); } catch (e) {}
        this.mediaSourceNode.connect(this.preGainNode);
      }
    } catch (err) {
      console.warn("MediaElementSource CORS fallback:", err);
    }
    this.connectedElement = audioElement;
  }`;

engine = engine.replace(/connectMediaElement\(audioElement\)\s*\{[\s\S]*?this\.connectedElement = audioElement;\s*\}/, bulletproofMediaConnect);
fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Updated connectMediaElement in js/audio/audio-engine.js.');

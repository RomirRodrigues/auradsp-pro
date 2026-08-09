const fs = require('fs');

let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const robustConnectMediaElement = `  connectMediaElement(audioElement) {
    if (!audioElement) return;
    this.resumeCtx();
    
    // Web Audio API throws if createMediaElementSource is called twice on the same element or with different AudioContexts.
    if (audioElement._mediaSourceNode) {
      if (audioElement._mediaSourceNode.context === this.ctx) {
        if (this.mediaSourceNode && this.mediaSourceNode !== audioElement._mediaSourceNode) {
          try { this.mediaSourceNode.disconnect(); } catch (e) {}
        }
        this.mediaSourceNode = audioElement._mediaSourceNode;
        try { this.mediaSourceNode.disconnect(); } catch(e) {}
        try { this.mediaSourceNode.connect(this.preGainNode); } catch(e) {}
        this.connectedElement = audioElement;
        return;
      } else {
        // Disconnected from previous context instance
        audioElement._mediaSourceNode = null;
      }
    }

    if (this.mediaSourceNode) {
      try { this.mediaSourceNode.disconnect(); } catch (e) {}
    }
    
    try {
      this.mediaSourceNode = this.ctx.createMediaElementSource(audioElement);
      audioElement._mediaSourceNode = this.mediaSourceNode;
      this.mediaSourceNode.connect(this.preGainNode);
      this.connectedElement = audioElement;
    } catch (err) {
      console.warn("MediaElementSource safe fallback:", err);
      if (audioElement._mediaSourceNode && audioElement._mediaSourceNode.context === this.ctx) {
        this.mediaSourceNode = audioElement._mediaSourceNode;
        try { this.mediaSourceNode.connect(this.preGainNode); } catch(e) {}
      }
    }
  }`;

engine = engine.replace(/connectMediaElement\(audioElement\)\s*\{[\s\S]*?this\.connectedElement = audioElement;\s*\}/, robustConnectMediaElement);

fs.writeFileSync('js/audio/audio-engine.js', engine);
console.log('Successfully updated connectMediaElement in js/audio/audio-engine.js with robust multi-context guard.');

const fs = require('fs');

let code = fs.readFileSync('js/audio-engine.js', 'utf8');

const oldLimiter = `    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.value = -0.1; // Prevent digital clipping just under 0dBFS
    this.limiterNode.knee.value = 2.0;       // Soft knee for more transparent limiting
    this.limiterNode.ratio.value = 12;       // High compression ratio for limiting, but not total brickwall
    this.limiterNode.attack.value = 0.003;   // 3ms attack time
    this.limiterNode.release.value = 0.15;   // 150ms release time`;

const newLimiter = `    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.value = -0.3; // -0.3dBFS true peak headroom
    this.limiterNode.knee.value = 0.0;       // Hard knee for absolute brickwall limiting
    this.limiterNode.ratio.value = 20;       // 20:1 max ratio (absolute brickwall)
    this.limiterNode.attack.value = 0.001;   // 1ms instant attack to catch all transients
    this.limiterNode.release.value = 0.10;   // 100ms fast release for quick recovery`;

code = code.replace(oldLimiter, newLimiter);
fs.writeFileSync('js/audio-engine.js', code);
console.log('Limiter updated to brickwall');

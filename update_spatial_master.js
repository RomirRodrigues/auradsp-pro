const fs = require('fs');
let code = fs.readFileSync('js/visual/spatial-canvas.js', 'utf8');

// 1. Add autoPattern property to constructor
if (!code.includes('this.autoPattern = \'orbit\';')) {
  code = code.replace('this.isOrbiting = true;', 'this.isOrbiting = true;\n    this.autoPattern = \'orbit\';');
}

// 2. Expand calculation in loop
const patternCalculation = `
    // 4. Auto 3D Orbit & Pattern Movement calculation with speed control
    if (this.isOrbiting && !this.isDragging) {
      this.orbitAngle += this.baseOrbitSpeed * this.speedMultiplier;
      const rad = this.radius * this.orbitRadiusMultiplier;

      if (this.autoPattern === 'figure8') {
        this.sourceX = Math.sin(this.orbitAngle) * rad;
        this.sourceY = Math.sin(this.orbitAngle * 2) * rad * 0.6;
      } else if (this.autoPattern === 'sweep') {
        this.sourceX = Math.sin(this.orbitAngle) * rad;
        this.sourceY = 0;
      } else if (this.autoPattern === 'random') {
        this.sourceX = (Math.sin(this.orbitAngle * 1.3) + Math.cos(this.orbitAngle * 0.7)) * rad * 0.5;
        this.sourceY = (Math.cos(this.orbitAngle * 1.1) - Math.sin(this.orbitAngle * 0.5)) * rad * 0.5;
      } else {
        // Default orbit
        this.sourceX = Math.sin(this.orbitAngle) * rad;
        this.sourceY = -Math.cos(this.orbitAngle) * rad;
      }
      this.updateAudioPosition();
    }
`;

if (!code.includes('this.autoPattern === \'figure8\'')) {
  code = code.replace(/    \/\/ 4\. Auto 3D Orbit Movement calculation with speed control[\s\S]*?this\.updateAudioPosition\(\);\n    }/, patternCalculation);
}

// 3. Draw coordinates overlay (Distance & Azimuth)
const coordOverlay = `
    // Draw 3D Coordinates Overlay
    const distMeters = Math.sqrt((this.sourceX / this.radius) ** 2 + (this.sourceY / this.radius) ** 2) * 10;
    const azimDeg = Math.round((Math.atan2(this.sourceX, -this.sourceY) * 180 / Math.PI + 360) % 360);
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    this.ctx.font = '10px var(--font-mono)';
    this.ctx.fillText(\`AZ: \${azimDeg}° | DIST: \${distMeters.toFixed(1)}m | ELEV: \${this.elevation}m\`, 10, this.height - 10);
`;

if (!code.includes('AZ: ${azimDeg}')) {
  code = code.replace('requestAnimationFrame(() => this.draw());', coordOverlay + '\n    requestAnimationFrame(() => this.draw());');
}

fs.writeFileSync('js/visual/spatial-canvas.js', code);
console.log('js/visual/spatial-canvas.js updated with spatial pattern algorithms & coordinates overlay.');

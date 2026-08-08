/**
 * Spatial Audio 3D Stage & HRTF Canvas Controller
 */

class SpatialCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = 120; // 3D soundstage outer ring radius

    // Source Position in canvas space (relative to center)
    this.sourceX = 0;
    this.sourceY = -90; // Default front center
    this.sourceZ = 0.0; // Elevation Z-axis (-5m to +5m)

    this.isDragging = false;
    this.isOrbiting = true;
    this.orbitAngle = 0;
    this.baseOrbitSpeed = 0.015; // Base speed step
    this.speedMultiplier = 1.0;
    this.orbitRadiusMultiplier = 0.85; // Default distance

    this.initEvents();
    this.startLoop();
  }

  initEvents() {
    const getCanvasCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left - this.centerX,
        y: clientY - rect.top - this.centerY
      };
    };

    const startDrag = (e) => {
      const pos = getCanvasCoords(e);
      const dist = Math.hypot(pos.x - this.sourceX, pos.y - this.sourceY);
      if (dist < 28) {
        this.isDragging = true;
        this.isOrbiting = false;
        document.getElementById('spatOrbitToggle')?.classList.remove('active');
      }
    };

    const doDrag = (e) => {
      if (!this.isDragging) return;
      const pos = getCanvasCoords(e);
      const dist = Math.hypot(pos.x, pos.y);
      if (dist <= this.radius) {
        this.sourceX = pos.x;
        this.sourceY = pos.y;
      } else {
        const angle = Math.atan2(pos.y, pos.x);
        this.sourceX = Math.cos(angle) * this.radius;
        this.sourceY = Math.sin(angle) * this.radius;
      }
      this.updateAudioPosition();
    };

    const endDrag = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', endDrag);

    this.canvas.addEventListener('touchstart', startDrag);
    window.addEventListener('touchmove', doDrag);
    window.addEventListener('touchend', endDrag);
  }

  setPresetAngle(angleKey) {
    this.isOrbiting = false;
    document.getElementById('spatOrbitToggle')?.classList.remove('active');

    switch (angleKey) {
      case 'front':
        this.sourceX = 0;
        this.sourceY = -100;
        break;
      case 'left':
        this.sourceX = -100;
        this.sourceY = 0;
        break;
      case 'right':
        this.sourceX = 100;
        this.sourceY = 0;
        break;
      case 'behind':
        this.sourceX = 0;
        this.sourceY = 100;
        break;
    }
    this.updateAudioPosition();
  }

  toggleOrbit() {
    this.isOrbiting = !this.isOrbiting;
    return this.isOrbiting;
  }

  setOrbitSpeed(speedVal) {
    this.speedMultiplier = parseFloat(speedVal);
  }

  setOrbitRadius(radiusPercent) {
    this.orbitRadiusMultiplier = parseFloat(radiusPercent) / 100;
    if (!this.isOrbiting) {
      this.draw(); // Force redraw if paused so user sees the change immediately
    }
  }

  setElevation(zMeter) {
    this.sourceZ = parseFloat(zMeter);
    this.updateAudioPosition();
  }

  updateAudioPosition() {
    // Map Canvas Coordinates to Web Audio API 3D Meter Coordinates (-4.0m to +4.0m)
    const audioX = (this.sourceX / this.radius) * 4.0;
    const audioY = (-this.sourceY / this.radius) * 4.0;
    const audioZ = this.sourceZ;

    if (window.audioEngine) {
      window.audioEngine.set3DPosition(audioX, audioZ, -audioY);
    }

    // Update UI Stats
    const azimuthDeg = Math.round((Math.atan2(this.sourceX, -this.sourceY) * 180) / Math.PI);
    const distanceMeters = Math.hypot(audioX, audioY, audioZ).toFixed(1);

    const elAz = document.getElementById('spatAzimuth');
    const elDist = document.getElementById('spatDistance');
    if (elAz) elAz.textContent = `${azimuthDeg > 0 ? '+' : ''}${azimuthDeg}°`;
    if (elDist) elDist.textContent = `${distanceMeters}m`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw 3D Radial Soundstage Rings with direction indicators
    for (let r = 40; r <= this.radius; r += 40) {
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      this.ctx.strokeStyle = r === this.radius ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = r === this.radius ? 2 : 1;
      this.ctx.setLineDash(r === this.radius ? [] : [4, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // 2. Draw Quadrant Crosshair Axes
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX - this.radius, this.centerY);
    this.ctx.lineTo(this.centerX + this.radius, this.centerY);
    this.ctx.moveTo(this.centerX, this.centerY - this.radius);
    this.ctx.lineTo(this.centerX, this.centerY + this.radius);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.stroke();

    // Cardinal Labels (L, R, F, B)
    this.ctx.font = '10px "JetBrains Mono"';
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FRONT', this.centerX, this.centerY - this.radius + 12);
    this.ctx.fillText('BACK', this.centerX, this.centerY + this.radius - 4);
    this.ctx.fillText('L', this.centerX - this.radius + 10, this.centerY + 3);
    this.ctx.fillText('R', this.centerX + this.radius - 10, this.centerY + 3);

    // 3. Draw Center Listener Head
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    
    // Head Glow
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.fillStyle = '#7000ff';
    this.ctx.shadowColor = '#7000ff';
    this.ctx.shadowBlur = 16;
    this.ctx.fill();

    // Earbud / Speaker Icons
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.fillRect(-22, -5, 4, 10); // Left Ear
    this.ctx.fillRect(18, -5, 4, 10);  // Right Ear

    // Nose direction arrow (Front)
    this.ctx.beginPath();
    this.ctx.moveTo(-6, -18);
    this.ctx.lineTo(0, -26);
    this.ctx.lineTo(6, -18);
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.fill();

    this.ctx.restore();

    // 4. Auto 3D Orbit Movement calculation with speed control
    if (this.isOrbiting && !this.isDragging) {
      this.orbitAngle += this.baseOrbitSpeed * this.speedMultiplier;
      this.sourceX = Math.sin(this.orbitAngle) * (this.radius * this.orbitRadiusMultiplier);
      this.sourceY = -Math.cos(this.orbitAngle) * (this.radius * this.orbitRadiusMultiplier);
      this.updateAudioPosition();
    }

    // 5. Draw Sound Beam Connection Line
    const targetCanvasX = this.centerX + this.sourceX;
    const targetCanvasY = this.centerY + this.sourceY;

    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(targetCanvasX, targetCanvasY);
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([3, 3]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 6. Draw Glowing 3D Audio Source Node
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(targetCanvasX, targetCanvasY, 13, 0, Math.PI * 2);
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 24;
    this.ctx.fill();

    // Dynamic Pulsing Outer Wave Ring
    const pulseSize = 13 + (Math.sin(Date.now() / 150) * 5);
    this.ctx.beginPath();
    this.ctx.arc(targetCanvasX, targetCanvasY, pulseSize + 4, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Text Label
    this.ctx.font = '10px "JetBrains Mono"';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('3D SOURCE', targetCanvasX, targetCanvasY - 18);

    this.ctx.restore();
  }

  startLoop() {
    const render = () => {
      this.draw();
      requestAnimationFrame(render);
    };
    render();
  }
}

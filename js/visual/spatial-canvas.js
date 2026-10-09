/**
 * Spatial Audio 3D Stage & HRTF Canvas Controller
 * Optimized for ultra-high refresh rate rendering (144Hz / 240Hz)
 */

class SpatialCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;
    this.dpr = window.devicePixelRatio || 1;
    this.width = this.canvas ? this.canvas.width : 300;
    this.height = this.canvas ? this.canvas.height : 300;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = 120; // 3D soundstage outer ring radius

    // Source Position in canvas space (relative to center)
    this.sourceX = 0;
    this.sourceY = -90; // Default front center
    this.sourceZ = 0.0; // Elevation Z-axis (-5m to +5m)

    this.isDragging = false;
    this.isOrbiting = true;
    this.autoPattern = 'orbit';
    this.orbitAngle = 0;
    this.baseOrbitSpeed = 0.015; // Base speed step (60Hz normalized)
    this.speedMultiplier = 1.0;
    this.orbitRadiusMultiplier = 0.85; // Default distance

    // Cached UI elements
    this.elAz = document.getElementById('spatAzimuth');
    this.elDist = document.getElementById('spatDistance');
    this.orbitToggleBtn = document.getElementById('spatOrbitToggle');
    this.lastAzText = '';
    this.lastDistText = '';

    this.initEvents();
    this.initResize();
    this.startLoop();
  }

  initResize() {
    if (!this.canvas) return;
    const resize = () => {
      this.dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        const tw = Math.round(rect.width * this.dpr);
        const th = Math.round(rect.height * this.dpr);
        if (this.canvas.width !== tw || this.canvas.height !== th) {
          this.canvas.width = tw;
          this.canvas.height = th;
          this.width = tw;
          this.height = th;
          this.centerX = tw / 2;
          this.centerY = th / 2;
          this.radius = Math.min(this.centerX, this.centerY) * 0.8;
        }
      }
    };
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(this.canvas);
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 40);
  }

  initEvents() {
    if (!this.canvas) return;

    let cachedRect = null;
    const updateRect = () => {
      cachedRect = this.canvas.getBoundingClientRect();
    };

    const getCanvasCoords = (e) => {
      if (!cachedRect) updateRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dprScale = this.width / (cachedRect.width || 1);
      return {
        x: (clientX - cachedRect.left) * dprScale - this.centerX,
        y: (clientY - cachedRect.top) * dprScale - this.centerY
      };
    };

    const startDrag = (e) => {
      updateRect();
      const pos = getCanvasCoords(e);
      const dist = Math.hypot(pos.x - this.sourceX, pos.y - this.sourceY);
      if (dist < 32 * this.dpr) {
        this.isDragging = true;
        this.isOrbiting = false;
        if (this.orbitToggleBtn) this.orbitToggleBtn.classList.remove('active');
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

    this.canvas.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', doDrag, { passive: true });
    window.addEventListener('touchend', endDrag);
  }

  setPresetAngle(angleKey) {
    this.isOrbiting = false;
    if (this.orbitToggleBtn) this.orbitToggleBtn.classList.remove('active');

    switch (angleKey) {
      case 'front':
        this.sourceX = 0;
        this.sourceY = -this.radius * 0.85;
        break;
      case 'left':
        this.sourceX = -this.radius * 0.85;
        this.sourceY = 0;
        break;
      case 'right':
        this.sourceX = this.radius * 0.85;
        this.sourceY = 0;
        break;
      case 'behind':
        this.sourceX = 0;
        this.sourceY = this.radius * 0.85;
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
      this.draw(0.016);
    }
  }

  setElevation(zMeter) {
    this.sourceZ = parseFloat(zMeter);
    this.updateAudioPosition();
  }

  updateAudioPosition() {
    const audioX = (this.sourceX / (this.radius || 1)) * 4.0;
    const audioY = (-this.sourceY / (this.radius || 1)) * 4.0;
    const audioZ = this.sourceZ;

    if (window.audioEngine) {
      window.audioEngine.set3DPosition(audioX, audioZ, -audioY);
    }

    const azimuthDeg = Math.round((Math.atan2(this.sourceX, -this.sourceY) * 180) / Math.PI);
    const distanceMeters = Math.hypot(audioX, audioY, audioZ).toFixed(1);

    const azText = `${azimuthDeg > 0 ? '+' : ''}${azimuthDeg}°`;
    const distText = `${distanceMeters}m`;

    if (this.elAz && this.lastAzText !== azText) {
      this.elAz.textContent = azText;
      this.lastAzText = azText;
    }
    if (this.elDist && this.lastDistText !== distText) {
      this.elDist.textContent = distText;
      this.lastDistText = distText;
    }
  }

  draw(dt) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const dpr = this.dpr;

    ctx.clearRect(0, 0, this.width, this.height);

    // 1. 3D Radial Soundstage Rings
    const step = this.radius / 3;
    for (let r = step; r <= this.radius; r += step) {
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = Math.abs(r - this.radius) < 2 ? 'rgba(0, 194, 203, 0.4)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = Math.abs(r - this.radius) < 2 ? 1.5 * dpr : 1 * dpr;
      ctx.setLineDash(Math.abs(r - this.radius) < 2 ? [] : [3 * dpr, 3 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Crosshair Axes
    ctx.beginPath();
    ctx.moveTo(this.centerX - this.radius, this.centerY);
    ctx.lineTo(this.centerX + this.radius, this.centerY);
    ctx.moveTo(this.centerX, this.centerY - this.radius);
    ctx.lineTo(this.centerX, this.centerY + this.radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    // Cardinal Labels
    ctx.font = `${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(0, 194, 203, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('FRONT', this.centerX, this.centerY - this.radius + 14 * dpr);
    ctx.fillText('BACK', this.centerX, this.centerY + this.radius - 6 * dpr);
    ctx.fillText('L', this.centerX - this.radius + 12 * dpr, this.centerY + 4 * dpr);
    ctx.fillText('R', this.centerX + this.radius - 12 * dpr, this.centerY + 4 * dpr);

    // 3. Center Listener Head
    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    // Head Core
    ctx.beginPath();
    ctx.arc(0, 0, 16 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2433';
    ctx.strokeStyle = '#00c2cb';
    ctx.lineWidth = 2 * dpr;
    ctx.fill();
    ctx.stroke();

    // Ear Indicators
    ctx.fillStyle = '#00c2cb';
    ctx.fillRect(-20 * dpr, -4 * dpr, 3 * dpr, 8 * dpr);
    ctx.fillRect(17 * dpr, -4 * dpr, 3 * dpr, 8 * dpr);

    // Nose direction
    ctx.beginPath();
    ctx.moveTo(-5 * dpr, -16 * dpr);
    ctx.lineTo(0, -23 * dpr);
    ctx.lineTo(5 * dpr, -16 * dpr);
    ctx.fillStyle = '#00c2cb';
    ctx.fill();
    ctx.restore();

    // 4. Auto 3D Orbit Delta-Time Calculation (Independent of 60Hz/144Hz/240Hz)
    if (this.isOrbiting && !this.isDragging) {
      const safeDt = Math.max(0.001, Math.min(0.05, dt || 0.016));
      this.orbitAngle += (this.baseOrbitSpeed * 60) * this.speedMultiplier * safeDt;
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
        this.sourceX = Math.sin(this.orbitAngle) * rad;
        this.sourceY = -Math.cos(this.orbitAngle) * rad;
      }
      this.updateAudioPosition();
    }

    // 5. Sound Beam Connection
    const targetX = this.centerX + this.sourceX;
    const targetY = this.centerY + this.sourceY;

    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = 'rgba(0, 194, 203, 0.45)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([3 * dpr, 3 * dpr]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Glowing 3D Audio Source Node
    ctx.beginPath();
    ctx.arc(targetX, targetY, 11 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#00c2cb';
    ctx.fill();

    // Concentric Halo Ring
    const pulseOffset = (Math.sin(Date.now() / 120) * 3 + 4) * dpr;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 11 * dpr + pulseOffset, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 194, 203, 0.5)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();

    // Source Label
    ctx.font = `${Math.round(9 * dpr)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('3D SOURCE', targetX, targetY - 16 * dpr);
  }

  startLoop() {
    let lastTime = performance.now();
    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      this.draw(dt);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
}

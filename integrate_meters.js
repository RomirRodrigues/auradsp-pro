const fs = require('fs');

// --- 1. INDEX.HTML Updates ---
let html = fs.readFileSync('index.html', 'utf8');

// We will replace the simple "OUTPUT VU METERS" with a comprehensive Professional Output Section.
// Let's find the old VU meter block.
const vuStart = html.indexOf('<div class="vu-meter-container">');
const vuEnd = html.indexOf('</div>\n      </div>\n\n    </aside>');

const proMeterHTML = `<!-- PROFESSIONAL METERING SECTION -->
      <div class="pro-metering-container">
        <h4 class="god-mode-title" style="margin-bottom:10px; font-size:0.8rem;">OUTPUT & METERING</h4>
        
        <div class="meter-grid">
          <!-- Input Meters -->
          <div class="meter-block">
            <div class="meter-label">INPUT L/R</div>
            <div class="vu-bars" id="inputMeterBars">
              <div class="vu-channel">
                <div class="vu-fill" id="inPeakL"></div>
                <div class="vu-rms" id="inRmsL"></div>
              </div>
              <div class="vu-channel">
                <div class="vu-fill" id="inPeakR"></div>
                <div class="vu-rms" id="inRmsR"></div>
              </div>
            </div>
            <div class="meter-readout">
              <span id="inReadoutL">-∞</span> / <span id="inReadoutR">-∞</span> dB
            </div>
          </div>

          <!-- Output Meters -->
          <div class="meter-block">
            <div class="meter-label">OUTPUT L/R</div>
            <div class="vu-bars" id="outputMeterBars">
              <div class="vu-channel">
                <div class="vu-fill" id="outPeakL"></div>
                <div class="vu-rms" id="outRmsL"></div>
                <div class="clip-led" id="clipL"></div>
              </div>
              <div class="vu-channel">
                <div class="vu-fill" id="outPeakR"></div>
                <div class="vu-rms" id="outRmsR"></div>
                <div class="clip-led" id="clipR"></div>
              </div>
            </div>
            <div class="meter-readout" style="color:var(--accent-cyan);">
              <span id="outReadoutL">-∞</span> / <span id="outReadoutR">-∞</span> dBTP
            </div>
          </div>
        </div>

        <div class="meter-grid" style="margin-top:10px;">
          <!-- Correlation Meter -->
          <div class="meter-block" style="flex:1;">
            <div class="meter-label">PHASE CORRELATION</div>
            <div class="correlation-bar">
              <div class="corr-center"></div>
              <div class="corr-indicator" id="corrIndicator"></div>
            </div>
            <div class="meter-readout" style="display:flex; justify-content:space-between;">
              <span>-1</span><span>0</span><span>+1</span>
            </div>
          </div>
        </div>

      </div>`;

if (vuStart !== -1 && vuEnd !== -1) {
  html = html.substring(0, vuStart) + proMeterHTML + '\n' + html.substring(vuEnd);
  fs.writeFileSync('index.html', html);
} else {
  console.log("Could not find VU meter block in HTML");
}

// --- 2. STYLES.CSS Updates ---
let css = fs.readFileSync('styles.css', 'utf8');

const proMeterCSS = `
/* =========================================
   PROFESSIONAL METERING STYLES
   ========================================= */
.pro-metering-container {
  background: #121214;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
}

.meter-grid {
  display: flex;
  gap: 15px;
}

.meter-block {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meter-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: #888;
  letter-spacing: 1px;
  margin-bottom: 5px;
  text-align: center;
}

.vu-bars {
  background: #080808;
  border: 1px solid #222;
  border-radius: 2px;
  height: 120px;
  display: flex;
  gap: 2px;
  padding: 2px;
  position: relative;
}

.vu-channel {
  flex: 1;
  background: #111;
  position: relative;
  border-radius: 1px;
  overflow: hidden;
}

.vu-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0%;
  background: linear-gradient(0deg, #4cd137 0%, #4cd137 60%, #fbc531 85%, #e84118 95%);
  transition: height 0.05s ease-out;
  opacity: 0.7;
}

.vu-rms {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0%;
  background: rgba(255, 255, 255, 0.8);
  transition: height 0.1s ease-out;
  box-shadow: 0 -2px 4px rgba(255,255,255,0.5);
  z-index: 2;
  border-top: 1px solid #fff;
}

.clip-led {
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 4px;
  background: #330000;
  border-radius: 1px;
  z-index: 5;
  transition: background 0.1s;
}

.clip-led.clipping {
  background: #ff0000;
  box-shadow: 0 0 8px #ff0000;
}

.meter-readout {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: #aaa;
  text-align: center;
  margin-top: 5px;
}

.correlation-bar {
  background: #080808;
  border: 1px solid #222;
  height: 12px;
  border-radius: 2px;
  position: relative;
  display: flex;
  align-items: center;
}

.corr-center {
  position: absolute;
  left: 50%;
  width: 1px;
  height: 100%;
  background: #555;
  z-index: 1;
}

.corr-indicator {
  position: absolute;
  left: 50%;
  width: 4px;
  height: 10px;
  background: #00f0ff;
  border-radius: 1px;
  transform: translateX(-50%);
  transition: left 0.1s ease-out;
  z-index: 2;
  box-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
}
`;

if (!css.includes('.pro-metering-container')) {
  css += '\n' + proMeterCSS;
  fs.writeFileSync('styles.css', css);
}

// --- 3. AUDIO-ENGINE.JS Updates ---
let audioCode = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

// We need to inject the AudioWorklet loading and connections.
// Since AudioWorklet is async, we modify init() to handle it, or load it after context creation.

const workletLoadCode = `
    // Load Meter Worklets
    if (this.ctx.audioWorklet) {
      this.ctx.audioWorklet.addModule('js/dsp/meter-worklet.js').then(() => {
        this.inputMeterNode = new AudioWorkletNode(this.ctx, 'meter-processor');
        this.outputMeterNode = new AudioWorkletNode(this.ctx, 'meter-processor');

        // Setup message handlers
        this.inputMeterNode.port.onmessage = (e) => {
          if (window.updateInputMeters) window.updateInputMeters(e.data);
        };
        this.outputMeterNode.port.onmessage = (e) => {
          if (window.updateOutputMeters) window.updateOutputMeters(e.data);
        };

        // Wire them up (Input is post-preGain, Output is post-limiter)
        this.preGainNode.connect(this.inputMeterNode);
        // The Limiter is already connected to Analyser. We can just tap the signal.
        this.limiterNode.connect(this.outputMeterNode);
      }).catch(err => console.error("Worklet load error:", err));
    }
`;

// Insert after analyserNode creation (around line 225)
const analyserCreateMatch = 'this.analyserNode.smoothingTimeConstant = 0.8;';
if (audioCode.includes(analyserCreateMatch) && !audioCode.includes('this.ctx.audioWorklet.addModule')) {
  audioCode = audioCode.replace(analyserCreateMatch, analyserCreateMatch + '\n' + workletLoadCode);
  fs.writeFileSync('js/audio/audio-engine.js', audioCode);
} else {
  console.log("Could not inject worklet loader into audio-engine.js");
}

console.log("UI and Engine updated for Pro Metering.");

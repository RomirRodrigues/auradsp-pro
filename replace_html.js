const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- VU Level Meter -->[\s\S]*?<div class="vu-meter-container">[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const newStr = `<!-- PROFESSIONAL METERING SECTION -->
        <div class="pro-metering-container">
          <h4 class="pro-dsp-title" style="margin-bottom:10px; font-size:0.75rem; text-align:center;">DSP METERING</h4>
          
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
              <div class="meter-readout" style="color:#4cd137;">
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

if (regex.test(html)) {
  html = html.replace(regex, newStr);
  fs.writeFileSync('index.html', html);
  console.log("HTML replaced successfully via Regex.");
} else {
  console.log("Regex failed.");
}

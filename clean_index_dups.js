const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startTag = '<!-- AURA EXTREME ENHANCEMENTS -->';
const endTag = '<!-- Footer - AuraDSP Pro -->';

const startIdx = html.indexOf(startTag);
const endIdx = html.indexOf(endTag);

const cleanSpatialEnding = `<!-- AURA EXTREME ENHANCEMENTS -->
      <div class="god-mode-container">
        <h4 class="god-mode-title">⚡ AURA EXTREME ENHANCEMENTS</h4>
        
        <div class="god-toggle-row">
          <label for="godBassToggle" class="god-label">🔥 Earthquake Bass</label>
          <label class="switch god-switch">
            <input type="checkbox" id="godBassToggle">
            <span class="slider round"></span>
          </label>
        </div>

        <div class="god-toggle-row">
          <label for="godClarityToggle" class="god-label">💎 Crystal Clarity</label>
          <label class="switch god-switch">
            <input type="checkbox" id="godClarityToggle">
            <span class="slider round"></span>
          </label>
        </div>

        <div class="god-toggle-row">
          <label for="godSpatialToggle" class="god-label">🌌 Omnipresent Surround</label>
          <label class="switch god-switch">
            <input type="checkbox" id="godSpatialToggle">
            <span class="slider round"></span>
          </label>
        </div>

        <div class="god-toggle-row">
          <label for="godOttToggle" class="god-label">💥 Aura OTT Dynamics</label>
          <label class="switch god-switch">
            <input type="checkbox" id="godOttToggle">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- 3D BINAURAL HEADSET OPTIMIZER & CROSSTALK MATRIX -->
      <div class="god-mode-container" style="margin-top: 15px; background: rgba(16, 20, 30, 0.85); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 14px; padding: 14px;">
        <h4 style="color:#00f0ff; font-size:0.85rem; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
          <span>🎧</span> BINAURAL HEADSET & CROSSTALK MATRIX
        </h4>

        <!-- Head Diameter (ITD Micro-Delay) -->
        <div class="slider-group" style="margin-bottom:10px;">
          <div class="slider-header" style="display:flex; justify-content:space-between; font-size:0.75rem;">
            <label for="headDiameter">Skull Size ITD Delay</label>
            <span id="headDiameterVal" style="color:#00f0ff; font-family:var(--font-mono);">18.5 cm</span>
          </div>
          <input type="range" id="headDiameter" min="12" max="24" value="18.5" step="0.5">
        </div>

        <!-- Speaker Crosstalk Matrix (Crossfeed) -->
        <div class="slider-group" style="margin-bottom:10px;">
          <div class="slider-header" style="display:flex; justify-content:space-between; font-size:0.75rem;">
            <label for="crosstalkAmount">Acoustic Speaker Crosstalk</label>
            <span id="crosstalkAmountVal" style="color:#00f0ff; font-family:var(--font-mono);">25%</span>
          </div>
          <input type="range" id="crosstalkAmount" min="0" max="80" value="25" step="1">
        </div>
      </div>

    </aside>

  </main>

  `;

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + cleanSpatialEnding + html.substring(endIdx);
  fs.writeFileSync('index.html', html);
  console.log('Cleaned up index.html bottom duplicates successfully.');
}

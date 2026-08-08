const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');

const meterLogic = `
  // --- PROFESSIONAL METERING LOGIC ---
  const elInPeakL = document.getElementById('inPeakL');
  const elInPeakR = document.getElementById('inPeakR');
  const elInRmsL = document.getElementById('inRmsL');
  const elInRmsR = document.getElementById('inRmsR');
  const inReadoutL = document.getElementById('inReadoutL');
  const inReadoutR = document.getElementById('inReadoutR');

  const elOutPeakL = document.getElementById('outPeakL');
  const elOutPeakR = document.getElementById('outPeakR');
  const elOutRmsL = document.getElementById('outRmsL');
  const elOutRmsR = document.getElementById('outRmsR');
  const outReadoutL = document.getElementById('outReadoutL');
  const outReadoutR = document.getElementById('outReadoutR');
  
  const clipL = document.getElementById('clipL');
  const clipR = document.getElementById('clipR');
  const corrIndicator = document.getElementById('corrIndicator');

  function dbToPercent(db) {
    if (db < -60) return 0;
    if (db > 0) return 100;
    return ((db + 60) / 60) * 100;
  }

  function linearToDb(val) {
    if (val <= 0.0001) return -100;
    return 20 * Math.log10(val);
  }

  window.updateInputMeters = (data) => {
    if (!elInPeakL) return;
    
    const peakL_dB = linearToDb(data.leftPeak);
    const peakR_dB = linearToDb(data.rightPeak);
    const rmsL_dB = linearToDb(data.leftRms);
    const rmsR_dB = linearToDb(data.rightRms);

    elInPeakL.style.height = dbToPercent(peakL_dB) + '%';
    elInPeakR.style.height = dbToPercent(peakR_dB) + '%';
    elInRmsL.style.height = dbToPercent(rmsL_dB) + '%';
    elInRmsR.style.height = dbToPercent(rmsR_dB) + '%';

    inReadoutL.textContent = peakL_dB < -60 ? '-∞' : peakL_dB.toFixed(1);
    inReadoutR.textContent = peakR_dB < -60 ? '-∞' : peakR_dB.toFixed(1);
  };

  window.updateOutputMeters = (data) => {
    if (!elOutPeakL) return;
    
    const peakL_dB = linearToDb(data.leftPeak);
    const peakR_dB = linearToDb(data.rightPeak);
    const rmsL_dB = linearToDb(data.leftRms);
    const rmsR_dB = linearToDb(data.rightRms);

    elOutPeakL.style.height = dbToPercent(peakL_dB) + '%';
    elOutPeakR.style.height = dbToPercent(peakR_dB) + '%';
    elOutRmsL.style.height = dbToPercent(rmsL_dB) + '%';
    elOutRmsR.style.height = dbToPercent(rmsR_dB) + '%';

    outReadoutL.textContent = peakL_dB < -60 ? '-∞' : peakL_dB.toFixed(1);
    outReadoutR.textContent = peakR_dB < -60 ? '-∞' : peakR_dB.toFixed(1);

    // Clip LEDs
    if (peakL_dB >= -0.1) clipL.classList.add('clipping');
    else clipL.classList.remove('clipping');

    if (peakR_dB >= -0.1) clipR.classList.add('clipping');
    else clipR.classList.remove('clipping');

    // Correlation Meter (-1 to +1 -> 0% to 100%)
    if (corrIndicator) {
      const corrPercent = ((data.correlation + 1) / 2) * 100;
      corrIndicator.style.left = corrPercent + '%';
    }
  };
`;

// Insert it into DOMContentLoaded
appJs = appJs.replace('// --- PRO DSP UI LOGIC ---', meterLogic + '\n  // --- PRO DSP UI LOGIC ---');
fs.writeFileSync('js/app.js', appJs);
console.log("Meters bound to UI");

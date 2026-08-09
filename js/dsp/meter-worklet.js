// js/dsp/meter-worklet.js

class MeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.leftPeak = 0;
    this.rightPeak = 0;
    this.leftSumSquares = 0;
    this.rightSumSquares = 0;
    this.sampleCount = 0;
    
    // For Stereo Correlation
    this.crossSum = 0;

    // LUFS buffers (rolling window)
    this.lufsHistory = [];
    this.maxLufsHistory = 180; // ~3 seconds at 60fps

    // Send updates every 16ms (~60fps)
    this.updateInterval = sampleRate * 0.016; 
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channelL = input[0];
    const channelR = input[1] || input[0]; // Fallback to mono if no right channel

    // Pass audio through unchanged
    if (outputs[0]) {
      if (outputs[0][0]) outputs[0][0].set(channelL);
      if (outputs[0][1]) outputs[0][1].set(channelR);
    }

    // Metering Math
    for (let i = 0; i < channelL.length; i++) {
      const l = channelL[i];
      const r = channelR[i];
      
      const absL = Math.abs(l);
      const absR = Math.abs(r);

      if (absL > this.leftPeak) this.leftPeak = absL;
      if (absR > this.rightPeak) this.rightPeak = absR;

      this.leftSumSquares += l * l;
      this.rightSumSquares += r * r;
      this.crossSum += l * r;
      
      this.sampleCount++;
    }

    if (this.sampleCount >= this.updateInterval) {
      // Calculate RMS
      const leftRms = Math.sqrt(this.leftSumSquares / this.sampleCount);
      const rightRms = Math.sqrt(this.rightSumSquares / this.sampleCount);

      // Calculate Correlation (Pearson coefficient approximation)
      let correlation = 0;
      const denom = Math.sqrt(this.leftSumSquares * this.rightSumSquares);
      if (denom > 0) {
        correlation = this.crossSum / denom;
      }

      // LUFS Momentary (400ms ~ 25 frames) & Short-term (3s ~ 180 frames)
      const meanSquareCurrent = (this.leftSumSquares + this.rightSumSquares) / (2 * this.sampleCount);
      this.lufsHistory.push(meanSquareCurrent);
      if (this.lufsHistory.length > this.maxLufsHistory) {
        this.lufsHistory.shift();
      }

      // Momentary (last 25 frames)
      const momFrames = this.lufsHistory.slice(-25);
      const momPower = momFrames.reduce((a, b) => a + b, 0) / (momFrames.length || 1);
      const lufsMomentary = momPower > 0.00000001 ? -0.691 + 10 * Math.log10(momPower) : -100;

      // Short-Term (all 180 frames)
      const stPower = this.lufsHistory.reduce((a, b) => a + b, 0) / (this.lufsHistory.length || 1);
      const lufsShortTerm = stPower > 0.00000001 ? -0.691 + 10 * Math.log10(stPower) : -100;

      // Send to main thread
      this.port.postMessage({
        leftPeak: this.leftPeak,
        rightPeak: this.rightPeak,
        leftRms: leftRms,
        rightRms: rightRms,
        correlation: correlation,
        lufsMomentary: lufsMomentary,
        lufsShortTerm: lufsShortTerm
      });

      // Reset accumulators
      this.leftPeak = 0;
      this.rightPeak = 0;
      this.leftSumSquares = 0;
      this.rightSumSquares = 0;
      this.crossSum = 0;
      this.sampleCount = 0;
    }

    return true;
  }
}

registerProcessor('meter-processor', MeterProcessor);

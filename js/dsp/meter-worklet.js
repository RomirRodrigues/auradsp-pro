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
      // r = sum(xy) / sqrt(sum(x^2) * sum(y^2))
      let correlation = 0;
      const denom = Math.sqrt(this.leftSumSquares * this.rightSumSquares);
      if (denom > 0) {
        correlation = this.crossSum / denom;
      }

      // Send to main thread
      this.port.postMessage({
        leftPeak: this.leftPeak,
        rightPeak: this.rightPeak,
        leftRms: leftRms,
        rightRms: rightRms,
        correlation: correlation
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

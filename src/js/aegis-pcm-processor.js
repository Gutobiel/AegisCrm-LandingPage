/**
 * AEGIS Voice AI — AudioWorklet PCM Stream Processor
 * Continuous, gapless real-time PCM audio playback processor.
 * Consumes PCM Float32 audio samples continuously without per-chunk AudioNode recreations.
 */

class AegisPCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // 24,000 Hz sample rate default (30-second ring buffer capacity)
    this.buffer = new Float32Array(24000 * 30);
    this.writeIndex = 0;
    this.readIndex = 0;
    this.sampleCount = 0;

    // States: 'BUFFER_EMPTY', 'BUFFER_FILLING', 'BUFFER_PLAYING', 'BUFFER_STARVING', 'BUFFER_STOPPED'
    this.state = 'BUFFER_EMPTY';
    this.currentGenerationId = null;

    // Fast startup buffer threshold: ~20ms @ 24kHz = 512 samples
    this.startBufferSamples = 512;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case 'set_generation':
          this.currentGenerationId = data.generationId;
          break;

        case 'samples':
          if (data.generationId && this.currentGenerationId && data.generationId !== this.currentGenerationId) {
            return;
          }
          this._appendSamples(data.samples);
          break;

        case 'flush':
        case 'audio_end':
          if (this.sampleCount > 0 && this.state !== 'BUFFER_PLAYING') {
            this.state = 'BUFFER_PLAYING';
            this.port.postMessage({ type: 'playback_started', generationId: this.currentGenerationId });
          }
          break;

        case 'clear':
        case 'stop':
          this._clearBuffer();
          this.state = 'BUFFER_STOPPED';
          this.port.postMessage({ type: 'state_change', state: this.state });
          break;

        case 'config':
          if (data.startBufferMs) {
            this.startBufferSamples = Math.floor((data.startBufferMs / 1000) * sampleRate);
          }
          break;
      }
    };
  }

  _appendSamples(samples) {
    if (!samples || samples.length === 0) return;

    for (let i = 0; i < samples.length; i++) {
      this.buffer[this.writeIndex] = samples[i];
      this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
    }
    this.sampleCount += samples.length;

    // Immediately start playing once min samples are available
    if (this.state !== 'BUFFER_PLAYING' && this.sampleCount >= this.startBufferSamples) {
      this.state = 'BUFFER_PLAYING';
      this.port.postMessage({ type: 'playback_started', generationId: this.currentGenerationId });
    }
  }

  _clearBuffer() {
    this.writeIndex = 0;
    this.readIndex = 0;
    this.sampleCount = 0;
    this.currentGenerationId = null;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output || output.length === 0) return true;
    const channel = output[0];
    const bufferSize = channel.length; // usually 128 samples

    if (this.state !== 'BUFFER_PLAYING' || this.sampleCount === 0) {
      // Output silence when not playing
      for (let i = 0; i < bufferSize; i++) {
        channel[i] = 0;
      }
      return true;
    }

    let samplesRead = 0;
    for (let i = 0; i < bufferSize; i++) {
      if (this.sampleCount > 0) {
        channel[i] = this.buffer[this.readIndex];
        this.readIndex = (this.readIndex + 1) % this.buffer.length;
        this.sampleCount--;
        samplesRead++;
      } else {
        channel[i] = 0;
      }
    }

    // Duplicate left channel to right channel if stereo output
    if (output.length > 1) {
      output[1].set(channel);
    }

    // Calculate RMS amplitude for visualizer
    let sum = 0;
    for (let i = 0; i < bufferSize; i++) {
      sum += channel[i] * channel[i];
    }
    const rms = Math.sqrt(sum / bufferSize);
    this.port.postMessage({ type: 'amplitude', amplitude: rms });

    // Buffer underrun detection when queue empties
    if (this.sampleCount === 0 && samplesRead < bufferSize) {
      if (this.state !== 'BUFFER_STARVING') {
        this.state = 'BUFFER_STARVING';
        this.port.postMessage({ type: 'underrun' });
      }
    }

    return true;
  }
}

registerProcessor('aegis-pcm-processor', AegisPCMProcessor);

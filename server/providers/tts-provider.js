/**
 * AEGIS Voice AI — TTS Provider (Kokoro)
 * Converts text to speech using the local Kokoro TTS FastAPI server.
 */

const config = require('../voice-config');
const voiceLog = require('../voice-logger');

class KokoroTTSProvider {
  constructor() {
    this.apiUrl = config.tts.apiUrl;
    this.voice = config.tts.voice;
    this.responseFormat = config.tts.responseFormat;
  }

  /**
   * Synthesize text into audio.
   * @param {string} text - Text to convert to speech
   * @param {AbortSignal} signal - AbortSignal for cancellation
   * @param {string} sessionId - For logging
   * @returns {Promise<Buffer|null>} WAV audio buffer or null on failure
   */
  async synthesize(text, signal = null, sessionId = '', retries = 5) {
    if (!text || !text.trim()) return null;

    const startTime = Date.now();

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: text.trim(),
            voice: this.voice,
            response_format: this.responseFormat,
          }),
        };

        if (signal) {
          fetchOptions.signal = signal;
        }

        const response = await fetch(this.apiUrl, fetchOptions);

        if (!response.ok) {
          console.error(`[KokoroTTS] Attempt ${attempt + 1}/${retries} status ${response.status}`);
          if (attempt < retries - 1) {
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }
          return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const latencyMs = Date.now() - startTime;

        voiceLog.log(voiceLog.EVENTS.TTS_FIRST_AUDIO, {
          sessionId,
          latencyMs,
          textLength: text.length,
          audioBytes: buffer.length,
        });

        return buffer;
      } catch (err) {
        if (err.name === 'AbortError') {
          // Cancelled — expected during barge-in
          return null;
        }

        console.warn(`[KokoroTTS] Attempt ${attempt + 1}/${retries} failed (${err.message})`);
        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        voiceLog.log(voiceLog.EVENTS.ERROR, {
          sessionId,
          error: 'TTS_ERROR',
          message: err.message,
        });
        return null;
      }
    }
    return null;
  }

  /**
   * Check if Kokoro server is available.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const healthUrl = this.apiUrl.replace('/v1/audio/speech', '/health');
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

module.exports = { KokoroTTSProvider };

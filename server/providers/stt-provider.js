/**
 * AEGIS Voice AI — STT Provider (Whisper API)
 * Converts audio buffer to text using OpenAI Whisper API.
 */

const config = require('../voice-config');
const voiceLog = require('../voice-logger');

class WhisperSTTProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = config.stt.apiUrl;
    this.model = config.stt.model;
    this.language = config.stt.language;
  }

  get key() {
    return this.apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Transcribe an audio buffer to text.
   * @param {Buffer} audioBuffer - WAV audio buffer
   * @param {string} sessionId - For logging
   * @returns {Promise<string>} Transcribed text
   */
  async transcribe(audioBuffer, sessionId = '') {
    const apiKey = this.key;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured for STT');
    }

    if (!audioBuffer || audioBuffer.length < 100) {
      return '';
    }

    const startTime = Date.now();
    voiceLog.log(voiceLog.EVENTS.STT_STARTED, { sessionId });

    try {
      // Build multipart form data manually (no external dependency needed)
      const boundary = '----VoiceAI' + Date.now().toString(36);
      const parts = [];

      // File part
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="audio.wav"\r\n` +
        `Content-Type: audio/wav\r\n\r\n`
      );
      parts.push(audioBuffer);
      parts.push('\r\n');

      // Model part
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="model"\r\n\r\n` +
        `${this.model}\r\n`
      );

      // Language part
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="language"\r\n\r\n` +
        `${this.language}\r\n`
      );

      // Response format
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
        `json\r\n`
      );

      parts.push(`--${boundary}--\r\n`);

      // Combine all parts into a single buffer
      const bodyParts = parts.map(p => typeof p === 'string' ? Buffer.from(p) : p);
      const body = Buffer.concat(bodyParts);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const text = (data.text || '').trim();
      const latencyMs = Date.now() - startTime;

      voiceLog.log(voiceLog.EVENTS.STT_COMPLETED, {
        sessionId,
        latencyMs,
        textLength: text.length,
      });

      return text;
    } catch (err) {
      voiceLog.log(voiceLog.EVENTS.ERROR, {
        sessionId,
        error: 'STT_ERROR',
        message: err.message,
      });
      throw err;
    }
  }
}

module.exports = { WhisperSTTProvider };

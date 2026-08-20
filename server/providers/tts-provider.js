/**
 * AEGIS Voice AI — TTS Provider (Kokoro with OpenAI Fallback)
 * Converts text to speech using local Kokoro TTS, falling back automatically
 * to OpenAI TTS API (tts-1) when deployed on cloud (Railway/Heroku/VPS).
 */

const config = require('../voice-config');
const voiceLog = require('../voice-logger');

class KokoroTTSProvider {
  constructor(apiKey = '') {
    this.apiKey = apiKey;
    this.apiUrl = config.tts.apiUrl;
    this.voice = config.tts.voice;
    this.responseFormat = config.tts.responseFormat;
    this.isKokoroDown = false;
  }

  get key() {
    return this.apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Synthesize text into audio using OpenAI TTS fallback.
   */
  async synthesizeOpenAI(text, signal = null, sessionId = '') {
    const apiKey = this.key;
    if (!apiKey) {
      console.warn('[TTSProvider] Chave OPENAI_API_KEY não configurada para fallback de TTS');
      return null;
    }

    const startTime = Date.now();

    try {
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.trim(),
          voice: 'alloy',
          response_format: 'wav',
        }),
      };

      if (signal) {
        fetchOptions.signal = signal;
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', fetchOptions);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[OpenAITTS] Erro na API OpenAI TTS (${response.status}): ${errText}`);
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
        provider: 'openai-tts',
      });

      return buffer;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      console.error(`[OpenAITTS] Falha no fallback do OpenAI TTS: ${err.message}`);
      return null;
    }
  }

  /**
   * Synthesize text into audio (Kokoro first, OpenAI fallback second).
   * @param {string} text - Text to convert to speech
   * @param {AbortSignal} signal - AbortSignal for cancellation
   * @param {string} sessionId - For logging
   * @returns {Promise<Buffer|null>} WAV audio buffer or null on failure
   */
  async synthesize(text, signal = null, sessionId = '') {
    if (!text || !text.trim()) return null;

    if (!this.isKokoroDown) {
      const startTime = Date.now();
      try {
        const fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: text.trim(),
            voice: this.voice,
            response_format: this.responseFormat,
          }),
          signal: signal || AbortSignal.timeout(3500),
        };

        const response = await fetch(this.apiUrl, fetchOptions);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const latencyMs = Date.now() - startTime;

          voiceLog.log(voiceLog.EVENTS.TTS_FIRST_AUDIO, {
            sessionId,
            latencyMs,
            textLength: text.length,
            audioBytes: buffer.length,
            provider: 'kokoro-tts',
          });

          return buffer;
        } else {
          console.warn(`[KokoroTTS] Status ${response.status}. Ativando fallback OpenAI TTS...`);
        }
      } catch (err) {
        if (err.name === 'AbortError' && signal && signal.aborted) {
          return null;
        }
        console.warn(`[KokoroTTS] Servidor Kokoro local indisponível (${err.message}). Redirecionando para OpenAI TTS...`);
        this.isKokoroDown = true;
        setTimeout(() => { this.isKokoroDown = false; }, 60000);
      }
    }

    return await this.synthesizeOpenAI(text, signal, sessionId);
  }

  /**
   * Check if Kokoro server is available.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const healthUrl = this.apiUrl.replace('/v1/audio/speech', '/health');
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

module.exports = { KokoroTTSProvider };

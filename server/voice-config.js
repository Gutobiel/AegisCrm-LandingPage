/**
 * AEGIS Voice AI — Centralized Configuration
 * All voice pipeline settings in one place.
 */

const path = require('path');

module.exports = {
  // ─── VAD (Voice Activity Detection) ─────────────────────────
  vad: {
    threshold: 0.02,                // RMS threshold for normal listening
    minSpeechDurationMs: 300,       // min speech duration to confirm speech in listening mode
    silenceDurationMs: 1100,        // ms of silence before speech end
    bargeInThreshold: 0.07,         // higher RMS threshold during AI speaking (avoid self-echo/ambient noise)
    bargeInMinDurationMs: 450,      // min continuous human voice duration to trigger barge-in
    cooldownMs: 600,                // protection window after AI speech before normal listening resumes
  },

  // ─── STT (Speech-to-Text) ──────────────────────────────────
  stt: {
    provider: 'whisper-api',      // 'whisper-api' (OpenAI remote)
    model: 'whisper-1',
    language: 'pt',
    apiUrl: 'https://api.openai.com/v1/audio/transcriptions',
  },

  // ─── LLM (Language Model) ──────────────────────────────────
  llm: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 100,               // 1-2 concise sentences max for fast TTS single-pass
    temperature: 0.7,
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    maxHistoryMessages: 20,       // keep last N messages for context
  },

  // ─── TTS (Text-to-Speech / Kokoro) ─────────────────────────
  tts: {
    provider: 'kokoro',
    apiUrl: process.env.KOKORO_TTS_URL || 'http://127.0.0.1:8880/v1/audio/speech',
    voice: 'active',              // uses the active voice profile from kokoro_server
    responseFormat: 'wav',
    sampleRate: 24000,
  },

  // ─── Audio Format ──────────────────────────────────────────
  audio: {
    inputSampleRate: 16000,       // mic capture sample rate
    inputChannels: 1,
    inputBitDepth: 16,
    outputSampleRate: 24000,      // Kokoro output
    outputChannels: 1,
  },

  // ─── Session & Security ────────────────────────────────────
  session: {
    maxDurationMs: 15 * 60 * 1000,       // 15 minutes max per session
    maxConcurrentSessions: 5,
    maxSessionsPerIp: 2,
    inactivityTimeoutMs: 2 * 60 * 1000,  // 2 minutes of inactivity
    maxChunkSizeBytes: 64 * 1024,        // 64KB max per audio chunk
  },

  // ─── Greeting ──────────────────────────────────────────────
  greeting: {
    text: 'Oi, como posso te ajudar hoje?',
    preGenerated: true,     // use pre-generated greeting audio
  },

  // ─── Logs ──────────────────────────────────────────────────
  logs: {
    dir: path.resolve(__dirname, '..', 'logs', 'voice'),
    structured: true,
  },
};

/**
 * AEGIS Voice AI — Structured Voice Logger
 * Structured JSON logs for voice events without sensitive data.
 */

const fs = require('fs');
const path = require('path');
const config = require('./voice-config');

const LOGS_DIR = config.logs.dir;
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const EVENTS = {
  SESSION_CREATED:   'VOICE_SESSION_CREATED',
  SESSION_STARTED:   'VOICE_SESSION_STARTED',
  SPEECH_STARTED:    'VOICE_SPEECH_STARTED',
  SPEECH_ENDED:      'VOICE_SPEECH_ENDED',
  STT_STARTED:       'VOICE_STT_STARTED',
  STT_COMPLETED:     'VOICE_STT_COMPLETED',
  LLM_STARTED:       'VOICE_LLM_STARTED',
  LLM_FIRST_TOKEN:   'VOICE_LLM_FIRST_TOKEN',
  LLM_COMPLETED:     'VOICE_LLM_COMPLETED',
  TTS_STARTED:       'VOICE_TTS_STARTED',
  TTS_FIRST_AUDIO:   'VOICE_TTS_FIRST_AUDIO',
  TTS_COMPLETED:     'VOICE_TTS_COMPLETED',
  INTERRUPTED:       'VOICE_INTERRUPTED',
  SESSION_ENDED:     'VOICE_SESSION_ENDED',
  ERROR:             'VOICE_ERROR',
};

/**
 * Log a structured voice event.
 * @param {string} event - Event name from EVENTS
 * @param {object} data - Event data (sessionId, generationId, latencyMs, etc.)
 */
function log(event, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...data,
  };

  // Console output
  const emoji = getEmoji(event);
  console.log(`${emoji} [Voice] ${event}`, data.sessionId ? `session=${data.sessionId.substring(0, 8)}` : '', data.latencyMs ? `${data.latencyMs}ms` : '');

  // File output (append to daily log)
  if (config.logs.structured) {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const logFile = path.join(LOGS_DIR, `voice_${dateStr}.jsonl`);
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (err) {
      console.error('[VoiceLogger] Write error:', err.message);
    }
  }
}

function getEmoji(event) {
  const map = {
    [EVENTS.SESSION_CREATED]: '🆕',
    [EVENTS.SESSION_STARTED]: '🟢',
    [EVENTS.SPEECH_STARTED]:  '🎙️',
    [EVENTS.SPEECH_ENDED]:    '🔇',
    [EVENTS.STT_STARTED]:     '📝',
    [EVENTS.STT_COMPLETED]:   '✅',
    [EVENTS.LLM_STARTED]:     '🧠',
    [EVENTS.LLM_FIRST_TOKEN]: '💬',
    [EVENTS.LLM_COMPLETED]:   '✅',
    [EVENTS.TTS_STARTED]:     '🔊',
    [EVENTS.TTS_FIRST_AUDIO]: '🎵',
    [EVENTS.TTS_COMPLETED]:   '✅',
    [EVENTS.INTERRUPTED]:     '⚡',
    [EVENTS.SESSION_ENDED]:   '🔴',
    [EVENTS.ERROR]:           '❌',
  };
  return map[event] || '📋';
}

module.exports = { log, EVENTS };

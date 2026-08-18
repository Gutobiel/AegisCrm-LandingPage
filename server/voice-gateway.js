/**
 * AEGIS Voice AI — Voice Gateway
 * WebSocket-based real-time voice conversation pipeline.
 * Manages sessions, state machine, and orchestrates STT → LLM → TTS pipeline.
 */

const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const config = require('./voice-config');
const voiceLog = require('./voice-logger');
const { WhisperSTTProvider } = require('./providers/stt-provider');
const { OpenAIProvider } = require('./providers/llm-provider');
const { KokoroTTSProvider } = require('./providers/tts-provider');
const { ConversationManager, SentenceBuffer, splitSentences } = require('./conversation-manager');

// ─── Call States ──────────────────────────────────────────────
const STATES = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  GREETING: 'GREETING',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  SPEAKING: 'SPEAKING',
  INTERRUPTED: 'INTERRUPTED',
  ENDING: 'ENDING',
  ENDED: 'ENDED',
  ERROR: 'ERROR',
};

// ─── Session Store ───────────────────────────────────────────
const sessions = new Map();  // sessionId → Session object
const ipSessionCounts = new Map();  // ip → count

class VoiceSession {
  constructor(sessionId, ip) {
    this.sessionId = sessionId;
    this.ip = ip;
    this.state = STATES.IDLE;
    this.createdAt = Date.now();
    this.endedAt = null;
    this.conversation = new ConversationManager();
    this.generationId = null;
    this.ws = null;
    this.audioChunks = [];     // accumulated audio chunks from client
    this.currentAbort = null;  // AbortController for current LLM/TTS
    this.inactivityTimer = null;
    this.metrics = {
      totalTokens: 0,
      turnCount: 0,
    };
  }

  setState(newState) {
    if (this.state === newState) return;
    const oldState = this.state;
    this.state = newState;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ type: 'state_change', state: newState, previousState: oldState });
    }
    console.log(`[VOICE] stateChanged sessionId=${this.sessionId} oldState=${oldState} newState=${newState} timestamp=${Date.now()}`);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      voiceLog.log(voiceLog.EVENTS.ERROR, {
        sessionId: this.sessionId,
        error: 'INACTIVITY_TIMEOUT',
      });
      this.end('inactivity_timeout');
    }, config.session.inactivityTimeoutMs);
  }

  cancelCurrentGeneration() {
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }
  }

  end(reason = 'user_hangup') {
    this.cancelCurrentGeneration();
    clearTimeout(this.inactivityTimer);
    this.endedAt = Date.now();
    this.setState(STATES.ENDED);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'session_ended',
        reason,
        duration: this.endedAt - this.createdAt,
      });
      this.ws.close();
    }

    // Clean up
    const ip = this.ip;
    sessions.delete(this.sessionId);
    const count = (ipSessionCounts.get(ip) || 1) - 1;
    if (count <= 0) ipSessionCounts.delete(ip);
    else ipSessionCounts.set(ip, count);

    voiceLog.log(voiceLog.EVENTS.SESSION_ENDED, {
      sessionId: this.sessionId,
      reason,
      durationMs: this.endedAt - this.createdAt,
      turnCount: this.metrics.turnCount,
    });
  }
}

// ─── Providers (initialized lazily) ─────────────────────────
let sttProvider = null;
let llmProvider = null;
let ttsProvider = null;

function initProviders(apiKey) {
  if (!sttProvider) sttProvider = new WhisperSTTProvider(apiKey);
  if (!llmProvider) llmProvider = new OpenAIProvider(apiKey);
  if (!ttsProvider) ttsProvider = new KokoroTTSProvider();
}

// ─── WAV Builder ─────────────────────────────────────────────
/**
 * Create a minimal WAV header + data for PCM 16-bit mono audio.
 * @param {Buffer} pcmData - Raw PCM data
 * @param {number} sampleRate
 * @returns {Buffer} WAV file buffer
 */
function buildWav(pcmData, sampleRate = 16000) {
  const header = Buffer.alloc(44);
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);       // fmt chunk size
  header.writeUInt16LE(1, 20);        // PCM format
  header.writeUInt16LE(1, 22);        // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);  // byte rate (16-bit mono)
  header.writeUInt16LE(2, 32);        // block align
  header.writeUInt16LE(16, 34);       // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

// ─── API: Create Session ─────────────────────────────────────
function createSession(ip) {
  // Rate limiting
  if (sessions.size >= config.session.maxConcurrentSessions) {
    return { error: 'TOO_MANY_SESSIONS', message: 'Servidor ocupado. Tente novamente em instantes.' };
  }

  const ipCount = ipSessionCounts.get(ip) || 0;
  if (ipCount >= config.session.maxSessionsPerIp) {
    return { error: 'TOO_MANY_SESSIONS_PER_IP', message: 'Limite de sessões atingido.' };
  }

  const sessionId = uuidv4();
  const session = new VoiceSession(sessionId, ip);
  sessions.set(sessionId, session);
  ipSessionCounts.set(ip, ipCount + 1);

  voiceLog.log(voiceLog.EVENTS.SESSION_CREATED, {
    sessionId,
    ip: ip.substring(0, 8) + '…',  // truncate for privacy
  });

  return { sessionId, status: 'created' };
}

// ─── API: End Session ────────────────────────────────────────
function endSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return { error: 'SESSION_NOT_FOUND' };
  session.end('user_hangup');
  return { status: 'ended' };
}

// ─── WebSocket Setup ─────────────────────────────────────────
function setupWebSocket(httpServer, apiKey) {
  initProviders(apiKey);

  const wss = new WebSocket.Server({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const match = url.pathname.match(/^\/ws\/voice\/([a-f0-9-]+)$/);

    if (!match) {
      socket.destroy();
      return;
    }

    const sessionId = match[1];
    const session = sessions.get(sessionId);

    if (!session) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }

    if (session.ws) {
      socket.write('HTTP/1.1 409 Conflict\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, sessionId);
    });
  });

  wss.on('connection', (ws, req, sessionId) => {
    const session = sessions.get(sessionId);
    if (!session) {
      ws.close();
      return;
    }

    session.ws = ws;
    session.setState(STATES.CONNECTING);

    voiceLog.log(voiceLog.EVENTS.SESSION_STARTED, { sessionId });

    // Send session_started event
    session.send({ type: 'session_started', sessionId });

    // Start with greeting
    handleGreeting(session);

    // Session duration limit
    const maxDurationTimer = setTimeout(() => {
      session.end('max_duration');
    }, config.session.maxDurationMs);

    // Handle messages from client
    ws.on('message', (raw) => {
      try {
        // Check chunk size limit
        if (raw.length > config.session.maxChunkSizeBytes) {
          session.send({ type: 'error', error: 'CHUNK_TOO_LARGE' });
          return;
        }

        const msg = JSON.parse(raw.toString());
        handleClientMessage(session, msg);
      } catch (err) {
        // Binary or malformed — ignore
      }
    });

    ws.on('close', () => {
      clearTimeout(maxDurationTimer);
      if (session.state !== STATES.ENDED) {
        session.end('ws_closed');
      }
    });

    ws.on('error', (err) => {
      console.error('[VoiceGateway] WS error:', err.message);
    });
  });

  return wss;
}

// ─── Handle Greeting ─────────────────────────────────────────
async function handleGreeting(session) {
  session.setState(STATES.GREETING);

  try {
    // Generate greeting audio via Kokoro
    const greetingText = config.greeting.text;
    const audioBuffer = await ttsProvider.synthesize(greetingText, null, session.sessionId);

    if (audioBuffer && session.state === STATES.GREETING) {
      session.setState(STATES.SPEAKING);
      session.ttsFinished = true;
      session.clientPlaybackFinished = false;
      session.chunksSent = 1;
      
      session.send({ type: 'tts_started', generationId: 'greeting' });
      console.log(`[VOICE] ttsStarted generationId=greeting timestamp=${Date.now()}`);
      
      const seq = 1;
      console.log(`[VOICE] audioChunkGenerated generationId=greeting sequence=${seq} timestamp=${Date.now()}`);
      
      // Send greeting audio as base64 chunk
      session.send({
        type: 'audio_chunk',
        generationId: 'greeting',
        sequence: seq,
        data: audioBuffer.toString('base64'),
        format: 'wav',
      });
      console.log(`[VOICE] audioChunkSent generationId=greeting sequence=${seq} timestamp=${Date.now()}`);
      
      console.log(`[VOICE] ttsFinished generationId=greeting lastSequence=${seq} timestamp=${Date.now()}`);
      session.send({ type: 'tts_finished', generationId: 'greeting', lastSequence: seq });
    } else {
      session.setState(STATES.LISTENING);
      session.send({ type: 'listening_started' });
      session.resetInactivityTimer();
    }
  } catch (err) {
    console.error('[VoiceGateway] Greeting error:', err.message);
    // Still transition to listening even if greeting fails
    session.setState(STATES.LISTENING);
    session.send({ type: 'listening_started' });
    session.resetInactivityTimer();
  }
}

// ─── Handle Client Messages ──────────────────────────────────
function handleClientMessage(session, msg) {
  session.resetInactivityTimer();

  switch (msg.type) {
    case 'audio_chunk':
      handleAudioChunk(session, msg);
      break;

    case 'speech_end':
      handleSpeechEnd(session);
      break;

    case 'interrupt':
      handleInterrupt(session);
      break;

    case 'hangup':
      session.end('user_hangup');
      break;

    case 'ping':
      session.send({ type: 'pong' });
      break;

    case 'playback_ended':
      handlePlaybackEnded(session, msg);
      break;

    default:
      break;
  }
}

// ─── Handle Playback Ended ───────────────────────────────────
function handlePlaybackEnded(session, msg) {
  session.clientPlaybackFinished = true;
  if (session.state === STATES.SPEAKING && session.ttsFinished) {
    session.setState(STATES.LISTENING);
    session.send({ type: 'listening_started' });
  }
}

// ─── Handle Audio Chunk ──────────────────────────────────────
function handleAudioChunk(session, msg) {
  if (session.state !== STATES.LISTENING && session.state !== STATES.SPEAKING) return;

  // During SPEAKING, audio chunks indicate potential barge-in
  // The frontend VAD handles barge-in detection and sends 'interrupt'
  if (session.state === STATES.SPEAKING) return;

  if (msg.data) {
    try {
      const chunk = Buffer.from(msg.data, 'base64');
      session.audioChunks.push(chunk);
    } catch (err) {
      // Invalid base64 — skip
    }
  }
}

// ─── Handle Speech End ───────────────────────────────────────
async function handleSpeechEnd(session) {
  if (session.state !== STATES.LISTENING) return;
  if (session.audioChunks.length === 0) return;

  session.send({ type: 'listening_stopped' });

  // Collect all audio chunks into a single buffer
  const pcmData = Buffer.concat(session.audioChunks);
  session.audioChunks = [];

  // Need at least some meaningful audio
  if (pcmData.length < 1600) {
    // Too short — go back to listening
    session.setState(STATES.LISTENING);
    session.send({ type: 'listening_started' });
    return;
  }

  // Build WAV from raw PCM
  const wavBuffer = buildWav(pcmData, config.audio.inputSampleRate);

  // Start processing pipeline
  session.setState(STATES.PROCESSING);

  const generationId = uuidv4();
  session.generationId = generationId;
  session.currentAbort = new AbortController();
  const { signal } = session.currentAbort;

  const pipelineStartTime = Date.now();
  console.log(`[VOICE] generationStarted sessionId=${session.sessionId} generationId=${generationId} timestamp=${Date.now()}`);

  try {
    // ── Step 1: STT ────────────────────────────────────────
    session.send({ type: 'thinking_started' });
    const transcription = await sttProvider.transcribe(wavBuffer, session.sessionId);

    // Check if cancelled
    if (signal.aborted || session.generationId !== generationId) return;

    if (!transcription || transcription.trim().length === 0) {
      session.setState(STATES.LISTENING);
      session.send({ type: 'listening_started' });
      return;
    }

    session.send({ type: 'transcription_final', text: transcription });
    voiceLog.log(voiceLog.EVENTS.SPEECH_ENDED, {
      sessionId: session.sessionId,
      text: transcription.substring(0, 100),
    });

    // Add to conversation history
    session.conversation.addUserMessage(transcription);
    session.metrics.turnCount++;

    // ── Step 2: LLM streaming → SentenceBuffer → Async Kokoro TTS Queue ──
    const messages = session.conversation.getMessages();
    let fullResponse = '';
    let sequenceNumber = 1;
    let ttsFirstAudioLogged = false;

    session.setState(STATES.SPEAKING);
    session.ttsFinished = false;
    session.clientPlaybackFinished = false;
    session.chunksSent = 0;
    
    voiceLog.log(voiceLog.EVENTS.TTS_STARTED, { sessionId: session.sessionId });

    // Send audio_start protocol event (§19)
    session.send({
      type: 'audio_start',
      generationId,
      sampleRate: config.audio.outputSampleRate || 24000,
      channels: config.audio.outputChannels || 1,
      format: 'pcm_s16le',
    });

    const sentenceBuffer = new SentenceBuffer();
    let ttsChain = Promise.resolve(); // Chains sending chunks sequentially

    const enqueueTTS = (sentence) => {
      // Chain the result to be synthesized and sent sequentially to the frontend
      ttsChain = ttsChain.then(async () => {
        if (signal.aborted || session.generationId !== generationId) return;
        try {
          // Synthesis happens sequentially now to prevent overwhelming the Kokoro local server
          const audioBuffer = await ttsProvider.synthesize(sentence, signal, session.sessionId);
          if (!audioBuffer) return;
          if (signal.aborted || session.generationId !== generationId) return;

          const currentSeq = sequenceNumber++;
          
          if (!ttsFirstAudioLogged) {
            const ttfa = Date.now() - pipelineStartTime;
            session.send({ type: 'tts_started', generationId });
            console.log(`[VOICE] ttsStarted generationId=${generationId} timestamp=${Date.now()}`);
            voiceLog.log(voiceLog.EVENTS.TTS_FIRST_AUDIO, {
              sessionId: session.sessionId,
              generationId,
              latencyMs: ttfa,
              label: 'time_to_first_audio',
            });
            ttsFirstAudioLogged = true;
          }

          console.log(`[VOICE] audioChunkGenerated generationId=${generationId} sequence=${currentSeq} timestamp=${Date.now()}`);

          // Send audio_chunk
          session.send({
            type: 'audio_chunk',
            generationId,
            sequence: currentSeq,
            data: audioBuffer.toString('base64'),
            format: 'wav',
          });
          console.log(`[VOICE] audioChunkSent generationId=${generationId} sequence=${currentSeq} timestamp=${Date.now()}`);
          
          session.clientPlaybackFinished = false;
          session.chunksSent++;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('[VoiceGateway] TTS Synthesis error in queue:', err.message);
          }
        }
      });
    };

    // 1. Stream LLM tokens to client IMMEDIATELY and feed SentenceBuffer
    for await (const token of llmProvider.streamResponse(messages, signal, session.sessionId)) {
      if (signal.aborted || session.generationId !== generationId) return;
      fullResponse += token;
      session.send({ type: 'assistant_text', text: token, generationId });

      const sentences = sentenceBuffer.addToken(token);
      for (const sentence of sentences) {
        enqueueTTS(sentence);
      }
    }

    if (signal.aborted || session.generationId !== generationId || !fullResponse.trim()) return;

    // Flush any remaining text in the buffer after stream ends
    const remainingSentences = sentenceBuffer.flushSentences(true);
    for (const sentence of remainingSentences) {
      enqueueTTS(sentence);
    }

    // Wait for all TTS and sending to finish
    await ttsChain;

    if (signal.aborted || session.generationId !== generationId) return;

    // Finished speaking
    session.ttsFinished = true;
    const lastSeq = sequenceNumber - 1;
    console.log(`[VOICE] ttsFinished generationId=${generationId} lastSequence=${lastSeq} timestamp=${Date.now()}`);
    
    session.send({ type: 'tts_finished', generationId, lastSequence: lastSeq });
    session.send({ type: 'thinking_finished' });

    // Add assistant response to history
    session.conversation.addAssistantMessage(fullResponse);

    voiceLog.log(voiceLog.EVENTS.TTS_COMPLETED, {
      sessionId: session.sessionId,
      generationId,
      totalLatencyMs: Date.now() - pipelineStartTime,
      responseLength: fullResponse.length,
    });

    if (session.chunksSent === 0 || session.clientPlaybackFinished) {
      session.setState(STATES.LISTENING);
      session.send({ type: 'listening_started' });
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      // Expected during interruption
      return;
    }

    console.error('[VoiceGateway] Pipeline error:', err);
    voiceLog.log(voiceLog.EVENTS.ERROR, {
      sessionId: session.sessionId,
      error: err.message,
    });

    // Send user-friendly error
    let errorType = 'UNKNOWN_ERROR';
    let errorMessage = 'Tive um problema ao processar sua pergunta. Pode tentar novamente?';

    if (err.message.includes('401') || err.message.includes('Incorrect API key') || err.message.includes('invalid_api_key')) {
      errorType = 'AUTH_ERROR';
      errorMessage = 'Chave OPENAI_API_KEY no arquivo .env está inválida ou expirou. Atualize a chave no .env.';
    } else if (err.message.includes('STT') || err.message.includes('Whisper')) {
      errorType = 'STT_ERROR';
      errorMessage = 'Não consegui entender o que você disse. Pode repetir?';
    } else if (err.message.includes('OpenAI') || err.message.includes('LLM')) {
      errorType = 'LLM_ERROR';
      errorMessage = 'Tive um problema para processar sua pergunta. Pode tentar novamente?';
    }

    session.send({ type: 'error', error: errorType, message: errorMessage });

    // Go back to listening
    if (session.state !== STATES.ENDED) {
      session.setState(STATES.LISTENING);
      session.send({ type: 'listening_started' });
    }
  }
}

// ─── Handle Interruption (Barge-in) ──────────────────────────
function handleInterrupt(session) {
  if (session.state !== STATES.SPEAKING && session.state !== STATES.PROCESSING) return;

  voiceLog.log(voiceLog.EVENTS.INTERRUPTED, {
    sessionId: session.sessionId,
    generationId: session.generationId,
    interruptedState: session.state,
  });

  // Cancel current generation
  session.cancelCurrentGeneration();
  session.generationId = uuidv4();  // invalidate old generation
  session.audioChunks = [];         // clear any buffered audio

  session.send({ type: 'assistant_interrupted' });

  // Transition to listening
  session.setState(STATES.LISTENING);
  session.send({ type: 'listening_started' });
}

// ─── Exports ─────────────────────────────────────────────────
module.exports = {
  createSession,
  endSession,
  setupWebSocket,
  STATES,
};

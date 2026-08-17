/**
 * AEGIS Voice AI — Frontend Voice Engine
 * Low-latency continuous real-time audio streaming, microphone capture,
 * robust client-side VAD, barge-in interruption, echo feedback prevention,
 * and WebSocket protocol handler.
 */

(function (window) {
  'use strict';

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

  // ─── Centralized VAD Configuration ───────────────────────────
  const VAD_CONFIG = {
    threshold: 0.025,               // Normal listening RMS threshold
    minSpeechDurationMs: 350,       // Min speech duration to confirm speech
    silenceDurationMs: 1100,        // Silence duration before speech end
  };

  const AUDIO_STATES = {
    AUDIO_IDLE: 'AUDIO_IDLE',
    AUDIO_BUFFERING: 'AUDIO_BUFFERING',
    AUDIO_PLAYING: 'AUDIO_PLAYING',
    AUDIO_WAITING_FOR_CHUNKS: 'AUDIO_WAITING_FOR_CHUNKS',
    AUDIO_FINISHED: 'AUDIO_FINISHED',
  };

  // ─── Audio Stream Player (Continuous PCM Stream via AudioWorklet) ───
  class AudioStreamPlayer {
    constructor() {
      this.audioCtx = null;
      this.workletNode = null;
      this.isWorkletReady = false;
      this.workletFailed = false;
      
      this.audioState = AUDIO_STATES.AUDIO_IDLE;
      this.currentGenerationId = null;
      this.expectedSequence = 1;
      this.highestSequenceReceived = 0;
      this.lastSequence = null;
      this.ttsFinished = false;
      
      this.amplitude = 0;
      this.nextPlayTime = 0;
      this.queueSize = 0; // approximate chunk count

      // Callbacks
      this.onPlaybackStart = null;
      this.onPlaybackEnd = null;
      this.onMissingChunk = null;
    }

    _setAudioState(newState) {
      if (this.audioState === newState) return;
      const oldState = this.audioState;
      this.audioState = newState;
      console.log(`[CLIENT] stateChanged from=${oldState} to=${newState} timestamp=${Date.now()}`);
      
      if (newState === AUDIO_STATES.AUDIO_PLAYING && oldState !== AUDIO_STATES.AUDIO_PLAYING) {
        if (oldState === AUDIO_STATES.AUDIO_WAITING_FOR_CHUNKS) {
          console.log(`[CLIENT] playbackResumed timestamp=${Date.now()}`);
        } else {
          console.log(`[CLIENT] playbackStarted timestamp=${Date.now()}`);
          if (this.onPlaybackStart) this.onPlaybackStart(this.currentGenerationId);
        }
      } else if (newState === AUDIO_STATES.AUDIO_WAITING_FOR_CHUNKS) {
        console.log(`[CLIENT] playbackPausedWaitingForChunk timestamp=${Date.now()}`);
      } else if (newState === AUDIO_STATES.AUDIO_FINISHED) {
        console.log(`[CLIENT] playbackFinished timestamp=${Date.now()}`);
        console.log(`[CLIENT] clientPlaybackFinishedSent timestamp=${Date.now()}`);
        if (this.onPlaybackEnd) this.onPlaybackEnd();
      }
    }

    async init() {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume().catch(() => {});
      }

      if (!this.workletNode && !this.workletFailed) {
        try {
          await this.audioCtx.audioWorklet.addModule('/src/js/aegis-pcm-processor.js');
          this.workletNode = new AudioWorkletNode(this.audioCtx, 'aegis-pcm-processor');
          this.workletNode.connect(this.audioCtx.destination);

          this.workletNode.port.onmessage = (e) => {
            const data = e.data;
            if (!data) return;

            if (data.type === 'playback_started') {
              this._setAudioState(AUDIO_STATES.AUDIO_PLAYING);
            } else if (data.type === 'underrun') {
              this.queueSize = 0;
              this._handleUnderrun();
            } else if (data.type === 'amplitude') {
              this.amplitude = data.amplitude;
            }
          };
          this.isWorkletReady = true;
        } catch (err) {
          console.warn('[AudioStreamPlayer] AudioWorklet load failed, using native decodeAudioData fallback:', err);
          this.workletFailed = true;
        }
      }
    }

    setGenerationId(genId) {
      this.currentGenerationId = genId;
      this.expectedSequence = 1;
      this.highestSequenceReceived = 0;
      this.lastSequence = null;
      this.ttsFinished = false;
      this.nextPlayTime = 0;
      this.queueSize = 0;
      this._setAudioState(AUDIO_STATES.AUDIO_BUFFERING);
      
      if (this.workletNode && this.isWorkletReady) {
        this.workletNode.port.postMessage({ type: 'set_generation', generationId: genId });
      }
    }

    setTtsFinished(genId, lastSeq) {
      if (genId !== this.currentGenerationId) return;
      this.ttsFinished = true;
      this.lastSequence = lastSeq;
      this._evaluatePlaybackCompletion();
    }

    /**
     * Evaluate if playback is completely finished or just starved.
     */
    _evaluatePlaybackCompletion() {
      if (this.audioState === AUDIO_STATES.AUDIO_FINISHED || this.audioState === AUDIO_STATES.AUDIO_IDLE) {
        return;
      }
      
      // Are we waiting for more chunks from the server?
      const isMissingChunks = !this.ttsFinished || (this.lastSequence !== null && this.highestSequenceReceived < this.lastSequence);
      
      // Is the local queue completely dry?
      const isQueueDry = this.queueSize === 0;

      if (isQueueDry) {
        if (isMissingChunks) {
          this._setAudioState(AUDIO_STATES.AUDIO_WAITING_FOR_CHUNKS);
        } else {
          this._setAudioState(AUDIO_STATES.AUDIO_FINISHED);
        }
      }
    }

    _handleUnderrun() {
      // Called when worklet or fallback buffer runs dry
      this._evaluatePlaybackCompletion();
    }

    async enqueue(base64Data, generationId = null, sequence = null) {
      console.log(`[CLIENT] audioChunkReceived generationId=${generationId} sequence=${sequence} currentGenId=${this.currentGenerationId} timestamp=${Date.now()}`);

      if (generationId && this.currentGenerationId && generationId !== this.currentGenerationId) {
        console.warn(`[CLIENT] Discarding chunk: generationId mismatch. Expected ${this.currentGenerationId} but got ${generationId}`);
        return; // Discard chunks from stale cancelled generations
      }

      if (sequence !== null && sequence !== undefined) {
        if (sequence !== this.expectedSequence) {
          console.warn(`[AudioStreamPlayer] Expected sequence ${this.expectedSequence}, got ${sequence}`);
          if (this.onMissingChunk) this.onMissingChunk(this.expectedSequence, sequence);
        }
        this.expectedSequence = sequence + 1;
        if (sequence > this.highestSequenceReceived) {
          this.highestSequenceReceived = sequence;
        }
      }

      this.queueSize++;
      console.log(`[CLIENT] audioQueueSize size=${this.queueSize} timestamp=${Date.now()}`);

      if (this.audioState === AUDIO_STATES.AUDIO_WAITING_FOR_CHUNKS || this.audioState === AUDIO_STATES.AUDIO_FINISHED) {
         // Even if it was finished (due to out-of-order late chunk logic), getting a chunk puts us back in buffering/playing
         this._setAudioState(AUDIO_STATES.AUDIO_BUFFERING);
      }

      await this.init();

      try {
        const binaryStr = window.atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const audioBuffer = await this.audioCtx.decodeAudioData(bytes.buffer.slice(0));
        const float32Samples = audioBuffer.getChannelData(0);

        if (this.workletNode && this.isWorkletReady) {
          this.workletNode.port.postMessage({
            type: 'samples',
            samples: float32Samples,
            generationId,
            sequence,
          });
        } else {
          this._playFallbackBuffer(audioBuffer, generationId);
        }
      } catch (err) {
        console.error('[AudioStreamPlayer] Error decoding audio chunk:', err);
      }
    }

    _playFallbackBuffer(audioBuffer, generationId) {
      if (generationId && this.currentGenerationId && generationId !== this.currentGenerationId) return;

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (this.nextPlayTime < now) {
        this.nextPlayTime = now + 0.03;
        this._setAudioState(AUDIO_STATES.AUDIO_PLAYING);
      }

      source.onended = () => {
        if (this.audioCtx.currentTime >= this.nextPlayTime - 0.05) {
          this.queueSize = Math.max(0, this.queueSize - 1);
          this._handleUnderrun();
        }
      };

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
    }

    flush() {
      if (this.workletNode && this.isWorkletReady) {
        this.workletNode.port.postMessage({ type: 'flush' });
      }
      this._evaluatePlaybackCompletion();
    }

    stop() {
      this.currentGenerationId = null;
      this.expectedSequence = 1;
      this.highestSequenceReceived = 0;
      this.lastSequence = null;
      this.ttsFinished = false;
      this.amplitude = 0;
      this.nextPlayTime = 0;
      this.queueSize = 0;
      this._setAudioState(AUDIO_STATES.AUDIO_IDLE);

      if (this.workletNode && this.isWorkletReady) {
        this.workletNode.port.postMessage({ type: 'clear' });
      }
    }

    clear() {
      this.stop();
    }

    getAmplitude() {
      return this.amplitude;
    }
  }

  // ─── Microphone Capture & VAD ─────────────────────────────────
  class MicrophoneCapture {
    constructor(customConfig = {}) {
      this.config = { ...VAD_CONFIG, ...customConfig };
      this.audioCtx = null;
      this.mediaStream = null;
      this.scriptNode = null;
      this.sourceNode = null;
      this.silenceGainNode = null;

      this.isCapturing = false;

      // Listening state
      this.isSpeaking = false;
      this.speechStartTime = 0;
      this.lastSpeechTime = 0;

      // Event Callbacks
      this.onAudioChunk = null;       // (base64) => {}
      this.onSpeechStart = null;      // () => {}
      this.onSpeechEnd = null;        // () => {}
      this.onAmplitude = null;        // (level) => {}
    }

    async start() {
      if (this.isCapturing) return;

      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });

      // Request media stream with hardware echo cancellation, noise suppression & auto gain
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
        },
      });

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.scriptNode = this.audioCtx.createScriptProcessor(2048, 1, 1);

      // Route scriptNode through a zero-gain node so mic audio is NOT output to speakers
      this.silenceGainNode = this.audioCtx.createGain();
      this.silenceGainNode.gain.value = 0;

      this.scriptNode.onaudioprocess = (e) => this._processAudio(e);

      this.sourceNode.connect(this.scriptNode);
      this.scriptNode.connect(this.silenceGainNode);
      this.silenceGainNode.connect(this.audioCtx.destination);

      this.isCapturing = true;
    }

    _processAudio(e) {
      if (!this.isCapturing) return;

      const inputBuffer = e.inputBuffer.getChannelData(0);
      const rms = this._calculateRMS(inputBuffer);

      if (this.onAmplitude) {
        this.onAmplitude(Math.min(rms * 8, 1));
      }

      // Convert float32 [-1, 1] to PCM Int16
      const pcm16 = new Int16Array(inputBuffer.length);
      for (let i = 0; i < inputBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, inputBuffer[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      const now = Date.now();

      if (rms >= this.config.threshold) {
        this.lastSpeechTime = now;

        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.speechStartTime = now;
          if (this.onSpeechStart) this.onSpeechStart();
        }

        if (this.onAudioChunk) {
          const base64 = this._int16ToBase64(pcm16);
          this.onAudioChunk(base64);
        }
      } else if (this.isSpeaking) {
        // Send trailing audio buffer during silence period
        if (this.onAudioChunk) {
          const base64 = this._int16ToBase64(pcm16);
          this.onAudioChunk(base64);
        }

        // Check if silence duration exceeded
        if (now - this.lastSpeechTime > this.config.silenceDurationMs) {
          const speechDuration = now - this.speechStartTime;
          this.isSpeaking = false;

          if (speechDuration >= this.config.minSpeechDurationMs) {
            if (this.onSpeechEnd) this.onSpeechEnd();
          }
        }
      }
    }

    _calculateRMS(samples) {
      let sum = 0;
      for (let i = 0; i < samples.length; i++) {
        sum += samples[i] * samples[i];
      }
      return Math.sqrt(sum / samples.length);
    }

    _int16ToBase64(int16Array) {
      const bytes = new Uint8Array(int16Array.buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }

    stop() {
      this.isCapturing = false;
      this.isSpeaking = false;

      if (this.scriptNode) {
        this.scriptNode.onaudioprocess = null;
        this.scriptNode.disconnect();
        this.scriptNode = null;
      }
      if (this.silenceGainNode) {
        this.silenceGainNode.disconnect();
        this.silenceGainNode = null;
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    }
  }

  // ─── Voice Call Manager (Main Controller) ─────────────────────
  class VoiceCallManager {
    constructor() {
      this.sessionId = null;
      this.currentGenerationId = null;
      this.state = STATES.IDLE;
      this.ws = null;
      this.player = new AudioStreamPlayer();
      this.mic = new MicrophoneCapture();
      this.isMuted = false;

      // Callbacks
      this.onStateChange = null;        // (state, prevState) => {}
      this.onTranscript = null;         // (text, isFinal) => {}
      this.onAssistantText = null;      // (textDelta) => {}
      this.onError = null;              // (code, message) => {}
      this.onAmplitude = null;          // (micLevel, playerLevel) => {}

      this._setupMicHandlers();
      this._setupPlayerHandlers();
    }

    _setState(newState) {
      if (this.state === newState) return;
      const oldState = this.state;
      this.state = newState;

      if (this.onStateChange) {
        this.onStateChange(newState, oldState);
      }
    }

    _setupMicHandlers() {
      this.mic.onAudioChunk = (base64Data) => {
        if (this.isMuted) return;
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'audio_chunk',
            data: base64Data,
          }));
        }
      };

      this.mic.onSpeechStart = () => {
        // Speech start visual indicator
      };

      this.mic.onSpeechEnd = () => {
        if (this.state === STATES.LISTENING) {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'speech_end' }));
          }
        }
      };

      this.mic.onAmplitude = (micLevel) => {
        if (this.onAmplitude) {
          const playerLevel = this.player.getAmplitude();
          this.onAmplitude(micLevel, playerLevel);
        }
      };
    }

    _setupPlayerHandlers() {
      this.player.onPlaybackStart = () => {
        // Nothing here anymore, state is managed internally by AudioStreamPlayer
      };

      this.player.onPlaybackEnd = () => {
        // Send playback_ended only when TRULY finished
        if (this.state === STATES.SPEAKING) {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'playback_ended' }));
          }
        }
      };
    }

    /**
     * Start a voice call.
     */
    async startCall() {
      if (this.state !== STATES.IDLE && this.state !== STATES.ENDED && this.state !== STATES.ERROR) {
        return;
      }

      try {
        this._setState(STATES.CONNECTING);

        // 1. Request microphone permission
        await this.mic.start();

        // 2. Create session via REST API
        const response = await fetch('/api/voice/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Não foi possível criar sessão de voz.');
        }

        const data = await response.json();
        this.sessionId = data.sessionId;

        // 3. Connect WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/voice/${this.sessionId}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          // Connected
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this._handleServerMessage(msg);
          } catch (err) {
            console.error('[VoiceCallManager] WS JSON Parse error:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.error('[VoiceCallManager] WS error:', err);
          this._handleError('CONNECTION_ERROR', 'Conexão interrompida. Tentando reconectar...');
        };

        this.ws.onclose = () => {
          if (this.state !== STATES.ENDED && this.state !== STATES.ENDING) {
            this._setState(STATES.ENDED);
          }
        };

      } catch (err) {
        console.error('[VoiceCallManager] Start call error:', err);
        this.mic.stop();
        this._setState(STATES.ERROR);
        if (this.onError) {
          this.onError('PERMISSION_ERROR', err.message || 'Permissão do microfone negada ou erro de servidor.');
        }
      }
    }

    _handleServerMessage(msg) {
      if (msg.type !== 'audio_chunk') {
        console.log(`[CLIENT WS] RX: type=${msg.type} genId=${msg.generationId} currentGenId=${this.currentGenerationId}`);
      }
      
      // Generation ID validation (ignore outdated generation messages)
      if (msg.generationId && this.currentGenerationId && msg.generationId !== this.currentGenerationId) {
        console.warn(`[CLIENT WS] Discarding message type=${msg.type} due to generationId mismatch!`);
        return;
      }

      switch (msg.type) {
        case 'state_change':
          this._setState(msg.state);
          break;

        case 'session_started':
          break;

        case 'listening_started':
          this._setState(STATES.LISTENING);
          this.currentGenerationId = null;
          this.player.stop();
          break;

        case 'listening_stopped':
          break;

        case 'thinking_started':
          this._setState(STATES.PROCESSING);
          break;

        case 'transcription_final':
          if (this.onTranscript) {
            this.onTranscript(msg.text, true);
          }
          break;

        case 'assistant_text':
          // Immediate text stream & UI state transition to SPEAKING!
          if (msg.generationId && msg.generationId !== this.currentGenerationId) {
            this.currentGenerationId = msg.generationId;
            this.player.setGenerationId(msg.generationId);
          }
          if (this.state === STATES.PROCESSING || this.state === STATES.LISTENING) {
            this._setState(STATES.SPEAKING);
          }
          if (this.onAssistantText) {
            this.onAssistantText(msg.text);
          }
          break;

        case 'audio_start':
        case 'tts_started':
          if (msg.generationId && msg.generationId !== this.currentGenerationId) {
            this.currentGenerationId = msg.generationId;
            this.player.setGenerationId(msg.generationId);
          }
          this._setState(STATES.SPEAKING);
          break;

        case 'audio_chunk':
          if (msg.data) {
            this.player.enqueue(msg.data, msg.generationId, msg.sequence);
          }
          break;

        case 'tts_finished':
          if (msg.generationId) {
            this.player.setTtsFinished(msg.generationId, msg.lastSequence);
          }
          this.player.flush();
          break;

        case 'assistant_interrupted':
          this.currentGenerationId = null;
          this.player.stop();
          this._setState(STATES.LISTENING);
          break;

        case 'error':
          if (this.onError) {
            this.onError(msg.error || 'UNKNOWN_ERROR', msg.message || 'Ocorreu um erro.');
          }
          break;

        case 'session_ended':
          this.endCall();
          break;
      }
    }

    /**
     * Interrupt current assistant speech (Barge-in).
     */
    interrupt() {
      this.currentGenerationId = null;
      this.player.stop();
      this._setState(STATES.INTERRUPTED);

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'interrupt' }));
      }
    }

    /**
     * Toggle microphone mute.
     */
    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }

    /**
     * End call and release all resources.
     */
    endCall() {
      if (this.state === STATES.ENDED) return;

      this._setState(STATES.ENDING);

      this.player.stop();
      this.mic.stop();

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'hangup' }));
        this.ws.close();
      }

      if (this.sessionId) {
        fetch(`/api/voice/sessions/${this.sessionId}/end`, { method: 'POST' }).catch(() => {});
      }

      this.ws = null;
      this.sessionId = null;
      this.currentGenerationId = null;
      this._setState(STATES.ENDED);
    }
  }

  // Export to window
  window.AEGISVoice = {
    STATES,
    VAD_CONFIG,
    AudioStreamPlayer,
    MicrophoneCapture,
    VoiceCallManager,
  };

})(window);

/**
 * AEGIS Voice AI — UI Controller & Visualizer
 * Binds UI elements (buttons, orb visualizer, status indicators, transcripts)
 * to the AEGISVoice.VoiceCallManager engine.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Check if AEGISVoice engine is loaded
    if (!window.AEGISVoice) {
      console.error('[VoiceUI] AEGISVoice engine not found.');
      return;
    }

    const { STATES, VoiceCallManager } = window.AEGISVoice;

    // DOM Elements
    const btnVoiceCall = document.getElementById('aegis-btn-voice-call');
    const viewVoice = document.getElementById('aegis-view-voice');
    const viewOptions = document.getElementById('aegis-view-options');
    const viewForm = document.getElementById('aegis-view-form');
    const statusText = document.getElementById('aegis-voice-status-text');
    const badge = document.getElementById('aegis-voice-badge');
    const transcript = document.getElementById('aegis-voice-transcript');
    const waves = document.getElementById('aegis-voice-waves');
    const avatar = document.getElementById('aegis-voice-avatar');
    const btnMute = document.getElementById('aegis-btn-mute');
    const muteLabel = document.getElementById('aegis-mute-label');
    const btnHangup = document.getElementById('aegis-btn-hangup');
    const modalWindow = document.getElementById('aegis-modal-window');
    const closeBtn = document.getElementById('aegis-close-btn');

    if (!btnVoiceCall) return;

    // Initialize Call Manager instance
    const manager = new VoiceCallManager();
    window.aegisVoiceManager = manager; // FASE 0: Expor globalmente para tts-test.js
    let currentAssistantText = '';

    // ─── Status Text Mapping ──────────────────────────────────
    const STATUS_MAP = {
      [STATES.IDLE]: 'Pronto',
      [STATES.CONNECTING]: 'Conectando...',
      [STATES.GREETING]: 'AEGIS está falando...',
      [STATES.LISTENING]: 'Ouvindo...',
      [STATES.PROCESSING]: 'Pensando...',
      [STATES.SPEAKING]: 'Falando...',
      [STATES.INTERRUPTED]: 'Ouvindo...',
      [STATES.ENDING]: 'Encerrando...',
      [STATES.ENDED]: 'Chamada encerrada.',
      [STATES.ERROR]: 'Erro na chamada.',
    };

    // ─── State Change Listener ───────────────────────────────
    manager.onStateChange = (state, prevState) => {
      // Update status text
      if (statusText) {
        statusText.textContent = STATUS_MAP[state] || 'Em chamada';
      }

      // Update badge CSS modifier
      if (badge) {
        badge.className = 'aegis-voice-live-badge ' + state.toLowerCase();
      }

      // Update visualizer state
      if (waves) {
        waves.className = 'aegis-voice-waves ' + state.toLowerCase();
      }

      // Reset assistant response buffer when listening
      if (state === STATES.LISTENING) {
        currentAssistantText = '';
      }

      // Reset transcript text on new processing turn
      if (state === STATES.PROCESSING) {
        if (transcript) {
          transcript.innerHTML = '<span class="transcript-thinking">Pensando na resposta...</span>';
        }
      }

      if (state === STATES.ENDED) {
        setTimeout(() => {
          // Reset view back to options after call ends
          showView(viewOptions || viewForm);
        }, 1500);
      }
    };

    // ─── User Transcript Listener ─────────────────────────────
    manager.onTranscript = (text, isFinal) => {
      console.log(`[UI] onTranscript received: "${text}" isFinal=${isFinal}`);
      if (transcript && text) {
        transcript.innerHTML = `<span class="user-text">"${text}"</span>`;
      }
    };

    // ─── Assistant Text Streaming Listener ────────────────────
    manager.onAssistantText = (delta) => {
      console.log(`[UI] onAssistantText delta received: "${delta}"`);
      currentAssistantText += delta;
      if (transcript) {
        transcript.innerHTML = `<span class="assistant-text">${currentAssistantText}</span>`;
      }
    };

    // ─── Amplitude Visualizer ─────────────────────────────────
    manager.onAmplitude = (micLevel, playerLevel) => {
      if (!waves) return;

      const activeLevel = (manager.state === STATES.SPEAKING || manager.state === STATES.GREETING) ? playerLevel : micLevel;
      const scale = 1 + activeLevel * 0.4;
      const wave1 = waves.querySelector('.wave1');
      const wave2 = waves.querySelector('.wave2');
      const wave3 = waves.querySelector('.wave3');

      if (wave1) wave1.style.transform = `scale(${scale})`;
      if (wave2) wave2.style.transform = `scale(${1 + activeLevel * 0.6})`;
      if (wave3) wave3.style.transform = `scale(${1 + activeLevel * 0.8})`;
    };

    // ─── Error Handler ────────────────────────────────────────
    manager.onError = (code, message) => {
      if (transcript) {
        transcript.innerHTML = `<span class="error-text">⚠️ ${message}</span>`;
      }
    };

    // ─── Helper to Switch Views ───────────────────────────────
    function showView(targetView) {
      document.querySelectorAll('.aegis-view').forEach((v) => {
        v.classList.remove('active');
      });
      if (targetView) {
        targetView.classList.add('active');
      }
    }

    // ─── Button Event Handlers ────────────────────────────────

    // Start Voice Call
    btnVoiceCall.addEventListener('click', () => {
      showView(viewVoice);
      if (transcript) transcript.innerHTML = '';
      manager.startCall();
    });

    // Toggle Mute
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const isMuted = manager.toggleMute();
        btnMute.classList.toggle('muted', isMuted);
        if (muteLabel) {
          muteLabel.textContent = isMuted ? 'Desmutar' : 'Silenciar';
        }
      });
    }

    // Hangup Call
    if (btnHangup) {
      btnHangup.addEventListener('click', () => {
        manager.endCall();
      });
    }

    // Close Modal -> End Call automatically (§22)
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (manager.state !== STATES.IDLE && manager.state !== STATES.ENDED) {
          manager.endCall();
        }
      });
    }
  });
})();

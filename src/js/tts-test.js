(function () {
  'use strict';

  async function speakText(text) {
    console.log('[TTS] request started');
    const startTime = Date.now();
    try {
      const response = await fetch('/api/kokoro-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voice: 'active' })
      });

      console.log(`[TTS] response status: ${response.status}`);
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      console.log(`[TTS] content type: ${contentType}`);
      console.log(`[TTS] response size: ${contentLength} bytes`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[TTS] request completed in', Date.now() - startTime, 'ms');
      console.log('[TTS] audio decoding started');
      
      const blob = await response.blob();
      console.log('[TTS] audio decoding completed. Blob size:', blob.size);

      // Salvar temporariamente o Blob/arquivo permitindo abrir direto no browser
      const blobUrl = URL.createObjectURL(blob);
      console.log('[TTS] Blob URL created. Click to listen locally:', blobUrl);
      // Optional UI indication: create a temporary link in the body
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'kokoro_test_audio.wav';
      downloadLink.textContent = 'Baixar áudio de teste Kokoro';
      downloadLink.style.display = 'block';
      downloadLink.style.position = 'fixed';
      downloadLink.style.bottom = '10px';
      downloadLink.style.right = '10px';
      downloadLink.style.background = 'black';
      downloadLink.style.color = 'white';
      downloadLink.style.padding = '10px';
      downloadLink.style.zIndex = '999999';
      document.body.appendChild(downloadLink);
      setTimeout(() => downloadLink.remove(), 10000); // remove after 10s
      
      // Teste de reprodução nativa (HTMLAudioElement)
      const audio = new Audio();
      audio.src = blobUrl;
      
      audio.onplay = () => {
        console.log('[TTS] playback started');
        if (window.aegisVoiceManager && window.AEGISVoice) {
          window.aegisVoiceManager._setState(window.AEGISVoice.STATES.SPEAKING);
        }
      };
      audio.onended = () => {
        console.log('[TTS] playback ended');
        // Clean up URL object when finished playing
        URL.revokeObjectURL(blobUrl);
        if (window.aegisVoiceManager && window.AEGISVoice) {
          window.aegisVoiceManager._setState(window.AEGISVoice.STATES.LISTENING);
        }
      };
      audio.onerror = (e) => {
        console.error('[TTS] playback error', e);
        console.error('[TTS] ERROR', 'Erro na reprodução nativa HTMLAudioElement.');
      };

      // Verificação de volume (assegurar audível)
      audio.volume = 1.0;
      
      try {
        await audio.play();
      } catch (err) {
        console.error('[TTS] ERROR', 'Erro ao executar audio.play() (Possível bloqueio de Autoplay).');
        console.error('Mensagem:', err.message);
        console.error('Stacktrace:', err.stack);
        alert('Permita reprodução de áudio para iniciar a voz.');
      }

    } catch (error) {
      console.error('[TTS] ERROR');
      console.error('Mensagem:', error.message);
      if (error.stack) console.error('Stack:', error.stack);
    }
  }

  // Exportar para uso no console e no resto da aplicação (Regra 11)
  window.speakText = speakText;

  document.addEventListener('DOMContentLoaded', () => {
    const btnTestVoice = document.getElementById('aegis-btn-test-voice');
    if (btnTestVoice) {
      btnTestVoice.addEventListener('click', () => {
        speakText("Olá! Este é um teste de voz.");
      });
    }
  });

})();

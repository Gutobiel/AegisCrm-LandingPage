/**
 * AEGIS Voice AI — LLM Provider (OpenAI Streaming)
 * Streams responses from OpenAI Chat Completions API.
 */

const config = require('../voice-config');
const voiceLog = require('../voice-logger');

class OpenAIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = config.llm.apiUrl;
    this.model = config.llm.model;
    this.maxTokens = config.llm.maxTokens;
    this.temperature = config.llm.temperature;
  }

  get key() {
    return this.apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Stream a response from the LLM.
   * @param {Array} messages - Array of { role, content } messages
   * @param {AbortSignal} signal - AbortSignal for cancellation
   * @param {string} sessionId - For logging
   * @returns {AsyncGenerator<string>} Yields text tokens incrementally
   */
  async *streamResponse(messages, signal = null, sessionId = '') {
    const apiKey = this.key;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured for LLM');
    }

    const startTime = Date.now();
    let firstTokenTime = null;

    voiceLog.log(voiceLog.EVENTS.LLM_STARTED, { sessionId });

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';  // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              if (!firstTokenTime) {
                firstTokenTime = Date.now();
                voiceLog.log(voiceLog.EVENTS.LLM_FIRST_TOKEN, {
                  sessionId,
                  latencyMs: firstTokenTime - startTime,
                });
              }
              yield delta;
            }
          } catch (parseErr) {
            // Skip malformed JSON chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
      voiceLog.log(voiceLog.EVENTS.LLM_COMPLETED, {
        sessionId,
        latencyMs: Date.now() - startTime,
      });
    }
  }
}

module.exports = { OpenAIProvider };

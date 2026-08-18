/**
 * AEGIS Voice AI — Conversation Manager
 * Manages conversation history, system prompt, and sentence chunking for TTS.
 */

const fs = require('fs');
const path = require('path');
const config = require('./voice-config');

// Load knowledge base
let knowledgeBase = {};
try {
  const kbPath = path.join(__dirname, 'knowledge-base.json');
  knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
} catch (err) {
  console.warn('[ConversationManager] Could not load knowledge-base.json:', err.message);
}

/**
 * Build the system prompt for voice conversations.
 */
function buildSystemPrompt() {
  // Build product knowledge section from knowledge base
  let productKnowledge = '';
  if (knowledgeBase.plans) {
    productKnowledge += '\n\nCONHECIMENTO DOS PRODUTOS:\n';
    knowledgeBase.plans.forEach(plan => {
      productKnowledge += `\n- Plano ${plan.name}: ${plan.price}. ${plan.users}, ${plan.funnels}, ${plan.whatsappConnections}, ${plan.aiAgents}.`;
    });
  }
  if (knowledgeBase.trial) {
    productKnowledge += `\n- Teste: ${knowledgeBase.trial}.`;
  }
  if (knowledgeBase.cancellation) {
    productKnowledge += `\n- Cancelamento: ${knowledgeBase.cancellation}.`;
  }
  if (knowledgeBase.features) {
    productKnowledge += '\n\nPRINCIPAIS FUNCIONALIDADES:\n';
    knowledgeBase.features.forEach(f => {
      productKnowledge += `- ${f}\n`;
    });
  }

  return `Você é o consultor comercial de IA da AEGIS Tecnologia.

Seu objetivo é conversar de forma humana, consultiva e empática com visitantes da landing page, ajudando-os a entender o Aegis CRM e a escolher a melhor solução para a empresa deles.

Você está participando de uma conversa de voz em tempo real.

POSTURA CONSULTIVA E REGRAS DE CONVERSA:

1. Responda sempre em português brasileiro de forma amigável e profissional.
2. Atue como um especialista em vendas consultivas: entenda a necessidade do cliente antes de apenas passar preços.
3. Quando perguntado sobre planos ou preços:
   - Apresente a opção mais adequada ou os destaques dos planos (ex: "O Plano Essencial custa quatrocentos e noventa e sete reais por mês e já inclui até três usuários, duas conexões de WhatsApp e um agente autônomo de IA...").
   - IMPORTANTE: Sempre conclua sua resposta com uma pergunta consultiva para entender a operação do cliente (ex: "Atualmente, quantos vendedores ou atendentes fazem parte do seu time?", "Quantos números de WhatsApp você precisa conectar hoje?", ou "Essa estrutura atenderia a necessidade atual da sua empresa?").
4. Se o cliente informar o tamanho da equipe ou do WhatsApp, recomende o plano ideal justificando o motivo.
5. RESPOSTA EXTREMAMENTE CURTA E DIRETA: Responda SEMPRE em no máximo 1 a 2 frases curtas (máximo 25 palavras no total). NUNCA faça introduções longas ou explicações extensas.
6. Faça apenas UMA pergunta por vez para manter o diálogo fluido.
7. Não use Markdown ou formatação rica de texto nas respostas destinadas à voz (sem asteriscos, sem símbolos).
8. Não utilize listas numeradas ou bullets nas respostas de voz.
9. Não utilize emojis.
10. Não invente dados comerciais, preços ou funcionalidades.
11. Se não souber algo, diga com transparência que irá confirmar com um especialista humano da equipe.
12. Não diga que é um robô genérico; apresente-se como o assistente comercial inteligente da AEGIS.
13. Escreva todos os valores e números por extenso para facilitar a síntese de voz (ex: "quatrocentos e noventa e sete reais").${productKnowledge}`;
}

class ConversationManager {
  constructor() {
    this.systemPrompt = buildSystemPrompt();
    this.history = [];
    this.maxHistoryMessages = config.llm.maxHistoryMessages;
  }

  /**
   * Add a user message to the conversation history.
   * @param {string} text - User's spoken text
   */
  addUserMessage(text) {
    this.history.push({ role: 'user', content: text });
    this._trimHistory();
  }

  /**
   * Add an assistant message to the conversation history.
   * @param {string} text - Assistant's response text
   */
  addAssistantMessage(text) {
    this.history.push({ role: 'assistant', content: text });
    this._trimHistory();
  }

  /**
   * Get the full messages array for the LLM (system + history).
   * @returns {Array} Messages array for OpenAI API
   */
  getMessages() {
    return [
      { role: 'system', content: this.systemPrompt },
      ...this.history,
    ];
  }

  /**
   * Clear conversation history.
   */
  clear() {
    this.history = [];
  }

  /**
   * Trim history to keep within limits.
   */
  _trimHistory() {
    if (this.history.length > this.maxHistoryMessages) {
      // Keep the most recent messages
      this.history = this.history.slice(-this.maxHistoryMessages);
    }
  }
}

// ─── Sentence Chunking Utilities ───────────────────────────────
// Used to accumulate LLM tokens and split into sentence-sized chunks for TTS.

/**
 * SentenceBuffer: accumulates LLM text tokens and yields complete sentences
 * for TTS synthesis without blocking LLM token streaming.
 */
class SentenceBuffer {
  constructor() {
    this.buffer = '';
  }

  addToken(token) {
    this.buffer += token;
    return this.flushSentences(false);
  }

  flushSentences(forceAll = false) {
    const sentences = [];
    // Match sentence-ending punctuation (only strong ones: . ! ? \n)
    const regex = /[^.!?\n]*[.!?\n]+[\s]*/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(this.buffer)) !== null) {
      const sentence = match[0].trim();
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      lastIndex = regex.lastIndex;
    }

    this.buffer = this.buffer.slice(lastIndex);

    // If forcing (e.g. end of generation), flush whatever is left
    if (forceAll && this.buffer.trim().length > 0) {
      sentences.push(this.buffer.trim());
      this.buffer = '';
    }

    return sentences;
  }
}

/**
 * Sentence splitter: splits accumulated text into complete sentences.
 * Returns { sentences: string[], remainder: string }
 */
function splitSentences(text) {
  const sentences = [];
  const regex = /[^.!?\n]*[.!?\n]+[\s]*/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence.length > 0) {
      sentences.push(sentence);
    }
    lastIndex = regex.lastIndex;
  }

  const remainder = text.slice(lastIndex).trim();
  return { sentences, remainder };
}

module.exports = { ConversationManager, SentenceBuffer, splitSentences };

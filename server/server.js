const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read environment variables securely from .env (checking root and server dirs)
try {
  const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env')
  ];
  envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
      const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
      envLines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join('=').trim();
          if (k && !process.env[k]) process.env[k] = v;
        }
      });
    }
  });
} catch (e) { }

const voiceGateway = require('./voice-gateway');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const LOGS_DIR = path.resolve(__dirname, '../logs/conversations');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function saveConversationLog(userText, aiText, voice = 'pm_alex') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(LOGS_DIR, `chat_${timestamp}.json`);
    const logData = {
      timestamp: new Date().toISOString(),
      userSpeech: userText,
      aiResponse: aiText,
      voice: voice
    };
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    console.log(`💾 Conversa salva em pasta: ${logPath}`);
  } catch (err) {
    console.error('Erro ao salvar log de conversa:', err);
  }
}

async function getOpenAIReply(userText) {
  if (!OPENAI_API_KEY) {
    return `O Aegis CRM automatiza seu funil no WhatsApp e aumenta suas conversões. Como posso te ajudar?`;
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é o Lucas, consultor especialista comercial direto e amigável do Aegis CRM em uma chamada de voz.
REGRAS ESTRITAS:
1. Seja DIRETO ao ponto. NUNCA use frases repetitivas como "Entendi o seu ponto sobre...", "Você me perguntou...", "Com relação à sua dúvida...". Responda direto ao assunto.
2. Responda em no máximo 1 a 2 frases curtas e objetivas em Português do Brasil.
3. Escreva valores e números por extenso para a voz (ex: "quatrocentos e noventa e sete reais", "dez usuários", "sete dias").
4. Conhecimento do Aegis CRM:
   - Plano Essencial: quatrocentos e noventa e sete reais por mês (3 usuários, 2 funis, WhatsApp com IA).
   - Plano Crescimento: novecentos e noventa e sete reais por mês (10 usuários, 10 funis, 5 WhatsApps, 3 IAs).
   - Plano Enterprise: sob medida para equipes maiores.
   - Teste grátis de 7 dias disponível no site.`
          },
          { role: 'user', content: userText }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
  } catch (err) {
    console.error('Erro na chamada OpenAI Chat:', err);
  }
  return `O Aegis CRM otimiza seu atendimento de vendas no WhatsApp com inteligência artificial. Quer experimentar sete dias grátis?`;
}

// Fonetizador para Português do Brasil (G2P IPA para Kokoro TTS)
function phonemizePT(text) {
  let s = text.toLowerCase().trim();

  // Mapeamentos específicos de termos e saudações comuns
  s = s
    .replace(/\boi,?\b|\boi\b|\boiii\b|\boii\b/gi, "oj,")
    .replace(/\bcomo\b/gi, "kˈomu")
    .replace(/\bposso\b/gi, "pˈɔsu")
    .replace(/\bte\b/gi, "tʃi")
    .replace(/\bajudar\b/gi, "aʒudˈaɾ")
    .replace(/\bhoje\b/gi, "ˈoʒi")
    .replace(/\bvocê\b|\bvoce\b/gi, "vosˈe")
    .replace(/\btudo\b/gi, "tˈudu")
    .replace(/\bbem\b/gi, "bˈẽj̃")
    .replace(/\bbom\b/gi, "bˈõj̃")
    .replace(/\bdia\b/gi, "dʒˈiɐ")
    .replace(/\btarde\b/gi, "tˈaɾdʒi")
    .replace(/\bnoite\b/gi, "nˈojtʃi")
    .replace(/\baegis\b/gi, "ˈeʒis")
    .replace(/\bcrm\b/gi, "se eɾi ˈẽmi")
    .replace(/\bvendas\b/gi, "vˈẽdɐs")
    .replace(/\bwhatsapp\b/gi, "watsˈap")
    .replace(/\bplano\b|\bplanos\b/gi, "plˈɐnu")
    .replace(/\breais\b/gi, "χeˈajs");

  // Regras de pronúncia em Português do Brasil
  s = s
    .replace(/ç/g, "s")
    .replace(/ch/g, "ʃ")
    .replace(/nh/g, "ɲ")
    .replace(/lh/g, "ʎ")
    .replace(/rr/g, "χ")
    .replace(/(^|\s)r([a-zà-ú])/g, "$1χ$2")
    .replace(/r(?=[bcdfghjklmnpqrstvwxyz\s]|$)/g, "ɾ")
    .replace(/j/g, "ʒ")
    .replace(/ge/g, "ʒe").replace(/gi/g, "ʒi")
    .replace(/qu(e|i)/g, "k$1")
    .replace(/te(?=[\s,.:!?]|$)/g, "tʃi")
    .replace(/ti/g, "tʃi")
    .replace(/de(?=[\s,.:!?]|$)/g, "dʒi")
    .replace(/di/g, "dʒi")
    .replace(/ã/g, "ɐ̃").replace(/õ/g, "õ")
    .replace(/em(?=[\s,.:!?]|$)/g, "ẽj̃")
    .replace(/ão(?=[\s,.:!?]|$)/g, "ɐ̃w̃")
    .replace(/ões(?=[\s,.:!?]|$)/g, "õj̃s")
    .replace(/á/g, "ˈa").replace(/é/g, "ˈɛ").replace(/ê/g, "ˈe")
    .replace(/í/g, "ˈi").replace(/ó/g, "ˈɔ").replace(/ô/g, "ˈo").replace(/ú/g, "ˈu");

  return s;
}

async function fetchKokoroFastAPIAudio(text, voice = 'active', retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch('http://127.0.0.1:8880/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          voice: voice,
          response_format: 'wav'
        })
      });

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        return buffer;
      }
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      console.error('Erro ao conectar com Kokoro-FastAPI:', err.message);
    }
  }
  return null;
}

const { spawn } = require('child_process');

function ensureKokoroServerRunning() {
  fetch('http://127.0.0.1:8880/health')
    .then(res => res.json())
    .then(() => {
      console.log('⚡ Kokoro TTS FastAPI Server já está rodando em http://127.0.0.1:8880');
    })
    .catch(() => {
      console.log('🚀 Conectando servidor Kokoro TTS FastAPI via Python .venv...');
      const pythonBin = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
      const scriptPath = path.join(__dirname, 'kokoro_server.py');
      if (fs.existsSync(pythonBin) && fs.existsSync(scriptPath)) {
        const kokoroProc = spawn(pythonBin, [scriptPath], {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit',
          detached: false
        });
        kokoroProc.on('error', (err) => {
          console.error('Erro ao iniciar Kokoro Python:', err.message);
        });
      } else {
        console.warn('⚠️ Executável do Python .venv não encontrado.');
      }
    });
}
setTimeout(ensureKokoroServerRunning, 1000);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let urlPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  if (urlPath.length > 1 && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  if (urlPath.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 - Acesso Negado');
    return;
  }

  /* Endpoint para criar nova sessão de voz */
  if (urlPath === '/api/voice/sessions' && req.method === 'POST') {
    const clientIp = req.socket.remoteAddress || '127.0.0.1';
    const result = voiceGateway.createSession(clientIp);
    if (result.error) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }
    return;
  }

  /* Endpoint para Chat de Texto Inteligente com OpenAI LLM (Vendas Consultivas) */
  if (urlPath === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { message, history = [] } = JSON.parse(body || '{}');
        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Mensagem não fornecida' }));
          return;
        }

        const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Chave OPENAI_API_KEY não configurada no .env' }));
          return;
        }

        // Build Product Knowledge
        let productKnowledge = '';
        try {
          const kbPath = path.join(__dirname, 'knowledge-base.json');
          if (fs.existsSync(kbPath)) {
            productKnowledge = fs.readFileSync(kbPath, 'utf8');
          }
        } catch (e) {}

        const systemPrompt = `Você é o especialista em vendas consultivas e suporte comercial do Aegis CRM.

Seu objetivo é conversar de forma fluida, amigável, clara e persuasiva com potenciais clientes da landing page.

POSTURA CONSULTIVA E REGRAS:
1. Responda em português brasileiro.
2. Atue como um verdadeiro consultor comercial: ajude o cliente a entender qual solução Aegis melhor atende à realidade da empresa dele.
3. Quando perguntado sobre planos ou preços:
   - Explique com clareza a opção desejada ou faça um panorama rápido dos 3 planos (Essencial R$ 497/mês, Crescimento R$ 997/mês, Enterprise R$ 2.997/mês).
   - IMPORTANTE: Sempre conclua a resposta com uma pergunta consultiva de qualificação sobre a estrutura dele. Exemplo: "Atualmente, quantos vendedores ou atendentes fazem parte da sua equipe e quantas conexões de WhatsApp você precisa usar hoje?" ou "Essa estrutura atende ao volume atual da sua empresa, ou você busca algo maior?"
4. Se o usuário responder com a quantidade de vendedores, conexões ou agentes, recomende exatamente o plano ideal justificando os motivos técnicos e financeiros.
5. Use formatação HTML limpa para boa legibilidade no widget (use <strong>negrito</strong> para termos chave e listas <ul><li> quando ajudar a organizar opções).
6. Mantenha as respostas concisas e agradáveis de ler (2 a 4 parágrafos pequenos no máximo).
7. Lembre que todos os planos incluem 7 dias grátis sem compromisso.

CONHECIMENTO DOS PRODUTOS AEGIS:
${productKnowledge}`;

        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10),
          { role: 'user', content: message }
        ];

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: formattedMessages,
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (!openAiRes.ok) {
          const errText = await openAiRes.text();
          throw new Error(`OpenAI error ${openAiRes.status}: ${errText}`);
        }

        const data = await openAiRes.json();
        const reply = data.choices?.[0]?.message?.content || 'Como posso te ajudar hoje com o Aegis CRM?';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (err) {
        console.error('[TextChat Error]:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro ao processar mensagem com a IA da OpenAI.' }));
      }
    });
    return;
  }

  /* Endpoint para obter a saudação inicial pré-gerada com a voz ativa da Landing Page */
  if (urlPath === '/api/initial-greeting' && req.method === 'GET') {
    try {
      const wavBuffer = await fetchKokoroFastAPIAudio('Oi! Como posso te ajudar hoje?', 'active');
      if (wavBuffer) {
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': wavBuffer.length,
          'Cache-Control': 'no-cache'
        });
        res.end(wavBuffer);
        return;
      }
    } catch (err) {
      console.error('Erro ao buscar saudação inicial:', err);
    }
  }

  /* Endpoint Integrado: OpenAI (GPT) -> Log em Pasta -> Kokoro-FastAPI (Voz Ativa) */
  if (urlPath === '/api/voice-agent-chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { spokenText } = JSON.parse(body || '{}');
        if (!spokenText) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Texto falado não informado' }));
          return;
        }

        // 1. Gera resposta com a IA da OpenAI (GPT) sem frases repetitivas
        const aiResponseText = await getOpenAIReply(spokenText);

        // 2. Salva o registro da conversa na pasta ./logs/conversations/
        saveConversationLog(spokenText, aiResponseText, 'active_profile');

        // 3. Converte a resposta da OpenAI em áudio via Kokoro-FastAPI (Voz Ativa)
        const wavBuffer = await fetchKokoroFastAPIAudio(aiResponseText, 'active');
        const audioWavBase64 = wavBuffer ? wavBuffer.toString('base64') : null;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          text: aiResponseText,
          audioWav: audioWavBase64
        }));
      } catch (err) {
        console.error('Erro no endpoint voice-agent-chat:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  /* Endpoint para geração de síntese de voz usando Kokoro-FastAPI (pm_alex) */
  if (urlPath === '/api/kokoro-tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { text, voice } = JSON.parse(body || '{}');
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Texto não informado' }));
          return;
        }

        const selectedVoice = voice || 'active';
        const wavBuffer = await fetchKokoroFastAPIAudio(text, selectedVoice);

        if (!wavBuffer) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Kokoro-FastAPI indisponível' }));
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': wavBuffer.length,
          'Cache-Control': 'no-cache'
        });
        res.end(wavBuffer);
      } catch (err) {
        console.error('Erro ao gerar voz Kokoro:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  /* Endpoint para obter token efêmero da OpenAI Realtime API */
  if (urlPath === '/api/realtime-session' && req.method === 'POST') {
    const postData = JSON.stringify({
      model: 'gpt-realtime-1.5',
      voice: 'shimmer',
      instructions: `# Role & Persona
Você é a Sofia, consultora humana e especialista de vendas do Aegis CRM. Você está em uma chamada de voz ao vivo com um visitante do site.

# Tone & Speaking Style (Especificações de Estilo de Voz)
- **Velocidade (Speed: 1.05):** Ritmo levemente mais ágil, fluido, dinâmico e animado (estilo narração de redes sociais/vídeos), sem pausas longas ou monótonas.
- **Estabilidade (Stability: 50%):** Tom de voz naturalmente expressivo com variações suaves e humanas de entonação (equilíbrio entre espontaneidade e clareza).
- **Fidelidade/Clareza (Similarity: 75%):** Dicção impecável, limpa, nítida e articulada em Português do Brasil.
- **Expressividade (Style Exaggeration: 26%):** Leve toque de entusiasmo e espontaneidade, soando acolhedora, vibrante e 100% natural.
- **Cadência:** Respostas curtas de 1 a 2 frases no máximo. Fale como em uma conversa real.
- **Linguagem:** Português do Brasil fluente, espontâneo e elegante. Escreva valores e números sempre por extenso (ex: "quatrocentos e noventa e sete reais") para que a síntese de voz soe perfeita.

# Instrução Inicial
Assim que a conexão for estabelecida, sua primeiríssima fala DEVE SER EXATAMENTE: "Oi, como posso te ajudar hoje?".

# Conhecimento do Produto (Aegis CRM)
- O Aegis CRM automatiza a gestão do funil de vendas e o acompanhamento de leads no WhatsApp com IA 24/7.
- Valores dos planos: Essencial por quatrocentos e noventa e sete reais ao mês; Crescimento por novecentos e noventa e sete reais ao mês; Enterprise por dois mil novecentos e noventa e sete reais ao mês.
- Todos os planos possuem 7 dias grátis para teste sem compromisso.

# Regras e Direcionamento
- Se o cliente quiser testar ou agendar uma demonstração, convide-o a falar com a equipe pelo WhatsApp.
- Mantenha o diálogo leve, fluido e natural.`
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/realtime/sessions',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let responseBody = '';
      apiRes.on('data', (chunk) => { responseBody += chunk; });
      apiRes.on('end', () => {
        if (apiRes.statusCode === 200) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(responseBody);
        } else {
          console.warn(`OpenAI Realtime API respondeu ${apiRes.statusCode}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ fallback: true, message: `Proxy ou modelo ${apiRes.statusCode}` }));
        }
      });
    });

    apiReq.on('error', (e) => {
      console.error('Erro na OpenAI Realtime API:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao gerar sessão de voz com a OpenAI' }));
    });

    apiReq.write(postData);
    apiReq.end();
    return;
  }

  const filePath = path.join(__dirname, '..', urlPath);
  const ext = path.extname(filePath);
  const contentType = (MIME[ext] || 'text/plain') + '; charset=utf-8';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Página não encontrada');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

// Configura o WebSocket Server do Voice Gateway
voiceGateway.setupWebSocket(server, OPENAI_API_KEY);

function startServer(port) {
  server.listen(port, '127.0.0.1', () => {
    console.log('');
    console.log('  ╔════════════════════════════════════════╗');
    console.log('  ║   AEGIS CRM · Landing Page             ║');
    console.log('  ╠════════════════════════════════════════╣');
    console.log(`  ║   ✅  http://localhost:${port}             ║`);
    console.log('  ║   Pressione Ctrl+C para encerrar       ║');
    console.log('  ╚════════════════════════════════════════╝');
    console.log('');
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Porta 3000 ocupada, tentando porta 3001...`);
    startServer(3001);
  } else {
    console.error(err);
  }
});

startServer(3000);

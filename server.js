const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Read environment variables securely from .env
try {
  const envPath = path.join(__dirname, '.env');
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
} catch (e) { }

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
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const urlPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;

  if (urlPath.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 - Acesso Negado');
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
Assim que a conexão for estabelecida, sua primeiríssima fala DEVE SER EXATAMENTE: "Oiiie, como posso te ajudar hoje?".

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

  const filePath = path.join(__dirname, urlPath);
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

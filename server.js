const http = require('http');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  
  if (urlPath.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 - Acesso Negado');
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
    res.writeHead(200, { 'Content-Type': contentType });
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

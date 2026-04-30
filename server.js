/**
 * Entry point para Hostinger Node.js Apps.
 *
 * Sempre executa `next build` em produção antes de iniciar o servidor.
 * Isso garante que o .next no diretório live seja sempre fresh, evitando
 * o problema de chunks com hashes velhos (404 nos assets estáticos).
 */

const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const { parse } = require('node:url');
const { spawnSync } = require('node:child_process');

const isProd = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

// Sempre rebuildar em produção. Sem esse guard o Hostinger pode servir
// um .next de deploy anterior (chunks com hashes velhos) enquanto o HTML
// já referencia os hashes novos, causando 404 nos assets estáticos.
if (isProd) {
  console.log('[server.js] Produção: executando next build --webpack...');
  const built = spawnSync(process.execPath, [nextBin, 'build', '--webpack'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env,
  });
  if (built.status !== 0) {
    console.error(`[server.js] next build falhou (code=${built.status}). Abortando.`);
    process.exit(built.status || 1);
  }
}

const next = require('next');
const app = next({ dev: !isProd, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url || '/', true);
      handle(req, res, parsedUrl);
    }).listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`[server.js] pronto em http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('[server.js] falha ao preparar Next:', err);
    process.exit(1);
  });

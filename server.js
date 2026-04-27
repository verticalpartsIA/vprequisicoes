/**
 * Entry point para Hostinger Node.js Apps.
 *
 * Comportamento:
 * 1. Se .next/BUILD_ID não existir, executa `next build` antes de iniciar.
 *    Isso garante o boot em provedores que rodam apenas `npm install` +
 *    o entry file, sem disparar Build Command (caso da Hostinger Node.js
 *    Apps quando "Comando de construção" fica vazio ou não é honrado).
 * 2. Em seguida, inicia o servidor Next em modo produção via API
 *    programática (`next.prepare()` + `getRequestHandler()`), equivalente
 *    a `next start`.
 */

const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');
const { parse } = require('node:url');
const { spawnSync } = require('node:child_process');

const isProd = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';

const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

if (isProd && !fs.existsSync(buildIdPath)) {
  console.log('[server.js] .next/BUILD_ID ausente. Executando `next build`...');
  const built = spawnSync(process.execPath, [nextBin, 'build'], {
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

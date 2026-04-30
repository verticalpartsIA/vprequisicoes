/**
 * Entry point para Hostinger Node.js Apps.
 *
 * O Hostinger roda o build command (`npm run build`) antes de iniciar este
 * arquivo. O guard de BUILD_ID abaixo é um fallback para ambientes sem
 * build command configurado — se .next/BUILD_ID não existir, builda aqui.
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

// Fallback: builda apenas se o build command do Hostinger não rodou.
// Com "Comando de construção: npm run build" configurado no painel,
// BUILD_ID já existe aqui e o servidor inicia imediatamente.
if (isProd && !fs.existsSync(buildIdPath)) {
  console.log('[server.js] .next/BUILD_ID ausente. Executando next build como fallback...');
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
// dir: __dirname garante que o Next.js encontre .next/ relativo ao server.js,
// independente do diretório de trabalho do processo no Hostinger.
const app = next({ dev: !isProd, hostname, port, dir: __dirname });
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

/**
 * Entry point para Hostinger Node.js Apps.
 *
 * A Hostinger exige que o arquivo de entrada tenha extensão .js — o binário
 * `node_modules/next/dist/bin/next` não tem extensão (shebang puro), por isso
 * o painel rejeita. Este arquivo wrapper inicia o Next em modo produção
 * (`next start`) lendo a porta da env PORT.
 *
 * Configuração esperada no painel da Hostinger:
 *   - Comando de construção: npm run build
 *   - Diretório de saída:    (vazio)
 *   - Arquivo de entrada:    server.js
 *   - Versão Node:           20.x ou superior
 */

const next = require('next');
const http = require('node:http');

const port = parseInt(process.env.PORT || '3000', 10);
const dev  = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    http.createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`[vprequisicoes] pronto em http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('[vprequisicoes] falha ao iniciar Next:', err);
    process.exit(1);
  });

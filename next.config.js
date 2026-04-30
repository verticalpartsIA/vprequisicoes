/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone só faz sentido para Docker. No Hostinger usamos `node server.js`
  // (next start programático), que é incompatível com output:'standalone'.
  // Para builds Docker locais, ative via env: NEXT_OUTPUT_STANDALONE=1
  ...(process.env.NEXT_OUTPUT_STANDALONE === '1' ? { output: 'standalone' } : {}),

  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      // Chunks e assets estáticos com hash no nome → cache longo (imutáveis)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // HTML de páginas e rotas de API → nunca cachear
      // Garante que o browser sempre baixe o HTML mais recente após novo deploy,
      // evitando que chunks antigos sejam referenciados (causa do __next_error__).
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

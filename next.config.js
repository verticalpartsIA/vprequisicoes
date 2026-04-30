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
      // Todas as rotas: no-cache por padrão.
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Assets estáticos com hash: sobrescreve o padrão acima com cache longo.
      // Deve ficar por último para ter prioridade sobre /:path* neste path.
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

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
      // Páginas HTML — nunca cachear.
      // Padrão exclui _next/ para não conflitar com assets estáticos.
      // Causa do __next_error__: browser usava HTML antigo com chunk-hashes velhos.
      {
        source: '/((?!_next).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Chunks e assets com hash de conteúdo → imutáveis (Next.js default em prod).
      // Deve vir DEPOIS para sobrescrever o padrão acima caso haja sobreposição.
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

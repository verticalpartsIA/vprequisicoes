/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone só faz sentido para Docker. No Hostinger usamos `node server.js`
  // (next start programático), que é incompatível com output:'standalone'.
  // Para builds Docker locais, ative via env: NEXT_OUTPUT_STANDALONE=1
  ...(process.env.NEXT_OUTPUT_STANDALONE === '1' ? { output: 'standalone' } : {}),

  typescript: {
    ignoreBuildErrors: true,  // ✅ Mantém build mesmo com avisos de tipos
  },
  // O ESLint deve ser configurado via .eslintrc.json ou npx next lint
};

module.exports = nextConfig;

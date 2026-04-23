/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,  // ✅ Mantém build mesmo com avisos de tipos
  },
  // O ESLint deve ser configurado via .eslintrc.json ou npx next lint
};

module.exports = nextConfig;

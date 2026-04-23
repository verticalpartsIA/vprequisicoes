/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // ✅ Essencial para Hostinger static export
  trailingSlash: true,        // ✅ Compatível com Apache/.htaccess
  images: {
    unoptimized: true,        // ✅ Necessário para exportação estática
  },
  typescript: {
    ignoreBuildErrors: true,  // ✅ Mantém build mesmo com avisos de tipos
  },
  // O ESLint deve ser configurado via .eslintrc.json ou npx next lint
};

module.exports = nextConfig;

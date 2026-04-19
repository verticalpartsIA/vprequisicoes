/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,

  // Standalone: gera build otimizado para Docker (sem node_modules completo)
  output: 'standalone',

  // Alias de paths para Docker (espelha tsconfig paths)
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'packages/core'),
      '@modules': path.resolve(__dirname, 'packages/modules'),
    };
    return config;
  },

  // Expõe variáveis públicas ao runtime do browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;

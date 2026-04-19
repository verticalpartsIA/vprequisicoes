/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone: build otimizado para Docker
  output: 'standalone',

  // Turbopack (padrão no Next.js 16) — aliases já resolvidos pelo tsconfig.json
  turbopack: {},

  // Variáveis públicas expostas ao browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;

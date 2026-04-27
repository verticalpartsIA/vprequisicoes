/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone: opt-in via env (apenas para builds Docker locais).
  // No deploy Hostinger usamos `node server.js` que faz `next start` —
  // neste caso, deixar standalone desligado para evitar warnings.
  ...(process.env.NEXT_OUTPUT_STANDALONE === '1' ? { output: 'standalone' } : {}),

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
